import { NextRequest, NextResponse } from "next/server";
import { runRagComparison } from "@/lib/rag_service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, destination } = body;

    if (!question || typeof question !== "string" || question.trim().length === 0) {
      return NextResponse.json(
        { error: "Question parameter is required" },
        { status: 400 }
      );
    }

    const comparison = await runRagComparison(
      question.trim(),
      typeof destination === "string" ? destination.trim() : "General"
    );

    return NextResponse.json(comparison);
  } catch (error) {
    console.error("POST /api/v1/rag/compare error:", error);
    return NextResponse.json(
      { error: "Failed to execute RAG vs Base-Model comparison" },
      { status: 500 }
    );
  }
}
