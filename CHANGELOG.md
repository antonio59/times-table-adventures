# Changelog

All notable changes to this project will be documented in this file.
## [Unreleased]

### Bug Fixes

- Auto-redirect to signup if no users

### CI/CD

- Make SARIF upload non-blocking when Code Scanning is disabled
- Add OSV Scanner workflow for dependency vulnerability scanning
- Add automatic changelog workflow
- Add automatic changelog workflow
- Add automatic changelog workflow

### Changes

- Merge pull request #1 from antonio59/feat/profile-pin-login

feat: profile selection + PIN numpad login
- Fix ESLint warnings

- TimesTableClimb: wrap handleWrongAnswer in useCallback and add to useEffect deps
- SoundContext: add eslint-disable comment for useSound hook export (standard pattern for context files)
- Remove unused dependencies and components

Removed dependencies:
- date-fns, zod, @hookform/resolvers, recharts
- 21 unused @radix-ui/* packages
- cmdk, embla-carousel-react, input-otp, react-day-picker
- react-resizable-panels, vaul, react-hook-form

Removed components:
- src/components/NavLink.tsx (unused)
- 40 unused shadcn/ui components

Kept only 8 UI components: button, dialog, dropdown-menu, progress,
sonner, toast, toaster, tooltip

Results:
- CSS bundle: 71KB (was 103KB) - 31% smaller
- No vulnerabilities (bun audit clean)
- Build and lint pass
- Update CI/CD and docs for bun, add v1.4.0 changelog

- Update GitHub Actions workflows to use oven-sh/setup-bun@v2
- Update netlify.toml to use bun install && bun run build
- Update README with new games (Number Bonds, True/False) and 100+ word problems
- Add CHANGELOG v1.4.0 documenting all new features and bun migration
- Switch from npm to bun with native dependency workaround

- Replace package-lock.json with bun.lock
- Switch from @vitejs/plugin-react-swc to @vitejs/plugin-react (better bun compat)
- Add postinstall script to install platform-specific native binaries
- Add trustedDependencies for bun
- Add Number Bonds and True/False games, expand word problems to 100+ scenarios

- Add NumberBonds game: find factors that multiply to make a product
- Add TrueFalse game: quick-fire equation verification with timed mode
- Add 40+ new word problem scenarios (Space, Music, Birthday, Gardening, Tech/Gaming)
- Update schema and types to support 'bonds' and 'truefalse' game types
- Update homepage with 2 new game cards (now 12 games total)
- Mobile optimization: Improve touch targets, responsive layouts, and overflow handling

Header:
- Increased nav button touch targets to 40px minimum
- Added xs breakpoint (375px) for better mobile text handling
- Logo shortens to 'TTF!' on very small screens
- Prevent horizontal overflow

Homepage (Index.tsx):
- Game cards now use compact horizontal layout on mobile
- Reduced padding and icon sizes for mobile
- Stats section uses smaller text on mobile
- Learning tools responsive grid

Tables page:
- Increased table selector touch targets
- Added swipe hint for compact view on mobile
- Better responsive grid sizing

Quiz page:
- Larger touch targets for table selection (44px min)
- Improved settings buttons sizing
- Hidden keyboard hints on touch devices
- Responsive question card sizing

SaveProgressPrompt & UserMenu:
- Avatar picker buttons now 44px minimum
- Better touch feedback with active states

Layout:
- Added overflow-x-hidden to prevent horizontal scroll
- Responsive padding (smaller on mobile)
- Smaller footer text on mobile
- Fix Games nav link and redesign Tables page

- Games link now scrolls to games section on homepage instead of going to Quiz
- Tables page redesigned with two view modes:
  - Grid view: Compact 6-column layout showing all 12 tables without scrolling
  - Compact view: Traditional multiplication table grid with row/column highlighting
- Click any number to focus on that specific table
- Smaller cards with better space utilization
- Add missing game types (climb, division, pattern, daily) to Convex schema
- Add Daily Challenge, sound effects, keyboard shortcuts, and upgrade to Tailwind 4

Features:
- Daily Challenge: Unique daily puzzle with streak tracking, deterministic
  seeded random (all users get same challenge), difficulty varies by weekday
- Sound Effects: Web Audio API-based sounds for correct/wrong/streak/game events
  with global mute toggle in header
- Keyboard Shortcuts: Number keys 1-4 for Quiz answers, Enter to submit,
  Escape to go back, ? for help modal

Improvements:
- New Framer Motion animations (PageTransition, SlideIn, ScaleIn, MemoryCard,
  StaggerContainer, InteractiveCard, CelebrationBurst, etc.)
- Homepage now features Daily Challenge prominently with 'New!' badge

Dependencies:
- Upgraded React 18 -> 19.1.0, Vite 5 -> 6.3.5, Tailwind 3 -> 4.1.18
- Migrated from bun to npm for CI/CD (native dependency compatibility)
- Converted tailwind.config.ts to CSS-based @theme in index.css
- Fix vite config to use SWC plugin
- Regenerate lockfile with bun 1.3.5
- Add CNAME for ttf.antoniosmith.xyz and update lockfile
- Update footer with personal dedication to Cristina
- Add animations, gamification, 3 new games, expanded tips & word problems

- Add Framer Motion animations throughout (slide-in questions, hover effects, animated scores)
- Add confetti celebrations for streaks, wins, and perfect scores
- Add WrongAnswerHelp component with contextual learning tips
- Add 3 new games: Division Challenge, Pattern Puzzle, Times Table Climb
- Expand word problems from 12 to 70+ scenarios
- Expand Tips & Tricks into 4 sections with 20+ new tips
- Fix quiz timer to show per-question countdown
- Add web app manifest for proper browser tab name
- Add ErrorBoundary for graceful error handling
- Update favicon to math-themed SVG
- Update all packages to latest versions
- Make PIN optional for backward compatibility with existing users

- Schema: PIN field is now optional to support legacy users
- Login: Legacy users without PIN will have it set on first login
- Add PIN authentication and fix all lint errors

PIN Authentication:
- Add 4-digit PIN to user accounts for secure recovery
- Update schema to require PIN field
- Add createUser and loginUser mutations
- Add checkUserExists query to prevent duplicate names
- Update UserMenu with signup/login flow and PIN input
- Update SaveProgressPrompt with the same flow
- Update UserContext with separate signup and login methods

Lint Fixes:
- Fix @typescript-eslint/no-explicit-any in achievements.ts
- Fix @typescript-eslint/no-empty-object-type in command.tsx and textarea.tsx
- Fix @typescript-eslint/no-require-imports in tailwind.config.ts
- Ignore convex/_generated in eslint config
- Disable react-refresh warnings for shadcn/ui components
- Fix progress saving and improve account creation UX

- Fix race condition in SaveProgressPrompt: call Convex mutations directly
  instead of relying on React state updates after login
- Add loginWithId to UserContext for setting user after direct mutations
- Add prominent 'Track Progress' banner on home page for non-logged-in users
- Add 'Welcome back' banner for logged-in users with link to progress
- Make Sign In button in header more visible with outline style
- Remove unused imports
- Add code splitting, switch to Bun, setup Netlify deployment

- Add lazy loading for all page components (React.lazy + Suspense)
- Configure Vite manual chunks for vendor splitting (react, radix, recharts, convex, utils)
- Switch from npm to Bun as package manager
- Update GitHub Actions workflows to use Bun
- Add netlify.toml with build config, SPA redirects, and caching headers
- Update README with Bun commands and Netlify deployment instructions
- Remove @rollup/rollup-darwin-arm64 devDependency (not needed with Bun)
- Add CI/CD workflows, update README, fix build configuration

- Add GitHub Actions CI workflow (lint, typecheck, build on PRs)
- Add GitHub Actions deploy workflow (Convex + frontend on push to main)
- Rewrite README with comprehensive setup instructions
- Switch from bun.lockb to package-lock.json for CI compatibility
- Fix vite.config.ts: remove lovable-tagger, use @vitejs/plugin-react
- Update package.json with correct dependencies
- Add Convex for user progress tracking

- Add Convex backend with schema for users, game sessions, table mastery, and achievements
- Create UserContext for optional login/progress tracking
- Add SaveProgressPrompt component for post-game save option
- Add Progress page showing stats, mastery levels, and achievements
- Update all game components (Quiz, Practice, SpeedRace, MemoryMatch, MissingNumber) to track progress
- Add UserMenu component to header
- Switch to Bun package manager
- Login is optional - app works fully without it, prompts to save after games
- Add four new games pages

Introduce Speed Race, Missing Number, Memory Match, and Tips sections with routes, header links, and home-page cards. Expanded navigation and index to showcase new features and updated App, Header, and Index accordingly.

X-Lovable-Edit-ID: edt-a92f8461-c67f-43eb-bc35-d488c1aee589
- Changes
- Add word problems section

Introduce WordProblems page with story-based multiplication questions, integrate into app routes, add navigation entry, and update index to link to Stories. Also update header and index layout to include new Stories section and adjust grid.

X-Lovable-Edit-ID: edt-7e4b033d-aeb9-40e7-a6cd-4c5b4cb6b991
- Changes
- Adapt quiz to learned tables

Enable quiz to generate questions from selected times tables instead of all tables; add selection UI for which tables are known, keeping at least one table, and preserve time per question. Refactors include removing hard-coded table set in quiz, and wiring generateQuestion to use chosen tables.

X-Lovable-Edit-ID: edt-554eaf1a-a853-4c6b-bdbb-e336e72a2720
- Changes
- Refactor UI for learning app

Update app structure and visuals to support times tables learning:
- Remove direct pages routes from App.tsx and add placeholders for future routes
- Standardize button and styling variants (rounded corners, sizes, colors)
- Introduce a design system with updated Tailwind config
- Rework index page to a minimal placeholder
- Add core pages scaffolding (Tables, Practice, Quiz, Print) and header layout
- Update index.css imports and ordering for fonts before Tailwind directives

X-Lovable-Edit-ID: edt-fe2603e6-b627-4895-8ebb-c430ca5b418c
- Changes
- New_style_vite_react_shadcn_ts

### Chores

- Migrate to pnpm v11
- Migrate fully from bun to pnpm (CI, docs)
- Add git-cliff config for changelog generation
- Add git-cliff config for changelog generation
- Add git-cliff config for changelog generation
- Dependency updates and accessibility improvements

### Documentation

- Update changelog [skip ci]
- Update changelog [skip ci]
- Update npm references to pnpm
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]
- Update changelog [skip ci]

### Features

- Change to 6-digit passcode
- Profile selection + PIN numpad login (music-request-v2 style)
- Add global loading states for Convex mutations


