import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    // Cookie'den session'ı oku
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')
    
    if (!sessionCookie?.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // JWT token'ı verify et
    const payload = verifyToken(sessionCookie.value)
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Kullanıcıyı ve rollerini getir
    const user = await prisma.user.findUnique({
      where: { id: payload.uid },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Admin yetkisi kontrolü
    const isAdmin = user.roles.some(r => 
      ['admin', 'owner', 'moderator'].includes(r.role.name.toLowerCase())
    )

    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { purchaseId } = await request.json()

    if (!purchaseId) {
      return NextResponse.json({ error: 'Missing purchaseId' }, { status: 400 })
    }

    // Satın alma isteğini getir
    const purchaseRequest = await prisma.purchaseRequest.findUnique({
      where: { id: parseInt(purchaseId) },
      include: {
        user: true,
        publication: true
      }
    })

    if (!purchaseRequest) {
      return NextResponse.json({ error: 'Purchase request not found' }, { status: 404 })
    }

    if (purchaseRequest.status !== 'pending') {
      return NextResponse.json({ error: 'Purchase request is not pending' }, { status: 400 })
    }

    // Transaction ile işlemleri yap
    const result = await prisma.$transaction(async (tx) => {
      // Satın alma isteğini onayla
      const updatedRequest = await tx.purchaseRequest.update({
        where: { id: parseInt(purchaseId) },
        data: { status: 'approved' }
      })

      // Dijital erişim token'ı oluştur (1 yıl geçerli)
      const expiresAt = new Date()
      expiresAt.setFullYear(expiresAt.getFullYear() + 1)

      const digitalToken = await tx.digitalAccessToken.create({
        data: {
          userId: purchaseRequest.userId,
          publicationId: purchaseRequest.publicationId,
          token: `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          accessType: 'full',
          expiresAt,
          isActive: true
        }
      })

      // PublicationAccess kaydı oluştur
      const publicationAccess = await tx.publicationAccess.create({
        data: {
          userId: purchaseRequest.userId,
          publicationId: purchaseRequest.publicationId,
          accessType: 'read',
          expiresAt
        }
      })

      return { updatedRequest, digitalToken, publicationAccess }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error approving purchase:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 