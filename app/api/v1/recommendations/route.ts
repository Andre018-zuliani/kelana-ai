import { NextResponse } from "next/server";
import { getGeneralRecommendations } from "@/lib/trip_service";

export async function GET() {
  return NextResponse.json(getGeneralRecommendations());
}
