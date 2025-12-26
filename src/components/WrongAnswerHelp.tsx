import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WrongAnswerHelpProps {
  a: number;
  b: number;
  correctAnswer: number;
  userAnswer: number;
  onClose: () => void;
  isOpen: boolean;
}

const getHelpTip = (
  a: number,
  b: number,
  correctAnswer: number,
): { tip: string; explanation: string } => {
  // 9 times table finger trick
  if (a === 9 || b === 9) {
    const multiplier = a === 9 ? b : a;
    const tensDigit = multiplier - 1;
    const onesDigit = 9 - tensDigit;
    return {
      tip: "Use the 9s finger trick!",
      explanation: `Hold up 10 fingers. Put down finger #${multiplier}. You have ${tensDigit} fingers on the left and ${onesDigit} on the right = ${correctAnswer}!`,
    };
  }

  // 10 times table
  if (a === 10 || b === 10) {
    const multiplier = a === 10 ? b : a;
    return {
      tip: "The 10s are easy!",
      explanation: `Just add a zero to ${multiplier}. So ${multiplier} × 10 = ${correctAnswer}!`,
    };
  }

  // 5 times table
  if (a === 5 || b === 5) {
    const multiplier = a === 5 ? b : a;
    if (multiplier % 2 === 0) {
      return {
        tip: "Try the 5s shortcut!",
        explanation: `For even numbers × 5: Take half of ${multiplier} (=${multiplier / 2}), then add a 0 = ${correctAnswer}!`,
      };
    } else {
      return {
        tip: "The 5s pattern!",
        explanation: `Odd numbers × 5 always end in 5. Count by 5s: 5, 10, 15... up to ${correctAnswer}!`,
      };
    }
  }

  // 11 times table (1-9)
  if ((a === 11 || b === 11) && Math.min(a, b) <= 9) {
    const multiplier = a === 11 ? b : a;
    return {
      tip: "The 11s trick!",
      explanation: `For 11 × single digits, just write the digit twice! 11 × ${multiplier} = ${multiplier}${multiplier} = ${correctAnswer}!`,
    };
  }

  // 2 times table (doubling)
  if (a === 2 || b === 2) {
    const multiplier = a === 2 ? b : a;
    return {
      tip: "Just double it!",
      explanation: `2 × ${multiplier} means double ${multiplier}. ${multiplier} + ${multiplier} = ${correctAnswer}!`,
    };
  }

  // 4 times table (double double)
  if (a === 4 || b === 4) {
    const multiplier = a === 4 ? b : a;
    const doubled = multiplier * 2;
    return {
      tip: "Double, then double again!",
      explanation: `4 × ${multiplier}: First double ${multiplier} = ${doubled}. Then double ${doubled} = ${correctAnswer}!`,
    };
  }

  // 3 times table
  if (a === 3 || b === 3) {
    const multiplier = a === 3 ? b : a;
    return {
      tip: "Count by threes!",
      explanation: `Skip count by 3s, ${multiplier} times: 3, 6, 9, 12... The answer is ${correctAnswer}!`,
    };
  }

  // Square numbers
  if (a === b) {
    return {
      tip: "This is a square number!",
      explanation: `${a} × ${a} = ${correctAnswer}. Try to memorize the squares: 1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144!`,
    };
  }

  // 6 times table
  if (a === 6 || b === 6) {
    const multiplier = a === 6 ? b : a;
    if (multiplier % 2 === 0) {
      return {
        tip: "6s pattern for even numbers!",
        explanation: `When multiplying 6 by an even number, the answer ends in the same digit! 6 × ${multiplier} = ${correctAnswer}`,
      };
    }
  }

  // 8 times table
  if (a === 8 || b === 8) {
    const multiplier = a === 8 ? b : a;
    return {
      tip: "Double, double, double!",
      explanation: `8 = 2 × 2 × 2. So double ${multiplier} three times: ${multiplier} → ${multiplier * 2} → ${multiplier * 4} → ${correctAnswer}!`,
    };
  }

  // Default tip using commutative property
  return {
    tip: "Remember, you can flip it!",
    explanation: `${a} × ${b} = ${b} × ${a} = ${correctAnswer}. Think about which order is easier for you!`,
  };
};

export const WrongAnswerHelp = ({
  a,
  b,
  correctAnswer,
  userAnswer,
  onClose,
  isOpen,
}: WrongAnswerHelpProps) => {
  const { tip, explanation } = getHelpTip(a, b, correctAnswer);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 20 }}
            transition={{ type: "spring", damping: 20 }}
            className="bg-card rounded-3xl p-6 max-w-md w-full shadow-xl border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center"
                >
                  <Lightbulb className="w-5 h-5 text-secondary" />
                </motion.div>
                <h3 className="text-xl font-bold">Let's Learn!</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
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
