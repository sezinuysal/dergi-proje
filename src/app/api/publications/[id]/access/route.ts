import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/session";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const publicationId = parseInt(params.id);
    
    // Session cookie'den kullanıcı bilgisini al
    const cookieHeader = req.headers.get('cookie');
    if (!cookieHeader) {
      return NextResponse.json({ 
        error: "Oturum bulunamadı",
        access: false 
      }, { status: 401 });
    }

    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    const sessionToken = cookies.session;
    if (!sessionToken) {
      return NextResponse.json({ 
        error: "Oturum bulunamadı",
        access: false 
      }, { status: 401 });
    }

    // JWT token'ı doğrula
    const payload = verifyToken(sessionToken);
    if (!payload) {
      return NextResponse.json({ 
        error: "Geçersiz oturum",
        access: false 
      }, { status: 401 });
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
    });

    if (!user) {
      return NextResponse.json({ 
        error: "Kullanıcı bulunamadı",
        access: false 
      }, { status: 404 });
    }

    // Kullanıcının rollerini kontrol et
    const userRoles = user.roles.map(r => r.role.name);
    const hasAdminAccess = userRoles.includes('admin') || userRoles.includes('owner');

    // Yayını getir
    const publication = await prisma.publication.findUnique({
      where: { id: publicationId },
      include: {
        access: {
          where: { userId: user.id }
        },
        tokens: {
          where: { userId: user.id }
        }
      }
    });

    if (!publication) {
      return NextResponse.json({ 
        error: "Yayın bulunamadı",
        access: false 
      }, { status: 404 });
    }

    // Erişim kontrolü
    let hasAccess = false;
    let accessType = 'none';
    let token = null;

    // Admin/Owner ise tam erişim
    if (hasAdminAccess) {
      hasAccess = true;
      accessType = 'admin';
      
      // Admin için token oluştur veya mevcut olanı getir
      token = await prisma.accessToken.upsert({
        where: { 
          userId_publicationId: { 
            userId: user.id, 
            publicationId: publication.id 
          } 
        },
        update: {},
        create: {
          userId: user.id,
          publicationId: publication.id,
          token: `admin_${publication.id}_${Date.now()}`,
          permissions: JSON.stringify(["read", "download", "admin"]),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 saat
        }
      });
    } else {
      // Normal kullanıcı erişim kontrolü
      if (publication.access.length > 0) {
        hasAccess = true;
        accessType = publication.access[0].accessType;
      } else if (publication.isPublic) {
        hasAccess = true;
        accessType = 'public';
      }
    }

    return NextResponse.json({
      success: true,
      access: hasAccess,
      accessType,
      publication: {
        id: publication.id,
        title: publication.title,
        type: publication.type,
        fileKey: hasAccess ? publication.fileKey : null,
        token: token?.token || null
      },
      userRoles
    });

  } catch (error) {
    console.error("Publication Access API Error:", error);
    return NextResponse.json({
      success: false,
      error: "Sunucu hatası",
      access: false
    }, { status: 500 });
  }
} 