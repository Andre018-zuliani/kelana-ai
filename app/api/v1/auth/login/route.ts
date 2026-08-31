import { NextResponse } from "next/server";
import { verifyUserCredentials } from "@/lib/db";
import { generateToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { detail: "Email and password are required." },
        { status: 400 }
      );
    }

    const user = verifyUserCredentials(email, password);
    if (!user) {
      return NextResponse.json(
        { detail: "Invalid email or password." },
        { status: 401 }
      );
    }

    const token = generateToken(user);

    return NextResponse.json({
      user,
      token,
      message: "Login successful",
    });
  } catch {
    return NextResponse.json(
      { detail: "An unexpected error occurred during login." },
      { status: 500 }
    );
  }
}
