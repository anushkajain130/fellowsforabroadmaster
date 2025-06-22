import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db.query("userProfiles").withIndex("by_user", (q) => q.eq("userId", userId)).first();
    const user = await ctx.db.get(userId);
    
    return { user, profile };
  },
});

export const createOrUpdateProfile = mutation({
  args: {
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    phone: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    nationality: v.optional(v.string()),
    address: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existingProfile = await ctx.db.query("userProfiles").withIndex("by_user", (q) => q.eq("userId", userId)).first();

    if (existingProfile) {
      await ctx.db.patch(existingProfile._id, args);
      return existingProfile._id;
    } else {
      return await ctx.db.insert("userProfiles", {
        userId,
        ...args,
        isAdmin: false,
      });
    }
  },
});

export const getNotifications = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db.query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(20);
  },
});

export const markNotificationRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const notification = await ctx.db.get(args.notificationId);
    if (!notification || notification.userId !== userId) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.notificationId, { isRead: true });
  },
});
