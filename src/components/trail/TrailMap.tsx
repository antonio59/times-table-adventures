import { TRAIL_REGIONS, TRAIL_STOPS, starsForAccuracy } from "@/lib/trail";
import { TrailNode } from "./TrailNode";

type GameProgress = Record<string, { sessions: number; accuracy: number }>;

/**
 * The trail: a dotted line running down the page with a themed
 * signpost per region and one big row card per game. Simple,
 * readable, and reads top-to-bottom like a journey.
 */
export function TrailMap({ progress }: { progress?: GameProgress }) {
  const starsOf = (gameType: string): number => {
    const p = progress?.[gameType];
    return p && p.sessions > 0 ? starsForAccuracy(p.accuracy) : 0;
  };

  // First stop without stars = Nova's suggested next stop
  const nextStop = TRAIL_STOPS.find((s) => starsOf(s.gameType) === 0);

  return (
    <div className="relative max-w-xl mx-auto">
      {/* The trail itself — a dotted line behind every stop */}
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-1/2 -translate-x-1/2 border-l-[6px] border-dotted border-secondary/60"
      />

      {TRAIL_REGIONS.map((region) => {
        const RegionIcon = region.icon;
        const stops = TRAIL_STOPS.filter((s) => s.region === region.id);

        return (
          <section
            key={region.id}
            aria-labelledby={`region-${region.id}`}
            className="relative pb-6 last:pb-0"
          >
            {/* Region signpost */}
            <div
              className={`relative z-10 mx-auto w-fit max-w-full rounded-2xl border-2 px-4 py-2.5 sm:px-6 sm:py-3 flex items-center gap-3 ${region.bannerClass}`}
            >
              <RegionIcon
                className="w-6 h-6 sm:w-7 sm:h-7 shrink-0"
                aria-hidden="true"
              />
              <div className="text-left">
                <h2
                  id={`region-${region.id}`}
                  className="font-display text-lg sm:text-xl font-bold leading-tight"
                >
                  {region.name}
                </h2>
                <p className="text-xs opacity-90">{region.tagline}</p>
              </div>
            </div>

            {/* Stops in this region */}
            <div className="space-y-3 sm:space-y-4 mt-5">
              {stops.map((stop) => (
                <TrailNode
                  key={stop.gameType}
                  stop={stop}
                  region={region}
                  stars={starsOf(stop.gameType)}
                  isNext={nextStop?.gameType === stop.gameType}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
