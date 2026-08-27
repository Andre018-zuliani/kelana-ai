import { NextResponse } from "next/server";
import {
  calculateDailyBudget,
  getTripCategory,
} from "@/lib/trip_service";
import {
  getTripFromDb,
  updateTripInDb,
  deleteTripFromDb,
} from "@/lib/db";

export async function GET(
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

  return NextResponse.json(trip);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const tripId = Number(id);
  const existing = getTripFromDb(tripId);

  if (!existing) {
    return NextResponse.json(
      { detail: `Trip with id ${id} not found` },
      { status: 404 }
    );
  }

  try {
    const body = await request.json();
    const budget = Number(body.budget) || existing.budget;
    const daily_budget = calculateDailyBudget(budget, existing.days);
    const category = getTripCategory(budget);

    const updated = updateTripInDb(tripId, {
      budget,
      daily_budget,
      category,
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(

      { error: "Failed to update trip" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const tripId = Number(id);
  const success = deleteTripFromDb(tripId);

  if (!success) {
    return NextResponse.json(
      { detail: `Trip with id ${id} not found` },
      { status: 404 }
    );
  }

  return NextResponse.json({
    message: `Trip with id ${id} has been deleted`,
  });
}
