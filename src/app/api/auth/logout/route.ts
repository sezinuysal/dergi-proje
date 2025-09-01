import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json({ message: "Başarıyla çıkış yapıldı" });
    
    // Session cookie'yi temizle
    response.cookies.set("session", "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0, // Hemen sil
    });

    return response;
  } catch (error) {
    console.error("LOGOUT API Error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
} 