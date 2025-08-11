import { api } from "../../convex/_generated/api";
import convex from "../convex";
import { createJWT } from "./jwt";

// Discord OAuth configuration
const DISCORD_CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID || "1333908942090145865";
const DISCORD_CLIENT_SECRET = import.meta.env.VITE_DISCORD_CLIENT_SECRET || "yWcIM_ZpRaU1dGSQFVgJBPcYWWNwU5EK";
const DISCORD_REDIRECT_URI = `${window.location.origin}/auth/discord/callback`;

export function redirectToDiscordOAuth() {
  const state = Math.random().toString(36).substring(7);
  const scope = "identify email";
  
  // Store state in sessionStorage to verify later
  sessionStorage.setItem('discord_oauth_state', state);
  
  const discordAuthUrl = new URL("https://discord.com/api/oauth2/authorize");
  discordAuthUrl.searchParams.set("client_id", DISCORD_CLIENT_ID);
  discordAuthUrl.searchParams.set("redirect_uri", DISCORD_REDIRECT_URI);
  discordAuthUrl.searchParams.set("response_type", "code");
  discordAuthUrl.searchParams.set("scope", scope);
  discordAuthUrl.searchParams.set("state", state);

  window.location.href = discordAuthUrl.toString();
}

export async function handleDiscordCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");
  const state = urlParams.get("state");
  const error = urlParams.get("error");

  if (error) {
    throw new Error(`Discord OAuth error: ${error}`);
  }

  if (!code) {
    throw new Error("No authorization code received from Discord");
  }

  // Verify state to prevent CSRF attacks
  const storedState = sessionStorage.getItem('discord_oauth_state');
  if (state !== storedState) {
    throw new Error("Invalid state parameter");
  }

  // Clean up stored state
  sessionStorage.removeItem('discord_oauth_state');

  try {
    // Exchange code for access token
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: DISCORD_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange code for token");
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Get user info from Discord
    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error("Failed to get user info from Discord");
    }

    const discordUser = await userResponse.json();

    // Find or create player in Convex
    let player = await convex.query(api.players.getPlayerByDiscordId, {
      discordID: discordUser.id,
    });

    if (!player) {
      // Create new player
      const playerId = await convex.mutation(api.players.createPlayer, {
        discordID: discordUser.id,
        name: discordUser.global_name || discordUser.username || "Discord User",
        avatar: discordUser.avatar
          ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
          : undefined,
        color: discordUser.accent_color 
          ? `#${discordUser.accent_color.toString(16).padStart(6, '0')}` 
          : undefined,
      });

      player = await convex.query(api.players.getPlayer, {
        playerId,
      });
    } else {
      // Update last login for existing player
      await convex.mutation(api.players.updatePlayerLastLogin, {
        playerId: player._id,
      });
    }

    // Create JWT and store in cookie
    const jwt = await createJWT(player!._id);
    
    // Set JWT cookie
    document.cookie = `jwt=${jwt}; path=/; max-age=${30 * 24 * 60 * 60}; samesite=lax`;
    
    // Redirect to home
    window.location.href = "/";
    
    return player;
  } catch (error) {
    console.error("Discord authentication failed:", error);
    throw error;
  }
}