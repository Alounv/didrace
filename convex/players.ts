import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { nanoid } from "nanoid";

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

export const getPlayerByDiscordId = query({
  args: { discordID: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("players")
      .withIndex("by_discord_id", (q) => q.eq("discordID", args.discordID))
      .first();
  },
});

export const getLastGuest = query({
  args: {},
  handler: async (ctx, args) => {
    const guest = await ctx.db
      .query("players")
      .withIndex("by_discord_id", (q) => q.eq("discordID", undefined))
      .order("asc")
      .first();
    
    return guest?._id;
  },
});

export const createPlayer = mutation({
  args: {
    discordID: v.optional(v.string()),
    name: v.string(),
    avatar: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const playerId = await ctx.db.insert("players", {
      discordID: args.discordID,
      name: args.name,
      avatar: args.avatar,
      color: args.color ?? randColor(),
      lastLogin: Date.now(),
    });
    
    return playerId;
  },
});

export const updatePlayerLastLogin = mutation({
  args: { playerId: v.id("players") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.playerId, {
      lastLogin: Date.now(),
    });
  },
});

export const getPlayer = query({
  args: { playerId: v.id("players") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.playerId);
  },
});