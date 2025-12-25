import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import { HelpCircle, Play, Check, X, ArrowRight, RotateCcw } from "lucide-react";

interface Problem {
  a: number;
  b: number;
  answer: number;
  missingPosition: "first" | "second" | "result";
  display: string;
  correctAnswer: number;
}

const MissingNumber = () => {
  const [selectedTables, setSelectedTables] = useState<number[]>([2, 3, 4, 5]);
  const [started, setStarted] = useState(false);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [showResult, setShowResult] = useState<"correct" | "wrong" | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const inputRef = useRef<HTMLInputElement>(null);

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
    setSelectedTables(allTables.filter((t) => t <= table));
  };

  const generateProblem = useCallback((): Problem => {
    const a = selectedTables[Math.floor(Math.random() * selectedTables.length)];
    const b = Math.floor(Math.random() * 12) + 1;
    const answer = a * b;
    
    const positions: Array<"first" | "second" | "result"> = ["first", "second", "result"];
    const missingPosition = positions[Math.floor(Math.random() * positions.length)];
    
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
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [generateProblem]);

  const nextProblem = () => {
    setProblem(generateProblem());
    setUserAnswer("");
    setShowResult(null);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const checkAnswer = () => {
    if (!problem || userAnswer === "") return;
    
    const isCorrect = parseInt(userAnswer) === problem.correctAnswer;
    setShowResult(isCorrect ? "correct" : "wrong");
    setScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));
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
              <h2 className="text-xl font-bold mb-2">Which tables do you know?</h2>
              
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {allTables.map((table) => (
                  <Button
                    key={table}
                    variant={selectedTables.includes(table) ? "default" : "game"}
                    size="sm"
                    onClick={() => toggleTable(table)}
                    className="w-12 h-12 text-lg font-bold"
                  >
                    {table}
                  </Button>
                ))}
              </div>

              <div className="flex flex-wrap justify-center gap-2 mb-6">
                <p className="w-full text-xs text-muted-foreground mb-1">Quick select:</p>
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
                  You'll see equations like: <span className="font-bold">3 × ? = 12</span> or <span className="font-bold">? × 4 = 20</span>
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
            {/* Score */}
            <div className="text-center mb-4">
              <span className="inline-flex items-center gap-2 bg-success/20 text-success px-4 py-2 rounded-full font-bold">
                Score: {score.correct}/{score.total}
              </span>
            </div>

            {/* Problem Card */}
            {problem && (
              <div className="bg-card rounded-3xl p-8 shadow-card border border-border mb-6">
                <div className="text-center mb-8">
                  <p className="text-sm text-muted-foreground mb-4">Find the missing number:</p>
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
                    <Button size="lg" onClick={checkAnswer} disabled={userAnswer === ""}>
                      <Check className="w-5 h-5" />
                      Check Answer
                    </Button>
                  ) : (
                    <div className="text-center">
                      <div
                        className={`flex items-center justify-center gap-2 text-2xl font-bold mb-4 ${
                          showResult === "correct" ? "text-success" : "text-destructive"
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

            {/* Back Button */}
            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => {
                  setStarted(false);
                  setScore({ correct: 0, total: 0 });
                }}
              >
                <RotateCcw className="w-4 h-4" />
                Change Tables
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MissingNumber;
