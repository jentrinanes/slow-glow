# Slow Glow

> "Glow slow. Glow right."

A free, science-based skincare tracking web app for methodical skincare enthusiasts. Slow Glow helps users manage active ingredient introductions, monitor product expiry, track routines, and document their skin journey — with zero brand partnerships, zero ads, and zero "buy more" nudges.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite + TypeScript |
| Styling | Tailwind CSS v4 |
| Routing | React Router v7 |
| Charts | Recharts |
| Icons | Lucide React |
| Backend (planned) | Azure Functions (.NET) |
| Database (planned) | CosmosDB |
| Storage (planned) | Azure Blob Storage |
| Hosting (planned) | Azure Static Web Apps |

## Project Structure

```
slow-glow/
├── docs/                        # Project documentation
│   ├── SlowGlow-PRD-v2.docx     # Product Requirements Document
│   └── uxpilot-prompt.md        # UX Pilot design prompt
├── ux/                          # UX designs from UX Pilot
│   ├── desktop/                 # Desktop screen designs (HTML)
│   └── mobile/                  # Mobile screen designs (HTML)
├── src/
│   ├── pages/                   # Page components
│   │   ├── LandingPage.tsx
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx
│   ├── components/              # Shared components (coming soon)
│   ├── App.tsx                  # Root component with routes
│   ├── main.tsx
│   └── index.css                # Global styles + Tailwind theme
└── public/
```

## Pages

| Route | Page | Status |
|---|---|---|
| `/` | Landing Page | Done |
| `/login` | Login | Done |
| `/register` | Registration | Done |
| `/onboarding` | Onboarding (3 steps) | Planned |
| `/dashboard` | Home Dashboard | Planned |
| `/inventory` | Product Inventory | Planned |
| `/routines` | Routine Scheduler | Planned |
| `/actives` | Active Ingredient Tracker | Planned |
| `/reactions` | Skin Reaction Log | Planned |
| `/project-pan` | Project Pan Tracker | Planned |
| `/milestones` | Milestones | Planned |
| `/skin-analysis` | Skin Analysis Log | Planned |
| `/settings` | Settings | Planned |

## Getting Started

```bash
npm install
npm run dev
```

## Design

UX designs were generated with [UX Pilot](https://uxpilot.ai) based on the PRD. Desktop and mobile designs are in the `ux/` folder.

**Color palette:**
- Cream `#FDFBF7` — background
- Sage `#7D8E7A` — primary
- Terracotta `#C27059` — accent
- Ink `#1A1A1A` — text
- Paper `#F5F2EA` — surface

**Fonts:** Playfair Display (serif) · Space Mono (mono) · Inter (sans)
