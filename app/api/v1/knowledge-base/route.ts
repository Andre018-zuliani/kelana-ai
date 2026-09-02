import { NextResponse } from "next/server";
import { getKnowledgeDocuments, getAllChunks } from "@/lib/rag_service";

export async function GET() {
  try {
    const documents = getKnowledgeDocuments();
    const chunks = getAllChunks();

    return NextResponse.json({
      status: "success",
      s3_bucket: process.env.AWS_S3_BUCKET_NAME || "kelana-ai-knowledge-base-production",
      s3_prefix: "travel-docs/",
      total_documents: documents.length,
      total_chunks: chunks.length,
      last_synced: new Date().toISOString(),
      documents,
    });
  } catch (error) {
    console.error("GET /api/v1/knowledge-base error:", error);
    return NextResponse.json(
      { error: "Failed to fetch knowledge base documents" },
      { status: 500 }
    );
  }
}
