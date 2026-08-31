"use client";

import React, { useState, useEffect, use, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/lib/auth_context";
import { API_URL } from "@/lib/api";
import type { Trip, GenerateResponse } from "@/lib/types";
import {
  Calendar,
  DollarSign,
  Tag,
  ArrowLeft,
  Trash2,
  Edit2,
  Sparkles,
  Copy,
  Check,
  ShieldAlert,
  Loader2,
  ShieldCheck,
  RefreshCw,
  X,
} from "lucide-react";

function TripDetailContent({ id }: { id: string }) {
  const router = useRouter();
  const { user, authFetch } = useAuth();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [forbiddenError, setForbiddenError] = useState<string | null>(null);
  const [notFoundError, setNotFoundError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Edit budget modal state
  const [isEditing, setIsEditing] = useState(false);
  const [editBudget, setEditBudget] = useState(0);
  const [updating, setUpdating] = useState(false);

  // Generate / Regenerate AI state
  const [generating, setGenerating] = useState(false);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchTrip = useCallback(async () => {
    setLoading(true);
    setForbiddenError(null);
    setNotFoundError(null);

    try {
      // GET /api/v1/trips/{id}
      const res = await authFetch(`${API_URL}/api/v1/trips/${id}`);

      if (res.status === 403) {
        const data = await res.json().catch(() => ({}));
        setForbiddenError(
          data.detail ||
            "Access Denied (403 Forbidden): This trip belongs to another user. You can only view and manage your own trips."
        );
        return;
      }

      if (res.status === 404) {
        setNotFoundError(`Trip with ID #${id} was not found.`);
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to load trip details.");
      }

      const data: Trip = await res.json();
      setTrip(data);
      setEditBudget(data.budget);
    } catch (err) {
      setNotFoundError(
        err instanceof Error ? err.message : "Error fetching trip"
      );
    } finally {
      setLoading(false);
    }
  }, [authFetch, id]);

  useEffect(() => {
    fetchTrip();
  }, [fetchTrip]);

  // Handle Edit Budget
  const handleUpdateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trip) return;
    setUpdating(true);

    try {
      // PUT /api/v1/trips/{id}
      const res = await authFetch(`${API_URL}/api/v1/trips/${trip.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ budget: Number(editBudget) }),
      });

      if (res.status === 403) {
        alert("Forbidden: You cannot modify another user's trip.");
        return;
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to update budget.");
      }

      const updated: Trip = await res.json();
      setTrip(updated);
      setIsEditing(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setUpdating(false);
    }
  };

  // Handle Delete Trip
  const handleDeleteTrip = async () => {
    if (!trip) return;
    setDeleting(true);

    try {
      // DELETE /api/v1/trips/{id}
      const res = await authFetch(`${API_URL}/api/v1/trips/${trip.id}`, {
        method: "DELETE",
      });

      if (res.status === 403) {
        alert("Forbidden: You cannot delete another user's trip.");
        return;
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to delete trip.");
      }

      router.push("/trips");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete");
      setDeleting(false);
    }
  };

  // Handle Regenerate Itinerary
  const handleRegenerateItinerary = async () => {
    if (!trip) return;
    setGenerating(true);

    try {
      // POST /api/v1/trips/{id}/generate
      const res = await authFetch(`${API_URL}/api/v1/trips/${trip.id}/generate`, {
        method: "POST",
      });

      if (res.status === 403) {
        alert("Forbidden: You cannot generate an itinerary for another user's trip.");
        return;
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to generate itinerary.");
      }

      const data: GenerateResponse = await res.json();
      setTrip((prev) =>
        prev ? { ...prev, ai_recommendation: data.recommendation } : null
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to generate itinerary");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyItinerary = () => {
    if (trip?.ai_recommendation) {
      navigator.clipboard.writeText(trip.ai_recommendation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
        <p className="text-sm text-slate-500 font-medium">Loading trip details...</p>
      </div>
    );
  }

  // 403 FORBIDDEN ERROR STATE (Reject other users' trips test case)
  if (forbiddenError) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl border border-rose-200 shadow-sm p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <span className="inline-block px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold uppercase tracking-wider mb-2">
            403 Forbidden &bull; User Isolation Active
          </span>
          <h2 className="text-2xl font-bold text-slate-900">
            Access Denied
          </h2>
          <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
            {forbiddenError}
          </p>
          <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/trips"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to My Trips</span>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
            >
              <span>Plan New Trip</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 404 Not found state
  if (notFoundError || !trip) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl border border-slate-200 p-8">
          <h2 className="text-xl font-bold text-slate-900">Trip Not Found</h2>
          <p className="text-xs text-slate-500 mt-2">{notFoundError}</p>
          <Link
            href="/trips"
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go to My Trips</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top back navigation */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <Link
          href="/trips"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Trips</span>
        </Link>

        <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Owner: {user?.name} (User #{trip.user_id})</span>
        </div>
      </div>

      {/* Main Trip Card Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 p-6 sm:p-8 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {trip.category} Tier
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Trip #{trip.id}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {trip.destination}
              </h1>
            </div>

            {/* Quick Actions Header */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm transition-colors cursor-pointer border border-white/15"
                title="Edit Trip Budget (PUT /trips/:id)"
              >
                <Edit2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>Edit Budget</span>
              </button>

              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-semibold backdrop-blur-sm transition-colors cursor-pointer border border-rose-500/30"
                title="Delete Trip (DELETE /trips/:id)"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10 text-xs">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="text-white/60 text-[10px] uppercase font-medium">Duration</p>
                <p className="font-bold text-white">{trip.days} Days</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="text-white/60 text-[10px] uppercase font-medium">Total Budget</p>
                <p className="font-bold text-white">${trip.budget.toLocaleString()} USD</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="text-white/60 text-[10px] uppercase font-medium">Daily Budget</p>
                <p className="font-bold text-white">${Math.round(trip.daily_budget)}/day</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Tag className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="text-white/60 text-[10px] uppercase font-medium">Travel Style</p>
                <p className="font-bold text-white capitalize">{trip.travel_style || "Standard"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Recommendation Itinerary Section */}
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-slate-900">
                AI Travel Itinerary
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {trip.ai_recommendation && (
                <button
                  onClick={handleCopyItinerary}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              )}

              <button
                onClick={handleRegenerateItinerary}
                disabled={generating}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Regenerating...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{trip.ai_recommendation ? "Regenerate AI" : "Generate AI Plan"}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Itinerary body */}
          {trip.ai_recommendation ? (
            <div className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-h2:text-xl prose-h2:border-b prose-h2:border-slate-100 prose-h2:pb-2 prose-h2:mt-6 prose-h2:first:mt-0 prose-p:text-slate-600 prose-p:leading-relaxed prose-li:text-slate-600 prose-strong:text-slate-900">
              <ReactMarkdown>{trip.ai_recommendation}</ReactMarkdown>
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Sparkles className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-800">No itinerary generated yet</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Click below to generate a tailored day-by-day travel plan powered by Gemini AI.
              </p>
              <button
                onClick={handleRegenerateItinerary}
                disabled={generating}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 cursor-pointer disabled:opacity-50"
              >
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Generate Itinerary Now</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Budget Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Update Budget (PUT /trips/{trip.id})
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateBudget} className="py-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Budget (USD $)
                </label>
                <input
                  type="number"
                  min={50}
                  step={50}
                  required
                  value={editBudget}
                  onChange={(e) => setEditBudget(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <p className="text-[11px] text-slate-500">
                Recalculated daily: ${trip.days > 0 ? (editBudget / trip.days).toFixed(0) : "0"}/day
              </p>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg disabled:opacity-50 cursor-pointer"
                >
                  {updating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center border border-rose-100">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Delete Trip #{trip.id}?
              </h3>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed mb-5">
              Are you sure you want to delete this trip itinerary? This action permanently removes it from your account.
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteTrip}
                disabled={deleting}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg disabled:opacity-50 cursor-pointer"
              >
                {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);

  return (
    <ProtectedRoute>
      <TripDetailContent id={resolvedParams.id} />
    </ProtectedRoute>
  );
}
