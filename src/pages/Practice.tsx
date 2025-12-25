import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import { Check, X, RotateCcw, Sparkles } from "lucide-react";

interface Question {
  a: number;
  b: number;
  answer: number;
}

const generateQuestion = (tables: number[]): Question => {
  const a = tables[Math.floor(Math.random() * tables.length)];
  const b = Math.floor(Math.random() * 12) + 1;
  return { a, b, answer: a * b };
};

const Practice = () => {
  const allTables = Array.from({ length: 12 }, (_, i) => i + 1);
  const [selectedTables, setSelectedTables] = useState<number[]>(allTables);
  const [question, setQuestion] = useState<Question | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [showResult, setShowResult] = useState<"correct" | "wrong" | null>(null);
  const [streak, setStreak] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);

  useEffect(() => {
    if (selectedTables.length > 0) {
      setQuestion(generateQuestion(selectedTables));
    }
  }, [selectedTables]);

  const toggleTable = (num: number) => {
    setSelectedTables((prev) =>
      prev.includes(num)
        ? prev.filter((t) => t !== num)
        : [...prev, num].sort((a, b) => a - b)
    );
  };

  const checkAnswer = () => {
    if (!question || userAnswer === "") return;

    const isCorrect = parseInt(userAnswer) === question.answer;
    setShowResult(isCorrect ? "correct" : "wrong");
    setTotalAttempts((prev) => prev + 1);

    if (isCorrect) {
      setStreak((prev) => prev + 1);
      setTotalCorrect((prev) => prev + 1);
    } else {
      setStreak(0);
    }

    setTimeout(() => {
      setShowResult(null);
      setUserAnswer("");
      setQuestion(generateQuestion(selectedTables));
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      checkAnswer();
    }
  };

  const resetStats = () => {
    setStreak(0);
    setTotalCorrect(0);
    setTotalAttempts(0);
    setUserAnswer("");
    setShowResult(null);
    if (selectedTables.length > 0) {
      setQuestion(generateQuestion(selectedTables));
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
            ⭐ Practice Mode
          </h1>
          <p className="text-muted-foreground">
            Select the tables you want to practice!
          </p>
        </div>

        {/* Table Selector */}
        <div className="bg-card rounded-2xl p-4 shadow-card border border-border mb-6">
          <p className="text-sm font-semibold mb-3 text-muted-foreground">
            Select tables to practice:
          </p>
          <div className="flex flex-wrap gap-2">
            {allTables.map((num) => (
              <Button
                key={num}
                variant={selectedTables.includes(num) ? "default" : "game"}
                size="sm"
                onClick={() => toggleTable(num)}
                className="w-10 h-10"
              >
                {num}
              </Button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-card rounded-xl p-4 text-center shadow-soft border border-border">
            <div className="text-2xl font-bold text-primary">{streak} 🔥</div>
            <p className="text-xs text-muted-foreground">Streak</p>
          </div>
          <div className="bg-card rounded-xl p-4 text-center shadow-soft border border-border">
            <div className="text-2xl font-bold text-success">{totalCorrect}</div>
            <p className="text-xs text-muted-foreground">Correct</p>
          </div>
          <div className="bg-card rounded-xl p-4 text-center shadow-soft border border-border">
            <div className="text-2xl font-bold text-secondary">
              {totalAttempts > 0
                ? Math.round((totalCorrect / totalAttempts) * 100)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">Accuracy</p>
          </div>
        </div>

        {/* Flashcard */}
        {selectedTables.length === 0 ? (
          <div className="bg-card rounded-3xl p-8 shadow-card border border-border text-center">
            <p className="text-muted-foreground">
              Please select at least one table to practice!
            </p>
          </div>
        ) : (
          <div
            className={`bg-card rounded-3xl p-8 shadow-card border-2 transition-all duration-300 ${
              showResult === "correct"
                ? "border-success shadow-[0_0_30px_hsl(var(--success)/0.3)]"
                : showResult === "wrong"
                ? "border-destructive shadow-[0_0_30px_hsl(var(--destructive)/0.3)]"
                : "border-border"
            }`}
          >
            {question && (
              <>
                <div className="text-center mb-8">
                  <div className="text-5xl md:text-6xl font-extrabold mb-2">
                    {question.a} × {question.b}
                  </div>
                  <div className="text-muted-foreground">What's the answer?</div>
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
                          It's {question.answer}
                        </>
                      )}
                    </div>
                  ) : (
                    <Button
                      onClick={checkAnswer}
                      disabled={userAnswer === ""}
                      size="lg"
                    >
                      Check Answer
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Reset Button */}
        <div className="text-center mt-6">
          <Button variant="ghost" onClick={resetStats}>
            <RotateCcw className="w-4 h-4" />
            Reset Stats
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Practice;
