import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const publications = await prisma.publication.findMany({
      where: {
        isPublic: true, // Sadece public yayınları getir
      },
      orderBy: {
        publishedAt: 'desc'
      },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        issue: true,
        pageCount: true,
        coverImage: true,
        publishedAt: true,
        createdAt: true,
      }
    });

    return NextResponse.json({
      success: true,
      publications
    });
  } catch (error) {
    console.error("Publications API Error:", error);
    return NextResponse.json({
      success: false,
      error: "Sunucu hatası"
    }, { status: 500 });
  }
} 