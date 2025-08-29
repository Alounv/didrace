import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getHasQuotes = query({
  args: {},
  handler: async (ctx) => {
    const first = await ctx.db.query("quotes").first();
    return !!first;
  },
});

export const getQuote = query({
  args: { quoteId: v.id("quotes") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.quoteId);
  },
});

export const initializeQuotes = mutation({
  args: {
    quotesData: v.array(
      v.object({
        text: v.string(),
        source: v.string(),
        id: v.number(),
        length: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    // Check if quotes already exist
    const existingQuotes = await ctx.db.query("quotes").first();
    if (existingQuotes) {
      throw new Error("Quotes already initialized");
    }

    // Insert quotes in batches to improve performance
    const BATCH_SIZE = 10;
    let insertedCount = 0;

    for (let i = 0; i < args.quotesData.length; i += BATCH_SIZE) {
      const batch = args.quotesData.slice(i, i + BATCH_SIZE);

      // Process batch in parallel
      await Promise.all(
        batch.map((quote) =>
          ctx.db.insert("quotes", {
            body: quote.text,
            source: quote.source,
          }),
        ),
      );

      insertedCount += batch.length;
    }

    return { success: true, count: insertedCount };
  },
});
