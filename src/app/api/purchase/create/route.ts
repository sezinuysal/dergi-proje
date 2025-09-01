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

    const { publicationId, paymentMethod, amount, notes } = await request.json()

    if (!publicationId) {
      return NextResponse.json({ error: 'Missing publicationId' }, { status: 400 })
    }

    // Kullanıcının bu dergiye zaten erişimi var mı kontrol et
    const existingAccess = await prisma.publicationAccess.findFirst({
      where: {
        userId: payload.uid,
        publicationId: parseInt(publicationId)
      }
    })

    if (existingAccess) {
      return NextResponse.json({ error: 'User already has access to this publication' }, { status: 400 })
    }

    // Bekleyen satın alma isteği var mı kontrol et
    const existingRequest = await prisma.purchaseRequest.findFirst({
      where: {
        userId: payload.uid,
        publicationId: parseInt(publicationId),
        status: 'pending'
      }
    })

    if (existingRequest) {
      return NextResponse.json({ error: 'Purchase request already exists' }, { status: 400 })
    }

    // Satın alma isteği oluştur
    const purchaseRequest = await prisma.purchaseRequest.create({
      data: {
        userId: payload.uid,
        publicationId: parseInt(publicationId),
        paymentMethod: paymentMethod || 'credit_card',
        amount: amount || 0,
        notes: notes || 'Satın alma isteği'
      }
    })

    return NextResponse.json(purchaseRequest)
  } catch (error) {
    console.error('Error creating purchase request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 