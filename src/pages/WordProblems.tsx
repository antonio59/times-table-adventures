import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import { BookOpen, Check, X, RotateCcw, Lightbulb, ArrowRight } from "lucide-react";

interface Problem {
  story: string;
  question: string;
  a: number;
  b: number;
  answer: number;
  hint: string;
}

const storyTemplates = [
  {
    template: (a: number, b: number) => ({
      story: `Tom has ${a} bags of apples. Each bag contains ${b} apples.`,
      question: "How many apples does Tom have in total?",
      hint: `Count ${a} groups of ${b} apples`,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `There are ${a} rows of desks in the classroom. Each row has ${b} desks.`,
      question: "How many desks are there altogether?",
      hint: `Think of ${a} rows with ${b} desks each`,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `Mia baked ${a} trays of cookies. She put ${b} cookies on each tray.`,
      question: "How many cookies did Mia bake?",
      hint: `${a} trays × ${b} cookies on each`,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `A spider has 8 legs. There are ${a} spiders in the garden.`,
      question: "How many spider legs are there in total?",
      hint: `${a} spiders × 8 legs each`,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `Sam reads ${b} pages every day. He reads for ${a} days.`,
      question: "How many pages does Sam read altogether?",
      hint: `${a} days × ${b} pages per day`,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `There are ${a} teams in a football tournament. Each team has ${b} players.`,
      question: "How many players are there in total?",
      hint: `${a} teams × ${b} players`,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `Grandma gave ${a} grandchildren ${b} sweets each.`,
      question: "How many sweets did Grandma give out?",
      hint: `${a} children × ${b} sweets each`,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `A car has 4 wheels. There are ${a} cars in the car park.`,
      question: "How many wheels are there altogether?",
      hint: `${a} cars × 4 wheels`,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `Lily has ${a} sticker sheets. Each sheet has ${b} stickers.`,
      question: "How many stickers does Lily have?",
      hint: `${a} sheets × ${b} stickers`,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `There are ${a} boxes of crayons. Each box has ${b} crayons.`,
      question: "How many crayons are there in all?",
      hint: `${a} boxes × ${b} crayons`,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `${a} friends went to the cinema. Each ticket cost £${b}.`,
      question: "How much did all the tickets cost together?",
      hint: `${a} tickets × £${b} each`,
    }),
  },
  {
    template: (a: number, b: number) => ({
      story: `A bicycle has 2 wheels. The shop has ${a} bicycles.`,
      question: "How many wheels do all the bicycles have?",
      hint: `${a} bicycles × 2 wheels`,
    }),
  },
];

const generateProblem = (selectedTables: number[]): Problem => {
  const a = selectedTables[Math.floor(Math.random() * selectedTables.length)];
  const templateIndex = Math.floor(Math.random() * storyTemplates.length);
  const template = storyTemplates[templateIndex];
  
  // For templates with fixed numbers (spider=8, car=4, bicycle=2), use appropriate b
  let b: number;
  if (template.template.toString().includes("spider")) {
    b = 8;
  } else if (template.template.toString().includes("car has 4")) {
    b = 4;
  } else if (template.template.toString().includes("bicycle has 2")) {
    b = 2;
  } else {
    b = Math.floor(Math.random() * 12) + 1;
  }
  
  const { story, question, hint } = template.template(a, b);
  
  return {
    story,
    question,
    a,
    b,
    answer: a * b,
    hint,
  };
};

const WordProblems = () => {
  const [selectedTables, setSelectedTables] = useState<number[]>([2, 3, 4, 5]);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [showResult, setShowResult] = useState<"correct" | "wrong" | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

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

  const startPractice = useCallback(() => {
    setProblem(generateProblem(selectedTables));
    setUserAnswer("");
    setShowResult(null);
    setShowHint(false);
  }, [selectedTables]);

  const nextProblem = () => {
    setProblem(generateProblem(selectedTables));
    setUserAnswer("");
    setShowResult(null);
    setShowHint(false);
  };

  const checkAnswer = () => {
    if (!problem || userAnswer === "") return;
    
    const isCorrect = parseInt(userAnswer) === problem.answer;
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
        {!problem ? (
          <div className="text-center">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
                📖 Word Problems
              </h1>
              <p className="text-muted-foreground">
                Practice multiplication with fun story problems!
              </p>
            </div>

            <div className="bg-card rounded-3xl p-6 md:p-8 shadow-card border border-border mb-6">
              <h2 className="text-xl font-bold mb-2">Which tables do you know?</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Problems will use these times tables
              </p>

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
                <p className="w-full text-xs text-muted-foreground mb-1">Quick select up to:</p>
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

              <Button size="xl" onClick={startPractice}>
                <BookOpen className="w-6 h-6" />
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
            <div className="bg-card rounded-3xl p-6 md:p-8 shadow-card border border-border mb-6">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">📚</div>
                <p className="text-lg md:text-xl leading-relaxed mb-4">
                  {problem.story}
                </p>
                <p className="text-xl md:text-2xl font-bold text-primary">
                  {problem.question}
                </p>
              </div>

              {/* Hint Button */}
              {!showHint && !showResult && (
                <div className="text-center mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowHint(true)}
                    className="text-muted-foreground"
                  >
                    <Lightbulb className="w-4 h-4" />
                    Need a hint?
                  </Button>
                </div>
              )}

              {showHint && !showResult && (
                <div className="bg-secondary/20 rounded-2xl p-4 mb-4 text-center">
                  <p className="text-sm">
                    <Lightbulb className="w-4 h-4 inline mr-2 text-secondary" />
                    <span className="font-semibold">Hint:</span> {problem.hint}
                  </p>
                  <p className="text-lg font-bold mt-2 text-secondary">
                    {problem.a} × {problem.b} = ?
                  </p>
                </div>
              )}

              {/* Answer Input */}
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold">Answer:</span>
                  <input
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
                        showResult === "correct" ? "text-success" : "text-destructive"
                      }`}
                    >
                      {showResult === "correct" ? (
                        <>
                          <Check className="w-8 h-8" />
                          Correct! Well done! 🎉
                        </>
                      ) : (
                        <>
                          <X className="w-8 h-8" />
                          Not quite! The answer is {problem.answer}
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

            {/* Back Button */}
            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => {
                  setProblem(null);
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

export default WordProblems;
