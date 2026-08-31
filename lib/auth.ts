import { findUserById } from "./db";
import type { User } from "./types";

// Token encoder/decoder for stateless sessions
// Format: base64(userId:timestamp)
const _AUTH_SECRET = process.env.AUTH_SECRET || "kelana_ai_secure_token_secret_2026";

export function generateToken(user: User): string {
  const payload = {
    userId: user.id,
    email: user.email,
    timestamp: Date.now(),
  };
  const str = JSON.stringify(payload);
  return Buffer.from(str).toString("base64");
}

export function verifyToken(token: string): { userId: number; email: string } | null {
  try {
    const decodedStr = Buffer.from(token, "base64").toString("utf-8");
    const payload = JSON.parse(decodedStr);
    if (payload && typeof payload.userId === "number") {
      return payload;
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Extracts and verifies the authenticated user from the Request headers or cookies.
 * Supports:
 * 1. Authorization: Bearer <token>
 * 2. x-user-id: <id> (developer test header fallback)
 */
export function getAuthenticatedUser(request: Request): User | null {
  // 1. Check Authorization Bearer header
  const authHeader = request.headers.get("Authorization") || request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    const payload = verifyToken(token);
    if (payload) {
      const user = findUserById(payload.userId);
      if (user) {
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          created_at: user.created_at,
        };
      }
    }
  }

  // 2. Check test/header fallback x-user-id
  const userIdHeader = request.headers.get("x-user-id");
  if (userIdHeader) {
    const uid = parseInt(userIdHeader, 10);
    if (!isNaN(uid)) {
      const user = findUserById(uid);
      if (user) {
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          created_at: user.created_at,
        };
      }
    }
  }

  return null;
}
