import { ConvexClient } from "convex/browser";
import Cookies from "js-cookie";
import { decodeJwt } from "jose";

const convex = new ConvexClient(import.meta.env.VITE_CONVEX_URL!);

// Helper to get current user info from JWT
export function getCurrentUser() {
  const encodedJWT = Cookies.get("jwt");
  const decodedJWT = encodedJWT && decodeJwt(encodedJWT);
  const userID = decodedJWT?.sub ? (decodedJWT.sub as string) : "anon";
  
  return {
    userID,
    token: encodedJWT,
    isAuthenticated: userID !== "anon"
  };
}

export default convex;