import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { query } from "./_generated/server";
import { getUserFromToken } from "./auth";

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
