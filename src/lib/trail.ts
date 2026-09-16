import {
  Star,
  LayoutGrid,
  Home,
  Zap,
  ThumbsUp,
  Gamepad2,
  HelpCircle,
  Sparkles,
  Link2,
  Layers,
  BookOpen,
  Divide,
  Calendar,
  Mountain,
  Tent,
  Waves,
  Flag,
  type LucideIcon,
} from "lucide-react";

export type TrailRegionId =
  | "camp"
  | "rapids"
  | "peaks"
  | "village"
  | "summit";

export interface TrailRegion {
  id: TrailRegionId;
  name: string;
  tagline: string;
  icon: LucideIcon;
  /** Tailwind classes for the banner tint */
  bannerClass: string;
  /** Tailwind classes for the node badge gradient */
  nodeClass: string;
}

export interface TrailStop {
  gameType:
    | "practice"
    | "quiz"
    | "speed"
    | "memory"
    | "missing"
    | "stories"
    | "climb"
    | "division"
    | "pattern"
    | "daily"
    | "bonds"
    | "truefalse"
    | "array"
    | "family";
  title: string;
  blurb: string;
  to: string;
  icon: LucideIcon;
  region: TrailRegionId;
}

export const TRAIL_REGIONS: TrailRegion[] = [
  {
    id: "camp",
    name: "Base Camp",
    tagline: "Warm up and see how times tables work",
    icon: Tent,
    bannerClass:
      "bg-success/10 border-success/30 text-[hsl(142_55%_30%)]",
    nodeClass: "gradient-success",
  },
  {
    id: "rapids",
    name: "Quick-Fire Rapids",
    tagline: "Answer fast, ride the current",
    icon: Waves,
    bannerClass: "bg-info/10 border-info/30 text-[hsl(205_75%_36%)]",
    nodeClass: "gradient-primary",
  },
  {
    id: "peaks",
    name: "Puzzle Peaks",
    tagline: "Tricky trails for clever climbers",
    icon: Mountain,
    bannerClass: "bg-accent/10 border-accent/30 text-[hsl(280_55%_42%)]",
    nodeClass: "gradient-fun",
  },
  {
    id: "village",
    name: "Story Village",
    tagline: "Times tables hiding in real life",
    icon: Home,
    bannerClass:
      "bg-secondary/10 border-secondary/30 text-[hsl(28_85%_36%)]",
    nodeClass: "gradient-secondary",
  },
  {
    id: "summit",
    name: "The Summit",
    tagline: "The biggest challenges on the mountain",
    icon: Flag,
    bannerClass: "bg-primary/10 border-primary/30 text-[hsl(174_75%_28%)]",
    nodeClass: "gradient-primary",
  },
];

/** Trail order = the journey from Base Camp to the Summit */
export const TRAIL_STOPS: TrailStop[] = [
  {
    gameType: "practice",
    title: "Flashcards",
    blurb: "Quick practice with feedback",
    to: "/practice",
    icon: Star,
    region: "camp",
  },
  {
    gameType: "array",
    title: "Array Builder",
    blurb: "See times tables as groups",
    to: "/array",
    icon: LayoutGrid,
    region: "camp",
  },
  {
    gameType: "family",
    title: "Fact Family",
    blurb: "Multiply & divide together",
    to: "/family",
    icon: Home,
    region: "camp",
  },
  {
    gameType: "speed",
    title: "Speed Race",
    blurb: "60 second challenge!",
    to: "/speed",
    icon: Zap,
    region: "rapids",
  },
  {
    gameType: "truefalse",
    title: "True or False",
    blurb: "Quick thinking game",
    to: "/truefalse",
    icon: ThumbsUp,
    region: "rapids",
  },
  {
    gameType: "quiz",
    title: "Quiz",
    blurb: "Multiple choice scoring",
    to: "/quiz",
    icon: Gamepad2,
    region: "rapids",
  },
  {
    gameType: "missing",
    title: "Missing Number",
    blurb: "Find the ? in equations",
    to: "/missing",
    icon: HelpCircle,
    region: "peaks",
  },
  {
    gameType: "pattern",
    title: "Pattern Puzzle",
    blurb: "Find missing numbers",
    to: "/pattern",
    icon: Sparkles,
    region: "peaks",
  },
  {
    gameType: "bonds",
    title: "Number Bonds",
    blurb: "Find the factors!",
    to: "/bonds",
    icon: Link2,
    region: "peaks",
  },
  {
    gameType: "memory",
    title: "Memory Match",
    blurb: "Match equations to answers",
    to: "/memory",
    icon: Layers,
    region: "peaks",
  },
  {
    gameType: "stories",
    title: "Word Problems",
    blurb: "100+ story scenarios",
    to: "/stories",
    icon: BookOpen,
    region: "village",
  },
  {
    gameType: "division",
    title: "Division",
    blurb: "Reverse multiplication",
    to: "/division",
    icon: Divide,
    region: "village",
  },
  {
    gameType: "daily",
    title: "Daily Challenge",
    blurb: "A new puzzle every day",
    to: "/daily",
    icon: Calendar,
    region: "summit",
  },
  {
    gameType: "climb",
    title: "Table Climb",
    blurb: "Climb to the summit!",
    to: "/climb",
    icon: Mountain,
    region: "summit",
  },
];

/** Accuracy % -> stars earned on a trail stop (matches in-game star rating) */
export function starsForAccuracy(accuracy: number): 0 | 1 | 2 | 3 {
  if (accuracy >= 90) return 3;
  if (accuracy >= 70) return 2;
  if (accuracy >= 50) return 1;
  return 0;
}
