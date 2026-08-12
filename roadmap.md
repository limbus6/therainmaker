# Roadmap — The M&A Rainmaker: From Simulation to Compulsion

## Goal

**Make this game richer, more exciting, and less tedious.** This is the objective every milestone serves and the test every change must pass:

- **Richer** — more texture per minute: characters with arcs instead of stat panels, decisions with personality instead of checklists, systems the player can read and master.
- **More exciting** — anticipation and payoff: every advance opens a question, every offer is an event, every run has stakes that carry forward.
- **Less tedious** — ruthless removal of dead time: no busywork clicks, no unexplained numbers, no closed states where nothing pulls the player forward, no long stretches of document management between meaningful choices.

If a proposed feature does not make the game noticeably richer or more exciting — or makes it more tedious — it does not ship, regardless of which milestone it belongs to.

## Purpose

This roadmap turns The M&A Rainmaker from a strong one-shot 60-90 minute simulation into a game players return to. It consolidates two design reviews (2026-08-10): the systems review ("what would you change") and the compulsion review ("what makes it addictive"). It assumes the Fluidity v2 layer (non-blocking turn tape, causal deltas, desk decisions, mission progression) is live as of commit `fdfa127`.

**North star:** three engines of return, built in this order —
1. *"What happens next?"* — anticipation density inside a run.
2. *"I want to try a different build."* — strategic identity between runs.
3. *"My career persists."* — stakes and collection across runs.

## Design Pillars (constraints on every milestone)

- **Every visible number traces to a cause.** No delta without a nameable reason. Fluidity v2 made numbers visible; this roadmap makes them honest.
- **Never leave the player without orientation.** Meaningful advances expose real forward pull; phase boundaries may close a chapter, but they always make the next objective and return path clear.
- **Randomness creates variation, never invalidates play.** Variance lives in events with narrative, not in silent ticks.
- **Remove before adding.** Every milestone must identify dead clicks, duplicate information, or administrative work it can delete; feature count is not a success metric.
- **Premium retention only.** Mastery + variety + collection. No timers, no streak punishment, no dark patterns — an offline premium sim cannot sustain them and doesn't need them.
- **Preserve the retro corporate noir identity and English-only game copy.**
- **The deal is people.** Ricardo, the buyers, and the rival are characters first, stat containers second.
- **Forward pull needs breathing room.** Important turns should create genuine curiosity, while phase boundaries remain safe places to stop and return. Never manufacture a weak hook to satisfy a quota.

---

## M0 — Trust the Numbers (foundation hygiene)

*The prerequisite for everything: visible numbers must be believable before more systems are stacked on them.*

**Scope**
- Remove `applyResourceNoise` drift from routine advances. Move variance into named events via the Event Director (which already supports tension-weighted draws). A delta labeled "Steady execution" must never be random noise.
- Integer resources everywhere (fix e.g. `Capacity 98.72%`). Round at the engine boundary, not in the UI.
- Honest decision labels: `respondToEmail` currently applies ±25% hidden variance to promised effects. Either show ranges ("+1 to +3 trust") or remove the variance. Promising "+2" and delivering "+1" reads as the game lying.
- Advance pacing transparency: the `~Nd` preview is computed from invisible rules (urgent email → 1d, task complexity → 1-3d, idle → 7d). Surface a one-line reason next to the CTA: *"Urgent reply pending — advancing to tomorrow."*
- **Source/build hygiene:** make Vite resolve TypeScript source unambiguously. Remove generated `.js/.d.ts/.map` files from `src` if the build permits; otherwise generate them outside `src` and add a CI check that prevents stale compiled artifacts from shadowing `.tsx/.ts`.
- **State integrity:** introduce an explicit save schema version and migrations before adding career state. A valid old save must either migrate safely or fail with a clear recovery path.
- **Determinism:** a run seed plus content version must reproduce the same event sequence. Add a development-only causal log that records each state change, its source, and RNG draw so balance failures can be replayed.
- **Outcome-independent process score:** persist the consequential decisions that define how the mandate was run, grouped into Judgment (30%), Execution Discipline (25%), Stakeholder Management (20%), Risk Stewardship (15%), and Negotiation Craft (10%). Score the process visible at the time of the decision, not whether later RNG happened to reward it. Unobserved categories stay neutral rather than counting as failure; mandate difficulty may adjust the result by at most ±5 points.
- **Scoped player debrief:** replace generic end-state “Key Drivers” with 3-5 high-impact moments selected from that causal log. Reveal hidden fee/SPA reservation positions only after the relevant negotiation has ended. A failed deal can therefore show strong process, and a closed deal can show weak process.

**Delivery status — 2026-08-11**

- Delivered: the 80 authored event templates were extracted from `weekEngine.ts` into `src/content/events/index.ts` without changing their order, and a catalogue test locks count, uniqueness, and order anchors.
- Delivered: new runs persist `contentVersion = solara-events-v2`, `scoringModelVersion = causal-v2`, a neutral mandate-difficulty profile, and a deduplicated causal process log. Save schema v8 migrates existing runs to `legacy-v1` so an upgrade does not rewrite an in-progress result. The v2 content boundary records the intentional event-selection change caused by derived deal state.
- Delivered: causal records now cover relevant task delivery, email response timing, risk mitigation choices, the board recommendation, fee and SPA rounds, preferred-bidder confirmation, and dataroom disclosure choices.
- Delivered: Results Board now shows the five process disciplines and a source-specific Player Debrief; post-negotiation reservation ranges are revealed only after agreement or failure.
- Verified: build and automated coverage include event-catalogue integrity, causal weighting/deduplication, difficulty caps, migration behaviour, and the separation of process quality from deal outcome.
- Delivered: `dealMomentum` is a non-persisted materialised view of phase position, current work, buyer conviction, client confidence, milestones, and active risk. Its Dashboard tile exposes the component breakdown and its tape deltas identify live deal state as the source.
- Delivered: save schema v10 strips legacy stored momentum and adds a bounded replay trace with exact action inputs, RNG seed/draw/state for advances and risk plans, causal sources, process records, event IDs, and JSON export from Settings.
- Delivered: Vite resolves TypeScript first, TypeScript emits nothing into `src`, and `npm run check:source` now blocks generated JavaScript, declaration, or map artifacts from entering the source tree. The production build runs the check automatically.
- Verified: automated coverage now includes derived momentum, exportable replay trace, effect-label honesty, source hygiene, migration, deterministic `solara-events-v2` sequences, and the prior M0 scoring/integrity suite.
- Deliberately deferred: person-level team traits, growth, and allocation are not scheduled here. Revisit only after the M0.5 friction audit demonstrates a version that adds judgment without restoring staffing administration.

**Structural item — delivered:** `dealMomentum` is derived rather than stored, using task currency, buyer conviction, trust, milestones, and unresolved risk. This removes the last independently authored god-stat.

**Exit criteria:** every delta chip in the tape has a concrete cause; no fractional values anywhere in the UI; option labels match applied effects; the Advance CTA explains its own pace; TypeScript is the unambiguous runtime source; save migrations and deterministic replay are covered by tests.

**Primary files:** `src/engine/weekEngine.ts` (noise, momentum), `src/store/gameStore.ts` (respondToEmail, daysPreview, schema version), `src/engine/resourceDeltas.ts`, `src/engine/rng.ts`, `src/screens/DashboardScreen.tsx`, `vite.config.ts`, `tsconfig*.json`.

**Effort:** 2 sessions (momentum derivation: +1 session if it cannot be completed safely in the same pass).

---

## M0.5 — Cut the Work (friction audit)

*"Less tedious" needs its own delivery pass. The roadmap must remove administrative work before it earns the right to add more systems.*

**Scope**
- Audit every phase and classify each interaction as **decision**, **information**, or **administration**. Keep decisions, compress information, and remove or automate administration that carries no risk or trade-off.
- Measure clicks and elapsed time between meaningful decisions. No normal path should require more than two consecutive advances without new information, a consequential choice, or a payoff.
- Batch repetitive document, inbox, and task actions. Resolve common actions directly from TurnTape when opening a separate screen adds no judgment.
- Make the next required action and its reason obvious. Remove duplicate status surfaces and closed screens that force navigation without changing the player's understanding.
- Protect texture: automation should eliminate rote processing, not erase moments where prioritisation, negotiation, or judgment is the point.

**Exit criteria:** the main path uses materially fewer administrative clicks; there are no more than two consecutive no-choice advances in ordinary play; playtesters can identify the next meaningful action without hunting across screens; removed/batched actions do not reduce strategic choice.

**Primary files:** `src/components/TurnTape.tsx`, `src/screens/DashboardScreen.tsx`, task/inbox/dataroom screens, `src/store/gameStore.ts`, phase content.

**Effort:** 1-2 sessions. **Depends on:** M0 (the audit needs trustworthy state and causal logging).

**Delivery status — 2026-08-11**

- Delivered: the Dashboard names the next meaningful action and offers one-click Start & Advance for available priorities. Raw Advance points back to a pending priority instead of permitting repeated administrative time skips while work is waiting.
- Delivered: high/urgent email choices can be resolved directly on TurnTape; exact applied effects are shared across TurnTape, Desk Decision, and Inbox.
- Delivered: low-priority informational mail has a one-click clear action. Low-complexity, non-recommended internal/document work has a one-click queue action on Dashboard and Tasks.
- Safeguard: relationship, strategic, market-outreach, external-advisor, risk, buyer, dataroom, fee, and SPA choices remain individual; batching queues work but never completes it or advances time.
- Measured: ordinary priority and urgent-email paths fall from three clicks to one. The full phase classification, click counts, safeguards, and human timing protocol live in `docs/m0.5-friction-audit.md`.
- Engineering exit complete. Remaining validation is the scheduled full-mandate human timing pass; its result should tune thresholds, not reopen administrative UI by default.

---

## V1 — The Golden Mandate Slice (prove the loop before scaling it)

*Build one exceptional 15-20 minute stretch before spreading new systems across eleven phases.*

**Scope**
- Use a representative Phase 5-7 path as the test bed: one telegraphed development, a Ricardo crisis, a multi-beat buyer conflict, a Beacon intervention, a staged offer reveal, and a clearly traced consequence.
- Give every setup a payoff inside the slice. The player should be able to explain how an earlier human decision changed the buyer, Ricardo, or the offer.
- Include a natural stopping point and a concise return card: *Previously / What matters now / What happens next*.
- Playtest and revise the slice before generalising its patterns into M1-M3. Do not mass-produce content until this unit is compelling and low-friction.

**Exit criteria:** the slice completes in roughly 15-20 minutes; contains no long administrative gap; its major setup/payoff chain is recalled by playtesters; the offer reveal is described as a highlight; players want to continue without being pushed by a filler hook.

**Primary files:** the M1-M3 files below, initially scoped to one Phase 5-7 path.

**Effort:** 1-2 sessions for the first integrated slice and iteration. **Depends on:** M0 and M0.5. **Precedes:** full M1-M3 rollout.

---

## M1 — The Cliffhanger Engine (one more turn)

*Create legible forward pull without turning every advance into an artificial cliffhanger. High-impact moments need anticipation; phase boundaries need permission to pause.*

**Scope**
- **Telegraph system on the tape.** The Event Director already supports chains (`signal → escalation → decision → consequence`). Expose the signal step as a teaser at the end of each turn's tape: *"Tomorrow: Schneider's IC meets on your proposal."*
- **Forward-pull guarantee for meaningful turns.** When a real pending development exists, make it visible: telegraphed event, expected email, approaching deadline, or buyer decision due. Never schedule a low-stakes filler event solely to populate the tape.
- **Cadence and stopping points.** Use stronger hooks before major payoffs and quieter turns after them. Phase transitions summarise what changed, frame the next question, and explicitly work as safe stopping points.
- **Return orientation.** On resume, show a compact *Previously / What matters now / What happens next* card so a player can re-enter the deal without rereading every screen.
- Teaser data model: `UpcomingBeat { id, dueDay, label, source }` stored alongside `eventDirectorState`, rendered in TurnTape and Timeline.

**Exit criteria:** ≥90% of meaningful advances leave a legible, real source of forward pull; teasers reliably pay off; no filler hooks are needed to hit the metric; players report advancing "to find out" rather than "to process" and can comfortably stop at a phase boundary.

**Primary files:** `src/engine/eventDirector.ts`, `src/engine/weekEngine.ts`, `src/components/TurnTape.tsx`, `src/components/PhaseTransitionOverlay.tsx`.

**Effort:** 1-2 sessions. **Depends on:** V1 (the narrow hook cadence must work before full rollout).

---

## M2 — People, Not Panels (the emotional core)

*The game's best data — "wife is pressuring him to retire; he is burned out but won't admit it" — currently lives in tooltips. Put it in the loop.*

**Scope**
- **Founder check-ins.** Periodic decision cards (reusing `DeskDecisionCard`) with Ricardo, whose emotional state is *derived* from deal state (momentum, phase pressure, days since last personal contact, recent setbacks). An anxious Ricardo in Phase 6 threatening to take the first offer is a systems-driven story beat, not a scripted email. Trust changes should predominantly flow through these interactions.
- **Buyer relationship arcs, not quotas.** Buyers already carry `chemistryWithSeller`, `executionCredibility`, `ddFriction`, `politicalSensitivity` — and these already feed the endgame. Select a smaller subset for 2-3 beat arcs per run: setup, remembered response, and payoff. A high-friction buyer demanding exclusive access should later remember the answer in its offer or execution behaviour. Do not require one interaction per buyer per phase; that becomes another checklist.
- **Selective depth.** Different buyers receive focus in different runs. It is better for two buyers to be memorable than for every buyer to receive interchangeable content.
- **Consequential memory.** Relationship decisions set explicit flags and later lines/effects reference them. Chemistry and trust changes must be traceable to the actual interaction, not a generic passive modifier.
- **Rival advisor as a character.** Beacon Partners stops being a one-off event and becomes a named recurring presence within the run (steals a buyer you neglect, pitches Ricardo when trust dips). This seeds M5's persistent antagonist.

**Exit criteria:** in a full run, the majority of trust/chemistry movement comes from decisions the player made about people; every featured relationship arc has a visible setup and payoff; playtesters can name Ricardo's arc and at least two buyer personalities unprompted.

**Primary files:** `src/components/DeskDecisionCard.tsx` (generalize sources), `src/engine/weekEngine.ts`, `src/content/*` (decision content), `src/types/game.ts` (founder state, buyer decision types).

**Effort:** 2-3 sessions. **Depends on:** V1; benefits from M1 (check-ins can be telegraphed).

---

## M3 — The Reveal (offer ceremony)

*NBOs and final offers are this game's loot boxes — variable rewards currently delivered as list rows. Stage them.*

**Scope**
- **Offer reveal sequence:** offers arrive as sealed envelopes on the desk; opened one at a time with a pause, value counting up (GSAP counter exists), structure/conditions revealed line by line, Ricardo's reaction, one line of market chatter. Skippable, `prefers-reduced-motion` respected.
- Same ceremonial treatment for the three other apex moments: IC board decision (Phase 0), signing, and closing day wire.
- Offers arrive **over time** across the window (already partially supported by the deadline system) so each advance during offer season is a pull of the lever.
- Every revealed term must be explainable by the run: reference buyer traits, relationship flags, diligence, competitive tension, and prior player choices rather than presenting a disconnected random reward.
- Track reveal completion and skip behaviour locally during playtests. A sequence that most players skip needs tighter pacing, not more animation.

**Exit criteria:** playtesters describe an offer reveal as a highlight; offer moments are screenshotted/shared; players can explain the major drivers of each offer; the sequence remains fast, skippable, and accessible.

**Primary files:** new `src/components/OfferRevealOverlay.tsx`, `src/screens/FinalOffersScreen.tsx`, `src/engine/weekEngine.ts` (staggered arrival), `src/utils/motion.ts`.

**Effort:** 1-2 sessions. **Depends on:** V1. Independent of the full M1/M2 rollout (can be parallelized after the slice).

---

## M4 — Builds (run identity)

*Runs must differ by player intent, not just dice.*

**Scope**
- **Fee structure as strategy.** The fee negotiation already exists as a strong minigame; make its outcome strategy-defining. Retainer-heavy = safe income, lower upside — supports a conservative, trust-focused playstyle. Aggressive ratchet = you only win big above a threshold EV — forces competitive-tension plays in phases 5-7. Scoring and career earnings (M5) flow through the chosen structure.
- **Advisor archetypes with active verbs.** 3-4 picks at run start should change what the player can do, not merely apply hidden passive modifiers. Examples: *The Relationship Banker* can call Ricardo to interrupt an impulsive decision; *The Technician* can rework an analysis to expose a hidden risk; *The Shark* can reopen competitive tension at a relationship cost.
- **Transparent trade-offs.** Any passive modifier that remains is shown at the moment it applies and names the archetype as its cause. Each active ability has a meaningful cost, cooldown, or opportunity cost so there is no universally correct pick.
- **Run summary** on the results board names the build and shows style stats (decisions taken, risk profile, relationship index) so identity is legible in retrospect.
- Add seeded balance simulations across archetypes and fee structures. Horizontal variety is the target; no build should dominate close rate, EV, and relationship outcomes simultaneously.

**Exit criteria:** two playtesters with different builds describe genuinely different runs; players can name the action their archetype enabled; ratchet builds show measurably different Phase 5-7 behavior; seeded simulations reveal no dominant build.

**Primary files:** `src/components/FeeNegotiationModal.tsx`, `src/engine/resultsEngine.ts`, `src/store/gameStore.ts` (archetype state), new `src/content/archetypes.ts`, `src/screens/ResultsBoardScreen.tsx`.

**Effort:** 2 sessions. **Depends on:** M1-M3 rollout and M0 scoring integrity; pairs naturally with M2.

---

## M5 — The Career (meta-layer, the destiny milestone)

*Without a meta-layer the Rainmaker is a good film; with one it's a game people come back to.*

Build M5 as independently shippable releases. Persistence creates meaning first; shorter replays, collection UI, and the persistent rival follow only after the smallest loop works.

### M5a — Career shell and tombstones

- Career profile (`ma-rainmaker-career`) is separate from the versioned run save. Starting a new mandate clears the run, never the career.
- Every completed deal mints a deduplicated tombstone: mandate, company, buyer, EV, multiple, total fee, grade, process score, date, build, and days. Failed deals receive a sober history entry.
- Career reputation is capped at 20 and earned by process quality rather than outcome luck. The mandate market discloses the carried starting bonus and per-mandate best close.
- Results hands directly to “Choose Next Mandate”; Flagship, Headwinds, and Hot Market use deterministic career-step seeds.

**Status:** shipped in `7b9ce2d` (schema v12). **Exit criteria:** completed and failed runs survive reloads; revisiting Results cannot duplicate a tombstone; the next engagement starts with the declared seed, difficulty, and career bonus.

### M5a.2 — Phase compression for short mandates

- Keep Flagship on the complete 11-phase process. Headwinds and Hot Market use a five-stage plan: Market Outreach → Non-Binding Offers → Final Offers → SPA Negotiation → Closing.
- Derive the active sequence from `mandateId`; do not persist a second phase-plan source of truth. Compressed runs start with an accepted mandate, standard disclosed fee terms, and the authored buyer universe.
- Bridge only the minimum buyer state across omitted Shortlist and DD stages. Omitted work must never create process-score evidence or appear as completed player work.
- Timeline, Dashboard, Topbar, phase gates, replay trace, and Results must describe the mandate stages honestly while preserving the underlying process phase IDs.

**Exit criteria:** both short conditions traverse exactly five stages; Flagship is unchanged; offer reveal and SPA remain fully playable; no omitted task blocks a later gate; deterministic tests cover start and every compressed bridge; an organic short run completes without debug jumps.

**Status:** shipped on `main`. Deterministic start/bridge tests and a complete gated five-stage playthrough pass. Schema remains v12 for this slice because the plan derives from `mandateId`.

### M5b — Tombstone shelf and career legibility

- Build a real collection screen from the captured tombstones: mandate, outcome, buyer, EV, fee, grade, process score, build, and elapsed days.
- Add career totals and records without turning reputation into an unbounded power curve. Failed deals remain visible history, not a grind penalty.
- Link the shelf from Results and the mandate market; keep choosing the next mandate within one clear action.

**Exit criteria:** the shelf survives reloads, remains readable with 50 entries, explains every record, and makes a completed run feel collectible.

**Status:** shipped on `main`. `/career` provides the complete Deal Shelf, career totals, named record provenance, failure history, and direct navigation from Results/Market. Store tests cover the 50-entry boundary; browser QA covered empty and 50-entry states. Perceived collectibility remains a human playtest measure.

### M5c — Beacon as persistent antagonist

- Beacon wins selected mandates the player declines or loses, maintains a parallel tombstone history, and appears as rival advisor in flagship deals.
- Rival progress follows explicit rules and named events. It creates narrative pressure, not rubber-banding or silent cheating.
- Seed recurring characters and remembered outcomes so beating Beacon pays off a career-long relationship.

**Exit criteria:** players can name the rival and recall at least one prior encounter; Beacon's progress is understandable; victory feels earned rather than scripted.

**Status:** shipped on `main`. Career store v2 persists a separate Beacon history. The market-choice, player-loss, and player-win rules are explicit, seeded, deduplicated, tested, and shown beside each record; flagship runs expose the remembered rivalry without mechanical cheating. Unprompted recall remains a human playtest measure.

**Primary files:** `src/store/careerStore.ts`, new `src/screens/CareerScreen.tsx`, `src/screens/MandateMarketScreen.tsx`, `src/content/mandates.ts`, `src/store/gameStore.ts`, `src/engine/resultsEngine.ts`.

**Depends on:** M0-M4 (a career of runs is only as good as one run).

---

## M6 — The Habit (daily & comparability)

*Nearly free technically — the seeded RNG already exists — but only valuable once a run is worth repeating.*

**Scope**
- **Versioned daily mandate:** one small mandate per day, derived from the UTC date, content version, and a documented seed function. Everyone receives the same mandate configuration, buyer pool, archetype rotation, and RNG sequence.
- **Season boundary:** a balance/content update changes the content version and starts a clearly labelled new comparison season. Results from incompatible versions are never presented as directly comparable.
- Daily results are stored separately from career progression. Career unlocks must not alter the daily configuration or give experienced profiles a mechanical advantage.
- **Shareable result card:** score, grade, EV, multiple, build — as copyable text/emoji block (Wordle mechanism: comparability → conversation → daily return).
- **Personal bests & league:** career screen tracks best multiple, best EV, fastest close, per-mandate-size records.
- **Challenge seeds:** `RM1` codes fix season, mandate, build, RNG seed, difficulty (through the versioned mandate), buyer/content pool, and starting reputation bonus. A checksum rejects altered codes; incompatible seasons are rejected before launch. Challenge attempts are stored outside Career, Beacon, and Daily and are locally comparable by score, close value, and speed.

**Exit criteria:** the same UTC date and content version reproduce identical starting state and event order across supported devices; incompatible versions are separated by season; internal playtest group returns on consecutive days unprompted.

**Status:** engineering scope shipped on `main`. Run schema v14 plus separate `ma-rainmaker-daily` and `ma-rainmaker-challenges` stores isolate comparison modes from career power. Date+content-version determinism, season separation, fixed build/mandate handoff, first-result locking, share text, challenge round-trip/tampering/season rejection, local attempt records, and Results isolation are tested. Browser QA reached Stage 1/5 from both the declared Daily configuration and a verified RM1 challenge. Consecutive-day return and real friend-to-friend challenge use remain post-deploy human measures.

**Primary files:** `src/engine/rng.ts`, `src/engine/dailyMandate.ts`, `src/engine/challengeSeed.ts`, `src/store/dailyStore.ts`, `src/store/challengeStore.ts`, `src/screens/CareerScreen.tsx`, and the Daily/Challenge share-card components.

**Effort:** 1-2 sessions. **Depends on:** M5 (small mandates), M4 (builds make comparison interesting).

---

## Sequencing

```
M0 ──► M0.5 ──► V1 ──┬──► M1 ──┐
                      ├──► M2 ──┼──► M4 ──► M5a ──► M5a.2 ──► M5b ──► M5c ──► M6
                      └──► M3 ──┘
```

- **M0 first, always.** Everything downstream stacks on trustworthy numbers, deterministic state, and safe saves.
- **M0.5 removes friction before feature work.** The game should not carry avoidable administration into every future mandate.
- **V1 proves the integrated loop.** Build one excellent Phase 5-7 slice containing the first narrow implementation of M1-M3, revise it, then expand those systems across the game.
- **M1, M2, and M3 can expand in parallel** after V1 establishes the pattern. Their content and systems must preserve its setup/payoff standard.
- **M4 before career scale.** Active builds give repeat runs a deliberate axis of variety.
- **M5 ships incrementally.** Persistence and the market first, honest short-run compression second, the collectible shelf third, persistent Beacon last.
- **M6 last.** Comparability and habit mechanics sit on a game already worth repeating and use versioned deterministic seeds.

A recommended cadence: ship and playtest after every milestone (build + lint + tests + browser QA + deploy, per Handoff guardrails). V1 is a mandatory playtest gate, and every M5 sub-release ships independently.

## Measures of Success (offline proxies — no telemetry)

Per run (playtest observation):
- First meaningful decision < 30s; first visible consequence < 60s (Handoff targets, carried over).
- Measure median time and clicks between meaningful decisions; ordinary play never exceeds two consecutive no-choice advances (M0.5).
- Track administrative actions removed or batched; reductions must not remove strategic choice.
- ≥90% of meaningful advances expose real forward pull; no filler events are scheduled solely to satisfy the metric (M1).
- Track teaser payoff rate: players should recognise what prior signal an event resolves.
- Majority of trust/chemistry deltas caused by player decisions about people (M2).
- Every featured relationship arc contains a remembered setup and visible payoff (M2).
- Track offer-reveal completion/skip rate and ask players to explain the major drivers of the offer (M3).
- Run hundreds of fixed seeds per archetype/fee structure; no build dominates close rate, EV, and relationship quality together (M4).
- First-run close rate stays ~65-75% — compulsion must not come from difficulty collapse.
- Save migration and seeded replay tests pass across supported content versions (M0/M6).

Across runs:
- Playtesters start a second mandate within five minutes of finishing the first (M5).
- Short mandates land near 15-20 minutes, mid mandates near 40 minutes, and flagship runs retain their deliberate long form.
- Players perceive the three initial short mandates as different stories and decision problems, not reskins.
- Consecutive-day returns in the playtest group (M6).
- Players can name their build and their rival unprompted (M4/M5).
- Players can explain why an offer, reputation unlock, or rival outcome occurred without consulting the code.

## Explicitly Out of Scope

- Audio/SFX layer (worth doing, separate track — biggest single juice multiplier after M3).
- Multiplayer, real-time features, server infrastructure (daily seed is client-side date math).
- Monetization mechanics of any kind.
- Mobile-native app (mobile web must keep working; it does as of Fluidity v2).
- Procedural mandate generation before three handcrafted short mandates prove the content model.
- Permanent career power that trivialises earlier deals, streak loss, or punitive reputation grind.

## Delivery Guardrails (inherited from Handoff.md)

- Until M0 source/build hygiene is complete, edit `.tsx/.ts` as source of truth; compiled `.js/.d.ts` artifacts are committed and Vite resolves them **ahead of** `.tsx` — run `npx tsc -b` (or `npm run build`) before any browser verification. M0 must remove this shadowing risk rather than normalise it indefinitely.
- Keep Vite base `/therainmaker/`; game UI copy stays English.
- Before each deploy: `git status --short` clean, build, lint, tests, browser QA on desktop + mobile, then `npm run deploy` and verify the public URL.
- Every state-changing system emits a named causal record in development mode; every seeded bug report includes seed and content version.
- Every save format change increments the schema version and ships a migration test before deploy.
- Every content-heavy milestone proves one complete setup/payoff path before scaling the number of events.
