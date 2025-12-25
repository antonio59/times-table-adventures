import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calculator, Gamepad2, FileText, Star, Sparkles } from "lucide-react";
import Layout from "@/components/layout/Layout";

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
      className="bg-card rounded-2xl p-6 shadow-card border border-border hover:border-primary transition-all duration-300 hover:shadow-glow-primary hover:-translate-y-2 animate-pop"
      style={{ animationDelay: delay }}
    >
      <div className="flex flex-col items-center text-center gap-4">
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
            variant === "default"
              ? "gradient-primary"
              : variant === "secondary"
              ? "gradient-secondary"
              : variant === "fun"
              ? "gradient-fun"
              : "gradient-success"
          } shadow-soft group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className="w-8 h-8 text-primary-foreground" />
        </div>
        <h3 className="text-xl font-bold text-foreground">{title}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
        <Button variant={variant} size="sm" className="mt-2">
          Let's Go! <Sparkles className="w-4 h-4" />
        </Button>
      </div>
    </div>
  </Link>
);

const Index = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
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
            <span className="text-foreground">Times Tables! 🎉</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Become a multiplication superstar with fun games, practice exercises, 
            and printable worksheets!
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/tables">
              <Button size="lg" variant="default">
                <Calculator className="w-5 h-5" />
                View Tables
              </Button>
            </Link>
            <Link to="/quiz">
              <Button size="lg" variant="secondary">
                <Gamepad2 className="w-5 h-5" />
                Start Quiz
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-8">
          <h2 className="text-2xl font-bold text-center mb-8">
            Choose Your Adventure 🚀
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FeatureCard
              icon={Calculator}
              title="Times Tables"
              description="See all times tables from 1 to 12. Perfect for reference and learning!"
              to="/tables"
              variant="default"
              delay="0s"
            />
            <FeatureCard
              icon={Star}
              title="Practice Mode"
              description="Flashcard practice with instant feedback. Build your confidence!"
              to="/practice"
              variant="secondary"
              delay="0.1s"
            />
            <FeatureCard
              icon={Gamepad2}
              title="Quiz Game"
              description="Test your skills with timed quizzes and earn stars!"
              to="/quiz"
              variant="fun"
              delay="0.2s"
            />
            <FeatureCard
              icon={FileText}
              title="Print Worksheets"
              description="Download and print practice sheets to learn offline!"
              to="/print"
              variant="success"
              delay="0.3s"
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
                <p className="text-sm text-muted-foreground">Multiplication Facts</p>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent">
                  ∞
                </div>
                <p className="text-sm text-muted-foreground">Fun to Be Had!</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Index;
