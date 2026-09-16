import { useMemo } from "react";
import { motion } from "framer-motion";
import { Lightbulb } from "lucide-react";
import {
  ARRAY_EMOJIS,
  buildSolutionSteps,
  getStrategyTip,
} from "@/lib/explanations";

interface SolutionExplainerProps {
  a: number;
  b: number;
  /** Cap grid rendering for very large products */
  maxGridCells?: number;
}

/**
 * Worked solution for a multiplication fact: a mini array picture,
 * repeated addition, and a strategy tip. Shown after answers so kids
 * can see *why*, not just *what*.
 */
export const SolutionExplainer = ({
  a,
  b,
  maxGridCells = 100,
}: SolutionExplainerProps) => {
  const answer = a * b;
  const { tip, explanation } = getStrategyTip(a, b);
  const steps = useMemo(() => buildSolutionSteps(a, b), [a, b]);
  const emoji = useMemo(
    () => ARRAY_EMOJIS[(a * 31 + b * 17) % ARRAY_EMOJIS.length],
    [a, b],
  );
  const showGrid = answer <= maxGridCells && answer > 0;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25 }}
      className="overflow-hidden"
    >
      <div className="bg-secondary/10 border border-secondary/30 rounded-2xl p-4 text-left space-y-3">
        <p className="font-bold text-secondary flex items-center gap-2">
          <Lightbulb className="w-4 h-4 shrink-0" aria-hidden="true" />
          How to work it out
        </p>

        {showGrid && (
          <div
            role="img"
            aria-label={`${a} rows of ${b} = ${answer}`}
            className="bg-card/60 rounded-xl p-3 flex flex-col items-center gap-0.5"
          >
            {Array.from({ length: a }).map((_, row) => (
              <div key={row} className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {Array.from({ length: b }).map((_, col) => (
                    <span
                      key={col}
                      aria-hidden="true"
                      className="text-xs sm:text-sm leading-none"
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

        <ol className="list-decimal list-inside space-y-1 text-sm text-foreground">
          {steps.map((step, i) => (
            <li key={i} className="tabular-nums">
              {step}
            </li>
          ))}
        </ol>

        <div className="bg-card/60 rounded-xl p-3">
          <p className="font-bold text-sm text-secondary">{tip}</p>
          <p className="text-sm text-muted-foreground">{explanation}</p>
        </div>
      </div>
    </motion.div>
  );
};
