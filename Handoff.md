# Gameplay Redesign Handoff

## Purpose

This document hands the next coding session the gameplay redesign work for The M&A Rainmaker. The previous session reviewed the source code and the live GitHub Pages build, then produced a gameplay plan. No gameplay redesign code was implemented in that session.

## Status Update (2026-08-10)

A follow-up session implemented a large part of the original plan. The work is present in the working tree as **uncommitted changes** on `main`. `npm.cmd run test` passes (26 tests, 6 files) and `npm.cmd run build` passes.

Implemented and wired:

- **Seeded RNG** (`src/engine/rng.ts`) with unit tests.
- **Event Director** (`src/engine/eventDirector.ts`): weighted draw, per-event cooldowns, time-normalized probability (`daysElapsed / 7`), tension/recovery balancing, chain progression, danger-event cap while a major risk is unresolved. Used by `weekEngine.ts`; `eventDirectorState` persisted in `gameStore.ts`.
- **Deal Beat types** (`src/types/dealBeat.ts`): `DealBeat`, `DealBeatAction`, `ActionCommitment`, `PhaseMission`.
- **Phase missions** (`src/content/missions.ts`): 2-4 strategic missions per phase, with tests. Dashboard shows the first mission as a "Deal Desk" panel with up to 3 committable actions (`commitToAction`).
- **Deal Tape** (`src/components/DealTape.tsx`): staggered GSAP reveal of turn events — but currently rendered **inside** `WeekSummaryOverlay`.
- **Motion utilities** (`src/utils/motion.ts`): `animateCounter`, `staggerReveal`, `shakeFeedback`, `pulseGlow`, all honoring `prefers-reduced-motion`.
- **WeekSummaryOverlay** compacted: narrative + Deal Tape + Deal Pulse by default, full breakdown behind a "Show Detailed Breakdown" toggle.
- **Week pace selector** (deliberate / standard / sprint) and a `~Nd` advance preview on the Dashboard CTA.
- **Phase transition** shortened to ~2s and skippable on click.
- Results engine, FinalOffers, Timeline, GameplayReviewBar changes from plan section 1 (state stabilization) are also in the diff.

Not yet done: the advance loop is still modal-blocking (see Fluidity Plan v2 below), KPI tiles still use a simple flash instead of `animateCounter`, resource deltas carry no cause, and mission progression/selection is static (`missions[0]`).

The goal is to make the game feel more fluid, animated, dynamic, organic, and replayable while keeping the difficulty fair. The game should remain an M&A process simulation, not become an arcade game or a task checklist.

## Current Project

- Repository: `https://github.com/limbus6/therainmaker`
- Main branch: `main`
- Live URL: `https://limbus6.github.io/therainmaker/`
- Last known main commit: `ed89d04` (`Improve gameplay progression and phase flow`)
- The repository was clean at the end of the review.
- Build and lint had passed before this handoff.
- Generated `.js`, `.d.ts`, and `.map` files under `src/` are committed artifacts and must be regenerated after TypeScript changes.
- Game UI copy must remain in English. This handoff is technical documentation and may use Portuguese concepts only when useful.

## Existing Architecture

- `src/store/gameStore.ts`: Zustand state, actions, phase transitions, debug jumps, tasks, leads, buyers, SPA, staffing, budget, persistence.
- `src/engine/weekEngine.ts`: time advancement, task progress, resource consumption, buyers, events, emails, phase gates, collapse detection.
- `src/engine/resultsEngine.ts`: endgame scoring and results board.
- `src/types/game.ts`: core state types, phases 0-10, tasks, risks, events, buyers, offers, negotiations.
- `src/utils/gameplayState.ts`: risk lifecycle, phase workstreams, dashboard deliverables, momentum labels, valuation labels.
- `src/screens/DashboardScreen.tsx`: current main gameplay surface.
- `src/screens/TasksScreen.tsx`: phase task list and workstreams.
- `src/screens/InboxScreen.tsx`: email response choices.
- `src/screens/DataroomScreen.tsx`: DD access-level choices.
- `src/screens/FinalOffersScreen.tsx`: final offer comparison and preferred bidder selection.
- `src/components/WeekSummaryOverlay.tsx`: current blocking weekly report.
- `src/components/PhaseTransitionOverlay.tsx`: current phase transition overlay.
- `src/components/GameplayReviewBar.tsx`: debug checkpoints and review submissions.
- `src/components/FeeNegotiationModal.tsx` and `src/components/SPANegotiationModal.tsx`: best existing examples of interactive negotiation UX.
- `src/screens/TimelineScreen.tsx`: current static phase timeline.

## Findings From Review

The game has substantial content but still feels like a list manager. The main issue is not lack of events; it is that decisions, time, and consequences are not connected tightly enough in the interface.

- There are 9-13 tasks in most phases. Phase 7 has a dependency chain with depth 9 and 12 locked tasks.
- `weekEngine.ts` contains approximately 80 event templates, but events are mostly reported after time advances. Only a smaller subset generates direct response choices.
- Event selection scans the pool in fixed order and stops after the event limit. Earlier templates are therefore favoured over later templates.
- Event probability is rolled per `Advance` action instead of being normalized to elapsed days. Repeated short advances can change event frequency unfairly.
- Randomness uses `Math.random()` throughout the store and engine. Runs are not reproducible for QA or balance testing.
- `advanceWeek` creates a long weekly report modal. The player often sees the consequence away from the action that caused it.
- Phase 0 investigations complete instantly even though they are presented as team work.
- `scheduleMeeting` completes the meeting immediately and spends budget, despite the wording suggesting a scheduled future action.
- Live testing found a continuity bug: a Phase 0 investigation displayed as completed, then returned to `Missing` after advancing time. `syncLeadsFromTasks` maps newly generated investigation tasks back over the direct investigation state.
- `FinalOffersScreen` says the preferred bidder choice is final, but `selectPreferredBidder` still allows another bidder to replace it.
- `resultsEngine.ts` derives closing value primarily from momentum. The selected `FinalOffer` should materially affect closing value, cash certainty, conditions, and outcome.
- `TimelineScreen.tsx` uses hard-coded week ranges up to Week 52, while debug checkpoints currently reach approximately Day 214. The displayed calendar is not the actual game calendar.
- The QA bar collapses to a full-height strip labelled `Review bar hidden`, which still consumes gameplay space. It should become a small floating control outside normal gameplay mode.
- KPI tiles have basic flash animation, but most resource changes jump instantly without showing delta, cause, or affected entity.
- The Data Room, Fee Negotiation, and SPA Negotiation surfaces already provide useful patterns: visible pressure, trade-offs, reactions, patience, and multi-step choices.

## Target Gameplay Loop

The core loop should become:

`Plan -> Execute -> Observe -> React`

1. A central Deal Desk shows the current objective, up to four meaningful actions, work in progress, and incoming pressure.
2. The player chooses a small number of priorities and optionally selects a pace.
3. The primary CTA advances to the next meaningful beat, normally 1-4 days, rather than blindly advancing a week.
4. A short deal-tape animation shows time, task progress, buyer movement, incoming messages, and resource changes.
5. Major events open an immediate contextual decision. Minor events enter the activity timeline without blocking.
6. KPIs animate from old to new values and show a short causal delta, for example `Trust +4: Ricardo responded well to the update`.
7. Full history remains available in Timeline and Inbox, but the main loop does not require reading a long report after every advance.

## Design Principles

- Keep no more than 3-4 visible priority actions at one time.
- Treat routine tasks as background execution; reserve player attention for trade-offs and relationships.
- Randomness should create variation, not invalidate good play without warning.
- Every major negative event needs a telegraph, an explanation, and at least one response route.
- Do not use stale risks or hidden tasks as blockers.
- Keep Phase 0 explicitly about a lead/prospect. Solara becomes an active client only after the mandate.
- Preserve the existing retro corporate noir visual identity.
- Reuse the stronger interaction patterns from Fee Negotiation, SPA Negotiation, Inbox, Data Room, and Competitor Mitigation.

## Implementation Plan

### 1. Stabilize State First

Primary files: `src/store/gameStore.ts`, `src/types/game.ts`, `src/engine/resultsEngine.ts`.

- Make one source of truth for Phase 0 investigation state. Either create the investigation tasks before direct investigation actions or stop `syncLeadsFromTasks` from overwriting a completed direct investigation with a newly available task.
- Add a confirmation step before selecting a preferred bidder, then lock the decision unless an explicit renegotiation action exists.
- Ensure `preferredBidderId` is the only source for SPA, late-phase narrative, closing value, and result scoring.
- Make `resultsEngine.ts` use the selected offer's `totalEV`, `cashEV`, structure, conditionality, and execution credibility.
- Replace static timeline ranges with actual phase entry days and phase history.
- Add regression tests for state persistence, checkpoint jumps, preferred bidder continuity, and P0 investigation continuity.

### 2. Introduce a Deal Beat Model

Extend the state model with a small set of explicit gameplay beats. Suggested concepts:

- `DealBeat`: objective, phase, source, status, available actions, deadline, and consequences.
- `ActionCommitment`: action id, owner, work required, start day, expected finish day, and visible progress.
- `EventState`: telegraphed, decision_pending, resolved, expired, or historical.
- `ResourceDelta`: resource, before, after, delta, reason, and source entity.

Keep existing tasks as content where possible, but group them into 2-4 phase missions. Routine tasks can progress in the background. A mission should expose the strategic choice and show which supporting tasks improve the result.

### 3. Replace the Current Event Roll With an Event Director

Primary file: `src/engine/weekEngine.ts`.

- Introduce a seeded random source stored per run so a QA checkpoint can be replayed.
- Build an eligible event list, shuffle or weighted-draw it, and remove fixed pool-order bias.
- Normalize event probability against elapsed days instead of number of clicks.
- Add per-event cooldowns, chain ids, phase relevance, tension weight, and recovery weight.
- Use event chains such as `signal -> escalation -> decision -> consequence`.
- Cap major negative events to one unresolved major threat at a time.
- After two adverse beats, increase the chance of a recovery or agency beat.
- Never trigger a catastrophic collapse without a previous warning and a response window.
- Preserve emails for asynchronous texture, but promote urgent decisions into the Deal Desk.

### 4. Rework Phase Missions

- Phases 0-1: research choices, founder conversation, board recommendation, pitch emphasis, and fee negotiation.
- Phases 2-3: allocate capacity between model, CIM, teaser, data room, outreach, and NDA processing; show quality-versus-speed trade-offs.
- Phases 4-5: shortlist buyers, manage client anchoring, compare NBO economics, and decide who receives DD access.
- Phases 6-7: create a live Q&A queue, react to buyer friction, control data room exposure, receive offers over time, and choose preferred bidder with visible certainty-adjusted value.
- Phases 8-10: expand the existing SPA negotiation pattern into a document issue tracker, signing countdown, conditions-precedent board, and closing-day sequence.

Optional quality work should improve risk, trust, buyer confidence, or outcome quality. It should not create long chains of mandatory clicks after the commercial decision is ready.

### 5. Motion and Interaction Pass

Primary files: `src/index.css`, `src/components/WeekSummaryOverlay.tsx`, `src/screens/DashboardScreen.tsx`, `src/screens/FinalOffersScreen.tsx`, `src/screens/TimelineScreen.tsx`.

- Add a reusable motion layer using the existing GSAP dependency where sequencing matters.
- Animate deal-tape day progression, task progress, buyer status movement, incoming email cards, KPI counters, and resource deltas.
- Use staggered reveals for new events and short success/failure transitions for decisions.
- Make phase transitions skippable and shorter for repeated testing.
- Replace the large weekly report with a compact summary plus optional detail expansion.
- Hide the review bar completely in normal mode and expose it as a floating collapsed control in review mode.
- Support `prefers-reduced-motion` and avoid motion that blocks input.

### 6. Balance and Verification

Add deterministic engine tests and a lightweight simulation harness. Suggested initial targets:

- Standard run length: approximately 60-90 minutes.
- First meaningful decision: within 30 seconds.
- First visible consequence: within 60 seconds.
- Three to five meaningful decisions per phase.
- Standard first-run close rate: approximately 65-75%.
- Deal collapse only after clear warnings and failed recovery opportunities.
- No more than one major unresolved negative event at a time.
- Preferred bidder changes must propagate to SPA, signing, closing, and final results.
- All phase jumps must produce coherent risks, workstreams, deliverables, buyers, and narrative.
- Verify desktop and mobile layouts, including the compact Deal Desk and event cards.

## Fluidity Plan v2 — IMPLEMENTED (2026-08-10, same day)

All five phases of the plan below were implemented in the working tree the same day. Verification: 40/40 tests pass (8 files), build passes, lint passes with 0 errors (2 intentional `exhaustive-deps` warnings on animation effects), browser QA on desktop and mobile widths confirmed: no blocking modal on routine advances, tape playback with skip, KPI delta chips with reason tooltips, inline urgent-email decision card resolving in place, mission progression (Mission X/Y + progress + rollover toast), and Situation Report auto-opening only on major beats (verified: 5 routine advances silent, danger-band advance auto-opened). Zero console errors.

New files: `src/engine/resourceDeltas.ts`, `src/components/TurnTape.tsx`, `src/components/DeskDecisionCard.tsx`, `src/utils/missionProgress.ts`, plus tests (`resourceDeltas.test.ts`, `missionProgress.test.ts`) and `.claude/launch.json` (dev server config for browser QA; vite runs on port 5199).

Key wiring: `advanceWeek` now sets `turnPlayback` + `lastResourceDeltas` + `pendingReportAutoOpen`; `completeTurnPlayback` releases input and opens the report only when flagged; `WeekSummaryOverlay` renders only when `showWeekReport` is true; `dismissWeekSummary` no longer clears `lastWeekResult` so the pill can reopen the report. All transient fields excluded from persistence.

Gotcha rediscovered during QA: the dev server resolves the committed compiled `.js` files ahead of `.tsx` (Vite extension order), so **`.tsx` edits are invisible in the browser until `npx tsc -b` regenerates the artifacts**. Editing `.tsx` + running build remains mandatory before any browser verification.

## Fluidity Plan v2 (original plan, for reference)

The engine-side fairness work is done, but the game still *feels* stop-and-go. The root cause is unchanged: **every advance ends in a full-screen blocking modal**, and all motion happens inside that modal instead of in the game world. The player never sees time pass — they see a freeze-frame report about time having passed.

### Diagnosis — what still breaks the flow

1. **Blocking Situation Report.** `advanceWeek` sets `lastWeekResult`, which unconditionally mounts `WeekSummaryOverlay` (fixed inset-0, backdrop-blur) via `AppShell`. Even compacted, the loop is: click Advance → screen freezes → read → click Continue. The Deal Tape animation plays inside the modal, so the consequence is still displayed away from the action.
2. **Time jumps instantly.** The day counter snaps from Day 12 to Day 19 in one frame. `isWeekInProgress` is a plain flag; nothing is sequenced against the visible game surface.
3. **KPIs have no causality.** `KpiTile` does a 600ms `animate-pulse` flash. `animateCounter` exists in `src/utils/motion.ts` but is unused. There is no old→new count-up, no delta chip, no reason ("Trust +4: Ricardo responded well").
4. **Committing an action gives no feedback.** "Commit to Action" swaps the button for a progress bar on the next render. No motion, no capacity/budget delta shown, and the player still has to find and click Advance — the cause-effect pair is split across two clicks with silence in between.
5. **Decisions live away from the desk.** Urgent events and emails are reported after the fact in the modal or require navigating to Inbox. `CompetitorMitigationPanel` is the only inline decision card pattern on the Dashboard.
6. **Deal Desk is static.** It always shows `missions[0]`, with no mission progress, no completion moment, and no rotation as the phase evolves.

### Phase A — Non-blocking live turn (highest impact)

Primary files: `src/store/gameStore.ts`, `src/components/layout/AppShell.tsx`, `src/components/WeekSummaryOverlay.tsx`, `src/components/DealTape.tsx`, `src/screens/DashboardScreen.tsx`.

- Add a `turnPlayback` slice to the store: `{ status: 'idle' | 'playing' | 'done', fromDay, toDay, queue: TapeItem[] }` populated by `advanceWeek` from `WeekResult`. Do not persist it (same treatment as `lastWeekResult`).
- Move the Deal Tape out of the modal into a **persistent strip on the Dashboard** (directly under the header or docked above Recent Activity). On advance, play the sequence in place over ~1.5-2.5s: day counter ticks up day by day (`animateCounter`), tape items stream in with `staggerReveal`, KPI deltas land as they occur.
- Make the tape **skippable** (click or Space collapses to final state) and instant under `prefers-reduced-motion`.
- **Stop auto-opening the Situation Report for routine turns.** After playback, show a small "Situation Report" pill/toast that opens the existing overlay on demand. Auto-open only on major beats: phase gate newly satisfied, critical outcome, collapse warning, deal-pulse band change to danger.
- Keep the overlay itself (it is good as an on-demand report); only change *when* it appears.

### Phase B — Causal resource deltas

Primary files: `src/engine/weekEngine.ts`, `src/types/game.ts`, `src/components/ui/KpiTile.tsx`.

- Emit `ResourceDelta[]` from `resolveWeek` — `{ resource, before, after, delta, reason, sourceEntity }` — populated wherever the engine already mutates resources (task completion, events, emails, pace costs, contractor drain). The type was specified in the original plan but never added.
- Rework `KpiTile`: count old→new with `animateCounter`, and float a short-lived delta chip (`+4` / `-6`) beside the value; tooltip or tape entry carries the reason. Deltas without a reason string fall back to a generic phase label rather than blocking the feature.
- Show the same delta chips inline on the Deal Tape strip so cause and number appear together.

### Phase C — Decisions at the desk

Primary files: `src/screens/DashboardScreen.tsx`, `src/engine/weekEngine.ts`, `src/screens/InboxScreen.tsx`.

- Promote urgent decision points into **inline decision cards** at the top of the Dashboard, reusing the `CompetitorMitigationPanel` pattern: situation, 2-3 response options with visible trade-offs, resolves in place with a short success/failure transition.
- Sources: events flagged `decision_pending` by the director, and `urgent` priority emails (render their existing response options directly; answering on the desk marks the email read).
- Non-urgent items keep flowing to Inbox/timeline without blocking. Cap visible decision cards at 1-2; queue the rest.

### Phase D — Deal Desk progression

Primary files: `src/screens/DashboardScreen.tsx`, `src/content/missions.ts`, `src/store/gameStore.ts`.

- Select the **active mission** by completion state instead of `missions[0]`: first mission whose `completionCriteria` are unmet; show "Mission 2 of 3" and a progress indicator derived from `requiredActionIds` done.
- On mission completion, play a brief inline completion moment (checkmark + `pulseGlow`, one tape entry) — no modal.
- On "Commit to Action": animate the button morphing into the progress bar, `pulseGlow` the card, and immediately float the capacity/budget delta chips so committing feels like something happened before the next Advance.

### Phase E — Micro-motion and pacing polish

Primary files: `src/index.css`, `src/components/PhaseTransitionOverlay.tsx`, `src/screens/DashboardScreen.tsx`.

- Shorten phase transition hold to ~1.2s (currently 1.6s) and keep click-to-skip.
- Staggered panel reveal on phase entry so the new phase's dashboard builds up instead of popping.
- Audit for layout jumps during playback (reserve tape strip height; no CLS while items stream in).
- Keep all new motion under the `prefersReducedMotion()` guard already established in `src/utils/motion.ts`.

### Verification targets for v2

- Routine advance: **no blocking modal**; dashboard interactive again within ~2.5s of clicking Advance (instant when skipped or reduced-motion).
- Every resource change during playback is attributable: visible delta + reason within the tape or tile.
- Urgent decisions are answerable without leaving the Dashboard.
- Situation Report still reachable for any past turn beat via the pill (and history via Timeline).
- Existing tests stay green; add tests for `ResourceDelta` emission and active-mission selection.
- Manual QA on desktop and mobile widths; verify the tape strip and decision cards on small screens.

### Suggested order

A → B → D → C → E. Phase A alone changes the feel of the game more than everything else combined; B rides on A's playback. D is cheap. C touches engine flagging and should land once the tape is stable. E is polish throughout.

## Suggested First Session Actions

> **Note (2026-08-10):** items 1-6 below are from the v1 plan and are largely implemented in the uncommitted working tree (see Status Update). The next session should start from **Fluidity Plan v2, Phase A**, after first committing or reviewing the current diff. Items 7-8 (build, lint, browser QA, artifact regeneration) still apply to every session.

1. Reproduce and fix the P0 investigation regression.
2. Lock preferred bidder selection behind an explicit confirmation and test SPA continuity.
3. Update results scoring to use the selected final offer.
4. Replace the static Timeline week ranges with actual state-derived dates.
5. Add the new event and resource delta types before redesigning the dashboard.
6. Implement one complete vertical slice in Phase 0 or Phase 6 before applying the pattern to all phases.
7. Run `npm.cmd run build` and `npm.cmd run lint`.
8. Test the vertical slice through the live-style browser flow, then regenerate committed artifacts and deploy only after the local flow is stable.

## Delivery Guardrails

- Edit `.ts` and `.tsx` as the source of truth.
- Run `npm.cmd run build` after TypeScript changes because generated artifacts are committed.
- Preserve the Vite base path `/therainmaker/`.
- Do not reintroduce stale phase blockers or make `riskLevel` a hard Phase 9 gate.
- Do not reintroduce Portuguese copy into the live game UI.
- Keep `Fixes.md` review submission behaviour honest: GitHub Pages cannot directly write repository files.
- Before deployment, verify `git status --short`, build, lint, browser QA, `main`, `gh-pages`, and the public Pages URL.
