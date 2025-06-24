// convex/chat.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

/* ──────────────────────────────────────────────────────
 * Workspaces & Memberships
 * ──────────────────────────────────────────────────── */

export const createWorkspace = mutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not signed in");

    const workspaceId = await ctx.db.insert("workspaces", {
      name,
      ownerId: userId,
      createdAt: Date.now(),
    });

    await ctx.db.insert("memberships", {
      workspaceId,
      userId,
      roles: ["owner"],
    });

    return workspaceId;
  },
});

// ✅ Fixed: Read-only query - no insertions
export const listWorkspaces = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    
    // Get all workspaces
    return await ctx.db.query("workspaces").collect();
  },
});

// ✅ New mutation to join workspace
export const joinWorkspace = mutation({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, { workspaceId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not signed in");

    const isMember = await ctx.db
      .query("memberships")
      .withIndex("by_workspace", (q) => 
        q.eq("workspaceId", workspaceId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .unique();
    
    if (!isMember) {
      await ctx.db.insert("memberships", {
        workspaceId,
        userId,
        roles: ["member"],
      });
    }
  },
});

/* ──────────────────────────────────────────────────────
 * Channels & Channel Membership
 * ──────────────────────────────────────────────────── */

export const createChannel = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    isPrivate: v.boolean(),
  },
  handler: async (ctx, { workspaceId, name, isPrivate }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not signed in");

    // Must be a member of the workspace
    const member = await ctx.db
      .query("memberships")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .unique();
    if (!member) throw new Error("Not a member of this workspace");

    const channelId = await ctx.db.insert("channels", {
      workspaceId,
      name,
      isPrivate,
      isDM: false,
      createdBy: userId,
      createdAt: Date.now(),
    });

    // Creator joins automatically
    await ctx.db.insert("channelMembers", { channelId, userId });

    return channelId;
  },
});

// ✅ Fixed: Read-only query
export const listChannels = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, { workspaceId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    
    // Get all channels in the workspace
    return await ctx.db
      .query("channels")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .collect();
  },
});

// ✅ New mutation to join channel
export const joinChannel = mutation({
  args: { channelId: v.id("channels") },
  handler: async (ctx, { channelId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not signed in");

    const channel = await ctx.db.get(channelId);
    if (!channel) throw new Error("Channel not found");

    // Only join public channels automatically
    if (!channel.isPrivate && !channel.isDM) {
      const isMember = await ctx.db
        .query("channelMembers")
        .withIndex("by_channel", (q) => q.eq("channelId", channelId))
        .filter((q) => q.eq(q.field("userId"), userId))
        .unique();
      
      if (!isMember) {
        await ctx.db.insert("channelMembers", {
          channelId,
          userId,
        });
      }
    }
  },
});

export const ensureGeneralChannel = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not signed in");

    // Look for the global "General" workspace
    let workspace = await ctx.db
      .query("workspaces")
      .filter((q) => q.eq(q.field("name"), "General"))
      .first();

    if (!workspace) {
      // Create the global workspace
      const workspaceId = await ctx.db.insert("workspaces", {
        name: "General",
        ownerId: userId,
        createdAt: Date.now(),
      });
      workspace = await ctx.db.get(workspaceId);
    }

    // Ensure user is a member of the workspace
    const isMember = await ctx.db
      .query("memberships")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace!._id))
      .filter((q) => q.eq(q.field("userId"), userId))
      .unique();

    if (!isMember) {
      await ctx.db.insert("memberships", {
        workspaceId: workspace!._id,
        userId,
        roles: ["member"],
      });
    }

    // Look for the general channel
    let channel = await ctx.db
      .query("channels")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace!._id))
      .filter((q) => q.eq(q.field("name"), "general"))
      .first();

    if (!channel) {
      // Create the general channel
      const channelId = await ctx.db.insert("channels", {
        workspaceId: workspace!._id,
        name: "general",
        isPrivate: false,
        isDM: false,
        createdBy: userId,
        createdAt: Date.now(),
      });
      channel = await ctx.db.get(channelId);
    }

    // Ensure user is a member of the channel
    const isChannelMember = await ctx.db
      .query("channelMembers")
      .withIndex("by_channel", (q) => q.eq("channelId", channel!._id))
      .filter((q) => q.eq(q.field("userId"), userId))
      .unique();

    if (!isChannelMember) {
      await ctx.db.insert("channelMembers", {
        channelId: channel!._id,
        userId,
      });
    }

    return channel!._id;
  },
});

/* ──────────────────────────────────────────────────────
 * Messages
 * ──────────────────────────────────────────────────── */

export const sendMessage = mutation({
  args: {
    channelId: v.id("channels"),
    text: v.string(),
    parentId: v.optional(v.id("messages")),
  },
  handler: async (ctx, { channelId, text, parentId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not signed in");

    // Simple membership check for private channels
    const channel = await ctx.db.get(channelId);
    if (!channel) throw new Error("Channel not found");
    if (channel.isPrivate) {
      const mem = await ctx.db
        .query("channelMembers")
        .withIndex("by_channel", (q) => q.eq("channelId", channelId))
        .filter((q) => q.eq(q.field("userId"), userId))
        .unique();
      if (!mem) throw new Error("Not in channel");
    }

    return await ctx.db.insert("messages", {
      channelId,
      authorId: userId,
      text,
      parentId,
      createdAt: Date.now(),
      editedAt: undefined,
      deleted: false,
    });
  },
});

export const listMessages = query({
  args: { channelId: v.id("channels") },
  handler: async (ctx, { channelId }) => {
    return ctx.db
      .query("messages")
      .withIndex("by_channel", (q) => q.eq("channelId", channelId))
      .order("asc")
      .collect();
  },
});

export const editMessage = mutation({
  args: { messageId: v.id("messages"), newText: v.string() },
  handler: async (ctx, { messageId, newText }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not signed in");
    
    const msg = await ctx.db.get(messageId);
    if (!msg) throw new Error("Message not found");
    if (msg.authorId !== userId) throw new Error("Cannot edit others' messages");

    await ctx.db.patch(messageId, {
      text: newText,
      editedAt: Date.now(),
    });
  },
});

export const deleteMessage = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, { messageId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not signed in");
    
    const msg = await ctx.db.get(messageId);
    if (!msg) throw new Error("Message not found");
    if (msg.authorId !== userId) throw new Error("Cannot delete others' messages");

    await ctx.db.patch(messageId, { deleted: true });
  },
});

/* ──────────────────────────────────────────────────────
 * Reactions
 * ──────────────────────────────────────────────────── */

export const addReaction = mutation({
  args: { messageId: v.id("messages"), emoji: v.string() },
  handler: async (ctx, { messageId, emoji }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not signed in");

    // Check if user already reacted with this emoji
    const existing = await ctx.db
      .query("reactions")
      .withIndex("by_message_emoji", (q) =>
        q.eq("messageId", messageId).eq("emoji", emoji)
      )
      .filter((q) => q.eq(q.field("userId"), userId))
      .unique();

    if (existing) {
      // Remove reaction if it exists
      await ctx.db.delete(existing._id);
    } else {
      // Add reaction if it doesn't exist
      await ctx.db.insert("reactions", { messageId, userId, emoji });
    }
  },
});

export const removeReaction = mutation({
  args: { messageId: v.id("messages"), emoji: v.string() },
  handler: async (ctx, { messageId, emoji }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not signed in");
    
    const row = await ctx.db
      .query("reactions")
      .withIndex("by_message_emoji", (q) =>
        q.eq("messageId", messageId).eq("emoji", emoji)
      )
      .filter((q) => q.eq(q.field("userId"), userId))
      .unique();
    
    if (row) await ctx.db.delete(row._id);
  },
});

export const getMessageReactions = query({
  args: { messageId: v.id("messages") },
  handler: async (ctx, { messageId }) => {
    return ctx.db
      .query("reactions")
      .withIndex("by_message", (q) => q.eq("messageId", messageId))
      .collect();
  },
});

/* ──────────────────────────────────────────────────────
 * User Management & Profiles
 * ──────────────────────────────────────────────────── */

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db.get(userId);
  },
});

export const getUsersInChannel = query({
  args: { channelId: v.id("channels") },
  handler: async (ctx, { channelId }) => {
    // Get all messages in the channel
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_channel", (q) => q.eq("channelId", channelId))
      .collect();

    // Get unique author IDs
    const authorIds = [...new Set(messages.map(m => m.authorId))];
    
    // Fetch user profiles for all authors
    const users = await Promise.all(
      authorIds.map(async (authorId) => {
        const user = await ctx.db.get(authorId);
        return {
          id: authorId,
          name: user?.name || user?.email || `User ${authorId.slice(-4)}`,
          email: user?.email,
        };
      })
    );

    // Return as a map for easy lookup
    const userMap: Record<string, { name: string; email?: string }> = {};
    users.forEach(user => {
      if (user) {
        userMap[user.id] = { name: user.name, email: user.email };
      }
    });

    return userMap;
  },
});

/* ──────────────────────────────────────────────────────
 * Presence & Online Status
 * ──────────────────────────────────────────────────── */

export const updatePresence = mutation({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, { workspaceId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return;

    const existing = await ctx.db
      .query("presence")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { lastSeen: Date.now() });
    } else {
      await ctx.db.insert("presence", {
        workspaceId,
        userId,
        lastSeen: Date.now(),
      });
    }
  },
});

export const getOnlineUsers = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, { workspaceId }) => {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000; // 5 minutes
    
    const recentPresence = await ctx.db
      .query("presence")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .filter((q) => q.gte(q.field("lastSeen"), fiveMinutesAgo))
      .collect();

    const userIds = recentPresence.map(p => p.userId);
    const users = await Promise.all(
      userIds.map(async (userId) => {
        const user = await ctx.db.get(userId);
        return {
          id: userId,
          name: user?.name,
          email: user?.email,
        };
      })
    );

    return users.filter(Boolean);
  },
});

/* ──────────────────────────────────────────────────────
 * Direct Messages (Basic Implementation)
 * ──────────────────────────────────────────────────── */

export const createDirectMessage = mutation({
  args: { targetUserId: v.id("users"), workspaceId: v.id("workspaces") },
  handler: async (ctx, { targetUserId, workspaceId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not signed in");

    if (userId === targetUserId) {
      throw new Error("Cannot create DM with yourself");
    }

    // Check if DM channel already exists
    const existingDM = await ctx.db
      .query("channels")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .filter((q) => q.eq(q.field("isDM"), true))
      .collect();

    // Check if any existing DM has both users as members
    for (const dm of existingDM) {
      const members = await ctx.db
        .query("channelMembers")
        .withIndex("by_channel", (q) => q.eq("channelId", dm._id))
        .collect();
      
      const memberIds = members.map(m => m.userId);
      if (memberIds.includes(userId) && memberIds.includes(targetUserId) && memberIds.length === 2) {
        return dm._id; // Return existing DM
      }
    }

    // Create new DM channel
    const channelId = await ctx.db.insert("channels", {
      workspaceId,
      name: "Direct Message",
      isPrivate: true,
      isDM: true,
      createdBy: userId,
      createdAt: Date.now(),
    });

    // Add both users as members
    await ctx.db.insert("channelMembers", { channelId, userId });
    await ctx.db.insert("channelMembers", { channelId, userId: targetUserId });

    return channelId;
  },
});
