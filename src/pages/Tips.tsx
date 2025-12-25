import Layout from "@/components/layout/Layout";
import { Lightbulb, Hand, Shuffle, Calculator, Star, Sparkles } from "lucide-react";

const TipCard = ({
  icon: Icon,
  title,
  children,
  gradient,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  gradient: string;
}) => (
  <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
    <div className="flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${gradient} shrink-0`}>
        <Icon className="w-6 h-6 text-primary-foreground" />
      </div>
      <div>
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <div className="text-muted-foreground space-y-2">{children}</div>
      </div>
    </div>
  </div>
);

const Tips = () => {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
            💡 Tips & Tricks
          </h1>
          <p className="text-muted-foreground">
            Secret shortcuts to make times tables easier!
          </p>
        </div>

        <div className="space-y-6">
          {/* 9 Times Table Finger Trick */}
          <TipCard icon={Hand} title="The 9× Finger Trick" gradient="gradient-primary">
            <p>
              Hold up all 10 fingers. To multiply 9 by any number (1-10), put down that finger.
            </p>
            <div className="bg-muted/50 rounded-xl p-4 mt-3">
              <p className="font-semibold text-foreground">Example: 9 × 4</p>
              <p>Put down your 4th finger (from the left).</p>
              <p>Count fingers on the left: <span className="font-bold text-primary">3</span></p>
              <p>Count fingers on the right: <span className="font-bold text-primary">6</span></p>
              <p className="font-bold text-foreground mt-2">Answer: 36! ✨</p>
            </div>
          </TipCard>

          {/* 10 Times Table */}
          <TipCard icon={Star} title="The 10× Rule" gradient="gradient-secondary">
            <p>
              Multiplying by 10 is super easy - just add a zero!
            </p>
            <div className="bg-muted/50 rounded-xl p-4 mt-3">
              <p><span className="font-bold">3 × 10 = 30</span> (add a 0 to 3)</p>
              <p><span className="font-bold">7 × 10 = 70</span> (add a 0 to 7)</p>
              <p><span className="font-bold">12 × 10 = 120</span> (add a 0 to 12)</p>
            </div>
          </TipCard>

          {/* 5 Times Table */}
          <TipCard icon={Calculator} title="The 5× Pattern" gradient="gradient-fun">
            <p>
              The 5 times table always ends in 0 or 5!
            </p>
            <div className="bg-muted/50 rounded-xl p-4 mt-3">
              <p>Even numbers × 5 end in <span className="font-bold text-primary">0</span></p>
              <p>Odd numbers × 5 end in <span className="font-bold text-primary">5</span></p>
              <p className="mt-2">
                <span className="font-bold">Trick:</span> Take half the number, then add a 0!
              </p>
              <p>8 × 5 → half of 8 is 4 → add 0 → <span className="font-bold">40</span></p>
            </div>
          </TipCard>

          {/* 11 Times Table */}
          <TipCard icon={Sparkles} title="The 11× Magic (1-9)" gradient="gradient-success">
            <p>
              For 11 × any single digit, just write the digit twice!
            </p>
            <div className="bg-muted/50 rounded-xl p-4 mt-3">
              <p><span className="font-bold">11 × 2 = 22</span></p>
              <p><span className="font-bold">11 × 5 = 55</span></p>
              <p><span className="font-bold">11 × 9 = 99</span></p>
            </div>
          </TipCard>

          {/* Doubles */}
          <TipCard icon={Shuffle} title="Use Doubles" gradient="gradient-primary">
            <p>
              The 2× table is just doubling. The 4× table is doubling twice!
            </p>
            <div className="bg-muted/50 rounded-xl p-4 mt-3">
              <p><span className="font-bold">2 × 6:</span> Double 6 = <span className="font-bold text-primary">12</span></p>
              <p><span className="font-bold">4 × 6:</span> Double 6 = 12, double again = <span className="font-bold text-primary">24</span></p>
              <p><span className="font-bold">8 × 6:</span> Keep doubling! 12 → 24 → <span className="font-bold text-primary">48</span></p>
            </div>
          </TipCard>

          {/* Commutative Property */}
          <TipCard icon={Shuffle} title="Flip It Around!" gradient="gradient-secondary">
            <p>
              The order doesn't matter! 3 × 7 is the same as 7 × 3.
            </p>
            <div className="bg-muted/50 rounded-xl p-4 mt-3">
              <p>If you know <span className="font-bold">3 × 7 = 21</span></p>
              <p>Then you also know <span className="font-bold">7 × 3 = 21</span></p>
              <p className="mt-2 text-sm">This means you only need to learn half the facts!</p>
            </div>
          </TipCard>

          {/* Square Numbers */}
          <TipCard icon={Lightbulb} title="Square Numbers are Special" gradient="gradient-fun">
            <p>
              When you multiply a number by itself, it makes a square number!
            </p>
            <div className="bg-muted/50 rounded-xl p-4 mt-3">
              <div className="grid grid-cols-4 gap-2 text-center">
                <div><span className="font-bold">1×1=1</span></div>
                <div><span className="font-bold">2×2=4</span></div>
                <div><span className="font-bold">3×3=9</span></div>
                <div><span className="font-bold">4×4=16</span></div>
                <div><span className="font-bold">5×5=25</span></div>
                <div><span className="font-bold">6×6=36</span></div>
                <div><span className="font-bold">7×7=49</span></div>
                <div><span className="font-bold">8×8=64</span></div>
              </div>
              <p className="mt-2 text-sm">Memorise these - they come up a lot!</p>
            </div>
          </TipCard>

          {/* 3 Times Table */}
          <TipCard icon={Calculator} title="The 3× Digit Sum" gradient="gradient-success">
            <p>
              Add the digits of any 3× answer - the sum is always divisible by 3!
            </p>
            <div className="bg-muted/50 rounded-xl p-4 mt-3">
              <p><span className="font-bold">3 × 4 = 12</span> → 1+2 = 3 ✓</p>
              <p><span className="font-bold">3 × 7 = 21</span> → 2+1 = 3 ✓</p>
              <p><span className="font-bold">3 × 8 = 24</span> → 2+4 = 6 (divisible by 3) ✓</p>
            </div>
          </TipCard>
        </div>
      </div>
    </Layout>
  );
};

export default Tips;
