import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import { useUser } from "@/contexts/UserContext";
import { SaveProgressPrompt } from "@/components/SaveProgressPrompt";
import { toast } from "sonner";
import { ALL_TABLES } from "@/lib/constants";
import {
  HelpCircle,
  Play,
  Check,
  X,
  ArrowRight,
  RotateCcw,
  Save,
} from "lucide-react";

interface Problem {
  a: number;
  b: number;
  answer: number;
  missingPosition: "first" | "second" | "result";
  display: string;
  correctAnswer: number;
}

const MissingNumber = () => {
  const { isLoggedIn, recordGame } = useUser();
  const [selectedTables, setSelectedTables] = useState<number[]>([2, 3, 4, 5]);
  const [started, setStarted] = useState(false);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [showResult, setShowResult] = useState<"correct" | "wrong" | null>(
    null,
  );
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [tableResults, setTableResults] = useState<
    { tableNumber: number; correct: boolean; timeMs: number }[]
  >([]);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const questionStartTime = useRef<number>(Date.now());
  const sessionStartTime = useRef<number>(Date.now());

  const allTables = ALL_TABLES;

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

  const generateProblem = useCallback((): Problem => {
    const a = selectedTables[Math.floor(Math.random() * selectedTables.length)];
    const b = Math.floor(Math.random() * 12) + 1;
    const answer = a * b;

    const positions: Array<"first" | "second" | "result"> = [
      "first",
      "second",
      "result",
    ];
    const missingPosition =
      positions[Math.floor(Math.random() * positions.length)];

    let display: string;
    let correctAnswer: number;

    switch (missingPosition) {
      case "first":
        display = `? × ${b} = ${answer}`;
        correctAnswer = a;
        break;
      case "second":
        display = `${a} × ? = ${answer}`;
        correctAnswer = b;
        break;
      case "result":
        display = `${a} × ${b} = ?`;
        correctAnswer = answer;
        break;
    }

    return { a, b, answer, missingPosition, display, correctAnswer };
  }, [selectedTables]);

  const startPractice = useCallback(() => {
    setStarted(true);
    setProblem(generateProblem());
    setUserAnswer("");
    setShowResult(null);
    setScore({ correct: 0, total: 0 });
    setStreak(0);
    setBestStreak(0);
    setTableResults([]);
    sessionStartTime.current = Date.now();
    questionStartTime.current = Date.now();
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [generateProblem]);

  const nextProblem = () => {
    setProblem(generateProblem());
    setUserAnswer("");
    setShowResult(null);
    questionStartTime.current = Date.now();
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const checkAnswer = () => {
    if (!problem || userAnswer === "") return;

    const isCorrect = parseInt(userAnswer) === problem.correctAnswer;
    const timeMs = Date.now() - questionStartTime.current;

    setShowResult(isCorrect ? "correct" : "wrong");
    setScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));

    setTableResults((prev) => [
      ...prev,
      { tableNumber: problem.a, correct: isCorrect, timeMs },
    ]);

    if (isCorrect) {
      setStreak((prev) => {
        const newStreak = prev + 1;
        if (newStreak > bestStreak) setBestStreak(newStreak);
        return newStreak;
      });
    } else {
      setStreak(0);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (showResult) {
        nextProblem();
      } else {
        checkAnswer();
      }
    }
  };

  const getGameSession = useCallback(
    () => ({
      gameType: "missing" as const,
      tablesUsed: selectedTables,
      score: score.correct,
      totalQuestions: score.total,
      correctAnswers: score.correct,
      bestStreak,
      timeSpent: Math.round((Date.now() - sessionStartTime.current) / 1000),
    }),
    [selectedTables, score, bestStreak],
  );

  const saveSession = useCallback(async () => {
    if (!isLoggedIn || score.total === 0) return;

    const newAchievements = await recordGame(getGameSession(), tableResults);

    if (newAchievements.length > 0) {
      newAchievements.forEach((type) => {
        toast.success(`Achievement Unlocked: ${type.replace(/_/g, " ")}!`, {
          icon: "🏆",
        });
      });
    }

    toast.success("Progress saved!");
  }, [isLoggedIn, score.total, recordGame, getGameSession, tableResults]);

  const handleExit = () => {
    if (isLoggedIn && score.total > 0) {
      saveSession();
      setStarted(false);
      setScore({ correct: 0, total: 0 });
    } else if (!isLoggedIn && score.total >= 5) {
      setShowSavePrompt(true);
    } else {
      setStarted(false);
      setScore({ correct: 0, total: 0 });
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        {!started ? (
          <div className="text-center">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
                🔍 Missing Number
              </h1>
              <p className="text-muted-foreground">
                Find the missing number in each equation!
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

              <div className="bg-muted/50 rounded-2xl p-4 mb-6">
                <p className="text-sm text-muted-foreground">
                  <HelpCircle className="w-4 h-4 inline mr-1" />
                  You'll see equations like:{" "}
                  <span className="font-bold">3 × ? = 12</span> or{" "}
                  <span className="font-bold">? × 4 = 20</span>
                </p>
              </div>

              <Button size="xl" onClick={startPractice}>
                <Play className="w-6 h-6" />
                Start Practice!
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-center mb-4">
              <span className="inline-flex items-center gap-2 bg-success/20 text-success px-4 py-2 rounded-full font-bold">
                Score: {score.correct}/{score.total}
              </span>
            </div>

            {problem && (
              <div className="bg-card rounded-3xl p-8 shadow-card border border-border mb-6">
                <div className="text-center mb-8">
                  <p className="text-sm text-muted-foreground mb-4">
                    Find the missing number:
                  </p>
                  <div className="text-5xl md:text-6xl font-extrabold">
                    {problem.display}
                  </div>
                </div>

                <div className="flex flex-col items-center gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold">? =</span>
                    <input
                      ref={inputRef}
                      type="number"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={showResult !== null}
                      className="w-24 h-14 text-2xl font-bold text-center border-2 border-border rounded-xl focus:border-primary focus:outline-none bg-background"
                      autoFocus
                    />
                  </div>

                  {showResult === null ? (
                    <Button
                      size="lg"
                      onClick={checkAnswer}
                      disabled={userAnswer === ""}
                    >
                      <Check className="w-5 h-5" />
                      Check Answer
                    </Button>
                  ) : (
                    <div className="text-center">
                      <div
                        className={`flex items-center justify-center gap-2 text-2xl font-bold mb-4 ${
                          showResult === "correct"
                            ? "text-success"
                            : "text-destructive"
                        }`}
                      >
                        {showResult === "correct" ? (
                          <>
                            <Check className="w-8 h-8" />
                            Correct! 🎉
                          </>
                        ) : (
                          <>
                            <X className="w-8 h-8" />
                            The answer is {problem.correctAnswer}
                          </>
                        )}
                      </div>
                      <p className="text-muted-foreground mb-4">
                        {problem.a} × {problem.b} = {problem.answer}
                      </p>
                      <Button size="lg" onClick={nextProblem}>
                        <ArrowRight className="w-5 h-5" />
                        Next Problem
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-center gap-3">
              {isLoggedIn && score.total > 0 && (
                <Button variant="outline" onClick={saveSession}>
                  <Save className="w-4 h-4" />
                  Save Progress
                </Button>
              )}
              <Button variant="ghost" onClick={handleExit}>
                <RotateCcw className="w-4 h-4" />
                Change Tables
              </Button>
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
            setStarted(false);
            setScore({ correct: 0, total: 0 });
          }}
        />
      )}
    </Layout>
  );
};

export default MissingNumber;
