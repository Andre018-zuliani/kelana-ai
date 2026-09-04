import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import {
  getConversationFromDb,
  updateConversationTitleInDb,
  deleteConversationFromDb,
} from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json(
      { detail: "Not authenticated. Please log in." },
      { status: 401 }
    );
  }

  const { id } = await params;
  const conversation = getConversationFromDb(id, user.id);

  if (!conversation) {
    return NextResponse.json(
      { detail: "Conversation not found or access denied." },
      { status: 404 }
    );
  }

  return NextResponse.json(conversation);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json(
      { detail: "Not authenticated. Please log in." },
      { status: 401 }
    );
  }

  const { id } = await params;
  try {
    const body = await request.json();
    if (!body.title || typeof body.title !== "string" || !body.title.trim()) {
      return NextResponse.json(
        { detail: "Title is required and must be a non-empty string." },
        { status: 400 }
      );
    }

    const updated = updateConversationTitleInDb(id, body.title.trim(), user.id);
    if (!updated) {
      return NextResponse.json(
        { detail: "Conversation not found or access denied." },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { detail: "Invalid request body." },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json(
      { detail: "Not authenticated. Please log in." },
      { status: 401 }
    );
  }

  const { id } = await params;
  const deleted = deleteConversationFromDb(id, user.id);

  if (!deleted) {
    return NextResponse.json(
      { detail: "Conversation not found or access denied." },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, message: "Conversation deleted." });
}
