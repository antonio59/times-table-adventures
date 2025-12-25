import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Update mastery for a specific times table
export const updateMastery = mutation({
  args: {
    userId: v.id("users"),
    tableNumber: v.number(),
    correct: v.boolean(),
    timeMs: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("tableMastery")
      .withIndex("by_user_and_table", (q) =>
        q.eq("userId", args.userId).eq("tableNumber", args.tableNumber),
      )
      .first();

    if (existing) {
      const newTotalAttempts = existing.totalAttempts + 1;
      const newCorrectAttempts =
        existing.correctAttempts + (args.correct ? 1 : 0);
      // Running average for time
      const newAverageTimeMs = Math.round(
        (existing.averageTimeMs * existing.totalAttempts + args.timeMs) /
          newTotalAttempts,
      );

      await ctx.db.patch(existing._id, {
        totalAttempts: newTotalAttempts,
        correctAttempts: newCorrectAttempts,
        averageTimeMs: newAverageTimeMs,
        lastPracticedAt: Date.now(),
      });

      return existing._id;
    } else {
      return await ctx.db.insert("tableMastery", {
        userId: args.userId,
        tableNumber: args.tableNumber,
        totalAttempts: 1,
        correctAttempts: args.correct ? 1 : 0,
        averageTimeMs: args.timeMs,
        lastPracticedAt: Date.now(),
      });
    }
  },
});

// Batch update mastery for multiple answers
export const updateMasteryBatch = mutation({
  args: {
    userId: v.id("users"),
    results: v.array(
      v.object({
        tableNumber: v.number(),
        correct: v.boolean(),
        timeMs: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    for (const result of args.results) {
      const existing = await ctx.db
        .query("tableMastery")
        .withIndex("by_user_and_table", (q) =>
          q.eq("userId", args.userId).eq("tableNumber", result.tableNumber),
        )
        .first();

      if (existing) {
        const newTotalAttempts = existing.totalAttempts + 1;
        const newCorrectAttempts =
          existing.correctAttempts + (result.correct ? 1 : 0);
        const newAverageTimeMs = Math.round(
          (existing.averageTimeMs * existing.totalAttempts + result.timeMs) /
            newTotalAttempts,
        );

        await ctx.db.patch(existing._id, {
          totalAttempts: newTotalAttempts,
          correctAttempts: newCorrectAttempts,
          averageTimeMs: newAverageTimeMs,
          lastPracticedAt: Date.now(),
        });
      } else {
        await ctx.db.insert("tableMastery", {
          userId: args.userId,
          tableNumber: result.tableNumber,
          totalAttempts: 1,
          correctAttempts: result.correct ? 1 : 0,
          averageTimeMs: result.timeMs,
          lastPracticedAt: Date.now(),
        });
      }
    }
  },
});

// Get user's mastery for all tables
export const getUserMastery = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const mastery = await ctx.db
      .query("tableMastery")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Create a map for all tables 1-12
    const masteryMap: Record<
      number,
      {
        tableNumber: number;
        totalAttempts: number;
        correctAttempts: number;
        accuracy: number;
        averageTimeMs: number;
        lastPracticedAt: number | null;
        masteryLevel: "beginner" | "learning" | "practicing" | "mastered";
      }
    > = {};

    for (let i = 1; i <= 12; i++) {
      const tableMastery = mastery.find((m) => m.tableNumber === i);
      if (tableMastery) {
        const accuracy =
          tableMastery.totalAttempts > 0
            ? Math.round(
                (tableMastery.correctAttempts / tableMastery.totalAttempts) *
                  100,
              )
            : 0;

        // Determine mastery level
        let masteryLevel: "beginner" | "learning" | "practicing" | "mastered" =
          "beginner";
        if (tableMastery.totalAttempts >= 20 && accuracy >= 90) {
          masteryLevel = "mastered";
        } else if (tableMastery.totalAttempts >= 10 && accuracy >= 75) {
          masteryLevel = "practicing";
        } else if (tableMastery.totalAttempts >= 5) {
          masteryLevel = "learning";
        }

        masteryMap[i] = {
          tableNumber: i,
          totalAttempts: tableMastery.totalAttempts,
          correctAttempts: tableMastery.correctAttempts,
          accuracy,
          averageTimeMs: tableMastery.averageTimeMs,
          lastPracticedAt: tableMastery.lastPracticedAt,
          masteryLevel,
        };
      } else {
        masteryMap[i] = {
          tableNumber: i,
          totalAttempts: 0,
          correctAttempts: 0,
          accuracy: 0,
          averageTimeMs: 0,
          lastPracticedAt: null,
          masteryLevel: "beginner",
        };
      }
    }

    return masteryMap;
  },
});

// Get suggested tables to practice (weakest ones)
export const getSuggestedTables = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const mastery = await ctx.db
      .query("tableMastery")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Find tables that need work
    const needsPractice: { tableNumber: number; reason: string }[] = [];

    // Check all tables 1-12
    for (let i = 1; i <= 12; i++) {
      const tableMastery = mastery.find((m) => m.tableNumber === i);

      if (!tableMastery || tableMastery.totalAttempts < 5) {
        needsPractice.push({ tableNumber: i, reason: "Not practiced enough" });
      } else {
        const accuracy =
          (tableMastery.correctAttempts / tableMastery.totalAttempts) * 100;
        if (accuracy < 80) {
          needsPractice.push({
            tableNumber: i,
            reason: `Accuracy is ${Math.round(accuracy)}%`,
          });
        }
      }
    }

    return needsPractice.slice(0, 3); // Return top 3 suggestions
  },
});
