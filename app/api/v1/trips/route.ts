import { NextResponse } from "next/server";
import {
  calculateDailyBudget,
  getTripCategory,
} from "@/lib/trip_service";
import {
  createTripInDb,
  listTripsFromDb,
} from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(request: Request) {
  const user = getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json(
      { detail: "Not authenticated. Please log in to view your trips." },
      { status: 401 }
    );
  }

  // View: Only own trips - filter by user.id
  const trips = listTripsFromDb(user.id);
  return NextResponse.json(trips);
}

export async function POST(request: Request) {
  const user = getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json(
      { detail: "Not authenticated. Please log in to create a trip." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const destination = String(body.destination || "Destination").trim();
    const days = Number(body.days) || 1;
    const budget = Number(body.budget) || 0;
    const travel_style = String(body.travel_style || "standard");

    const daily_budget = calculateDailyBudget(budget, days);
    const category = getTripCategory(budget);

    const trip = createTripInDb({
      user_id: user.id,
      destination,
      days,
      budget,
      category,
      daily_budget,
      travel_style,
    });

    return NextResponse.json(trip, { status: 201 });
  } catch {
    return NextResponse.json(
      { detail: "Invalid request payload" },
      { status: 400 }
    );
  }
}
