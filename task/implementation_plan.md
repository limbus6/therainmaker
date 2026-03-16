# Gameplay Mechanics Implementation Plan

## Overview

Six interconnected gameplay mechanics to be added:

1. **Evolutionary Phase Budget** — each phase has a base budget allocation; unspent budget carries over; a board budget request button appears when budget is critically low
2. **Phase 0 Qualification & Board Submission** — team research produces qualification notes and meeting summaries; player submits a board recommendation; board approves/rejects before Phase 1 begins
3. **Permanent Team Staffing** — hire team members at any point; one-off budget cost; accelerates all tasks proportionally
4. **Temporary Capacity** — task-scoped contractor allocation; higher weekly rate; larger speed multiplier; auto-released on task completion
5. **Fee Negotiation Micro-Game** — mandatory transition between Phase 1 and 2. High-stakes, round-based negotiation for mandate terms. *See [fee_negotiation_design_doc.md](file:///C:/Users/AfonsoLima/.gemini/antigravity/brain/16450437-86d3-47e5-8c81-91fe8b8bd802/fee_negotiation_design_doc.md) for full details.*
6. **Competitor Mitigation** — when a competing advisor is detected, specific counter-action tasks unlock: relationship accelerators (social events, referrals, conference invites) and process accelerators (advance the pitch, surge staffing)

---

## Proposed Changes

### Types Layer

#### [MODIFY] [game.ts](file:///c:/antigravity/AG-P004/src/types/game.ts)

Add the following new types and extend `GameState`:

```ts
// Budget system
export interface PhaseBudgetAllocation {
  phaseBase: number;     // base budget injected at phase start
  carryover: number;     // unspent from previous phase
}

// Budget request to the board
export interface BudgetRequest {
  id: string;
  week: number;
  phase: PhaseId;
  amount: number;
  justification: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedAmount?: number;
}

// Phase 0 qualification
export interface QualificationNote {
  id: string;
  week: number;
  source: 'team_research' | 'meeting' | 'internal';
  content: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

// Board submission (Phase 0 → 1 gate)
export interface BoardSubmission {
  recommendation: 'proceed' | 'decline';
  rationale: string;
  submittedWeek: number;
  status: 'not_submitted' | 'pending' | 'approved' | 'rejected';
  boardNotes?: string;
}

// Staff hire profiles (permanent)
export type StaffProfile = 'junior_analyst' | 'senior_analyst' | 'associate' | 'external_advisor';

// Temporary capacity allocation (task-specific contractor)
export interface TempCapacityAllocation {
  id: string;
  taskId: string;          // locked to a specific task
  profile: 'freelance_analyst' | 'external_specialist' | 'secondment';
  weeklyRate: number;      // k€/week (higher than perm)
  speedMultiplier: number; // e.g. 1.4 = task completes 40% faster
  weeksRemaining: number;  // auto-cancel when task completes
}

// ── FEE NEGOTIATION MICRO-GAME ─────────────────────────────

export type RetainerType =
  | 'none'
  | 'monthly'    // €2k–€10k/month
  | 'per_phase'  // €5k–€10k per new phase entry (from Preparation onwards)
  | 'upfront'   // one-off signing payment €20k–€40k

// Client personality — determined at Phase 0 from clientTrust + qualificationNotes sentiment
// Shapes their hidden reservation prices and which terms they fight hardest on
export type ClientNegotiationProfile =
  | 'serious_reasonable'    // realistic expectations, willing to pay fair fees
  | 'serious_demanding'     // committed to the deal but fee-sensitive, fights % hard
  | 'unsure_optimistic'     // unrealistic valuation, willing to pay high but only on upside (ratchet)
  | 'unsure_reluctant'      // not truly committed; resists all retainer, wants minimal base success fee

// Per-component reaction (shown as meter in UI)
export type ComponentReaction = 'green' | 'yellow' | 'red';

export interface NegotiationRound {
  round: number;  // 1–4
  // Player's proposal this round
  playerRetainerType: RetainerType;
  playerRetainerAmount: number;
  playerSuccessFeePercent: number;
  playerRatchetEnabled: boolean;
  playerRatchetThresholdEV?: number;
  playerRatchetBonusPercent?: number;
  // Client's per-component reaction (revealed after submission)
  reactionRetainer: ComponentReaction;
  reactionSuccessFee: ComponentReaction;
  reactionRatchet: ComponentReaction;
  // Client flavour text (unique per personality × component × reaction)
  clientNote: string;
  // Whether client made a counter-offer or accepted/rejected outright
  outcome: 'counter' | 'accepted' | 'rejected';
}

export interface ClientNegotiationState {
  profile: ClientNegotiationProfile;
  // Hidden reservation prices (never shown to player directly)
  reservationRetainerMin: number;      // minimum retainer client will accept (can be 0)
  reservationSuccessFeeMin: number;    // minimum % client will agree (floor: 0.5% for unsure; 1% for serious)
  reservationSuccessFeeMax: number;    // maximum % client tolerates (unsure_optimistic: up to 8%; serious: 3–5%)
  // Hidden priority weights (which component they care most about)
  // Higher weight = they fight harder on that component
  priorityRetainer: number;       // 0–10
  prioritySuccessFee: number;     // 0–10
  priorityRatchet: number;        // 0–10
  // Concession budget: client has limited tolerance for yielding. Each concession costs patience points.
  patienceRemaining: number;      // starts at 100; drops per round
}

export interface FeeNegotiation {
  phase: PhaseId;
  pitchPresented: boolean;
  status: 'not_started' | 'pitch_pending' | 'in_progress' | 'agreed' | 'failed';
  clientState: ClientNegotiationState;
  rounds: NegotiationRound[];
  agreedTerms?: FeeTerms;
}

export interface FeeTerms {
  retainerType: RetainerType;
  retainerAmount: number;
  successFeePercent: number;
  ratchetEnabled: boolean;
  ratchetThresholdEV?: number;
  ratchetBonusPercent?: number;
  totalFeeProjection: number;  // calculated at client's EV expectation
  agreedWeek: number;
}

// Competitor mitigation
export type MitigationAction =
  | 'golf_padel_dinner'       // social event with client
  | 'client_reference_intro'  // introduce to past clients / investors
  | 'conference_invite'       // invite to sector conference
  | 'advance_pitch'           // surge team to deliver pitch earlier
  | 'surge_staffing'          // emergency capacity to accelerate pitch

export interface CompetitorThreat {
  advisorName: string;
  surfacedWeek: number;
  mitigationActions: MitigationAction[];
  resolved: boolean;
}
```

Extend `GameState` with:
- `phaseBudget: PhaseBudgetAllocation`
- `budgetRequests: BudgetRequest[]`
- `qualificationNotes: QualificationNote[]`
- `boardSubmission: BoardSubmission | null`
- `tempCapacityAllocations: TempCapacityAllocation[]`
- `feeNegotiation: FeeNegotiation | null`
- `agreedFeeTerms: FeeTerms | null`
- `competitorThreats: CompetitorThreat[]`

---

### Constants / Config

#### [NEW] [phaseBudgets.ts](file:///c:/antigravity/AG-P004/src/config/phaseBudgets.ts)

Per-phase budget allocations (in k€):

| Phase | Name | Budget |
|-------|------|--------|
| 0 | Deal Origination | 20 |
| 1 | Pitch & Mandate | 30 |
| 2 | Preparation | 40 |
| 3 | Market Outreach | 25 |
| 4 | Shortlist | 15 |
| 5 | Non-Binding Offers | 20 |
| 6 | Due Diligence | 35 |
| 7 | Final Offers | 20 |
| 8 | SPA Negotiation | 25 |
| 9 | Signing | 15 |
| 10 | Closing | 20 |

Also defines staff hire profiles with cost and capacity impact.

---

### Store

#### [MODIFY] [gameStore.ts](file:///c:/antigravity/AG-P004/src/store/gameStore.ts)

**Initial state**: `budget` starts at Phase 0 allocation (20k). Add `phaseBudget`, `budgetRequests: []`, `qualificationNotes: []`, `boardSubmission: null`.

**New actions**:
- `requestBudget(amount, justification)` — creates a `BudgetRequest` with `status: 'pending'`
- `resolveBudgetRequest(id, approved, approvedAmount?)` — called by weekEngine to auto-resolve
- `submitBoardRecommendation(recommendation, rationale)` — sets `boardSubmission` with `status: 'pending'`
- `addQualificationNote(note)` — appended when certain Phase 0 tasks complete
- `hireStaffer(profile)` — adds a permanent TeamMember, deducts one-off hiring cost
- `allocateTempCapacity(taskId, profile)` — creates a `TempCapacityAllocation`, deducts weekly cost each week until task completes
- `startFeeNegotiation()` — opens negotiation for current phase transition
- `makeCounterOffer(terms)` — player submits counter; engine calculates client response
- `acceptClientOffer()` — finalises `agreedFeeTerms`, unlocks phase gate
- `presentPitch()` — marks `feeNegotiation.pitchPresented = true`, unlocks fee negotiation dialog
- `startFeeNegotiation()` — requires `pitchPresented === true`; opens negotiation
- `executeMitigationAction(action)` — starts a specific competitor counter-action (deducts budget/capacity cost, applies effects)
- Updated `advancePhase`: injects phase base budget + carryover; resets `feeNegotiation` for next phase

**Phase gates (updated)**:
- Phase 0→1: `boardSubmission?.status === 'approved'`
- Phase 1→2 onwards: `feeNegotiation?.pitchPresented === true` AND `feeNegotiation?.status === 'agreed'`

---

### Engine

#### [MODIFY] [weekEngine.ts](file:///c:/antigravity/AG-P004/src/engine/weekEngine.ts)

- **Budget request auto-resolution**: each week, pending budget requests have 80% approval chance (Phase 0 board depends on qualification score). Resolved requests inject approved budget and generate an inbox email.
- **Board submission resolution**: Phase 0 — if `boardSubmission.status === 'pending'`, resolve in 1-2 weeks. Approves if: qualificationNotes ≥ 2, clientTrust > 40, dealMomentum > 30. Rejection generates a Marcus email.
- **Permanent staffing effect**: task completion speed scales with team `capacity` sum (already partially wired).
- **Temp capacity effect**: each active `TempCapacityAllocation` applies its `speedMultiplier` to the linked task during `resolveTaskProgress`. Weekly rate is deducted each week from budget. When task completes, allocation is removed.
- **Fee negotiation micro-game** — `resolveFeeRound(playerTerms, feeNegotiation, client)` function:

  **Client profile assignment** (run once at `startFeeNegotiation`):
  - `serious_reasonable`: clientTrust > 60 + qualificationNotes sentiment mostly positive
  - `serious_demanding`: clientTrust > 60 + `valuationExpectation` high + sentiment mixed
  - `unsure_optimistic`: clientTrust 40–60 + unrealistically high valuation expectation
  - `unsure_reluctant`: clientTrust < 40 or qualificationNotes negative sentiment dominant

  **Hidden reservation prices by profile**:
  | Profile | Success Fee floor | Success Fee max | Retainer floor | Ratchet priority |
  |---|---|---|---|---|
  | serious_reasonable | 1.5% | 3.5% | €0 | Low |
  | serious_demanding | 1.0% | 2.5% | €0 (resists retainer) | Medium |
  | unsure_optimistic | 0.5% | 8% on ratchet only | €0 | Very High |
  | unsure_reluctant | 0.5% | 1.5% | €0 hard (walks) | None |

  **Per-component reaction logic** (each component rated independently):
  - `green` = within client's acceptable zone → no concession needed
  - `yellow` = borderline → client will agree but patience drops
  - `red` = outside reservation price → client pushes back; if 2+ reds → round fails

  **Inverse EV rule**: lower valuation expectation → client more willing to accept higher base success fee % (they need the % to be meaningful). Higher expectation → client pushes for lower % and accepts ratchet instead.

  **Trade-off dynamic**: if player lowers success fee (green reaction) but proposes retainer (red reaction), client may accept the bundle if their `prioritySuccessFee` is high and `priorityRetainer` is low. The engine computes a **net satisfaction score** across the 3 components weighted by priority.

  **Patience mechanic**: each round where a component is red, `patienceRemaining -= 25 × priorityWeight`. When `patienceRemaining ≤ 0`, client walks away regardless.

  **Flavour text matrix** (sample — fully written in content file):
  - `unsure_optimistic` + retainer red: *"Look, if you want a retainer, I question whether you actually believe in the deal. I'm not paying you to turn up — I'm paying you to close."*
  - `serious_demanding` + success fee yellow: *"That's a bit rich. I understand your model, but 2.5% on a deal of this size is significant. What are you prepared to give on the other terms?"*
  - `serious_reasonable` + all green: *"This feels fair. I'd like to think about it overnight but I think we can make this work."*
  - `unsure_reluctant` + 2 reds: *"I like you but I'm not sure I'm ready for a full process. This fee structure feels like a lot of commitment for something I'm still exploring."*

  **Max rounds**: 4 (not 3 — one extra round available if `clientTrust > 60`). After 4 failed rounds OR `patienceRemaining ≤ 0`: `status = 'failed'`, `clientTrust -= 10`, phase gate blocked. Player can re-open negotiation but must concede on at least one component.
- **Competitor detection & mitigation**: `evt-competing-advisor` event (already in pool) now also sets `competitorThreats` in state. Mitigation actions are available as pseudo-tasks with specific costs and effects:
  | Action | Cost | Effect |
  |--------|------|--------|
  | Golf/padel/dinner | €3k | +5 clientTrust, -8% dropout probability |
  | Reference intro | €2k | +3 clientTrust, +5 momentum |
  | Conference invite | €4k | +4 clientTrust, +6 reputation |
  | Advance pitch | Team surge | -2 weeks to pitch delivery, +team load |
  | Surge staffing | Hire cost | Opens temp capacity at premium, -1 week |
- **Phase 0 qualification notes**: tasks `task-01` (Initial Screening) and `task-03` (Client Motivation) auto-generate qualification notes on completion.

---

### New Components

#### [NEW] [BudgetRequestModal.tsx](file:///c:/antigravity/AG-P004/src/components/BudgetRequestModal.tsx)

Modal with:
- Current budget display + phase allocation
- Amount input (number, max guard)
- Justification textarea
- Submit button → calls `requestBudget()`
- Pending/approved/rejected state display

#### [NEW] [BoardSubmissionModal.tsx](file:///c:/antigravity/AG-P004/src/components/BoardSubmissionModal.tsx)

Modal with:
- Summary of qualification notes so far (read-only)
- Client assessment (trust, momentum, qualificationNotes sentiment summary)
- Recommendation radio: Proceed / Decline
- Rationale textarea (min 50 chars to submit)
- Submit button → calls `submitBoardRecommendation()`
- Board pending state shown after submission

#### [NEW] [StaffingModal.tsx](file:///c:/antigravity/AG-P004/src/components/StaffingModal.tsx)

Two tabs — **Permanent Hire** and **Temporary Capacity**:

*Permanent Hire tab:*
- 4 profiles (Junior Analyst €8k, Senior Analyst €15k, Associate €20k, External Advisor €12k)
- One-off cost deducted from budget; adds to team permanently
- Capacity boost preview

*Temporary Capacity tab:*
- 3 contractor profiles: Freelance Analyst (€3k/week, ×1.3 speed), External Specialist (€5k/week, ×1.5 speed), Secondment (€4k/week, ×1.4 speed)
- Player selects the target task from a dropdown (only in-progress or available tasks shown)
- Weekly cost shown as burn rate
- Calls `allocateTempCapacity(taskId, profile)`
- Active allocations displayed with "Release" button to cancel early

#### [NEW] [PitchPresentationModal.tsx](file:///c:/antigravity/AG-P004/src/components/PitchPresentationModal.tsx)

Locked behind completing the pitch deliverable task. Shows:
- Pitch summary (company name, sector, target valuation range, process overview)
- "Present Pitch to Client" CTA → calls `presentPitch()`, marks `pitchPresented = true`
- Triggers flavour email from client with initial reaction

#### [NEW] [FeeNegotiationModal.tsx](file:///c:/antigravity/AG-P004/src/components/FeeNegotiationModal.tsx)

The flagship interaction for Phase 1 transition.
- **GSAP Integration:** Cinematic transitions and pulsate effects.
- **Live Fee Simulator:** Real-time €M fee projection based on slider inputs.
- **Patience Meter:** Dynamic bar that sizzles on "Red" reactions.
- **Outcome States:** Handshake agreement card vs. "Walk Away" termination.

*Refer to [fee_negotiation_design_doc.md](file:///C:/Users/AfonsoLima/.gemini/antigravity/brain/16450437-86d3-47e5-8c81-91fe8b8bd802/fee_negotiation_design_doc.md) for the full 16-variant text matrix and hidden AI logic.*

#### [NEW] [CompetitorMitigationPanel.tsx](file:///c:/antigravity/AG-P004/src/components/CompetitorMitigationPanel.tsx)

Banner panel that appears on Dashboard and ClientScreen when `competitorThreats` has an unresolved threat:
- Shows threat flavour (competing advisor name, when detected)
- Lists available mitigation actions as clickable cards with cost + effect preview
- Two categories clearly separated: **Relationship Accelerators** (social events, references, conference) and **Process Accelerators** (advance pitch, surge staffing)
- Each action calls `executeMitigationAction(action)` and becomes greyed out once used

---

### Screen Modifications

#### [MODIFY] [DashboardScreen.tsx](file:///c:/antigravity/AG-P004/src/screens/DashboardScreen.tsx)

- Add budget phase indicator: `"Phase Budget: €20k allocated | €Xk remaining | carried €Yk forward"`
- Show "Request Additional Budget" button when `resources.budget < 10` (critically low)
- In Phase 0: show "Submit Board Recommendation" CTA card when `boardSubmission === null` and enough research done (≥1 qualification note)

#### [MODIFY] [ClientScreen.tsx](file:///c:/antigravity/AG-P004/src/screens/ClientScreen.tsx)

- Add "Qualification Notes" panel (visible in Phase 0): scrollable list of qualification notes with sentiment indicators
- Add "Meeting Notes" subsection showing notes sourced from meetings

#### [MODIFY] [TeamScreen.tsx](file:///c:/antigravity/AG-P004/src/screens/TeamScreen.tsx)

- Add "Add Resource" button (always visible) → opens `StaffingModal`
- Show permanent team member list with current load
- Show "Active Contractors" sub-section listing temp allocations with their task link, weekly rate, and Release button

#### [MODIFY] [DashboardScreen.tsx — fee gate CTA](file:///c:/antigravity/AG-P004/src/screens/DashboardScreen.tsx)

- When `phaseGate.canTransition && !feeNegotiation?.pitchPresented` → show "Present Pitch to Client" CTA (opens `PitchPresentationModal`)
- When `pitchPresented && feeNegotiation?.status !== 'agreed'` → show "Negotiate Mandate Terms" CTA (opens `FeeNegotiationModal`)
- When `competitorThreats` has unresolved threat → show `CompetitorMitigationPanel` as a priority alert card
- Once fee agreed, normal "Advance Phase" button reactivates

#### [MODIFY] [ClientScreen.tsx](file:///c:/antigravity/AG-P004/src/screens/ClientScreen.tsx)

- Add `CompetitorMitigationPanel` if threat is active

---

## Verification Plan

### Manual Testing Steps

No automated test framework exists in this project. All verification is manual via the dev server:

```
cd c:\antigravity\AG-P004\app
npm run dev
```

Then open `http://localhost:5173` in the browser and follow these steps:

**Test 1 — Budget carryover:**
1. Start new game (clear localStorage first if needed)
2. Complete Phase 0 without spending all budget (avoid starting expensive tasks)
3. Advance to Phase 1 via Board approval
4. Confirm budget = Phase 0 carryover + Phase 1 base (30k)

**Test 2 — Board budget request:**
1. In any phase, spend down budget below 10k
2. Confirm "Request Additional Budget" button appears on Dashboard
3. Click, enter amount + justification, submit
4. Advance week — confirm email arrives with board decision
5. If approved, confirm budget increases accordingly

**Test 3 — Phase 0 gate:**
1. Start a new game
2. Try to advance phase without completing research tasks → phase gate should block
3. Complete Initial Company Screening + Client Motivation Assessment tasks
4. Confirm qualification notes appear in ClientScreen
5. Submit board recommendation from Dashboard CTA
6. Advance week — confirm board approval email arrives
7. Confirm "Advance to Next Phase" button appears in WeekSummary overlay

**Test 4 — Permanent hire:**
1. Go to Team screen, click "Add Resource" → Permanent Hire tab
2. Select a profile, confirm budget is deducted
3. Confirm new member appears in team list
4. Start a high-complexity task and observe faster completion

**Test 5 — Temporary capacity:**
1. Start a high-complexity in-progress task
2. Go to Team screen → Add Resource → Temporary Capacity tab
3. Select contractor profile, assign to the task
4. Advance week — confirm task completes faster (or higher chance of completion)
5. Confirm weekly rate is deducted from budget each week
6. Confirm allocation disappears when task completes

**Test 6 — Fee negotiation (Phase 1 gate):**
1. Complete Phase 1 tasks to satisfy phase gate conditions
2. Advance week — WeekSummary shows phase gate met but "Negotiate Mandate Terms" is required
3. Open fee negotiation modal, set opening position (e.g. €5k retainer, 1.8% success fee)
4. Submit → client counter-offer appears with flavour text
5. Accept client offer → agreed terms summary shown
6. Return to dashboard — Advance Phase button now active
7. Test failed negotiation: exhaust all 3 rounds without agreement, confirm phase gate blocks

### TypeScript Build Check
```
cd c:\antigravity\AG-P004\app
npm run build
```
Must complete with 0 errors.
