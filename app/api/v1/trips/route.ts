import { NextResponse } from "next/server";
import {
  calculateDailyBudget,
  getTripCategory,
} from "@/lib/trip_service";
import {
  createTripInDb,
  listTripsFromDb,
} from "@/lib/db";

export async function GET() {
  const trips = listTripsFromDb();
  return NextResponse.json(trips);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const destination = String(body.destination || "Destination");
    const days = Number(body.days) || 1;
    const budget = Number(body.budget) || 0;

    const daily_budget = calculateDailyBudget(budget, days);
    const category = getTripCategory(budget);

    const trip = createTripInDb({
      destination,
      days,
      budget,
      category,
      daily_budget,
    });

    return NextResponse.json(trip, { status: 200 });
  } catch {
    return NextResponse.json(

      { error: "Invalid request payload" },
      { status: 400 }
    );
  }
}
