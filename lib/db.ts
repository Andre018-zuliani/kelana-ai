import type { Trip } from "./types";

// In-memory data store for trips (ephemeral per instance)
let currentId = 1;
const tripsMap = new Map<number, Trip>();

export function createTripInDb(data: {
  destination: string;
  days: number;
  budget: number;
  category: string;
  daily_budget: number;
  ai_recommendation?: string | null;
}): Trip {
  const trip: Trip = {
    id: currentId++,
    destination: data.destination,
    days: data.days,
    budget: data.budget,
    category: data.category,
    daily_budget: data.daily_budget,
    ai_recommendation: data.ai_recommendation ?? null,
    created_at: new Date().toISOString(),
  };

  tripsMap.set(trip.id, trip);
  return trip;
}

export function getTripFromDb(id: number): Trip | null {
  return tripsMap.get(id) ?? null;
}

export function listTripsFromDb(): Trip[] {
  return Array.from(tripsMap.values()).reverse();
}

export function updateTripInDb(
  id: number,
  updates: Partial<Trip>
): Trip | null {
  const existing = tripsMap.get(id);
  if (!existing) return null;

  const updated: Trip = {
    ...existing,
    ...updates,
  };

  tripsMap.set(id, updated);
  return updated;
}

export function deleteTripFromDb(id: number): boolean {
  return tripsMap.delete(id);
}
