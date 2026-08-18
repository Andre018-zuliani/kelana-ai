"""
KelanaAI - REST API
Sesi 3: Teaching KelanaAI to Communicate (FastAPI)

Web layer (presentation layer) KelanaAI. Modul ini HANYA menangani:
- Penerimaan HTTP request
- Validasi data lewat Pydantic model
- Pemberian HTTP/JSON response

Seluruh logika bisnis (aturan kategori, kalkulasi anggaran harian, dsb.)
tetap berada di services/trip_service.py dan digunakan kembali di sini
tanpa diubah sedikit pun (separation of concerns).
"""

from typing import List

from fastapi import FastAPI
from pydantic import BaseModel

from services.trip_service import (
    calculate_daily_budget,
    get_trip_category,
    get_general_recommendations,
    get_transportation_options,
)

app = FastAPI(title="KelanaAI API")


class TripRequest(BaseModel):
    destination: str
    days: int
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
def create_trip(trip: TripRequest):
    """
    Menerima detail perjalanan (destination, days, budget), lalu
    menghitung anggaran harian dan kategori perjalanan menggunakan
    fungsi dari services.trip_service.
    """
    daily_budget = calculate_daily_budget(trip.budget, trip.days)
    category = get_trip_category(trip.budget)

    return {
        "destination": trip.destination,
        "days": trip.days,
        "budget": trip.budget,
        "daily_budget": daily_budget,
        "category": category,
    }


@app.get("/api/v1/recommendations", response_model=List[str])
def get_recommendations():
    """Mengembalikan daftar rekomendasi tempat wisata (Python List -> JSON array)."""
    return get_general_recommendations()


@app.get("/api/v1/transportations", response_model=List[str])
def get_transportations():
    """Mengembalikan daftar pilihan moda transportasi (Python List -> JSON array)."""
    return get_transportation_options()
