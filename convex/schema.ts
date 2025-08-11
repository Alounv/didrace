import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  players: defineTable({
    discordID: v.optional(v.string()),
    avatar: v.optional(v.string()),
    color: v.string(),
    name: v.string(),
    lastLogin: v.optional(v.number()),
  }).index("by_discord_id", ["discordID"]),

  quotes: defineTable({
    body: v.string(),
    source: v.string(),
  }),

  races: defineTable({
    quoteID: v.id("quotes"),
    authorID: v.id("players"),
    status: v.union(
      v.literal("ready"),
      v.literal("starting"), 
      v.literal("started"),
      v.literal("finished"),
      v.literal("cancelled")
    ),
    nextRaceID: v.optional(v.id("races")),
    timestamp: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_author", ["authorID"]),

  playerRaces: defineTable({
    playerID: v.id("players"),
    raceID: v.id("races"),
    progress: v.number(),
    start: v.optional(v.number()), // null means the player never started typing
    end: v.optional(v.number()), // null means the player did not finish the race
    effect: v.optional(v.union(
      v.literal("stuned"),
      v.literal("poisoned"), 
      v.literal("faded")
    )),
    item: v.optional(v.union(
      v.literal("missile"),
      v.literal("blob"),
      v.literal("fader")
    )),
  })
    .index("by_player", ["playerID"])
    .index("by_race", ["raceID"])
    .index("by_player_race", ["playerID", "raceID"]),

  // This data should only be used for analytics never during a race itself
  typedWords: defineTable({
    playerID: v.id("players"),
    raceID: v.id("races"),
    word: v.string(),
    duration: v.number(),
    hadError: v.boolean(),
    timestamp: v.number(),
  })
    .index("by_player", ["playerID"])
    .index("by_race", ["raceID"])
    .index("by_player_race", ["playerID", "raceID"]),
});