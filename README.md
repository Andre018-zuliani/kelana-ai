# KelanaAI

KelanaAI adalah aplikasi perencana perjalanan berbasis AI. Repo ini berisi
langkah awal pengembangan: **Trip Summary Generator**, sebuah aplikasi
konsol Python yang menerima input perjalanan dari pengguna dan mencetak
ringkasannya dalam format yang rapi.

## Struktur Proyek

```
kelana-ai/
├── README.md
├── requirements.txt
├── .env.example
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models/
│   │   ├── __init__.py
│   │   └── trip.py
│   └── services/
│       ├── __init__.py
│       ├── trip_service.py
│       └── bedrock_service.py
└── frontend/                  (Next.js — App Router + TypeScript + Tailwind)
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx            (homepage: form -> API -> AI itinerary)
    │   └── globals.css
    ├── components/
    │   ├── Hero.tsx             (hero image destinasi)
    │   ├── TravelForm.tsx       (form responsif)
    │   ├── AIRecommendation.tsx (render Markdown AI jadi kartu itinerary)
    │   ├── ErrorBanner.tsx      (error handling + tombol retry)
    │   └── Footer.tsx
    ├── lib/
    │   ├── api.ts               (base URL backend)
    │   └── types.ts
    └── .env.local.example
```

Arsitektur berlapis (layered architecture):
- **`frontend/`** — UI layer (Next.js). Form, tampilan itinerary, interaksi
  pengguna. Tidak pernah memanggil Amazon Bedrock secara langsung — selalu
  lewat FastAPI.
- **`backend/main.py`** — web layer (REST API dengan FastAPI). Menerima
  HTTP request, validasi lewat Pydantic, dan mengembalikan JSON response.
- **`backend/database.py`** — persistence layer: koneksi PostgreSQL lewat
  SQLAlchemy.
- **`backend/models/trip.py`** — model ORM `Trip`, termasuk kolom
  `ai_recommendation`.
- **`backend/services/trip_service.py`** — business logic layer (aturan
  kategori, musim, kalkulasi anggaran harian).
- **`backend/services/bedrock_service.py`** — AI layer: rich prompt +
  panggilan Amazon Bedrock (Converse API).

## Instalasi & Setup (Backend)

1. Install PostgreSQL, buat database bernama `kelana_ai`.
2. Install dependensi:
   ```bash
   pip install -r requirements.txt
   ```
3. Salin `.env.example` menjadi `.env`, lalu isi:
   ```
   DATABASE_URL=postgresql+psycopg2://postgres:password@localhost:5432/kelana_ai
   AWS_BEARER_TOKEN_BEDROCK=<API key dari instruktur>
   AWS_REGION=ap-southeast-2
   MODEL_ID=amazon.nova-lite-v1:0
   ```
   File `.env` sudah di-gitignore — jangan pernah commit kredensial asli.
4. Jalankan:
   ```bash
   cd backend
   uvicorn main:app --reload
   ```
   Swagger UI: `http://localhost:8000/docs`

## Instalasi & Setup (Frontend)

```bash
cd frontend
npm install
npm run dev
```

Buka `http://localhost:3000`. Pastikan backend (`http://localhost:8000`)
sudah berjalan lebih dulu — form di homepage akan memanggil endpoint
`POST /api/v1/trips` lalu `POST /api/v1/trips/{id}/generate`.

Kalau backend Anda berjalan di URL selain `http://localhost:8000`, salin
`.env.local.example` menjadi `.env.local` dan sesuaikan `NEXT_PUBLIC_API_URL`.

### Fitur Homepage

- **Hero image** — foto destinasi besar di bagian atas halaman.
- **Form responsif** — 2 kolom di desktop, otomatis stack 1 kolom (vertikal) di layar mobile.
- **Loading state** — spinner & teks "Generating itinerary..." saat menunggu Amazon Bedrock (3-10 detik).
- **Rich AI display** — itinerary Markdown dari Bedrock dirender sebagai kartu per hari (bukan blok teks mentah), lengkap badge category & estimasi budget harian.
- **Error handling** — pesan ramah pengguna + tombol "Try Again" (tidak menampilkan stack trace teknis).
- **Footer** — copyright & tautan navigasi.

### Endpoints Backend

| Method | Path | Deskripsi |
|---|---|---|
| GET | `/` | Pesan sambutan |
| GET | `/health` | Health check |
| POST | `/api/v1/trips` | Buat trip baru (tersimpan ke PostgreSQL) |
| GET | `/api/v1/trips` | Daftar seluruh trip |
| GET | `/api/v1/trips/{id}` | Detail satu trip (404 jika tidak ada) |
| PUT | `/api/v1/trips/{id}` | Update budget trip; category & daily_budget dihitung ulang |
| DELETE | `/api/v1/trips/{id}` | Hapus trip (404 jika tidak ada) |
| POST | `/api/v1/trips/{id}/generate` | Generate itinerary AI (Amazon Bedrock) & simpan ke DB |
| GET | `/api/v1/recommendations` | Daftar rekomendasi tempat wisata |
| GET | `/api/v1/transportations` | Daftar pilihan moda transportasi |

### Aturan Bisnis

**Kategori perjalanan** (berdasarkan budget):
| Budget | Kategori |
|---|---|
| < 1000 | Backpacker |
| 1000 – 3000 | Standard |
| > 3000 | Luxury |

**Musim perjalanan** (berdasarkan bulan):
| Bulan | Musim |
|---|---|
| December | Peak Season |
| June | Holiday Season |
| Lainnya | Regular Season |

## Roadmap

- [x] Sesi 1: Trip Summary Generator (console app)
- [x] Sesi 2: Recommendation Engine (layered architecture)
- [x] Sesi 3: REST API dengan FastAPI
- [x] Sesi 4: Persistence Layer (PostgreSQL + SQLAlchemy, full CRUD)
- [x] Sesi 5: AI Integration (Amazon Bedrock, rich prompt engineering)
- [x] Sesi 6: Next.js Frontend (homepage, responsive, hero image, footer)
- [ ] Sesi 7: ...
