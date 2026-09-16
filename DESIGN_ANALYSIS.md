# Design Analysis — Times Table Adventures

**Date:** 2026-04-25  
**Version analyzed:** 1.3.0  
**Scope:** Visual design, accessibility, consistency, UX patterns, and code-design alignment.

---

## Executive Summary

Times Table Adventures has a **strong, cohesive visual identity** with a well-defined color palette, friendly typography, and delightful motion design. The app successfully creates a playful, encouraging atmosphere appropriate for its target audience (children 6–11). However, several **consistency gaps**, **accessibility issues**, and **design-token drift** have emerged as the codebase has grown to 12+ games. Addressing these will improve maintainability, accessibility, and visual polish.

**Overall Score: 7.5/10**
- Visual Identity: 8/10
- Consistency: 6/10
- Accessibility: 6/10
- Motion Design: 9/10
- Code-Design Alignment: 7/10

---

## 1. Visual Identity & Brand

### Strengths
- **Excellent color palette:** The warm teal primary (#2EC4B6) is distinctive and friendly. The orange secondary and purple accent create a triadic harmony that feels playful without being chaotic.
- **Strong gradient system:** Four well-defined gradients add depth and visual interest to buttons and feature cards.
- **Friendly typography:** Nunito is an excellent choice for children's content — rounded, readable, and available in a wide weight range.
- **Delightful motion:** Framer Motion animations (bounce, spring, stagger) are well-tuned and create genuine moments of joy.

### Issues

#### 1.1 Hardcoded Colors Outside Design System
**Severity: Medium**

Several components use Tailwind color classes that don't exist in the design system, creating visual drift:

| Location | Hardcoded Value | Design System Equivalent | Issue |
|----------|----------------|------------------------|-------|
| `Progress.tsx` | `bg-blue-100 text-blue-700` | None — blue not in palette | Introduces a 5th color family |
| `Progress.tsx` | `bg-amber-100 text-amber-700` | `warning` tokens | Should use warning scale |
| `Progress.tsx` | `bg-green-100 text-green-700` | `success` tokens | Should use success scale |
| `Progress.tsx` | `text-orange-500` | `secondary` | Slight hue mismatch |
| `Progress.tsx` | `text-yellow-500` | `warning` | Slight hue mismatch |
| `AnimatedElements.tsx` | `#22c55e` | `success` | Direct hex instead of token |
| `AnimatedElements.tsx` | `from-orange-500 to-red-500` | `secondary` gradient | Different from defined secondary gradient |

**Recommendation:** Create semantic color scales (e.g., `success-100`, `success-700`) or use HSL opacity modifiers (e.g., `bg-success/10 text-success`) for all states. Audit all files for hardcoded Tailwind colors.

#### 1.2 Mastery Level Colors Don't Match Brand
**Severity: Medium**

The mastery tracking in `Progress.tsx` uses arbitrary Tailwind colors:
```tsx
const MASTERY_COLORS = {
  beginner: "bg-muted text-muted-foreground",
  learning: "bg-blue-100 text-blue-700 border-blue-300",
  practicing: "bg-amber-100 text-amber-700 border-amber-300",
  mastered: "bg-green-100 text-green-700 border-green-300",
};
```

Blue and amber are not part of the brand palette. This makes the progress page feel visually disconnected from the rest of the app.

**Recommendation:** Map mastery levels to the design system:
```tsx
const MASTERY_COLORS = {
  beginner: "bg-muted text-muted-foreground border-border",
  learning: "bg-primary/10 text-primary border-primary/30",
  practicing: "bg-secondary/10 text-secondary border-secondary/30",
  mastered: "bg-success/10 text-success border-success/30",
};
```

---

## 2. Consistency

### Strengths
- Card styling is largely consistent across pages.
- Button variants are well-defined and reused.
- Layout container (`max-w-5xl mx-auto`) is applied consistently.

### Issues

#### 2.1 Dialog/Modal Radius Inconsistency
**Severity: High**

The app uses two different modal systems with conflicting visual styles:

1. **shadcn Dialog** (`components/ui/dialog.tsx`): Uses `sm:rounded-lg` (8px radius)
2. **Custom modals** (`WrongAnswerHelp.tsx`, `SaveProgressPrompt.tsx`): Use `rounded-3xl` (24px radius)

This creates a jarring experience when users encounter both styles. The shadcn dialog feels too sharp and "adult" compared to the app's friendly aesthetic.

**Recommendation:** Override the shadcn Dialog to use `rounded-2xl` or `rounded-3xl` to match the custom modals. Update `DialogContent` className from `sm:rounded-lg` to `sm:rounded-3xl`.

#### 2.2 Dialog Overlay Inconsistency
**Severity: Medium**

The shadcn Dialog uses `bg-black/80` overlay, while custom modals (`WrongAnswerHelp`) use `bg-black/50`. The difference in darkness is noticeable.

**Recommendation:** Standardize on `bg-black/50` for all overlays — it's less aggressive for children.

#### 2.3 Button Size Inconsistency in Dialogs
**Severity: Low**

The `WrongAnswerHelp` modal uses `size="lg"` for the close button (`h-14`), while most modal actions elsewhere use `size="default"`. This creates inconsistent dialog heights.

**Recommendation:** Standardize modal primary actions to `size="lg"` consistently, or document when to use each size.

#### 2.4 Icon Container Sizing Drift
**Severity: Low**

Feature card icons use varying sizes:
- Home page compact cards: `w-10 h-10 sm:w-12 sm:h-12`
- Home page full cards: `w-12 h-12 sm:w-14 sm:h-14`
- Daily challenge: `w-20 h-20`
- Progress page stat cards: `w-8 h-8`

While responsive sizing is good, the ratio between icon container and icon itself varies (some use `w-6 h-6` inside `w-12 h-12`, others use `w-5 h-5` inside `w-10 h-10`).

**Recommendation:** Define standard icon container sizes in DESIGN.md and create reusable `IconContainer` component.

---

## 3. Accessibility

### Strengths
- `prefers-reduced-motion` is respected in CSS.
- Skip-to-content link is implemented in `Layout.tsx`.
- Touch targets are generally 44px+.
- Focus-visible ring is applied to buttons.

### Issues

#### 3.1 WCAG Contrast — Warning Color
**Severity: High**

The warning color `#F5C842` (yellow) on the background `#FAF8F5` fails WCAG AA for any text size. On the foreground `#242B38`, it has a contrast ratio of approximately **3.8:1**, which passes for large text (18px+ bold) but fails for normal text.

The warning color is used for:
- Timer countdown text
- Warning states
- Potentially small labels

**Recommendation:** Darken the warning color to `#D4A017` or use the foreground color (`#242B38`) on a warning background instead of warning text on background.

#### 3.2 WCAG Contrast — Secondary on White
**Severity: Medium**

The secondary color `#F4A261` (orange) on white `#FFFFFF` has a contrast ratio of approximately **2.1:1**, failing WCAG AA for all text sizes. It's used for:
- Secondary button text (white, so OK)
- Icon container gradients (OK, decorative)
- Badge text on light backgrounds (potential issue)

**Recommendation:** Ensure secondary color is only used as a background with white text, never as text on light backgrounds.

#### 3.3 Muted Foreground Contrast
**Severity: Medium**

`muted-foreground` (`#6B7280`) on `muted` (`#F0EDE6`) has a contrast ratio of approximately **3.2:1**, which fails WCAG AA for normal text. This is used extensively for:
- Card descriptions
- Footer text
- Metadata labels
- Placeholder text

**Recommendation:** Darken `muted-foreground` to `#5A5F6B` or lighten `muted` to `#F5F2EC` to achieve 4.5:1.

#### 3.4 Missing ARIA in Game Components
**Severity: Medium**

Game answer buttons and interactive cards lack comprehensive ARIA states:
- No `aria-pressed` for selected answers
- No `aria-live` regions for score/streak updates
- Timer changes are not announced to screen readers
- The confetti and visual celebrations have no auditory or ARIA equivalent

**Recommendation:** Add `aria-live="polite"` regions for score and timer updates. Use `aria-pressed` and `aria-label` on game buttons.

#### 3.5 Dialog Focus Trap Issues
**Severity: Medium**

The custom `WrongAnswerHelp` modal is not built on the Radix Dialog primitive, so it may not properly trap focus or return focus to the triggering element on close.

**Recommendation:** Refactor `WrongAnswerHelp` and `SaveProgressPrompt` to use the shadcn Dialog primitive, or implement focus trap and focus restoration manually.

#### 3.6 Keyboard Shortcuts Not Discoverable
**Severity: Low**

Keyboard shortcuts exist (`use-keyboard-shortcuts.ts`) but are only discoverable through a help modal. There's no visual indicator that shortcuts are available.

**Recommendation:** Add a subtle keyboard icon tooltip or hint on first visit.

---

## 4. Typography

### Strengths
- Single font family simplifies the system.
- Font weights are well-differentiated.
- Responsive type scaling works well.

### Issues

#### 4.1 Heading Hierarchy Inconsistency
**Severity: Low**

Some pages use `text-4xl md:text-6xl` for H1, others use `text-3xl md:text-4xl`. The `DESIGN.md` defines display at 48px, but the code mixes arbitrary Tailwind sizes.

**Recommendation:** Create standard heading components or utility classes:
```tsx
// Heading.tsx
const headingVariants = cva("", {
  variants: {
    level: {
      display: "text-4xl md:text-6xl font-extrabold leading-tight",
      h1: "text-3xl md:text-4xl font-extrabold leading-tight",
      h2: "text-2xl font-bold leading-snug",
      h3: "text-xl font-bold leading-snug",
    },
  },
});
```

#### 4.2 Line Clamp Usage
**Severity: Low**

Feature cards use `line-clamp-2` for descriptions, but the container heights vary based on content. This can cause uneven card heights in grids.

**Recommendation:** Use fixed heights with `line-clamp-2` or switch to `min-h` to ensure grid alignment.

---

## 5. Motion & Animation

### Strengths
- Excellent spring physics (stiffness/damping values are well-tuned).
- Reduced motion support is comprehensive.
- Stagger animations create a polished feel.

### Issues

#### 5.1 Confetti Performance on Low-End Devices
**Severity: Medium**

Canvas confetti is used extensively for celebrations. On low-end mobile devices, this can cause frame drops.

**Recommendation:** Detect device performance via `navigator.hardwareConcurrency` or use a simpler CSS-based celebration fallback for devices with fewer than 4 cores.

#### 5.2 Memory Card 3D Transform Performance
**Severity: Low**

The Memory Match game uses `perspective: 1000` and `transform-style: preserve-3d` on many cards simultaneously. On older devices, this can cause compositing issues.

**Recommendation:** Use `will-change: transform` sparingly and only on actively animating cards.

#### 5.3 Animation Duration Inconsistency
**Severity: Low**

Animation durations vary without a clear system:
- Card hover: 300ms
- Button hover: 200ms
- Page transition: 300ms
- Progress bar: 500ms
- Shake: 400ms
- Pop: 300ms

**Recommendation:** Standardize on a duration scale: `fast: 150ms`, `normal: 200ms`, `slow: 300ms`, `emphasis: 500ms`.

---

## 6. Responsive Design

### Strengths
- Mobile-first approach with `xs` breakpoint for small phones.
- Grid layouts adapt well from 2 to 5 columns.
- Touch targets are appropriately sized.

### Issues

#### 6.1 Horizontal Overflow on Small Screens
**Severity: Medium**

`Layout.tsx` uses `overflow-x-hidden` on both the root div and main content. While this prevents scroll, it can clip content that legitimately needs horizontal space (e.g., wide tables, large numbers).

**Recommendation:** Remove blanket `overflow-x-hidden` and instead ensure components are inherently responsive. Only apply overflow clipping to specific containers that need it.

#### 6.2 Navigation Overflow
**Severity: Low**

The header navigation uses `overflow-x-auto` but doesn't show a scroll indicator. On very small screens, users may not realize more nav items exist.

**Recommendation:** Add a subtle fade gradient on the right edge when scrollable content is present, or collapse to a hamburger menu below `sm`.

#### 6.3 Font Size in Landscape Mode
**Severity: Low**

On phones in landscape orientation, the hero text (`text-4xl md:text-6xl`) may be too large and push content below the fold.

**Recommendation:** Add a landscape-specific breakpoint or use `clamp()` for fluid typography:
```css
font-size: clamp(2rem, 5vw + 1rem, 3.75rem);
```

---

## 7. Component Design

### Strengths
- Button variants cover all use cases well.
- Card hover effects are delightful and consistent.
- The streak badge is a strong motivational element.

### Issues

#### 7.1 Progress Bar Height Inconsistency
**Severity: Low**

- `AnimatedElements.tsx` `AnimatedProgress`: 12px height
- `components/ui/progress.tsx`: Default Radix height (varies)
- Progress page stats: No visual progress bars for mastery, just colored badges

**Recommendation:** Standardize progress bar height to 12px and add circular progress indicators for mastery levels.

#### 7.2 Toast Positioning
**Severity: Low**

The app uses both `sonner` (toast library) and custom toasts. Sonner toasts appear at the bottom-right by default, which may overlap game controls on mobile.

**Recommendation:** Move toast position to top-center on mobile screens (`bottom-center` or `top-center` below `md` breakpoint).

#### 7.3 Missing Empty States
**Severity: Medium**

Several pages lack thoughtful empty states:
- Progress page when not logged in: Basic lock icon (OK)
- Progress page when no games played yet: Not handled — stats show `0` with no encouragement
- Tables page: No visual interest for the reference grid

**Recommendation:** Add encouraging empty states with illustrations or animations. For example: "No games yet? Start with the Daily Challenge! 🌟"

---

## 8. UX Patterns

### Strengths
- Optional login respects children's privacy.
- Wrong answer help is an excellent educational pattern.
- Sound toggle is persistent and easily accessible.
- The "Why was I wrong?" pattern reduces frustration.

### Issues

#### 8.1 Save Progress Prompt Timing
**Severity: Medium**

The save progress prompt appears after game completion. However, if a child accidentally clicks "Save" but hasn't created a profile, the flow may be confusing.

**Recommendation:** Consider showing a one-time tooltip explaining the profile system before the first game, rather than only at save time.

#### 8.2 Timer Anxiety
**Severity: Low**

The timer turns warning color at 5 seconds and destructive at 3 seconds, with a pulse animation. For anxious children, this could be stressful.

**Recommendation:** Consider adding a "relaxed mode" setting that hides or extends timers.

#### 8.3 Game Mode Discovery
**Severity: Low**

With 12 games, the home page grid is comprehensive but potentially overwhelming. New users may not know which game to start with.

**Recommendation:** Add a "Start Here" or "Recommended for You" badge to Practice Mode or Daily Challenge for first-time visitors.

---

## 9. Code-Design Alignment

### Issues

#### 9.1 CSS Custom Properties vs. Tailwind
**Severity: Low**

The codebase mixes Tailwind classes, CSS custom properties (`--gradient-primary`), and inline styles. This creates multiple sources of truth.

**Recommendation:** After creating DESIGN.md, generate Tailwind theme tokens from it and gradually migrate custom properties to Tailwind's `@theme` system (already started in Tailwind 4).

#### 9.2 Framer Motion Inline vs. Reusable
**Severity: Low**

Framer Motion props are defined inline throughout components. While `AnimatedElements.tsx` provides reusable wrappers, many pages still define custom motion configurations.

**Recommendation:** Expand `AnimatedElements.tsx` to cover all common motion patterns, and document when inline motion is acceptable.

---

## Priority Recommendations

### P0 (Fix Immediately)
1. **Fix dialog radius inconsistency** — Update shadcn Dialog to use `rounded-3xl`
2. **Fix overlay opacity inconsistency** — Standardize on `bg-black/50`

### P1 (Fix This Sprint)
3. **Fix hardcoded colors in Progress page** — Map mastery levels to design system
4. **Fix WCAG warning contrast** — Darken warning color or invert usage
5. **Fix muted foreground contrast** — Achieve 4.5:1 minimum
6. **Add ARIA to game components** — `aria-live`, `aria-pressed`, labels

### P2 (Fix Next Sprint)
7. **Refactor custom modals to use Dialog primitive** — Focus trap, focus restoration
8. **Add empty states** — Encouraging first-use experiences
9. **Standardize animation durations** — Document the duration scale
10. **Create heading components** — Ensure hierarchy consistency

### P3 (Nice to Have)
11. **Performance-aware confetti** — Detect low-end devices
12. **Landscape typography** — Use `clamp()` for fluid sizing
13. **Toast position on mobile** — Move to top-center
14. **Game recommendation badges** — Help first-time users

---

## Conclusion

Times Table Adventures has a **delightful, well-conceived design system** that genuinely serves its audience. The core issues are **consistency gaps** that emerged as the app scaled from a few games to twelve, and **accessibility oversights** that are common in visually-driven projects.

With the newly created `DESIGN.md` as a source of truth and the prioritized fixes above, the app can achieve a **9/10 design score** while remaining maintainable as new features are added.

The most impactful fixes are:
1. Aligning all modals to the same visual language
2. Removing hardcoded colors in favor of design tokens
3. Addressing WCAG contrast issues for inclusive learning
