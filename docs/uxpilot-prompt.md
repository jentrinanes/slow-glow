# Slow Glow — UX Pilot Prompt

**App Name:** Slow Glow — Science-Based Skincare Tracker
**Tagline:** "Glow slow. Glow right."
**Platform:** Web app (desktop-first, responsive for tablet and mobile)

**About the app:**
Slow Glow is a free, science-based skincare tracking app for methodical skincare enthusiasts. It helps users manage active ingredient introductions, monitor product expiry, track routines, and document their skin journey. It actively discourages overconsumption — no ads, no brand partnerships, no "buy more" nudges. Ever.

**Target user:**
Patient, ingredient-literate skincare enthusiasts who follow evidence-based routines. They prefer data over marketing, minimalism over collection-building, and finishing products over hoarding. Secondary: beginners recovering from over-exfoliation or barrier damage.

---

## Visual Style

- Color palette: Soft sage green, warm cream/beige, muted terracotta accent, dark charcoal text — no bright or aggressive colors
- Typography: Clean, modern sans-serif (think Inter or DM Sans) — readable, calm, approachable
- Layout: Spacious sidebar navigation on desktop, collapsible on tablet/mobile — content area uses cards, data tables, and charts generously across the wider screen real estate
- Aesthetic: Wellness journal meets science notebook — minimal, uncluttered, intentional whitespace
- No gamification gimmicks — subtle, meaningful feedback only (streaks, patience meters, milestone badges)
- Dark mode support

---

## Tone & UX Mood

Calm. Informative. Encouraging without being cheerful. Never preachy. Think: "a knowledgeable friend who studied dermatology" — not a beauty influencer, not a clinical app. Honest milestone messages like *"One month in. Your skin is adapting beneath the surface."*

---

## Layout Pattern

- Persistent left sidebar with nav: Dashboard, Products, Routines, Actives, Reactions, Project Pan, Milestones, Skin Analysis, Settings
- Top bar: streak counter, overload score badge, quick-log button
- Main content area: wide, card-based, data-rich — takes advantage of desktop width
- Modals/slide-over panels for add/edit flows and warnings

---

## Screens

### 1. Onboarding — Skin Profile Setup
Centered multi-step form with progress indicator: display name, age, skin type, Fitzpatrick scale, primary concerns, experience level (beginner → ingredient nerd), optional health screening (pregnancy, conditions, prescription actives)

### 2. Home Dashboard
Wide grid layout — today's AM/PM routine progress, streak counter, upcoming expiry alerts, active ingredient currently in progression, overload complexity score badge, recent reaction log, quick-add shortcuts

### 3. Product Inventory
Filterable data table or card grid of products with status tags (Active / Upcoming / Finished / Paused), PAO countdown indicators (green/yellow/red), filter/search by category or active ingredient, add product button

### 4. Add Product — Slide-over Panel
Product name, brand, category, photo upload, open date, expiry date, active ingredient tags, body zone assignment, inline safety screening warning overlay (4 levels: green info → red strong warning) triggered on active ingredient detection

### 5. Routine Scheduler — AM/PM View
Side-by-side AM and PM columns, ordered step list with product per slot, toggle steps as completed, alternating night support (retinol nights vs off nights), streak tracker, missed application nudge

### 6. Active Ingredient Progression Tracker
Table + timeline view per active (e.g., retinol — started 3x/week → now 5x/week), patience meter visualization, frequency milestone upgrades, scheduled application reminders, separate tracking per body zone

### 7. Skin Reaction Log
Daily observation entry panel, symptom tag chips (dryness, purging, redness, stinging, flaking), severity scale, purging vs irritation education card, associate reaction with product/routine change, reaction timeline chart across full width

### 8. Project Pan Tracker
Visual progress bars per product in a card grid, empty gallery section (celebrate finished products), repurchase/replace decision prompt on completion, alert when adding duplicate-concern product while unfinished exists

### 9. Milestone Screen
Timeline view of milestone cards (Day 1, Week 2, Month 1, 3, 6, 12), honest expectation messaging per milestone, routine snapshot at checkpoint, before/after photo comparison side by side, encouragement during adjustment phases — never shame, always inspire

### 10. Skincare Overload Alert — Modal/Banner
Complexity score breakdown, color-coded rating (Balanced → Getting Busy → Simplify Soon → Overloaded!), ingredient redundancy list, same-night conflict flags (e.g., BHA + retinol), simplification suggestions — never a hard block

### 11. Skin Analysis Log
Manual score entry form, multi-line charts over time using full desktop width, photo diary grid with date stamps, before/after side-by-side visualization at milestones

### 12. Settings
Toggle between Guided / Balanced / Self-directed / Ingredient Nerd mode, warning preferences, health data management (encrypted, deletable), notification preferences

---

## Key UX Rules

- Never hard-block a user action — always allow proceeding after an informed warning
- Never show the same warning twice after dismissal
- No product recommendations, no affiliate links, no ads anywhere in the UI
- Patience and consistency should feel rewarded — not urgency or acquisition
- Responsive: sidebar collapses to bottom nav or hamburger on mobile
