import { Pool } from "pg";
import type { Trip, User, ChatMessage, Conversation } from "./types";

// PostgreSQL connection pool (works on Vercel via Neon / Vercel Postgres,
// and locally via the DATABASE_URL in .env). Schema is created on startup
// so nothing extra needs to be provisioned on Vercel.
const DATABASE_URL =
  process.env.DATABASE_URL ||
  (process.env.NODE_ENV === "production"
    ? (() => {
        throw new Error("DATABASE_URL must be set in production");
      })()
    : "postgresql://postgres:123@localhost:5432/kelana_ai");

const isLocal =
  !process.env.VERCEL &&
  (DATABASE_URL.includes("localhost") || DATABASE_URL.includes("127.0.0.1"));

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: isLocal
    ? false
    : { rejectUnauthorized: false },
});

interface UserRecord extends User {
  password_hash: string;
}

let initialized = false;

async function ensureInitialized(): Promise<void> {
  if (initialized) return;

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS trips (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      destination TEXT NOT NULL,
      days INTEGER NOT NULL,
      budget FLOAT NOT NULL,
      category TEXT NOT NULL,
      daily_budget FLOAT NOT NULL,
      travel_style TEXT DEFAULT 'standard',
      ai_recommendation TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await seedIfEmpty();
  initialized = true;
}

// Simple hash helper for demo purposes (same as previous in-memory version)
function simpleHash(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `hash_${Math.abs(hash)}_${password.length}`;
}

async function seedIfEmpty(): Promise<void> {
  const daysAgo = (d: number) =>
    new Date(Date.now() - d * 24 * 60 * 60 * 1000).toISOString();
  const hoursAgo = (h: number) =>
    new Date(Date.now() - h * 3600 * 1000).toISOString();

  const { rows: userRows } = await pool.query(
    "SELECT id FROM users ORDER BY id ASC LIMIT 4"
  );
  const userIds: number[] = userRows.map((r) => r.id as number);

  if (userIds.length === 0) {
    // --- Users ---
    const users: Array<{ name: string; email: string }> = [
      { name: "Demo Traveler", email: "demo@kelana.ai" },
      { name: "Jane Explorer", email: "jane@kelana.ai" },
      { name: "Andre Syarief", email: "andresyarief7@gmail.com" },
    ];

    for (const u of users) {
      const { rows } = await pool.query(
        `INSERT INTO users (name, email, password_hash, created_at)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [u.name, u.email, simpleHash("password123"), daysAgo(3)]
      );
      userIds.push(rows[0].id as number);
    }
  }

  const [demoUserId, janeUserId, andreUserId] = userIds;

  const { rows: tripRows } = await pool.query("SELECT id FROM trips LIMIT 1");
  if (tripRows.length === 0) {
    // --- Trips ---
    const demoTrip = {
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
- Savor authentic Kyoto-style Kaiseki dinner by the Kamogawa River.`,
      created_at: daysAgo(2),
    };

    const janeTrip = {
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
      created_at: daysAgo(1),
    };

    const andreTrip = {
      destination: "Swiss Alps & Interlaken",
      days: 6,
      budget: 3500,
      category: "Luxury",
      daily_budget: 583,
      travel_style: "adventure",
      ai_recommendation: `## Day 1: Arrival in Interlaken & Lake Brienz Cruise
- Arrive at Interlaken Ost station with Swiss Travel Pass.
- Check-in to alpine chalet overlooking the Jungfrau massif.
- Afternoon boat cruise across turquoise Lake Brienz to Giessbach Falls.`,
      created_at: daysAgo(0),
    };

    const tripRowsSeed = [
      { ...demoTrip, user_id: demoUserId },
      { ...janeTrip, user_id: janeUserId },
      { ...andreTrip, user_id: andreUserId },
    ];

    for (const t of tripRowsSeed) {
      await pool.query(
        `INSERT INTO trips
           (user_id, destination, days, budget, category, daily_budget, travel_style, ai_recommendation, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [
          t.user_id,
          t.destination,
          t.days,
          t.budget,
          t.category,
          t.daily_budget,
          t.travel_style,
          t.ai_recommendation,
          t.created_at,
        ]
      );
    }
  }

  const { rows: convRows } = await pool.query(
    "SELECT id FROM conversations LIMIT 1"
  );
  if (convRows.length === 0) {
    // --- Conversations (Andre) ---
    const convKyotoMessages = [
      {
        role: "user",
        content:
          "Halo KelanaAI! Aku berencana keliling Kyoto selama 4 hari. Ada tips etika berkunjung ke kuil dan aturan lokal yang perlu aku ketahui?",
        created_at: hoursAgo(4),
      },
      {
        role: "assistant",
        content: `Halo! Senang bisa mendampingi petualanganmu ke Kyoto. Berdasarkan basis pengetahuan resmi kami, berikut beberapa aturan krusial yang wajib diperhatikan:

1. **Aturan Fotografi Gion**: Dilarang keras mengambil foto di gang privat (*shido*) di distrik Gion tanpa izin. Pelanggaran dikenakan denda hingga **¥10.000** yang diawasi kamera dan warga lokal.
2. **Kuil Lumut Saiho-ji (Kokedera)**: Wajib reservasi minimal 2 minggu sebelumnya, dan pengunjung wajib mengikuti ritual meditasi salin sutra (*Shakyo*) sebelum memasuki taman lumut.
3. **Tiket Transportasi**: Untuk transportasi harian, lebih disarankan memakai kartu **IC (ICOCA / Suica)** untuk fleksibilitas bus & kereta Keihan, karena tiket bus harian 1-hari sudah dihapus untuk mengurai kepadatan bus kota.

Apakah kamu ingin rekomendasi rute untuk hari pertama?`,
        created_at: hoursAgo(3.9),
      },
      {
        role: "user",
        content: "Wah terima kasih! Sangat informatif. Kalau untuk hari pertama di area Higashiyama, rute mana yang paling optimal?",
        created_at: hoursAgo(3.5),
      },
      {
        role: "assistant",
        content: `Untuk hari pertama di **Higashiyama Selatan & Tengah**, berikut urutan rute yang paling efisien:

- **Pagi (08:00 - 10:30)**: Awali lebih awal di **Kiyomizu-dera** sebelum rombongan bus wisata tiba. Nikmati pemandangan panggung kayu megah menghadap kota.
- **Menjelang Siang (10:30 - 12:30)**: Susuri jalan berbatu antik **Sannenzaka & Ninenzaka**. Jangan lupa mampir ke kedai teh tradisional untuk mencoba matcha warabimochi.
- **Siang (12:30 - 14:30)**: Makan siang mie soba khas Kyoto di dekat Maruyama Park, dilanjutkan mengunjungi kuil **Kodai-ji** dengan taman zen yang tenang.
- **Sore & Malam (16:30 - 19:30)**: Berjalan santai ke **Yasaka Shrine**, lanjut menyusuri jalan utama Hanamikoji (ingat aturan denda foto di gang privat), dan tutup dengan santap malam di tepi kanal **Pontocho**.

Bagaimana menurutmu? Mau ditambahkan destinasi kuliner spesifik untuk makan malamnya?`,
        created_at: hoursAgo(3.4),
      },
    ];

    await pool.query(
      `INSERT INTO conversations (id, user_id, title, created_at, updated_at)
       VALUES ('conv-kyoto-01', $1, 'Eksplorasi Budaya & Kereta Kyoto', $2, $3)`,
      [andreUserId, hoursAgo(4), hoursAgo(3.4)]
    );
    for (const m of convKyotoMessages) {
      await pool.query(
        `INSERT INTO messages (conversation_id, role, content, created_at)
         VALUES ('conv-kyoto-01', $1, $2, $3)`,
        [m.role, m.content, m.created_at]
      );
    }

    await pool.query(
      `INSERT INTO conversations (id, user_id, title, created_at, updated_at)
       VALUES ('conv-swiss-02', $1, 'Cakupan Swiss Travel Pass ke Jungfraujoch', $2, $3)`,
      [andreUserId, hoursAgo(2), hoursAgo(1.9)]
    );
    const convSwissMessages = [
      {
        role: "user",
        content: "Berapa persen diskon kereta ke puncak Jungfraujoch jika memakai Swiss Travel Pass?",
        created_at: hoursAgo(2),
      },
      {
        role: "assistant",
        content: `Pertanyaan tepat! Ini salah satu kesalahpahaman paling sering di kalangan traveler:

- **Swiss Travel Pass** menanggung perjalanan **gratis 100%** hanya sampai stasiun **Grindelwald** dan **Wengen**.
- Dari stasiun Kleine Scheidegg menuju puncak **Jungfraujoch (Top of Europe)** melalui kereta gerigi Jungfraubahn, Swiss Travel Pass **HANYA memberikan diskon 25%** (bukan 50% dan bukan gratis).
- Anda tetap perlu membeli tiket sambungan (biasanya sekitar CHF 150-180 return tergantung musim).

Pastikan memesan reservasi kursi jika bepergian saat puncak musim panas (Juli-Agustus)!`,
        created_at: hoursAgo(1.9),
      },
    ];
    for (const m of convSwissMessages) {
      await pool.query(
        `INSERT INTO messages (conversation_id, role, content, created_at)
         VALUES ('conv-swiss-02', $1, $2, $3)`,
        [m.role, m.content, m.created_at]
      );
    }

    // Demo conversation for Demo Traveler (user 1)
    await pool.query(
      `INSERT INTO conversations (id, user_id, title, created_at, updated_at)
       VALUES ('conv-kyoto-demo', $1, 'Eksplorasi Budaya & Kereta Kyoto', $2, $3)`,
      [demoUserId, hoursAgo(4), hoursAgo(3.4)]
    );
    for (const m of convKyotoMessages) {
      await pool.query(
        `INSERT INTO messages (conversation_id, role, content, created_at)
         VALUES ('conv-kyoto-demo', $1, $2, $3)`,
        [m.role, m.content, m.created_at]
      );
    }
  }
}

function toISOString(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

function mapUserRow(row: UserRecord): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    created_at: toISOString(row.created_at),
  };
}

function mapTripRow(row: any): Trip {
  return {
    id: row.id,
    user_id: row.user_id,
    destination: row.destination,
    days: row.days,
    budget: Number(row.budget),
    category: row.category,
    daily_budget: Number(row.daily_budget),
    travel_style: row.travel_style,
    ai_recommendation: row.ai_recommendation ?? null,
    created_at: toISOString(row.created_at),
  };
}

function mapMessageRow(row: any): ChatMessage {
  return {
    id: `msg-${row.id}`,
    conversation_id: row.conversation_id,
    role: row.role as ChatMessage["role"],
    content: row.content,
    created_at: toISOString(row.created_at),
  };
}

async function mapConversationWithMessages(
  row: any
): Promise<Conversation> {
  const { rows: messageRows } = await pool.query(
    `SELECT id, conversation_id, role, content, created_at
     FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC, id ASC`,
    [row.id]
  );
  const messages = messageRows.map(mapMessageRow);
  const createdAt = toISOString(row.created_at);
  const updatedAt = toISOString(row.updated_at);

  return {
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    created_at: createdAt,
    updated_at: updatedAt,
    messages,
    last_message: messages[messages.length - 1]?.content,
    message_count: messages.length,
  };
}

// --- USER OPERATIONS ---

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  await ensureInitialized();
  const normalized = email.trim().toLowerCase();
  const { rows } = await pool.query(
    `SELECT id, name, email, password_hash, created_at FROM users WHERE LOWER(email) = $1`,
    [normalized]
  );
  return rows.length > 0 ? (rows[0] as UserRecord) : null;
}

export async function findUserById(id: number): Promise<UserRecord | null> {
  await ensureInitialized();
  const { rows } = await pool.query(
    `SELECT id, name, email, password_hash, created_at FROM users WHERE id = $1`,
    [id]
  );
  return rows.length > 0 ? (rows[0] as UserRecord) : null;
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
}): Promise<User> {
  await ensureInitialized();
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, created_at`,
    [data.name.trim(), data.email.trim().toLowerCase(), simpleHash(data.password)]
  );
  return mapUserRow(rows[0] as UserRecord);
}

export async function verifyUserCredentials(
  email: string,
  password: string
): Promise<User | null> {
  await ensureInitialized();
  const user = await findUserByEmail(email);
  if (!user) return null;
  if (user.password_hash === simpleHash(password)) {
    return mapUserRow(user);
  }
  return null;
}

// --- TRIP OPERATIONS ---

export async function createTripInDb(data: {
  user_id: number;
  destination: string;
  days: number;
  budget: number;
  category: string;
  daily_budget: number;
  travel_style?: string;
  ai_recommendation?: string | null;
}): Promise<Trip> {
  await ensureInitialized();
  const { rows } = await pool.query(
    `INSERT INTO trips
       (user_id, destination, days, budget, category, daily_budget, travel_style, ai_recommendation)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING *`,
    [
      data.user_id,
      data.destination,
      data.days,
      data.budget,
      data.category,
      data.daily_budget,
      data.travel_style || "standard",
      data.ai_recommendation ?? null,
    ]
  );
  return mapTripRow(rows[0]);
}

export async function getTripFromDb(id: number): Promise<Trip | null> {
  await ensureInitialized();
  const { rows } = await pool.query(`SELECT * FROM trips WHERE id = $1`, [id]);
  return rows.length > 0 ? mapTripRow(rows[0]) : null;
}

export async function listTripsFromDb(userId?: number): Promise<Trip[]> {
  await ensureInitialized();
  const { rows } = userId
    ? await pool.query(
        `SELECT * FROM trips WHERE user_id = $1 ORDER BY created_at DESC, id DESC`,
        [userId]
      )
    : await pool.query(`SELECT * FROM trips ORDER BY created_at DESC, id DESC`);
  return rows.map(mapTripRow);
}

export async function updateTripInDb(
  id: number,
  updates: Partial<Trip>
): Promise<Trip | null> {
  await ensureInitialized();
  const existing = await getTripFromDb(id);
  if (!existing) return null;

  const merged: Trip = { ...existing, ...updates };
  const { rows } = await pool.query(
    `UPDATE trips SET
       destination = $1,
       days = $2,
       budget = $3,
       category = $4,
       daily_budget = $5,
       travel_style = $6,
       ai_recommendation = $7
     WHERE id = $8
     RETURNING *`,
    [
      merged.destination,
      merged.days,
      merged.budget,
      merged.category,
      merged.daily_budget,
      merged.travel_style || "standard",
      merged.ai_recommendation ?? null,
      id,
    ]
  );
  return rows.length > 0 ? mapTripRow(rows[0]) : null;
}

export async function deleteTripFromDb(id: number): Promise<boolean> {
  await ensureInitialized();
  const { rowCount } = await pool.query(`DELETE FROM trips WHERE id = $1`, [id]);
  return (rowCount ?? 0) > 0;
}

// --- CONVERSATION OPERATIONS ---

export async function listConversationsFromDb(
  userId?: number
): Promise<Conversation[]> {
  await ensureInitialized();
  const { rows } = userId
    ? await pool.query(
        `SELECT c.*, m.content AS last_message_content
         FROM conversations c
         LEFT JOIN LATERAL (
           SELECT content FROM messages
           WHERE conversation_id = c.id
           ORDER BY created_at DESC, id DESC LIMIT 1
         ) m ON true
         WHERE c.user_id = $1
         ORDER BY c.updated_at DESC, c.created_at DESC`,
        [userId]
      )
    : await pool.query(
        `SELECT c.*, m.content AS last_message_content
         FROM conversations c
         LEFT JOIN LATERAL (
           SELECT content FROM messages
           WHERE conversation_id = c.id
           ORDER BY created_at DESC, id DESC LIMIT 1
         ) m ON true
         ORDER BY c.updated_at DESC, c.created_at DESC`
      );

  return Promise.all(rows.map(mapConversationWithMessages));
}

export async function getConversationFromDb(
  id: string,
  userId?: number
): Promise<Conversation | null> {
  await ensureInitialized();
  const { rows } = userId
    ? await pool.query(
        `SELECT * FROM conversations WHERE id = $1 AND user_id = $2`,
        [id, userId]
      )
    : await pool.query(`SELECT * FROM conversations WHERE id = $1`, [id]);

  if (rows.length === 0) return null;
  return mapConversationWithMessages(rows[0]);
}

export async function createConversationInDb(data: {
  user_id: number;
  title?: string;
  initialMessage?: string;
}): Promise<Conversation> {
  await ensureInitialized();
  const convId = `conv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date();

  await pool.query(
    `INSERT INTO conversations (id, user_id, title, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [convId, data.user_id, (data.title && data.title.trim()) || "Percakapan Baru", now, now]
  );

  if (data.initialMessage && data.initialMessage.trim()) {
    await addMessageToConversationInDb(convId, {
      role: "user",
      content: data.initialMessage.trim(),
      created_at: now.toISOString(),
    });
  }

  return (await getConversationFromDb(convId)) as Conversation;
}

export async function addMessageToConversationInDb(
  conversationId: string,
  message: {
    role: "user" | "assistant" | "system";
    content: string;
    created_at?: string;
  }
): Promise<ChatMessage | null> {
  await ensureInitialized();
  const now = message.created_at || new Date().toISOString();

  const { rows } = await pool.query(
    `INSERT INTO messages (conversation_id, role, content, created_at)
     VALUES ($1, $2, $3, $4)
     RETURNING id, conversation_id, role, content, created_at`,
    [conversationId, message.role, message.content, now]
  );

  await pool.query(
    `UPDATE conversations SET updated_at = $2 WHERE id = $1`,
    [conversationId, now]
  );

  return mapMessageRow(rows[0]);
}

export async function updateConversationTitleInDb(
  id: string,
  title: string,
  userId?: number
): Promise<Conversation | null> {
  await ensureInitialized();
  const { rows } = await pool.query(
    `UPDATE conversations SET title = $1, updated_at = NOW()
     WHERE id = $2 ${userId !== undefined ? "AND user_id = $3" : ""}
     RETURNING *`,
    userId !== undefined ? [title.trim(), id, userId] : [title.trim(), id]
  );
  if (rows.length === 0) return null;
  return mapConversationWithMessages(rows[0]);
}

export async function deleteConversationFromDb(
  id: string,
  userId?: number
): Promise<boolean> {
  await ensureInitialized();
  const { rowCount } = await pool.query(
    `DELETE FROM conversations WHERE id = $1 ${userId !== undefined ? "AND user_id = $2" : ""}`,
    userId !== undefined ? [id, userId] : [id]
  );
  return (rowCount ?? 0) > 0;
}