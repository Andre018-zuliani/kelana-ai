"use client";

import React from "react";
import { useAuth } from "@/lib/auth_context";
import { Sparkles, ShieldCheck } from "lucide-react";

export default function Hero() {
  const { user } = useAuth();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-900 text-white py-14 px-4 sm:px-6 lg:px-8">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-emerald-500/10 blur-3xl pointer-events-none rounded-full" />

      <div className="relative max-w-3xl mx-auto text-center">
        {/* User personalized status badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium mb-6">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            {user ? (
              <>Welcome back, <strong className="text-white">{user.name}</strong></>
            ) : (
              "AI-Powered Personalized Travel Planning"
            )}
          </span>
          {user && (
            <span className="flex items-center gap-1 pl-2 border-l border-emerald-500/30 text-[11px] text-emerald-200">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              Protected Space
            </span>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
          Where would you like to <span className="text-emerald-400">explore</span> next?
        </h1>

        <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          KelanaAI crafts customized, day-by-day itineraries tailored to your budget and travel style. Every trip you create is securely saved to your personal account.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <a
            href="/chat"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold text-xs rounded-xl shadow-md hover:shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-950" />
            <span>Mulai Obrolan Multi-Turn (Conversational Memory)</span>
          </a>
        </div>
      </div>
    </section>
  );
}
