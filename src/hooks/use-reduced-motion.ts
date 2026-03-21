import { useState, useEffect } from "react";

/**
 * Hook to detect user's reduced motion preference
 * Critical for accessibility - some users are sensitive to animations
 * Especially important for a kids' app
 */
export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return reducedMotion;
}

/**
 * Returns animation duration based on reduced motion preference
 * Returns 0ms if user prefers reduced motion
 */
export function useAnimationDuration(
  defaultDuration: number
): { duration: number; shouldAnimate: boolean } {
  const reducedMotion = useReducedMotion();
  
  return {
    duration: reducedMotion ? 0 : defaultDuration,
    shouldAnimate: !reducedMotion,
  };
}
