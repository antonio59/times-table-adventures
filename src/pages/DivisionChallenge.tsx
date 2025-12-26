import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import { useUser } from "@/contexts/UserContext";
import { SaveProgressPrompt } from "@/components/SaveProgressPrompt";
import { toast } from "sonner";
import {
  Play,
  Trophy,
  Star,
  Timer,
  RotateCcw,
  Check,
  Divide,
} from "lucide-react";

interface Question {
  dividend: number;
  divisor: number;
  answer: number;
  options: number[];
}

const generateQuestion = (selectedTables: number[]): Question => {
  const divisor =
    selectedTables[Math.floor(Math.random() * selectedTables.length)];
  const answer = Math.floor(Math.random() * 12) + 1;
  const dividend = divisor * answer;

  // Generate wrong options
  const wrongOptions = new Set<number>();
  const commonMistakes = [
    answer + 1,
    answer - 1,
    answer + 2,
    answer - 2,
    divisor,
    Math.floor(dividend / 10),
  ];

  for (const wrong of commonMistakes) {
    if (wrong !== answer && wrong > 0 && !wrongOptions.has(wrong)) {
      wrongOptions.add(wrong);
      if (wrongOptions.size >= 3) break;
    }
  }

  while (wrongOptions.size < 3) {
    const wrong = answer + (Math.floor(Math.random() * 10) - 5);
    if (wrong !== answer && wrong > 0 && !wrongOptions.has(wrong)) {
      wrongOptions.add(wrong);
    }
  }

  const options = [...Array.from(wrongOptions), answer].sort(
    () => Math.random() - 0.5,
  );

  return { dividend, divisor, answer, options };
};

type GameState = "idle" | "playing" | "finished";

const DivisionChallenge = () => {
  const { isLoggedIn, recordGame } = useUser();
  const [gameState, setGameState] = useState<GameState>("idle");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [questionTimeLeft, setQuestionTimeLeft] = useState(15);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showCorrect, setShowCorrect] = useState(false);
  const [selectedTables, setSelectedTables] = useState<number[]>([2, 5, 10]);
  const [timePerQuestion, setTimePerQuestion] = useState<number>(15);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [tableResults, setTableResults] = useState<
    { tableNumber: number; correct: boolean; timeMs: number }[]
  >([]);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const questionStartTime = useRef<number>(Date.now());
  const gameStartTime = useRef<number>(Date.now());

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
    const tables = allTables.filter((t) => t <= table);
    setSelectedTables(tables);
  };

  const startGame = useCallback(() => {
    const newQuestions = Array.from({ length: questionCount }, () =>
      generateQuestion(selectedTables),
    );
    setQuestions(newQuestions);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setQuestionTimeLeft(timePerQuestion);
    setSelectedAnswer(null);
    setShowCorrect(false);
    setTableResults([]);
    setHasRecorded(false);
    setShowSavePrompt(false);
    gameStartTime.current = Date.now();
    questionStartTime.current = Date.now();
    setGameState("playing");
  }, [selectedTables, timePerQuestion, questionCount]);

  useEffect(() => {
    if (gameState !== "playing" || selectedAnswer !== null) return;

    const timer = setInterval(() => {
      setQuestionTimeLeft((prev) => {
        if (prev <= 1) {
          const timeMs = Date.now() - questionStartTime.current;
          setTableResults((prevResults) => [
            ...prevResults,
            {
              tableNumber: questions[currentIndex].divisor,
              correct: false,
              timeMs,
            },
          ]);
          setStreak(0);
          setShowCorrect(true);

          setTimeout(() => {
            if (currentIndex < questions.length - 1) {
              setCurrentIndex((prevIdx) => prevIdx + 1);
              setSelectedAnswer(null);
              setShowCorrect(false);
              setQuestionTimeLeft(timePerQuestion);
              questionStartTime.current = Date.now();
            } else {
              setGameState("finished");
            }
          }, 1500);

          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, selectedAnswer, currentIndex, questions, timePerQuestion]);

  const handleAnswer = (answer: number) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(answer);
    const isCorrect = answer === questions[currentIndex].answer;
    const timeMs = Date.now() - questionStartTime.current;

    setTableResults((prev) => [
      ...prev,
      {
        tableNumber: questions[currentIndex].divisor,
        correct: isCorrect,
        timeMs,
      },
    ]);

    if (isCorrect) {
      setScore((prev) => prev + 1);
      setStreak((prev) => {
        const newStreak = prev + 1;
        if (newStreak > bestStreak) setBestStreak(newStreak);
        return newStreak;
      });
    } else {
      setShowCorrect(true);
      setStreak(0);
    }

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedAnswer(null);
        setShowCorrect(false);
        setQuestionTimeLeft(timePerQuestion);
        questionStartTime.current = Date.now();
      } else {
        setGameState("finished");
      }
    }, 1000);
  };

  const getStarRating = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage >= 90) return 3;
    if (percentage >= 70) return 2;
    if (percentage >= 50) return 1;
    return 0;
  };

  const getGameSession = useCallback(
    () => ({
      gameType: "division" as const,
      tablesUsed: selectedTables,
      score,
      totalQuestions: questions.length,
      correctAnswers: score,
      bestStreak,
      timeSpent: Math.round((Date.now() - gameStartTime.current) / 1000),
    }),
    [selectedTables, score, questions.length, bestStreak],
  );

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
                <Divide className="inline w-8 h-8 mr-2" />
                Division Challenge
              </h1>
              <p className="text-muted-foreground">
                Use your times tables knowledge backwards! If you know 3 × 4 =
                12, then 12 ÷ 4 = 3
              </p>
            </div>

            <div className="bg-card rounded-3xl p-6 md:p-8 shadow-card border border-border mb-6">
              <h2 className="text-xl font-bold mb-2">
                Which division facts do you want to practice?
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Select the tables you know - we'll test you on dividing by those
                numbers
              </p>

              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {allTables.map((table) => (
                  <Button
                    key={table}
                    variant={
                      selectedTables.includes(table) ? "default" : "game"
                    }
                    size="sm"
                    onClick={() => toggleTable(table)}
                    className="w-12 h-12 text-lg font-bold relative"
                    aria-label={`${selectedTables.includes(table) ? "Deselect" : "Select"} dividing by ${table}`}
                  >
                    ÷{table}
                    {selectedTables.includes(table) && (
                      <Check className="w-3 h-3 absolute -top-1 -right-1 bg-success text-success-foreground rounded-full p-0.5" />
                    )}
                  </Button>
                ))}
              </div>

              <div className="flex flex-wrap justify-center gap-2 mb-6">
                <p className="w-full text-xs text-muted-foreground mb-1">
                  Quick select up to:
                </p>
                {[2, 3, 4, 5, 6, 10, 12].map((table) => (
                  <Button
                    key={table}
                    variant="outline"
                    size="sm"
                    onClick={() => selectUpTo(table)}
                    className="text-xs"
                  >
                    Up to ÷{table}
                  </Button>
                ))}
              </div>

              <h2 className="text-lg font-bold mb-2">Time per question</h2>
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {[10, 15, 20, 30].map((seconds) => (
                  <Button
                    key={seconds}
                    variant={timePerQuestion === seconds ? "default" : "game"}
                    size="sm"
                    onClick={() => setTimePerQuestion(seconds)}
                  >
                    <Timer className="w-3 h-3" />
                    {seconds}s
                  </Button>
                ))}
              </div>

              <h2 className="text-lg font-bold mb-2">Number of questions</h2>
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {[5, 10, 15, 20].map((count) => (
                  <Button
                    key={count}
                    variant={questionCount === count ? "default" : "game"}
                    size="sm"
                    onClick={() => setQuestionCount(count)}
                  >
                    {count} Qs
                  </Button>
                ))}
              </div>

              <div className="bg-muted/50 rounded-2xl p-4 mb-6">
                <p className="text-sm">
                  <span className="font-semibold">Your challenge:</span>{" "}
                  Division by{" "}
                  {selectedTables.length === 1
                    ? selectedTables[0]
                    : `${selectedTables.length} numbers`}
                </p>
                <p className="text-sm text-muted-foreground">
                  {questionCount} questions • {timePerQuestion}s each
                </p>
              </div>

              <Button size="xl" onClick={startGame}>
                <Play className="w-6 h-6" />
                Start Challenge!
              </Button>
            </div>

            <div className="bg-secondary/20 rounded-2xl p-4 text-sm">
              <p className="font-semibold mb-2">💡 Division Tip:</p>
              <p className="text-muted-foreground">
                Think of division as "how many groups?" If you have 24 ÷ 6, ask
                yourself: "6 times what equals 24?" The answer is 4!
              </p>
            </div>
          </div>
        )}

        {gameState === "playing" && questions[currentIndex] && (
          <div>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold">
                  Question {currentIndex + 1}/{questions.length}
                </span>
                <span
                  className={`text-sm font-bold flex items-center gap-1 ${
                    questionTimeLeft <= 3
                      ? "text-destructive animate-pulse"
                      : questionTimeLeft <= 5
                        ? "text-warning"
                        : "text-muted-foreground"
                  }`}
                >
                  <Timer className="w-4 h-4" />
                  {questionTimeLeft}s
                </span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full gradient-secondary transition-all duration-300"
                  style={{
                    width: `${((currentIndex + 1) / questions.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="text-center mb-4">
              <span className="inline-flex items-center gap-2 bg-success/20 text-success px-4 py-2 rounded-full font-bold">
                <Star className="w-4 h-4" />
                Score: {score}
              </span>
              {streak >= 3 && (
                <span className="ml-2 inline-flex items-center gap-1 bg-secondary/20 text-secondary px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                  🔥 {streak} streak!
                </span>
              )}
            </div>

            <div className="bg-card rounded-3xl p-8 shadow-card border border-border mb-6">
              <div className="text-center mb-8">
                <div className="text-5xl md:text-6xl font-extrabold">
                  {questions[currentIndex].dividend} ÷{" "}
                  {questions[currentIndex].divisor}
                </div>
                <p className="text-muted-foreground mt-2">
                  What times {questions[currentIndex].divisor} equals{" "}
                  {questions[currentIndex].dividend}?
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {questions[currentIndex].options.map((option, idx) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrectAnswer =
                    option === questions[currentIndex].answer;
                  const showAsCorrect = showCorrect && isCorrectAnswer;
                  const showAsWrong = isSelected && !isCorrectAnswer;

                  return (
                    <Button
                      key={idx}
                      variant="game"
                      size="lg"
                      className={`text-2xl font-bold transition-all ${
                        showAsCorrect
                          ? "!border-success !bg-success/10 !shadow-[0_0_20px_hsl(var(--success)/0.3)]"
                          : showAsWrong
                            ? "!border-destructive !bg-destructive/10"
                            : isSelected && isCorrectAnswer
                              ? "!border-success !bg-success/10 !shadow-[0_0_20px_hsl(var(--success)/0.3)]"
                              : ""
                      }`}
                      onClick={() => handleAnswer(option)}
                      disabled={selectedAnswer !== null}
                      aria-label={`Answer option: ${option}`}
                    >
                      {option}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {gameState === "finished" && (
          <div className="text-center">
            <div className="bg-card rounded-3xl p-8 shadow-card border border-border">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-secondary animate-bounce-gentle" />
              <h1 className="text-3xl font-extrabold mb-2">
                Challenge Complete!
              </h1>

              <div className="flex justify-center gap-1 mb-4">
                {[1, 2, 3].map((star) => (
                  <Star
                    key={star}
                    className={`w-10 h-10 ${
                      star <= getStarRating()
                        ? "text-secondary fill-secondary"
                        : "text-muted"
                    }`}
                  />
                ))}
              </div>

              <div className="text-5xl font-extrabold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {score}/{questions.length}
              </div>

              {bestStreak >= 3 && (
                <p className="text-sm text-muted-foreground mb-2">
                  🔥 Best streak: {bestStreak} in a row!
                </p>
              )}

              <p className="text-muted-foreground mb-6">
                {getStarRating() === 3
                  ? "Incredible! You're a division master! 🎉"
                  : getStarRating() === 2
                    ? "Great work! Division is getting easier! 💪"
                    : getStarRating() === 1
                      ? "Good effort! Keep practicing! 🌟"
                      : "Division takes practice. You'll get there! 📚"}
              </p>

              <div className="flex flex-wrap justify-center gap-3">
                <Button onClick={startGame} size="lg">
                  <RotateCcw className="w-5 h-5" />
                  Play Again
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setGameState("idle")}
                >
                  Change Settings
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

export default DivisionChallenge;
