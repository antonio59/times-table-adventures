import { useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ARRAY_EMOJIS, getStrategyTip } from "@/lib/explanations";

interface WrongAnswerHelpProps {
  a: number;
  b: number;
  correctAnswer: number;
  userAnswer: number;
  onClose: () => void;
  isOpen: boolean;
}

const MAX_ARRAY_CELLS = 60;

export const WrongAnswerHelp = ({
  a,
  b,
  correctAnswer,
  userAnswer,
  onClose,
  isOpen,
}: WrongAnswerHelpProps) => {
  const { tip, explanation } = getStrategyTip(a, b);
  const emoji = useMemo(
    () => ARRAY_EMOJIS[(a * 31 + b * 17) % ARRAY_EMOJIS.length],
    [a, b],
  );
  const showArray = correctAnswer <= MAX_ARRAY_CELLS && correctAnswer > 0;

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overscroll-contain"
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="wrong-answer-title"
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 20 }}
            transition={{ type: "spring", damping: 20 }}
            className="bg-card rounded-3xl p-6 max-w-md w-full shadow-xl border border-border max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center"
                >
                  <Lightbulb className="w-5 h-5 text-secondary" aria-hidden="true" />
                </motion.div>
                <h3 id="wrong-answer-title" className="text-xl font-bold">
                  Let's Learn!
                </h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="bg-destructive/10 rounded-xl p-4">
                <p className="text-sm text-muted-foreground mb-1">
                  The question was:
                </p>
                <p className="text-2xl font-bold">
                  {a} × {b} = ?
                </p>
                <div className="flex gap-4 mt-2 text-sm">
                  <span className="text-destructive">
                    Your answer: {userAnswer}
                  </span>
                  <span className="text-success font-bold">
                    Correct: {correctAnswer}
                  </span>
                </div>
              </div>

              {showArray && (
                <div
                  role="img"
                  aria-label={`${a} rows of ${b} = ${correctAnswer}`}
                  className="bg-muted/50 rounded-xl p-3 flex flex-col items-center gap-0.5"
                >
                  {Array.from({ length: a }).map((_, row) => (
                    <div key={row} className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {Array.from({ length: b }).map((_, col) => (
                          <span
                            key={col}
                            aria-hidden="true"
                            className="text-xs leading-none"
                          >
                            {emoji}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs font-bold text-muted-foreground tabular-nums">
                        {b * (row + 1)}
                      </span>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground mt-1">
                    {a} groups of {b}
                  </p>
                </div>
              )}

              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-secondary/10 rounded-xl p-4"
              >
                <p className="font-bold text-secondary mb-2">{tip}</p>
                <p className="text-muted-foreground">{explanation}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-muted/50 rounded-xl p-4 text-center"
              >
                <p className="text-sm text-muted-foreground">
                  Practice makes perfect! You'll get it next time! 💪
                </p>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-6"
            >
              <Button onClick={onClose} className="w-full" size="lg">
                Got it! Let's continue
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
