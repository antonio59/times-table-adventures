# Times Table Adventures

A fun, interactive times table learning app for kids! Built with React, TypeScript, and Convex for progress tracking.

## Features

### Games & Practice Modes

- **Quiz Challenge** - Multiple choice questions with customizable time limits
- **Speed Race** - Answer as many as you can in 60 seconds
- **Practice Mode** - Flashcard-style practice with instant feedback
- **Memory Match** - Match equations with their answers
- **Missing Number** - Find the missing number in equations (e.g., `? × 4 = 20`)
- **Word Problems** - 70+ story-based multiplication problems
- **Division Challenge** - Reverse multiplication practice
- **Pattern Puzzle** - Find missing numbers in sequences
- **Times Table Climb** - Mountain climbing adventure with lives

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
- "Why was I wrong?" help button with learning tips
- Works great on tablets and phones

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **Animations**: Framer Motion, canvas-confetti
- **Backend**: Convex (real-time database)
- **Package Manager**: Bun
- **Hosting**: Netlify

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (or Node.js 18+)
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
│   │   ├── AnimatedElements.tsx  # Framer Motion animations
│   │   ├── ErrorBoundary.tsx     # Error handling
│   │   ├── WrongAnswerHelp.tsx   # Learning tips
│   │   ├── UserMenu.tsx   # User dropdown/login
│   │   └── SaveProgressPrompt.tsx
│   ├── contexts/
│   │   └── UserContext.tsx # User state management
│   ├── lib/
│   │   └── confetti.ts    # Confetti effects
│   ├── pages/
│   │   ├── Quiz.tsx
│   │   ├── Practice.tsx
│   │   ├── SpeedRace.tsx
│   │   ├── MemoryMatch.tsx
│   │   ├── MissingNumber.tsx
│   │   ├── DivisionChallenge.tsx
│   │   ├── PatternPuzzle.tsx
│   │   ├── TimesTableClimb.tsx
│   │   ├── Progress.tsx   # Stats dashboard
│   │   └── ...
│   ├── App.tsx
│   └── main.tsx
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

- `gameType` - quiz, practice, speed, memory, missing, stories
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

### Custom Domain with Subdomain

To use a subdomain without changing your nameservers:

1. Add a CNAME record in your DNS provider:
   - **Name:** your subdomain (e.g., `math`)
   - **Value:** `your-site.netlify.app`
2. Add the custom domain in Netlify's domain settings
3. SSL certificate will be provisioned automatically

### GitHub Actions CI/CD

The project includes automated CI/CD workflows:

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
