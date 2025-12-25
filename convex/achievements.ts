import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Achievement definitions
export const ACHIEVEMENTS = {
  first_game: {
    name: "First Steps",
    description: "Complete your first game",
    emoji: "🎉",
  },
  perfect_quiz: {
    name: "Perfect Score",
    description: "Get 100% on a quiz",
    emoji: "⭐",
  },
  streak_5: {
    name: "On Fire",
    description: "Get 5 answers correct in a row",
    emoji: "🔥",
  },
  streak_10: {
    name: "Unstoppable",
    description: "Get 10 answers correct in a row",
    emoji: "💪",
  },
  streak_20: {
    name: "Math Wizard",
    description: "Get 20 answers correct in a row",
    emoji: "🧙",
  },
  master_table: {
    name: "Table Master",
    description: "Master a times table (90%+ accuracy with 20+ attempts)",
    emoji: "🏆",
  },
  all_tables: {
    name: "Multiplication Champion",
    description: "Master all tables 1-12",
    emoji: "👑",
  },
  speed_demon: {
    name: "Speed Demon",
    description: "Score 20+ in Speed Race",
    emoji: "⚡",
  },
  memory_master: {
    name: "Memory Master",
    description: "Complete Memory Match in under 20 moves",
    emoji: "🧠",
  },
  daily_player: {
    name: "Dedicated Learner",
    description: "Play 5 games in one day",
    emoji: "📚",
  },
  hundred_questions: {
    name: "Century Club",
    description: "Answer 100 questions",
    emoji: "💯",
  },
  five_hundred_questions: {
    name: "Math Marathon",
    description: "Answer 500 questions",
    emoji: "🏃",
  },
} as const;

// Award an achievement
export const awardAchievement = mutation({
  args: {
    userId: v.id("users"),
    achievementType: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // Check if already earned
    const existing = await ctx.db
      .query("achievements")
      .withIndex("by_user_and_type", (q) =>
        q.eq("userId", args.userId).eq("achievementType", args.achievementType),
      )
      .first();

    if (existing) {
      return null; // Already earned
    }

    const achievementId = await ctx.db.insert("achievements", {
      userId: args.userId,
      achievementType: args.achievementType,
      earnedAt: Date.now(),
      metadata: args.metadata,
    });

    return achievementId;
  },
});

// Get user's achievements
export const getUserAchievements = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const earned = await ctx.db
      .query("achievements")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Return with achievement details
    return earned.map((a) => ({
      ...a,
      details: ACHIEVEMENTS[a.achievementType as keyof typeof ACHIEVEMENTS] ?? {
        name: a.achievementType,
        description: "",
        emoji: "🎖️",
      },
    }));
  },
});

// Check if user has a specific achievement
export const hasAchievement = query({
  args: {
    userId: v.id("users"),
    achievementType: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("achievements")
      .withIndex("by_user_and_type", (q) =>
        q.eq("userId", args.userId).eq("achievementType", args.achievementType),
      )
      .first();

    return !!existing;
  },
});

// Get all possible achievements with earned status
export const getAllAchievements = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const earned = await ctx.db
      .query("achievements")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const earnedTypes = new Set(earned.map((a) => a.achievementType));

    return Object.entries(ACHIEVEMENTS).map(([type, details]) => ({
      type,
      ...details,
      earned: earnedTypes.has(type),
      earnedAt:
        earned.find((a) => a.achievementType === type)?.earnedAt ?? null,
    }));
  },
});

// Check and award achievements based on game session
export const checkAchievements = mutation({
  args: {
    userId: v.id("users"),
    gameType: v.string(),
    score: v.number(),
    totalQuestions: v.number(),
    correctAnswers: v.number(),
    bestStreak: v.number(),
    moves: v.optional(v.number()), // for memory game
  },
  handler: async (ctx, args) => {
    const newAchievements: string[] = [];

    // Helper to award if not already earned
    const tryAward = async (
      type: string,
      metadata?: Record<string, unknown>,
    ) => {
      const existing = await ctx.db
        .query("achievements")
        .withIndex("by_user_and_type", (q) =>
          q.eq("userId", args.userId).eq("achievementType", type),
        )
        .first();

      if (!existing) {
        await ctx.db.insert("achievements", {
          userId: args.userId,
          achievementType: type,
          earnedAt: Date.now(),
          metadata,
        });
        newAchievements.push(type);
      }
    };

    // First game
    const sessions = await ctx.db
      .query("gameSessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .take(2);
    if (sessions.length === 1) {
      await tryAward("first_game");
    }

    // Perfect quiz
    if (
      args.gameType === "quiz" &&
      args.correctAnswers === args.totalQuestions
    ) {
      await tryAward("perfect_quiz");
    }

    // Streak achievements
    if (args.bestStreak >= 5) await tryAward("streak_5");
    if (args.bestStreak >= 10) await tryAward("streak_10");
    if (args.bestStreak >= 20) await tryAward("streak_20");

    // Speed demon
    if (args.gameType === "speed" && args.score >= 20) {
      await tryAward("speed_demon");
    }

    // Memory master
    if (args.gameType === "memory" && args.moves && args.moves <= 20) {
      await tryAward("memory_master");
    }

    // Question count achievements
    const allSessions = await ctx.db
      .query("gameSessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    const totalQuestions = allSessions.reduce(
      (sum, s) => sum + s.totalQuestions,
      0,
    );
    if (totalQuestions >= 100) await tryAward("hundred_questions");
    if (totalQuestions >= 500) await tryAward("five_hundred_questions");

    // Daily player (5 games in one day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySessions = allSessions.filter(
      (s) => s.completedAt >= today.getTime(),
    );
    if (todaySessions.length >= 5) {
      await tryAward("daily_player");
    }

    return newAchievements;
  },
});
