import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// 🟢 Fetch current code for a session
export const getCode = query({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const record = await ctx.db
      .query("codeSessions")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first();

    return record;
  },
});

// 🟡 Update or create code for a session
export const updateCode = mutation({
  args: {
    sessionId: v.string(),
    code: v.string(),
    language: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("codeSessions")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        code: args.code,
        language: args.language,
      });
    } else {
      await ctx.db.insert("codeSessions", {
        sessionId: args.sessionId,
        code: args.code,
        language: args.language,
      });
    }
  },
});
