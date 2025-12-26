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
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  to: string;
  variant: "default" | "secondary" | "fun" | "success";
  delay: string;
}) => (
  <Link to={to} className="block group">
    <div
      className="bg-card rounded-2xl p-6 shadow-card border border-border hover:border-primary transition-all duration-300 hover:shadow-glow-primary hover:-translate-y-2 animate-pop h-full"
      style={{ animationDelay: delay }}
    >
      <div className="flex flex-col items-center text-center gap-4">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
            variant === "default"
              ? "gradient-primary"
              : variant === "secondary"
                ? "gradient-secondary"
                : variant === "fun"
                  ? "gradient-fun"
                  : "gradient-success"
          } shadow-soft group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className="w-7 h-7 text-primary-foreground" />
        </div>
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
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

        {/* Games Section */}
        <section className="py-8">
          <h2 className="text-2xl font-bold text-center mb-2">
            Games & Practice
          </h2>
          <p className="text-muted-foreground text-center mb-8">
            Choose how you want to learn today!
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <FeatureCard
              icon={Star}
              title="Flashcards"
              description="Quick practice with instant feedback"
              to="/practice"
              variant="secondary"
              delay="0s"
            />
            <FeatureCard
              icon={Gamepad2}
              title="Quiz"
              description="Multiple choice with scoring"
              to="/quiz"
              variant="fun"
              delay="0.05s"
            />
            <FeatureCard
              icon={Zap}
              title="Speed Race"
              description="Answer fast in 60 seconds!"
              to="/speed"
              variant="default"
              delay="0.1s"
            />
            <FeatureCard
              icon={HelpCircle}
              title="Missing Number"
              description="Find the ? in equations"
              to="/missing"
              variant="success"
              delay="0.15s"
            />
            <FeatureCard
              icon={Layers}
              title="Memory Match"
              description="Match equations to answers"
              to="/memory"
              variant="fun"
              delay="0.2s"
            />
            <FeatureCard
              icon={BookOpen}
              title="Word Problems"
              description="70+ story scenarios"
              to="/stories"
              variant="secondary"
              delay="0.25s"
            />
            <FeatureCard
              icon={Divide}
              title="Division"
              description="Reverse multiplication practice"
              to="/division"
              variant="default"
              delay="0.3s"
            />
            <FeatureCard
              icon={Sparkles}
              title="Pattern Puzzle"
              description="Find the missing number"
              to="/pattern"
              variant="fun"
              delay="0.35s"
            />
            <FeatureCard
              icon={Mountain}
              title="Table Climb"
              description="Climb to the summit!"
              to="/climb"
              variant="success"
              delay="0.4s"
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FeatureCard
              icon={Calculator}
              title="Times Tables"
              description="See all tables 1-12 for reference"
              to="/tables"
              variant="default"
              delay="0s"
            />
            <FeatureCard
              icon={Lightbulb}
              title="Tips & Tricks"
              description="Shortcuts and patterns to help you learn"
              to="/tips"
              variant="secondary"
              delay="0.05s"
            />
            <FeatureCard
              icon={FileText}
              title="Print Worksheets"
              description="Download practice sheets for offline"
              to="/print"
              variant="success"
              delay="0.1s"
            />
          </div>
        </section>

        {/* Fun Stats */}
        <section className="py-8">
          <div className="bg-card rounded-3xl p-8 shadow-card border border-border">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  12
                </div>
                <p className="text-sm text-muted-foreground">Tables to Learn</p>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-secondary to-secondary/70 bg-clip-text text-transparent">
                  144
                </div>
                <p className="text-sm text-muted-foreground">
                  Multiplication Facts
                </p>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent">
                  9
                </div>
                <p className="text-sm text-muted-foreground">Fun Games!</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Index;
