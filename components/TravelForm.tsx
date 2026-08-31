"use client";

import React, { useState } from "react";
import type { TripFormValues } from "@/lib/types";
import {
  MapPin,
  Calendar,
  DollarSign,
  Sparkles,
  Loader2,
  Sliders,
} from "lucide-react";

const TRAVEL_STYLES = [
  { id: "cultural", label: "🏛️ Cultural & Heritage" },
  { id: "adventure", label: "🏔️ Nature & Adventure" },
  { id: "relaxing", label: "🏖️ Beach & Relaxation" },
  { id: "foodie", label: "🍜 Culinary & Foodie" },
  { id: "luxury", label: "✨ Luxury & Comfort" },
  { id: "backpacker", label: "🎒 Budget Backpacker" },
];

const POPULAR_DESTINATIONS = [
  "Kyoto, Japan",
  "Bali, Indonesia",
  "Rome, Italy",
  "Bangkok, Thailand",
  "Paris, France",
  "Seoul, South Korea",
];

interface TravelFormProps {
  onSubmit: (values: TripFormValues) => void;
  loading: boolean;
}

export default function TravelForm({ onSubmit, loading }: TravelFormProps) {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState(1200);
  const [travelStyle, setTravelStyle] = useState("cultural");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) return;

    onSubmit({
      destination: destination.trim(),
      days: Number(days),
      budget: Number(budget),
      travel_style: travelStyle,
    });
  };

  const dailyBudget = days > 0 ? (budget / days).toFixed(0) : "0";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
      <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 leading-tight">
              Create New Travel Plan
            </h2>
            <p className="text-xs text-slate-500">
              Customize parameters to generate an instant itinerary
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
          <span>Daily est: <strong>${dailyBudget}/day</strong></span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Destination */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Where to? (Destination)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <MapPin className="w-4 h-4 text-emerald-600" />
            </div>
            <input
              type="text"
              required
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Kyoto, Japan or Bali, Indonesia"
              className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
            />
          </div>

          {/* Quick preset destination pills */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
            <span className="text-[11px] text-slate-400 font-medium mr-1">Popular:</span>
            {POPULAR_DESTINATIONS.map((dest) => (
              <button
                key={dest}
                type="button"
                onClick={() => setDestination(dest)}
                className="text-[11px] px-2.5 py-1 rounded-md bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 transition-colors border border-transparent hover:border-emerald-200 cursor-pointer"
              >
                {dest}
              </button>
            ))}
          </div>
        </div>

        {/* Duration & Budget Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Days */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Duration (Days)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Calendar className="w-4 h-4 text-emerald-600" />
              </div>
              <input
                type="number"
                min={1}
                max={30}
                required
                value={days}
                onChange={(e) => setDays(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
              />
            </div>
          </div>

          {/* Total Budget */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Total Budget (USD $)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <input
                type="number"
                min={50}
                max={50000}
                step={50}
                required
                value={budget}
                onChange={(e) => setBudget(Math.max(10, parseInt(e.target.value) || 0))}
                className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Travel Style Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Travel Style
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {TRAVEL_STYLES.map((style) => {
              const isSelected = travelStyle === style.id;
              return (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setTravelStyle(style.id)}
                  className={`p-2.5 rounded-xl text-xs font-medium text-left border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-emerald-50 border-emerald-500 text-emerald-900 ring-1 ring-emerald-500"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
                  }`}
                >
                  {style.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !destination.trim()}
          className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-emerald-200"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>KelanaAI is crafting your itinerary...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate AI Itinerary & Save to Account</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
