"use client";

import { useState } from "react";
import Hero from "@/components/Hero";
import TravelForm from "@/components/TravelForm";
import AIRecommendation from "@/components/AIRecommendation";
import ErrorBanner from "@/components/ErrorBanner";
import Footer from "@/components/Footer";
import { API_URL } from "@/lib/api";
import type { Trip, TripFormValues, GenerateResponse } from "@/lib/types";

export default function Home() {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastValues, setLastValues] = useState<TripFormValues | null>(null);

  async function generateTrip(values: TripFormValues) {
    setLoading(true);
    setError(null);
    setLastValues(values);

    try {
      // 1. Buat trip baru (Sesi 4 -- tersimpan ke PostgreSQL)
      const createRes = await fetch(`${API_URL}/api/v1/trips`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: values.destination,
          budget: values.budget,
          days: values.days,
          travel_style: values.travel_style,
        }),
      });

      if (!createRes.ok) {
        throw new Error("Failed to create trip.");
      }

      const createdTrip: Trip = await createRes.json();

      // 2. Minta AI (Amazon Bedrock, lewat FastAPI) membuat itinerary
      //    untuk trip yang baru dibuat.
      const generateRes = await fetch(
        `${API_URL}/api/v1/trips/${createdTrip.id}/generate`,
        { method: "POST" }
      );

      if (!generateRes.ok) {
        throw new Error("Failed to generate AI recommendation.");
      }

      const generated: GenerateResponse = await generateRes.json();

      setTrip({ ...createdTrip, ai_recommendation: generated.recommendation });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleRetry() {
    if (lastValues) {
      generateTrip(lastValues);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Hero />

      <main className="mx-auto -mt-10 w-full max-w-3xl flex-1 px-4 pb-16 sm:-mt-14 sm:px-6 lg:px-8">
        <TravelForm onSubmit={generateTrip} loading={loading} />

        <div className="mt-6">
          {error && <ErrorBanner message={error} onRetry={handleRetry} />}
          {!error && trip && <AIRecommendation trip={trip} />}
        </div>
      </main>

      <Footer />
    </div>
  );
}
