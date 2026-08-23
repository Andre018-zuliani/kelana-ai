"""
KelanaAI - Trip Model
Sesi 4: Persistence Layer

Model SQLAlchemy untuk tabel `trips`. Satu class Python di sini
merepresentasikan satu tabel di PostgreSQL; setiap atribut menjadi kolom.
"""

from sqlalchemy import Column, DateTime, Float, Integer, String, Text
from sqlalchemy.sql import func

from database import Base


class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True)
    destination = Column(String, nullable=False)
    days = Column(Integer, nullable=False)
    budget = Column(Float, nullable=False)
    category = Column(String, nullable=False)
    daily_budget = Column(Float, nullable=False)

    # Sesi 5 — menyimpan hasil rekomendasi AI dari Amazon Bedrock.
    # nullable=True karena trip lama (sebelum Sesi 5) belum punya nilai ini.
    ai_recommendation = Column(Text, nullable=True)

    # Bonus: timestamp otomatis saat trip pertama kali dibuat
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
