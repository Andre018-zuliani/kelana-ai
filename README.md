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
│   └── main.py
└── frontend/
    └── .gitkeep
```

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
========================
KelanaAI
========================
Destination : Japan
Country     : Japan
Days        : 5
Budget      : 1500 USD
Currency    : USD
Travel Month: December
========================
```

## Roadmap

- [x] Sesi 1: Trip Summary Generator (console app)
- [ ] Sesi 2: ...
