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
} from "lucide-react";
import { Mascot } from "@/components/trail/Mascot";
import { TRAIL_STOPS, starsForAccuracy } from "@/lib/trail";

const MASTERY_COLORS = {
  beginner: "bg-muted text-muted-foreground",
  learning: "bg-info/10 text-info border-info/30",
  practicing: "bg-secondary/10 text-secondary border-secondary/30",
  mastered: "bg-success/10 text-success border-success/30",
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
            <Mascot className="w-24 h-24 mx-auto mb-3" />
            <h1 className="text-2xl font-bold font-display mb-2">
              Track Your Progress
            </h1>
            <p className="text-muted-foreground mb-6">
              Create a profile from the header and the trail will remember
              every star you earn!
            </p>
            <Link to="/">
              <Button size="lg">Back to the Trail</Button>
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
          <h1 className="text-3xl md:text-4xl font-bold mb-2 capitalize">
            {userName}&apos;s Journey
          </h1>
          <p className="text-muted-foreground inline-flex items-center gap-2">
            <Star
              className="w-4 h-4 fill-warning text-warning"
              aria-hidden="true"
            />
            {TRAIL_STOPS.reduce((sum, stop) => {
              const p = stats?.gameBreakdown?.[stop.gameType];
              return sum + (p && p.sessions > 0 ? starsForAccuracy(p.accuracy) : 0);
            }, 0)}
            /{TRAIL_STOPS.length * 3} trail stars earned
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
            <Flame className="w-8 h-8 mx-auto mb-2 text-secondary" />
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
            <Star className="w-8 h-8 mx-auto mb-2 text-warning" />
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
                    className={`rounded-xl p-3 border-2 text-center transition ${
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
                className={`rounded-xl p-4 text-center border transition ${
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
                    {(() => {
                      const stop = TRAIL_STOPS.find(
                        (s) => s.gameType === session.gameType,
                      );
                      const SessionIcon = stop?.icon ?? Gamepad2;
                      return (
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <SessionIcon
                            className="w-5 h-5 text-primary"
                            aria-hidden="true"
                          />
                        </div>
                      );
                    })()}
                    <div>
                      <div className="font-semibold">
                        {TRAIL_STOPS.find(
                          (s) => s.gameType === session.gameType,
                        )?.title ?? session.gameType}
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
