import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table - name + PIN for kid-friendly authentication
  users: defineTable({
    name: v.string(),
    pin: v.optional(v.string()), // legacy plaintext passcode - migrated to pinHash on login
    pinHash: v.optional(v.string()), // SHA-256 hash of the passcode
    avatar: v.optional(v.string()), // emoji or color for avatar
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("approved"),
        v.literal("rejected"),
      ),
    ), // undefined = approved (accounts created before approval existed)
    approvalToken: v.optional(v.string()), // single-use token for the approve/deny email link
    createdAt: v.number(),
    lastActiveAt: v.number(),
  })
    .index("by_name", ["name"])
    .index("by_approval_token", ["approvalToken"]),

  // Rate limiting for passcode attempts (per user name)
  loginAttempts: defineTable({
    name: v.string(),
    failedAttempts: v.number(),
    windowStart: v.number(), // epoch ms when the current window started
  }).index("by_name", ["name"]),

  // Game sessions - tracks each game played
  gameSessions: defineTable({
    userId: v.id("users"),
    gameType: v.union(
      v.literal("practice"),
      v.literal("quiz"),
      v.literal("speed"),
      v.literal("memory"),
      v.literal("missing"),
      v.literal("stories"),
      v.literal("climb"),
      v.literal("division"),
      v.literal("pattern"),
      v.literal("daily"),
      v.literal("bonds"),
      v.literal("truefalse"),
      v.literal("array"),
      v.literal("family"),
    ),
    tablesUsed: v.array(v.number()), // which times tables were practiced
    score: v.number(),
    totalQuestions: v.number(),
    correctAnswers: v.number(),
    bestStreak: v.number(),
    timeSpent: v.number(), // in seconds
    completedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_game", ["userId", "gameType"])
    .index("by_completed", ["completedAt"]),

  // Table mastery - tracks proficiency per times table
  tableMastery: defineTable({
    userId: v.id("users"),
    tableNumber: v.number(), // 1-20
    totalAttempts: v.number(),
    correctAttempts: v.number(),
    averageTimeMs: v.number(), // average time to answer
    lastPracticedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_table", ["userId", "tableNumber"]),

  // Achievements/badges earned
  achievements: defineTable({
    userId: v.id("users"),
    achievementType: v.string(), // e.g., "first_perfect_quiz", "streak_10", "master_table_5"
    earnedAt: v.number(),
    metadata: v.optional(v.any()), // extra data like which table was mastered
  })
    .index("by_user", ["userId"])
    .index("by_user_and_type", ["userId", "achievementType"]),
});
