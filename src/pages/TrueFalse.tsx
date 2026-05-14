import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import { useUser } from "@/contexts/UserContext";
import { useSound } from "@/contexts/SoundContext";
import { SaveProgressPrompt } from "@/components/SaveProgressPrompt";
import {
  celebrateCorrect,
  celebrateWin,
  celebratePerfect,
} from "@/lib/confetti";
import { toast } from "sonner";
import { ALL_TABLES } from "@/lib/constants";
import {
  Play,
  Trophy,
  Star,
  RotateCcw,
  Check,
  X,
  ThumbsUp,
  ThumbsDown,
  Shuffle,
  Zap,
} from "lucide-react";

interface Question {
  factor1: number;
  factor2: number;
  shownAnswer: number;
  isCorrect: boolean;
}

const generateQuestion = (tables: number[]): Question => {
  const factor1 = tables[Math.floor(Math.random() * tables.length)];
  const factor2 = Math.floor(Math.random() * 12) + 1;
  const correctAnswer = factor1 * factor2;

  // 50% chance to show correct answer, 50% chance to show wrong answer
  const isCorrect = Math.random() > 0.5;

  let shownAnswer: number;
  if (isCorrect) {
    shownAnswer = correctAnswer;
  } else {
    // Generate a plausible wrong answer
    const offsets = [-2, -1, 1, 2, -factor1, factor1, -factor2, factor2];
    const offset = offsets[Math.floor(Math.random() * offsets.length)];
    shownAnswer = correctAnswer + offset;
    // Make sure it's not accidentally correct and is positive
    if (shownAnswer === correctAnswer || shownAnswer <= 0) {
      shownAnswer = correctAnswer + (Math.random() > 0.5 ? 1 : -1);
      if (shownAnswer <= 0) shownAnswer = correctAnswer + 1;
    }
  }

  return { factor1, factor2, shownAnswer, isCorrect };
};

type GameState = "idle" | "playing" | "finished";

const TrueFalse = () => {
  const { isLoggedIn, recordGame } = useUser();
  const { play: playSound } = useSound();
  const [gameState, setGameState] = useState<GameState>("idle");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [showCorrect, setShowCorrect] = useState(false);
  const [selectedTables, setSelectedTables] = useState<number[]>([2, 3, 4, 5]);
  const [questionCount, setQuestionCount] = useState(15);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [tableResults, setTableResults] = useState<
    { tableNumber: number; correct: boolean; timeMs: number }[]
  >([]);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timedMode, setTimedMode] = useState(false);
  const questionStartTime = useRef<number>(Date.now());
  const gameStartTime = useRef<number>(Date.now());

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

  const startGame = useCallback(() => {
    playSound("gameStart");
    const newQuestions = Array.from(
      { length: timedMode ? 100 : questionCount },
      () => generateQuestion(selectedTables),
    );
    setQuestions(newQuestions);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setSelectedAnswer(null);
    setShowCorrect(false);
    setTableResults([]);
    setHasRecorded(false);
    setShowSavePrompt(false);
    setTimeLeft(timedMode ? 60 : 0);
    gameStartTime.current = Date.now();
    questionStartTime.current = Date.now();
    setGameState("playing");
  }, [selectedTables, questionCount, playSound, timedMode]);

  // Timer for timed mode
  useEffect(() => {
    if (gameState !== "playing" || !timedMode) return;

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
  }, [gameState, timedMode]);

  const handleAnswer = (answer: boolean) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(answer);
    const question = questions[currentIndex];
    const isCorrect = answer === question.isCorrect;

    const timeMs = Date.now() - questionStartTime.current;

    setTableResults((prev) => [
      ...prev,
      { tableNumber: question.factor1, correct: isCorrect, timeMs },
    ]);

    if (isCorrect) {
      setScore((prev) => prev + 1);
      setStreak((prev) => {
        const newStreak = prev + 1;
        if (newStreak > bestStreak) setBestStreak(newStreak);
        if (newStreak >= 3) {
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
    }

    const delay = timedMode ? 600 : 1000;
    setTimeout(() => {
      if (
        currentIndex < questions.length - 1 &&
        (timedMode ? timeLeft > 0 : true)
      ) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedAnswer(null);
        setShowCorrect(false);
        questionStartTime.current = Date.now();
      } else if (!timedMode) {
        setGameState("finished");
      }
    }, delay);
  };

  const getStarRating = () => {
    const answered = timedMode ? currentIndex + 1 : questions.length;
    const percentage = (score / answered) * 100;
    if (percentage >= 90) return 3;
    if (percentage >= 70) return 2;
    if (percentage >= 50) return 1;
    return 0;
  };

  const getGameSession = useCallback(
    () => ({
      gameType: "truefalse" as const,
      tablesUsed: selectedTables,
      score,
      totalQuestions: timedMode ? currentIndex + 1 : questions.length,
      correctAnswers: score,
      bestStreak,
      timeSpent: timedMode
        ? 60
        : Math.round((Date.now() - gameStartTime.current) / 1000),
    }),
    [
      selectedTables,
      score,
      questions.length,
      bestStreak,
      timedMode,
      currentIndex,
    ],
  );

  useEffect(() => {
    if (gameState !== "finished" || hasRecorded) return;

    const answered = timedMode ? currentIndex + 1 : questions.length;
    if (score === answered && answered > 0) {
      celebratePerfect();
    } else if (score >= answered * 0.7) {
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
      const timer = setTimeout(() => setShowSavePrompt(true), 1500);
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
    timedMode,
    currentIndex,
  ]);

  const currentQuestion = questions[currentIndex];

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        {gameState === "idle" && (
          <div className="text-center">
            <div className="mb-6 sm:mb-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-2xl gradient-fun flex items-center justify-center">
                <ThumbsUp className="w-8 h-8 sm:w-10 sm:h-10 text-primary-foreground" />
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-2">
                True or False
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Is the equation correct? Quick thinking required!
              </p>
            </div>

            <div className="bg-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-card border border-border mb-6">
              <h2 className="text-lg sm:text-xl font-bold mb-2">
                Select Tables
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                Choose which times tables to practice
              </p>

              <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-6">
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

              <h2 className="text-base sm:text-lg font-bold mb-2">Game Mode</h2>
              <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-4">
                <Button
                  variant={!timedMode ? "default" : "game"}
                  size="sm"
                  onClick={() => setTimedMode(false)}
                  className="min-h-[40px] min-w-[100px]"
                >
                  <Star className="w-4 h-4" />
                  Questions
                </Button>
                <Button
                  variant={timedMode ? "default" : "game"}
                  size="sm"
                  onClick={() => setTimedMode(true)}
                  className="min-h-[40px] min-w-[100px]"
                >
                  <Zap className="w-4 h-4" />
                  60 Seconds
                </Button>
              </div>

              {!timedMode && (
                <>
                  <h2 className="text-base sm:text-lg font-bold mb-2">
                    Questions
                  </h2>
                  <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-6">
                    {[10, 15, 20, 30].map((count) => (
                      <Button
                        key={count}
                        variant={questionCount === count ? "default" : "game"}
                        size="sm"
                        onClick={() => setQuestionCount(count)}
                        className="min-h-[40px] min-w-[50px]"
                      >
                        {count}
                      </Button>
                    ))}
                  </div>
                </>
              )}

              <Button
                size="lg"
                onClick={startGame}
                className="w-full sm:w-auto"
              >
                <Play className="w-5 h-5 sm:w-6 sm:h-6" />
                Start Game!
              </Button>
            </div>
          </div>
        )}

        {gameState === "playing" && currentQuestion && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-4 sm:mb-6">
              <div className="flex justify-between items-center mb-2">
                {timedMode ? (
                  <span
                    className={`text-sm font-bold ${timeLeft <= 10 ? "text-destructive animate-pulse" : ""}`}
                  >
                    ⏱️ {timeLeft}s
                  </span>
                ) : (
                  <span className="text-sm font-semibold">
                    {currentIndex + 1}/{questions.length}
                  </span>
                )}
                <span className="text-sm font-bold flex items-center gap-1 text-success">
                  <Star className="w-4 h-4" />
                  {score}
                </span>
              </div>
              {!timedMode && (
                <div className="h-2 sm:h-3 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${((currentIndex + 1) / questions.length) * 100}%`,
                    }}
                  />
                </div>
              )}
            </div>

            {streak >= 3 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-center mb-4"
              >
                <span className="inline-flex items-center gap-1 bg-orange-500/20 text-orange-500 px-3 py-1 rounded-full text-sm font-bold">
                  {streak} streak!
                </span>
              </motion.div>
            )}

            <motion.div
              key={currentIndex}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-card border border-border"
            >
              <div className="text-center mb-6 sm:mb-8">
                <p className="text-muted-foreground text-sm mb-4">
                  Is this equation correct?
                </p>
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="text-4xl sm:text-5xl md:text-6xl font-extrabold"
                >
                  <span className="text-primary">
                    {currentQuestion.factor1}
                  </span>
                  <span className="text-muted-foreground mx-2">×</span>
                  <span className="text-primary">
                    {currentQuestion.factor2}
                  </span>
                  <span className="text-muted-foreground mx-2">=</span>
                  <span
                    className={
                      showCorrect && !currentQuestion.isCorrect
                        ? "text-destructive"
                        : "text-secondary"
                    }
                  >
                    {currentQuestion.shownAnswer}
                  </span>
                </motion.div>

                {showCorrect && !currentQuestion.isCorrect && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-success font-bold mt-4"
                  >
                    Correct answer:{" "}
                    {currentQuestion.factor1 * currentQuestion.factor2}
                  </motion.p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                  >
                    <Button
                      variant="game"
                      size="lg"
                      className={`w-full min-h-[70px] sm:min-h-[80px] text-xl sm:text-2xl font-bold transition-all ${
                        selectedAnswer === true
                          ? currentQuestion.isCorrect
                            ? "!border-success !bg-success/20"
                            : "!border-destructive !bg-destructive/20"
                          : showCorrect && currentQuestion.isCorrect
                            ? "!border-success !bg-success/10"
                            : ""
                      }`}
                      onClick={() => handleAnswer(true)}
                      disabled={selectedAnswer !== null}
                    >
                      <ThumbsUp className="w-6 h-6 sm:w-7 sm:h-7 mr-2" />
                      True
                      {selectedAnswer === true && currentQuestion.isCorrect && (
                        <Check className="w-5 h-5 ml-2" />
                      )}
                      {selectedAnswer === true &&
                        !currentQuestion.isCorrect && (
                          <X className="w-5 h-5 ml-2" />
                        )}
                    </Button>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Button
                      variant="game"
                      size="lg"
                      className={`w-full min-h-[70px] sm:min-h-[80px] text-xl sm:text-2xl font-bold transition-all ${
                        selectedAnswer === false
                          ? !currentQuestion.isCorrect
                            ? "!border-success !bg-success/20"
                            : "!border-destructive !bg-destructive/20"
                          : showCorrect && !currentQuestion.isCorrect
                            ? "!border-success !bg-success/10"
                            : ""
                      }`}
                      onClick={() => handleAnswer(false)}
                      disabled={selectedAnswer !== null}
                    >
                      <ThumbsDown className="w-6 h-6 sm:w-7 sm:h-7 mr-2" />
                      False
                      {selectedAnswer === false &&
                        !currentQuestion.isCorrect && (
                          <Check className="w-5 h-5 ml-2" />
                        )}
                      {selectedAnswer === false &&
                        currentQuestion.isCorrect && (
                          <X className="w-5 h-5 ml-2" />
                        )}
                    </Button>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}

        {gameState === "finished" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="bg-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-card border border-border">
              <Trophy className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 text-secondary" />

              <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">
                {timedMode ? "Time's Up!" : "Great Job!"}
              </h1>

              <div className="flex justify-center gap-1 mb-4">
                {[1, 2, 3].map((star) => (
                  <span
                    key={star}
                    className={`text-2xl sm:text-3xl ${
                      star <= getStarRating() ? "" : "opacity-30 grayscale"
                    }`}
                  >
                    ⭐
                  </span>
                ))}
              </div>

              <div className="text-4xl sm:text-5xl font-extrabold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {score}/{timedMode ? currentIndex + 1 : questions.length}
              </div>

              {bestStreak >= 3 && (
                <p className="text-sm text-muted-foreground mb-4">
                  Best streak: {bestStreak} in a row!
                </p>
              )}

              <div className="flex flex-wrap justify-center gap-3 mt-6">
                <Button onClick={startGame} size="lg">
                  <RotateCcw className="w-5 h-5" />
                  Play Again
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setGameState("idle")}
                >
                  <Shuffle className="w-5 h-5" />
                  Change Settings
                </Button>
              </div>
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
    </Layout>
  );
};

export default TrueFalse;
