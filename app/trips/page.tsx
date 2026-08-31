"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/lib/auth_context";
import { API_URL } from "@/lib/api";
import type { Trip } from "@/lib/types";
import {
  MapPin,
  Calendar,
  DollarSign,
  Tag,
  Plus,
  Trash2,
  Edit2,
  ArrowRight,
  Sparkles,
  Search,
  Loader2,
  AlertCircle,
  ShieldCheck,
  Check,
  X,
} from "lucide-react";

function TripsListContent() {
  const { user, authFetch } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Edit budget modal/inline state
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [editBudget, setEditBudget] = useState<number>(0);
  const [editLoading, setEditLoading] = useState(false);

  // Delete modal state
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // GET /api/v1/trips with auth token -> returns ONLY own trips
      const res = await authFetch(`${API_URL}/api/v1/trips`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to load your trips.");
      }

      const data: Trip[] = await res.json();
      setTrips(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load trips. Please retry."
      );
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  // Handle Edit Budget
  const handleStartEdit = (trip: Trip) => {
    setEditingTrip(trip);
    setEditBudget(trip.budget);
  };

  const handleSaveBudget = async () => {
    if (!editingTrip) return;
    setEditLoading(true);

    try {
      // PUT /api/v1/trips/{id}
      const res = await authFetch(`${API_URL}/api/v1/trips/${editingTrip.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ budget: Number(editBudget) }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to update trip budget.");
      }

      const updated: Trip = await res.json();
      setTrips((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      );
      setEditingTrip(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update budget");
    } finally {
      setEditLoading(false);
    }
  };

  // Handle Delete Trip
  const handleDeleteTrip = async (id: number) => {
    setDeleteLoading(true);
    try {
      // DELETE /api/v1/trips/{id}
      const res = await authFetch(`${API_URL}/api/v1/trips/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to delete trip.");
      }

      setTrips((prev) => prev.filter((t) => t.id !== id));
      setDeletingId(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete trip");
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredTrips = trips.filter((t) =>
    t.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.travel_style && t.travel_style.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getCategoryBadge = (category: string) => {
    switch (category.toLowerCase()) {
      case "backpacker":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "luxury":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              My Travel Itineraries
            </h1>
            <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              <ShieldCheck className="w-3 h-3" />
              Private to you
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Displaying only trips belonging to <strong>{user?.name}</strong> (User #{user?.id})
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-colors shadow-emerald-200 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Plan New Trip</span>
        </Link>
      </div>

      {/* Search and Filters Bar */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search destination or style..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <strong>{filteredTrips.length}</strong> of {trips.length} trips
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="min-h-[40vh] flex flex-col items-center justify-center p-8">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
          <p className="text-sm text-slate-500">Loading your private trips...</p>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="mt-8 p-6 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-rose-900">Failed to load trips</h3>
            <p className="text-xs text-rose-700 mt-1">{error}</p>
            <button
              onClick={fetchTrips}
              className="mt-3 px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 cursor-pointer"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filteredTrips.length === 0 && (
        <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
            <MapPin className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            {searchQuery ? "No matching trips found" : "No trips planned yet"}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No itineraries matching "${searchQuery}". Try a different search term.`
              : "You haven't generated any travel itineraries yet. Start planning your next dream journey!"}
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Generate First Trip</span>
          </Link>
        </div>
      )}

      {/* Trips Grid */}
      {!loading && !error && filteredTrips.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip) => (
            <div
              key={trip.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
            >
              {/* Card Header */}
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${getCategoryBadge(
                        trip.category
                      )}`}
                    >
                      {trip.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      #{trip.id}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight line-clamp-1">
                    {trip.destination}
                  </h3>
                </div>

                {trip.ai_recommendation && (
                  <span
                    className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 font-medium shrink-0"
                    title="Itinerary generated"
                  >
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    AI Plan
                  </span>
                )}
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 space-y-3.5">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-medium uppercase">Duration</p>
                      <p className="font-bold text-slate-900">{trip.days} Days</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-medium uppercase">Budget</p>
                      <p className="font-bold text-slate-900">${trip.budget.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-slate-400" />
                    Style: <strong className="text-slate-700 capitalize">{trip.travel_style || "Standard"}</strong>
                  </span>
                  <span>
                    Est: <strong>${Math.round(trip.daily_budget)}/day</strong>
                  </span>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  {/* Edit Budget Button */}
                  <button
                    onClick={() => handleStartEdit(trip)}
                    className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                    title="Edit Budget (PUT /trips/:id)"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => setDeletingId(trip.id)}
                    className="p-2 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Trip (DELETE /trips/:id)"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <Link
                  href={`/trips/${trip.id}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-lg transition-colors shadow-2xs"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Budget Modal */}
      {editingTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Update Budget (PUT /trips/{editingTrip.id})
              </h3>
              <button
                onClick={() => setEditingTrip(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <p className="text-xs text-slate-500">
                Destination: <strong className="text-slate-800">{editingTrip.destination}</strong> ({editingTrip.days} days)
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Budget (USD $)
                </label>
                <input
                  type="number"
                  min={50}
                  step={50}
                  value={editBudget}
                  onChange={(e) => setEditBudget(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <p className="text-[11px] text-slate-400">
                New daily estimate: ${editingTrip.days > 0 ? (editBudget / editingTrip.days).toFixed(0) : "0"}/day
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingTrip(null)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveBudget}
                disabled={editLoading}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg disabled:opacity-50"
              >
                {editLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center border border-rose-100">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Delete Trip #{deletingId}?
              </h3>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed mb-5">
              Are you sure you want to delete this trip itinerary? This action permanently removes it from your account.
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteTrip(deletingId)}
                disabled={deleteLoading}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg disabled:opacity-50 cursor-pointer"
              >
                {deleteLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TripsPage() {
  return (
    <ProtectedRoute>
      <TripsListContent />
    </ProtectedRoute>
  );
}
