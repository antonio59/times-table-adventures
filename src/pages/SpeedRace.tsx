import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import { useUser } from "@/contexts/UserContext";
import { SaveProgressPrompt } from "@/components/SaveProgressPrompt";
import { toast } from "sonner";
import { Zap, Play, Trophy, RotateCcw } from "lucide-react";

const SpeedRace = () => {
  const { isLoggedIn, recordGame } = useUser();
  const [selectedTables, setSelectedTables] = useState<number[]>([2, 3, 4, 5]);
  const [gameState, setGameState] = useState<"idle" | "playing" | "finished">(
    "idle",
  );
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState({ a: 0, b: 0 });
  const [userAnswer, setUserAnswer] = useState("");
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [tableResults, setTableResults] = useState<
    { tableNumber: number; correct: boolean; timeMs: number }[]
  >([]);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const questionStartTime = useRef<number>(Date.now());

  const allTables = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const toggleTable = (table: number) => {
    setSelectedTables((prev) => {
      if (prev.includes(table)) {
        if (prev.length === 1) return prev;
        return prev.filter((t) => t !== table);
      }
      return [...prev, table].sort((a, b) => a - b);
    });
  };

  const selectUpTo = (table: number) => {
    setSelectedTables(allTables.filter((t) => t <= table));
  };

  const generateQuestion = useCallback(() => {
    const a = selectedTables[Math.floor(Math.random() * selectedTables.length)];
    const b = Math.floor(Math.random() * 12) + 1;
    setCurrentQuestion({ a, b });
  }, [selectedTables]);

  const startGame = useCallback(() => {
    setGameState("playing");
    setTimeLeft(60);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setTotalQuestions(0);
    setTableResults([]);
    setUserAnswer("");
    setHasRecorded(false);
    setShowSavePrompt(false);
    generateQuestion();
    questionStartTime.current = Date.now();
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [generateQuestion]);

  useEffect(() => {
    if (gameState !== "playing") return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameState("finished");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer) return;

    const correctAnswer = currentQuestion.a * currentQuestion.b;
    const isCorrect = parseInt(userAnswer) === correctAnswer;
    const timeMs = Date.now() - questionStartTime.current;

    setTotalQuestions((prev) => prev + 1);
    setTableResults((prev) => [
      ...prev,
      { tableNumber: currentQuestion.a, correct: isCorrect, timeMs },
    ]);

    if (isCorrect) {
      setScore((prev) => prev + 1);
      setStreak((prev) => {
        const newStreak = prev + 1;
        if (newStreak > bestStreak) setBestStreak(newStreak);
        return newStreak;
      });
    } else {
      setStreak(0);
    }

    setUserAnswer("");
    generateQuestion();
    questionStartTime.current = Date.now();
    inputRef.current?.focus();
  };

  const getPerformanceMessage = () => {
    if (score >= 30) return "INCREDIBLE! You're a multiplication machine! 🏆";
    if (score >= 20) return "Amazing speed! Keep it up! 🚀";
    if (score >= 15) return "Great job! Getting faster! ⚡";
    if (score >= 10) return "Good work! Practice makes perfect! 💪";
    return "Keep practicing, you'll get faster! 📚";
  };

  const getGameSession = useCallback(
    () => ({
      gameType: "speed" as const,
      tablesUsed: selectedTables,
      score,
      totalQuestions,
      correctAnswers: score,
      bestStreak,
      timeSpent: 60,
    }),
    [selectedTables, score, totalQuestions, bestStreak],
  );

  // Record game when finished
  useEffect(() => {
    if (gameState !== "finished" || hasRecorded) return;

    if (isLoggedIn) {
      const recordResults = async () => {
        const newAchievements = await recordGame(
          getGameSession(),
          tableResults,
        );
        setHasRecorded(true);

        if (newAchievements.length > 0) {
          newAchievements.forEach((type) => {
            toast.success(`Achievement Unlocked: ${type.replace(/_/g, " ")}!`, {
              icon: "🏆",
            });
          });
        }
      };
      recordResults();
    } else {
      const timer = setTimeout(() => {
        setShowSavePrompt(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [
    gameState,
    isLoggedIn,
    hasRecorded,
    recordGame,
    getGameSession,
    tableResults,
  ]);

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        {gameState === "idle" && (
          <div className="text-center">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
                ⚡ Speed Race
              </h1>
              <p className="text-muted-foreground">
                Answer as many as you can in 60 seconds!
              </p>
            </div>

            <div className="bg-card rounded-3xl p-6 md:p-8 shadow-card border border-border mb-6">
              <h2 className="text-xl font-bold mb-2">
                Which tables do you know?
              </h2>

              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {allTables.map((table) => (
                  <Button
                    key={table}
                    variant={
                      selectedTables.includes(table) ? "default" : "game"
                    }
                    size="sm"
                    onClick={() => toggleTable(table)}
                    className="w-12 h-12 text-lg font-bold"
                  >
                    {table}
                  </Button>
                ))}
              </div>

              <div className="flex flex-wrap justify-center gap-2 mb-6">
                <p className="w-full text-xs text-muted-foreground mb-1">
                  Quick select:
                </p>
                {[2, 3, 4, 5, 6, 10, 12].map((table) => (
                  <Button
                    key={table}
                    variant="outline"
                    size="sm"
                    onClick={() => selectUpTo(table)}
                    className="text-xs"
                  >
                    Up to {table}×
                  </Button>
                ))}
              </div>

              <Button size="xl" onClick={startGame}>
                <Zap className="w-6 h-6" />
                Start Race!
              </Button>
            </div>
          </div>
        )}

        {gameState === "playing" && (
          <div className="text-center">
            <div className="flex justify-between items-center mb-6">
              <div
                className={`text-2xl font-bold ${timeLeft <= 10 ? "text-destructive animate-pulse" : ""}`}
              >
                ⏱️ {timeLeft}s
              </div>
              <div className="text-2xl font-bold text-success">🎯 {score}</div>
            </div>

            {streak >= 3 && (
              <div className="mb-4 animate-bounce-gentle">
                <span className="bg-secondary/20 text-secondary px-4 py-2 rounded-full font-bold">
                  🔥 {streak} streak!
                </span>
              </div>
            )}

            <div className="bg-card rounded-3xl p-8 shadow-card border border-border mb-6">
              <div className="text-6xl md:text-7xl font-extrabold mb-6">
                {currentQuestion.a} × {currentQuestion.b}
              </div>

              <form
                onSubmit={handleSubmit}
                className="flex flex-col items-center gap-4"
              >
                <input
                  ref={inputRef}
                  type="number"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="w-32 h-16 text-3xl font-bold text-center border-2 border-border rounded-xl focus:border-primary focus:outline-none bg-background"
                  autoFocus
                />
                <Button size="lg" type="submit">
                  <Play className="w-5 h-5" />
                  Submit
                </Button>
              </form>
            </div>
          </div>
        )}

        {gameState === "finished" && (
          <div className="text-center">
            <div className="bg-card rounded-3xl p-8 shadow-card border border-border">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-secondary animate-bounce-gentle" />
              <h1 className="text-3xl font-extrabold mb-4">Time's Up!</h1>

              <div className="text-6xl font-extrabold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {score}
              </div>
              <p className="text-muted-foreground mb-2">
                questions answered correctly
              </p>

              {bestStreak >= 3 && (
                <p className="text-secondary font-bold mb-4">
                  🔥 Best streak: {bestStreak}
                </p>
              )}

              <p className="text-lg mb-6">{getPerformanceMessage()}</p>

              <div className="flex flex-wrap justify-center gap-3">
                <Button onClick={startGame} size="lg">
                  <RotateCcw className="w-5 h-5" />
                  Race Again
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setGameState("idle")}
                >
                  Change Tables
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showSavePrompt && (
        <SaveProgressPrompt
          session={getGameSession()}
          tableResults={tableResults}
          onClose={() => {
            setShowSavePrompt(false);
            setHasRecorded(true);
          }}
        />
      )}
    </Layout>
  );
};

export default SpeedRace;
