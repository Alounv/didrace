import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import { createJWT } from "./auth";

export const discordOAuth = httpAction(async (ctx, request) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  // If no code, redirect to Discord OAuth
  if (!code) {
    const state = Math.random().toString(36).substring(7);
    const scope = "identify email";
    
    const discordAuthUrl = new URL("https://discord.com/api/oauth2/authorize");
    discordAuthUrl.searchParams.set("client_id", process.env.DISCORD_CLIENT_ID!);
    discordAuthUrl.searchParams.set("redirect_uri", `${process.env.VITE_PUBLIC_SERVER || "http://localhost:5173"}/api/discord`);
    discordAuthUrl.searchParams.set("response_type", "code");
    discordAuthUrl.searchParams.set("scope", scope);
    discordAuthUrl.searchParams.set("state", state);

    return new Response(null, {
      status: 302,
      headers: {
        Location: discordAuthUrl.toString(),
      },
    });
  }

  try {
    // Exchange code for Discord user info (you'll need to implement this)
    const discordUser = await exchangeCodeForUser(code);

    // Check if player exists
    let player = await ctx.runQuery(api.players.getPlayerByDiscordId, {
      discordID: discordUser.id,
    });

    // Create player if doesn't exist
    if (!player) {
      const playerId = await ctx.runMutation(api.players.createPlayer, {
        discordID: discordUser.id,
        name: discordUser.global_name ?? "Anonymous",
        avatar: discordUser.avatar
          ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
          : undefined,
        color: discordUser.accent_color
          ? `#${discordUser.accent_color.toString(16)}`
          : undefined,
      });

      player = { _id: playerId };
    }

    // Update last login
    await ctx.runMutation(api.players.updatePlayerLastLogin, {
      playerId: player._id,
    });

    // Create JWT
    const jwt = await createJWT(player._id);

    // Set cookie and redirect
    const response = new Response(null, {
      status: 302,
      headers: {
        Location: "/",
        "Set-Cookie": `jwt=${jwt}; HttpOnly; Path=/; Max-Age=${30 * 24 * 60 * 60}; SameSite=Lax`,
      },
    });

    return response;
  } catch (error) {
    return new Response("Authentication failed", { status: 500 });
  }
});

export const guestLogin = httpAction(async (ctx, request) => {
  console.log("=========");
  try {
    const guestId = await ctx.runQuery(api.players.getLastGuest, {});

    if (!guestId) {
      return new Response("No guest accounts available", { status: 404 });
    }

    // Update last login
    await ctx.runMutation(api.players.updatePlayerLastLogin, {
      playerId: guestId,
    });

    // Create JWT
    const jwt = await createJWT(guestId);

    // Set cookie and redirect
    const response = new Response(null, {
      status: 302,
      headers: {
        Location: "/",
        "Set-Cookie": `jwt=${jwt}; HttpOnly; Path=/; Max-Age=${30 * 24 * 60 * 60}; SameSite=Lax`,
      },
    });

    return response;
  } catch (error) {
    return new Response("Guest login failed", { status: 500 });
  }
});

// Helper function - you'll need to implement Discord OAuth exchange
async function exchangeCodeForUser(code: string) {
  const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID!,
      client_secret: process.env.DISCORD_CLIENT_SECRET!,
      code,
      grant_type: "authorization_code",
      redirect_uri: `${process.env.VITE_PUBLIC_SERVER || "http://localhost:5173"}/api/discord`,
      scope: "identify email",
    }),
  });

  const tokenData = await tokenResponse.json();

  const userResponse = await fetch("https://discord.com/api/users/@me", {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
    },
  });

  return await userResponse.json();
}
