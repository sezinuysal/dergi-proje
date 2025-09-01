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

    // Kullanıcının satın alma isteklerini getir
    const purchaseRequests = await prisma.purchaseRequest.findMany({
      where: {
        userId: payload.uid
      },
      include: {
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