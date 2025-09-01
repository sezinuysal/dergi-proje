import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    // Check if user is admin or moderator
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Yetkisiz erişim" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { roles: { include: { role: true } } },
    });

    const hasPermission = user?.roles.some(
      (userRole) =>
        ["admin", "moderator", "yönetici"].includes(userRole.role.name)
    );

    if (!hasPermission) {
      return NextResponse.json(
        { error: "Yetkiniz yetersiz" },
        { status: 403 }
      );
    }

    const { purchaseRequestId } = await req.json();

    if (!purchaseRequestId) {
      return NextResponse.json(
        { error: "Satın alma talebi ID'si gereklidir" },
        { status: 400 }
      );
    }

    // Get the purchase request
    const purchaseRequest = await prisma.purchaseRequest.findUnique({
      where: { id: purchaseRequestId },
      include: {
        user: true,
        publication: true,
      },
    });

    if (!purchaseRequest) {
      return NextResponse.json(
        { error: "Satın alma talebi bulunamadı" },
        { status: 404 }
      );
    }

    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update purchase status
      const updatedRequest = await tx.purchaseRequest.update({
        where: { id: purchaseRequestId },
        data: { status: "APPROVED", approvedById: session.user.id },
      });

      // Generate a unique token for digital access
      const token = `DIGI-${uuidv4()}`;
      
      // Create digital access token
      await tx.digitalAccessToken.create({
        data: {
          userId: purchaseRequest.userId,
          publicationId: purchaseRequest.publicationId,
          token: token,
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
          isActive: true,
        },
      });

      // Add to user's publications
      await tx.publicationAccess.create({
        data: {
          userId: purchaseRequest.userId,
          publicationId: purchaseRequest.publicationId,
          accessType: "DIGITAL",
          grantedAt: new Date(),
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        },
      });

      return { success: true, token };
    });

    return NextResponse.json({
      success: true,
      message: "Satın alma onaylandı ve dijital erişim sağlandı",
      token: result.token,
    });
  } catch (error) {
    console.error("Purchase approval error:", error);
    return NextResponse.json(
      { error: "İşlem sırasında bir hata oluştu" },
      { status: 500 }
    );
  }
}
