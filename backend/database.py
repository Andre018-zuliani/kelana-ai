"""
KelanaAI - Database Connection
Sesi 4: Persistence Layer

Modul ini bertanggung jawab HANYA untuk koneksi database:
- engine: connection pool ke PostgreSQL
- SessionLocal: factory untuk membuat session per request
- Base: base class yang diwarisi oleh semua model SQLAlchemy
- init_db(): membuat seluruh tabel berdasarkan model yang terdaftar

DATABASE_URL diambil dari file .env (tidak pernah di-hardcode / di-commit).
"""

import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# load .env supaya os.getenv() bisa membacanya
load_dotenv()

# connection string dari .env, contoh:
# postgresql+psycopg2://postgres:password@localhost:5432/kelana_ai
DATABASE_URL = os.getenv("DATABASE_URL")

# engine = connection pool ke PostgreSQL
engine = create_engine(DATABASE_URL)

# SessionLocal = factory untuk membuat session baru (satu per request)
SessionLocal = sessionmaker(bind=engine, autoflush=False)

# Base = seluruh model ORM mewarisi class ini
Base = declarative_base()


def init_db() -> None:
    """Membuat seluruh tabel SQLAlchemy pada database yang dikonfigurasi."""
    Base.metadata.create_all(bind=engine)
