# The M&A Rainmaker — Gameplay Mechanics Overhaul

## Phase 0: Base Infrastructure & UI Polish
- [x] Configure `gh-pages` and resolve Vite base path routing
- [x] Fix all TypeScript build errors blocking production build
- [x] Overhaul Start Screen: Double logo size, remove text, overlap entry button (3x scale)
- [x] Sync Name Form and Saved Game cards with high-impact overlap design

## Feature 1: Evolutionary Phase Budget System [x]
- [ ] Define per-phase budget allocations in a config/constants file
- [ ] Add `phaseBaseBudget` and `budgetCarryover` fields to GameState
- [ ] Update `advancePhase` to add new phase budget + carryover to current budget
- [ ] Add `requestBudget` action to store (amount + justification string)
- [ ] Add `pendingBudgetRequest` state (amount, justification, status: pending/approved/rejected)
- [ ] Add Board Budget Request UI panel/modal (visible when budget runs low or player triggers it)
- [ ] Update DashboardScreen to show "Request Budget" button with affordance logic
- [ ] Wire Board response as a simulated async event (auto-resolve in next week advance)

## Feature 2: Phase 0 Qualification & Board Submission Flow
- [ ] Add `qualificationNotes` array to GameState (team research notes, meeting notes)
- [ ] Add `meetingNotes` structured field (date/week, source, content, sentiment)
- [ ] Create `QualificationPanel` component shown in Phase 0 Dashboard or Client screen
- [ ] Add team research feedback task effects that populate qualificationNotes
- [ ] Add "Meeting Notes" section to ClientScreen for Phase 0
- [ ] Add `boardSubmission` state (status: not_submitted/pending/approved/rejected, recommendation, rationale)
- [ ] Create `BoardSubmissionModal` — player writes recommendation + rationale, submits
- [ ] Wire board response: if approved → advancePhase to 1 + add pitch budget; if rejected → game over or try again
- [ ] Add Phase 0 gate: cannot advance without board submission approval
- [ ] Update weekEngine phase gate for Phase 0→1 to require board approval

## Feature 3: Permanent Team Staffing
- [ ] Add `hireStaffer` action to store (role, one-off cost, capacity boost)
- [ ] Define 4 permanent staff profiles with hire cost in `phaseBudgets.ts`
- [ ] Create `StaffingModal` component — Permanent Hire tab
- [ ] Add "Add Resource" button to TeamScreen
- [ ] Update `syncTeamLoad` to include newly hired members
- [ ] Update week engine to factor total team capacity into task completion speed

## Feature 4: Temporary Capacity Allocation
- [ ] Add `TempCapacityAllocation` type to `game.ts`
- [ ] Add `tempCapacityAllocations: []` to GameState initial state
- [ ] Add `allocateTempCapacity(taskId, profile)` action to store
- [ ] Add `releaseTempCapacity(allocationId)` action to store
- [ ] Define 3 contractor profiles with weekly rate + speed multiplier in config
- [ ] Add Temporary Capacity tab to `StaffingModal` with task selector dropdown
- [ ] Show active contractor allocations in TeamScreen with Release button
- [ ] Update `weekEngine` — apply `speedMultiplier` to linked task during `resolveTaskProgress`
- [ ] Deduct weekly rate from budget each week while allocation is active
- [ ] Auto-remove allocation when linked task completes

## Feature 5: Fee Negotiation Mini-Game
- [ ] Add `RetainerType`, `FeeNegotiation`, `FeeCounterOffer`, `FeeTerms` types to `game.ts`
- [ ] Add `feeNegotiation: null` and `agreedFeeTerms: null` to GameState
- [ ] Add `presentPitch()` action — marks `feeNegotiation.pitchPresented = true`; triggers client flavour email
- [ ] Add `startFeeNegotiation()` action — requires pitch presented; initialises negotiation
- [ ] Add `makeCounterOffer(terms)` action — submits player terms, resolves client counter
- [ ] Add `acceptClientOffer()` action — finalises `agreedFeeTerms`
- [ ] Implement `rollFeeNegotiation()` in weekEngine:
  - [ ] Client reservation price: success fee floor ≥ 1%, retainer can be €0
  - [ ] Inverse EV rule: modest valuation → client accepts higher % (up to 5%); high valuation → client fights for 1–2%
  - [ ] Ratchet calculation: `(successFee% × EV) + (ratchetBonus% × max(0, EV − threshold))`
  - [ ] Retainer type flavour text logic (monthly → client pushback; upfront → accepted)
  - [ ] 3-round failure → `clientTrust -= 10`, gate blocked
- [ ] Create `PitchPresentationModal.tsx` — summary + "Present Pitch" CTA
- [ ] Create `FeeNegotiationModal.tsx` — retainer type selector + success fee slider + ratchet panel + live fee projection + 3-round loop
- [ ] Phase gate: Phase 1+ requires `pitchPresented === true` AND `status === 'agreed'`
- [ ] Update DashboardScreen CTA sequence: Present Pitch → Negotiate Fees → Advance Phase
- [ ] Update `advancePhase` to reset `feeNegotiation` for next cycle
- [ ] Wire `agreedFeeTerms` into `resultsEngine` for success fee calculation at game end

## Feature 6: Competitor Mitigation
- [ ] Add `MitigationAction` type and `CompetitorThreat` interface to `game.ts`
- [ ] Add `competitorThreats: []` to GameState initial state
- [ ] Update `evt-competing-advisor` event in weekEngine to also push a `CompetitorThreat` entry
- [ ] Add `executeMitigationAction(action)` store action (budget deduction + resource effects)
- [ ] Define 5 mitigation actions with costs + effects in config
- [ ] Create `CompetitorMitigationPanel.tsx` — threat banner with Relationship vs Process accelerator cards
- [ ] Render panel on DashboardScreen and ClientScreen when threat is active
- [ ] Mark threat as resolved when all chosen actions are done or deadline passes

## Verification
- [ ] Budget carryover across phase transitions
- [ ] Board request flow: approve + reject paths
- [ ] Phase 0 gate blocks advance without board approval
- [ ] Permanent hire reduces task completion time
- [ ] Temp capacity: weekly rate deducted, speed boost applied, removed on task complete
- [ ] Pitch gate: cannot open fee modal without pitch presented
- [ ] Fee negotiation: 3-round loop, accept path, 3-fail path blocks gate, `-10 clientTrust` applied
- [ ] Ratchet calculation: EV €110M, threshold €100M, ratchet 10% → total fee validates to €2.1M (at 1% base)
- [ ] Inverse EV rule: modest valuation client expects → success fee % ceiling higher in negotiation
- [ ] Competitor mitigation: threat appears, each action deducts cost and applies resource effect
- [ ] `agreedFeeTerms` flows into ResultsBoard success fee
- [ ] `npm run build` 0 TypeScript errors
