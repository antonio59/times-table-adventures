import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Game type definition
const gameTypeValidator = v.union(
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
);

// Record a completed game session
export const recordSession = mutation({
  args: {
    userId: v.id("users"),
    gameType: gameTypeValidator,
    tablesUsed: v.array(v.number()),
    score: v.number(),
    totalQuestions: v.number(),
    correctAnswers: v.number(),
    bestStreak: v.number(),
    timeSpent: v.number(),
  },
  handler: async (ctx, args) => {
    const sessionId = await ctx.db.insert("gameSessions", {
      ...args,
      completedAt: Date.now(),
    });

    // Update user's last active time
    await ctx.db.patch(args.userId, {
      lastActiveAt: Date.now(),
    });

    return sessionId;
  },
});

// Get user's recent sessions
export const getRecentSessions = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    return await ctx.db
      .query("gameSessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);
  },
});

// Get user's sessions by game type
export const getSessionsByGame = query({
  args: {
    userId: v.id("users"),
    gameType: gameTypeValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("gameSessions")
      .withIndex("by_user_and_game", (q) =>
        q.eq("userId", args.userId).eq("gameType", args.gameType),
      )
      .order("desc")
      .take(20);
  },
});

// Get user's overall stats
export const getUserStats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("gameSessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        totalQuestions: 0,
        totalCorrect: 0,
        accuracy: 0,
        totalTimeSpent: 0,
        bestStreak: 0,
        gameBreakdown: {},
      };
    }

    const gameBreakdown: Record<
      string,
      { sessions: number; accuracy: number }
    > = {};
    let totalQuestions = 0;
    let totalCorrect = 0;
    let totalTimeSpent = 0;
    let bestStreak = 0;

    for (const session of sessions) {
      totalQuestions += session.totalQuestions;
      totalCorrect += session.correctAnswers;
      totalTimeSpent += session.timeSpent;
      bestStreak = Math.max(bestStreak, session.bestStreak);

      if (!gameBreakdown[session.gameType]) {
        gameBreakdown[session.gameType] = { sessions: 0, accuracy: 0 };
      }
      gameBreakdown[session.gameType].sessions += 1;
    }

    // Calculate accuracy per game
    for (const gameType of Object.keys(gameBreakdown)) {
      const gameSessions = sessions.filter((s) => s.gameType === gameType);
      const gameCorrect = gameSessions.reduce(
        (sum, s) => sum + s.correctAnswers,
        0,
      );
      const gameTotal = gameSessions.reduce(
        (sum, s) => sum + s.totalQuestions,
        0,
      );
      gameBreakdown[gameType].accuracy =
        gameTotal > 0 ? Math.round((gameCorrect / gameTotal) * 100) : 0;
    }

    return {
      totalSessions: sessions.length,
      totalQuestions,
      totalCorrect,
      accuracy:
        totalQuestions > 0
          ? Math.round((totalCorrect / totalQuestions) * 100)
          : 0,
      totalTimeSpent,
      bestStreak,
      gameBreakdown,
    };
  },
});

// Get high scores for a game type
export const getHighScores = query({
  args: {
    gameType: gameTypeValidator,
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    const sessions = await ctx.db
      .query("gameSessions")
      .filter((q) => q.eq(q.field("gameType"), args.gameType))
      .order("desc")
      .take(100);

    // Sort by score and get top entries
    const sorted = sessions.sort((a, b) => b.score - a.score).slice(0, limit);

    // Fetch user names
    const results = await Promise.all(
      sorted.map(async (session) => {
        const user = await ctx.db.get(session.userId);
        return {
          ...session,
          userName: user?.name ?? "Unknown",
          userAvatar: user?.avatar,
        };
      }),
    );

    return results;
  },
});
