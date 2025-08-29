import { api } from "../../convex/_generated/api";
import convex from "../convex";
import { setCookie } from "../utils/cookies";
import { createJWT } from "./jwt";

export async function guestLogin() {
  try {
    // Create a new guest
    const guestId = await convex.mutation(api.players.createGuest, {});

    // Create JWT and store in cookie
    const jwt = await createJWT(guestId);

    // Set JWT cookie
    setCookie("jwt", jwt, { maxAge: 30 * 24 * 60 * 60, sameSite: "lax" });

    // Reload to refresh authentication state
    window.location.href = "/";

    return guestId;
  } catch (error) {
    console.error("Guest login failed:", error);
    throw error;
  }
}
