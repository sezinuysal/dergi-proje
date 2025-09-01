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

    // Kullanıcının aktif dijital token'larını getir
    const digitalTokens = await prisma.digitalAccessToken.findMany({
      where: {
        userId: payload.uid,
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      include: {
        publication: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(digitalTokens)
  } catch (error) {
    console.error('Error fetching digital tokens:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 