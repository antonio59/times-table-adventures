import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import { useSound } from "@/contexts/SoundContext";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { KeyboardShortcutsHelp } from "@/components/KeyboardShortcutsHelp";
import {
  generateDailyChallenge,
  getDailyProgress,
  saveDailyProgress,
  getTimeUntilNextChallenge,
  type DailyChallenge as DailyChallengeType,
  type DailyQuestion,
} from "@/lib/daily-challenge";
import { celebrateWin, celebratePerfect } from "@/lib/confetti";
import {
  Calendar,
  Trophy,
  Flame,
  Clock,
  Star,
  Play,
  RotateCcw,
  Check,
  X,
  Sparkles,
  Keyboard,
} from "lucide-react";

type GameState = "intro" | "playing" | "finished";

const DailyChallenge = () => {
  const { play: playSound } = useSound();
  const [challenge, setChallenge] = useState<DailyChallengeType | null>(null);
  const [gameState, setGameState] = useState<GameState>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [showResult, setShowResult] = useState<"correct" | "wrong" | null>(
    null,
  );
  const [progress, setProgress] = useState(getDailyProgress());
  const [countdown, setCountdown] = useState(getTimeUntilNextChallenge());
  const [streak, setStreak] = useState(0);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    shortcuts: [
      {
        key: "Space",
        description: "Start challenge",
        action: () => {
          if (gameState === "intro" && !progress.todayCompleted) {
            startChallenge();
          }
        },
        disabled: gameState !== "intro" || progress.todayCompleted,
      },
      {
        key: "Enter",
        description: "Submit answer",
        action: () => {
          if (
            gameState === "playing" &&
            userAnswer !== "" &&
            showResult === null
          ) {
            handleSubmit();
          }
        },
        disabled:
          gameState !== "playing" || userAnswer === "" || showResult !== null,
      },
      {
        key: "Escape",
        description: "Close modal",
        action: () => {
          if (showShortcuts) {
            setShowShortcuts(false);
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

  // Load challenge on mount
  useEffect(() => {
    setChallenge(generateDailyChallenge());
  }, []);

  // Update countdown every second
  useEffect(() => {
    if (progress.todayCompleted) {
      const timer = setInterval(() => {
        setCountdown(getTimeUntilNextChallenge());
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [progress.todayCompleted]);

  const startChallenge = useCallback(() => {
    playSound("gameStart");
    setGameState("playing");
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setUserAnswer("");
    setShowResult(null);
  }, [playSound]);

  const handleSubmit = useCallback(() => {
    if (!challenge || userAnswer === "" || showResult !== null) return;

    const currentQuestion = challenge.questions[currentIndex];
    const isCorrect = parseInt(userAnswer) === currentQuestion.answer;

    setShowResult(isCorrect ? "correct" : "wrong");

    if (isCorrect) {
      setScore((prev) => prev + 1);
      setStreak((prev) => {
        const newStreak = prev + 1;
        if (newStreak >= 3) {
          playSound("streak");
        } else {
          playSound("correct");
        }
        return newStreak;
      });
    } else {
      playSound("wrong");
      setStreak(0);
    }

    // Move to next question after delay
    setTimeout(() => {
      if (currentIndex < challenge.questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setUserAnswer("");
        setShowResult(null);
      } else {
        // Game finished
        playSound("gameEnd");
        const finalScore = isCorrect ? score + 1 : score;
        const result = saveDailyProgress(
          finalScore,
          challenge.questions.length,
        );
        setProgress(getDailyProgress());
        setGameState("finished");

        // Celebrate
        if (finalScore === challenge.questions.length) {
          celebratePerfect();
        } else if (finalScore >= challenge.questions.length * 0.7) {
          celebrateWin();
        }
      }
    }, 1500);
  }, [challenge, currentIndex, userAnswer, showResult, score, playSound]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  if (!challenge) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  const currentQuestion = challenge.questions[currentIndex];

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        {/* Intro Screen */}
        {gameState === "intro" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="text-6xl mb-4"
              >
                <Calendar className="w-16 h-16 mx-auto text-primary" />
              </motion.div>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
                Daily Challenge
              </h1>
              <p className="text-muted-foreground">
                A new challenge every day! Come back tomorrow for more.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-card rounded-xl p-4 shadow-soft border border-border">
                <Flame className="w-6 h-6 mx-auto mb-1 text-orange-500" />
                <div className="text-2xl font-bold">{progress.streak}</div>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </div>
              <div className="bg-card rounded-xl p-4 shadow-soft border border-border">
                <Trophy className="w-6 h-6 mx-auto mb-1 text-yellow-500" />
                <div className="text-2xl font-bold">{progress.bestScore}%</div>
                <p className="text-xs text-muted-foreground">Best Score</p>
              </div>
              <div className="bg-card rounded-xl p-4 shadow-soft border border-border">
                <Star className="w-6 h-6 mx-auto mb-1 text-purple-500" />
                <div className="text-2xl font-bold capitalize">
                  {challenge.difficulty}
                </div>
                <p className="text-xs text-muted-foreground">Difficulty</p>
              </div>
            </div>

            {/* Challenge Info Card */}
            <div className="bg-card rounded-3xl p-6 shadow-card border border-border mb-6">
              <h2 className="text-2xl font-bold mb-2">{challenge.theme}</h2>
              <p className="text-muted-foreground mb-4">
                {challenge.questions.length} questions • Mixed types
              </p>

              {progress.todayCompleted ? (
                <div className="space-y-4">
                  <div className="bg-success/10 text-success rounded-xl p-4">
                    <Check className="w-6 h-6 mx-auto mb-2" />
                    <p className="font-semibold">Challenge Complete!</p>
                    <p className="text-sm">
                      You scored {progress.todayScore}% today
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      Next challenge in:
                    </p>
                    <div className="flex justify-center gap-2">
                      <div className="bg-muted px-3 py-2 rounded-lg">
                        <span className="text-xl font-bold">
                          {countdown.hours}
                        </span>
                        <span className="text-xs block text-muted-foreground">
                          hrs
                        </span>
                      </div>
                      <div className="bg-muted px-3 py-2 rounded-lg">
                        <span className="text-xl font-bold">
                          {countdown.minutes}
                        </span>
                        <span className="text-xs block text-muted-foreground">
                          min
                        </span>
                      </div>
                      <div className="bg-muted px-3 py-2 rounded-lg">
                        <span className="text-xl font-bold">
                          {countdown.seconds}
                        </span>
                        <span className="text-xs block text-muted-foreground">
                          sec
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Button size="xl" onClick={startChallenge}>
                    <Play className="w-6 h-6" />
                    Start Challenge!
                  </Button>
                  <div>
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
              )}
            </div>
          </motion.div>
        )}

        {/* Playing Screen */}
        {gameState === "playing" && currentQuestion && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold">
                  Question {currentIndex + 1}/{challenge.questions.length}
                </span>
                <span className="text-sm font-semibold flex items-center gap-1">
                  <Star className="w-4 h-4 text-primary" />
                  {score} correct
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${((currentIndex + 1) / challenge.questions.length) * 100}%`,
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Streak indicator */}
            {streak >= 2 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center mb-4"
              >
                <span className="inline-flex items-center gap-1 bg-orange-500/20 text-orange-500 px-3 py-1 rounded-full text-sm font-bold">
                  <Flame className="w-4 h-4" />
                  {streak} streak!
                </span>
              </motion.div>
            )}

            {/* Question Card */}
            <motion.div
              key={currentIndex}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`bg-card rounded-3xl p-8 shadow-card border-2 transition-all duration-300 ${
                showResult === "correct"
                  ? "border-success shadow-[0_0_30px_hsl(var(--success)/0.3)]"
                  : showResult === "wrong"
                    ? "border-destructive shadow-[0_0_30px_hsl(var(--destructive)/0.3)]"
                    : "border-border"
              }`}
            >
              <div className="text-center mb-8">
                <div className="text-5xl md:text-6xl font-extrabold mb-2">
                  {currentQuestion.display}
                </div>
                <div className="text-muted-foreground">
                  Type your answer below
                </div>
              </div>

              <div className="flex flex-col items-center gap-4">
                <input
                  type="number"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-32 h-16 text-center text-3xl font-bold bg-muted border-2 border-border rounded-xl focus:border-primary focus:outline-none transition-colors"
                  placeholder="?"
                  autoFocus
                  disabled={showResult !== null}
                />

                {showResult ? (
                  <div
                    className={`flex items-center gap-2 text-xl font-bold ${
                      showResult === "correct"
                        ? "text-success"
                        : "text-destructive"
                    }`}
                  >
                    {showResult === "correct" ? (
                      <>
                        <Check className="w-6 h-6" />
                        Correct! <Sparkles className="w-5 h-5" />
                      </>
                    ) : (
                      <>
                        <X className="w-6 h-6" />
                        It's {currentQuestion.answer}
                      </>
                    )}
                  </div>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={userAnswer === ""}
                    size="lg"
                  >
                    Check Answer
                  </Button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Finished Screen */}
        {gameState === "finished" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="bg-card rounded-3xl p-8 shadow-card border border-border">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              >
                <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
              </motion.div>

              <h1 className="text-3xl font-extrabold mb-4">
                Challenge Complete!
              </h1>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
                className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
              >
                {score}/{challenge.questions.length}
              </motion.div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-muted rounded-xl p-4">
                  <Flame className="w-6 h-6 mx-auto mb-1 text-orange-500" />
                  <div className="text-xl font-bold">{progress.streak}</div>
                  <p className="text-xs text-muted-foreground">Day Streak</p>
                </div>
                <div className="bg-muted rounded-xl p-4">
                  <Trophy className="w-6 h-6 mx-auto mb-1 text-yellow-500" />
                  <div className="text-xl font-bold">{progress.bestScore}%</div>
                  <p className="text-xs text-muted-foreground">Best Score</p>
                </div>
              </div>

              <p className="text-muted-foreground mb-6">
                {score === challenge.questions.length
                  ? "Perfect score! You're amazing! 🎉"
                  : score >= challenge.questions.length * 0.7
                    ? "Great job! Keep it up! 💪"
                    : "Good effort! Try again tomorrow! 📚"}
              </p>

              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  Next challenge in:
                </div>
                <div className="flex justify-center gap-2">
                  <div className="bg-muted px-3 py-2 rounded-lg">
                    <span className="text-xl font-bold">{countdown.hours}</span>
                    <span className="text-xs block text-muted-foreground">
                      hrs
                    </span>
                  </div>
                  <div className="bg-muted px-3 py-2 rounded-lg">
                    <span className="text-xl font-bold">
                      {countdown.minutes}
                    </span>
                    <span className="text-xs block text-muted-foreground">
                      min
                    </span>
                  </div>
                  <div className="bg-muted px-3 py-2 rounded-lg">
                    <span className="text-xl font-bold">
                      {countdown.seconds}
                    </span>
                    <span className="text-xs block text-muted-foreground">
                      sec
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <KeyboardShortcutsHelp
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
        context="daily"
      />
    </Layout>
  );
};

export default DailyChallenge;
