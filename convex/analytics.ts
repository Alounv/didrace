import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getUserFromToken, requireAuth } from "./auth";
import { Id } from "./_generated/dataModel";
import { TypedWord } from "../src/types";

export const getPlayerTypedWords = query({
  args: {
    playerId: v.optional(v.id("players")),
    raceId: v.optional(v.id("races")),
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userID = await getUserFromToken(args.token);
    const playerId = args.playerId ?? (userID as Id<"players">);

    if (!playerId) {
      return [];
    }

    let query = ctx.db
      .query("typedWords")
      .withIndex("by_player", (q) => q.eq("playerID", playerId));

    if (args.raceId) {
      query = ctx.db
        .query("typedWords")
        .withIndex("by_player_race", (q) =>
          q.eq("playerID", playerId).eq("raceID", args.raceId!),
        );
    }

    return await query.collect();
  },
});

export const addTypedWord = mutation({
  args: {
    raceId: v.id("races"),
    word: v.string(),
    duration: v.number(),
    hadError: v.boolean(),
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userID = await getUserFromToken(args.token);
    requireAuth(userID);

    const typedWordId = await ctx.db.insert("typedWords", {
      playerID: userID as Id<"players">,
      raceID: args.raceId!,
      word: args.word,
      duration: args.duration,
      hadError: args.hadError,
      timestamp: Date.now(),
    });

    return typedWordId;
  },
});

export const getRaceAnalytics = query({
  args: {
    raceId: v.id("races"),
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userID = await getUserFromToken(args.token);
    requireAuth(userID);

    const typedWords = await ctx.db
      .query("typedWords")
      .withIndex("by_race", (q) => q.eq("raceID", args.raceId))
      .collect();

    // Group by player
    const playerStats = typedWords.reduce(
      (acc, word) => {
        if (!acc[word.playerID]) {
          acc[word.playerID] = {
            totalWords: 0,
            totalDuration: 0,
            totalErrors: 0,
            words: [],
          };
        }

        acc[word.playerID].totalWords++;
        acc[word.playerID].totalDuration += word.duration;
        if (word.hadError) acc[word.playerID].totalErrors++;
        acc[word.playerID].words.push(word);

        return acc;
      },
      {} as Record<
        string,
        {
          totalWords: number;
          totalDuration: number;
          totalErrors: number;
          words: TypedWord[];
        }
      >,
    );

    return playerStats;
  },
});
