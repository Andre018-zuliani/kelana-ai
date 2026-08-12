"""
KelanaAI - Trip Summary Generator
Sesi 1: Console App (Backend)

Fitur:
- Menerima input interaktif dari pengguna (destinasi, negara, jumlah hari,
  budget, mata uang, dan bulan perjalanan).
- Menampilkan ringkasan perjalanan dalam format yang rapi menggunakan f-strings.
"""


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
    """Mencetak ringkasan perjalanan dengan format yang rapi dan terstruktur."""
    print("\n========================")
    print("KelanaAI")
    print("========================")
    print(f"Destination : {destination}")
    print(f"Country     : {country}")
    print(f"Days        : {days}")
    print(f"Budget      : {budget:.0f} {currency}")
    print(f"Currency    : {currency}")
    print(f"Travel Month: {travel_month}")
    print("========================\n")


def main():
    destination, country, days, budget, currency, travel_month = get_trip_input()
    print_trip_summary(destination, country, days, budget, currency, travel_month)


if __name__ == "__main__":
    main()
