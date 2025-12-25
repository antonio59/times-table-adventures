# Times Table Adventures

A fun, interactive times table learning app for kids! Built with React, TypeScript, and Convex for progress tracking.

## Features

### Games & Practice Modes

- **Quiz Challenge** - Multiple choice questions with customizable time limits
- **Speed Race** - Answer as many as you can in 60 seconds
- **Practice Mode** - Flashcard-style practice with instant feedback
- **Memory Match** - Match equations with their answers
- **Missing Number** - Find the missing number in equations (e.g., `? × 4 = 20`)
- **Word Problems** - Story-based multiplication problems

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
- No pressure to create accounts
- Works great on tablets and phones

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Convex (real-time database)
- **Package Manager**: npm

## Getting Started

### Prerequisites

- [Node.js 18+](https://nodejs.org/)
- [Convex account](https://convex.dev/) (free)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/antonio59/times-table-adventures.git
   cd times-table-adventures
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up Convex**

   If you're setting up a new Convex project:

   ```bash
   npx convex dev
   ```

   This will prompt you to log in and create a new project.

   Or if you have an existing deployment, create `.env.local`:

   ```bash
   echo "VITE_CONVEX_URL=https://your-deployment.convex.cloud" > .env.local
   ```

4. **Run the development server**

   ```bash
   # Terminal 1 - Frontend
   npm run dev

   # Terminal 2 - Convex backend (for local development)
   npm run dev:backend
   ```

5. **Open the app**

   Visit [http://localhost:8080](http://localhost:8080)

## Available Scripts

| Command                 | Description              |
| ----------------------- | ------------------------ |
| `npm run dev`           | Run Vite dev server      |
| `npm run dev:backend`   | Run Convex dev server    |
| `npm run build`         | Build for production     |
| `npm run preview`       | Preview production build |
| `npm run lint`          | Run ESLint               |
| `npm run convex:deploy` | Deploy Convex functions  |

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
│   │   ├── UserMenu.tsx   # User dropdown/login
│   │   └── SaveProgressPrompt.tsx
│   ├── contexts/
│   │   └── UserContext.tsx # User state management
│   ├── pages/
│   │   ├── Quiz.tsx
│   │   ├── Practice.tsx
│   │   ├── SpeedRace.tsx
│   │   ├── MemoryMatch.tsx
│   │   ├── MissingNumber.tsx
│   │   ├── Progress.tsx   # Stats dashboard
│   │   └── ...
│   ├── App.tsx
│   └── main.tsx
├── .github/
│   └── workflows/         # CI/CD pipelines
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

### Convex Backend

```bash
npx convex deploy
```

### Frontend (Vercel, Netlify, etc.)

1. Set environment variable: `VITE_CONVEX_URL`
2. Build command: `npm run build`
3. Output directory: `dist`

### GitHub Actions

The project includes CI/CD workflows:

- **CI** (`ci.yml`) - Runs on PRs: linting, type checking, and build
- **Deploy** (`deploy.yml`) - Runs on push to main: deploys Convex and builds frontend

Required secrets for GitHub Actions:

- `VITE_CONVEX_URL` - Your Convex deployment URL
- `CONVEX_DEPLOY_KEY` - Convex deploy key for CI/CD

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this for your own kids' learning!

---

Made with love for learning multiplication!
