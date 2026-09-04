"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth_context";
import {
  Compass,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  AlertCircle,
  Users,
  Sparkles,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setError(null);
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      router.push(redirect);
    } else {
      setError(result.error || "Failed to log in. Please check your credentials.");
    }
  };

  const handleQuickLogin = async (targetEmail: string, targetPassword = "password123") => {
    setEmail(targetEmail);
    setPassword(targetPassword);
    setError(null);
    setLoading(true);

    const result = await login(targetEmail, targetPassword);
    setLoading(false);

    if (result.success) {
      router.push(redirect);
    } else {
      setError(result.error || "Gagal masuk. Silakan periksa kembali kredensial Anda.");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 border border-emerald-100">
            <Compass className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Sign In to KelanaAI
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Akses rencana perjalanan AI dan rekomendasi destinasi Anda
          </p>
        </div>

        {/* 1-Click Fast Login Banner */}
        <div className="mb-6 p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              1-Click Instant Login
            </span>
            <span className="text-[10px] text-emerald-700 bg-emerald-100/80 font-medium px-2 py-0.5 rounded-full">
              Langsung Masuk
            </span>
          </div>
          
          <button
            type="button"
            disabled={loading}
            onClick={() => handleQuickLogin("andresyarief7@gmail.com")}
            className="w-full text-left p-3 rounded-xl bg-white border border-emerald-300 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group flex items-center justify-between mb-2"
          >
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900">Andre Syarief</span>
                <span className="text-[10px] bg-emerald-600 text-white font-semibold px-1.5 py-0.5 rounded">
                  Akun Anda
                </span>
              </div>
              <p className="text-xs text-slate-500">andresyarief7@gmail.com</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="block font-medium">{error}</span>
              <p className="text-xs text-rose-600">
                Tip: Masukkan email & password apa saja, akun baru akan dibuat otomatis, atau gunakan akun 1-Click di atas.
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Masuk...</span>
              </>
            ) : (
              <>
                <span>Sign In / Masuk</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Logins Helper */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">
            <Users className="w-3.5 h-3.5 text-emerald-600" />
            <span>Akun Demo Lainnya (1-Klik)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin("demo@kelana.ai")}
              className="text-left p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-emerald-50 hover:border-emerald-200 transition-colors cursor-pointer"
            >
              <p className="text-xs font-bold text-slate-800">Demo Traveler</p>
              <p className="text-[11px] text-slate-500 truncate">demo@kelana.ai</p>
              <span className="inline-block mt-1 text-[10px] text-emerald-700 bg-emerald-100/60 px-1.5 py-0.5 rounded font-medium">
                Trip: Kyoto, Japan
              </span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin("jane@kelana.ai")}
              className="text-left p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-emerald-50 hover:border-emerald-200 transition-colors cursor-pointer"
            >
              <p className="text-xs font-bold text-slate-800">Jane Explorer</p>
              <p className="text-[11px] text-slate-500 truncate">jane@kelana.ai</p>
              <span className="inline-block mt-1 text-[10px] text-teal-700 bg-teal-100/60 px-1.5 py-0.5 rounded font-medium">
                Trip: Paris, France
              </span>
            </button>
          </div>
        </div>

        {/* Register link */}
        <div className="mt-6 text-center text-xs text-slate-500">
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="font-semibold text-emerald-600 hover:text-emerald-700 underline underline-offset-2"
          >
            Daftar akun baru di sini
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}
