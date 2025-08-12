import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAllQuotes = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("quotes").collect();
  },
});

export const getQuote = query({
  args: { quoteId: v.id("quotes") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.quoteId);
  },
});

export const createQuote = mutation({
  args: {
    body: v.string(),
    source: v.string(),
  },
  handler: async (ctx, args) => {
    const quoteId = await ctx.db.insert("quotes", {
      body: args.body,
      source: args.source,
    });

    return quoteId;
  },
});

export const getRandomQuotes = query({
  args: {
    excludeId: v.optional(v.id("quotes")),
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const quotes = await ctx.db.query("quotes").collect();
    const filtered = args.excludeId
      ? quotes.filter((q) => q._id !== args.excludeId)
      : quotes;
    return filtered.sort(() => Math.random() - 0.5);
  },
});

export const initializeQuotes = mutation({
  args: {
    quotesData: v.array(
      v.object({
        text: v.string(),
        source: v.string(),
        id: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    // Check if quotes already exist
    const existingQuotes = await ctx.db.query("quotes").first();
    if (existingQuotes) {
      throw new Error("Quotes already initialized");
    }

    // Insert all quotes from the provided data
    let insertedCount = 0;
    for (const quote of args.quotesData) {
      await ctx.db.insert("quotes", {
        body: quote.text,
        source: quote.source,
      });
      insertedCount++;

      // Add a small batch limit to prevent timeouts
      if (insertedCount >= 100) {
        break;
      }
    }

    return { success: true, count: insertedCount };
  },
});
