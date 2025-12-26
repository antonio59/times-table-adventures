import { motion } from "framer-motion";
import { ReactNode } from "react";

// Animated container that fades in children with stagger
export const FadeInStagger = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={{
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1,
        },
      },
    }}
    className={className}
  >
    {children}
  </motion.div>
);

// Individual animated item
export const FadeInItem = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    }}
    className={className}
  >
    {children}
  </motion.div>
);

// Bouncy entrance animation
export const BounceIn = ({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) => (
  <motion.div
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{
      type: "spring",
      stiffness: 260,
      damping: 20,
      delay,
    }}
    className={className}
  >
    {children}
  </motion.div>
);

// Pulse animation for emphasis
export const Pulse = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <motion.div
    animate={{
      scale: [1, 1.05, 1],
    }}
    transition={{
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    }}
    className={className}
  >
    {children}
  </motion.div>
);

// Wiggle animation for attention
export const Wiggle = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <motion.div
    animate={{
      rotate: [0, -5, 5, -5, 5, 0],
    }}
    transition={{
      duration: 0.5,
      repeat: Infinity,
      repeatDelay: 2,
    }}
    className={className}
  >
    {children}
  </motion.div>
);

// Success checkmark animation
export const SuccessCheck = ({ size = 60 }: { size?: number }) => (
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ type: "spring", stiffness: 200, damping: 10 }}
    className="inline-flex items-center justify-center rounded-full bg-success text-success-foreground"
    style={{ width: size, height: size }}
  >
    <motion.svg
      viewBox="0 0 24 24"
      width={size * 0.6}
      height={size * 0.6}
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
    >
      <motion.path
        d="M5 13l4 4L19 7"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      />
    </motion.svg>
  </motion.div>
);

// Error X animation
export const ErrorX = ({ size = 60 }: { size?: number }) => (
  <motion.div
    initial={{ scale: 0, rotate: -180 }}
    animate={{ scale: 1, rotate: 0 }}
    transition={{ type: "spring", stiffness: 200, damping: 15 }}
    className="inline-flex items-center justify-center rounded-full bg-destructive text-destructive-foreground"
    style={{ width: size, height: size }}
  >
    <motion.svg
      viewBox="0 0 24 24"
      width={size * 0.5}
      height={size * 0.5}
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
    >
      <motion.path
        d="M6 6l12 12M6 18L18 6"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      />
    </motion.svg>
  </motion.div>
);

// Floating emoji animation
export const FloatingEmoji = ({
  emoji,
  delay = 0,
}: {
  emoji: string;
  delay?: number;
}) => (
  <motion.span
    initial={{ y: 0, opacity: 1 }}
    animate={{ y: -100, opacity: 0 }}
    transition={{ duration: 1.5, delay, ease: "easeOut" }}
    className="text-4xl absolute"
    style={{ pointerEvents: "none" }}
  >
    {emoji}
  </motion.span>
);

// Score counter animation
export const AnimatedScore = ({ score }: { score: number }) => (
  <motion.span
    key={score}
    initial={{ scale: 1.5, color: "#22c55e" }}
    animate={{ scale: 1, color: "inherit" }}
    transition={{ duration: 0.3 }}
  >
    {score}
  </motion.span>
);

// Streak fire animation
export const StreakFire = ({ streak }: { streak: number }) => {
  if (streak < 3) return null;

  return (
    <motion.div
      initial={{ scale: 0, rotate: -10 }}
      animate={{ scale: 1, rotate: 0 }}
      className="inline-flex items-center gap-1 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-bold"
    >
      <motion.span
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 0.5, repeat: Infinity }}
      >
        🔥
      </motion.span>
      {streak} streak!
    </motion.div>
  );
};

// Countdown timer with animation
export const AnimatedTimer = ({
  seconds,
  warning = 5,
  danger = 3,
}: {
  seconds: number;
  warning?: number;
  danger?: number;
}) => {
  const color =
    seconds <= danger
      ? "text-destructive"
      : seconds <= warning
        ? "text-warning"
        : "text-muted-foreground";

  return (
    <motion.span
      key={seconds}
      initial={seconds <= danger ? { scale: 1.3 } : { scale: 1 }}
      animate={{ scale: 1 }}
      className={`font-bold ${color} ${seconds <= danger ? "animate-pulse" : ""}`}
    >
      {seconds}s
    </motion.span>
  );
};

// Card flip animation
export const FlipCard = ({
  front,
  back,
  isFlipped,
}: {
  front: ReactNode;
  back: ReactNode;
  isFlipped: boolean;
}) => (
  <div className="relative" style={{ perspective: 1000 }}>
    <motion.div
      initial={false}
      animate={{ rotateY: isFlipped ? 180 : 0 }}
      transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
      style={{ transformStyle: "preserve-3d" }}
      className="relative"
    >
      <div style={{ backfaceVisibility: "hidden" }}>{front}</div>
      <div
        style={{
          backfaceVisibility: "hidden",
          transform: "rotateY(180deg)",
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
        }}
      >
        {back}
      </div>
    </motion.div>
  </div>
);

// Stars rating animation
export const AnimatedStars = ({
  rating,
  max = 3,
}: {
  rating: number;
  max?: number;
}) => (
  <div className="flex gap-1">
    {Array.from({ length: max }).map((_, i) => (
      <motion.span
        key={i}
        initial={{ scale: 0, rotate: -180 }}
        animate={{
          scale: 1,
          rotate: 0,
        }}
        transition={{
          delay: i * 0.15,
          type: "spring",
          stiffness: 200,
        }}
        className={`text-3xl ${i < rating ? "" : "opacity-30 grayscale"}`}
      >
        ⭐
      </motion.span>
    ))}
  </div>
);

// Progress bar with animation
export const AnimatedProgress = ({
  progress,
  className = "",
}: {
  progress: number;
  className?: string;
}) => (
  <div className={`h-3 bg-muted rounded-full overflow-hidden ${className}`}>
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${progress}%` }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="h-full gradient-primary"
    />
  </div>
);
