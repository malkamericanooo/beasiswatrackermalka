---
name: ui-ux-guidelines
description: Professional, anti-slop UI/UX design guidelines enforcing high aesthetic quality, clean typography, and accessibility.
always_on: true
---

# Professional UI/UX & Anti-Slop Design Guidelines

To maintain an exceptional, professional aesthetic and eliminate "AI-slop" design patterns, follow these rules for all UI components:

## 1. Visual Aesthetics & Color Harmony
- **Academic / Institution Theme**: Adhere to the clean, authoritative University of Toronto color palette (deep navy, crisp white/slate, subtle borders).
- **Disciplined Accents**:
  - Success / Completed: Emerald (`bg-emerald-500/10 text-emerald-400 border-emerald-500/30`)
  - Warning / Approaching: Amber (`bg-amber-500/10 text-amber-400 border-amber-500/30`)
  - Critical / Overdue: Rose (`bg-rose-500/10 text-rose-400 border-rose-500/30`)
  - Interactive / Focus: Primary Indigo/Navy
- **No Rainbow Chaos**: Never use more than 2-3 accent colors on a single screen. Avoid gratuitous gradients or neon highlights.

## 2. Typography & Hierarchy
- **Header Font**: `Cinzel, serif` for major university/institutional headers (uppercase, tracking-wider).
- **Tagline Font**: `Cormorant Garamond, serif` (italic) for official mottos and quotes.
- **Body & Controls**: `Inter, sans-serif` for clean readability and UI controls.
- **Data & Numbers**: `font-mono` for all dates, countdowns, timestamps, and numeric progress (e.g. `0/10`, `3d left`).

## 3. Layout & Information Density
- **Bento Grid Layout**: Organize content into balanced, structured cards (`rounded-xl` or `rounded-2xl`, subtle borders `border-border/60`).
- **Consistent Spacing**: Use the 8pt grid (`p-4`, `p-5`, `p-6`, `gap-3`, `gap-4`).
- **Zero Vibe-Coded Emojis**: Do not use cartoon emojis in system navigation, buttons, or institutional headers. Use clean Lucide SVG icons instead.

## 4. Interaction & Feedback
- **Micro-Interactions**: All clickable elements must have smooth hover and focus-visible states (`transition-colors`, `hover:border-primary/40`).
- **Defensive State Handling**: Always guard arrays with `Array.isArray()`. Provide meaningful empty states with clear action prompts rather than blank cards.
- **Accessible Contrast**: Ensure all text meets WCAG AA contrast against its background in both light and dark modes.
