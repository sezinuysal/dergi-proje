import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    // Check if user is admin
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Yetkisiz erişim" },
        { status: 401 }
      );
    }

    // Verify admin role
    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { roles: { include: { role: true } } },
    });

    const isAdmin = adminUser?.roles.some(
      (userRole) =>
        userRole.role.name === "admin" || userRole.role.name === "yönetici"
    );

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Yetkiniz yetersiz" },
        { status: 403 }
      );
    }

    const { userId, roleName } = await req.json();

    if (!userId || !roleName) {
      return NextResponse.json(
        { error: "Kullanıcı ID ve rol adı gereklidir" },
        { status: 400 }
      );
    }

    // Find the role
    const role = await prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!role) {
      return NextResponse.json(
        { error: "Rol bulunamadı" },
        { status: 404 }
      );
    }

    // Check if user already has this role
    const existingRole = await prisma.userRole.findFirst({
      where: {
        userId,
        roleId: role.id,
      },
    });

    if (existingRole) {
      return NextResponse.json(
        { error: "Kullanıcı zaten bu role sahip" },
        { status: 400 }
      );
    }

    // Assign the role
    await prisma.userRole.create({
      data: {
        userId,
        roleId: role.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: `${roleName} rolü başarıyla atandı`,
    });
  } catch (error) {
    console.error("Role assignment error:", error);
    return NextResponse.json(
      { error: "Rol atanırken bir hata oluştu" },
      { status: 500 }
    );
  }
}
