import type { Trip, User, ChatMessage, Conversation } from "./types";

interface UserRecord extends User {
  password_hash: string;
}

// In-memory data store for users, trips, & conversations
let nextUserId = 1;
let nextTripId = 1;
let nextMessageId = 1;

const usersMap = new Map<number, UserRecord>();
const tripsMap = new Map<number, Trip>();
const conversationsMap = new Map<string, Conversation>();

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

    const user3: UserRecord = {
      id: nextUserId++,
      name: "Andre Syarief",
      email: "andresyarief7@gmail.com",
      password_hash: simpleHash("password123"),
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    };
    usersMap.set(user3.id, user3);

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

    // Initial trip for Andre Syarief
    const trip3: Trip = {
      id: nextTripId++,
      user_id: user3.id,
      destination: "Swiss Alps & Interlaken",
      days: 6,
      budget: 3500,
      category: "Luxury",
      daily_budget: 583,
      travel_style: "adventure",
      ai_recommendation: `## Day 1: Arrival in Interlaken & Lake Brienz Cruise
- Arrive at Interlaken Ost station with Swiss Travel Pass.
- Check-in to alpine chalet overlooking the Jungfrau massif.
- Afternoon boat cruise across turquoise Lake Brienz to Giessbach Falls.

## Day 2: Jungfraujoch Top of Europe
- Early train via Lauterbrunnen and Kleine Scheidegg.
- Note: Swiss Travel Pass covers 100% up to Grindelwald/Wengen, with 25% discount to Jungfraujoch summit.
- Tour the Ice Palace and Sphinx Observatory.`,
      created_at: new Date().toISOString(),
    };
    tripsMap.set(trip3.id, trip3);

    // Seed Conversation 1: Kyoto Culture & Transport
    const conv1Messages: ChatMessage[] = [
      {
        id: `msg-${nextMessageId++}`,
        conversation_id: "conv-kyoto-01",
        role: "user",
        content: "Halo KelanaAI! Aku berencana keliling Kyoto selama 4 hari. Ada tips etika berkunjung ke kuil dan aturan lokal yang perlu aku ketahui?",
        created_at: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
      },
      {
        id: `msg-${nextMessageId++}`,
        conversation_id: "conv-kyoto-01",
        role: "assistant",
        content: `Halo! Senang bisa mendampingi petualanganmu ke Kyoto. Berdasarkan basis pengetahuan resmi kami, berikut beberapa aturan krusial yang wajib diperhatikan:

1. **Aturan Fotografi Gion**: Dilarang keras mengambil foto di gang privat (*shido*) di distrik Gion tanpa izin. Pelanggaran dikenakan denda hingga **¥10.000** yang diawasi kamera dan warga lokal.
2. **Kuil Lumut Saiho-ji (Kokedera)**: Wajib reservasi minimal 2 minggu sebelumnya, dan pengunjung wajib mengikuti ritual meditasi salin sutra (*Shakyo*) sebelum memasuki taman lumut.
3. **Tiket Transportasi**: Untuk transportasi harian, lebih disarankan memakai kartu **IC (ICOCA / Suica)** untuk fleksibilitas bus & kereta Keihan, karena tiket bus harian 1-hari sudah dihapus untuk mengurai kepadatan bus kota.

Apakah kamu ingin rekomendasi rute untuk hari pertama?`,
        created_at: new Date(Date.now() - 3600 * 1000 * 3.9).toISOString(),
      },
      {
        id: `msg-${nextMessageId++}`,
        conversation_id: "conv-kyoto-01",
        role: "user",
        content: "Wah terima kasih! Sangat informatif. Kalau untuk hari pertama di area Higashiyama, rute mana yang paling optimal?",
        created_at: new Date(Date.now() - 3600 * 1000 * 3.5).toISOString(),
      },
      {
        id: `msg-${nextMessageId++}`,
        conversation_id: "conv-kyoto-01",
        role: "assistant",
        content: `Untuk hari pertama di **Higashiyama Selatan & Tengah**, berikut urutan rute yang paling efisien:

- **Pagi (08:00 - 10:30)**: Awali lebih awal di **Kiyomizu-dera** sebelum rombongan bus wisata tiba. Nikmati pemandangan panggung kayu megah menghadap kota.
- **Menjelang Siang (10:30 - 12:30)**: Susuri jalan berbatu antik **Sannenzaka & Ninenzaka**. Jangan lupa mampir ke kedai teh tradisional untuk mencoba matcha warabimochi.
- **Siang (12:30 - 14:30)**: Makan siang mie soba khas Kyoto di dekat Maruyama Park, dilanjutkan mengunjungi kuil **Kodai-ji** dengan taman zen yang tenang.
- **Sore & Malam (16:30 - 19:30)**: Berjalan santai ke **Yasaka Shrine**, lanjut menyusuri jalan utama Hanamikoji (ingat aturan denda foto di gang privat), dan tutup dengan santap malam di tepi kanal **Pontocho**.

Bagaimana menurutmu? Mau ditambahkan destinasi kuliner spesifik untuk makan malamnya?`,
        created_at: new Date(Date.now() - 3600 * 1000 * 3.4).toISOString(),
      },
    ];

    const conv1: Conversation = {
      id: "conv-kyoto-01",
      user_id: user3.id,
      title: "Eksplorasi Budaya & Kereta Kyoto",
      created_at: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
      updated_at: new Date(Date.now() - 3600 * 1000 * 3.4).toISOString(),
      messages: conv1Messages,
      last_message: "Bagaimana menurutmu? Mau ditambahkan destinasi kuliner spesifik untuk makan malamnya?",
      message_count: 4,
    };
    conversationsMap.set(conv1.id, conv1);

    // Also copy for user1
    const conv1User1: Conversation = {
      ...conv1,
      id: "conv-kyoto-demo",
      user_id: user1.id,
    };
    conversationsMap.set(conv1User1.id, conv1User1);

    // Seed Conversation 2: Swiss Alps
    const conv2Messages: ChatMessage[] = [
      {
        id: `msg-${nextMessageId++}`,
        conversation_id: "conv-swiss-02",
        role: "user",
        content: "Berapa persen diskon kereta ke puncak Jungfraujoch jika memakai Swiss Travel Pass?",
        created_at: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
      },
      {
        id: `msg-${nextMessageId++}`,
        conversation_id: "conv-swiss-02",
        role: "assistant",
        content: `Pertanyaan tepat! Ini salah satu kesalahpahaman paling sering di kalangan traveler:

- **Swiss Travel Pass** menanggung perjalanan **gratis 100%** hanya sampai stasiun **Grindelwald** dan **Wengen**.
- Dari stasiun Kleine Scheidegg menuju puncak **Jungfraujoch (Top of Europe)** melalui kereta gerigi Jungfraubahn, Swiss Travel Pass **HANYA memberikan diskon 25%** (bukan 50% dan bukan gratis).
- Anda tetap perlu membeli tiket sambungan (biasanya sekitar CHF 150-180 return tergantung musim).

Pastikan memesan reservasi kursi jika bepergian saat puncak musim panas (Juli-Agustus)!`,
        created_at: new Date(Date.now() - 3600 * 1000 * 1.9).toISOString(),
      },
    ];

    const conv2: Conversation = {
      id: "conv-swiss-02",
      user_id: user3.id,
      title: "Cakupan Swiss Travel Pass ke Jungfraujoch",
      created_at: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
      updated_at: new Date(Date.now() - 3600 * 1000 * 1.9).toISOString(),
      messages: conv2Messages,
      last_message: "Pastikan memesan reservasi kursi jika bepergian saat puncak musim panas (Juli-Agustus)!",
      message_count: 2,
    };
    conversationsMap.set(conv2.id, conv2);
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

// --- CONVERSATION OPERATIONS ---

export function listConversationsFromDb(userId?: number): Conversation[] {
  const allConversations = Array.from(conversationsMap.values()).sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );

  if (userId !== undefined) {
    return allConversations.filter((c) => c.user_id === userId);
  }
  return allConversations;
}

export function getConversationFromDb(
  id: string,
  userId?: number
): Conversation | null {
  const conv = conversationsMap.get(id);
  if (!conv) return null;
  if (userId !== undefined && conv.user_id !== userId) {
    return null;
  }
  return conv;
}

export function createConversationInDb(data: {
  user_id: number;
  title?: string;
  initialMessage?: string;
}): Conversation {
  const convId = `conv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const messages: ChatMessage[] = [];
  if (data.initialMessage && data.initialMessage.trim()) {
    messages.push({
      id: `msg-${nextMessageId++}`,
      conversation_id: convId,
      role: "user",
      content: data.initialMessage.trim(),
      created_at: now,
    });
  }

  const newConv: Conversation = {
    id: convId,
    user_id: data.user_id,
    title: (data.title && data.title.trim()) || "Percakapan Baru",
    created_at: now,
    updated_at: now,
    messages,
    last_message: data.initialMessage || undefined,
    message_count: messages.length,
  };

  conversationsMap.set(newConv.id, newConv);
  return newConv;
}

export function addMessageToConversationInDb(
  conversationId: string,
  message: {
    role: "user" | "assistant" | "system";
    content: string;
    created_at?: string;
  }
): ChatMessage | null {
  const conv = conversationsMap.get(conversationId);
  if (!conv) return null;

  const now = message.created_at || new Date().toISOString();
  const newMsg: ChatMessage = {
    id: `msg-${nextMessageId++}`,
    conversation_id: conversationId,
    role: message.role,
    content: message.content,
    created_at: now,
  };

  conv.messages.push(newMsg);
  conv.updated_at = now;
  conv.last_message = message.content;
  conv.message_count = conv.messages.length;

  return newMsg;
}

export function updateConversationTitleInDb(
  id: string,
  title: string,
  userId?: number
): Conversation | null {
  const conv = conversationsMap.get(id);
  if (!conv) return null;
  if (userId !== undefined && conv.user_id !== userId) return null;

  conv.title = title.trim();
  conv.updated_at = new Date().toISOString();
  return conv;
}

export function deleteConversationFromDb(
  id: string,
  userId?: number
): boolean {
  const conv = conversationsMap.get(id);
  if (!conv) return false;
  if (userId !== undefined && conv.user_id !== userId) return false;

  return conversationsMap.delete(id);
}
