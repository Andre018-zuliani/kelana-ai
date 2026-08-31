"use client";

import React, { useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import type { Trip } from "@/lib/types";
import {
  Calendar,
  DollarSign,
  Tag,
  Copy,
  Check,
  ArrowRight,
  ListOrdered,
  Sparkles,
} from "lucide-react";

interface AIRecommendationProps {
  trip: Trip;
}

export default function AIRecommendation({ trip }: AIRecommendationProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (trip.ai_recommendation) {
      navigator.clipboard.writeText(trip.ai_recommendation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-semibold mb-2 backdrop-blur-sm">
              <Sparkles className="w-3 h-3" />
              <span>AI Itinerary Ready &bull; Saved (Trip #{trip.id})</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">
              {trip.destination}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-medium backdrop-blur-sm transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-200" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Plan</span>
                </>
              )}
            </button>

            <Link
              href={`/trips/${trip.id}`}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white text-emerald-800 hover:bg-emerald-50 text-xs font-bold transition-colors shadow-sm"
            >
              <span>Manage Trip</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-white/20 text-xs">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-200" />
            <div>
              <p className="text-white/70 text-[10px] uppercase font-medium">Duration</p>
              <p className="font-bold">{trip.days} Days</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-200" />
            <div>
              <p className="text-white/70 text-[10px] uppercase font-medium">Budget</p>
              <p className="font-bold">${trip.budget.toLocaleString()} USD</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-emerald-200" />
            <div>
              <p className="text-white/70 text-[10px] uppercase font-medium">Category</p>
              <p className="font-bold">{trip.category}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-200" />
            <div>
              <p className="text-white/70 text-[10px] uppercase font-medium">Daily Budget</p>
              <p className="font-bold">${Math.round(trip.daily_budget)}/day</p>
            </div>
          </div>
        </div>
      </div>

      {/* Itinerary Body Content */}
      <div className="p-6 sm:p-8">
        <div className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-h2:text-xl prose-h2:border-b prose-h2:border-slate-100 prose-h2:pb-2 prose-h2:mt-6 prose-h2:first:mt-0 prose-p:text-slate-600 prose-p:leading-relaxed prose-li:text-slate-600 prose-strong:text-slate-900">
          {trip.ai_recommendation ? (
            <ReactMarkdown>{trip.ai_recommendation}</ReactMarkdown>
          ) : (
            <p className="text-slate-400 italic">No itinerary generated yet.</p>
          )}
        </div>

        {/* Action bar at bottom */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            This trip is securely stored under your account (Trip #{trip.id}).
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/trips"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <ListOrdered className="w-4 h-4" />
              View All My Trips
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
