# Times Table Adventures

A fun, interactive times table learning app for kids! Built with React 19, TypeScript, and Convex for progress tracking.

**Live Demo:** [ttf.antoniosmith.xyz](https://ttf.antoniosmith.xyz)

## Features

### Games & Practice Modes (12 Games!)

- **Quiz Challenge** - Multiple choice questions with customizable time limits
- **Speed Race** - Answer as many as you can in 60 seconds
- **Practice Mode** - Flashcard-style practice with instant feedback
- **Memory Match** - Match equations with their answers
- **Missing Number** - Find the missing number in equations (e.g., `? × 4 = 20`)
- **Word Problems** - 100+ story-based multiplication problems across 10 categories
- **Division Challenge** - Reverse multiplication practice
- **Pattern Puzzle** - Find missing numbers in sequences
- **Times Table Climb** - Mountain climbing adventure with lives
- **Daily Challenge** - Unique daily puzzle with streak tracking
- **Number Bonds** - Find the factors that multiply to make a product
- **True or False** - Quick-fire equation verification with optional timed mode

### Progress Tracking (Optional)

- **No login required** - Kids can play immediately without signing up
- **Optional save** - After games, kids can choose to save their progress
- **Simple sign-in** - Just pick an avatar and enter a name
- **Progress Dashboard** - View stats, mastery levels, and achievements
- **Table Mastery** - Track proficiency for each times table (1-12)
- **Achievements** - Earn badges for streaks, perfect scores, and more

### Kid-Friendly Design

- Colorful, playful UI with animations
- Encouraging feedback messages
- Confetti celebrations on streaks and perfect scores
- Sound effects with mute toggle
- Keyboard shortcuts for power users
- "Why was I wrong?" help button with learning tips
- Mobile-optimized with 44px touch targets

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite 6
- **Styling**: Tailwind CSS 4, shadcn/ui components
- **Animations**: Framer Motion, canvas-confetti
- **Backend**: Convex (real-time database)
- **Package Manager**: Bun
- **Hosting**: Netlify

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 20+
- [Convex account](https://convex.dev/) (free)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/antonio59/times-table-adventures.git
   cd times-table-adventures
   ```

2. **Install dependencies**

   ```bash
   bun install
   ```

3. **Set up Convex**

   If you're setting up a new Convex project:

   ```bash
   bunx convex dev
   ```

   This will prompt you to log in and create a new project.

   Or if you have an existing deployment, create `.env.local`:

   ```bash
   echo "VITE_CONVEX_URL=https://your-deployment.convex.cloud" > .env.local
   ```

4. **Run the development server**

   ```bash
   # Terminal 1 - Frontend
   bun run dev

   # Terminal 2 - Convex backend (for local development)
   bun run dev:backend
   ```

5. **Open the app**

   Visit [http://localhost:8080](http://localhost:8080)

## Available Scripts

| Command                 | Description              |
| ----------------------- | ------------------------ |
| `bun run dev`           | Run Vite dev server      |
| `bun run dev:backend`   | Run Convex dev server    |
| `bun run build`         | Build for production     |
| `bun run preview`       | Preview production build |
| `bun run lint`          | Run ESLint               |
| `bun run convex:deploy` | Deploy Convex functions  |

## Project Structure

```
times-table-adventures/
├── convex/                 # Convex backend
│   ├── schema.ts          # Database schema
│   ├── users.ts           # User mutations/queries
│   ├── gameSessions.ts    # Game session tracking
│   ├── tableMastery.ts    # Per-table proficiency
│   └── achievements.ts    # Badge system
├── src/
│   ├── components/
│   │   ├── ui/            # shadcn/ui components
│   │   ├── layout/        # Header, Layout
│   │   ├── ErrorBoundary.tsx
│   │   ├── SoundToggle.tsx
│   │   ├── KeyboardShortcutsHelp.tsx
│   │   ├── WrongAnswerHelp.tsx
│   │   ├── UserMenu.tsx
│   │   └── SaveProgressPrompt.tsx
│   ├── contexts/
│   │   ├── UserContext.tsx   # User state management
│   │   └── SoundContext.tsx  # Sound effects
│   ├── hooks/
│   │   └── use-keyboard-shortcuts.ts
│   ├── lib/
│   │   ├── confetti.ts       # Confetti effects
│   │   └── daily-challenge.ts # Daily puzzle generator
│   ├── pages/
│   │   ├── Quiz.tsx
│   │   ├── Practice.tsx
│   │   ├── SpeedRace.tsx
│   │   ├── MemoryMatch.tsx
│   │   ├── MissingNumber.tsx
│   │   ├── WordProblems.tsx
│   │   ├── DivisionChallenge.tsx
│   │   ├── PatternPuzzle.tsx
│   │   ├── TimesTableClimb.tsx
│   │   ├── DailyChallenge.tsx
│   │   ├── NumberBonds.tsx
│   │   ├── TrueFalse.tsx
│   │   ├── Progress.tsx
│   │   └── ...
│   ├── App.tsx
│   └── main.tsx
├── scripts/
│   └── install-native-deps.js  # Bun native deps workaround
├── .github/
│   └── workflows/         # CI/CD pipelines
├── netlify.toml           # Netlify configuration
└── package.json
```

## Database Schema

### Users

Simple name-based profiles (no passwords needed for kids):

- `name` - Display name
- `avatar` - Emoji avatar
- `createdAt`, `lastActiveAt`

### Game Sessions

Tracks each game played:

- `gameType` - quiz, practice, speed, memory, missing, stories, climb, division, pattern, daily, bonds, truefalse
- `score`, `correctAnswers`, `totalQuestions`
- `bestStreak`, `timeSpent`
- `tablesUsed` - Which times tables were practiced

### Table Mastery

Per-table proficiency tracking:

- `tableNumber` (1-12)
- `totalAttempts`, `correctAttempts`
- `averageTimeMs`
- Mastery levels: beginner → learning → practicing → mastered

### Achievements

12 unlockable badges:

- First Steps, Perfect Score, On Fire (5 streak)
- Unstoppable (10 streak), Math Wizard (20 streak)
- Speed Demon, Memory Master, and more!

## Deployment

### Netlify (Recommended)

The project is configured for Netlify deployment:

1. **Connect your GitHub repo to Netlify**
2. **Set environment variables in Netlify**:
   - `VITE_CONVEX_URL` - Your Convex deployment URL
3. **Build settings are auto-detected** from `netlify.toml`:
   - Build command: `bun run build`
   - Publish directory: `dist`

### GitHub Actions CI/CD

The project includes automated CI/CD workflows using Bun:

- **CI** (`ci.yml`) - Runs on PRs: linting, type checking, and build
- **Deploy** (`deploy.yml`) - Runs on push to main: deploys Convex backend and frontend to Netlify

#### Required GitHub Secrets

| Secret               | Description                                                                                                         |
| -------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `VITE_CONVEX_URL`    | Your Convex deployment URL (e.g., `https://silent-wolf-650.convex.cloud`)                                           |
| `CONVEX_DEPLOY_KEY`  | Convex deploy key for CI/CD                                                                                         |
| `NETLIFY_AUTH_TOKEN` | Netlify personal access token ([create one here](https://app.netlify.com/user/applications#personal-access-tokens)) |
| `NETLIFY_SITE_ID`    | Your Netlify site ID (found in Site Settings > General)                                                             |

### Manual Deployment

```bash
# Deploy Convex backend
bunx convex deploy

# Build frontend
bun run build

# The dist/ folder can be deployed to any static host
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this for your own kids' learning!

---

Made with love for learning multiplication!
