import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@/contexts/UserContext";
import { MAX_TABLE } from "@/lib/constants";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import {
  Trophy,
  Star,
  Target,
  Clock,
  Flame,
  Award,
  TrendingUp,
  Gamepad2,
  Lock,
} from "lucide-react";

const MASTERY_COLORS = {
  beginner: "bg-muted text-muted-foreground",
  learning: "bg-blue-100 text-blue-700 border-blue-300",
  practicing: "bg-amber-100 text-amber-700 border-amber-300",
  mastered: "bg-green-100 text-green-700 border-green-300",
};

const MASTERY_LABELS = {
  beginner: "Not Started",
  learning: "Learning",
  practicing: "Practicing",
  mastered: "Mastered",
};

const Progress = () => {
  const { userId, userName, isLoggedIn } = useUser();

  const stats = useQuery(
    api.gameSessions.getUserStats,
    userId ? { userId } : "skip",
  );
  const mastery = useQuery(
    api.tableMastery.getUserMastery,
    userId ? { userId } : "skip",
  );
  const achievements = useQuery(
    api.achievements.getAllAchievements,
    userId ? { userId } : "skip",
  );
  const recentSessions = useQuery(
    api.gameSessions.getRecentSessions,
    userId ? { userId, limit: 5 } : "skip",
  );
  const suggestions = useQuery(
    api.tableMastery.getSuggestedTables,
    userId ? { userId } : "skip",
  );

  if (!isLoggedIn) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-card rounded-3xl p-8 shadow-card border border-border">
            <Lock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-2">Track Your Progress</h1>
            <p className="text-muted-foreground mb-6">
              Enter your name in the header to start tracking your learning
              journey!
            </p>
            <Link to="/">
              <Button size="lg">Go Home</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const masteredCount = mastery
    ? Object.values(mastery).filter((m) => m.masteryLevel === "mastered").length
    : 0;
  const earnedAchievements = achievements?.filter((a) => a.earned) ?? [];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
            {userName}'s Progress
          </h1>
          <p className="text-muted-foreground">
            Track your times table journey!
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card rounded-2xl p-4 shadow-card border border-border text-center">
            <Target className="w-8 h-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{stats?.accuracy ?? 0}%</div>
            <p className="text-xs text-muted-foreground">Accuracy</p>
          </div>
          <div className="bg-card rounded-2xl p-4 shadow-card border border-border text-center">
            <Flame className="w-8 h-8 mx-auto mb-2 text-orange-500" />
            <div className="text-2xl font-bold">{stats?.bestStreak ?? 0}</div>
            <p className="text-xs text-muted-foreground">Best Streak</p>
          </div>
          <div className="bg-card rounded-2xl p-4 shadow-card border border-border text-center">
            <Gamepad2 className="w-8 h-8 mx-auto mb-2 text-secondary" />
            <div className="text-2xl font-bold">
              {stats?.totalSessions ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">Games Played</p>
          </div>
          <div className="bg-card rounded-2xl p-4 shadow-card border border-border text-center">
            <Star className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
            <div className="text-2xl font-bold">{stats?.totalCorrect ?? 0}</div>
            <p className="text-xs text-muted-foreground">Correct Answers</p>
          </div>
        </div>

        {/* Tables Mastery */}
        <div className="bg-card rounded-3xl p-6 shadow-card border border-border mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Tables Mastery
            </h2>
            <span className="text-sm text-muted-foreground">
              {masteredCount}/{MAX_TABLE} mastered
            </span>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {mastery &&
              Object.values(mastery)
                .sort((a, b) => a.tableNumber - b.tableNumber)
                .map((table) => (
                  <div
                    key={table.tableNumber}
                    className={`rounded-xl p-3 border-2 text-center transition-all ${
                      MASTERY_COLORS[table.masteryLevel]
                    }`}
                  >
                    <div className="text-2xl font-bold">
                      {table.tableNumber}x
                    </div>
                    <div className="text-xs font-medium">
                      {MASTERY_LABELS[table.masteryLevel]}
                    </div>
                    {table.totalAttempts > 0 && (
                      <div className="mt-2">
                        <ProgressBar value={table.accuracy} className="h-1.5" />
                        <div className="text-[10px] mt-1">
                          {table.accuracy}% ({table.totalAttempts} tries)
                        </div>
                      </div>
                    )}
                  </div>
                ))}
          </div>
        </div>

        {/* Suggestions */}
        {suggestions && suggestions.length > 0 && (
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-3xl p-6 mb-8 border border-primary/20">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Recommended Practice
            </h2>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <Link key={s.tableNumber} to="/practice">
                  <Button variant="outline" size="sm">
                    {s.tableNumber}x table - {s.reason}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Achievements */}
        <div className="bg-card rounded-3xl p-6 shadow-card border border-border mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Achievements
            </h2>
            <span className="text-sm text-muted-foreground">
              {earnedAchievements.length}/{achievements?.length ?? 0} earned
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {achievements?.map((achievement) => (
              <div
                key={achievement.type}
                className={`rounded-xl p-4 text-center border transition-all ${
                  achievement.earned
                    ? "bg-secondary/10 border-secondary/30"
                    : "bg-muted/30 border-transparent opacity-50"
                }`}
              >
                <div className="text-3xl mb-2">
                  {achievement.earned ? achievement.emoji : "🔒"}
                </div>
                <div className="font-semibold text-sm">{achievement.name}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {achievement.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        {recentSessions && recentSessions.length > 0 && (
          <div className="bg-card rounded-3xl p-6 shadow-card border border-border">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Games
            </h2>

            <div className="space-y-3">
              {recentSessions.map((session) => (
                <div
                  key={session._id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {session.gameType === "quiz" && "🎮"}
                      {session.gameType === "practice" && "⭐"}
                      {session.gameType === "speed" && "⚡"}
                      {session.gameType === "memory" && "🧠"}
                      {session.gameType === "missing" && "🔢"}
                      {session.gameType === "stories" && "📖"}
                    </div>
                    <div>
                      <div className="font-semibold capitalize">
                        {session.gameType}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(session.completedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">
                      {session.correctAnswers}/{session.totalQuestions}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {Math.round(
                        (session.correctAnswers / session.totalQuestions) * 100,
                      )}
                      % correct
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Progress;
