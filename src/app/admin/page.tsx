import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AdminPanel from '@/components/AdminPanel'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/session'

export default async function AdminPage() {
  try {
    // Cookie'den session'ı oku
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')
    
    if (!sessionCookie?.value) {
      redirect('/auth/login')
    }

    // JWT token'ı verify et
    const payload = verifyToken(sessionCookie.value)
    if (!payload) {
      redirect('/auth/login')
    }

    // Kullanıcıyı rollerle birlikte getir
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
      redirect('/auth/login')
    }

    // Admin yetkisi kontrolü
    const isAdmin = user.roles.some(r => 
      ['admin', 'owner', 'moderator'].includes(r.role.name.toLowerCase())
    )

    if (!isAdmin) {
      redirect('/')
    }

    return <AdminPanel currentUser={user} />
  } catch (error) {
    console.error('Admin page error:', error)
    redirect('/auth/login')
  }
} 