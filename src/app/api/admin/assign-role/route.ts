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

    const { userId, roleId } = await request.json()

    if (!userId || !roleId) {
      return NextResponse.json({ error: 'Missing userId or roleId' }, { status: 400 })
    }

    // Kullanıcının bu role'ü zaten var mı kontrol et
    const existingRole = await prisma.userRole.findFirst({
      where: {
        userId: parseInt(userId),
        roleId: parseInt(roleId)
      }
    })

    if (existingRole) {
      return NextResponse.json({ error: 'User already has this role' }, { status: 400 })
    }

    // Role'ü ata
    const userRole = await prisma.userRole.create({
      data: {
        userId: parseInt(userId),
        roleId: parseInt(roleId)
      },
      include: {
        role: true
      }
    })

    return NextResponse.json(userRole)
  } catch (error) {
    console.error('Error assigning role:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 