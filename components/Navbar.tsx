"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth_context";
import {
  Compass,
  MapPin,
  ListOrdered,
  User as UserIcon,
  LogOut,
  LogIn,
  UserPlus,
  ShieldCheck,
  BookOpen,
} from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="flex items-center gap-2.5 group transition-transform active:scale-95"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-200">
                <Compass className="w-5 h-5 transition-transform group-hover:rotate-45" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-slate-900 leading-none">
                  Kelana<span className="text-emerald-600">AI</span>
                </span>
                <span className="text-[10px] font-medium text-slate-400 tracking-wider uppercase mt-0.5">
                  Travel Planner
                </span>
              </div>
            </Link>

            {/* Navigation links (when authenticated) */}
            {user && (
              <nav className="hidden md:flex items-center gap-1">
                <Link
                  href="/"
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive("/") && pathname === "/"
                      ? "bg-emerald-50 text-emerald-700 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  Plan Trip
                </Link>

                <Link
                  href="/trips"
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive("/trips")
                      ? "bg-emerald-50 text-emerald-700 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <ListOrdered className="w-4 h-4" />
                  My Trips
                </Link>

                <Link
                  href="/knowledge-base"
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive("/knowledge-base")
                      ? "bg-emerald-50 text-emerald-700 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  <span>Knowledge Base (RAG)</span>
                </Link>

                <Link
                  href="/profile"
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive("/profile")
                      ? "bg-emerald-50 text-emerald-700 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <UserIcon className="w-4 h-4" />
                  Profile
                </Link>
              </nav>
            )}
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                {/* User Pill */}
                <Link
                  href="/profile"
                  className="flex items-center gap-2.5 py-1.5 pl-2.5 pr-3 rounded-full bg-slate-100 hover:bg-slate-200/80 transition-colors border border-slate-200/60"
                  title="View Profile"
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center uppercase">
                    {user.name.charAt(0)}
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-800 leading-tight">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-slate-500 leading-tight">
                      ID #{user.id}
                    </span>
                  </div>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200 cursor-pointer"
                  title="Sign out of account"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
                    pathname === "/login"
                      ? "bg-slate-100 text-slate-900 font-semibold"
                      : "text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <LogIn className="w-4 h-4 text-slate-500" />
                  Sign In
                </Link>

                <Link
                  href="/register"
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors shadow-emerald-200"
                >
                  <UserPlus className="w-4 h-4" />
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar when logged in */}
        {user && (
          <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-100">
            <Link
              href="/"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
                isActive("/") && pathname === "/"
                  ? "bg-emerald-50 text-emerald-700 font-semibold"
                  : "text-slate-600"
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              Plan
            </Link>
            <Link
              href="/trips"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
                isActive("/trips")
                  ? "bg-emerald-50 text-emerald-700 font-semibold"
                  : "text-slate-600"
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              My Trips
            </Link>
            <Link
              href="/knowledge-base"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
                isActive("/knowledge-base")
                  ? "bg-emerald-50 text-emerald-700 font-semibold"
                  : "text-slate-600"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
              KB (RAG)
            </Link>
            <Link
              href="/profile"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
                isActive("/profile")
                  ? "bg-emerald-50 text-emerald-700 font-semibold"
                  : "text-slate-600"
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" />
              Profile
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
