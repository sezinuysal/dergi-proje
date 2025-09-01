import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/session'

export async function GET(request: NextRequest) {
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

    // Tüm satın alma isteklerini getir
    const purchaseRequests = await prisma.purchaseRequest.findMany({
      include: {
        user: true,
        publication: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(purchaseRequests)
  } catch (error) {
    console.error('Error fetching purchase requests:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 