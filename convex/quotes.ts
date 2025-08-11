import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAllQuotes = query({
  args: {},
  handler: async (ctx, args) => {
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