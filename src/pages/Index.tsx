import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Calculator,
  FileText,
  Star,
  Sparkles,
  Lightbulb,
  Trophy,
  ExternalLink,
  Map,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useUser } from "@/contexts/UserContext";
import { UserMenu } from "@/components/UserMenu";
import { TrailMap } from "@/components/trail/TrailMap";
import { Mascot } from "@/components/trail/Mascot";
import { TRAIL_STOPS, starsForAccuracy } from "@/lib/trail";
import { MAX_TABLE, DEFAULT_MULTIPLIER_MAX } from "@/lib/constants";

const ToolCard = ({
  icon: Icon,
  title,
  description,
  to,
  variant,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  to: string;
  variant: "default" | "secondary" | "success";
}) => (
  <Link to={to} className="block group">
    <div className="bg-card rounded-2xl shadow-card border border-border hover:border-primary transition duration-300 hover:shadow-glow-primary hover:-translate-y-1 h-full p-4 sm:p-6">
      <div className="flex items-center gap-3 sm:gap-4 flex-col text-center sm:flex-row sm:text-left">
        <div
          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 ${
            variant === "default"
              ? "gradient-primary"
              : variant === "secondary"
                ? "gradient-secondary"
                : "gradient-success"
          } shadow-soft group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary-foreground" />
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-bold font-display text-foreground leading-tight">
            {title}
          </h3>
          <p className="text-muted-foreground text-xs sm:text-sm">
            {description}
          </p>
        </div>
      </div>
    </div>
  </Link>
);

const Index = () => {
  const { isLoggedIn, userId, userName, userAvatar } = useUser();

  const stats = useQuery(
    api.gameSessions.getUserStats,
    userId ? { userId } : "skip",
  );

  const totalStars = TRAIL_STOPS.reduce((sum, stop) => {
    const p = stats?.gameBreakdown?.[stop.gameType];
    return sum + (p && p.sessions > 0 ? starsForAccuracy(p.accuracy) : 0);
  }, 0);

  const scrollToTrail = () => {
    document.getElementById("games")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        {/* Sign Up Banner - only show if not logged in */}
        {!isLoggedIn && (
          <section className="mb-6">
            <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-2xl p-4 md:p-6 border border-primary/20">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-center md:text-left">
                  <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-bold font-display text-lg">
                      Keep the stars you earn!
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Create a profile so the trail remembers your progress,
                      stars, and achievements.
                    </p>
                  </div>
                </div>
                <UserMenu />
              </div>
            </div>
          </section>
        )}

        {/* Welcome back banner - show if logged in */}
        {isLoggedIn && (
          <section className="mb-6">
            <div className="bg-gradient-to-r from-success/10 to-success/5 rounded-2xl p-4 border border-success/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{userAvatar}</span>
                  <div>
                    <p className="font-bold font-display">
                      Welcome back,{" "}
                      <span className="capitalize">{userName}</span>!
                    </p>
                    <p className="text-sm text-muted-foreground">
                      The trail is waiting for you.
                    </p>
                  </div>
                </div>
                <Link to="/progress">
                  <Button variant="outline" size="sm">
                    <Trophy className="w-4 h-4" />
                    View Progress
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Hero — Nova welcomes you to the trail */}
        <section className="pt-4 pb-6 md:pt-6 md:pb-10">
          <div className="flex items-center justify-center gap-4 sm:gap-6">
            <Mascot className="w-20 h-20 sm:w-28 sm:h-28 shrink-0" />
            <div className="relative bg-card rounded-3xl shadow-card border border-border px-5 py-4 sm:px-7 sm:py-5 max-w-md">
              {/* speech-bubble tail */}
              <span
                aria-hidden="true"
                className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rotate-45 bg-card border-l border-b border-border"
              />
              <h1 className="font-display text-2xl sm:text-4xl font-bold leading-tight">
                Times Tables{" "}
                <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                  Fun!
                </span>
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base mt-1">
                Hi, I&apos;m Nova! Follow the trail from Base Camp to the
                Summit and earn up to 3 stars at every stop.
              </p>
            </div>
          </div>
          <div className="flex justify-center mt-6">
            <Button size="lg" onClick={scrollToTrail}>
              <Map className="w-5 h-5" />
              See the Trail
            </Button>
          </div>
        </section>

        {/* The Trail */}
        <section id="games" className="scroll-mt-20">
          <div className="flex items-center justify-center gap-3 mb-6">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-center">
              Your Adventure Awaits
            </h2>
            {isLoggedIn && totalStars > 0 && (
              <span className="inline-flex items-center gap-1.5 bg-warning/20 text-foreground px-3 py-1 rounded-full text-sm font-bold">
                <Star
                  className="w-4 h-4 fill-warning text-warning"
                  aria-hidden="true"
                />
                {totalStars}/{TRAIL_STOPS.length * 3}
              </span>
            )}
          </div>

          <TrailMap progress={stats?.gameBreakdown} />
        </section>

        {/* Scout's Kit — reference tools */}
        <section className="py-10">
          <h2 className="font-display text-2xl font-bold text-center mb-2">
            Scout&apos;s Kit
          </h2>
          <p className="text-muted-foreground text-center mb-8">
            Handy supplies for the journey
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <ToolCard
              icon={Calculator}
              title="Times Tables"
              description={`All tables 1-${MAX_TABLE} reference`}
              to="/tables"
              variant="default"
            />
            <ToolCard
              icon={Lightbulb}
              title="Tips & Tricks"
              description="Shortcuts to help you learn"
              to="/tips"
              variant="secondary"
            />
            <ToolCard
              icon={FileText}
              title="Print Worksheets"
              description="Practice sheets for offline"
              to="/print"
              variant="success"
            />
          </div>
        </section>

        {/* SatsQuest — the next adventure */}
        <section className="py-8">
          <a
            href="https://satsquest.antoniosmith.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
          >
            <div className="bg-gradient-to-r from-accent/10 via-primary/10 to-secondary/10 rounded-3xl p-6 md:p-8 border-2 border-accent/30 hover:border-accent transition duration-300 hover:shadow-glow-primary">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-20 h-20 rounded-2xl gradient-fun flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform duration-300 shrink-0">
                  <Sparkles className="w-10 h-10 text-primary-foreground" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 bg-accent/20 text-accent-foreground px-3 py-1 rounded-full text-xs font-semibold mb-2">
                    <Star className="w-3 h-3" />
                    <span>Beyond the Summit</span>
                  </div>
                  <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
                    A new quest awaits at SatsQuest!
                  </h2>
                  <p className="text-muted-foreground">
                    Our sister app for SATs practice — maths, reading and more,
                    made just for kids like you.
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 h-14 rounded-2xl px-8 text-lg font-bold gradient-fun text-accent-foreground shadow-soft group-hover:scale-105 transition-transform shrink-0">
                  <ExternalLink className="w-5 h-5" aria-hidden="true" />
                  Visit SatsQuest
                </span>
              </div>
            </div>
          </a>
        </section>

        {/* Quiet stats footer */}
        <p className="text-center text-xs text-muted-foreground pb-4">
          {MAX_TABLE} tables • {MAX_TABLE * DEFAULT_MULTIPLIER_MAX} facts •{" "}
          {TRAIL_STOPS.length} stops on the trail
        </p>
      </div>
    </Layout>
  );
};

export default Index;
