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
  Link2,
  Shuffle,
} from "lucide-react";

interface Question {
  product: number;
  factor1: number;
  factor2: number;
  options: [number, number][];
  questionType: "find-both" | "find-one";
  givenFactor?: number;
}

const generateQuestion = (tables: number[]): Question => {
  const factor1 = tables[Math.floor(Math.random() * tables.length)];
  const factor2 = Math.floor(Math.random() * 12) + 1;
  const product = factor1 * factor2;

  // Randomly decide question type
  const questionType = Math.random() > 0.5 ? "find-both" : "find-one";

  if (questionType === "find-one") {
    // Given one factor, find the other
    const givenFactor = Math.random() > 0.5 ? factor1 : factor2;
    const answerFactor = givenFactor === factor1 ? factor2 : factor1;

    // Generate wrong options (other factors)
    const wrongOptions: number[] = [];
    for (let i = 1; i <= 12; i++) {
      if (i !== answerFactor && product % i === 0) {
        wrongOptions.push(i);
      }
    }
    // Add some random wrong options
    while (wrongOptions.length < 3) {
      const wrong = Math.floor(Math.random() * 12) + 1;
      if (wrong !== answerFactor && !wrongOptions.includes(wrong)) {
        wrongOptions.push(wrong);
      }
    }

    const options: [number, number][] = [
      [givenFactor, answerFactor],
      [givenFactor, wrongOptions[0]],
      [givenFactor, wrongOptions[1]],
      [givenFactor, wrongOptions[2]],
    ].sort(() => Math.random() - 0.5);

    return { product, factor1, factor2, options, questionType, givenFactor };
  } else {
    // Find both factors
    const correctPair: [number, number] = [factor1, factor2];

    // Generate plausible wrong pairs
    const wrongPairs: [number, number][] = [];

    // Wrong pairs that are close
    const nearbyProducts = [product - 1, product + 1, product - 2, product + 2];
    for (const np of nearbyProducts) {
      if (np > 0) {
        for (let i = 2; i <= 12; i++) {
          if (np % i === 0) {
            const pair: [number, number] = [i, np / i];
            if (
              pair[1] <= 12 &&
              pair[1] >= 1 &&
              !(pair[0] === factor1 && pair[1] === factor2) &&
              !(pair[0] === factor2 && pair[1] === factor1)
            ) {
              wrongPairs.push(pair);
              break;
            }
          }
        }
      }
      if (wrongPairs.length >= 3) break;
    }

    // Fill with random wrong pairs if needed
    while (wrongPairs.length < 3) {
      const w1 = Math.floor(Math.random() * 12) + 1;
      const w2 = Math.floor(Math.random() * 12) + 1;
      if (w1 * w2 !== product) {
        wrongPairs.push([w1, w2]);
      }
    }

    const options: [number, number][] = [
      correctPair,
      wrongPairs[0],
      wrongPairs[1],
      wrongPairs[2],
    ].sort(() => Math.random() - 0.5);

    return { product, factor1, factor2, options, questionType };
  }
};

type GameState = "idle" | "playing" | "finished";

const NumberBonds = () => {
  const { isLoggedIn, recordGame } = useUser();
  const { play: playSound } = useSound();
  const [gameState, setGameState] = useState<GameState>("idle");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<[number, number] | null>(
    null,
  );
  const [showCorrect, setShowCorrect] = useState(false);
  const [selectedTables, setSelectedTables] = useState<number[]>([2, 3, 4, 5]);
  const [questionCount, setQuestionCount] = useState(10);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [tableResults, setTableResults] = useState<
    { tableNumber: number; correct: boolean; timeMs: number }[]
  >([]);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
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
    const newQuestions = Array.from({ length: questionCount }, () =>
      generateQuestion(selectedTables),
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
    gameStartTime.current = Date.now();
    questionStartTime.current = Date.now();
    setGameState("playing");
  }, [selectedTables, questionCount, playSound]);

  const handleAnswer = (answer: [number, number]) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(answer);
    const question = questions[currentIndex];
    const isCorrect =
      (answer[0] === question.factor1 && answer[1] === question.factor2) ||
      (answer[0] === question.factor2 && answer[1] === question.factor1);

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

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedAnswer(null);
        setShowCorrect(false);
        questionStartTime.current = Date.now();
      } else {
        setGameState("finished");
      }
    }, 1200);
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
      gameType: "bonds" as const,
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
  ]);

  const currentQuestion = questions[currentIndex];

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        {gameState === "idle" && (
          <div className="text-center">
            <div className="mb-6 sm:mb-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-2xl gradient-primary flex items-center justify-center">
                <Link2 className="w-8 h-8 sm:w-10 sm:h-10 text-primary-foreground" />
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-2">
                Number Bonds
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Find the factors that multiply to make the product!
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

              <h2 className="text-base sm:text-lg font-bold mb-2">Questions</h2>
              <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-6">
                {[5, 10, 15, 20].map((count) => (
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
                <span className="text-sm font-semibold">
                  {currentIndex + 1}/{questions.length}
                </span>
                <span className="text-sm font-bold flex items-center gap-1 text-success">
                  <Star className="w-4 h-4" />
                  {score}
                </span>
              </div>
              <div className="h-2 sm:h-3 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${((currentIndex + 1) / questions.length) * 100}%`,
                  }}
                />
              </div>
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
                <p className="text-muted-foreground text-sm mb-2">
                  {currentQuestion.questionType === "find-one"
                    ? `${currentQuestion.givenFactor} × ? = ${currentQuestion.product}`
                    : "Find two numbers that multiply to make:"}
                </p>
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-primary"
                >
                  {currentQuestion.product}
                </motion.div>
                {currentQuestion.questionType === "find-both" && (
                  <p className="text-muted-foreground text-sm mt-2">
                    ? × ? = {currentQuestion.product}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected =
                    selectedAnswer?.[0] === option[0] &&
                    selectedAnswer?.[1] === option[1];
                  const isCorrectAnswer =
                    (option[0] === currentQuestion.factor1 &&
                      option[1] === currentQuestion.factor2) ||
                    (option[0] === currentQuestion.factor2 &&
                      option[1] === currentQuestion.factor1);
                  const showAsCorrect = showCorrect && isCorrectAnswer;
                  const showAsWrong = isSelected && !isCorrectAnswer;

                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Button
                        variant="game"
                        size="lg"
                        className={`w-full min-h-[60px] sm:min-h-[70px] text-lg sm:text-xl font-bold transition-all ${
                          showAsCorrect
                            ? "!border-success !bg-success/10"
                            : showAsWrong
                              ? "!border-destructive !bg-destructive/10"
                              : isSelected && isCorrectAnswer
                                ? "!border-success !bg-success/10"
                                : ""
                        }`}
                        onClick={() => handleAnswer(option)}
                        disabled={selectedAnswer !== null}
                      >
                        {currentQuestion.questionType === "find-one" ? (
                          <span>{option[1]}</span>
                        ) : (
                          <span>
                            {option[0]} × {option[1]}
                          </span>
                        )}
                        {showAsCorrect && <Check className="w-5 h-5 ml-2" />}
                        {showAsWrong && <X className="w-5 h-5 ml-2" />}
                      </Button>
                    </motion.div>
                  );
                })}
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
                Great Job!
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
                {score}/{questions.length}
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

export default NumberBonds;
