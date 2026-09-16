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
import { ALL_TABLES } from "@/lib/constants";
import {
  Play,
  Trophy,
  RotateCcw,
  Check,
  X,
  Home,
  Lightbulb,
} from "lucide-react";

type GameState = "idle" | "playing" | "finished";

const ROUND_OPTIONS = [5, 8, 10];
const MAX_MULTIPLIER = 12;

interface Family {
  a: number;
  b: number;
  product: number;
}

const generateFamily = (tables: number[]): Family => {
  const a = tables[Math.floor(Math.random() * tables.length)];
  const b = Math.floor(Math.random() * MAX_MULTIPLIER) + 1;
  return { a, b, product: a * b };
};

interface FactField {
  key: string;
  equation: (f: Family) => { left: string; answer: number };
  label: string;
}

// The three facts to complete once the anchor fact a × b = P is given
const FIELDS: FactField[] = [
  {
    key: "flip",
    label: "Flip it!",
    equation: (f) => ({ left: `${f.b} × ${f.a}`, answer: f.product }),
  },
  {
    key: "divA",
    label: "Divide it back!",
    equation: (f) => ({ left: `${f.product} ÷ ${f.a}`, answer: f.b }),
  },
  {
    key: "divB",
    label: "Divide the other way!",
    equation: (f) => ({ left: `${f.product} ÷ ${f.b}`, answer: f.a }),
  },
];

const FactFamily = () => {
  const { isLoggedIn, recordGame } = useUser();
  const { play: playSound } = useSound();

  const [gameState, setGameState] = useState<GameState>("idle");
  const [selectedTables, setSelectedTables] = useState<number[]>([2, 3, 4, 5]);
  const [roundCount, setRoundCount] = useState(5);
  const [families, setFamilies] = useState<Family[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [fieldResults, setFieldResults] = useState<Record<string, boolean>>(
    {},
  );
  const [showExplainer, setShowExplainer] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [tableResults, setTableResults] = useState<
    { tableNumber: number; correct: boolean; timeMs: number }[]
  >([]);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const roundStartTime = useRef<number>(Date.now());
  const sessionStartTime = useRef<number>(Date.now());

  const toggleTable = (num: number) => {
    setSelectedTables((prev) =>
      prev.includes(num)
        ? prev.filter((t) => t !== num)
        : [...prev, num].sort((a, b) => a - b),
    );
  };

  const startGame = () => {
    setFamilies(
      Array.from({ length: roundCount }, () =>
        generateFamily(selectedTables),
      ),
    );
    setGameState("playing");
    setCurrentRound(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setTableResults([]);
    resetRound();
    sessionStartTime.current = Date.now();
    playSound("gameStart");
  };

  const resetRound = () => {
    setAnswers({});
    setChecked(false);
    setFieldResults({});
    setShowExplainer(false);
    roundStartTime.current = Date.now();
  };

  const setAnswer = (key: string, value: string) => {
    if (checked) return;
    setAnswers((prev) => ({ ...prev, [key]: value.replace(/\D/g, "") }));
  };

  const allFilled = FIELDS.every((f) => (answers[f.key] ?? "") !== "");

  const checkAnswers = () => {
    if (!allFilled || checked) return;
    const family = families[currentRound];
    const results: Record<string, boolean> = {};
    let roundCorrect = 0;

    for (const field of FIELDS) {
      const correct =
        parseInt(answers[field.key], 10) === field.equation(family).answer;
      results[field.key] = correct;
      if (correct) roundCorrect += 1;
    }

    const timeMs = Date.now() - roundStartTime.current;
    const allCorrect = roundCorrect === FIELDS.length;

    setFieldResults(results);
    setChecked(true);
    setScore((s) => s + roundCorrect);
    setTableResults((prev) => [
      ...prev,
      { tableNumber: family.a, correct: allCorrect, timeMs },
      { tableNumber: family.b, correct: allCorrect, timeMs },
    ]);

    if (allCorrect) {
      playSound("correct");
      celebrateCorrect();
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

  const nextRound = () => {
    if (currentRound + 1 >= families.length) {
      finishGame();
      return;
    }
    setCurrentRound((i) => i + 1);
    resetRound();
  };

  const totalFacts = families.length * FIELDS.length;

  const getStarRating = () => {
    const pct = score / totalFacts;
    return pct === 1 ? 3 : pct >= 0.7 ? 2 : pct >= 0.4 ? 1 : 0;
  };

  const getGameSession = useCallback(
    () => ({
      gameType: "family" as const,
      tablesUsed: [
        ...new Set(families.flatMap((f) => [f.a, f.b])),
      ].sort((x, y) => x - y),
      score,
      totalQuestions: totalFacts,
      correctAnswers: score,
      bestStreak,
      timeSpent: Math.round((Date.now() - sessionStartTime.current) / 1000),
    }),
    [families, score, totalFacts, bestStreak],
  );

  const finishGame = async () => {
    setGameState("finished");
    playSound("gameEnd");
    if (score === totalFacts) celebratePerfect();
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

  const family = families[currentRound];

  const handleEnter = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (!checked && allFilled) checkAnswers();
      else if (checked) nextRound();
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto" onKeyDown={handleEnter}>
        {gameState === "idle" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <GameHeader
              gameType="family"
              subtitle="One family, four facts! If 3 × 4 = 12, then 4 × 3 = 12, 12 ÷ 3 = 4 and 12 ÷ 4 = 3. Complete the family!"
            />

            <div className="bg-card rounded-3xl p-6 shadow-card border border-border space-y-6">
              <div>
                <p className="font-semibold mb-3">Pick your tables:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {ALL_TABLES.map((num) => (
                    <Button
                      key={num}
                      variant={
                        selectedTables.includes(num) ? "default" : "game"
                      }
                      size="sm"
                      onClick={() => toggleTable(num)}
                      className="w-10 h-10"
                    >
                      {num}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-semibold mb-3">How many families?</p>
                <div className="flex justify-center gap-2">
                  {ROUND_OPTIONS.map((count) => (
                    <Button
                      key={count}
                      variant={roundCount === count ? "default" : "game"}
                      onClick={() => setRoundCount(count)}
                    >
                      {count}
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                size="xl"
                onClick={startGame}
                className="w-full"
                disabled={selectedTables.length === 0}
              >
                <Play className="w-6 h-6" />
                Start!
              </Button>
            </div>
          </motion.div>
        )}

        {gameState === "playing" && family && (
          <motion.div
            key={currentRound}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex justify-between items-center mb-4 text-sm">
              <span className="font-bold text-muted-foreground">
                Family {currentRound + 1} of {families.length}
              </span>
              <span className="font-bold text-primary tabular-nums">
                Facts: {score} 🔥 {streak}
              </span>
            </div>

            <div className="h-2 bg-muted rounded-full overflow-hidden mb-6">
              <div
                className="h-full gradient-fun transition-[width] duration-300"
                style={{ width: `${(currentRound / families.length) * 100}%` }}
              />
            </div>

            <div className="bg-card rounded-3xl p-6 shadow-card border border-border">
              {/* Family house */}
              <div className="flex justify-center mb-6">
                <div className="bg-primary/10 border-2 border-primary/30 rounded-2xl px-6 py-3 flex items-center gap-3">
                  <Home className="w-5 h-5 text-primary" aria-hidden="true" />
                  <span className="text-2xl font-extrabold tabular-nums">
                    {family.a}
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-2xl font-extrabold tabular-nums">
                    {family.b}
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-2xl font-extrabold tabular-nums text-primary">
                    {family.product}
                  </span>
                </div>
              </div>

              <p className="text-center text-sm text-muted-foreground mb-4">
                We know {family.a} × {family.b} = {family.product}. Can you
                finish the family?
              </p>

              <div className="space-y-3">
                {FIELDS.map((field) => {
                  const { left, answer } = field.equation(family);
                  const status = checked ? fieldResults[field.key] : null;
                  return (
                    <div
                      key={field.key}
                      className={`flex items-center justify-center gap-3 rounded-2xl border-2 p-3 transition-colors ${
                        status === true
                          ? "border-success bg-success/10"
                          : status === false
                            ? "border-destructive bg-destructive/10"
                            : "border-border"
                      }`}
                    >
                      <span className="text-2xl font-extrabold tabular-nums whitespace-nowrap">
                        {left} =
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={answers[field.key] ?? ""}
                        onChange={(e) =>
                          setAnswer(field.key, e.target.value)
                        }
                        disabled={checked}
                        aria-label={field.label}
                        placeholder="?"
                        className={`w-20 h-12 text-center text-2xl font-bold border-2 rounded-xl bg-background focus:border-primary focus:outline-none transition-colors ${
                          status === true
                            ? "border-success text-success"
                            : status === false
                              ? "border-destructive text-destructive"
                              : "border-border"
                        }`}
                      />
                      {checked && status === false && (
                        <span className="text-success font-bold tabular-nums">
                          = {answer}
                        </span>
                      )}
                      {checked && status === true && (
                        <Check
                          className="w-6 h-6 text-success"
                          aria-hidden="true"
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex flex-col items-center gap-3">
                {!checked ? (
                  <Button
                    size="lg"
                    onClick={checkAnswers}
                    disabled={!allFilled}
                    className="w-full"
                  >
                    Check Answers
                  </Button>
                ) : (
                  <>
                    <div
                      className={`flex items-center gap-2 text-lg font-bold ${
                        Object.values(fieldResults).every(Boolean)
                          ? "text-success"
                          : "text-secondary"
                      }`}
                      role="status"
                    >
                      {Object.values(fieldResults).every(Boolean) ? (
                        <>
                          <Check className="w-5 h-5" aria-hidden="true" />
                          Full family! 🎉
                        </>
                      ) : (
                        <>
                          <X className="w-5 h-5" aria-hidden="true" />
                          {Object.values(fieldResults).filter(Boolean).length}{" "}
                          of {FIELDS.length} correct
                        </>
                      )}
                    </div>

                    {showExplainer ? (
                      <SolutionExplainer a={family.a} b={family.b} />
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowExplainer(true)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Lightbulb
                          className="w-4 h-4 mr-1"
                          aria-hidden="true"
                        />
                        Show me how it works
                      </Button>
                    )}

                    <Button onClick={nextRound} size="lg" className="w-full">
                      {currentRound + 1 >= families.length
                        ? "See Results"
                        : "Next Family"}
                    </Button>
                  </>
                )}
              </div>
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
              <h1 className="text-3xl font-extrabold mb-2">
                Families Complete!
              </h1>

              <div className="flex justify-center gap-1 mb-4">
                <AnimatedStars rating={getStarRating()} />
              </div>

              <div className="text-5xl font-extrabold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent tabular-nums">
                {score}/{totalFacts}
              </div>
              <p className="text-sm text-muted-foreground mb-2">facts found</p>

              {bestStreak >= 2 && (
                <p className="text-sm text-muted-foreground mb-2">
                  🔥 Best streak: {bestStreak} perfect families!
                </p>
              )}

              <p className="text-muted-foreground mb-6">
                {getStarRating() === 3
                  ? "Incredible! You truly understand how × and ÷ connect! 🎉"
                  : getStarRating() === 2
                    ? "Great work! The families are getting familiar! 💪"
                    : "Keep going - every family you learn helps with division too! 🌟"}
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

export default FactFamily;
