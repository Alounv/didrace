// import { Hono } from "hono";
// import { handle } from "hono/vercel";
// import { SignJWT } from "jose";
// import * as dotenv from "dotenv";
// import { discordAuth } from "@hono/oauth-providers/discord";
// import { setCookie } from "hono/cookie";
// import { ConvexHttpClient } from "convex/browser";
// import { api } from "../convex/_generated/api.js";

// // --- Env ---

// dotenv.config({ path: ".env" });

// // --- Convex Client ---

// const convex = new ConvexHttpClient(process.env.CONVEX_URL);

// // --- Hono ---

// export const app = new Hono().basePath("/api");

// app.use(
//   "/discord",
//   discordAuth({
//     client_id: process.env.DISCORD_CLIENT_ID,
//     client_secret: process.env.DISCORD_CLIENT_SECRET,
//     scope: ["identify", "email"],
//   }),
// );

// app.get("/discord", async (c) => {
//   // const token = c.get("token");
//   // const refreshToken = c.get("refresh-token");
//   // const grantedScopes = c.get("granted-scopes");
//   const user = c.get("user-discord");

//   let player = await getPlayerByDiscordId(must(user?.id));

//   if (!player) {
//     player = await createPlayer({
//       discordID: must(user?.id),
//       name: user?.global_name ?? "Anonymous",
//       avatar: user?.avatar
//         ? `https://cdn.discordapp.com/avatars/${user?.id}/${user?.avatar}.png`
//         : null,
//       color: user?.accent_color ?? null,
//     });
//   }

//   setJWT({ c, sub: player._id });

//   await updatePlayerLastLogin(player._id);

//   // Sleep for a second to make sure the JWT is set
//   await sleep(500);

//   return c.redirect("/");
// });

// app.get("/guest", async (c) => {
//   const guestID = await getLastGuest();

//   setJWT({ c, sub: guestID });

//   await updatePlayerLastLogin(guestID);

//   // Sleep for a second to make sure the JWT is set
//   await sleep(500);

//   return c.redirect("/");
// });

// // --- Utils ---

// function must(val) {
//   if (!val) {
//     throw new Error("Expected value to be defined");
//   }
//   return val;
// }

// async function sleep(ms) {
//   await new Promise((resolve) => setTimeout(resolve, ms));
// }

// // --- JWT ---

// async function setJWT({ c, sub }) {
//   const jwtPayload = {
//     sub,
//     iat: Math.floor(Date.now() / 1000),
//   };

//   const jwt = await new SignJWT(jwtPayload)
//     .setProtectedHeader({ alg: "HS256" })
//     .setExpirationTime("30days")
//     .sign(new TextEncoder().encode(must(process.env.ZERO_AUTH_SECRET || process.env.JWT_SECRET)));

//   setCookie(c, "jwt", jwt, {
//     expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
//   });
// }

// // --- Convex Actions ---

// async function updatePlayerLastLogin(playerID) {
//   await convex.mutation(api.players.updatePlayerLastLogin, {
//     playerId: playerID,
//   });
// }

// async function getPlayerByDiscordId(discordID) {
//   const player = await convex.query(api.players.getPlayerByDiscordId, {
//     discordID,
//   });
//   return player;
// }

// async function getLastGuest() {
//   const guestId = await convex.query(api.players.getLastGuest, {});
//   return guestId;
// }

// async function createPlayer(player) {
//   const playerId = await convex.mutation(api.players.createPlayer, {
//     discordID: player.discordID,
//     name: player.name,
//     avatar: player.avatar,
//     color: player.color,
//   });

//   // Return a player object with the ID for compatibility
//   const createdPlayer = await convex.query(api.players.getPlayer, {
//     playerId,
//   });

//   return createdPlayer;
// }

// // -- Exports ---

// const handler = handle(app);

// export const GET = handler;
// export const POST = handler;
// export const PATCH = handler;
// export const PUT = handler;
// export const OPTIONS = handler;
