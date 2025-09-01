import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/session";

export async function GET(req: Request) {
  try {
    // Cookie'den session token'ı al
    const cookieHeader = req.headers.get('cookie');
    if (!cookieHeader) {
      return NextResponse.json({ error: "Oturum bulunamadı" }, { status: 401 });
    }

    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    const sessionToken = cookies.session;
    if (!sessionToken) {
      return NextResponse.json({ error: "Oturum bulunamadı" }, { status: 401 });
    }

    // Token'ı doğrula
    const payload = verifyToken(sessionToken);
    if (!payload) {
      return NextResponse.json({ error: "Geçersiz oturum" }, { status: 401 });
    }

    // Kullanıcı bilgilerini getir
    const user = await prisma.user.findUnique({
      where: { id: payload.uid },
      select: {
        id: true,
        name: true,
        email: true,
        roles: {
          include: {
            role: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
    }

    const roles = user.roles.map(r => r.role.name);

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      roles
    });
  } catch (error) {
    console.error("ME API Error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
} 