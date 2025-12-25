import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table - simple name-based identification (no auth needed for kids)
  users: defineTable({
    name: v.string(),
    avatar: v.optional(v.string()), // emoji or color for avatar
    createdAt: v.number(),
    lastActiveAt: v.number(),
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
    tableNumber: v.number(), // 1-12
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
