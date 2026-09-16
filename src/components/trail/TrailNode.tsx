import { Link } from "react-router-dom";
import { ChevronRight, Star } from "lucide-react";
import { useSound } from "@/contexts/SoundContext";
import { Mascot } from "./Mascot";
import type { TrailRegion, TrailStop } from "@/lib/trail";

interface TrailNodeProps {
  stop: TrailStop;
  region: TrailRegion;
  /** 0 = unplayed */
  stars: number;
  /** The suggested next stop gets Nova + a highlight */
  isNext: boolean;
}

/**
 * One stop on the trail: a big readable row card — icon badge left,
 * name + blurb middle, stars earned right. Full-width so the tap
 * target is generous and the label is always in the same place.
 */
export function TrailNode({ stop, region, stars, isNext }: TrailNodeProps) {
  const Icon = stop.icon;
  const played = stars > 0;
  const { play } = useSound();

  return (
    <div className="relative">
      {isNext && (
        <div
          aria-hidden="true"
          className="absolute -top-5 right-4 sm:right-6 z-20 pointer-events-none"
        >
          <Mascot className="w-11 h-11 sm:w-13 sm:h-13 drop-shadow-md" />
        </div>
      )}
      <Link
        to={stop.to}
        onClick={() => play("click")}
        aria-label={`${stop.title} — ${stop.blurb}${played ? `, ${stars} of 3 stars earned` : ", not played yet"}`}
        className={`group relative z-10 flex items-center gap-3 sm:gap-4 w-full bg-card rounded-2xl border-2 p-3 sm:p-4 shadow-soft transition duration-200 hover:shadow-card hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-2 ${
          isNext
            ? "border-secondary ring-4 ring-secondary/30"
            : "border-border hover:border-primary"
        }`}
      >
        {/* Icon badge — same gradient as its trail region */}
        <span
          className={`w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-2xl ${region.nodeClass} shadow-soft flex items-center justify-center transition-transform duration-200 group-hover:scale-105`}
        >
          <Icon
            className="w-7 h-7 sm:w-8 sm:h-8 text-primary-foreground"
            aria-hidden="true"
          />
        </span>

        <span className="flex-1 min-w-0 text-left">
          <span className="block font-display font-bold text-base sm:text-lg leading-tight truncate">
            {stop.title}
          </span>
          <span className="block text-xs sm:text-sm text-muted-foreground truncate">
            {stop.blurb}
          </span>
        </span>

        {/* Stars earned — always 3 slots so the goal is visible */}
        <span className="flex flex-col items-end gap-0.5 shrink-0">
          <span className="flex gap-0.5" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <Star
                key={i}
                className={`w-4 h-4 sm:w-5 sm:h-5 ${
                  i < stars
                    ? "fill-warning text-warning"
                    : "text-muted-foreground/25"
                }`}
              />
            ))}
          </span>
          {isNext && (
            <span className="text-[11px] font-bold text-secondary">
              Next stop!
            </span>
          )}
        </span>

        <ChevronRight
          className="w-5 h-5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition shrink-0"
          aria-hidden="true"
        />
      </Link>
    </div>
  );
}
