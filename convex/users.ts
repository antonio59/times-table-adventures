import { v } from "convex/values";
import {
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
import { Doc } from "./_generated/dataModel";

const PIN_REGEX = /^\d{6}$/;
const MAX_FAILED_ATTEMPTS = 8;
const ATTEMPT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

// SHA-256 hash of the passcode (never store plaintext)
async function hashPin(pin: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(pin),
  );
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Strip sensitive fields before returning a user record to the client
function publicUser(user: Doc<"users">) {
  return {
    _id: user._id,
    _creationTime: user._creationTime,
    name: user.name,
    avatar: user.avatar,
    createdAt: user.createdAt,
    lastActiveAt: user.lastActiveAt,
  };
}

async function findByName(ctx: QueryCtx | MutationCtx, name: string) {
  return await ctx.db
    .query("users")
    .withIndex("by_name", (q) => q.eq("name", name.toLowerCase().trim()))
    .first();
}

// Throw if too many failed passcode attempts recently
async function assertNotRateLimited(ctx: MutationCtx, name: string) {
  const record = await ctx.db
    .query("loginAttempts")
    .withIndex("by_name", (q) => q.eq("name", name))
    .first();

  if (
    record &&
    record.failedAttempts >= MAX_FAILED_ATTEMPTS &&
    Date.now() - record.windowStart < ATTEMPT_WINDOW_MS
  ) {
    throw new Error("Too many tries! Wait a few minutes and try again.");
  }
}

async function recordFailedAttempt(ctx: MutationCtx, name: string) {
  const record = await ctx.db
    .query("loginAttempts")
    .withIndex("by_name", (q) => q.eq("name", name))
    .first();

  const now = Date.now();
  if (!record || now - record.windowStart >= ATTEMPT_WINDOW_MS) {
    const patch = { failedAttempts: 1, windowStart: now };
    if (record) {
      await ctx.db.patch(record._id, patch);
    } else {
      await ctx.db.insert("loginAttempts", { name, ...patch });
    }
  } else {
    await ctx.db.patch(record._id, {
      failedAttempts: record.failedAttempts + 1,
    });
  }
}

async function clearFailedAttempts(ctx: MutationCtx, name: string) {
  const record = await ctx.db
    .query("loginAttempts")
    .withIndex("by_name", (q) => q.eq("name", name))
    .first();
  if (record) await ctx.db.delete(record._id);
}

// Check if a username already exists
export const checkUserExists = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const existingUser = await findByName(ctx, args.name);
    return !!existingUser;
  },
});

// Create a new user with name and passcode
export const createUser = mutation({
  args: {
    name: v.string(),
    pin: v.string(),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const normalizedName = args.name.toLowerCase().trim();

    const existingUser = await findByName(ctx, normalizedName);
    if (existingUser) {
      throw new Error("Username already taken");
    }

    if (!PIN_REGEX.test(args.pin)) {
      throw new Error("Passcode must be 6 digits");
    }

    const userId = await ctx.db.insert("users", {
      name: normalizedName,
      pinHash: await hashPin(args.pin),
      avatar: args.avatar,
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
    });

    return userId;
  },
});

// Login with name and passcode
export const loginUser = mutation({
  args: {
    name: v.string(),
    pin: v.string(),
  },
  handler: async (ctx, args) => {
    const normalizedName = args.name.toLowerCase().trim();

    await assertNotRateLimited(ctx, normalizedName);

    const user = await findByName(ctx, normalizedName);
    if (!user) {
      throw new Error("User not found");
    }

    const pinOk = user.pinHash
      ? (await hashPin(args.pin)) === user.pinHash
      : user.pin
        ? user.pin === args.pin
        : PIN_REGEX.test(args.pin); // legacy account without a passcode adopts one now

    if (!pinOk) {
      await recordFailedAttempt(ctx, normalizedName);
      throw new Error("Incorrect passcode");
    }

    // Migrate legacy plaintext/absent passcode to hash on successful login
    const patch: { lastActiveAt: number; pinHash?: string; pin?: undefined } = {
      lastActiveAt: Date.now(),
    };
    if (!user.pinHash) {
      patch.pinHash = await hashPin(args.pin);
      patch.pin = undefined;
    }
    await ctx.db.patch(user._id, patch);
    await clearFailedAttempts(ctx, normalizedName);

    return {
      userId: user._id,
      name: user.name,
      avatar: user.avatar,
    };
  },
});

// Get user by ID (passcode fields are never returned to the client)
export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    return user ? publicUser(user) : null;
  },
});

// Get user by name
export const getUserByName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const user = await findByName(ctx, args.name);
    return user ? publicUser(user) : null;
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

// Get all users (for the profile picker - public fields only)
export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").order("desc").take(20);
    return users.map(publicUser);
  },
});
