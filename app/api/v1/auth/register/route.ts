import { NextResponse } from "next/server";
import { createUser, findUserByEmail } from "@/lib/db";
import { generateToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { detail: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { detail: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const existing = findUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { detail: "An account with this email already exists." },
        { status: 400 }
      );
    }

    const user = createUser({ name, email, password });
    const token = generateToken(user);

    return NextResponse.json(
      {
        user,
        token,
        message: "Registration successful",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to register";
    return NextResponse.json(
      { detail: message },
      { status: 500 }
    );
  }
}
