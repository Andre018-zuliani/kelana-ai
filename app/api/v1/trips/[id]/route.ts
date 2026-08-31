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
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json(
      { detail: "Not authenticated" },
      { status: 401 }
    );
  }

  const { id } = await params;
  const tripId = Number(id);
  const trip = getTripFromDb(tripId);

  if (!trip) {
    return NextResponse.json(
      { detail: `Trip with id ${id} not found` },
      { status: 404 }
    );
  }

  // Security check: Only own trips allowed
  if (trip.user_id !== user.id) {
    return NextResponse.json(
      { detail: "Forbidden: You do not have permission to view this trip" },
      { status: 403 }
    );
  }

  return NextResponse.json(trip);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json(
      { detail: "Not authenticated" },
      { status: 401 }
    );
  }

  const { id } = await params;
  const tripId = Number(id);
  const existing = getTripFromDb(tripId);

  if (!existing) {
    return NextResponse.json(
      { detail: `Trip with id ${id} not found` },
      { status: 404 }
    );
  }

  // Checklist requirement: Update: Reject other users' trips (403 Forbidden)
  if (existing.user_id !== user.id) {
    return NextResponse.json(
      { detail: "Forbidden: You cannot modify another user's trip" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const budget = body.budget !== undefined ? Number(body.budget) : existing.budget;
    const days = body.days !== undefined ? Number(body.days) : existing.days;
    const destination = body.destination !== undefined ? String(body.destination) : existing.destination;
    const travel_style = body.travel_style !== undefined ? String(body.travel_style) : existing.travel_style;

    const daily_budget = calculateDailyBudget(budget, days);
    const category = getTripCategory(budget);

    const updated = updateTripInDb(tripId, {
      destination,
      days,
      budget,
      daily_budget,
      category,
      travel_style,
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { detail: "Failed to update trip" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json(
      { detail: "Not authenticated" },
      { status: 401 }
    );
  }

  const { id } = await params;
  const tripId = Number(id);
  const existing = getTripFromDb(tripId);

  if (!existing) {
    return NextResponse.json(
      { detail: `Trip with id ${id} not found` },
      { status: 404 }
    );
  }

  // Checklist requirement: Delete: Reject other users' trips (403 Forbidden)
  if (existing.user_id !== user.id) {
    return NextResponse.json(
      { detail: "Forbidden: You cannot delete another user's trip" },
      { status: 403 }
    );
  }

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
