import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import { Play, Trophy, Star, Clock, RotateCcw } from "lucide-react";

interface Question {
  a: number;
  b: number;
  answer: number;
  options: number[];
}

const generateQuestion = (): Question => {
  const a = Math.floor(Math.random() * 12) + 1;
  const b = Math.floor(Math.random() * 12) + 1;
  const answer = a * b;

  // Generate wrong options
  const wrongOptions = new Set<number>();
  while (wrongOptions.size < 3) {
    const wrong = answer + (Math.floor(Math.random() * 20) - 10);
    if (wrong !== answer && wrong > 0 && !wrongOptions.has(wrong)) {
      wrongOptions.add(wrong);
    }
  }

  const options = [...Array.from(wrongOptions), answer].sort(
    () => Math.random() - 0.5
  );

  return { a, b, answer, options };
};

type GameState = "idle" | "playing" | "finished";

const Quiz = () => {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showCorrect, setShowCorrect] = useState(false);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");

  const timeSettings = {
    easy: 90,
    medium: 60,
    hard: 30,
  };

  const startGame = useCallback(() => {
    const newQuestions = Array.from({ length: 20 }, () => generateQuestion());
    setQuestions(newQuestions);
    setCurrentIndex(0);
    setScore(0);
    setTimeLeft(timeSettings[difficulty]);
    setSelectedAnswer(null);
    setShowCorrect(false);
    setGameState("playing");
  }, [difficulty]);

  useEffect(() => {
    if (gameState !== "playing") return;

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
  }, [gameState]);

  const handleAnswer = (answer: number) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(answer);
    const isCorrect = answer === questions[currentIndex].answer;

    if (isCorrect) {
      setScore((prev) => prev + 1);
    } else {
      setShowCorrect(true);
    }

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedAnswer(null);
        setShowCorrect(false);
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
                Test your multiplication skills and earn stars!
              </p>
            </div>

            <div className="bg-card rounded-3xl p-8 shadow-card border border-border mb-6">
              <h2 className="text-xl font-bold mb-4">Choose Difficulty</h2>
              <div className="flex flex-wrap justify-center gap-3 mb-6">
                {(["easy", "medium", "hard"] as const).map((level) => (
                  <Button
                    key={level}
                    variant={difficulty === level ? "default" : "game"}
                    onClick={() => setDifficulty(level)}
                    className="min-w-24"
                  >
                    {level === "easy" && "🌱 Easy"}
                    {level === "medium" && "🌟 Medium"}
                    {level === "hard" && "🔥 Hard"}
                  </Button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                <Clock className="w-4 h-4 inline mr-1" />
                Time: {timeSettings[difficulty]} seconds | 20 questions
              </p>

              <Button size="xl" onClick={startGame}>
                <Play className="w-6 h-6" />
                Start Quiz!
              </Button>
            </div>
          </div>
        )}

        {gameState === "playing" && questions[currentIndex] && (
          <div>
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold">
                  Question {currentIndex + 1}/{questions.length}
                </span>
                <span
                  className={`text-sm font-bold flex items-center gap-1 ${
                    timeLeft <= 10 ? "text-destructive animate-pulse" : "text-muted-foreground"
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  {timeLeft}s
                </span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full gradient-primary transition-all duration-300"
                  style={{
                    width: `${((currentIndex + 1) / questions.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Score */}
            <div className="text-center mb-4">
              <span className="inline-flex items-center gap-2 bg-success/20 text-success px-4 py-2 rounded-full font-bold">
                <Star className="w-4 h-4" />
                Score: {score}
              </span>
            </div>

            {/* Question Card */}
            <div className="bg-card rounded-3xl p-8 shadow-card border border-border mb-6">
              <div className="text-center mb-8">
                <div className="text-5xl md:text-6xl font-extrabold">
                  {questions[currentIndex].a} × {questions[currentIndex].b}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {questions[currentIndex].options.map((option, idx) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrectAnswer =
                    option === questions[currentIndex].answer;
                  const showAsCorrect = showCorrect && isCorrectAnswer;
                  const showAsWrong = isSelected && !isCorrectAnswer;

                  return (
                    <Button
                      key={idx}
                      variant="game"
                      size="lg"
                      className={`text-2xl font-bold transition-all ${
                        showAsCorrect
                          ? "!border-success !bg-success/10 !shadow-[0_0_20px_hsl(var(--success)/0.3)]"
                          : showAsWrong
                          ? "!border-destructive !bg-destructive/10"
                          : isSelected && isCorrectAnswer
                          ? "!border-success !bg-success/10 !shadow-[0_0_20px_hsl(var(--success)/0.3)]"
                          : ""
                      }`}
                      onClick={() => handleAnswer(option)}
                      disabled={selectedAnswer !== null}
                    >
                      {option}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {gameState === "finished" && (
          <div className="text-center">
            <div className="bg-card rounded-3xl p-8 shadow-card border border-border">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-secondary animate-bounce-gentle" />
              <h1 className="text-3xl font-extrabold mb-2">Quiz Complete!</h1>

              <div className="flex justify-center gap-1 mb-4">
                {[1, 2, 3].map((star) => (
                  <Star
                    key={star}
                    className={`w-10 h-10 ${
                      star <= getStarRating()
                        ? "text-secondary fill-secondary"
                        : "text-muted"
                    }`}
                  />
                ))}
              </div>

              <div className="text-5xl font-extrabold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {score}/{questions.length}
              </div>
              <p className="text-muted-foreground mb-6">
                {getStarRating() === 3
                  ? "Amazing! You're a multiplication master! 🎉"
                  : getStarRating() === 2
                  ? "Great job! Keep practicing! 💪"
                  : getStarRating() === 1
                  ? "Good effort! You're getting there! 🌟"
                  : "Keep practicing, you'll improve! 📚"}
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
                  Change Difficulty
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Quiz;
