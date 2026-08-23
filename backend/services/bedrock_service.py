"""
KelanaAI - Bedrock Service
Sesi 5: Teaching KelanaAI to Think with AI (Amazon Bedrock Integration)

Modul ini bertanggung jawab untuk seluruh komunikasi dengan Amazon Bedrock:
- Membuat client bedrock-runtime (dibuat sekali di level modul, dipakai
  berulang untuk setiap request).
- Membangun prompt yang kaya (rich prompt) berdasarkan detail trip.
- Memanggil Converse API dan mengembalikan teks hasil generate AI.

Autentikasi memakai Amazon Bedrock API Key (AWS_BEARER_TOKEN_BEDROCK) yang
dibaca boto3 secara otomatis dari environment setelah load_dotenv() --
tidak perlu AWS CLI / IAM user untuk keperluan belajar/prototyping ini.
"""

import os

import boto3
from dotenv import load_dotenv

# load .env supaya os.getenv() bisa membacanya
load_dotenv()

# Client dibuat sekali di level modul, dipakai ulang untuk setiap request.
# boto3 otomatis membaca AWS_BEARER_TOKEN_BEDROCK dari environment.
client = boto3.client(
    service_name="bedrock-runtime",
    region_name=os.getenv("AWS_REGION"),
)


def build_trip_prompt(destination: str, days: int, budget: float, category: str) -> str:
    """
    Membangun rich prompt untuk Amazon Bedrock.

    Prompt ini menyertakan seluruh detail trip (destination, budget, days,
    travel style/category), dan secara spesifik meminta AI menghasilkan
    rencana harian terstruktur: Morning / Afternoon / Evening, lengkap
    dengan situs budaya, rekomendasi makan malam, dan hiburan malam.
    """
    return f"""You are an experienced local travel planner.

Create a detailed day-by-day itinerary for a {days}-day trip to {destination}.

Trip details:
- Destination: {destination}
- Number of days: {days}
- Total budget: USD {budget:.0f}
- Travel style / category: {category}

For EVERY single day, structure the plan into exactly three sections
using this format:

## Day X: <short theme for the day>

Morning:
- Give 2-3 specific morning activities (e.g. a landmark, a breakfast spot, a scenic walk).

Afternoon:
- Recommend at least one cultural site (museum, temple, historical landmark, etc.).
- Include one local experience or hands-on activity (workshop, market visit, tour, etc.).

Evening:
- Suggest a specific dinner spot or type of local cuisine to try.
- Suggest a nightlife or evening entertainment option suited to the destination.

After all the daily sections, add a final summary section with:
- Estimated daily budget breakdown (based on the total budget of USD {budget:.0f}).
- 2-3 local food recommendations worth trying overall.
- Transportation suggestions for getting around {destination}.
- General travel tips for visiting {destination}.

Format the entire response in Markdown: use "##" for each day's header and
"-" for bullet lists under Morning / Afternoon / Evening.
"""


def generate_trip_recommendation(destination: str, days: int, budget: float, category: str) -> str:
    """
    Mengirim rich prompt ke Amazon Bedrock lewat Converse API, lalu
    mengembalikan teks itinerary yang dihasilkan AI.
    """
    prompt = build_trip_prompt(destination, days, budget, category)

    response = client.converse(
        modelId=os.getenv("MODEL_ID"),
        messages=[
            {
                "role": "user",
                "content": [{"text": prompt}],
            }
        ],
    )

    ai_response = response["output"]["message"]["content"][0]["text"]
    return ai_response
