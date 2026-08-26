import ReactMarkdown from "react-markdown";
import type { Trip } from "@/lib/types";

interface AIRecommendationProps {
  trip: Trip;
}

/**
 * Menampilkan trip summary + itinerary AI.
 *
 * ai_recommendation berisi teks Markdown (## per hari, - untuk bullet
 * Morning/Afternoon/Evening) yang dikirim dari services/bedrock_service.py.
 * react-markdown mengubahnya menjadi elemen HTML asli, lalu di-style
 * dengan Tailwind supaya terlihat seperti kartu itinerary, bukan blok teks.
 */
export default function AIRecommendation({ trip }: AIRecommendationProps) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-lg ring-1 ring-slate-900/5 sm:p-8">
      {/* Ringkasan trip */}
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            {trip.destination}
          </h3>
          <p className="text-sm text-slate-500">
            {trip.days} days · Budget USD {trip.budget.toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 ring-1 ring-sky-200">
            {trip.category}
          </span>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
            ~USD {trip.daily_budget.toFixed(0)}/day
          </span>
        </div>
      </div>

      {/* Itinerary AI (Markdown -> UI) */}
      <div
        className="
          prose prose-slate mt-5 max-w-none prose-headings:mt-6 prose-headings:mb-2
          prose-h2:rounded-lg prose-h2:bg-slate-50 prose-h2:px-3 prose-h2:py-2
          prose-h2:text-base prose-h2:font-semibold prose-h2:text-slate-800
          prose-p:my-1.5 prose-ul:my-1.5 prose-li:my-0.5 prose-strong:text-slate-800
        "
      >
        <ReactMarkdown>
          {trip.ai_recommendation ?? "_Belum ada rekomendasi AI._"}
        </ReactMarkdown>
      </div>
    </div>
  );
}
