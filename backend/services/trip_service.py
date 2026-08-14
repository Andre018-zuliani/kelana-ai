"""
KelanaAI - Trip Service
Sesi 2: Recommendation Engine (Business Logic Layer)

Modul ini berisi seluruh logika bisnis KelanaAI:
- Penentuan kategori perjalanan berdasarkan budget
- Penentuan musim perjalanan berdasarkan bulan
- Kalkulasi anggaran harian
- Rekomendasi tempat wisata berdasarkan destinasi
"""

# Data rekomendasi tempat wisata per destinasi.
# Menggunakan tipe data list untuk menyimpan koleksi tempat.
PLACE_RECOMMENDATIONS = {
    "japan": ["Tokyo Tower", "Shibuya", "Mount Fuji"],
    "indonesia": ["Bali Beach", "Borobudur Temple", "Mount Bromo"],
    "france": ["Eiffel Tower", "Louvre Museum", "Palace of Versailles"],
    "thailand": ["Grand Palace", "Phi Phi Islands", "Chiang Mai Old City"],
}

DEFAULT_PLACES = ["City Center", "Local Market", "Popular Landmark"]


def get_trip_category(budget):
    """Menentukan kategori perjalanan berdasarkan besar anggaran (budget)."""
    if budget < 1000:
        return "Backpacker"
    elif budget <= 3000:
        return "Standard"
    else:
        return "Luxury"


def get_travel_season(month):
    """Menentukan musim perjalanan berdasarkan bulan (month)."""
    normalized_month = month.strip().lower()

    if normalized_month == "december":
        return "Peak Season"
    elif normalized_month == "june":
        return "Holiday Season"
    else:
        return "Regular Season"


def calculate_daily_budget(budget, days):
    """Menghitung anggaran harian dengan membagi budget dengan jumlah hari."""
    if days <= 0:
        return 0
    return budget / days


def get_recommended_places(destination):
    """
    Mengambil daftar rekomendasi tempat wisata untuk sebuah destinasi.
    Menggunakan list dan loop for untuk iterasi data rekomendasi.
    """
    key = destination.strip().lower()
    places = PLACE_RECOMMENDATIONS.get(key, DEFAULT_PLACES)

    recommended = []
    for place in places:
        recommended.append(place)

    return recommended
