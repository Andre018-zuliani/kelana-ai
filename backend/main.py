"""
KelanaAI - Trip Summary & Recommendation Engine
Sesi 2: Presentation Layer (Console App)

Modul ini menangani interaksi pengguna (I/O):
- Menerima input perjalanan dari pengguna
- Memanggil logika bisnis dari services.trip_service
- Menampilkan ringkasan & rekomendasi perjalanan menggunakan f-strings
"""

from services.trip_service import (
    get_trip_category,
    get_travel_season,
    calculate_daily_budget,
    get_recommended_places,
)


def get_trip_input():
    """Mengambil input perjalanan dari pengguna dan mengonversi tipe datanya."""
    destination = input("Masukkan destinasi: ")
    country = input("Masukkan negara: ")
    days = int(input("Masukkan jumlah hari: "))
    budget = float(input("Masukkan budget: "))
    currency = input("Masukkan mata uang (contoh: USD): ")
    travel_month = input("Masukkan bulan perjalanan: ")

    return destination, country, days, budget, currency, travel_month


def print_trip_summary(destination, country, days, budget, currency, travel_month):
    """Mencetak ringkasan perjalanan lengkap dengan kategori, budget harian, musim, dan rekomendasi tempat."""
    category = get_trip_category(budget)
    season = get_travel_season(travel_month)
    daily_budget = calculate_daily_budget(budget, days)
    places = get_recommended_places(destination)

    print("\n==================================")
    print("KelanaAI")
    print("==================================")
    print(f"Destination     : {destination}")
    print(f"Days            : {days}")
    print(f"Budget          : {budget:.0f} {currency}")
    print(f"Category        : {category}")
    print(f"Daily Budget    : {daily_budget:.0f} {currency}/Day")
    print(f"Travel Month    : {travel_month}")
    print(f"Season          : {season}")

    print("\nRecommended Places")
    for place in places:
        print(f"- {place}")
    print()


def main():
    destination, country, days, budget, currency, travel_month = get_trip_input()
    print_trip_summary(destination, country, days, budget, currency, travel_month)


if __name__ == "__main__":
    main()
