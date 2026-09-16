import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import { GameHeader } from "@/components/trail/GameHeader";
import { useUser } from "@/contexts/UserContext";
import { useSound } from "@/contexts/SoundContext";
import { SaveProgressPrompt } from "@/components/SaveProgressPrompt";
import { SolutionExplainer } from "@/components/SolutionExplainer";
import { AnimatedStars } from "@/components/AnimatedElements";
import {
  celebrateCorrect,
  celebrateWin,
  celebratePerfect,
} from "@/lib/confetti";
import { toast } from "sonner";
import { ARRAY_EMOJIS } from "@/lib/explanations";
import {
  Play,
  Trophy,
  RotateCcw,
  Check,
  X,
  LayoutGrid,
  Lightbulb,
} from "lucide-react";

type Difficulty = "easy" | "medium" | "hard";
type GameState = "idle" | "playing" | "finished";

const DIFFICULTY: Record<
  Difficulty,
  { label: string; emoji: string; max: number; description: string }
> = {
  easy: { label: "Easy", emoji: "🌱", max: 5, description: "Arrays up to 5×5" },
  medium: {
    label: "Medium",
    emoji: "🌿",
    max: 8,
    description: "Arrays up to 8×8",
  },
  hard: {
    label: "Hard",
    emoji: "🌳",
    max: 10,
    description: "Arrays up to 10×10",
  },
};

const QUESTION_COUNTS = [8, 12, 16];

interface ArrayQuestion {
  a: number;
  b: number;
  answer: number;
  mode: "total" | "equation";
  options: number[] | string[];
  emoji: string;
}

const shuffle = <T,>(arr: T[]): T[] =>
  [...arr].sort(() => Math.random() - 0.5);

const unique = (nums: number[]): number[] => [...new Set(nums)];

const generateQuestion = (max: number, round: number): ArrayQuestion => {
  const a = Math.floor(Math.random() * (max - 1)) + 2; // 2..max
  const b = Math.floor(Math.random() * (max - 1)) + 2;
  const answer = a * b;
  const mode: "total" | "equation" = round % 2 === 0 ? "total" : "equation";
  const emoji = ARRAY_EMOJIS[(a * 31 + b * 17 + round) % ARRAY_EMOJIS.length];

  if (mode === "total") {
    // Wrong answers close to the real one
    const distractors = unique(
      [answer + a, answer - b, answer + 1, answer - 1, a * (b + 1)].filter(
        (n) => n > 0 && n !== answer,
      ),
    ).slice(0, 3);
    while (distractors.length < 3) {
      const extra = answer + 2 + distractors.length * 3;
      if (!distractors.includes(extra)) distractors.push(extra);
    }
    return {
      a,
      b,
      answer,
      mode,
      options: shuffle([answer, ...distractors]),
      emoji,
    };
  }

  // "Which equation matches this array?" - avoid b×a (also correct!)
  const options = shuffle([
    `${a} × ${b} = ${answer}`,
    `${a + 1} × ${b} = ${(a + 1) * b}`,
    `${a} × ${b + 1} = ${a * (b + 1)}`,
    `${a} + ${b} = ${a + b}`,
  ]);
  return { a, b, answer, mode, options, emoji };
};

const ArrayVisual = ({
  a,
  b,
  emoji,
}: {
  a: number;
  b: number;
  emoji: string;
}) => (
  <div
    role="img"
    aria-label={`${a} rows of ${b} = ${a * b}`}
    className="bg-muted/50 rounded-2xl p-3 sm:p-4 mb-4 inline-block"
  >
    {Array.from({ length: a }).map((_, row) => (
      <div key={row} className="flex items-center gap-2 justify-center">
        <div className="flex gap-0.5 sm:gap-1">
          {Array.from({ length: b }).map((_, col) => (
            <motion.span
              key={col}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: (row * b + col) * 0.015 }}
              aria-hidden="true"
              className="text-sm sm:text-base leading-none"
            >
              {emoji}
            </motion.span>
          ))}
        </div>
        <span className="text-xs font-bold text-muted-foreground tabular-nums w-6 text-left">
          {b * (row + 1)}
        </span>
      </div>
    ))}
    <p className="text-xs text-muted-foreground mt-2">
      {a} rows of {b}
    </p>
  </div>
);

const ArrayBuilder = () => {
  const { isLoggedIn, recordGame } = useUser();
  const { play: playSound } = useSound();

  const [gameState, setGameState] = useState<GameState>("idle");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [questionCount, setQuestionCount] = useState(8);
  const [questions, setQuestions] = useState<ArrayQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | number | null>(null);
  const [showExplainer, setShowExplainer] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [tableResults, setTableResults] = useState<
    { tableNumber: number; correct: boolean; timeMs: number }[]
  >([]);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const questionStartTime = useRef<number>(Date.now());
  const sessionStartTime = useRef<number>(Date.now());

  const startGame = () => {
    const count = questionCount;
    setQuestions(
      Array.from({ length: count }, (_, i) =>
        generateQuestion(DIFFICULTY[difficulty].max, i),
      ),
    );
    setGameState("playing");
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setTableResults([]);
    setSelected(null);
    setShowExplainer(false);
    sessionStartTime.current = Date.now();
    questionStartTime.current = Date.now();
    playSound("gameStart");
  };

  const handleAnswer = (option: string | number) => {
    if (selected !== null) return;
    const q = questions[currentIndex];
    const correct =
      q.mode === "total"
        ? option === q.answer
        : option === `${q.a} × ${q.b} = ${q.answer}`;

    setSelected(option);
    const timeMs = Date.now() - questionStartTime.current;
    setTableResults((prev) => [
      ...prev,
      { tableNumber: q.a, correct, timeMs },
      { tableNumber: q.b, correct, timeMs },
    ]);

    if (correct) {
      playSound("correct");
      celebrateCorrect();
      setScore((s) => s + 1);
      setStreak((s) => {
        const next = s + 1;
        if (next > bestStreak) setBestStreak(next);
        if (next >= 3 && next % 3 === 0) playSound("streak");
        return next;
      });
    } else {
      playSound("wrong");
      setStreak(0);
    }
  };

  const nextQuestion = () => {
    if (currentIndex + 1 >= questions.length) {
      finishGame();
      return;
    }
    setCurrentIndex((i) => i + 1);
    setSelected(null);
    setShowExplainer(false);
    questionStartTime.current = Date.now();
  };

  const getStarRating = () => {
    const pct = score / questions.length;
    return pct === 1 ? 3 : pct >= 0.7 ? 2 : pct >= 0.4 ? 1 : 0;
  };

  const getGameSession = useCallback(
    () => ({
      gameType: "array" as const,
      tablesUsed: [
        ...new Set(questions.flatMap((q) => [q.a, q.b])),
      ].sort((x, y) => x - y),
      score,
      totalQuestions: questions.length,
      correctAnswers: score,
      bestStreak,
      timeSpent: Math.round((Date.now() - sessionStartTime.current) / 1000),
    }),
    [questions, score, bestStreak],
  );

  const finishGame = async () => {
    setGameState("finished");
    playSound("gameEnd");
    if (score === questions.length) celebratePerfect();
    else celebrateWin();

    if (isLoggedIn) {
      try {
        const newAchievements = await recordGame(
          getGameSession(),
          tableResults,
        );
        newAchievements.forEach((type) => {
          toast.success(`Achievement Unlocked: ${type.replace(/_/g, " ")}!`, {
            icon: "🏆",
          });
        });
      } catch {
        toast.error("Couldn't save your progress this time");
      }
    } else {
      setShowSavePrompt(true);
    }
  };

  const q = questions[currentIndex];

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        {gameState === "idle" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <GameHeader
              gameType="array"
              subtitle="See multiplication as groups and rows - count the array or match the equation!"
            />

            <div className="bg-card rounded-3xl p-6 shadow-card border border-border space-y-6">
              <div>
                <p className="font-semibold mb-3">Choose your level:</p>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(DIFFICULTY) as Difficulty[]).map((d) => (
                    <Button
                      key={d}
                      variant={difficulty === d ? "default" : "game"}
                      onClick={() => setDifficulty(d)}
                      className="flex-col h-auto py-3"
                    >
                      <span className="text-xl">{DIFFICULTY[d].emoji}</span>
                      <span>{DIFFICULTY[d].label}</span>
                      <span className="text-xs font-normal opacity-80">
                        {DIFFICULTY[d].description}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-semibold mb-3">How many questions?</p>
                <div className="flex justify-center gap-2">
                  {QUESTION_COUNTS.map((count) => (
                    <Button
                      key={count}
                      variant={questionCount === count ? "default" : "game"}
                      onClick={() => setQuestionCount(count)}
                    >
                      {count}
                    </Button>
                  ))}
                </div>
              </div>

              <Button size="xl" onClick={startGame} className="w-full">
                <Play className="w-6 h-6" />
                Start Building!
              </Button>
            </div>
          </motion.div>
        )}

        {gameState === "playing" && q && (
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex justify-between items-center mb-4 text-sm">
              <span className="font-bold text-muted-foreground">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="font-bold text-primary tabular-nums">
                Score: {score} 🔥 {streak}
              </span>
            </div>

            <div className="h-2 bg-muted rounded-full overflow-hidden mb-6">
              <div
                className="h-full gradient-primary transition-[width] duration-300"
                style={{ width: `${(currentIndex / questions.length) * 100}%` }}
              />
            </div>

            <div className="bg-card rounded-3xl p-6 shadow-card border border-border text-center">
              <ArrayVisual a={q.a} b={q.b} emoji={q.emoji} />

              <h2 className="text-xl font-bold mb-4">
                {q.mode === "total"
                  ? "How many in total?"
                  : "Which equation matches this array?"}
              </h2>

              <div
                className={`grid gap-2 sm:gap-3 ${
                  q.mode === "total" ? "grid-cols-2" : "grid-cols-1"
                }`}
              >
                {q.options.map((option, idx) => {
                  const isCorrect =
                    q.mode === "total"
                      ? option === q.answer
                      : option === `${q.a} × ${q.b} = ${q.answer}`;
                  const isSelected = selected === option;
                  const showAsCorrect = selected !== null && isCorrect;
                  const showAsWrong = isSelected && !isCorrect;

                  return (
                    <Button
                      key={idx}
                      variant="game"
                      size="lg"
                      className={`w-full text-xl font-bold min-h-[56px] ${
                        showAsCorrect
                          ? "!border-success !bg-success/10"
                          : showAsWrong
                            ? "!border-destructive !bg-destructive/10 animate-shake"
                            : ""
                      }`}
                      onClick={() => handleAnswer(option)}
                      disabled={selected !== null}
                    >
                      {showAsCorrect && <Check className="w-5 h-5" />}
                      {showAsWrong && <X className="w-5 h-5" />}
                      {option}
                    </Button>
                  );
                })}
              </div>

              <AnimatePresence>
                {selected !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 space-y-3"
                  >
                    {showExplainer ? (
                      <SolutionExplainer a={q.a} b={q.b} />
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowExplainer(true)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Lightbulb className="w-4 h-4 mr-1" aria-hidden="true" />
                        Show me how to solve it
                      </Button>
                    )}
                    <div>
                      <Button onClick={nextQuestion} size="lg">
                        {currentIndex + 1 >= questions.length
                          ? "See Results"
                          : "Next Question"}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {gameState === "finished" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="bg-card rounded-3xl p-8 shadow-card border border-border">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-secondary" />
              <h1 className="text-3xl font-extrabold mb-2">Array Complete!</h1>

              <div className="flex justify-center gap-1 mb-4">
                <AnimatedStars rating={getStarRating()} />
              </div>

              <div className="text-5xl font-extrabold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent tabular-nums">
                {score}/{questions.length}
              </div>

              {bestStreak >= 3 && (
                <p className="text-sm text-muted-foreground mb-2">
                  🔥 Best streak: {bestStreak} in a row!
                </p>
              )}

              <p className="text-muted-foreground mb-6">
                {getStarRating() === 3
                  ? "Perfect! You really see how multiplication works! 🎉"
                  : getStarRating() === 2
                    ? "Great job counting those groups! 💪"
                    : "Keep practising - arrays make times tables click! 🌟"}
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
          </motion.div>
        )}
      </div>

      {showSavePrompt && (
        <SaveProgressPrompt
          session={getGameSession()}
          tableResults={tableResults}
          onClose={() => setShowSavePrompt(false)}
        />
      )}
    </Layout>
  );
};

export default ArrayBuilder;
