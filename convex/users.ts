import { v } from "convex/values";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { Doc } from "./_generated/dataModel";

const PIN_REGEX = /^\d{6}$/;
const MAX_FAILED_ATTEMPTS = 8;
const ATTEMPT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_PENDING_SIGNUPS = 25; // bounds approval-email spam

function userStatus(user: Doc<"users">): "pending" | "approved" | "rejected" {
  return user.status ?? "approved"; // accounts predating approval are approved
}

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

// Create a new user with name and passcode — starts as pending until approved
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
      const status = userStatus(existingUser);
      if (status === "pending") {
        throw new Error("That name is already waiting for approval!");
      }
      if (status === "rejected") {
        throw new Error("That name can't be used — try a different one!");
      }
      throw new Error("Username already taken");
    }

    if (!PIN_REGEX.test(args.pin)) {
      throw new Error("Passcode must be 6 digits");
    }

    // Bound pending signups so the approval inbox can't be flooded
    const allUsers = await ctx.db.query("users").collect();
    const pendingCount = allUsers.filter(
      (u) => u.status === "pending",
    ).length;
    if (pendingCount >= MAX_PENDING_SIGNUPS) {
      throw new Error("Too many new players right now — try again later!");
    }

    const approvalToken = crypto.randomUUID() + crypto.randomUUID();
    const userId = await ctx.db.insert("users", {
      name: normalizedName,
      pinHash: await hashPin(args.pin),
      avatar: args.avatar,
      status: "pending",
      approvalToken,
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
    });

    // Email the admin an approve/deny link (no-ops if env not configured)
    await ctx.scheduler.runAfter(
      0,
      internal.emails.sendSignupApproval,
      { userId },
    );

    return { userId, status: "pending" as const };
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

    const status = userStatus(user);
    if (status === "pending") {
      throw new Error("Waiting for a grown-up to approve your account!");
    }
    if (status === "rejected") {
      throw new Error("This account wasn't approved — ask a grown-up!");
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

// Get all users (for the profile picker - approved only, public fields only)
export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").order("desc").take(50);
    return users.filter((u) => userStatus(u) === "approved").map(publicUser);
  },
});

// Fetch a pending signup for the approval email (internal only)
export const getPendingById = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user || userStatus(user) !== "pending" || !user.approvalToken) {
      return null;
    }
    return {
      name: user.name,
      avatar: user.avatar,
      approvalToken: user.approvalToken,
      createdAt: user.createdAt,
    };
  },
});

// Look up a pending user by their one-time approval token (internal — used by
// the /signup-approval HTTP endpoint to render the confirmation page)
export const getByApprovalToken = internalQuery({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_approval_token", (q) =>
        q.eq("approvalToken", args.token),
      )
      .first();
    if (!user) return null;
    return {
      _id: user._id,
      name: user.name,
      avatar: user.avatar,
      status: userStatus(user),
      createdAt: user.createdAt,
    };
  },
});

// Approve or deny a signup from the emailed link (internal — single-use token)
export const resolveApproval = internalMutation({
  args: {
    token: v.string(),
    action: v.union(v.literal("approve"), v.literal("deny")),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_approval_token", (q) =>
        q.eq("approvalToken", args.token),
      )
      .first();
    if (!user) {
      return { ok: false as const, reason: "invalid" as const };
    }
    if (userStatus(user) !== "pending") {
      return {
        ok: false as const,
        reason: "already_resolved" as const,
        name: user.name,
      };
    }
    await ctx.db.patch(user._id, {
      status: args.action === "approve" ? "approved" : "rejected",
      approvalToken: undefined, // token is single-use
    });
    return { ok: true as const, action: args.action, name: user.name };
  },
});
