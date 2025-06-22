import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: { country: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.country) {
      return await ctx.db.query("programs")
        .withIndex("by_country", (q) => q.eq("country", args.country!))
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();
    }
    
    return await ctx.db.query("programs")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("programs") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getCountries = query({
  args: {},
  handler: async (ctx) => {
    const programs = await ctx.db.query("programs").withIndex("by_active", (q) => q.eq("isActive", true)).collect();
    const countries = [...new Set(programs.map(p => p.country))];
    return countries.sort();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    university: v.string(),
    country: v.string(),
    degree: v.string(),
    duration: v.string(),
    applicationDeadline: v.string(),
    requirements: v.array(v.string()),
    benefits: v.array(v.string()),
    eligibility: v.array(v.string()),
    maxApplicants: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if user is admin
    const profile = await ctx.db.query("userProfiles").withIndex("by_user", (q) => q.eq("userId", userId)).first();
    if (!profile?.isAdmin) throw new Error("Not authorized");

    return await ctx.db.insert("programs", {
      ...args,
      isActive: true,
      currentApplicants: 0,
    });
  },
});
