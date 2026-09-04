import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import {
  getConversationFromDb,
  addMessageToConversationInDb,
  updateConversationTitleInDb,
} from "@/lib/db";
import {
  generateChatResponse,
  generateSuggestedTitle,
} from "@/lib/chat_service";

export async function POST(
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

  try {
    const body = await request.json();
    const content = body.content ? String(body.content).trim() : "";

    if (!content) {
      return NextResponse.json(
        { detail: "Message content cannot be empty." },
        { status: 400 }
      );
    }

    // 1. Record user message in DB with timestamp
    const userMessage = addMessageToConversationInDb(id, {
      role: "user",
      content,
      created_at: new Date().toISOString(),
    });

    if (!userMessage) {
      return NextResponse.json(
        { detail: "Failed to persist user message." },
        { status: 500 }
      );
    }

    // 2. Pass conversational history from DB to the AI model
    // This demonstrates Conversational Memory for stateless LLMs
    const updatedConversation = getConversationFromDb(id, user.id);
    const history = updatedConversation ? updatedConversation.messages : [userMessage];

    // Generate response using conversational memory
    const aiResponseText = await generateChatResponse(history, content);

    // 3. Record assistant message in DB with timestamp
    const assistantMessage = addMessageToConversationInDb(id, {
      role: "assistant",
      content: aiResponseText,
      created_at: new Date().toISOString(),
    });

    // 4. Auto-update title if it's default
    if (
      conversation.title === "Percakapan Baru" ||
      conversation.title === "New Conversation"
    ) {
      const suggestedTitle = generateSuggestedTitle(content);
      updateConversationTitleInDb(id, suggestedTitle, user.id);
    }

    const finalConversation = getConversationFromDb(id, user.id);

    return NextResponse.json({
      user_message: userMessage,
      assistant_message: assistantMessage,
      conversation: finalConversation,
    });
  } catch (error) {
    return NextResponse.json(
      {
        detail:
          error instanceof Error
            ? error.message
            : "Error generating chat response.",
      },
      { status: 500 }
    );
  }
}
