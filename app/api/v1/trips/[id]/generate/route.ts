import { NextResponse } from "next/server";
import { getTripFromDb, updateTripInDb } from "@/lib/db";
import { generateTripRecommendation } from "@/lib/ai_service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const tripId = Number(id);
  const trip = getTripFromDb(tripId);

  if (!trip) {
    return NextResponse.json(
      { detail: `Trip with id ${id} not found` },
      { status: 404 }
    );
  }

  try {
    const recommendation = await generateTripRecommendation(
      trip.destination,
      trip.days,
      trip.budget,
      trip.category
    );

    updateTripInDb(tripId, {
      ai_recommendation: recommendation,
    });

    return NextResponse.json({
      trip_id: trip.id,
      destination: trip.destination,
      recommendation,
    });
  } catch (error) {
    console.error("Error generating trip recommendation:", error);
    return NextResponse.json(
      { error: "Failed to generate AI recommendation." },
      { status: 500 }
    );
  }
}
