import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import {
  listConversationsFromDb,
  createConversationInDb,
} from "@/lib/db";
import { generateSuggestedTitle } from "@/lib/chat_service";

export async function GET(request: Request) {
  const user = getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json(
      { detail: "Not authenticated. Please log in." },
      { status: 401 }
    );
  }

  const conversations = listConversationsFromDb(user.id);
  return NextResponse.json(conversations);
}

export async function POST(request: Request) {
  const user = getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json(
      { detail: "Not authenticated. Please log in." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const initialMessage = body.message ? String(body.message).trim() : undefined;
    let title = body.title ? String(body.title).trim() : undefined;

    if (!title && initialMessage) {
      title = generateSuggestedTitle(initialMessage);
    }

    const conversation = createConversationInDb({
      user_id: user.id,
      title: title || "Percakapan Baru",
      initialMessage,
    });

    return NextResponse.json(conversation, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        detail:
          error instanceof Error
            ? error.message
            : "Failed to create conversation.",
      },
      { status: 500 }
    );
  }
}
