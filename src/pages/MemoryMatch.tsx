import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import { useUser } from "@/contexts/UserContext";
import { SaveProgressPrompt } from "@/components/SaveProgressPrompt";
import { toast } from "sonner";
import { Sparkles, Play, Trophy, RotateCcw } from "lucide-react";
import { ALL_TABLES } from "@/lib/constants";

interface Card {
  id: number;
  content: string;
  type: "equation" | "answer";
  pairId: number;
  isFlipped: boolean;
  isMatched: boolean;
}

const MemoryMatch = () => {
  const { isLoggedIn, recordGame } = useUser();
  const [selectedTables, setSelectedTables] = useState<number[]>([2, 3]);
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [gameState, setGameState] = useState<"idle" | "playing" | "finished">(
    "idle",
  );
  const [isChecking, setIsChecking] = useState(false);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const gameStartTime = useRef<number>(Date.now());

  const allTables = ALL_TABLES;

  const toggleTable = (table: number) => {
    setSelectedTables((prev) => {
      if (prev.includes(table)) {
        if (prev.length === 1) return prev;
        return prev.filter((t) => t !== table);
      }
      if (prev.length >= 3) return prev;
      return [...prev, table].sort((a, b) => a - b);
    });
  };

  const generateCards = useCallback(() => {
    const pairs: { equation: string; answer: number }[] = [];

    selectedTables.forEach((table) => {
      const usedMultipliers = new Set<number>();
      while (usedMultipliers.size < Math.ceil(6 / selectedTables.length)) {
        const b = Math.floor(Math.random() * 10) + 2;
        if (!usedMultipliers.has(b)) {
          usedMultipliers.add(b);
          pairs.push({
            equation: `${table} × ${b}`,
            answer: table * b,
          });
        }
        if (pairs.length >= 6) break;
      }
    });

    const finalPairs = pairs.slice(0, 6);

    const cardArray: Card[] = [];
    finalPairs.forEach((pair, index) => {
      cardArray.push({
        id: index * 2,
        content: pair.equation,
        type: "equation",
        pairId: index,
        isFlipped: false,
        isMatched: false,
      });
      cardArray.push({
        id: index * 2 + 1,
        content: pair.answer.toString(),
        type: "answer",
        pairId: index,
        isFlipped: false,
        isMatched: false,
      });
    });

    return cardArray.sort(() => Math.random() - 0.5);
  }, [selectedTables]);

  const startGame = useCallback(() => {
    setCards(generateCards());
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setGameState("playing");
    setIsChecking(false);
    setHasRecorded(false);
    setShowSavePrompt(false);
    gameStartTime.current = Date.now();
  }, [generateCards]);

  const handleCardClick = (cardId: number) => {
    if (isChecking) return;

    const card = cards.find((c) => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;
    if (flippedCards.length >= 2) return;

    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c)),
    );

    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((prev) => prev + 1);
      setIsChecking(true);

      const [first, second] = newFlipped;
      const firstCard = cards.find((c) => c.id === first)!;
      const secondCard = cards.find((c) => c.id === second)!;

      const updatedSecondCard = { ...secondCard, isFlipped: true };

      if (firstCard.pairId === updatedSecondCard.pairId) {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.pairId === firstCard.pairId ? { ...c, isMatched: true } : c,
            ),
          );
          setMatches((prev) => {
            const newMatches = prev + 1;
            if (newMatches === 6) {
              setGameState("finished");
            }
            return newMatches;
          });
          setFlippedCards([]);
          setIsChecking(false);
        }, 500);
      } else {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              newFlipped.includes(c.id) ? { ...c, isFlipped: false } : c,
            ),
          );
          setFlippedCards([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  };

  const getStarRating = () => {
    if (moves <= 8) return 3;
    if (moves <= 12) return 2;
    if (moves <= 16) return 1;
    return 0;
  };

  const getGameSession = useCallback(
    () => ({
      gameType: "memory" as const,
      tablesUsed: selectedTables,
      score: matches,
      totalQuestions: 6,
      correctAnswers: matches,
      bestStreak: 0,
      timeSpent: Math.round((Date.now() - gameStartTime.current) / 1000),
    }),
    [selectedTables, matches],
  );

  // Record game when finished
  useEffect(() => {
    if (gameState !== "finished" || hasRecorded) return;

    if (isLoggedIn) {
      const recordResults = async () => {
        const newAchievements = await recordGame(getGameSession());
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
      const timer = setTimeout(() => {
        setShowSavePrompt(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [gameState, isLoggedIn, hasRecorded, recordGame, getGameSession]);

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        {gameState === "idle" && (
          <div className="text-center">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
                🃏 Memory Match
              </h1>
              <p className="text-muted-foreground">
                Match equations with their answers!
              </p>
            </div>

            <div className="bg-card rounded-3xl p-6 md:p-8 shadow-card border border-border mb-6">
              <h2 className="text-xl font-bold mb-2">Choose up to 3 tables</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Fewer tables = easier to remember the pairs
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
                    className="w-12 h-12 text-lg font-bold"
                    disabled={
                      !selectedTables.includes(table) &&
                      selectedTables.length >= 3
                    }
                  >
                    {table}
                  </Button>
                ))}
              </div>

              <p className="text-sm mb-6">
                Selected: {selectedTables.join("×, ")}× tables
              </p>

              <Button size="xl" onClick={startGame}>
                <Sparkles className="w-6 h-6" />
                Start Game!
              </Button>
            </div>
          </div>
        )}

        {gameState === "playing" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <span className="bg-primary/20 text-primary px-4 py-2 rounded-full font-bold">
                Moves: {moves}
              </span>
              <span className="bg-success/20 text-success px-4 py-2 rounded-full font-bold">
                Matches: {matches}/6
              </span>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {cards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  disabled={card.isFlipped || card.isMatched || isChecking}
                  className={`aspect-square rounded-2xl text-lg md:text-xl font-bold transition-all duration-300 transform ${
                    card.isMatched
                      ? "bg-success/20 border-2 border-success text-success scale-95"
                      : card.isFlipped
                        ? "bg-primary text-primary-foreground rotate-0"
                        : "bg-card border-2 border-border hover:border-primary hover:scale-105 cursor-pointer"
                  }`}
                  style={{
                    transform:
                      card.isFlipped || card.isMatched
                        ? "rotateY(0deg)"
                        : "rotateY(0deg)",
                  }}
                >
                  {card.isFlipped || card.isMatched ? card.content : "?"}
                </button>
              ))}
            </div>

            <div className="text-center mt-6">
              <Button variant="ghost" onClick={() => setGameState("idle")}>
                <RotateCcw className="w-4 h-4" />
                Change Tables
              </Button>
            </div>
          </div>
        )}

        {gameState === "finished" && (
          <div className="text-center">
            <div className="bg-card rounded-3xl p-8 shadow-card border border-border">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-secondary animate-bounce-gentle" />
              <h1 className="text-3xl font-extrabold mb-2">You Won! 🎉</h1>

              <div className="flex justify-center gap-1 mb-4">
                {[1, 2, 3].map((star) => (
                  <span
                    key={star}
                    className={`text-4xl ${star <= getStarRating() ? "" : "opacity-30"}`}
                  >
                    ⭐
                  </span>
                ))}
              </div>

              <p className="text-xl mb-2">
                Completed in{" "}
                <span className="font-bold text-primary">{moves}</span> moves
              </p>
              <p className="text-muted-foreground mb-6">
                {getStarRating() === 3
                  ? "Perfect memory! Amazing!"
                  : getStarRating() === 2
                    ? "Great job! Very impressive!"
                    : "Good work! Try to use fewer moves!"}
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
                  Change Tables
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showSavePrompt && (
        <SaveProgressPrompt
          session={getGameSession()}
          onClose={() => {
            setShowSavePrompt(false);
            setHasRecorded(true);
          }}
        />
      )}
    </Layout>
  );
};

export default MemoryMatch;
