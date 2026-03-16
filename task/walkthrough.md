# Walkthrough — Deployment & Feature 1

## Deployment Fix
- Corrected `vite.config.ts` base path to `/therainmaker/` for GitHub Pages.
- Added `.nojekyll` to `public/` to prevent Jekyll processing errors.
- Verified that the application loads correctly on GitHub Pages (confirmed by user).

## Feature 1: Evolutionary Phase Budget System
Successfully implemented the per-phase budget mechanic and Board interaction system.

### Key Changes
- **Phase-Based Allocation:** Players now receive a fresh budget at the start of each phase (e.g., €50k for Preparation, €45k for Due Diligence).
- **Carryover Mechanic:** Unspent budget from the previous phase is carried over to the next.
- **Board Budget Requests:** Added a new action and UI (`BudgetRequestModal`) to request additional funds when budget is low.
- **Board Submission (Phase 0):** Implemented the formal board recommendation process required to transition from Origination to Pitch & Mandate.
- **Simulated IC Decisions:** The Investment Committee (IC) now responds to budget and mandate requests during the week advance, sending formal emails with their decisions.

### Verification Results
- [x] Build successful (`npm run build`).
- [x] State persistence verified (Zustand + LocalStorage).
- [x] Engine logic for budget resolution tested.

---
![Dashboard showing budget status and request button](file:///C:/Users/AfonsoLima/.gemini/antigravity/brain/16450437-86d3-47e5-8c81-91fe8b8bd802/walkthrough_dashboard.png)
