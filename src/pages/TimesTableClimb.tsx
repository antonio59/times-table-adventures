import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import { useUser } from "@/contexts/UserContext";
import { SaveProgressPrompt } from "@/components/SaveProgressPrompt";
import { toast } from "sonner";
import {
  Play,
  Trophy,
  Mountain,
  Star,
  Timer,
  RotateCcw,
  ArrowUp,
} from "lucide-react";

interface Level {
  a: number;
  b: number;
  answer: number;
}

const generateLevels = (table: number): Level[] => {
  const levels: Level[] = [];
  // Shuffle multipliers 1-12 for variety
  const multipliers = Array.from({ length: 12 }, (_, i) => i + 1).sort(
    () => Math.random() - 0.5,
  );

  for (const b of multipliers) {
    levels.push({ a: table, b, answer: table * b });
  }
  return levels;
};

type GameState = "idle" | "playing" | "finished" | "fallen";

const TimesTableClimb = () => {
  const { isLoggedIn, recordGame } = useUser();
  const [gameState, setGameState] = useState<GameState>("idle");
  const [selectedTable, setSelectedTable] = useState(2);
  const [levels, setLevels] = useState<Level[]>([]);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(10);
  const [timePerLevel, setTimePerLevel] = useState(10);
  const [mistakes, setMistakes] = useState(0);
  const [maxMistakes, setMaxMistakes] = useState(3);
  const [showWrong, setShowWrong] = useState(false);
  const [tableResults, setTableResults] = useState<
    { tableNumber: number; correct: boolean; timeMs: number }[]
  >([]);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const levelStartTime = useRef<number>(Date.now());
  const gameStartTime = useRef<number>(Date.now());
  const inputRef = useRef<HTMLInputElement>(null);

  const allTables = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const handleWrongAnswer = useCallback(() => {
    const timeMs = Date.now() - levelStartTime.current;
    setTableResults((prev) => [
      ...prev,
      { tableNumber: selectedTable, correct: false, timeMs },
    ]);

    setMistakes((prev) => {
      const newMistakes = prev + 1;
      if (newMistakes >= maxMistakes) {
        setGameState("fallen");
      }
      return newMistakes;
    });

    setShowWrong(true);
    setTimeout(() => {
      setShowWrong(false);
      setUserAnswer("");
      setTimeLeft(timePerLevel);
      levelStartTime.current = Date.now();
      inputRef.current?.focus();
    }, 1500);
  }, [selectedTable, maxMistakes, timePerLevel]);

  const startGame = useCallback(() => {
    setLevels(generateLevels(selectedTable));
    setCurrentLevel(0);
    setUserAnswer("");
    setTimeLeft(timePerLevel);
    setMistakes(0);
    setShowWrong(false);
    setTableResults([]);
    setHasRecorded(false);
    setShowSavePrompt(false);
    gameStartTime.current = Date.now();
    levelStartTime.current = Date.now();
    setGameState("playing");
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [selectedTable, timePerLevel]);

  useEffect(() => {
    if (gameState !== "playing") return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up - count as mistake
          handleWrongAnswer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, currentLevel, handleWrongAnswer]);

  const checkAnswer = () => {
    if (!levels[currentLevel] || userAnswer === "") return;

    const isCorrect = parseInt(userAnswer) === levels[currentLevel].answer;
    const timeMs = Date.now() - levelStartTime.current;

    if (isCorrect) {
      setTableResults((prev) => [
        ...prev,
        { tableNumber: selectedTable, correct: true, timeMs },
      ]);

      if (currentLevel >= levels.length - 1) {
        setGameState("finished");
      } else {
        setCurrentLevel((prev) => prev + 1);
        setUserAnswer("");
        setTimeLeft(timePerLevel);
        levelStartTime.current = Date.now();
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    } else {
      handleWrongAnswer();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !showWrong) {
      checkAnswer();
    }
  };

  const getGameSession = useCallback(
    () => ({
      gameType: "climb" as const,
      tablesUsed: [selectedTable],
      score: currentLevel,
      totalQuestions: levels.length,
      correctAnswers: currentLevel,
      bestStreak: currentLevel,
      timeSpent: Math.round((Date.now() - gameStartTime.current) / 1000),
    }),
    [selectedTable, currentLevel, levels.length],
  );

  useEffect(() => {
    if ((gameState !== "finished" && gameState !== "fallen") || hasRecorded)
      return;

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

  const heightPercentage = (currentLevel / 12) * 100;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        {gameState === "idle" && (
          <div className="text-center">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
                <Mountain className="inline w-8 h-8 mr-2" />
                Times Table Climb
              </h1>
              <p className="text-muted-foreground">
                Climb to the top by answering all 12 questions correctly! But be
                careful - {maxMistakes} mistakes and you fall!
              </p>
            </div>

            <div className="bg-card rounded-3xl p-6 md:p-8 shadow-card border border-border mb-6">
              <h2 className="text-xl font-bold mb-4">Choose your mountain</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Each mountain is a different times table to master
              </p>

              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {allTables.map((table) => (
                  <Button
                    key={table}
                    variant={selectedTable === table ? "default" : "game"}
                    size="sm"
                    onClick={() => setSelectedTable(table)}
                    className="w-14 h-14 text-lg font-bold flex flex-col"
                  >
                    <Mountain className="w-4 h-4" />
                    {table}×
                  </Button>
                ))}
              </div>

              <h2 className="text-lg font-bold mb-2">Difficulty</h2>
              <div className="grid grid-cols-3 gap-2 mb-6">
                <Button
                  variant={
                    timePerLevel === 15 && maxMistakes === 5
                      ? "default"
                      : "game"
                  }
                  size="sm"
                  onClick={() => {
                    setTimePerLevel(15);
                    setMaxMistakes(5);
                  }}
                  className="flex flex-col h-auto py-2"
                >
                  <span className="text-lg">🌱</span>
                  <span className="text-xs">Easy</span>
                  <span className="text-xs text-muted-foreground">
                    15s, 5 lives
                  </span>
                </Button>
                <Button
                  variant={
                    timePerLevel === 10 && maxMistakes === 3
                      ? "default"
                      : "game"
                  }
                  size="sm"
                  onClick={() => {
                    setTimePerLevel(10);
                    setMaxMistakes(3);
                  }}
                  className="flex flex-col h-auto py-2"
                >
                  <span className="text-lg">🏔️</span>
                  <span className="text-xs">Normal</span>
                  <span className="text-xs text-muted-foreground">
                    10s, 3 lives
                  </span>
                </Button>
                <Button
                  variant={
                    timePerLevel === 5 && maxMistakes === 1 ? "default" : "game"
                  }
                  size="sm"
                  onClick={() => {
                    setTimePerLevel(5);
                    setMaxMistakes(1);
                  }}
                  className="flex flex-col h-auto py-2"
                >
                  <span className="text-lg">🗻</span>
                  <span className="text-xs">Expert</span>
                  <span className="text-xs text-muted-foreground">
                    5s, 1 life
                  </span>
                </Button>
              </div>

              <Button size="xl" onClick={startGame}>
                <ArrowUp className="w-6 h-6" />
                Start Climbing!
              </Button>
            </div>
          </div>
        )}

        {gameState === "playing" && levels[currentLevel] && (
          <div>
            {/* Progress visualization */}
            <div className="flex gap-4 mb-6">
              {/* Mountain visualization */}
              <div className="flex-1 relative">
                <div className="h-64 bg-gradient-to-t from-green-200 to-blue-100 rounded-2xl relative overflow-hidden">
                  {/* Mountain shape */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[120px] border-r-[120px] border-b-[240px] border-l-transparent border-r-transparent border-b-gray-400" />
                  {/* Snow cap */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[30px] border-r-[30px] border-b-[60px] border-l-transparent border-r-transparent border-b-white" />
                  {/* Climber */}
                  <div
                    className="absolute left-1/2 -translate-x-1/2 text-3xl transition-all duration-500"
                    style={{ bottom: `${Math.min(heightPercentage, 90)}%` }}
                  >
                    🧗
                  </div>
                  {/* Flag at top */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 text-2xl">
                    🚩
                  </div>
                </div>
              </div>

              {/* Stats panel */}
              <div className="w-32 flex flex-col gap-2">
                <div className="bg-card rounded-xl p-3 text-center border border-border">
                  <p className="text-xs text-muted-foreground">Level</p>
                  <p className="text-2xl font-bold">{currentLevel + 1}/12</p>
                </div>
                <div
                  className={`bg-card rounded-xl p-3 text-center border border-border ${timeLeft <= 3 ? "animate-pulse bg-destructive/10" : ""}`}
                >
                  <p className="text-xs text-muted-foreground">Time</p>
                  <p
                    className={`text-2xl font-bold flex items-center justify-center gap-1 ${timeLeft <= 3 ? "text-destructive" : ""}`}
                  >
                    <Timer className="w-4 h-4" />
                    {timeLeft}s
                  </p>
                </div>
                <div className="bg-card rounded-xl p-3 text-center border border-border">
                  <p className="text-xs text-muted-foreground">Lives</p>
                  <p className="text-xl">
                    {Array.from({ length: maxMistakes }).map((_, i) => (
                      <span
                        key={i}
                        className={
                          i < maxMistakes - mistakes ? "" : "opacity-30"
                        }
                      >
                        ❤️
                      </span>
                    ))}
                  </p>
                </div>
              </div>
            </div>

            {/* Question */}
            <div
              className={`bg-card rounded-3xl p-6 shadow-card border border-border transition-all ${showWrong ? "border-destructive bg-destructive/5 animate-shake" : ""}`}
            >
              <div className="text-center">
                <div className="text-5xl md:text-6xl font-extrabold mb-4">
                  {levels[currentLevel].a} × {levels[currentLevel].b} = ?
                </div>

                {showWrong ? (
                  <div className="text-destructive text-xl font-bold mb-4 animate-pulse">
                    ❌ The answer was {levels[currentLevel].answer}
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <input
                      ref={inputRef}
                      type="number"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="w-32 h-16 text-3xl font-bold text-center border-2 border-border rounded-xl focus:border-primary focus:outline-none bg-background"
                      autoFocus
                      aria-label="Your answer"
                    />
                    <Button
                      size="lg"
                      onClick={checkAnswer}
                      disabled={userAnswer === ""}
                    >
                      <ArrowUp className="w-5 h-5" />
                      Climb!
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {gameState === "finished" && (
          <div className="text-center">
            <div className="bg-card rounded-3xl p-8 shadow-card border border-border">
              <div className="text-6xl mb-4">🏆🚩</div>
              <h1 className="text-3xl font-extrabold mb-2">Summit Reached!</h1>
              <p className="text-xl text-muted-foreground mb-4">
                You conquered the {selectedTable}× mountain!
              </p>

              <div className="flex justify-center gap-1 mb-4">
                {[1, 2, 3].map((star) => (
                  <Star
                    key={star}
                    className={`w-10 h-10 ${
                      star <=
                      (maxMistakes - mistakes >= 2
                        ? 3
                        : maxMistakes - mistakes >= 1
                          ? 2
                          : 1)
                        ? "text-secondary fill-secondary"
                        : "text-muted"
                    }`}
                  />
                ))}
              </div>

              <div className="bg-muted/50 rounded-xl p-4 mb-6">
                <p className="text-sm text-muted-foreground">
                  Lives remaining:{" "}
                  {Array.from({ length: maxMistakes - mistakes })
                    .map(() => "❤️")
                    .join("")}
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-3">
                <Button onClick={startGame} size="lg">
                  <RotateCcw className="w-5 h-5" />
                  Climb Again
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setGameState("idle")}
                >
                  Choose Another Mountain
                </Button>
              </div>
            </div>
          </div>
        )}

        {gameState === "fallen" && (
          <div className="text-center">
            <div className="bg-card rounded-3xl p-8 shadow-card border border-border">
              <div className="text-6xl mb-4">😢</div>
              <h1 className="text-3xl font-extrabold mb-2">You Slipped!</h1>
              <p className="text-xl text-muted-foreground mb-4">
                You reached level {currentLevel + 1} of 12
              </p>

              <div className="bg-muted/50 rounded-xl p-4 mb-6">
                <p className="text-lg font-bold">
                  You got {currentLevel} out of 12 correct!
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Don't give up! Practice makes perfect! 💪
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-3">
                <Button onClick={startGame} size="lg">
                  <RotateCcw className="w-5 h-5" />
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setGameState("idle")}
                >
                  Choose Another Mountain
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

export default TimesTableClimb;
