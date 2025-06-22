import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getByBlog = query({
  args: { blogId: v.id("blogs") },
  handler: async (ctx, args) => {
    const comments = await ctx.db.query("comments")
      .withIndex("by_blog", (q) => q.eq("blogId", args.blogId))
      .order("asc")
      .collect();

    // Get author information for each comment
    const commentsWithAuthors = await Promise.all(
      comments.map(async (comment) => {
        const author = await ctx.db.get(comment.authorId);
        const profile = await ctx.db.query("userProfiles")
          .withIndex("by_user", (q) => q.eq("userId", comment.authorId))
          .first();
        
        return {
          ...comment,
          author: {
            name: profile?.firstName && profile?.lastName 
              ? `${profile.firstName} ${profile.lastName}`
              : author?.email?.split('@')[0] || "Anonymous",
            email: author?.email
          }
        };
      })
    );

    return commentsWithAuthors;
  },
});

export const create = mutation({
  args: {
    blogId: v.id("blogs"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if blog exists
    const blog = await ctx.db.get(args.blogId);
    if (!blog) throw new Error("Blog not found");

    return await ctx.db.insert("comments", {
      blogId: args.blogId,
      authorId: userId,
      content: args.content,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("comments"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const comment = await ctx.db.get(args.id);
    if (!comment) throw new Error("Comment not found");

    // Check if user is author or admin
    const profile = await ctx.db.query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    
    if (comment.authorId !== userId && !profile?.isAdmin) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.id, {
      content: args.content,
      updatedAt: Date.now(),
    });
  },
});

export const delete_ = mutation({
  args: { id: v.id("comments") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const comment = await ctx.db.get(args.id);
    if (!comment) throw new Error("Comment not found");

    // Check if user is author or admin
    const profile = await ctx.db.query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    
    if (comment.authorId !== userId && !profile?.isAdmin) {
      throw new Error("Not authorized");
    }

    await ctx.db.delete(args.id);
  },
});
