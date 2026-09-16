---
version: alpha
name: Times Tables Fun
description: A playful, kid-friendly design system for an interactive multiplication learning app. Built to feel like a game while maintaining educational clarity.
colors:
  primary: "#2EC4B6"
  primary-foreground: "#FFFFFF"
  secondary: "#F4A261"
  secondary-foreground: "#FFFFFF"
  tertiary: "#B07CDB"
  tertiary-foreground: "#FFFFFF"
  success: "#27C46B"
  success-foreground: "#FFFFFF"
  warning: "#F5C842"
  warning-foreground: "#242B38"
  destructive: "#E04444"
  destructive-foreground: "#FFFFFF"
  background: "#FAF8F5"
  foreground: "#242B38"
  card: "#FFFFFF"
  card-foreground: "#242B38"
  muted: "#F0EDE6"
  muted-foreground: "#6B7280"
  accent: "#B07CDB"
  accent-foreground: "#FFFFFF"
  popover: "#FFFFFF"
  popover-foreground: "#242B38"
  border: "#E8E3D9"
  input: "#E8E3D9"
  ring: "#2EC4B6"
  surface: "#FAF8F5"
  on-surface: "#242B38"
typography:
  display:
    fontFamily: "Nunito"
    fontSize: 48px
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: "Nunito"
    fontSize: 36px
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: -0.01em
  headline-md:
    fontFamily: "Nunito"
    fontSize: 24px
    fontWeight: 700
    lineHeight: 1.3
  headline-sm:
    fontFamily: "Nunito"
    fontSize: 20px
    fontWeight: 700
    lineHeight: 1.4
  body-lg:
    fontFamily: "Nunito"
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.6
  body-md:
    fontFamily: "Nunito"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: "Nunito"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  label-lg:
    fontFamily: "Nunito"
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1
    letterSpacing: 0em
  label-md:
    fontFamily: "Nunito"
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1
    letterSpacing: 0em
  label-sm:
    fontFamily: "Nunito"
    fontSize: 12px
    fontWeight: 600
    lineHeight: 1
    letterSpacing: 0em
rounded:
  none: 0px
  sm: 4px
  md: 8px
  lg: 12px
  xl: 16px
  "2xl": 20px
  "3xl": 24px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  "2xl": 48px
  gutter: 16px
  margin: 16px
  base: 16px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.xl}"
    padding: "12px 24px"
    typography: "{typography.label-lg}"
  button-primary-hover:
    shadow: "0 0 30px rgba(46,196,182,0.3)"
    transform: "scale(1.05)"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.secondary-foreground}"
    rounded: "{rounded.xl}"
    padding: "12px 24px"
    typography: "{typography.label-lg}"
  button-fun:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.tertiary-foreground}"
    rounded: "{rounded.xl}"
    padding: "12px 24px"
    typography: "{typography.label-lg}"
  button-success:
    backgroundColor: "{colors.success}"
    textColor: "{colors.success-foreground}"
    rounded: "{rounded.xl}"
    padding: "12px 24px"
    typography: "{typography.label-lg}"
  button-outline:
    backgroundColor: "transparent"
    borderColor: "{colors.primary}"
    textColor: "{colors.primary}"
    rounded: "{rounded.xl}"
    padding: "12px 24px"
    typography: "{typography.label-lg}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.muted-foreground}"
    rounded: "{rounded.xl}"
    padding: "12px 24px"
    typography: "{typography.label-lg}"
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-foreground}"
    rounded: "{rounded.2xl}"
    padding: "24px"
    shadow: "0 8px 30px -8px rgba(36,43,56,0.12)"
  card-hover:
    borderColor: "{colors.primary}"
    shadow: "0 0 30px rgba(46,196,182,0.3)"
    transform: "translateY(-4px)"
  input:
    backgroundColor: "transparent"
    borderColor: "{colors.input}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.xl}"
    padding: "12px 16px"
    typography: "{typography.body-md}"
  badge:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.muted-foreground}"
    rounded: "{rounded.full}"
    padding: "4px 12px"
    typography: "{typography.label-sm}"
  progress-bar:
    backgroundColor: "{colors.muted}"
    fillColor: "{colors.primary}"
    rounded: "{rounded.full}"
    height: "12px"
  tooltip:
    backgroundColor: "{colors.foreground}"
    textColor: "{colors.background}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
    typography: "{typography.label-sm}"
  toast:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-foreground}"
    rounded: "{rounded.xl}"
    padding: "16px"
    shadow: "0 8px 30px -8px rgba(36,43,56,0.12)"
---

# Times Tables Fun — Design System

## Overview

Times Tables Fun is a **playful, encouraging, and game-like** multiplication learning app designed for children aged 6–11. The design philosophy centers on **"learning through delight"** — every interaction should feel rewarding, every mistake should feel like an opportunity, and every success should be celebrated.

The visual identity combines **warm, approachable colors** with **energetic motion** to create a space that feels safe, fun, and distinctly non-school-like. Unlike typical educational apps that feel clinical or overly gamified, this system uses soft gradients, bouncy animations, and friendly typography to make math feel like an adventure.

**Target audience:** Children (primary focus) and parents/teachers (secondary). The UI must be immediately understandable by kids who may not read fluently yet, while providing enough depth for adults tracking progress.

**Emotional goals:**
- **Confidence:** Large touch targets, forgiving interactions, and encouraging feedback
- **Joy:** Celebratory animations, confetti, and positive reinforcement
- **Clarity:** High contrast, clear hierarchy, and minimal cognitive load
- **Progress:** Visible mastery tracking that makes learning feel like leveling up

## Colors

The palette is built around a **warm teal primary** that feels friendly rather than corporate, paired with an **energetic orange secondary** and a **playful purple accent**. The neutral foundation is warm and soft, avoiding the coldness of pure whites and grays.

- **Primary (#2EC4B6):** A warm teal used for main actions, progress indicators, and the app's core identity. It evokes calm focus and feels approachable for children.
- **Secondary (#F4A261):** A vibrant orange used for highlights, badges, streak counters, and secondary CTAs. It adds energy and excitement.
- **Tertiary (#B07CDB):** A playful purple used for fun elements, game modes, and accent highlights. It provides variety and visual interest.
- **Success (#27C46B):** A fresh green for correct answers, achievements, and positive feedback.
- **Warning (#F5C842):** A sunny yellow for timers running low and gentle cautions.
- **Destructive (#E04444):** A soft red for incorrect answers and errors — noticeable but not alarming.
- **Background (#FAF8F5):** A warm off-white that feels like paper, reducing eye strain during extended play.
- **Foreground (#242B38):** A deep navy-gray for text, providing excellent readability without the harshness of pure black.
- **Muted (#F0EDE6):** A warm gray for inactive states, backgrounds, and subtle dividers.
- **Border (#E8E3D9):** A warm light tan for card borders and input outlines.

### Gradients

Gradients are used extensively for buttons, hero elements, and feature cards to add depth and visual delight:

- **Primary Gradient:** `linear-gradient(135deg, #2EC4B6 0%, #249E93 100%)`
- **Secondary Gradient:** `linear-gradient(135deg, #F4A261 0%, #F28C38 100%)`
- **Fun Gradient:** `linear-gradient(135deg, #B07CDB 0%, #D96CB3 100%)`
- **Success Gradient:** `linear-gradient(135deg, #27C46B 0%, #1FA87A 100%)`
- **Background Gradient:** `linear-gradient(180deg, #FAF8F5 0%, #F5F0E8 100%)`

## Typography

The type system uses a **single font family — Nunito** — in four weights (400, 600, 700, 800). Nunito was chosen for its rounded, friendly letterforms that feel approachable to children while maintaining excellent readability for longer text.

- **Display (48px, ExtraBold):** Hero headlines on the home page. Used sparingly for maximum impact.
- **Headlines (20–36px, Bold/ExtraBold):** Section titles, game names, and achievement headers. Always left-aligned or centered, never justified.
- **Body (14–18px, Regular):** Descriptions, instructions, and help text. Line height is generous (1.5–1.6) to aid young readers.
- **Labels (12–16px, SemiBold):** Buttons, badges, navigation labels, and metadata. All labels use title case.

**Special treatments:**
- Gradient text is used for hero headlines using `background-clip: text` with the primary-to-secondary gradient.
- Emoji are used as decorative elements alongside text to reinforce meaning for pre-readers.
- Numbers in game contexts use tabular figures when available, or monospace fallbacks for alignment.

## Layout

The layout follows a **centered container model** with a maximum width of 1280px (`max-w-5xl` / `max-w-7xl` depending on context). On mobile, content spans the full viewport width with comfortable side margins.

**Spacing scale:**
- A strict 4px base grid with 8px increments for component spacing.
- Card internal padding: 16px mobile, 24px desktop.
- Section vertical spacing: 32px–48px.
- Container horizontal padding: 12px mobile, 16px tablet, 24px desktop.

**Grid patterns:**
- Home page games grid: 2 columns mobile, 3–4 columns tablet, 5 columns desktop.
- Tools section: 1 column mobile, 3 columns desktop.
- Stats bar: 3 equal columns.

**Responsive breakpoints:**
- `xs`: 375px (small phones)
- `sm`: 640px (phones)
- `md`: 768px (tablets)
- `lg`: 1024px (small desktops)
- `xl`: 1280px (large desktops)

## Elevation & Depth

Depth is achieved through a combination of **soft shadows** and **gradient overlays** rather than harsh drop shadows. This creates a tactile, card-based interface that feels physical but friendly.

- **Soft Shadow:** `0 4px 20px -4px rgba(36,43,56,0.1)` — Used on buttons, inputs, and small cards.
- **Card Shadow:** `0 8px 30px -8px rgba(36,43,56,0.12)` — Used on feature cards and modal dialogs.
- **Glow Shadow (Primary):** `0 0 30px rgba(46,196,182,0.3)` — Used on hover states for primary interactive elements.
- **Glow Shadow (Secondary):** `0 0 30px rgba(244,162,97,0.3)` — Used on hover states for secondary interactive elements.

Cards sit on the background gradient with a 1px warm border. On hover, cards lift slightly (`translateY(-4px)`) and gain a glow shadow, creating a sense of interactivity.

## Shapes

The shape language is defined by **"Friendly Roundedness."** All interactive elements, containers, and inputs utilize generous corner radii to feel approachable and safe for children.

- **Buttons:** 12px–16px radius (`rounded-xl` to `rounded-2xl`), creating pill-like but not fully rounded shapes.
- **Cards:** 16px–24px radius (`rounded-2xl` to `rounded-3xl`), softening the container edges.
- **Inputs:** 16px radius (`rounded-xl`), matching button shapes for visual consistency.
- **Avatars/Badges:** Fully circular (`rounded-full`).
- **Icons:** 12px–16px radius with gradient backgrounds, creating soft "icon buttons."

No sharp corners exist on interactive elements. The only exceptions are progress bars and dividers which use full rounding on their ends.

## Components

### Buttons

Buttons are the primary interaction element and use gradient backgrounds with bold white text. They have a tactile feel with active states that scale down (`active:scale-95`) and hover states that scale up and glow.

- **Primary:** Teal gradient, white text, glow on hover. Used for the main action on any screen.
- **Secondary:** Orange gradient, white text. Used for secondary actions and CTAs.
- **Fun:** Purple-pink gradient, white text. Used for game modes and playful contexts.
- **Success:** Green gradient, white text. Used for correct answers and confirmation.
- **Outline:** Transparent with teal border and text. Used for less prominent actions.
- **Ghost:** Transparent with muted text, hover shows muted background. Used for navigation and subtle actions.
- **Game:** Card background with border, hover gains primary glow. Used for game selection cards.

**Sizes:**
- `sm`: 40px height, compact padding
- `default`: 48px height, standard padding — minimum 44px touch target for accessibility
- `lg`: 56px height, large padding
- `xl`: 64px height, extra large padding
- `icon`: 48px square

### Cards

Cards are the primary content container. They use a white background, warm border, and soft shadow. On hover, they lift and gain a primary glow.

- **Feature Card:** Used on the home page for game modes. Contains an icon (gradient circle), title, and description. Compact variant removes description and stacks icon + title horizontally.
- **Stats Card:** Used for displaying aggregate data. Contains a large gradient number and a label.
- **Game Card:** Used within games for answer options. Has a border that changes color based on state (neutral → primary on hover → success/destructive on answer).

### Progress Indicators

- **Linear Progress:** 12px height, rounded-full, muted background with primary fill. Animates width with a 0.5s ease-out transition.
- **Circular Progress:** Used in mastery tracking. Primary color arc on muted background.
- **Streak Badge:** Orange-to-red gradient pill with fire emoji and count. Appears after 3+ consecutive correct answers.

### Dialogs & Modals

- **Help Dialog:** Rounded-3xl card with warm border, appearing with a spring animation. Contains the question, user's wrong answer, correct answer, and a contextual learning tip.
- **Save Progress Prompt:** Modal prompting users to create a profile. Uses the same card styling with a celebratory header.

### Form Elements

- **Text Inputs:** 48px height, rounded-xl, 2px border. Focus state shows primary ring.
- **Select/Dropdown:** Uses Radix UI primitives with custom styling matching cards.
- **Toggle/Switch:** Used for sound and settings. Primary color when active.

### Navigation

- **Header:** Sticky, frosted glass effect (`backdrop-blur-md`), card background at 80% opacity. Contains logo, nav links (icon + label on desktop), sound toggle, and user menu.
- **Nav Buttons:** Ghost variant, 44px minimum touch target. Active state uses primary background.
- **Mobile:** Horizontal scrollable nav with icons visible and labels hidden on small screens.

## Animation & Motion

Motion is central to the experience — it provides feedback, celebrates achievements, and guides attention.

**Interaction animations:**
- **Hover:** Scale 1.05 + glow shadow (200ms ease-out)
- **Active/Tap:** Scale 0.95 (100ms)
- **Card hover:** TranslateY(-4px) + border color change + glow (300ms)

**Entrance animations:**
- **Page transitions:** Fade in + translateY(20px → 0), 300ms ease-out
- **Stagger children:** 50–100ms delay between sibling elements
- **Bounce in:** Spring animation (stiffness 260, damping 20) for celebratory elements
- **Pop:** Scale 0.8 → 1.05 → 1 with opacity fade for cards

**Feedback animations:**
- **Correct answer:** Green flash, confetti burst, checkmark spring animation
- **Wrong answer:** Red shake (translateX oscillation), error X rotation
- **Streak:** Fire emoji bounce, orange gradient badge scale-in
- **Timer warning:** Pulse animation + color change to warning then destructive

**Ambient animations:**
- **Float:** Gentle translateY oscillation for decorative elements
- **Bounce gentle:** Continuous subtle bounce for logo emoji
- **Glow pulse:** Shadow expansion/contraction for emphasis

**Performance:** All animations respect `prefers-reduced-motion`, reducing durations to 0.01ms for users who need it.

## Sound & Feedback

While not strictly visual, the design system accounts for auditory feedback:
- Sound toggle in header (persistent across sessions)
- Different sounds for correct/incorrect answers
- Celebratory sounds for streaks and perfect scores
- All sounds are optional and muted by default after first interaction

## Do's and Don'ts

- **Do** use the primary color only for the single most important action per screen.
- **Do** maintain minimum 44px touch targets on all interactive elements.
- **Do** use gradient backgrounds on buttons and feature icons for visual depth.
- **Do** celebrate achievements with confetti and animated badges.
- **Do** provide contextual help when answers are wrong — never just show "incorrect."
- **Do** respect `prefers-reduced-motion` for accessibility.
- **Do** use emoji alongside text to aid pre-readers.
- **Don't** use pure black or pure white — always use the warm foreground/background colors.
- **Don't** mix sharp and rounded corners in the same component.
- **Don't** use more than two font weights on a single screen.
- **Don't** show alarming red for wrong answers without supportive context — always pair with a learning tip.
- **Don't** require login before playing — progress saving must be optional.
- **Don't** use shadows heavier than the defined card shadow — keep it soft and friendly.
- **Don't** use tertiary/fun colors for error states or critical actions.
