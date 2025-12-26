import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import {
  Lightbulb,
  Hand,
  Shuffle,
  Calculator,
  Star,
  Sparkles,
  ChevronDown,
  Brain,
  Zap,
  Target,
  Clock,
  Music,
} from "lucide-react";

const TipCard = ({
  icon: Icon,
  title,
  children,
  gradient,
  isExpandable = false,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  gradient: string;
  isExpandable?: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useState(!isExpandable);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      className="bg-card rounded-2xl p-6 shadow-card border border-border hover:shadow-lg transition-shadow"
    >
      <div
        className={`flex items-start gap-4 ${isExpandable ? "cursor-pointer" : ""}`}
        onClick={() => isExpandable && setIsExpanded(!isExpanded)}
      >
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${gradient} shrink-0`}
        >
          <Icon className="w-6 h-6 text-primary-foreground" />
        </motion.div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold mb-2">{title}</h3>
            {isExpandable && (
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              </motion.div>
            )}
          </div>
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-muted-foreground space-y-2 overflow-hidden"
              >
                {children}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

const Tips = () => {
  const [activeSection, setActiveSection] = useState<string>("shortcuts");

  const sections = [
    { id: "shortcuts", label: "Quick Tricks", icon: Zap },
    { id: "patterns", label: "Number Patterns", icon: Target },
    { id: "memory", label: "Memory Tips", icon: Brain },
    { id: "practice", label: "Practice Tips", icon: Clock },
  ];

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
            💡 Tips & Tricks
          </h1>
          <p className="text-muted-foreground">
            Secret shortcuts to make times tables easier!
          </p>
        </motion.div>

        {/* Section tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {sections.map((section) => (
            <Button
              key={section.id}
              variant={activeSection === section.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveSection(section.id)}
              className="gap-1"
            >
              <section.icon className="w-4 h-4" />
              {section.label}
            </Button>
          ))}
        </div>

        <div className="space-y-6">
          {/* QUICK TRICKS SECTION */}
          {activeSection === "shortcuts" && (
            <>
              {/* 9 Times Table Finger Trick */}
              <TipCard
                icon={Hand}
                title="The 9× Finger Trick"
                gradient="gradient-primary"
              >
                <p>
                  Hold up all 10 fingers. To multiply 9 by any number (1-10),
                  put down that finger.
                </p>
                <div className="bg-muted/50 rounded-xl p-4 mt-3">
                  <p className="font-semibold text-foreground">
                    Example: 9 × 4
                  </p>
                  <p>Put down your 4th finger (from the left).</p>
                  <p>
                    Count fingers on the left:{" "}
                    <span className="font-bold text-primary">3</span>
                  </p>
                  <p>
                    Count fingers on the right:{" "}
                    <span className="font-bold text-primary">6</span>
                  </p>
                  <p className="font-bold text-foreground mt-2">
                    Answer: 36! ✨
                  </p>
                </div>
              </TipCard>

              {/* 10 Times Table */}
              <TipCard
                icon={Star}
                title="The 10× Rule"
                gradient="gradient-secondary"
              >
                <p>Multiplying by 10 is super easy - just add a zero!</p>
                <div className="bg-muted/50 rounded-xl p-4 mt-3">
                  <p>
                    <span className="font-bold">3 × 10 = 30</span> (add a 0 to
                    3)
                  </p>
                  <p>
                    <span className="font-bold">7 × 10 = 70</span> (add a 0 to
                    7)
                  </p>
                  <p>
                    <span className="font-bold">12 × 10 = 120</span> (add a 0 to
                    12)
                  </p>
                </div>
              </TipCard>

              {/* 5 Times Table */}
              <TipCard
                icon={Calculator}
                title="The 5× Pattern"
                gradient="gradient-fun"
              >
                <p>The 5 times table always ends in 0 or 5!</p>
                <div className="bg-muted/50 rounded-xl p-4 mt-3">
                  <p>
                    Even numbers × 5 end in{" "}
                    <span className="font-bold text-primary">0</span>
                  </p>
                  <p>
                    Odd numbers × 5 end in{" "}
                    <span className="font-bold text-primary">5</span>
                  </p>
                  <p className="mt-2">
                    <span className="font-bold">Shortcut:</span> Take half the
                    number, then add a 0!
                  </p>
                  <p>
                    8 × 5 → half of 8 is 4 → add 0 →{" "}
                    <span className="font-bold">40</span>
                  </p>
                  <p>
                    6 × 5 → half of 6 is 3 → add 0 →{" "}
                    <span className="font-bold">30</span>
                  </p>
                </div>
              </TipCard>

              {/* 11 Times Table */}
              <TipCard
                icon={Sparkles}
                title="The 11× Magic"
                gradient="gradient-success"
              >
                <p>
                  For 11 × any single digit (1-9), just write the digit twice!
                </p>
                <div className="bg-muted/50 rounded-xl p-4 mt-3">
                  <p>
                    <span className="font-bold">11 × 2 = 22</span>
                  </p>
                  <p>
                    <span className="font-bold">11 × 5 = 55</span>
                  </p>
                  <p>
                    <span className="font-bold">11 × 9 = 99</span>
                  </p>
                  <p className="mt-3 font-semibold text-foreground">
                    For 11 × 10-12:
                  </p>
                  <p>
                    <span className="font-bold">11 × 10 = 110</span>
                  </p>
                  <p>
                    <span className="font-bold">11 × 11 = 121</span>
                  </p>
                  <p>
                    <span className="font-bold">11 × 12 = 132</span>
                  </p>
                </div>
              </TipCard>

              {/* Doubles */}
              <TipCard
                icon={Shuffle}
                title="Use Doubles (2×, 4×, 8×)"
                gradient="gradient-primary"
              >
                <p>
                  The 2× table is just doubling. The 4× table is doubling twice!
                  The 8× is doubling three times!
                </p>
                <div className="bg-muted/50 rounded-xl p-4 mt-3">
                  <p>
                    <span className="font-bold">2 × 7:</span> Double 7 ={" "}
                    <span className="font-bold text-primary">14</span>
                  </p>
                  <p>
                    <span className="font-bold">4 × 7:</span> Double 7 = 14,
                    double again ={" "}
                    <span className="font-bold text-primary">28</span>
                  </p>
                  <p>
                    <span className="font-bold">8 × 7:</span> Keep doubling! 14
                    → 28 → <span className="font-bold text-primary">56</span>
                  </p>
                </div>
              </TipCard>

              {/* Flip It */}
              <TipCard
                icon={Shuffle}
                title="Flip It Around!"
                gradient="gradient-secondary"
              >
                <p>The order doesn't matter! 3 × 7 is the same as 7 × 3.</p>
                <div className="bg-muted/50 rounded-xl p-4 mt-3">
                  <p>
                    If you know <span className="font-bold">3 × 7 = 21</span>
                  </p>
                  <p>
                    Then you also know{" "}
                    <span className="font-bold">7 × 3 = 21</span>
                  </p>
                  <p className="mt-2 text-sm">
                    This means you only need to learn half the facts!
                  </p>
                </div>
              </TipCard>
            </>
          )}

          {/* PATTERNS SECTION */}
          {activeSection === "patterns" && (
            <>
              {/* Square Numbers */}
              <TipCard
                icon={Target}
                title="Square Numbers are Special"
                gradient="gradient-fun"
              >
                <p>
                  When you multiply a number by itself, it makes a square
                  number!
                </p>
                <div className="bg-muted/50 rounded-xl p-4 mt-3">
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div>
                      <span className="font-bold">1×1=1</span>
                    </div>
                    <div>
                      <span className="font-bold">2×2=4</span>
                    </div>
                    <div>
                      <span className="font-bold">3×3=9</span>
                    </div>
                    <div>
                      <span className="font-bold">4×4=16</span>
                    </div>
                    <div>
                      <span className="font-bold">5×5=25</span>
                    </div>
                    <div>
                      <span className="font-bold">6×6=36</span>
                    </div>
                    <div>
                      <span className="font-bold">7×7=49</span>
                    </div>
                    <div>
                      <span className="font-bold">8×8=64</span>
                    </div>
                    <div>
                      <span className="font-bold">9×9=81</span>
                    </div>
                    <div>
                      <span className="font-bold">10×10=100</span>
                    </div>
                    <div>
                      <span className="font-bold">11×11=121</span>
                    </div>
                    <div>
                      <span className="font-bold">12×12=144</span>
                    </div>
                  </div>
                  <p className="mt-2 text-sm">
                    Memorise these - they come up a lot!
                  </p>
                </div>
              </TipCard>

              {/* 3 Times Table Pattern */}
              <TipCard
                icon={Calculator}
                title="The 3× Digit Sum"
                gradient="gradient-success"
              >
                <p>
                  Add the digits of any 3× answer - the sum is always divisible
                  by 3!
                </p>
                <div className="bg-muted/50 rounded-xl p-4 mt-3">
                  <p>
                    <span className="font-bold">3 × 4 = 12</span> → 1+2 = 3 ✓
                  </p>
                  <p>
                    <span className="font-bold">3 × 7 = 21</span> → 2+1 = 3 ✓
                  </p>
                  <p>
                    <span className="font-bold">3 × 8 = 24</span> → 2+4 = 6 ✓
                  </p>
                  <p className="mt-2 text-sm">
                    Use this to check your answers!
                  </p>
                </div>
              </TipCard>

              {/* 9 Pattern */}
              <TipCard
                icon={Sparkles}
                title="The 9× Digit Pattern"
                gradient="gradient-primary"
              >
                <p>The digits of 9× answers always add up to 9!</p>
                <div className="bg-muted/50 rounded-xl p-4 mt-3">
                  <p>
                    <span className="font-bold">9 × 2 = 18</span> → 1+8 = 9 ✓
                  </p>
                  <p>
                    <span className="font-bold">9 × 5 = 45</span> → 4+5 = 9 ✓
                  </p>
                  <p>
                    <span className="font-bold">9 × 7 = 63</span> → 6+3 = 9 ✓
                  </p>
                  <p className="mt-3 font-semibold text-foreground">
                    Also notice the pattern:
                  </p>
                  <p className="text-sm">
                    9, 18, 27, 36, 45, 54, 63, 72, 81, 90
                  </p>
                  <p className="text-sm">
                    First digit goes up: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9
                  </p>
                  <p className="text-sm">
                    Second digit goes down: 9, 8, 7, 6, 5, 4, 3, 2, 1, 0
                  </p>
                </div>
              </TipCard>

              {/* 6 Pattern */}
              <TipCard
                icon={Target}
                title="The 6× Even Pattern"
                gradient="gradient-secondary"
              >
                <p>
                  When you multiply 6 by an even number, the answer ends in the
                  same digit!
                </p>
                <div className="bg-muted/50 rounded-xl p-4 mt-3">
                  <p>
                    <span className="font-bold">6 × 2 = 12</span> (ends in 2)
                  </p>
                  <p>
                    <span className="font-bold">6 × 4 = 24</span> (ends in 4)
                  </p>
                  <p>
                    <span className="font-bold">6 × 6 = 36</span> (ends in 6)
                  </p>
                  <p>
                    <span className="font-bold">6 × 8 = 48</span> (ends in 8)
                  </p>
                </div>
              </TipCard>

              {/* 12 as 10+2 */}
              <TipCard
                icon={Calculator}
                title="Split the 12×"
                gradient="gradient-fun"
              >
                <p>Think of 12 as 10 + 2. Multiply by 10, then add double!</p>
                <div className="bg-muted/50 rounded-xl p-4 mt-3">
                  <p className="font-semibold text-foreground">
                    Example: 12 × 7
                  </p>
                  <p>10 × 7 = 70</p>
                  <p>2 × 7 = 14</p>
                  <p>
                    70 + 14 = <span className="font-bold text-primary">84</span>
                  </p>
                </div>
              </TipCard>
            </>
          )}

          {/* MEMORY TIPS SECTION */}
          {activeSection === "memory" && (
            <>
              {/* Rhymes */}
              <TipCard
                icon={Music}
                title="Rhymes to Remember"
                gradient="gradient-fun"
              >
                <p>Some times tables are easier to remember with rhymes!</p>
                <div className="bg-muted/50 rounded-xl p-4 mt-3 space-y-3">
                  <div>
                    <p className="font-semibold text-foreground">6 × 8 = 48</p>
                    <p className="italic">
                      "Six and eight went on a date, came back home at
                      forty-eight!"
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">8 × 8 = 64</p>
                    <p className="italic">
                      "Eight times eight fell on the floor, picked it up, it's
                      sixty-four!"
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">7 × 7 = 49</p>
                    <p className="italic">
                      "Seven sevens are so fine, forty-nine every time!"
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">5 × 6 = 30</p>
                    <p className="italic">
                      "Five, six, pick up sticks - five times six is thirty!"
                    </p>
                  </div>
                </div>
              </TipCard>

              {/* Visual Groups */}
              <TipCard
                icon={Brain}
                title="Picture It!"
                gradient="gradient-primary"
              >
                <p>Imagine real groups of things!</p>
                <div className="bg-muted/50 rounded-xl p-4 mt-3 space-y-3">
                  <div>
                    <p className="font-semibold text-foreground">For 4 × 7:</p>
                    <p>Picture 4 weeks (7 days each) = 28 days</p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">For 6 × 4:</p>
                    <p>Picture 6 cars with 4 wheels = 24 wheels</p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">For 12 × 5:</p>
                    <p>Picture 12 hands with 5 fingers = 60 fingers</p>
                  </div>
                </div>
              </TipCard>

              {/* The Tricky Ones */}
              <TipCard
                icon={Target}
                title="The Tricky Ones to Memorize"
                gradient="gradient-secondary"
              >
                <p>These don't have easy tricks - just memorize them!</p>
                <div className="bg-muted/50 rounded-xl p-4 mt-3">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-background rounded-lg p-3">
                      <p className="text-2xl font-bold text-primary">
                        7 × 8 = 56
                      </p>
                      <p className="text-xs text-muted-foreground">
                        "5, 6, 7, 8" - numbers in order!
                      </p>
                    </div>
                    <div className="bg-background rounded-lg p-3">
                      <p className="text-2xl font-bold text-secondary">
                        6 × 7 = 42
                      </p>
                      <p className="text-xs text-muted-foreground">
                        The answer to everything!
                      </p>
                    </div>
                    <div className="bg-background rounded-lg p-3">
                      <p className="text-2xl font-bold text-accent">
                        7 × 6 = 42
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Same as 6 × 7!
                      </p>
                    </div>
                    <div className="bg-background rounded-lg p-3">
                      <p className="text-2xl font-bold text-success">
                        8 × 7 = 56
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Same as 7 × 8!
                      </p>
                    </div>
                  </div>
                </div>
              </TipCard>

              {/* Near Doubles */}
              <TipCard
                icon={Lightbulb}
                title="Near Doubles"
                gradient="gradient-success"
              >
                <p>If you know squares, you can work out nearby facts!</p>
                <div className="bg-muted/50 rounded-xl p-4 mt-3">
                  <p className="font-semibold text-foreground">
                    Example: 6 × 7
                  </p>
                  <p>You know 6 × 6 = 36</p>
                  <p>
                    6 × 7 is one more 6 = 36 + 6 ={" "}
                    <span className="font-bold text-primary">42</span>
                  </p>
                  <p className="mt-3 font-semibold text-foreground">
                    Example: 7 × 8
                  </p>
                  <p>You know 7 × 7 = 49</p>
                  <p>
                    7 × 8 is one more 7 = 49 + 7 ={" "}
                    <span className="font-bold text-primary">56</span>
                  </p>
                </div>
              </TipCard>
            </>
          )}

          {/* PRACTICE TIPS SECTION */}
          {activeSection === "practice" && (
            <>
              {/* Practice Order */}
              <TipCard
                icon={Clock}
                title="Best Order to Learn"
                gradient="gradient-primary"
              >
                <p>
                  Learn your times tables in this order for the easiest path!
                </p>
                <div className="bg-muted/50 rounded-xl p-4 mt-3">
                  <ol className="list-decimal list-inside space-y-1">
                    <li>
                      <span className="font-bold">10×</span> - Just add a zero!
                    </li>
                    <li>
                      <span className="font-bold">2×</span> - Just double!
                    </li>
                    <li>
                      <span className="font-bold">5×</span> - Ends in 0 or 5
                    </li>
                    <li>
                      <span className="font-bold">11×</span> - Easy pattern
                    </li>
                    <li>
                      <span className="font-bold">9×</span> - Finger trick!
                    </li>
                    <li>
                      <span className="font-bold">4×</span> - Double the 2×
                    </li>
                    <li>
                      <span className="font-bold">3×</span> - Count by 3s
                    </li>
                    <li>
                      <span className="font-bold">6×</span> - Double the 3×
                    </li>
                    <li>
                      <span className="font-bold">8×</span> - Double the 4×
                    </li>
                    <li>
                      <span className="font-bold">7×</span> - The trickiest!
                    </li>
                    <li>
                      <span className="font-bold">12×</span> - Use 10× + 2×
                    </li>
                  </ol>
                </div>
              </TipCard>

              {/* Little and Often */}
              <TipCard
                icon={Brain}
                title="Little and Often"
                gradient="gradient-secondary"
              >
                <p>
                  Short practice sessions every day work better than long
                  sessions once a week!
                </p>
                <div className="bg-muted/50 rounded-xl p-4 mt-3 space-y-2">
                  <p>✓ 5-10 minutes daily is perfect</p>
                  <p>✓ Practice before breakfast or bedtime</p>
                  <p>✓ Use car rides or waiting time</p>
                  <p>✓ Mix up which tables you practice</p>
                </div>
              </TipCard>

              {/* Focus on Weakness */}
              <TipCard
                icon={Target}
                title="Focus on Your Weak Spots"
                gradient="gradient-fun"
              >
                <p>
                  Keep track of which facts you get wrong, then practice those
                  extra!
                </p>
                <div className="bg-muted/50 rounded-xl p-4 mt-3">
                  <p className="font-semibold text-foreground">
                    The most commonly tricky ones:
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="bg-background px-3 py-1 rounded-full text-sm">
                      7×8
                    </span>
                    <span className="bg-background px-3 py-1 rounded-full text-sm">
                      6×7
                    </span>
                    <span className="bg-background px-3 py-1 rounded-full text-sm">
                      6×8
                    </span>
                    <span className="bg-background px-3 py-1 rounded-full text-sm">
                      7×9
                    </span>
                    <span className="bg-background px-3 py-1 rounded-full text-sm">
                      8×9
                    </span>
                    <span className="bg-background px-3 py-1 rounded-full text-sm">
                      12×7
                    </span>
                    <span className="bg-background px-3 py-1 rounded-full text-sm">
                      12×8
                    </span>
                  </div>
                </div>
              </TipCard>

              {/* Test Yourself */}
              <TipCard
                icon={Zap}
                title="Speed Builds Confidence"
                gradient="gradient-success"
              >
                <p>Once you know your facts, practice answering FAST!</p>
                <div className="bg-muted/50 rounded-xl p-4 mt-3 space-y-2">
                  <p>🎯 Goal: Answer in under 3 seconds</p>
                  <p>🎮 Play Speed Race to practice quick recall</p>
                  <p>⏱️ Time yourself and try to beat your record</p>
                  <p>🔄 Practice both ways: 6×7 AND 7×6</p>
                </div>
              </TipCard>

              {/* Real Life */}
              <TipCard
                icon={Lightbulb}
                title="Use Times Tables in Real Life"
                gradient="gradient-primary"
              >
                <p>Spot multiplication everywhere!</p>
                <div className="bg-muted/50 rounded-xl p-4 mt-3 space-y-2">
                  <p>🛒 Shopping: "4 items at £3 each = ?"</p>
                  <p>🎂 Party: "8 guests, 2 slices each = ?"</p>
                  <p>🚗 Car: "6 cars, 4 wheels each = ?"</p>
                  <p>📚 Books: "5 shelves, 9 books each = ?"</p>
                </div>
              </TipCard>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Tips;
