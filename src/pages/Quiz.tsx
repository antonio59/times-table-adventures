import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import { useUser } from "@/contexts/UserContext";
import { useSound } from "@/contexts/SoundContext";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { SaveProgressPrompt } from "@/components/SaveProgressPrompt";
import { WrongAnswerHelp } from "@/components/WrongAnswerHelp";
import { KeyboardShortcutsHelp } from "@/components/KeyboardShortcutsHelp";
import {
  StreakFire,
  AnimatedStars,
  AnimatedProgress,
} from "@/components/AnimatedElements";
import {
  celebrateCorrect,
  celebrateStreak,
  celebrateWin,
  celebratePerfect,
} from "@/lib/confetti";
import { toast } from "sonner";
import {
  Play,
  Trophy,
  Star,
  Clock,
  RotateCcw,
  Check,
  Timer,
  HelpCircle,
  Keyboard,
} from "lucide-react";

interface Question {
  a: number;
  b: number;
  answer: number;
  options: number[];
}

const generateQuestion = (selectedTables: number[]): Question => {
  const a = selectedTables[Math.floor(Math.random() * selectedTables.length)];
  const b = Math.floor(Math.random() * 12) + 1;
  const answer = a * b;

  // Generate wrong options that are more realistic
  const wrongOptions = new Set<number>();

  // Add common mistake patterns
  const commonMistakes = [
    answer + a, // Added one more group
    answer - a, // One less group
    answer + b, // Added one more
    answer - b, // One less
    answer + 1, // Off by one
    answer - 1, // Off by one
    a + b, // Addition instead of multiplication
    answer + 10, // Decade error
    answer - 10, // Decade error
    Math.abs(answer * 2 - answer), // Double/half confusion
  ];

  // Shuffle and pick from common mistakes first
  const shuffledMistakes = commonMistakes.sort(() => Math.random() - 0.5);
  for (const wrong of shuffledMistakes) {
    if (wrong !== answer && wrong > 0 && !wrongOptions.has(wrong)) {
      wrongOptions.add(wrong);
      if (wrongOptions.size >= 3) break;
    }
  }

  // Fill remaining with random if needed
  while (wrongOptions.size < 3) {
    const wrong = answer + (Math.floor(Math.random() * 20) - 10);
    if (wrong !== answer && wrong > 0 && !wrongOptions.has(wrong)) {
      wrongOptions.add(wrong);
    }
  }

  const options = [...Array.from(wrongOptions), answer].sort(
    () => Math.random() - 0.5,
  );

  return { a, b, answer, options };
};

type GameState = "idle" | "playing" | "finished";

const Quiz = () => {
  const { isLoggedIn, recordGame } = useUser();
  const { play: playSound } = useSound();
  const [gameState, setGameState] = useState<GameState>("idle");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [questionTimeLeft, setQuestionTimeLeft] = useState(10);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showCorrect, setShowCorrect] = useState(false);
  const [selectedTables, setSelectedTables] = useState<number[]>([2]);
  const [timePerQuestion, setTimePerQuestion] = useState<number>(10);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [tableResults, setTableResults] = useState<
    { tableNumber: number; correct: boolean; timeMs: number }[]
  >([]);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [lastWrongAnswer, setLastWrongAnswer] = useState<number | null>(null);
  const questionStartTime = useRef<number>(Date.now());
  const gameStartTime = useRef<number>(Date.now());

  // Keyboard shortcuts for quiz answers
  useKeyboardShortcuts({
    shortcuts: [
      {
        key: "1",
        description: "Select first answer",
        action: () => {
          if (
            gameState === "playing" &&
            selectedAnswer === null &&
            questions[currentIndex]?.options[0]
          ) {
            handleAnswer(questions[currentIndex].options[0]);
          }
        },
        disabled: gameState !== "playing" || selectedAnswer !== null,
      },
      {
        key: "2",
        description: "Select second answer",
        action: () => {
          if (
            gameState === "playing" &&
            selectedAnswer === null &&
            questions[currentIndex]?.options[1]
          ) {
            handleAnswer(questions[currentIndex].options[1]);
          }
        },
        disabled: gameState !== "playing" || selectedAnswer !== null,
      },
      {
        key: "3",
        description: "Select third answer",
        action: () => {
          if (
            gameState === "playing" &&
            selectedAnswer === null &&
            questions[currentIndex]?.options[2]
          ) {
            handleAnswer(questions[currentIndex].options[2]);
          }
        },
        disabled: gameState !== "playing" || selectedAnswer !== null,
      },
      {
        key: "4",
        description: "Select fourth answer",
        action: () => {
          if (
            gameState === "playing" &&
            selectedAnswer === null &&
            questions[currentIndex]?.options[3]
          ) {
            handleAnswer(questions[currentIndex].options[3]);
          }
        },
        disabled: gameState !== "playing" || selectedAnswer !== null,
      },
      {
        key: "Space",
        description: "Start game",
        action: () => {
          if (gameState === "idle") {
            startGame();
          }
        },
        disabled: gameState !== "idle",
      },
      {
        key: "Escape",
        description: "Go back to settings",
        action: () => {
          if (gameState === "finished") {
            setGameState("idle");
          } else if (showShortcuts) {
            setShowShortcuts(false);
          } else if (showHelp) {
            setShowHelp(false);
          }
        },
      },
      {
        key: "?",
        description: "Show keyboard shortcuts",
        action: () => setShowShortcuts(true),
      },
    ],
    enabled: true,
  });

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
    playSound("gameStart");
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
  }, [selectedTables, timePerQuestion, questionCount, playSound]);

  useEffect(() => {
    if (gameState !== "playing" || selectedAnswer !== null) return;

    const timer = setInterval(() => {
      setQuestionTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up for this question - auto-fail and move on
          const timeMs = Date.now() - questionStartTime.current;
          setTableResults((prevResults) => [
            ...prevResults,
            { tableNumber: questions[currentIndex].a, correct: false, timeMs },
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
      { tableNumber: questions[currentIndex].a, correct: isCorrect, timeMs },
    ]);

    if (isCorrect) {
      setScore((prev) => prev + 1);
      setStreak((prev) => {
        const newStreak = prev + 1;
        if (newStreak > bestStreak) setBestStreak(newStreak);
        // Celebrate streaks
        if (newStreak >= 5) {
          celebrateStreak(newStreak);
          playSound("streak");
        } else if (newStreak >= 3) {
          celebrateCorrect();
          playSound("streak");
        } else {
          playSound("correct");
        }
        return newStreak;
      });
    } else {
      playSound("wrong");
      setShowCorrect(true);
      setStreak(0);
      setLastWrongAnswer(answer);
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
      gameType: "quiz" as const,
      tablesUsed: selectedTables,
      score,
      totalQuestions: questions.length,
      correctAnswers: score,
      bestStreak,
      timeSpent: Math.round((Date.now() - gameStartTime.current) / 1000),
    }),
    [selectedTables, score, questions.length, bestStreak],
  );

  // Record game when finished (only if logged in)
  useEffect(() => {
    if (gameState !== "finished" || hasRecorded) return;

    // Celebrate completion
    if (score === questions.length) {
      celebratePerfect();
    } else if (score >= questions.length * 0.7) {
      celebrateWin();
    }

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
      // Show save prompt for non-logged-in users after a short delay
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
    score,
    questions.length,
  ]);

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        {gameState === "idle" && (
          <div className="text-center">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
                🎮 Quiz Challenge
              </h1>
              <p className="text-muted-foreground">
                Select the times tables you've learned, then test yourself!
              </p>
            </div>

            <div className="bg-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-card border border-border mb-6">
              <h2 className="text-lg sm:text-xl font-bold mb-2">
                Which tables do you know?
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                Click tables or use quick select below
              </p>

              <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-4">
                {allTables.map((table) => (
                  <Button
                    key={table}
                    variant={
                      selectedTables.includes(table) ? "default" : "game"
                    }
                    size="sm"
                    onClick={() => toggleTable(table)}
                    className="w-11 h-11 sm:w-12 sm:h-12 text-base sm:text-lg font-bold relative min-w-[44px] min-h-[44px]"
                  >
                    {table}
                    {selectedTables.includes(table) && (
                      <Check className="w-3 h-3 absolute -top-1 -right-1 bg-success text-success-foreground rounded-full p-0.5" />
                    )}
                  </Button>
                ))}
              </div>

              <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-4 sm:mb-6">
                <p className="w-full text-xs text-muted-foreground mb-1">
                  Quick select up to:
                </p>
                {[2, 3, 4, 5, 6, 10, 12].map((table) => (
                  <Button
                    key={table}
                    variant="outline"
                    size="sm"
                    onClick={() => selectUpTo(table)}
                    className="text-xs min-h-[36px] px-2 sm:px-3"
                  >
                    Up to {table}×
                  </Button>
                ))}
              </div>

              <h2 className="text-base sm:text-lg font-bold mb-2">
                Time per question
              </h2>
              <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-4 sm:mb-6">
                {[5, 10, 15, 20, 30].map((seconds) => (
                  <Button
                    key={seconds}
                    variant={timePerQuestion === seconds ? "default" : "game"}
                    size="sm"
                    onClick={() => setTimePerQuestion(seconds)}
                    className="min-h-[40px] min-w-[50px]"
                  >
                    <Timer className="w-3 h-3" />
                    {seconds}s
                  </Button>
                ))}
              </div>

              <h2 className="text-base sm:text-lg font-bold mb-2">
                Number of questions
              </h2>
              <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-4 sm:mb-6">
                {[5, 10, 15, 20].map((count) => (
                  <Button
                    key={count}
                    variant={questionCount === count ? "default" : "game"}
                    size="sm"
                    onClick={() => setQuestionCount(count)}
                    className="min-h-[40px] min-w-[50px]"
                  >
                    {count} Qs
                  </Button>
                ))}
              </div>

              <div className="bg-muted/50 rounded-2xl p-4 mb-6">
                <p className="text-sm">
                  <span className="font-semibold">Your quiz:</span>{" "}
                  {selectedTables.length === 1
                    ? `${selectedTables[0]}× table`
                    : `${selectedTables.length} tables (${selectedTables[0]}× to ${selectedTables[selectedTables.length - 1]}×)`}
                </p>
                <p className="text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 inline mr-1" />
                  {questionCount} questions • {timePerQuestion}s each
                </p>
              </div>

              <Button size="xl" onClick={startGame}>
                <Play className="w-6 h-6" />
                Start Quiz!
              </Button>

              <div className="mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowShortcuts(true)}
                  className="text-muted-foreground"
                >
                  <Keyboard className="w-4 h-4 mr-1" />
                  Keyboard shortcuts (?)
                </Button>
              </div>
            </div>
          </div>
        )}

        {gameState === "playing" && questions[currentIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold">
                  Question {currentIndex + 1}/{questions.length}
                </span>
                <motion.span
                  key={questionTimeLeft}
                  initial={questionTimeLeft <= 5 ? { scale: 1.2 } : {}}
                  animate={{ scale: 1 }}
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
                </motion.span>
              </div>
              <AnimatedProgress
                progress={((currentIndex + 1) / questions.length) * 100}
              />
            </div>

            <div className="text-center mb-4 flex items-center justify-center gap-3">
              <motion.span
                key={score}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center gap-2 bg-success/20 text-success px-4 py-2 rounded-full font-bold"
              >
                <Star className="w-4 h-4" />
                Score: {score}
              </motion.span>
              <StreakFire streak={streak} />
            </div>

            <motion.div
              key={currentIndex}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-card border border-border mb-6"
            >
              <div className="text-center mb-6 sm:mb-8">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="text-4xl sm:text-5xl md:text-6xl font-extrabold"
                >
                  {questions[currentIndex].a} × {questions[currentIndex].b}
                </motion.div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {questions[currentIndex].options.map((option, idx) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrectAnswer =
                    option === questions[currentIndex].answer;
                  const showAsCorrect = showCorrect && isCorrectAnswer;
                  const showAsWrong = isSelected && !isCorrectAnswer;

                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={
                        selectedAnswer === null ? { scale: 1.02 } : {}
                      }
                      whileTap={selectedAnswer === null ? { scale: 0.98 } : {}}
                    >
                      <Button
                        variant="game"
                        size="lg"
                        className={`w-full text-xl sm:text-2xl font-bold transition-all relative min-h-[56px] sm:min-h-[64px] ${
                          showAsCorrect
                            ? "!border-success !bg-success/10 !shadow-[0_0_20px_hsl(var(--success)/0.3)]"
                            : showAsWrong
                              ? "!border-destructive !bg-destructive/10 animate-shake"
                              : isSelected && isCorrectAnswer
                                ? "!border-success !bg-success/10 !shadow-[0_0_20px_hsl(var(--success)/0.3)]"
                                : ""
                        }`}
                        onClick={() => handleAnswer(option)}
                        disabled={selectedAnswer !== null}
                      >
                        {showAsCorrect && <span className="mr-2">✓</span>}
                        {showAsWrong && <span className="mr-2">✗</span>}
                        {option}
                        {/* Keyboard shortcut hint - hidden on touch devices */}
                        <span className="absolute top-1 left-2 text-xs text-muted-foreground/50 font-mono hidden sm:block">
                          {idx + 1}
                        </span>
                      </Button>
                    </motion.div>
                  );
                })}
              </div>

              {/* Help button when wrong */}
              <AnimatePresence>
                {showCorrect && lastWrongAnswer !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 text-center"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowHelp(true)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <HelpCircle className="w-4 h-4 mr-1" />
                      Why was I wrong? Learn a tip!
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}

        {gameState === "finished" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="text-center"
          >
            <div className="bg-card rounded-3xl p-8 shadow-card border border-border">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              >
                <Trophy className="w-16 h-16 mx-auto mb-4 text-secondary" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-extrabold mb-2"
              >
                Quiz Complete!
              </motion.h1>

              <div className="flex justify-center gap-1 mb-4">
                <AnimatedStars rating={getStarRating()} />
              </div>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
                className="text-5xl font-extrabold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
              >
                {score}/{questions.length}
              </motion.div>

              {bestStreak >= 3 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-sm text-muted-foreground mb-2"
                >
                  🔥 Best streak: {bestStreak} in a row!
                </motion.p>
              )}

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-muted-foreground mb-6"
              >
                {getStarRating() === 3
                  ? "Amazing! You're a multiplication master! 🎉"
                  : getStarRating() === 2
                    ? "Great job! Keep practicing! 💪"
                    : getStarRating() === 1
                      ? "Good effort! You're getting there! 🌟"
                      : "Keep practicing, you'll improve! 📚"}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex flex-wrap justify-center gap-3"
              >
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
              </motion.div>
            </div>
          </motion.div>
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

      {questions[currentIndex] && (
        <WrongAnswerHelp
          a={questions[currentIndex].a}
          b={questions[currentIndex].b}
          correctAnswer={questions[currentIndex].answer}
          userAnswer={lastWrongAnswer || 0}
          isOpen={showHelp}
          onClose={() => setShowHelp(false)}
        />
      )}

      <KeyboardShortcutsHelp
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
        context="quiz"
      />
    </Layout>
  );
};

export default Quiz;
