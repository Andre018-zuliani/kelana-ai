import type { Trip, User } from "./types";

interface UserRecord extends User {
  password_hash: string;
}

// In-memory data store for users & trips
let nextUserId = 1;
let nextTripId = 1;

const usersMap = new Map<number, UserRecord>();
const tripsMap = new Map<number, Trip>();

// Simple hash helper for demo purposes
function simpleHash(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `hash_${Math.abs(hash)}_${password.length}`;
}

// Seed initial users & trips if empty
function initSeedData() {
  if (usersMap.size === 0) {
    const user1: UserRecord = {
      id: nextUserId++,
      name: "Demo Traveler",
      email: "demo@kelana.ai",
      password_hash: simpleHash("password123"),
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
    usersMap.set(user1.id, user1);

    const user2: UserRecord = {
      id: nextUserId++,
      name: "Jane Explorer",
      email: "jane@kelana.ai",
      password_hash: simpleHash("password123"),
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    };
    usersMap.set(user2.id, user2);

    // Initial trips for User 1
    const trip1: Trip = {
      id: nextTripId++,
      user_id: user1.id,
      destination: "Kyoto, Japan",
      days: 5,
      budget: 2500,
      category: "Standard",
      daily_budget: 500,
      travel_style: "cultural",
      ai_recommendation: `## Day 1: Historic Higashiyama & Ancient Temples

Morning:
- Visit Kiyomizu-dera Temple early to beat the crowds and enjoy panoramic views of Kyoto.
- Wander through the historic stone-paved lanes of Ninenzaka and Sannenzaka.

Afternoon:
- Explore Kodai-ji Temple and its serene zen rock garden.
- Participate in a traditional green tea ceremony in Gion.

Evening:
- Stroll through Pontocho Alley to spot geiko and maiko.
- Savor authentic Kyoto-style Kaiseki dinner by the Kamogawa River.

## Day 2: Bamboo Groves & Golden Pavilions

Morning:
- Walk through the Arashiyama Bamboo Grove at sunrise.
- Visit Tenryu-ji Temple World Heritage garden.

Afternoon:
- Take the Sagano Romantic Train ride along the Hozugawa River.
- Tour Kinkaku-ji (The Golden Pavilion) reflecting in the mirror pond.

Evening:
- Dine on hot Yudofu (tofu hot pot) near central Kyoto Station.`,
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    };
    tripsMap.set(trip1.id, trip1);

    // Initial trip for User 2 (to verify user isolation)
    const trip2: Trip = {
      id: nextTripId++,
      user_id: user2.id,
      destination: "Paris, France",
      days: 4,
      budget: 3200,
      category: "Luxury",
      daily_budget: 800,
      travel_style: "luxury",
      ai_recommendation: `## Day 1: Parisian Elegance & Landmark Sights

Morning:
- Private guided tour of the Eiffel Tower summit.
- Breakfast croissant and cafe au lait at Cafe de Flore.

Afternoon:
- Private tour of Musée d'Orsay impressionist masterpieces.
- Stroll along the Seine River and explore the Tuileries Garden.

Evening:
- Michelin-starred dining experience in Saint-Germain.
- Evening illuminations cruise on the Seine.`,
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    };
    tripsMap.set(trip2.id, trip2);
  }
}

initSeedData();

// --- USER OPERATIONS ---

export function findUserByEmail(email: string): UserRecord | null {
  const normalized = email.trim().toLowerCase();
  for (const user of usersMap.values()) {
    if (user.email.toLowerCase() === normalized) {
      return user;
    }
  }
  return null;
}

export function findUserById(id: number): UserRecord | null {
  return usersMap.get(id) ?? null;
}

export function createUser(data: {
  name: string;
  email: string;
  password: string;
}): User {
  const existing = findUserByEmail(data.email);
  if (existing) {
    throw new Error("Email is already registered");
  }

  const user: UserRecord = {
    id: nextUserId++,
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    password_hash: simpleHash(data.password),
    created_at: new Date().toISOString(),
  };

  usersMap.set(user.id, user);

  // Return public user object (without password_hash)
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    created_at: user.created_at,
  };
}

export function verifyUserCredentials(
  email: string,
  password: string
): User | null {
  const user = findUserByEmail(email);
  if (!user) return null;

  if (user.password_hash === simpleHash(password)) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      created_at: user.created_at,
    };
  }

  return null;
}

// --- TRIP OPERATIONS ---

export function createTripInDb(data: {
  user_id: number;
  destination: string;
  days: number;
  budget: number;
  category: string;
  daily_budget: number;
  travel_style?: string;
  ai_recommendation?: string | null;
}): Trip {
  const trip: Trip = {
    id: nextTripId++,
    user_id: data.user_id,
    destination: data.destination,
    days: data.days,
    budget: data.budget,
    category: data.category,
    daily_budget: data.daily_budget,
    travel_style: data.travel_style || "standard",
    ai_recommendation: data.ai_recommendation ?? null,
    created_at: new Date().toISOString(),
  };

  tripsMap.set(trip.id, trip);
  return trip;
}

export function getTripFromDb(id: number): Trip | null {
  return tripsMap.get(id) ?? null;
}

/**
 * Lists trips. If userId is provided, filters ONLY trips belonging to that user.
 */
export function listTripsFromDb(userId?: number): Trip[] {
  const allTrips = Array.from(tripsMap.values()).reverse();
  if (userId !== undefined) {
    return allTrips.filter((t) => t.user_id === userId);
  }
  return allTrips;
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
    updated_at: new Date().toISOString(),
  };

  tripsMap.set(id, updated);
  return updated;
}

export function deleteTripFromDb(id: number): boolean {
  return tripsMap.delete(id);
}
