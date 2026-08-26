"""
KelanaAI - REST API
Sesi 4: Teaching KelanaAI to Remember (Persistence Layer)

Web layer (presentation layer) KelanaAI. Modul ini HANYA menangani:
- Penerimaan HTTP request
- Validasi data lewat Pydantic model
- Pemberian HTTP/JSON response

Sejak Sesi 4, setiap trip disimpan secara permanen ke PostgreSQL lewat
SQLAlchemy (database.py + models/trip.py). Seluruh logika bisnis (aturan
kategori, kalkulasi anggaran harian, dsb.) tetap berada di
services/trip_service.py dan digunakan kembali di sini tanpa diubah
(separation of concerns).
"""

from typing import List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from database import SessionLocal, init_db
from models.trip import Trip
from services.bedrock_service import generate_trip_recommendation
from services.trip_service import (
    calculate_daily_budget,
    get_general_recommendations,
    get_trip_category,
    get_transportation_options,
)

app = FastAPI(title="KelanaAI API")

# Mengizinkan Next.js (berjalan di port 3000) memanggil API ini (port 8000).
# Frontend TIDAK PERNAH memanggil Amazon Bedrock secara langsung -- selalu
# lewat FastAPI ini.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Membuat seluruh tabel (kalau belum ada) saat aplikasi start
init_db()


class TripRequest(BaseModel):
    destination: str
    days: int
    budget: float
    # Opsional: dikirim oleh form Next.js untuk konteks tambahan, tidak
    # memengaruhi kalkulasi category/daily_budget yang sudah ada.
    travel_style: Optional[str] = None


class TripUpdateRequest(BaseModel):
    budget: float


@app.get("/")
def read_root():
    """Endpoint sambutan."""
    return {"message": "Welcome to KelanaAI"}


@app.get("/health")
def health_check():
    """Endpoint health check."""
    return {"status": "OK"}


@app.post("/api/v1/trips")
def create_trip(request: TripRequest):
    """
    Menerima detail perjalanan (destination, days, budget), menghitung
    anggaran harian & kategori (reuse dari services.trip_service), lalu
    menyimpannya secara permanen ke PostgreSQL.
    """
    daily_budget = calculate_daily_budget(request.budget, request.days)
    category = get_trip_category(request.budget)

    trip = Trip(
        destination=request.destination,
        days=request.days,
        budget=request.budget,
        category=category,
        daily_budget=daily_budget,
    )

    db = SessionLocal()
    db.add(trip)
    db.commit()
    db.refresh(trip)  # ambil id yang auto-generated
    db.close()

    return trip


@app.get("/api/v1/trips")
def list_trips():
    """Mengembalikan seluruh trip yang tersimpan di database."""
    db = SessionLocal()
    trips = db.query(Trip).all()
    db.close()

    return trips


@app.get("/api/v1/trips/{trip_id}")
def get_trip(trip_id: int):
    """Mengambil satu trip berdasarkan ID. 404 jika tidak ditemukan."""
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    db.close()

    if trip is None:
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")

    return trip


@app.put("/api/v1/trips/{trip_id}")
def update_trip(trip_id: int, request: TripUpdateRequest):
    """
    Memperbarui budget sebuah trip berdasarkan ID. Sebelum disimpan,
    category dan daily_budget dihitung ulang (reuse dari
    services.trip_service) berdasarkan budget yang baru.
    """
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id).first()

    if trip is None:
        db.close()
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")

    trip.budget = request.budget
    trip.daily_budget = calculate_daily_budget(request.budget, trip.days)
    trip.category = get_trip_category(request.budget)

    db.commit()
    db.refresh(trip)
    db.close()

    return trip


@app.delete("/api/v1/trips/{trip_id}")
def delete_trip(trip_id: int):
    """Menghapus sebuah trip berdasarkan ID. 404 jika tidak ditemukan."""
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id).first()

    if trip is None:
        db.close()
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")

    db.delete(trip)
    db.commit()
    db.close()

    return {"message": f"Trip with id {trip_id} has been deleted"}


@app.post("/api/v1/trips/{trip_id}/generate")
def generate_ai_recommendation(trip_id: int):
    """
    Menghasilkan itinerary AI (via Amazon Bedrock) untuk trip yang sudah
    ada, lalu menyimpan hasilnya ke kolom ai_recommendation di PostgreSQL.
    404 jika trip tidak ditemukan.
    """
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id).first()

    if trip is None:
        db.close()
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")

    recommendation = generate_trip_recommendation(
        destination=trip.destination,
        days=trip.days,
        budget=trip.budget,
        category=trip.category,
    )

    trip.ai_recommendation = recommendation
    db.commit()
    db.refresh(trip)
    db.close()

    return {
        "trip_id": trip.id,
        "destination": trip.destination,
        "recommendation": recommendation,
    }


@app.get("/api/v1/recommendations", response_model=List[str])
def get_recommendations():
    """Mengembalikan daftar rekomendasi tempat wisata (Python List -> JSON array)."""
    return get_general_recommendations()


@app.get("/api/v1/transportations", response_model=List[str])
def get_transportations():
    """Mengembalikan daftar pilihan moda transportasi (Python List -> JSON array)."""
    return get_transportation_options()
