// URL dasar backend FastAPI. Bisa dioverride lewat .env.local
// (NEXT_PUBLIC_API_URL=http://localhost:8000) tanpa mengubah kode.
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
