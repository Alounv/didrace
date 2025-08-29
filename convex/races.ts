import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getUserFromToken, requireAuth } from "./auth";
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
      .filter((q) => q.neq(q.field("playerID"), null))
      .collect();

    // Populate player data at query level using map
    const playerRacesWithPlayers = [];
    for (const playerRace of playerRaces) {
      const player = await ctx.db.get(playerRace.playerID);
      if (player) {
        playerRacesWithPlayers.push({
          ...playerRace,
          player,
        });
      }
    }

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
    progress: v.optional(v.number()),
    start: v.optional(v.number()),
    end: v.optional(v.number()),
    effect: v.optional(
      v.union(
        v.literal("stuned"),
        v.literal("poisoned"),
        v.literal("faded"),
        v.null(),
      ),
    ),
    item: v.optional(
      v.union(
        v.literal("missile"),
        v.literal("blob"),
        v.literal("fader"),
        v.null(),
      ),
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
      ...(args.progress ? { progress: args.progress } : {}),
      ...(args.start ? { start: args.start } : {}),
      ...(args.end ? { end: args.end } : {}),
      ...(args.effect ? { effect: args.effect } : {}),
      ...(args.item ? { item: args.item } : {}),
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
        q.eq("playerID", userID as Id<"players">).eq("raceID", args.raceId),
      )
      .first();

    if (playerRace) {
      await ctx.db.delete(playerRace._id);
    }

    const playerRaces = await ctx.db
      .query("playerRaces")
      .withIndex("by_race", (q) => q.eq("raceID", args.raceId))
      .collect();

    if (!playerRaces.length) {
      await ctx.db.patch(args.raceId, { status: "finished" });
      const race = await ctx.db
        .query("races")
        .withIndex("by_id", (q) => q.eq("_id", args.raceId))
        .first();

      if (race?.nextRaceID) {
        await ctx.db.delete(race?.nextRaceID);
      }
    }
  },
});

export const applyEffectToPlayer = mutation({
  args: {
    raceId: v.id("races"),
    targetPlayerID: v.id("players"),
    effect: v.union(
      v.literal("stuned"),
      v.literal("poisoned"),
      v.literal("faded"),
    ),
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userID = await getUserFromToken(args.token);
    requireAuth(userID);

    // Find the target player's race entry
    const targetPlayerRace = await ctx.db
      .query("playerRaces")
      .withIndex("by_player_race", (q) =>
        q.eq("playerID", args.targetPlayerID).eq("raceID", args.raceId),
      )
      .first();

    if (targetPlayerRace) {
      await ctx.db.patch(targetPlayerRace._id, {
        effect: args.effect,
      });
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
