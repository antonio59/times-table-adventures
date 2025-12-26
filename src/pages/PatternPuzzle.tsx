import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import { Play, RotateCcw, Check, X, ArrowRight, Sparkles } from "lucide-react";

interface Pattern {
  sequence: (number | null)[];
  table: number;
  startMultiplier: number;
  missingIndex: number;
  answer: number;
}

const generatePattern = (selectedTables: number[]): Pattern => {
  const table =
    selectedTables[Math.floor(Math.random() * selectedTables.length)];
  const startMultiplier = Math.floor(Math.random() * 8) + 1; // Start from 1-8 to have room
  const missingIndex = Math.floor(Math.random() * 5); // 5 numbers in sequence

  const sequence: (number | null)[] = [];
  let answer = 0;

  for (let i = 0; i < 5; i++) {
    const value = table * (startMultiplier + i);
    if (i === missingIndex) {
      sequence.push(null);
      answer = value;
    } else {
      sequence.push(value);
    }
  }

  return { sequence, table, startMultiplier, missingIndex, answer };
};

type GameState = "idle" | "playing" | "finished";

const PatternPuzzle = () => {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [selectedTables, setSelectedTables] = useState<number[]>([2, 5, 10]);
  const [pattern, setPattern] = useState<Pattern | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [showResult, setShowResult] = useState<"correct" | "wrong" | null>(
    null,
  );
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [roundsToPlay, setRoundsToPlay] = useState(10);
  const [currentRound, setCurrentRound] = useState(0);

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

  const startGame = useCallback(() => {
    setPattern(generatePattern(selectedTables));
    setUserAnswer("");
    setShowResult(null);
    setScore({ correct: 0, total: 0 });
    setCurrentRound(1);
    setGameState("playing");
  }, [selectedTables]);

  const nextPattern = () => {
    if (currentRound >= roundsToPlay) {
      setGameState("finished");
      return;
    }
    setPattern(generatePattern(selectedTables));
    setUserAnswer("");
    setShowResult(null);
    setCurrentRound((prev) => prev + 1);
  };

  const checkAnswer = () => {
    if (!pattern || userAnswer === "") return;

    const isCorrect = parseInt(userAnswer) === pattern.answer;
    setShowResult(isCorrect ? "correct" : "wrong");
    setScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (showResult) {
        nextPattern();
      } else {
        checkAnswer();
      }
    }
  };

  const getStarRating = () => {
    const percentage = (score.correct / score.total) * 100;
    if (percentage >= 90) return 3;
    if (percentage >= 70) return 2;
    if (percentage >= 50) return 1;
    return 0;
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        {gameState === "idle" && (
          <div className="text-center">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
                <Sparkles className="inline w-8 h-8 mr-2" />
                Pattern Puzzle
              </h1>
              <p className="text-muted-foreground">
                Find the missing number in the sequence! Spot the pattern and
                fill in the blank.
              </p>
            </div>

            <div className="bg-card rounded-3xl p-6 md:p-8 shadow-card border border-border mb-6">
              <h2 className="text-xl font-bold mb-2">Choose your tables</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Patterns will use these times tables
              </p>

              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {allTables.map((table) => (
                  <Button
                    key={table}
                    variant={
                      selectedTables.includes(table) ? "default" : "game"
                    }
                    size="sm"
                    onClick={() => toggleTable(table)}
                    className="w-12 h-12 text-lg font-bold relative"
                  >
                    {table}
                    {selectedTables.includes(table) && (
                      <Check className="w-3 h-3 absolute -top-1 -right-1 bg-success text-success-foreground rounded-full p-0.5" />
                    )}
                  </Button>
                ))}
              </div>

              <h2 className="text-lg font-bold mb-2">Number of rounds</h2>
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {[5, 10, 15, 20].map((count) => (
                  <Button
                    key={count}
                    variant={roundsToPlay === count ? "default" : "game"}
                    size="sm"
                    onClick={() => setRoundsToPlay(count)}
                  >
                    {count} rounds
                  </Button>
                ))}
              </div>

              <Button size="xl" onClick={startGame}>
                <Play className="w-6 h-6" />
                Start Puzzles!
              </Button>
            </div>

            <div className="bg-accent/20 rounded-2xl p-4 text-sm">
              <p className="font-semibold mb-2">💡 How to play:</p>
              <p className="text-muted-foreground">
                You'll see a sequence of numbers with one missing. Look at the
                pattern (they go up by the same amount each time) and figure out
                what number is missing!
              </p>
            </div>
          </div>
        )}

        {gameState === "playing" && pattern && (
          <div>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold">
                  Round {currentRound}/{roundsToPlay}
                </span>
                <span className="text-sm font-bold text-success">
                  Score: {score.correct}/{score.total}
                </span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full gradient-fun transition-all duration-300"
                  style={{
                    width: `${(currentRound / roundsToPlay) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="bg-card rounded-3xl p-6 md:p-8 shadow-card border border-border mb-6">
              <div className="text-center mb-6">
                <p className="text-lg mb-4 text-muted-foreground">
                  Find the missing number in this pattern:
                </p>

                <div className="flex justify-center items-center gap-2 md:gap-4 flex-wrap">
                  {pattern.sequence.map((num, idx) => (
                    <div key={idx} className="flex items-center">
                      {num !== null ? (
                        <div className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center bg-muted rounded-xl text-2xl md:text-3xl font-bold">
                          {num}
                        </div>
                      ) : (
                        <div className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center border-4 border-dashed border-primary rounded-xl text-2xl md:text-3xl font-bold text-primary animate-pulse">
                          ?
                        </div>
                      )}
                      {idx < pattern.sequence.length - 1 && (
                        <ArrowRight className="w-4 h-4 mx-1 text-muted-foreground hidden md:block" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {!showResult && (
                <div className="bg-muted/50 rounded-xl p-3 mb-6 text-center text-sm text-muted-foreground">
                  <p>
                    💡 Hint: These numbers are from the{" "}
                    <strong>{pattern.table}×</strong> table!
                  </p>
                </div>
              )}

              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold">Missing number:</span>
                  <input
                    type="number"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={showResult !== null}
                    className="w-24 h-14 text-2xl font-bold text-center border-2 border-border rounded-xl focus:border-primary focus:outline-none bg-background"
                    autoFocus
                    aria-label="Your answer"
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
                          The answer is {pattern.answer}
                        </>
                      )}
                    </div>
                    <p className="text-muted-foreground mb-4">
                      Pattern: {pattern.table} × {pattern.startMultiplier} ={" "}
                      {pattern.table * pattern.startMultiplier},{pattern.table}{" "}
                      × {pattern.startMultiplier + 1} ={" "}
                      {pattern.table * (pattern.startMultiplier + 1)}, ...
                    </p>
                    <Button size="lg" onClick={nextPattern}>
                      <ArrowRight className="w-5 h-5" />
                      {currentRound >= roundsToPlay
                        ? "See Results"
                        : "Next Pattern"}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => {
                  setGameState("idle");
                  setScore({ correct: 0, total: 0 });
                }}
              >
                <RotateCcw className="w-4 h-4" />
                Start Over
              </Button>
            </div>
          </div>
        )}

        {gameState === "finished" && (
          <div className="text-center">
            <div className="bg-card rounded-3xl p-8 shadow-card border border-border">
              <Sparkles className="w-16 h-16 mx-auto mb-4 text-accent animate-bounce-gentle" />
              <h1 className="text-3xl font-extrabold mb-4">Puzzle Complete!</h1>

              <div className="flex justify-center gap-1 mb-4">
                {[1, 2, 3].map((star) => (
                  <div
                    key={star}
                    className={`w-10 h-10 ${
                      star <= getStarRating() ? "text-secondary" : "text-muted"
                    }`}
                  >
                    ⭐
                  </div>
                ))}
              </div>

              <div className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">
                {score.correct}/{score.total}
              </div>

              <p className="text-muted-foreground mb-6">
                {getStarRating() === 3
                  ? "Amazing pattern recognition! 🧠✨"
                  : getStarRating() === 2
                    ? "Great job spotting those patterns! 👀"
                    : getStarRating() === 1
                      ? "Good effort! Patterns will get easier! 🌟"
                      : "Keep practicing - you'll spot patterns faster! 📚"}
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
    </Layout>
  );
};

export default PatternPuzzle;
