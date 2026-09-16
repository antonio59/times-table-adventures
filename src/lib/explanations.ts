/**
 * Shared explanation engine: strategy tips and worked solutions
 * for multiplication facts. Used by WrongAnswerHelp, SolutionExplainer,
 * and the new games.
 */

export interface StrategyTip {
  tip: string;
  explanation: string;
}

export const getStrategyTip = (
  a: number,
  b: number,
): StrategyTip => {
  const correctAnswer = a * b;

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
    }
    return {
      tip: "The 5s pattern!",
      explanation: `Odd numbers × 5 always end in 5. Count by 5s: 5, 10, 15… up to ${correctAnswer}!`,
    };
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
      explanation: `Skip count by 3s, ${multiplier} times: 3, 6, 9, 12… The answer is ${correctAnswer}!`,
    };
  }

  // Square numbers
  if (a === b) {
    return {
      tip: "This is a square number!",
      explanation: `${a} × ${a} = ${correctAnswer}. Try to memorise the squares: 1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144!`,
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

/** Maximum number of addends we'll spell out for repeated addition */
const MAX_REPEATED_TERMS = 12;

/**
 * Repeated-addition rendering of a multiplication fact.
 * `4 × 3` → "4 + 4 + 4 = 12". Returns null when the term count
 * would make an unhelpfully long string.
 */
export const repeatedAddition = (a: number, b: number): string | null => {
  const [base, times] = a <= b ? [a, b] : [b, a];
  if (times > MAX_REPEATED_TERMS) return null;
  const terms = Array.from({ length: times }, () => base).join(" + ");
  return `${terms} = ${a * b}`;
};

/**
 * Ordered worked-solution steps for a × b, kid-friendly wording.
 */
export const buildSolutionSteps = (a: number, b: number): string[] => {
  const answer = a * b;
  const steps: string[] = [];

  const addition = repeatedAddition(a, b);
  if (addition) {
    steps.push(`Repeated addition: ${addition}`);
  }

  steps.push(`Flip it if it's easier: ${a} × ${b} = ${b} × ${a}`);
  steps.push(`So ${a} × ${b} = ${answer}`);

  return steps;
};

/** Fun emoji pool for array visualisations */
export const ARRAY_EMOJIS = [
  "🍎", "⭐", "🐤", "🎈", "🍇", "🐸", "🌸", "⚽", "🧁", "🐞", "🦖", "🍩",
];
