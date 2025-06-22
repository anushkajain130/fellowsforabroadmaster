import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: { 
    tag: v.optional(v.string()),
    limit: v.optional(v.number()),
    search: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const blogsQuery = ctx.db.query("blogs")
      .withIndex("by_published_date", (q) => q.eq("isPublished", true))
      .order("desc");

    const blogs = args.limit 
      ? await blogsQuery.take(args.limit)
      : await blogsQuery.collect();
    
    // Filter by tag if specified
    let filteredBlogs = args.tag 
      ? blogs.filter(blog => blog.tags.includes(args.tag!))
      : blogs;

    // Filter by search term if specified
    if (args.search) {
      const searchTerm = args.search.toLowerCase();
      filteredBlogs = filteredBlogs.filter(blog => 
        blog.title.toLowerCase().includes(searchTerm) ||
        blog.content.toLowerCase().includes(searchTerm) ||
        blog.excerpt.toLowerCase().includes(searchTerm) ||
        blog.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Get author information for each blog
    const blogsWithAuthors = await Promise.all(
      filteredBlogs.map(async (blog) => {
        const author = await ctx.db.get(blog.authorId);
        const profile = await ctx.db.query("userProfiles")
          .withIndex("by_user", (q) => q.eq("userId", blog.authorId))
          .first();
        
        return {
          ...blog,
          author: {
            name: profile?.firstName && profile?.lastName 
              ? `${profile.firstName} ${profile.lastName}`
              : author?.email?.split('@')[0] || "Anonymous",
            email: author?.email
          }
        };
      })
    );

    return blogsWithAuthors;
  },
});

export const get = query({
  args: { id: v.id("blogs") },
  handler: async (ctx, args) => {
    const blog = await ctx.db.get(args.id);
    if (!blog) return null;

    // Get author information
    const author = await ctx.db.get(blog.authorId);
    const profile = await ctx.db.query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", blog.authorId))
      .first();

    return {
      ...blog,
      author: {
        name: profile?.firstName && profile?.lastName 
          ? `${profile.firstName} ${profile.lastName}`
          : author?.email?.split('@')[0] || "Anonymous",
        email: author?.email
      }
    };
  },
});

export const getTags = query({
  args: {},
  handler: async (ctx) => {
    const blogs = await ctx.db.query("blogs")
      .withIndex("by_published", (q) => q.eq("isPublished", true))
      .collect();
    
    const allTags = blogs.flatMap(blog => blog.tags);
    const uniqueTags = [...new Set(allTags)];
    
    return uniqueTags.sort();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    tags: v.array(v.string()),
    imageUrl: v.optional(v.string()),
    isPublished: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const now = Date.now();
    
    // Generate excerpt from content (first 200 characters)
    const excerpt = args.content.length > 200 
      ? args.content.substring(0, 200) + "..."
      : args.content;
    
    return await ctx.db.insert("blogs", {
      title: args.title,
      content: args.content,
      excerpt,
      tags: args.tags,
      imageUrl: args.imageUrl,
      authorId: userId,
      isPublished: args.isPublished,
      publishedAt: args.isPublished ? now : undefined,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("blogs"),
    title: v.string(),
    content: v.string(),
    tags: v.array(v.string()),
    imageUrl: v.optional(v.string()),
    isPublished: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const blog = await ctx.db.get(args.id);
    if (!blog) throw new Error("Blog not found");

    // Check if user is author or admin
    const profile = await ctx.db.query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    
    if (blog.authorId !== userId && !profile?.isAdmin) {
      throw new Error("Not authorized");
    }

    const { id, ...updateData } = args;
    const now = Date.now();

    // Generate excerpt from content
    const excerpt = args.content.length > 200 
      ? args.content.substring(0, 200) + "..."
      : args.content;

    await ctx.db.patch(args.id, {
      ...updateData,
      excerpt,
      publishedAt: args.isPublished && !blog.publishedAt ? now : blog.publishedAt,
      updatedAt: now,
    });
  },
});

export const delete_ = mutation({
  args: { id: v.id("blogs") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const blog = await ctx.db.get(args.id);
    if (!blog) throw new Error("Blog not found");

    // Check if user is author or admin
    const profile = await ctx.db.query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    
    if (blog.authorId !== userId && !profile?.isAdmin) {
      throw new Error("Not authorized");
    }

    // Delete all comments for this blog first
    const comments = await ctx.db.query("comments")
      .withIndex("by_blog", (q) => q.eq("blogId", args.id))
      .collect();
    
    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }

    await ctx.db.delete(args.id);
  },
});

export const getUserBlogs = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db.query("blogs")
      .withIndex("by_author", (q) => q.eq("authorId", userId))
      .order("desc")
      .collect();
  },
});
