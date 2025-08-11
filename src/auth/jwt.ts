import { SignJWT } from "jose";

// This should match the secret used in the original API
const JWT_SECRET = "secretkey"; // This matches ZERO_AUTH_SECRET from .env

export async function createJWT(sub: string): Promise<string> {
  const jwtPayload = {
    sub,
    iat: Math.floor(Date.now() / 1000),
  };

  const jwt = await new SignJWT(jwtPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30days")
    .sign(new TextEncoder().encode(JWT_SECRET));

  return jwt;
}