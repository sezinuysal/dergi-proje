import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Kullanıcı sayısını al
    const userCount = await prisma.user.count();
    
    // Rol sayısını al
    const roleCount = await prisma.role.count();
    
    // Son kullanıcıyı al
    const lastUser = await prisma.user.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, createdAt: true }
    });

    return NextResponse.json({
      success: true,
      message: "Veritabanı bağlantısı başarılı!",
      data: {
        userCount,
        roleCount,
        lastUser
      }
    });
  } catch (error) {
    console.error("Test API Error:", error);
    return NextResponse.json({
      success: false,
      message: "Veritabanı hatası",
      error: error instanceof Error ? error.message : "Bilinmeyen hata"
    }, { status: 500 });
  }
} 