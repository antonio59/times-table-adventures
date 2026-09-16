interface MascotProps {
  className?: string;
  /** Gentle bob + tilt, disabled under prefers-reduced-motion via CSS */
  animated?: boolean;
}

/**
 * Nova — the trail guide. A little golden star with a friendly face.
 * Pure SVG so she stays crisp at any size and matches the star rewards.
 */
export function Mascot({ className = "w-16 h-16", animated = true }: MascotProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      role="img"
      aria-label="Nova, your trail guide"
      className={`${animated ? "animate-float" : ""} ${className}`}
    >
      {/* Rounded 5-point star — thick same-color stroke with round joins
          softens the points */}
      <path
        d="M 50,10 L 60.4,36.4 L 88.1,37.9 L 66.6,55.0 L 73.4,82.1 L 50,67.0 L 26.6,82.1 L 33.4,55.0 L 11.9,37.9 L 39.6,36.4 Z"
        fill="hsl(var(--warning))"
        stroke="hsl(var(--warning))"
        strokeWidth="9"
        strokeLinejoin="round"
      />
      {/* Face */}
      <circle cx="42" cy="48" r="3.4" fill="hsl(var(--warning-foreground))" />
      <circle cx="58" cy="48" r="3.4" fill="hsl(var(--warning-foreground))" />
      {/* sparkle in eyes */}
      <circle cx="43.2" cy="46.8" r="1.1" fill="hsl(var(--warning))" />
      <circle cx="59.2" cy="46.8" r="1.1" fill="hsl(var(--warning))" />
      {/* smile */}
      <path
        d="M 43 55 Q 50 61 57 55"
        fill="none"
        stroke="hsl(var(--warning-foreground))"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      {/* rosy cheeks */}
      <circle cx="36" cy="53" r="2.6" fill="hsl(var(--secondary) / 0.55)" />
      <circle cx="64" cy="53" r="2.6" fill="hsl(var(--secondary) / 0.55)" />
    </svg>
  );
}
