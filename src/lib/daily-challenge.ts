/**
 * Daily Challenge Generator
 * Creates a deterministic set of challenges based on the current date
 * This ensures all users get the same challenge on the same day
 */

export interface DailyQuestion {
  a: number;
  b: number;
  answer: number;
  type: "multiply" | "divide" | "missing";
  display: string;
}

export interface DailyChallenge {
  date: string;
  questions: DailyQuestion[];
  theme: string;
  difficulty: "easy" | "medium" | "hard";
}

// Seeded random number generator for deterministic results
function seededRandom(seed: number): () => number {
  return function () {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

// Get today's date as YYYY-MM-DD
export function getTodayDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

// Convert date string to seed number
function dateToSeed(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// Challenge themes for variety
const themes = [
  {
    name: "Space Explorer",
    emoji: "🚀",
    description: "Multiply your way through the galaxy!",
  },
  {
    name: "Treasure Hunt",
    emoji: "🏴‍☠️",
    description: "Solve equations to find the treasure!",
  },
  {
    name: "Jungle Adventure",
    emoji: "🌴",
    description: "Navigate through math puzzles!",
  },
  {
    name: "Ocean Quest",
    emoji: "🌊",
    description: "Dive deep into multiplication!",
  },
  {
    name: "Mountain Climber",
    emoji: "⛰️",
    description: "Reach the summit with math!",
  },
  {
    name: "Desert Safari",
    emoji: "🏜️",
    description: "Cross the desert of numbers!",
  },
  {
    name: "Arctic Expedition",
    emoji: "❄️",
    description: "Brave the cold with calculations!",
  },
];

// Generate a daily challenge
export function generateDailyChallenge(dateStr?: string): DailyChallenge {
  const date = dateStr || getTodayDateString();
  const seed = dateToSeed(date);
  const random = seededRandom(seed);

  // Determine difficulty based on day of week (harder on weekends)
  const dayOfWeek = new Date(date).getDay();
  const difficulty: "easy" | "medium" | "hard" =
    dayOfWeek === 0 || dayOfWeek === 6
      ? "hard"
      : dayOfWeek === 3 || dayOfWeek === 4
        ? "medium"
        : "easy";

  // Select theme based on date
  const themeIndex = Math.floor(random() * themes.length);
  const theme = themes[themeIndex];

  // Generate questions
  const questionCount =
    difficulty === "easy" ? 5 : difficulty === "medium" ? 7 : 10;
  const questions: DailyQuestion[] = [];

  // Table ranges based on difficulty
  const minTable = difficulty === "easy" ? 2 : difficulty === "medium" ? 3 : 4;
  const maxTable = difficulty === "easy" ? 6 : difficulty === "medium" ? 9 : 20;
  const maxMultiplier =
    difficulty === "easy" ? 6 : difficulty === "medium" ? 10 : 20;

  for (let i = 0; i < questionCount; i++) {
    const a = Math.floor(random() * (maxTable - minTable + 1)) + minTable;
    const b = Math.floor(random() * maxMultiplier) + 1;
    const answer = a * b;

    // Mix of question types
    const typeRoll = random();
    let type: "multiply" | "divide" | "missing";
    let display: string;

    if (typeRoll < 0.6) {
      // Standard multiplication (60%)
      type = "multiply";
      display = `${a} × ${b} = ?`;
    } else if (typeRoll < 0.8) {
      // Division (20%)
      type = "divide";
      display = `${answer} ÷ ${a} = ?`;
    } else {
      // Missing number (20%)
      type = "missing";
      const missingFirst = random() > 0.5;
      display = missingFirst ? `? × ${b} = ${answer}` : `${a} × ? = ${answer}`;
    }

    questions.push({
      a,
      b,
      answer:
        type === "divide"
          ? b
          : type === "missing"
            ? display.startsWith("?")
              ? a
              : b
            : answer,
      type,
      display,
    });
  }

  return {
    date,
    questions,
    theme: `${theme.emoji} ${theme.name}`,
    difficulty,
  };
}

// Local storage keys
const DAILY_COMPLETED_KEY = "times-table-daily-completed";
const DAILY_BEST_SCORE_KEY = "times-table-daily-best";
const DAILY_STREAK_KEY = "times-table-daily-streak";

export interface DailyProgress {
  lastCompletedDate: string | null;
  bestScore: number;
  streak: number;
  todayCompleted: boolean;
  todayScore: number | null;
}

export function getDailyProgress(): DailyProgress {
  const today = getTodayDateString();
  const lastCompletedDate = localStorage.getItem(DAILY_COMPLETED_KEY);
  const bestScore = parseInt(localStorage.getItem(DAILY_BEST_SCORE_KEY) || "0");
  const streak = parseInt(localStorage.getItem(DAILY_STREAK_KEY) || "0");

  const todayCompleted = lastCompletedDate === today;
  const todayScoreStr = localStorage.getItem(`daily-score-${today}`);
  const todayScore = todayScoreStr ? parseInt(todayScoreStr) : null;

  return {
    lastCompletedDate,
    bestScore,
    streak,
    todayCompleted,
    todayScore,
  };
}

export function saveDailyProgress(
  score: number,
  total: number,
): { newBest: boolean; newStreak: number } {
  const today = getTodayDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

  const lastCompleted = localStorage.getItem(DAILY_COMPLETED_KEY);
  const currentStreak = parseInt(localStorage.getItem(DAILY_STREAK_KEY) || "0");
  const currentBest = parseInt(
    localStorage.getItem(DAILY_BEST_SCORE_KEY) || "0",
  );

  // Calculate new streak
  let newStreak: number;
  if (lastCompleted === yesterdayStr) {
    // Continuing streak
    newStreak = currentStreak + 1;
  } else if (lastCompleted === today) {
    // Already completed today, keep streak
    newStreak = currentStreak;
  } else {
    // Streak broken, start new
    newStreak = 1;
  }

  // Check for new best (as percentage)
  const percentage = Math.round((score / total) * 100);
  const newBest = percentage > currentBest;

  // Save progress
  localStorage.setItem(DAILY_COMPLETED_KEY, today);
  localStorage.setItem(DAILY_STREAK_KEY, String(newStreak));
  localStorage.setItem(`daily-score-${today}`, String(percentage));

  if (newBest) {
    localStorage.setItem(DAILY_BEST_SCORE_KEY, String(percentage));
  }

  return { newBest, newStreak };
}

// Get time until next challenge
export function getTimeUntilNextChallenge(): {
  hours: number;
  minutes: number;
  seconds: number;
} {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const diff = tomorrow.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { hours, minutes, seconds };
}
