"use client";

import { FormEvent, useState } from "react";
import type { TripFormValues } from "@/lib/types";

interface TravelFormProps {
  onSubmit: (values: TripFormValues) => void;
  loading: boolean;
}

/**
 * Form perjalanan: destination, budget, days, travel_style.
 *
 * Responsive layout: di mobile (default) field disusun 1 kolom / stack
 * vertikal. Mulai breakpoint `sm:` field disusun 2 kolom berdampingan
 * (grid-cols-2), jadi lebih rapi di layar besar tanpa memotong konten.
 */
export default function TravelForm({ onSubmit, loading }: TravelFormProps) {
  const [destination, setDestination] = useState("Japan");
  const [budget, setBudget] = useState(2000);
  const [days, setDays] = useState(5);
  const [travelStyle, setTravelStyle] = useState("Family");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit({ destination, budget, days, travel_style: travelStyle });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl bg-white p-5 shadow-lg ring-1 ring-slate-900/5 sm:p-8"
    >
      <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">
        Plan your next adventure
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Isi detail perjalanan Anda, biarkan AI yang menyusun itinerary-nya.
      </p>

      {/* 1 kolom di mobile, 2 kolom mulai layar sm ke atas */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="destination"
            className="text-xs font-medium uppercase tracking-wide text-slate-500"
          >
            Destination
          </label>
          <input
            id="destination"
            name="destination"
            type="text"
            required
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Japan"
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="budget"
            className="text-xs font-medium uppercase tracking-wide text-slate-500"
          >
            Budget (USD)
          </label>
          <input
            id="budget"
            name="budget"
            type="number"
            min={0}
            required
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            placeholder="2000"
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="days"
            className="text-xs font-medium uppercase tracking-wide text-slate-500"
          >
            Days
          </label>
          <input
            id="days"
            name="days"
            type="number"
            min={1}
            required
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            placeholder="5"
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="travel_style"
            className="text-xs font-medium uppercase tracking-wide text-slate-500"
          >
            Travel Style
          </label>
          <input
            id="travel_style"
            name="travel_style"
            type="text"
            value={travelStyle}
            onChange={(e) => setTravelStyle(e.target.value)}
            placeholder="Family"
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-3 font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {loading && (
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
            aria-hidden="true"
          />
        )}
        {loading ? "Generating itinerary..." : "Generate AI Trip"}
      </button>
    </form>
  );
}
