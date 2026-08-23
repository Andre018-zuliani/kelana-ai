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
└── frontend/
    └── .gitkeep
```

Arsitektur berlapis (layered architecture):
- **`main.py`** — web layer (REST API dengan FastAPI). Menerima HTTP
  request, validasi lewat Pydantic, dan mengembalikan JSON response.
- **`database.py`** — persistence layer: koneksi PostgreSQL (engine,
  SessionLocal, Base) lewat SQLAlchemy.
- **`models/trip.py`** — model ORM `Trip`, dipetakan ke tabel `trips`,
  termasuk kolom `ai_recommendation` untuk menyimpan hasil generate AI.
- **`services/trip_service.py`** — business logic layer (aturan kategori,
  musim, kalkulasi anggaran harian, rekomendasi statis).
- **`services/bedrock_service.py`** — AI layer: membangun rich prompt dan
  memanggil Amazon Bedrock (Converse API) untuk menghasilkan itinerary
  personalisasi.

## Instalasi & Setup

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

## Cara Menjalankan (REST API)

```bash
cd backend
uvicorn main:app --reload
```

Buka dokumentasi interaktif Swagger UI di `http://localhost:8000/docs`.

### Endpoints

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

### Rich AI Prompt (Sesi 5)

`POST /api/v1/trips/{id}/generate` mengirim prompt terstruktur ke Amazon
Bedrock yang meminta rencana harian dengan format:

- **Morning** — 2-3 aktivitas pagi spesifik
- **Afternoon** — situs budaya + pengalaman lokal
- **Evening** — rekomendasi makan malam + hiburan malam

Ditambah ringkasan akhir (estimasi budget harian, rekomendasi kuliner,
saran transportasi, tips perjalanan), diformat dalam Markdown. Hasilnya
disimpan permanen di kolom `ai_recommendation` pada tabel `trips`.

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
- [ ] Sesi 6: ...
