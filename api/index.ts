import { Hono } from "hono";
import { randInt } from "../src/rand";
import { handle } from "hono/vercel";
import { SignJWT } from "jose";
import { setCookie } from "hono/cookie";
import { Player } from "../src/schema";
import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
import { discordAuth } from "@hono/oauth-providers/discord";
import { id } from "../src/id";
import pg from "pg";

export const pool = new pg.Pool({
  connectionString: process.env.ZERO_UPSTREAM_DB,
});

const baseEnv = dotenv.config({ path: ".env" });
dotenvExpand.expand(baseEnv);

const localEnv = dotenv.config({ path: ".env.local", override: true });
dotenvExpand.expand(localEnv);

export const app = new Hono().basePath("/api");

export async function getPlayerByDiscordId(
  discordID: string,
): Promise<Player | null> {
  const result = await pool.query(
    'SELECT * FROM player WHERE "discordID" = $1',
    [discordID],
  );
  return result.rows[0] || null;
}

export async function createPlayer(
  player: Omit<Player, "id">,
): Promise<Player> {
  const result = await pool.query(
    'INSERT INTO player (id, "discordID", name, color) VALUES ($1, $2, $3, $4) RETURNING *',
    [id(), player.discordID, player.name, player.color],
  );
  return result.rows[0];
}

const COLORS = [
  "#12C3E2",
  "#5712E2",
  "#99E212",
  "#E21249",
  "#E28B12",
  "#E2CA12",
];

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

  console.log({ user });

  let player = await getPlayerByDiscordId(must(user?.id));

  if (!player) {
    player = await createPlayer({
      discordID: must(user?.id),
      name: user?.global_name ?? "Anonymous",
      color: COLORS[randInt(COLORS.length)],
    });
  }

  console.log(player);

  const jwtPayload = {
    sub: player.id,
    iat: Math.floor(Date.now() / 1000),
  };
  const jwt = await new SignJWT(jwtPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30days")
    .sign(new TextEncoder().encode(must(process.env.ZERO_AUTH_SECRET)));

  setCookie(c, "jwt", jwt, {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  return c.redirect("/");
});

function must<T>(val: T) {
  if (!val) {
    throw new Error("Expected value to be defined");
  }
  return val;
}

export default handle(app);
