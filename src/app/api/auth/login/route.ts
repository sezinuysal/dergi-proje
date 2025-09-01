export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs"; // bcrypt kullanıyorsan "bcrypt" de olur
import { signToken } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Eksik alan" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { roles: { include: { role: true } } },
    });
    if (!user) return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return NextResponse.json({ error: "Hatalı şifre" }, { status: 401 });

    const roles = user.roles.map(r => r.role.name);
    const token = signToken({ uid: user.id, roles });

    const res = NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      roles,
    });

    // HttpOnly session cookie
    res.cookies.set("session", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 gün
    });

    return res;
  } catch (e) {
    console.error("LOGIN ERR", e);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
