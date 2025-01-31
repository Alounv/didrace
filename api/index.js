import { Hono } from "hono";
import { handle } from "hono/vercel";
import { SignJWT } from "jose";
import * as dotenv from "dotenv";
import { nanoid } from "nanoid";
import { discordAuth } from "@hono/oauth-providers/discord";
import { setCookie } from "hono/cookie";
import pg from "pg";

// --- Env ---

dotenv.config({ path: ".env" });

// --- Hono ---

export const app = new Hono().basePath("/api");

app.use(
  "/discord",
  discordAuth({
    client_id: process.env.DISCORD_CLIENT_ID,
    client_secret: process.env.DISCORD_CLIENT_SECRET,
    scope: ["identify", "email"],
  }),
);

app.get("/discord", async (c) => {
  // const token = c.get("token");
  // const refreshToken = c.get("refresh-token");
  // const grantedScopes = c.get("granted-scopes");
  const user = c.get("user-discord");

  let player = await getPlayerByDiscordId(must(user?.id));

  if (!player) {
    player = await createPlayer({
      discordID: must(user?.id),
      name: user?.global_name ?? "Anonymous",
      avatar: user?.avatar
        ? `https://cdn.discordapp.com/avatars/${user?.id}/${user?.avatar}.png`
        : null,
      color: user?.accent_color ?? null,
    });
  }

  setJWT({ c, sub: player.id });

  return c.redirect("/");
});

app.get("/guest", async (c) => {
  const guest = await createPlayer({
    discordID: null,
    name: "Guest",
    avatar: null,
    color: null,
  });

  setJWT({ c, sub: guest.id });

  return c.redirect("/");
});

// --- Utils ---

function must(val) {
  if (!val) {
    throw new Error("Expected value to be defined");
  }
  return val;
}

// --- JWT ---

async function setJWT({ c, sub }) {
  const jwtPayload = {
    sub,
    iat: Math.floor(Date.now() / 1000),
  };

  const jwt = await new SignJWT(jwtPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30days")
    .sign(new TextEncoder().encode(must(process.env.ZERO_AUTH_SECRET)));

  setCookie(c, "jwt", jwt, {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });
}

// --- Database ---

export const pool = new pg.Pool({
  connectionString: process.env.ZERO_UPSTREAM_DB,
});

const COLORS = [
  "#12C3E2",
  "#5712E2",
  "#99E212",
  "#E21249",
  "#E28B12",
  "#E2CA12",
];

function randColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

async function getPlayerByDiscordId(discordID) {
  const result = await pool.query(
    'SELECT * FROM player WHERE "discordID" = $1',
    [discordID],
  );
  return result.rows[0] || null;
}

async function createPlayer(player) {
  const result = await pool.query(
    'INSERT INTO player (id, "discordID", name, color, avatar) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [
      nanoid(),
      player.discordID,
      player.name,
      player.color ?? randColor(),
      player.avatar,
    ],
  );
  return result.rows[0];
}

// -- Exports ---

const handler = handle(app);

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const PUT = handler;
export const OPTIONS = handler;
