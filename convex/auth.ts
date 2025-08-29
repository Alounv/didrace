import { ConvexError } from "convex/values";
import { decodeJwt } from "jose";

// Helper to decode and validate JWT
export async function getUserFromToken(token: string | undefined) {
  if (!token) {
    return null;
  }

  try {
    const decoded = decodeJwt(token);
    return decoded.sub as string;
  } catch {
    return null;
  }
}

// Helper to require authentication
export function requireAuth(userID: string | null): string {
  if (!userID || userID === "anon") {
    throw new ConvexError("Authentication required");
  }
  return userID;
}
