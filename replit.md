# The Freedom Path - Financial GPS

## Overview
A conversion-optimized Financial GPS web application that guides non-savvy salary workers through retirement planning. Uses institutional-grade FINSIM v5 calculation logic (2% inflation, 6% Safe Withdrawal Rate), built by former Private Bankers/UHNW Asset Managers.

## Architecture
- **Frontend**: React 18 + Vite, Tailwind CSS, Shadcn UI components, Framer Motion animations, Recharts for data visualization
- **Backend**: Express.js REST API
- **Database**: PostgreSQL (Neon-backed via Drizzle ORM)
- **Routing**: Wouter (client-side)
- **State**: TanStack React Query for API calls

## Key Files
- `shared/schema.ts` - Database schema (calculations, leads tables) + currency/country maps
- `client/src/lib/calculations.ts` - FINSIM v5 engine (compound growth, inflation, SWR, badges)
- `client/src/pages/landing.tsx` - Landing page with country/currency selection
- `client/src/pages/calculator.tsx` - 5-step one-question-at-a-time calculator
- `client/src/pages/results.tsx` - Rich results dashboard with charts, badges, sharing
- `client/src/components/freedom-score-card.tsx` - Shareable social media card
- `client/src/components/lead-capture-modal.tsx` - Lead capture dialog
- `server/routes.ts` - API endpoints (POST /api/calculations, POST /api/leads)
- `server/storage.ts` - Database CRUD operations

## Calculator Flow
1. Landing: Country selection + desired monthly income
2. Calculator Step 1: Age
3. Calculator Step 2: Monthly net income
4. Calculator Step 3: Current savings/investments
5. Calculator Step 4: Monthly savings rate
6. Calculator Step 5: Target freedom age
7. Results: Full dashboard with charts, badges, sharing

## Calculation Model (FINSIM v5)
- Inflation Rate: 2% per year
- Safe Withdrawal Rate: 6% per year
- Standard Return: 6% (comparison baseline)
- Boosted Return: 11% (optimistic comparison)
- Gap analysis uses user's chosen target freedom age (not hardcoded)
- Freedom Age = earliest age where accumulated wealth >= inflation-adjusted required capital

## Results Page Sections
1. Trajectory Analysis Banner (narrative + score)
2. Target Capital with Standard vs Boosted comparison
3. Return Comparison Table
4. Capital Evolution Area Chart (Recharts)
5. Key Stats Bar (4 cards)
6. Market Wind Sensitivity Slider
7. Personality-based Narrative (Astronaut/TrailBlazer/BaseCamp/Explorer)
8. Achievement Badges (10 badges, Bronze/Silver/Gold/Platinum)
9. Social Share Buttons (WhatsApp, Facebook, X, LinkedIn)
10. Expert CTA + Community CTA
11. Downloadable Freedom Score Card

## Recent Changes (Feb 2026)
- Added targetFreedomAge to schema and calculator flow
- Removed lump sum questions from calculator
- Removed duplicate desired income question (already on landing)
- Fixed calculation engine to use user's target age for gap analysis
- Added Recharts capital evolution chart
- Added return comparison table (6% vs 11%)
- Added gamification badge system (10 badges)
- Added social share buttons for 4 platforms
- Redesigned shareable Freedom Score card with personality tiers
- Added referral tracking end-to-end

## Design Choices
- Warm amber/coral color palette (HSL 24-30 hue range) for approachable feel
- Plus Jakarta Sans typography
- One-question-at-a-time calculator for zero-barrier engagement
- No login required, privacy-first
