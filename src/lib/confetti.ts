import confetti from "canvas-confetti";

export const celebrateCorrect = () => {
  // Small burst for correct answer
  confetti({
    particleCount: 30,
    spread: 60,
    origin: { y: 0.7 },
    colors: ["#22c55e", "#3b82f6", "#8b5cf6"],
  });
};

export const celebrateStreak = (streak: number) => {
  // Bigger celebration for streaks
  const particleCount = Math.min(50 + streak * 10, 150);

  confetti({
    particleCount,
    spread: 100,
    origin: { y: 0.6 },
    colors: ["#f59e0b", "#ef4444", "#ec4899", "#8b5cf6"],
  });
};

export const celebrateWin = () => {
  // Big celebration for completing a game
  const duration = 2000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  const randomInRange = (min: number, max: number) => {
    return Math.random() * (max - min) + min;
  };

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    // Confetti from both sides
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      colors: ["#22c55e", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444"],
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      colors: ["#22c55e", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444"],
    });
  }, 250);
};

export const celebratePerfect = () => {
  // Ultimate celebration for perfect score
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
    colors: ["#ffd700", "#ffec8b"],
  });
  fire(0.2, {
    spread: 60,
    colors: ["#8b5cf6", "#a78bfa"],
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
    colors: ["#22c55e", "#4ade80"],
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
    colors: ["#ef4444", "#f87171"],
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
    colors: ["#3b82f6", "#60a5fa"],
  });
};
