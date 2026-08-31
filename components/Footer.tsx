import React from "react";
import { Compass, Shield, Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-slate-700 font-semibold">
          <Compass className="w-4 h-4 text-emerald-600" />
          <span>KelanaAI &copy; {new Date().getFullYear()}</span>
        </div>

        <div className="flex items-center gap-6 text-slate-500">
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            Protected CRUD & User Ownership
          </span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            Powered by Gemini AI
          </span>
        </div>
      </div>
    </footer>
  );
}
