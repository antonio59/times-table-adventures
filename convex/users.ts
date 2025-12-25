import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create or get existing user by name
export const getOrCreateUser = mutation({
  args: {
    name: v.string(),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_name", (q) => q.eq("name", args.name.toLowerCase().trim()))
      .first();

    if (existingUser) {
      // Update last active time
      await ctx.db.patch(existingUser._id, {
        lastActiveAt: Date.now(),
      });
      return existingUser._id;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      name: args.name.toLowerCase().trim(),
      avatar: args.avatar,
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
    });

    return userId;
  },
});

// Get user by ID
export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

// Get user by name
export const getUserByName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_name", (q) => q.eq("name", args.name.toLowerCase().trim()))
      .first();
  },
});

// Update user avatar
export const updateAvatar = mutation({
  args: {
    userId: v.id("users"),
    avatar: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      avatar: args.avatar,
    });
  },
});

// Get all users (for user switching)
export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").order("desc").take(20);
  },
});
