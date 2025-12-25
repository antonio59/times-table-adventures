import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Check if a username already exists
export const checkUserExists = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_name", (q) => q.eq("name", args.name.toLowerCase().trim()))
      .first();
    return !!existingUser;
  },
});

// Create a new user with name and PIN
export const createUser = mutation({
  args: {
    name: v.string(),
    pin: v.string(),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const normalizedName = args.name.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_name", (q) => q.eq("name", normalizedName))
      .first();

    if (existingUser) {
      throw new Error("Username already taken");
    }

    // Validate PIN is 4 digits
    if (!/^\d{4}$/.test(args.pin)) {
      throw new Error("PIN must be 4 digits");
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      name: normalizedName,
      pin: args.pin,
      avatar: args.avatar,
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
    });

    return userId;
  },
});

// Login with name and PIN
export const loginUser = mutation({
  args: {
    name: v.string(),
    pin: v.string(),
  },
  handler: async (ctx, args) => {
    const normalizedName = args.name.toLowerCase().trim();

    const user = await ctx.db
      .query("users")
      .withIndex("by_name", (q) => q.eq("name", normalizedName))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // If user has a PIN set, verify it
    if (user.pin) {
      if (user.pin !== args.pin) {
        throw new Error("Incorrect PIN");
      }
    } else {
      // Legacy user without PIN - set the PIN now
      await ctx.db.patch(user._id, {
        pin: args.pin,
        lastActiveAt: Date.now(),
      });
      return {
        userId: user._id,
        name: user.name,
        avatar: user.avatar,
      };
    }

    // Update last active time
    await ctx.db.patch(user._id, {
      lastActiveAt: Date.now(),
    });

    return {
      userId: user._id,
      name: user.name,
      avatar: user.avatar,
    };
  },
});

// Legacy: Create or get existing user by name (for migration, will be removed)
export const getOrCreateUser = mutation({
  args: {
    name: v.string(),
    pin: v.optional(v.string()),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const normalizedName = args.name.toLowerCase().trim();
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_name", (q) => q.eq("name", normalizedName))
      .first();

    if (existingUser) {
      // If user exists and PIN matches (or no PIN on account yet), allow login
      if (existingUser.pin && args.pin && existingUser.pin !== args.pin) {
        throw new Error("Incorrect PIN");
      }
      // Update last active time
      await ctx.db.patch(existingUser._id, {
        lastActiveAt: Date.now(),
      });
      return existingUser._id;
    }

    // Create new user with PIN
    const userId = await ctx.db.insert("users", {
      name: normalizedName,
      pin: args.pin || "0000", // Default PIN for migration
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
