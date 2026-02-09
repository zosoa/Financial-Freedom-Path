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
- `client/src/lib/calculations.ts` - FINSIM v5 engine (compound growth, inflation, SWR, capital composition, badges)
- `client/src/pages/landing.tsx` - Landing page with country/currency selection, inflation tooltip
- `client/src/pages/calculator.tsx` - 5-step one-question-at-a-time calculator with smart comments
- `client/src/pages/results.tsx` - Rich results dashboard with charts, donut graph, education section, sharing
- `client/src/components/freedom-score-card.tsx` - Shareable social media card with personality gradient
- `client/src/components/lead-capture-modal.tsx` - Lead capture dialog
- `server/routes.ts` - API endpoints (POST /api/calculations, POST /api/leads)
- `server/storage.ts` - Database CRUD operations

## Calculator Flow
1. Landing: Country selection (default: Mauritius) + desired monthly income + inflation tooltip
2. Calculator Step 1: Age
3. Calculator Step 2: Target freedom age (dream age for financial independence)
4. Calculator Step 3: Monthly net income
5. Calculator Step 4: Current savings/investments (with "put 0 if unsure" guidance)
6. Calculator Step 5: Monthly savings rate (with smart % feedback comments)
7. Animated loading transition (5 progressive messages)
8. Results: Full dashboard with charts, donut, education, badges, sharing

## Calculation Model (FINSIM v5)
- Inflation Rate: 2% per year
- Safe Withdrawal Rate: 6% per year
- Standard Return: 6% (comparison baseline, used for accumulated capital display)
- Boosted Return: 11% (active management comparison)
- Gap analysis uses user's chosen target freedom age (not hardcoded)
- Freedom Age = earliest age where accumulated wealth >= inflation-adjusted required capital
- Capital Composition: tracks contributions vs generated gains at 6% return

## Results Page Sections
1. Profile Banner (static narrative + personality description + freedom score + info tooltips)
2. Target Capital with Standard (6%) vs Boosted (11%) comparison + info tooltips
3. Return Comparison Table (6% vs 11% with years gained)
4. Capital Evolution Area Chart (Recharts, with standard/boosted/required lines)
5. Capital Composition Donut Chart (contributions vs gains with educational compound interest note)
6. Key Stats Bar (4 cards)
7. Educational Sensitivity Section ("How Returns Influence Your Freedom" with concrete examples + interactive slider)
8. Profile Badge (single unique badge per personality tier with gradient styling)
9. Social Share Buttons (WhatsApp, Facebook, X, LinkedIn)
10. Expert CTA + Community CTA
11. Downloadable Freedom Score Card

## Number Formatting
- Uses space separators for thousands/millions (e.g., "1 000 000" instead of "1,000,000")
- formatCurrency: abbreviated (K/M) for compact display
- formatCurrencyFull: full number with spaces for detailed display

## Recent Changes (Feb 2026)
- Added targetFreedomAge to schema and calculator flow (step 2, right after age)
- Removed lump sum questions from calculator
- Removed duplicate desired income question (already on landing)
- Fixed accumulated capital to always show 6% standard (not slider-adjusted)
- Moved static profile description to first box (unaffected by slider)
- Added educational sensitivity section with concrete 6% vs 11% comparison
- Added capital composition donut chart (contributions vs generated gains)
- Added info icon tooltips explaining Freedom Score, Target Capital concepts
- Replaced 10-badge system with single unique profile badge per personality tier
- Added smart percentage-based comments for savings rate in calculator
- Added animated loading transition with 5 progressive messages
- Added inflation tooltip on landing page with educational real-world example
- Number formatting updated to space separators globally
- Mauritius set as default country

## Design Choices
- Warm amber/coral color palette (HSL 24-30 hue range) for approachable feel
- Plus Jakarta Sans typography
- One-question-at-a-time calculator for zero-barrier engagement
- No login required, privacy-first
- Personality tiers: Astronaut (basically_there), Trail Blazer (on_track), Base Camp Builder (moderate), First Steps Explorer (critical)
