import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { TRAIL_REGIONS, TRAIL_STOPS } from "@/lib/trail";
import type { TrailStop } from "@/lib/trail";

interface GameHeaderProps {
  gameType: TrailStop["gameType"];
  subtitle: React.ReactNode;
}

/**
 * Shared header for every game's setup screen: a link back to the trail,
 * the game's region chip, and its icon badge — so each stop feels like
 * a place on the map rather than a standalone page.
 */
export function GameHeader({ gameType, subtitle }: GameHeaderProps) {
  const stop = TRAIL_STOPS.find((s) => s.gameType === gameType)!;
  const region = TRAIL_REGIONS.find((r) => r.id === stop.region)!;
  const Icon = stop.icon;
  const RegionIcon = region.icon;

  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex items-center justify-between mb-5">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 min-h-[40px] px-2 -ml-2 rounded-lg text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          The Trail
        </Link>
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ${region.bannerClass}`}
        >
          <RegionIcon className="w-3.5 h-3.5" aria-hidden="true" />
          {region.name}
        </span>
      </div>

      <div className="text-center">
        <div
          className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 rounded-3xl ${region.nodeClass} shadow-card flex items-center justify-center`}
        >
          <Icon
            className="w-8 h-8 sm:w-10 sm:h-10 text-primary-foreground"
            aria-hidden="true"
          />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold font-display mb-2">
          {stop.title}
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto">{subtitle}</p>
      </div>
    </div>
  );
}
