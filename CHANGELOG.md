# Changelog

All notable changes to Times Table Adventures will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.0] - 2025-12-28

### Added - New Games

- **Number Bonds** (`/bonds`) - Find factors that multiply to make a given product
  - Two question types: find both factors, or find missing factor when one is given
  - Configurable tables and question count
  - Streak tracking and celebrations

- **True or False** (`/truefalse`) - Quick-fire equation verification
  - Two game modes:
    - **Questions mode**: Answer 10, 15, 20, or 30 questions
    - **Timed mode**: Answer as many as possible in 60 seconds
  - Shows correct answer when wrong
  - Configurable tables

### Added - Word Problem Scenarios

- **40+ new story templates** across 5 new categories:
  - **Space & Astronomy** - Rockets, satellites, astronauts, planets, moon rocks
  - **Music & Entertainment** - Bands, concerts, choirs, DJs, movies, streaming
  - **Birthday Parties** - Cake, presents, party bags, games, magicians
  - **Gardening** - Carrots, sunflowers, greenhouses, orchards, pumpkins
  - **Technology & Gaming** - Video games, apps, coding, YouTubers, VR
- Word problems now has **100+ total scenarios** (up from 70)

### Changed - Package Manager

- Switched from npm to **Bun** for faster installs and builds
- Switched from `@vitejs/plugin-react-swc` to `@vitejs/plugin-react` for better Bun compatibility
- Updated GitHub Actions CI/CD workflows to use `oven-sh/setup-bun@v2`
- Added `scripts/install-native-deps.js` to handle platform-specific native binaries with Bun
- Added `trustedDependencies` in package.json for Bun

### Changed - Homepage

- Added game cards for Number Bonds and True or False
- Updated game count from 10 to 12
- Updated word problems description to "100+ story scenarios"

### Fixed

- Resolved native dependency issues with Rollup, esbuild, Tailwind oxide, and LightningCSS when using Bun

---

## [1.3.0] - 2025-12-26

### Added - Animations & Gamification

- **Framer Motion animations** throughout the app:
  - Smooth page transitions and element animations
  - Bouncy button feedback on hover/tap
  - Question cards slide in from the side
  - Score counter pulses when updated
  - Stars animate in sequence on completion screens
  - Progress bars animate smoothly
- **Confetti celebrations** using canvas-confetti:
  - Small burst for correct answers during streaks
  - Medium celebration for 70%+ scores
  - Big celebration with fireworks for perfect scores
- **Streak fire indicator** - Shows "🔥 X streak!" with animation when on a roll

- **Wrong Answer Help** - When you get an answer wrong:
  - Click "Why was I wrong? Learn a tip!" button
  - Modal shows the correct answer and a personalized learning tip
  - Tips are context-aware (9× finger trick, 5× halving method, etc.)
  - Encouraging message to keep practicing

### Added - PWA Support

- **Web App Manifest** (`manifest.json`) - Proper app name "Times Table Adventures"
- **Apple mobile web app** meta tags for iOS home screen
- **Application name** meta tag for browser tab/window

### Changed - Tips & Tricks Page

- Reorganized into **4 sections** with tab navigation:
  - **Quick Tricks** - Instant shortcuts (finger trick, doubling, etc.)
  - **Number Patterns** - Digit sums, square numbers, 9× patterns
  - **Memory Tips** - Rhymes, visualization, tricky facts to memorize
  - **Practice Tips** - Best learning order, study strategies
- Added **20+ new tips** including:
  - Rhymes for hard facts (6×8=48, 8×8=64, etc.)
  - Near doubles strategy
  - 12× split method (10× + 2×)
  - Real-life multiplication examples
  - Best order to learn tables
- Tips now have **hover animations** and scroll-reveal effects

### Changed - Quiz Improvements

- Added **animated components** (AnimatedElements.tsx):
  - AnimatedStars, AnimatedProgress, StreakFire, etc.
- Questions **slide in** with spring animation
- Answer buttons have **hover scale effect**
- Wrong answers show **shake animation**
- **Checkmarks and X marks** on answer buttons after selection

### Technical

- Added `framer-motion` (^12.23.26) for animations
- Added `canvas-confetti` (^1.9.4) for celebrations
- New components:
  - `src/components/WrongAnswerHelp.tsx`
  - `src/components/AnimatedElements.tsx`
  - `src/lib/confetti.ts`

---

## [1.2.0] - 2025-12-26

### Added - New Games

- **Division Challenge** (`/division`) - Practice division using times tables knowledge backwards
  - Multiple choice answers
  - Configurable time per question and question count
  - Helpful hints explaining the multiplication-division relationship
- **Pattern Puzzle** (`/pattern`) - Find the missing number in sequences
  - Sequences based on times tables
  - Hints show which table the pattern uses
  - Configurable number of rounds
- **Times Table Climb** (`/climb`) - Mountain climbing adventure game
  - Answer all 12 facts to reach the summit
  - Three difficulty levels (Easy/Normal/Expert)
  - Lives system - too many mistakes and you fall!
  - Visual mountain climbing progress

### Changed - Quiz Improvements

- **Fixed timer display** - Now shows per-question countdown instead of total time
  - Time per question: 5s, 10s, 15s, 20s, or 30s options
  - Timer resets for each question
  - Visual warning when time is running low (yellow at 5s, red at 3s)
- **Added question count selector** - Choose 5, 10, 15, or 20 questions
- **Improved wrong answer options** - Uses common mistake patterns for more realistic distractors
- **Auto-advance on timeout** - If time runs out, question is marked wrong and game continues

### Changed - Word Problems

- **Expanded from 12 to 70+ story templates** covering:
  - Food & Cooking (pizzas, eggs, muffins, etc.)
  - School & Classroom (desks, books, pencils)
  - Animals & Nature (spiders, birds, fish, bees)
  - Sports & Games (teams, scores, video games)
  - Transportation (cars, buses, trains, planes)
  - Shopping & Money (tickets, savings, purchases)
  - Home & Family (rooms, gardens, apartments)
  - Arts & Crafts (stickers, crayons, LEGO)
  - Time & Reading (pages, practice minutes)
  - Space & Science (rockets, planets)
  - Celebrations & Parties (treats, balloons, presents)
  - Fantasy & Fun (dragons, wizards, pirates, superheroes)
- **Fixed deprecated onKeyPress** - Replaced with onKeyDown
- **Added aria-label** to answer input for accessibility

### Added

- **Shake animation** - Visual feedback for wrong answers in climbing game

---

## [1.1.0] - 2025-12-26

### Added

- **ErrorBoundary component** (`src/components/ErrorBoundary.tsx`) - Graceful error handling with user-friendly recovery UI, displays dev-only error details
- **SVG favicon** (`public/favicon.svg`) - Modern, scalable favicon with math-themed gradient design
- **Proper favicon configuration** - Added apple-touch-icon support, theme-color meta tag (#8B5CF6)
- **Environment validation** - Runtime check for required `VITE_CONVEX_URL` in `main.tsx`
- **Open Graph metadata** - Added `og:site_name` for better social sharing

### Changed

- **README.md** - Complete rewrite with:
  - Project-specific documentation
  - Feature list
  - Tech stack overview
  - Installation and setup instructions
  - Project structure documentation
  - Deployment guide with Netlify subdomain instructions
- **404 page** (`src/pages/NotFound.tsx`) - Improved design:
  - Now uses Layout component for consistent styling
  - Math-themed messaging
  - Removed console.error logging
  - Uses React Router Link instead of anchor tag
- **App.tsx** - Wrapped application in ErrorBoundary for graceful error handling
- **Package updates** - All packages updated to latest stable versions:
  - All @radix-ui/\* packages updated to latest patch versions
  - @tanstack/react-query: 5.83.0 -> 5.90.12
  - react-hook-form: 7.61.1 -> 7.69.0
  - react-router-dom: 6.30.1 -> 6.30.2
  - TypeScript: 5.8.3 -> 5.9.3
  - ESLint: 9.32.0 -> 9.39.2
  - typescript-eslint: 8.38.0 -> 8.50.1
  - Vite: 5.4.19 -> 5.4.21
  - tailwindcss: 3.4.17 -> 3.4.19
  - autoprefixer: 10.4.21 -> 10.4.23
  - @tailwindcss/typography: 0.5.16 -> 0.5.19
  - eslint-plugin-react-refresh: 0.4.20 -> 0.4.26

### Removed

- **Lovable branding** - Removed all references to Lovable from documentation and codebase
- **Console.error in 404** - Removed unnecessary console logging in production

### Security

- **Environment variable validation** - App now fails fast with clear error message if `VITE_CONVEX_URL` is missing
- **Error boundary** - Prevents full app crash, hides error stack traces in production

### Fixed

- **Meta tags** - Added proper favicon link tags in `index.html`:
  - SVG favicon with fallback to ICO
  - Apple touch icon support
  - Theme color for mobile browsers
- **Print preview** - Header and footer properly hidden in print mode (already had `no-print` class)

---

## [1.0.0] - Initial Release

### Features

- **Interactive Times Tables** - View and study multiplication tables 1-12
- **Flashcard Practice** - Quick practice with instant feedback
- **Multiple Choice Quiz** - Test knowledge with scoring
- **Speed Race** - 60-second challenge mode
- **Missing Number Puzzles** - Find the missing value in equations
- **Memory Match Game** - Match equations to answers
- **Word Problems** - Story-based multiplication challenges
- **Tips & Tricks** - Shortcuts and patterns for memorization
- **Printable Worksheets** - Generate and print practice sheets
- **Progress Tracking** - Track learning progress with achievements
- **User Profiles** - Avatar selection and name customization
- **Guest Progress** - Local storage for guest users
- **Persistent Data** - Convex backend for logged-in users

### Technical Stack

- React 18 with TypeScript
- Vite build system
- Tailwind CSS with shadcn/ui components
- Convex real-time database
- React Router for navigation
- TanStack Query for data fetching
- Nunito font family

---

## Upgrade Notes

### Upgrading to 1.1.0

1. **Install dependencies:**

   ```bash
   npm install
   # or
   bun install
   ```

2. **Environment variables:** Ensure `VITE_CONVEX_URL` is set in your `.env.local` file. The app will now throw an error at startup if this is missing.

3. **Favicon:** The new SVG favicon will automatically be used. You can replace `public/favicon.svg` with your own design.

4. **No breaking changes:** All existing functionality remains compatible.

5. **macOS Apple Silicon users:** If you encounter build errors related to rollup or swc, the optional dependencies are already configured in package.json.

---

## Known Issues (To Address)

### Accessibility

- Some interactive elements (table selector buttons, answer options) lack `aria-label` attributes
- Form inputs could benefit from explicit `<label>` associations
- Score updates should use `aria-live` regions for screen reader announcements

### Code Quality

- Some `setTimeout` calls in game components could benefit from cleanup on unmount
- Deprecated `onKeyPress` events should be replaced with `onKeyDown`

### Backend

- User name input should have additional validation/sanitization
- Consider adding rate limiting to high-traffic endpoints

These items are documented for future improvement but do not affect core functionality.
