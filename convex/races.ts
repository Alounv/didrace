import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getUserFromToken, requireAuth } from "./auth";
import { Player } from "../src/types";
import { Id } from "./_generated/dataModel";

export const getRace = query({
  args: {
    raceId: v.id("races"),
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userID = await getUserFromToken(args.token);
    requireAuth(userID);

    const race = await ctx.db.get(args.raceId);
    if (!race) return null;

    // Get related data
    const quote = await ctx.db.get(race.quoteID);
    const author = await ctx.db.get(race.authorID);

    return {
      ...race,
      quote,
      author,
    };
  },
});

export const getRacesByStatus = query({
  args: {
    status: v.union(
      v.literal("ready"),
      v.literal("starting"),
      v.literal("started"),
      v.literal("finished"),
      v.literal("cancelled"),
    ),
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userID = await getUserFromToken(args.token);
    requireAuth(userID);

    return await ctx.db
      .query("races")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

export const createRace = mutation({
  args: {
    quoteID: v.id("quotes"),
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userID = await getUserFromToken(args.token);
    requireAuth(userID);

    const raceId = await ctx.db.insert("races", {
      quoteID: args.quoteID,
      authorID: userID as Id<"players">,
      status: "ready",
      timestamp: Date.now(),
    });

    return raceId;
  },
});

export const updateRaceStatus = mutation({
  args: {
    raceId: v.id("races"),
    status: v.union(
      v.literal("ready"),
      v.literal("starting"),
      v.literal("started"),
      v.literal("finished"),
      v.literal("cancelled"),
    ),
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userID = await getUserFromToken(args.token);
    requireAuth(userID);

    await ctx.db.patch(args.raceId, {
      status: args.status,
    });
  },
});

export const getPlayerRaces = query({
  args: {
    raceId: v.id("races"),
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userID = await getUserFromToken(args.token);
    requireAuth(userID);

    const playerRaces = await ctx.db
      .query("playerRaces")
      .withIndex("by_race", (q) => q.eq("raceID", args.raceId))
      .collect();

    // Get player info for each player race
    const playerRacesWithPlayers = await Promise.all(
      playerRaces.map(async (pr) => {
        const player = await ctx.db.get(pr.playerID);
        return {
          ...pr,
          player,
        };
      }),
    );

    return playerRacesWithPlayers;
  },
});

export const joinRace = mutation({
  args: {
    raceId: v.id("races"),
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userID = await getUserFromToken(args.token);
    requireAuth(userID);

    // Check if player is already in this race
    const existing = await ctx.db
      .query("playerRaces")
      .withIndex("by_player_race", (q) =>
        q.eq("playerID", userID as Id<"players">).eq("raceID", args.raceId),
      )
      .first();

    if (existing) {
      return existing._id;
    }

    // Join the race
    const playerRaceId = await ctx.db.insert("playerRaces", {
      playerID: userID as Id<"players">,
      raceID: args.raceId,
      progress: 0,
    });

    return playerRaceId;
  },
});

export const updatePlayerProgress = mutation({
  args: {
    raceId: v.id("races"),
    progress: v.number(),
    start: v.optional(v.number()),
    end: v.optional(v.number()),
    effect: v.optional(
      v.union(v.literal("stuned"), v.literal("poisoned"), v.literal("faded")),
    ),
    item: v.optional(
      v.union(v.literal("missile"), v.literal("blob"), v.literal("fader")),
    ),
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userID = await getUserFromToken(args.token);
    requireAuth(userID);

    const playerRace = await ctx.db
      .query("playerRaces")
      .withIndex("by_player_race", (q) =>
        q.eq("playerID", userID as Id<"players">).eq("raceID", args.raceId),
      )
      .first();

    if (!playerRace) {
      throw new Error("Player not in this race");
    }

    await ctx.db.patch(playerRace._id, {
      progress: args.progress,
      start: args.start,
      end: args.end,
      effect: args.effect,
      item: args.item,
    });
  },
});

export const leaveRace = mutation({
  args: {
    raceId: v.id("races"),
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userID = await getUserFromToken(args.token);
    requireAuth(userID);

    const playerRace = await ctx.db
      .query("playerRaces")
      .withIndex("by_player_race", (q) =>
        q.eq("playerID", userID as any).eq("raceID", args.raceId),
      )
      .first();

    if (playerRace) {
      await ctx.db.delete(playerRace._id);
    }
  },
});

export const setNextRaceID = mutation({
  args: {
    raceId: v.id("races"),
    nextRaceID: v.id("races"),
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userID = await getUserFromToken(args.token);
    requireAuth(userID);

    await ctx.db.patch(args.raceId, {
      nextRaceID: args.nextRaceID,
    });
  },
});
