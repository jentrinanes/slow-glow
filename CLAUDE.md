# Slow Glow — Claude Context

## Project

Science-based skincare tracking web app. Free, no ads, no brand partnerships. Built by Jen Triñanes.

- PRD: `docs/SlowGlow-PRD-v2.docx`
- UX designs: `ux/desktop/` and `ux/mobile/` (HTML files from UX Pilot)
- UX Pilot prompt: `docs/uxpilot-prompt.md`

## Tech Stack

- React 19 + Vite 8 + TypeScript
- Tailwind CSS v4 (via `@tailwindcss/vite` plugin — no tailwind.config.js)
- React Router v7
- Recharts (for all charts — not Plotly, not Chart.js)
- Lucide React (for all icons — not Font Awesome)

## Tailwind Theme

Custom tokens defined in `src/index.css` under `@theme`:

```
--color-cream: #FDFBF7
--color-sage: #7D8E7A
--color-terracotta: #C27059
--color-ink: #1A1A1A
--color-paper: #F5F2EA
--color-border-soft: #E8E4D9
--font-serif: 'Playfair Display', serif
--font-mono: 'Space Mono', monospace
--font-sans: 'Inter', sans-serif
```

Use these as Tailwind classes: `bg-cream`, `text-sage`, `text-terracotta`, `text-ink`, `bg-paper`, `border-border-soft`, `font-serif`, `font-mono`.

## Workflow

1. Read the UX design HTML file from `ux/desktop/` before building any page
2. Implement in `src/pages/` as a React + TypeScript component
3. Add route in `src/App.tsx`
4. Build (`npm run build`) to verify no TypeScript errors before finishing

## Conventions

- Pages live in `src/pages/`, shared components in `src/components/`
- All authenticated pages use `<Sidebar />` from `src/components/Sidebar.tsx`
- Page layout: `<div className="min-h-screen flex bg-cream">` with `<Sidebar />` + `<main className="flex-1 h-screen overflow-y-auto bg-paper flex flex-col">`
- Sticky toolbar: `sticky top-0 z-20 bg-white border-b border-border-soft px-6 lg:px-8 py-4`
- Card shadow: `style={{ boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}`
- Slide-over panels: fixed right panel toggled with `translate-x-full` / `translate-x-0` + backdrop overlay
- Notebook-style inputs: `border-0 border-b border-border-soft bg-transparent focus:outline-none focus:border-sage`
- Auth pages (login, register): centered single-column layout, logo links to `/`
- Range slider thumb color: `style={{ accentColor: '#7D8E7A' }}` (or terracotta hex as needed)
- No comments in code unless the why is non-obvious
- Remove unused imports — TypeScript strict mode will catch them
