import { ConvexError } from "convex/values";
import { SignJWT, decodeJwt } from "jose";

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

// Helper to create JWT (keeping your existing logic)
export async function createJWT(sub: string) {
  const jwtPayload = {
    sub,
    iat: Math.floor(Date.now() / 1000),
  };

  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new ConvexError("AUTH_SECRET not configured");
  }

  const jwt = await new SignJWT(jwtPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30days")
    .sign(new TextEncoder().encode(secret));

  return jwt;
}
