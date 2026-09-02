import { NextResponse } from "next/server";
import { BENCHMARK_QUESTIONS } from "@/lib/rag_service";

export async function GET() {
  try {
    const benchmarks = BENCHMARK_QUESTIONS.map((b) => ({
      id: b.id,
      destination: b.destination,
      question: b.question,
      key_facts_tested: b.key_facts_tested,
      base_weaknesses: b.base_weaknesses,
      base_sample: b.base_sample,
      rag_sample: b.rag_sample,
    }));

    return NextResponse.json({
      status: "success",
      total_benchmarks: benchmarks.length,
      benchmarks,
    });
  } catch (error) {
    console.error("GET /api/v1/rag/benchmarks error:", error);
    return NextResponse.json(
      { error: "Failed to fetch benchmarks" },
      { status: 500 }
    );
  }
}
