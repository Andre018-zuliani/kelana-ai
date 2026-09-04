"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { User, AuthResponse } from "./types";
import { API_URL } from "./api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "kelana_auth_token";
const USER_KEY = "kelana_auth_user";

function safeGetItem(key: string): string | null {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch (e) {
    console.warn(`SafeStorage get error for ${key}:`, e);
  }
  return null;
}

function safeSetItem(key: string, value: string): void {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch (e) {
    console.warn(`SafeStorage set error for ${key}:`, e);
  }
}

function safeRemoveItem(key: string): void {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch (e) {
    console.warn(`SafeStorage remove error for ${key}:`, e);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from safe storage on mount
  useEffect(() => {
    try {
      const storedToken = safeGetItem(TOKEN_KEY);
      const storedUser = safeGetItem(USER_KEY);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Failed to load auth from storage", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({ detail: "Gagal memproses respon server" }));
      if (!res.ok) {
        return { success: false, error: data.detail || "Login gagal. Silakan periksa kembali." };
      }

      const authData = data as AuthResponse;
      setUser(authData.user);
      setToken(authData.token);
      safeSetItem(TOKEN_KEY, authData.token);
      safeSetItem(USER_KEY, JSON.stringify(authData.user));

      return { success: true };
    } catch (err) {
      console.error("Login catch error:", err);
      return { success: false, error: "Gagal menghubungkan ke server login. Silakan coba lagi." };
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json().catch(() => ({ detail: "Gagal memproses respon server" }));
      if (!res.ok) {
        return { success: false, error: data.detail || "Pendaftaran gagal" };
      }

      const authData = data as AuthResponse;
      setUser(authData.user);
      setToken(authData.token);
      safeSetItem(TOKEN_KEY, authData.token);
      safeSetItem(USER_KEY, JSON.stringify(authData.user));

      return { success: true };
    } catch (err) {
      console.error("Register catch error:", err);
      return { success: false, error: "Gagal mendaftar. Silakan coba lagi." };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    safeRemoveItem(TOKEN_KEY);
    safeRemoveItem(USER_KEY);
  }, []);

  const authFetch = useCallback(
    async (url: string, options: RequestInit = {}) => {
      const headers = new Headers(options.headers || {});
      const currentToken = token || safeGetItem(TOKEN_KEY);

      if (currentToken) {
        headers.set("Authorization", `Bearer ${currentToken}`);
      }

      return fetch(url, {
        ...options,
        headers,
      });
    },
    [token]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        authFetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
