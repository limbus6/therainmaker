# Gameplay Redesign Handoff

## Current Snapshot (2026-08-12)

The historical review and phased plan below remain useful design context, but every implementation-status claim in them is superseded by this snapshot and `roadmap.md`. **The engineering scope of M0 through M6, including challenge seeds, active builds, staggered offers, and all four apex ceremonies, is complete on `main` and live** at `https://limbus6.github.io/therainmaker/`. The run save schema is **v16**, the comparison season is **`target-campaigns-v1`**, and HEAD (`e2821b9`) has 162/162 tests. (Numbers below were accurate when first written but the schema/test count have moved since; treat `git log` and a fresh `npm test` as the source of truth over any number in this file.) Behavioral criteria that require real players use `docs/roadmap-validation.md` and are never inferred from automation.

**Read this before touching anything:**
- Compiled `.js`/`.d.ts`/`.map` artifacts are **gone from `src/`** (`noEmit: true` in tsconfig; Vite resolves `.ts`/`.tsx` directly). The old "run `tsc -b` before browser QA" gotcha from earlier in this document no longer applies — ignore any instruction below that references it.
- **Deploy is CI-based**, not manual. Pushing to `main` runs `.github/workflows/deploy.yml`: install → lint → test → build → deploy to `gh-pages` (deploy step gated to `push` on `main` only; PRs get the same pipeline minus the deploy step — a PR build once overwrote production before this gate existed, don't regress it). `npm run deploy` still works locally if ever needed, but the normal path is: commit, push, watch the Actions run.
- `src/vite-env.d.ts` is authored source (types `import.meta.env`) force-added past the `src/**/*.d.ts` ignore rule — don't delete it as a stray artifact.

### What shipped, in order

- **M0 — Trust the Numbers**: seeded RNG everywhere; `dealMomentum` is **derived** (`engine/dealMomentum.ts`), never stored, shown with a "Derived" tag; integer resources at the engine boundary; honest resource-effect labels; replay trace; source-artifact CI guard (`scripts/check-source-artifacts.mjs`).
- **M0.5 — Cut the Work**: friction audit (`docs/m0.5-friction-audit.md`, ~67% fewer clicks on the main path), "Next Meaningful Action" panel, Start/Commit & Advance combined CTAs, batch queue/clear on routine tasks, inline TurnTape responses.
- **Event catalogue extraction**: all 80 authored events live in `src/content/events/index.ts`; `weekEngine.ts` imports the catalogue instead of owning it inline. `CONTENT_VERSION` (`src/content/contentVersion.ts`) is now also the Daily/RM1 comparison season: bump it whenever authored content, balance, mandate/build configuration, or state-driven selection could make results mechanically incomparable. When event content or selection changes, regenerate `src/engine/__tests__/__fixtures__/eventSequences.baseline.json` (`UPDATE_EVENT_SEQUENCE_FIXTURE=1` env var on the sequence test) in the same commit — this is a hard regression gate, not a suggestion.
- **Causal process scoring**: append-only deduplicated `processLog`, five disciplines (Judgment/Execution/Stakeholder/Risk/Negotiation) computed independently of deal outcome, `mandateDifficulty` adjustment, evidence-confidence blend toward neutral until `FULL_CONFIDENCE_WEIGHT` (6) of recorded evidence exists. Board judgment rated via `engine/boardCase.ts` on verified investigation/meeting/notes, not string-length proxies. Results Board shows the five disciplines plus a source-linked Player Debrief.
- **Board pity ladder + pre-mandate floor**: `boardRejectionCount` adds +20% IC approval per prior rejection; a third evidence-backed "proceed" submission is approved outright. Phases 0-1 carry a `dealMomentum` floor of 10 — dice can delay a mandate, never kill it by decay.
- **M2 — People**: `engine/founderPulse.ts` derives Ricardo's mood (confident/steady/restless/anxious) from live trust/momentum/risk/deadline state — never stored, never numeric. `engine/peopleBeats.ts` schedules telegraphed check-ins (P3-6) and buyer relationship beats (Kestrel P3, Schneider P4+P6) in the authored lane beside the golden arc (never subject to the weighted event pool). Responses move `chemistryWithSeller`/`ddFriction` via `EmailResponseOption.buyerEffects` and record story flags that narrate the buyer's eventual offer (`getPeopleOfferDriver`).
- **M3 — Offer ceremony**: `engine/offerReactions.ts` gives the existing sealed-envelope reveal its payoff layer — mood×tier reaction matrix with relationship-decision overrides, market chatter from buyer facts, best-so-far comparison framing, staggered reveal motion.
- **M4 — Builds**: three advisor archetypes (`content/archetypes.ts`: Relationship Banker / Technician / Shark) chosen once at run start on a new landing step, disclosed modifiers only (task work factors, start deltas, negotiation patience bonus). Results financial block computes ratchet bonus (threshold-gated), retainer income, and Total Advisory Fee; the run summary names the build.
- **M4 completion**: every build now adds one active, once-per-mandate action with an explicit cost: Founder Call, Red-Team Review, or Reopen Competitive Tension. Ability use is persisted, causally scored, replayable, narrated into offers where relevant, and surfaced in Results style stats. The deterministic balance proxy runs 600 matched seeds per build across all three fee strategies and prevents a single build from leading every axis.
- **M3 completion**: binding offers land on deterministic buyer-specific days through the DD window; offer reveal plus board, signing, and closing ceremonies are short, skippable, motion-safe, tied to real outcomes, and replay-recorded. Results only opens after the closing wire ceremony is completed or skipped.
- **M5a — Career**: `store/careerStore.ts` in its own localStorage key (`ma-rainmaker-career`, independent of the run save) mints a tombstone per completed run (deduped by mandate+seed) and tracks 0-20 career reputation earned by process quality, not luck. `screens/MandateMarketScreen.tsx` (`/mandates`) offers three condition-variant mandates over the same authored content (Flagship/Headwinds/Hot Market — different difficulty profile and seed), with career reputation disclosed as a starting bonus. "Play Again" is now "Choose Next Mandate".

### M5a.2–M6 release scope

- **M5a.2 — Phase compression**: Flagship keeps all 11 process phases; Headwinds and Hot Market use five playable stages (`3 → 5 → 7 → 8 → 10`). The active plan is derived from `mandateId`, so schema remains v12. Short runs bootstrap with accepted standard fee terms and the authored Phase 2 buyer universe, then bridge only buyer state across omitted Shortlist/DD stages. Skipped work creates no process evidence. Dashboard, Topbar, Timeline, phase gates, replay trace, onboarding, deadline copy, market cards, and Results all describe the compressed sequence honestly.
- **M5b — Deal Shelf**: `/career` is a real collection screen with totals, close rate, aggregate EV/fees, source-named records, and newest-first tombstones containing mandate, outcome, buyer, EV, multiple, fee, grade, process score, build, date, and elapsed days. Failed deals remain visible. Results and the market both link to it, and “Choose Next Mandate” remains the primary continuation. The store retains the latest 50 entries; a 50-entry browser fixture was used for QA and removed afterwards.
- **M5c — persistent Beacon**: career store v2 adds a separate 50-entry Beacon ledger and market step. On a normal mandate choice Beacon deterministically takes the highest-difficulty declined mandate; after a player collapse Beacon enters the restarted process; every player close records a Clearwater win. Each result states the rule that caused it. The market shows the rivalry score, the Deal Shelf explains every encounter, and flagship dashboards show a Rival Desk that explicitly applies no hidden difficulty/rubber-banding modifier.
- **M6 — daily + challenge comparability**: run schema v14 supports `career`, `daily`, and `challenge` modes. UTC date + `CONTENT_VERSION` feed the Daily's documented deterministic seed; the result fixes one short mandate, advisor archetype, buyer pool, difficulty, and RNG sequence with zero career-reputation bonus. Daily results live in `ma-rainmaker-daily`, separate from career/Beacon, and the first result for a date+season is locked (replays are labelled unranked). Results includes a copyable text/emoji card; the Deal Shelf includes current-season daily bests and recent results. Challenge codes use `RM1` + season hash + mandate + build + seed + fixed starting reputation bonus + checksum. Altered or incompatible-season codes fail before save handoff. The Challenge Room verifies and discloses the complete configuration before a separate Play action; results live in `ma-rainmaker-challenges`, grouped by code with local best score/close/speed, and never touch Career, Beacon, or Daily.
- Verification: 147/147 tests, including active-ability costs/one-use persistence, 600-seed-per-build balance, staggered offer determinism, all ceremony gates/records, the dedicated IC review checkpoint, style stats, the complete gated compressed playthrough, 50-entry retention, career v1→v2 and run v14→v15 migration, Beacon rules, UTC season seeding, Daily locking, challenge validation, and Results isolation. Build/source guard/lint are clean. Browser QA covers the active ability, board/signing/closing ceremonies, Results style summary, and desktop/mobile overflow before every release. The full human protocol lives in `docs/roadmap-validation.md`.

### Known-good, deliberately deferred

- **Human outcome validation after deployment**: Golden Slice timing/recall, ability identity, collectibility with a real 50-run career, unprompted Beacon recall, and consecutive-day Daily return are behavioral exit criteria, not safely answerable by automated QA. Run `docs/roadmap-validation.md` before claiming those measures.
- Team traits/growth and person-level task allocation are explicitly outside this roadmap after the M0.5 friction audit: mandatory allocation would restore the administration M0.5 removed. Reopen only as a new milestone if observed play demonstrates a low-click version with net judgment; this is a product decision, not unfinished M0–M6 engineering.

### Verification protocol every session should follow

`npm run test` (must stay 100% green — the event-sequence baseline test is a hard gate), `npm run build`, `npm run lint`, then browser QA via the dev server (`.claude/launch.json`, port 5199) before pushing. Push to `main` deploys automatically; watch the Actions run (`gh run list --branch main --limit 1`) and confirm the new bundle hash is live (`grep -o 'index-[A-Za-z0-9_-]*\.js' dist/index.html` vs what `https://limbus6.github.io/therainmaker/` serves) before considering a change shipped.

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
- `src/engine/weekEngine.ts`: time advancement, task progress, resource consumption, buyers, event resolution, emails, phase gates, collapse detection.
- `src/content/events/index.ts`: the authored, ordered event-template catalogue.
- `src/engine/processScoring.ts`: deterministic process-log append/deduplication, category weights, and mandate-difficulty adjustment.
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

## Delivery Guardrails (current)

- Edit `.ts` and `.tsx` as the source of truth — there are no compiled artifacts committed under `src/` anymore, so this is now just "the source of truth," full stop.
- Preserve the Vite base path `/therainmaker/`. `window.location.replace('/')` anywhere is a bug (it 404s on GitHub Pages) — use `import.meta.env.BASE_URL`. This has bitten "Start New" and "Play Again" once each; both fixed, watch for the pattern recurring in new reset/restart flows.
- Any change to persisted `gameStore` state bumps `SAVE_SCHEMA_VERSION` and ships a migration + migration test. Same for `careerStore` if its shape changes (bump its own `version`).
- Any change to authored event content or event-selection logic bumps `CONTENT_VERSION` and regenerates the event-sequence baseline fixture in the same commit.
- Do not reintroduce stale phase blockers or make `riskLevel` a hard Phase 9 gate.
- Do not reintroduce Portuguese copy into the live game UI. This handoff document itself stays English.
- `FeeNegotiationModal.tsx` and `SPANegotiationModal.tsx` are protected systems — the strongest negotiation UX in the project. Don't refactor or "improve" them incidentally; only touch them for an explicitly scoped, approved task.
- Before considering any change shipped: `npm run test` (100% green), `npm run build`, `npm run lint`, browser QA, then push to `main` and confirm the CI run succeeded and the live bundle hash matches.

## 2026-08-12 — Dashboard simplification (local, uncommitted)

### Request and design intent

The latest request was to reduce Dashboard noise and make the screen simpler and more intuitive. The implementation now treats the Dashboard as a decision surface rather than a second copy of every specialist screen: one primary action, one compact view of the phase, and short links to deeper work.

### Current implementation

There are three modified source files on top of `main`; none of these changes has been committed, pushed, or deployed yet:

- `src/screens/DashboardScreen.tsx`
  - Removed the duplicated KPI row already represented in the global header.
  - Removed the repeated full lists/panels for Priority Actions, Active Workstreams, Inbox, Buyer Pipeline, Deliverables, Active Risks, Market Headlines, Recent Activity, competitor mitigation, and the full Beacon panel.
  - Introduced a compact page header with phase, deadline, pace, Staffing, and Advance controls.
  - Introduced a single **Focus now** card. An urgent email decision replaces this card using the existing `DeskDecisionCard`, so the page does not present competing primary actions.
  - Added compact **Phase plan** and **Phase gate** blocks with progress bars and collapsible gate requirements.
  - Added four **At a glance** links for Work, Inbox, Targets/Buyers, and Risks instead of embedding their full content on the Dashboard.
  - Kept all existing modals, deadlines, phase advancement, Turn Tape, urgent decisions, and gameplay routes.
  - Direct gate decisions now outrank optional work in the focus logic: Phase 4 shortlist, Phase 7 preferred bidder, and Phase 8 SPA negotiation appear before ordinary tasks.
  - The focus CTA adapts to the actual blocker; insufficient budget offers **Request budget**.
  - At zero days the header now says **Deadline reached**, and completed mission work says **All mission work complete**.
  - Competitor pressure remains available on the Client screen; the Dashboard only shows a compact linked alert when an active threat exists.
  - Beacon is represented by a quiet, one-line link to Career rather than a full panel.
- `src/components/ArchetypeAbilityPanel.tsx`
  - Replaced the large panel and effect-chip group with a compact one-line archetype edge: ability name, up to three effects, availability, and action button.
  - Full detail remains accessible through the title tooltip; the underlying ability behavior is unchanged.
- `src/components/PhaseZeroDashboard.tsx`
  - Replaced the large target cards and four separate investigation rows with three compact target cards.
  - Each card now surfaces description, evidence count, and meeting state with less repetition.
  - The selected-target area retains campaign promise, founder/value/evidence information, research actions, meeting CTA, and IC recommendation.
  - No Phase 0 gameplay mechanic was intentionally removed.

The net local diff is currently 367 insertions and 778 deletions across those three files.

### Validation already completed

After the main rewrite, before the final focus-priority/text patch:

- `npm run lint` passed.
- `npm test` passed: 39 test files, 162/162 tests.
- `npm run build` passed.
- The lazy Dashboard bundle reduced from roughly 26.8 kB gzip to 23.4 kB gzip in that build.

Manual browser QA at `http://127.0.0.1:4175/therainmaker/` verified the Phase 4 layout at 1280 px:

- No horizontal overflow (`clientWidth` and `scrollWidth` both 1280).
- The primary CTA stayed inside the viewport.
- The compact header, Focus now card, Phase plan/gate, At a glance links, archetype edge, and Beacon line rendered together with a much clearer hierarchy.
- QA initially exposed a priority problem: an optional buyer task appeared before shortlist selection. The focus ordering was then corrected, and the reloaded page showed **Choose the provisional shortlist (1/2)** as the primary action.

### Work interrupted / still required

The last small patch changed focus ordering and header/mission copy after the successful automated checks. Therefore, do not treat the branch as verified until all checks are rerun:

1. Run `npm run lint`.
2. Run `npm test` and confirm all 162 tests remain green (or account explicitly for any intentional test-count change).
3. Run `npm run build`.
4. Complete browser QA for:
   - Phase 0 Kickoff: compact targets, investigation actions, meeting flow, and IC recommendation.
   - Phase 4: shortlist incomplete, confirming the direct shortlist CTA outranks optional tasks.
   - Phase 7: no preferred bidder, confirming the compare/select-offers action is primary.
   - Phase 8: no agreed SPA, confirming SPA negotiation is primary.
   - Narrow/mobile and 1280 px layouts, including console errors and horizontal overflow.
5. Consider adding a focused Dashboard test that asserts one primary focus region, absence of the removed duplicate headings, and the Phase 4 shortlist priority.
6. Only after the above passes: commit with a scoped message such as `Simplify dashboard hierarchy`, push `main`, monitor **Deploy to GitHub Pages**, and verify the live bundle/hash and live interactions.

### Git and deployment state

- Branch: `main`, aligned with `origin/main` before these three local edits.
- Published baseline: commit `e2821b9` (`Fix gameplay review issues`).
- Dashboard redesign: **not committed, not pushed, and not on GitHub Pages**.
- The interrupted local QA server on port 4175 has been stopped; restart it before continuing browser QA.

Do not publish merely because the earlier checks passed: the final focus-priority patch still needs the full automated and browser verification described above.

### Verification closed out (2026-08-12, independent pass)

Re-ran the full checklist above against the current working tree exactly as it stood (no code changes made during this pass):

- `npx tsc -b --noEmit`: clean. `npm test`: 39 files / **162/162 green**. `npm run build`: clean. `npm run lint`: clean.
- Browser QA, desktop (1280px): Phase 0 with an urgent decision pending (DeskDecisionCard replaces the Focus card correctly, resolves in place) and without (PhaseZeroDashboard renders three compact target cards with evidence counts, meeting states, IC recommendation flow intact); Phase 4 with `task-60` completed and only 1 buyer shortlisted — Focus correctly shows **"Choose the provisional shortlist (1/2)"** ahead of ordinary tasks, exactly the scenario this note flagged as unverified; Phase 7 with no preferred bidder — Focus shows **"Choose the preferred bidder"** / "Compare offers"; Phase 8 with a preferred bidder but no agreed SPA — Focus shows **"Negotiate the SPA"**, and the CTA opens the real SPA negotiation modal.
- Mobile (375px): no horizontal overflow after these state changes.
- Zero console errors across the entire session.
- KPIs removed from the Dashboard's own grid remain visible at all times via `Topbar.tsx` (`KpiPill` for Momentum/Trust/Risk) — their removal here is deduplication, not a loss of information.

**Verdict: this diff is safe to commit, push, and deploy as-is.** Nothing further needs to change before shipping it.
