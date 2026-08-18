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
├── backend/
│   ├── main.py
│   └── services/
│       ├── __init__.py
│       └── trip_service.py
└── frontend/
    └── .gitkeep
```

Aplikasi menggunakan arsitektur berlapis (layered architecture):
- **`main.py`** — web layer (REST API dengan FastAPI). Menerima HTTP
  request, validasi lewat Pydantic, dan mengembalikan JSON response.
- **`services/trip_service.py`** — business logic layer, berisi aturan
  penentuan kategori perjalanan, musim, kalkulasi anggaran harian, dan
  rekomendasi tempat wisata. Tidak diubah sama sekali sejak Sesi 2 —
  di-reuse langsung oleh web layer (separation of concerns).

## Instalasi

```bash
pip install -r requirements.txt
```

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
| POST | `/api/v1/trips` | Hitung kategori & anggaran harian perjalanan |

### Contoh Request/Response

**POST** `/api/v1/trips`
```json
{
  "destination": "Japan",
  "days": 5,
  "budget": 2000
}
```

**Response (200 OK)**
```json
{
  "destination": "Japan",
  "days": 5,
  "budget": 2000,
  "daily_budget": 400.0,
  "category": "Standard"
}
```

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
- [ ] Sesi 4: ...
