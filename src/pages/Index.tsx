import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Calculator,
  Gamepad2,
  FileText,
  Star,
  Sparkles,
  BookOpen,
  Zap,
  HelpCircle,
  Layers,
  Lightbulb,
  Trophy,
  Divide,
  Mountain,
  Calendar,
  Link2,
  ThumbsUp,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useUser } from "@/contexts/UserContext";
import { UserMenu } from "@/components/UserMenu";

const FeatureCard = ({
  icon: Icon,
  title,
  description,
  to,
  variant,
  delay,
  compact = false,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  to: string;
  variant: "default" | "secondary" | "fun" | "success";
  delay: string;
  compact?: boolean;
}) => (
  <Link to={to} className="block group">
    <div
      className={`bg-card rounded-xl sm:rounded-2xl shadow-card border border-border hover:border-primary transition-all duration-300 hover:shadow-glow-primary hover:-translate-y-1 sm:hover:-translate-y-2 animate-pop h-full ${
        compact ? "p-3 sm:p-4" : "p-4 sm:p-6"
      }`}
      style={{ animationDelay: delay }}
    >
      <div
        className={`flex items-center gap-3 sm:gap-4 ${compact ? "" : "flex-col text-center sm:flex-row sm:text-left"}`}
      >
        <div
          className={`${compact ? "w-10 h-10 sm:w-12 sm:h-12" : "w-12 h-12 sm:w-14 sm:h-14"} rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 ${
            variant === "default"
              ? "gradient-primary"
              : variant === "secondary"
                ? "gradient-secondary"
                : variant === "fun"
                  ? "gradient-fun"
                  : "gradient-success"
          } shadow-soft group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon
            className={`${compact ? "w-5 h-5 sm:w-6 sm:h-6" : "w-6 h-6 sm:w-7 sm:h-7"} text-primary-foreground`}
          />
        </div>
        <div className={compact ? "min-w-0" : ""}>
          <h3
            className={`${compact ? "text-sm sm:text-base" : "text-base sm:text-lg"} font-bold text-foreground leading-tight`}
          >
            {title}
          </h3>
          <p
            className={`text-muted-foreground ${compact ? "text-xs sm:text-sm" : "text-xs sm:text-sm"} line-clamp-2`}
          >
            {description}
          </p>
        </div>
      </div>
    </div>
  </Link>
);

const Index = () => {
  const { isLoggedIn, userName, userAvatar } = useUser();

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
                    <h3 className="font-bold text-lg">Track Your Progress!</h3>
                    <p className="text-sm text-muted-foreground">
                      Create a profile to save scores, earn achievements, and
                      see which tables you've mastered.
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
                    <p className="font-bold">
                      Welcome back,{" "}
                      <span className="capitalize">{userName}</span>!
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Ready to practice today?
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

        {/* Hero Section */}
        <section className="text-center py-8 md:py-12">
          <div className="inline-flex items-center gap-2 bg-secondary/20 text-secondary-foreground px-4 py-2 rounded-full text-sm font-semibold mb-6 animate-float">
            <Star className="w-4 h-4 text-secondary" />
            <span className="text-foreground">Learn & Have Fun!</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Master Your
            </span>
            <br />
            <span className="text-foreground">Times Tables!</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Become a multiplication superstar with fun games, practice
            exercises, and printable worksheets!
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/tables">
              <Button size="lg" variant="default">
                <Calculator className="w-5 h-5" />
                View Tables
              </Button>
            </Link>
            <Link to="/tips">
              <Button size="lg" variant="secondary">
                <Lightbulb className="w-5 h-5" />
                Tips & Tricks
              </Button>
            </Link>
          </div>
        </section>

        {/* Daily Challenge Feature */}
        <section className="py-8">
          <Link to="/daily" className="block group">
            <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-3xl p-6 md:p-8 border-2 border-primary/30 hover:border-primary transition-all duration-300 hover:shadow-glow-primary">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="w-10 h-10 text-primary-foreground" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 bg-secondary/20 text-secondary-foreground px-3 py-1 rounded-full text-xs font-semibold mb-2">
                    <Sparkles className="w-3 h-3" />
                    <span>New!</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold mb-2">
                    Daily Challenge
                  </h2>
                  <p className="text-muted-foreground">
                    A unique challenge every day! Build your streak and compete
                    for the best score.
                  </p>
                </div>
                <Button size="lg" className="shrink-0">
                  <Zap className="w-5 h-5" />
                  Play Now
                </Button>
              </div>
            </div>
          </Link>
        </section>

        {/* Games Section */}
        <section id="games" className="py-8 scroll-mt-20">
          <h2 className="text-2xl font-bold text-center mb-2">
            Games & Practice
          </h2>
          <p className="text-muted-foreground text-center mb-8">
            Choose how you want to learn today!
          </p>

          <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
            <FeatureCard
              icon={Star}
              title="Flashcards"
              description="Quick practice with feedback"
              to="/practice"
              variant="secondary"
              delay="0s"
              compact
            />
            <FeatureCard
              icon={Gamepad2}
              title="Quiz"
              description="Multiple choice scoring"
              to="/quiz"
              variant="fun"
              delay="0.05s"
              compact
            />
            <FeatureCard
              icon={Zap}
              title="Speed Race"
              description="60 second challenge!"
              to="/speed"
              variant="default"
              delay="0.1s"
              compact
            />
            <FeatureCard
              icon={HelpCircle}
              title="Missing Number"
              description="Find the ? in equations"
              to="/missing"
              variant="success"
              delay="0.15s"
              compact
            />
            <FeatureCard
              icon={Layers}
              title="Memory Match"
              description="Match equations to answers"
              to="/memory"
              variant="fun"
              delay="0.2s"
              compact
            />
            <FeatureCard
              icon={BookOpen}
              title="Word Problems"
              description="100+ story scenarios"
              to="/stories"
              variant="secondary"
              delay="0.25s"
              compact
            />
            <FeatureCard
              icon={Divide}
              title="Division"
              description="Reverse multiplication"
              to="/division"
              variant="default"
              delay="0.3s"
              compact
            />
            <FeatureCard
              icon={Sparkles}
              title="Pattern Puzzle"
              description="Find missing numbers"
              to="/pattern"
              variant="fun"
              delay="0.35s"
              compact
            />
            <FeatureCard
              icon={Mountain}
              title="Table Climb"
              description="Climb to the summit!"
              to="/climb"
              variant="success"
              delay="0.4s"
              compact
            />
            <FeatureCard
              icon={Link2}
              title="Number Bonds"
              description="Find the factors!"
              to="/bonds"
              variant="default"
              delay="0.45s"
              compact
            />
            <FeatureCard
              icon={ThumbsUp}
              title="True or False"
              description="Quick thinking game"
              to="/truefalse"
              variant="secondary"
              delay="0.5s"
              compact
            />
          </div>
        </section>

        {/* Tools Section */}
        <section className="py-8">
          <h2 className="text-2xl font-bold text-center mb-2">
            Learning Tools
          </h2>
          <p className="text-muted-foreground text-center mb-8">
            Reference materials and resources
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <FeatureCard
              icon={Calculator}
              title="Times Tables"
              description="All tables 1-12 reference"
              to="/tables"
              variant="default"
              delay="0s"
            />
            <FeatureCard
              icon={Lightbulb}
              title="Tips & Tricks"
              description="Shortcuts to help you learn"
              to="/tips"
              variant="secondary"
              delay="0.05s"
            />
            <FeatureCard
              icon={FileText}
              title="Print Worksheets"
              description="Practice sheets for offline"
              to="/print"
              variant="success"
              delay="0.1s"
            />
          </div>
        </section>

        {/* Fun Stats */}
        <section className="py-6 sm:py-8">
          <div className="bg-card rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-card border border-border">
            <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
              <div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  12
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Tables
                </p>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-secondary to-secondary/70 bg-clip-text text-transparent">
                  144
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Facts
                </p>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent">
                  12
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Games
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Index;
