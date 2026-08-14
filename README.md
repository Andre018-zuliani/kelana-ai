# KelanaAI

KelanaAI adalah aplikasi perencana perjalanan berbasis AI. Repo ini berisi
langkah awal pengembangan: **Trip Summary Generator**, sebuah aplikasi
konsol Python yang menerima input perjalanan dari pengguna dan mencetak
ringkasannya dalam format yang rapi.

## Struktur Proyek

```
kelana-ai/
├── README.md
├── backend/
│   ├── main.py
│   └── services/
│       ├── __init__.py
│       └── trip_service.py
└── frontend/
    └── .gitkeep
```

Aplikasi menggunakan arsitektur berlapis (layered architecture):
- **`main.py`** — presentation layer, menangani input/output pengguna.
- **`services/trip_service.py`** — business logic layer, berisi aturan
  penentuan kategori perjalanan, musim, kalkulasi anggaran harian, dan
  rekomendasi tempat wisata.

## Cara Menjalankan

```bash
cd backend
python3 main.py
```

Anda akan diminta memasukkan:
- `destination` (String)
- `country` (String)
- `days` (Integer)
- `budget` (Float)
- `currency` (String)
- `travel_month` (String)

### Contoh Output

```
==================================
KelanaAI
==================================
Destination     : Japan
Days            : 5
Budget          : 1500 USD
Category        : Standard
Daily Budget    : 300 USD/Day
Travel Month    : December
Season          : Peak Season

Recommended Places
- Tokyo Tower
- Shibuya
- Mount Fuji
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
- [ ] Sesi 3: ...
