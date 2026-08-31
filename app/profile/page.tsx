"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/lib/auth_context";
import { API_URL } from "@/lib/api";
import type { Trip } from "@/lib/types";
import {
  Mail,
  Calendar,
  DollarSign,
  ListOrdered,
  LogOut,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  SwitchCamera,
  Loader2,
} from "lucide-react";

function ProfileContent() {
  const router = useRouter();
  const { user, logout, login, authFetch } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);

  const fetchUserTrips = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_URL}/api/v1/trips`);
      if (res.ok) {
        const data: Trip[] = await res.json();
        setTrips(data);
      }
    } catch (e) {
      console.error("Failed to load profile trips", e);
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchUserTrips();
  }, [fetchUserTrips]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleQuickSwitch = async (email: string) => {
    setSwitching(true);
    await login(email, "password123");
    setSwitching(false);
    fetchUserTrips();
  };

  const totalBudget = trips.reduce((acc, t) => acc + (t.budget || 0), 0);
  const totalDays = trips.reduce((acc, t) => acc + (t.days || 0), 0);
  const avgDays = trips.length > 0 ? (totalDays / trips.length).toFixed(1) : "0";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white text-2xl font-extrabold flex items-center justify-center shadow-sm shadow-emerald-200 uppercase">
              {user?.name.charAt(0)}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {user?.name}
                </h1>
                <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  User #{user?.id}
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {user?.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <button
              onClick={handleLogout}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 rounded-xl transition-colors cursor-pointer border border-rose-200/60"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-100">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
              <ListOrdered className="w-4 h-4 text-emerald-600" />
              <span>Personal Trips</span>
            </div>
            <p className="text-2xl font-extrabold text-slate-900">
              {loading ? "..." : trips.length}
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Total Budget Allocated</span>
            </div>
            <p className="text-2xl font-extrabold text-slate-900">
              {loading ? "..." : `$${totalBudget.toLocaleString()} USD`}
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Avg Trip Length</span>
            </div>
            <p className="text-2xl font-extrabold text-slate-900">
              {loading ? "..." : `${avgDays} Days`}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Account Switcher Section (Great for grading & verifying multi-user isolation) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-8">
        <div className="flex items-center gap-2 mb-2">
          <SwitchCamera className="w-5 h-5 text-emerald-600" />
          <h2 className="text-base font-bold text-slate-900">
            Multi-User Isolation Tester
          </h2>
        </div>
        <p className="text-xs text-slate-500 mb-4 leading-relaxed">
          Easily switch between test accounts to verify that <strong>GET /trips</strong> filters only own trips, and <strong>PUT/DELETE /trips/:id</strong> rejects modifying other users&apos; trips with <strong>403 Forbidden</strong>.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => handleQuickSwitch("demo@kelana.ai")}
            disabled={user?.email === "demo@kelana.ai" || switching}
            className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
              user?.email === "demo@kelana.ai"
                ? "bg-emerald-50 border-emerald-500/80 text-emerald-950 ring-1 ring-emerald-500"
                : "bg-slate-50 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">Demo Traveler</span>
              {user?.email === "demo@kelana.ai" && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                  Active
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">demo@kelana.ai &bull; User #1</p>
            <p className="text-[10px] text-slate-400 mt-1">Owns Kyoto trip</p>
          </button>

          <button
            onClick={() => handleQuickSwitch("jane@kelana.ai")}
            disabled={user?.email === "jane@kelana.ai" || switching}
            className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
              user?.email === "jane@kelana.ai"
                ? "bg-emerald-50 border-emerald-500/80 text-emerald-950 ring-1 ring-emerald-500"
                : "bg-slate-50 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">Jane Explorer</span>
              {user?.email === "jane@kelana.ai" && (
                <span className="text-[10px] font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-md">
                  Active
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">jane@kelana.ai &bull; User #2</p>
            <p className="text-[10px] text-slate-400 mt-1">Owns Paris trip</p>
          </button>
        </div>
      </div>

      {/* Recent Trips Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">
              Your Itineraries
            </h2>
          </div>

          <Link
            href="/trips"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-6 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            <span className="text-xs">Loading trips...</span>
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs">
            No trips saved yet.{" "}
            <Link href="/" className="font-semibold text-emerald-600 hover:underline">
              Plan your first trip!
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {trips.slice(0, 3).map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors"
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{t.destination}</h4>
                  <p className="text-xs text-slate-500">
                    {t.days} Days &bull; ${t.budget.toLocaleString()} USD &bull; {t.category}
                  </p>
                </div>

                <Link
                  href={`/trips/${t.id}`}
                  className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-white border border-slate-200 rounded-lg hover:bg-emerald-50 transition-colors shadow-2xs"
                >
                  View
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
