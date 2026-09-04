import { NextResponse } from "next/server";
import { verifyUserCredentials, findUserByEmail, createUser } from "@/lib/db";
import { generateToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { detail: "Email dan password wajib diisi." },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPassword = String(password).trim();

    // 1. Check if user credentials match
    let user = verifyUserCredentials(cleanEmail, cleanPassword);

    if (!user) {
      const existingUser = findUserByEmail(cleanEmail);
      if (existingUser) {
        // User exists, but password didn't match
        return NextResponse.json(
          {
            detail: "Password tidak sesuai. Untuk akun demo gunakan password: password123",
          },
          { status: 401 }
        );
      }

      // 2. Seamless on-boarding: If email not registered yet, auto-create account
      const inferredName = cleanEmail
        .split("@")[0]
        .replace(/[._-]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());

      user = createUser({
        name: inferredName || "Traveler",
        email: cleanEmail,
        password: cleanPassword || "password123",
      });
    }

    const token = generateToken(user);

    return NextResponse.json({
      user,
      token,
      message: "Login berhasil",
    });
  } catch {
    return NextResponse.json(
      { detail: "Terjadi kesalahan pada server saat proses login." },
      { status: 500 }
    );
  }
}
