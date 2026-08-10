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
- **Never leave the player in a closed state.** Every advance ends with at least one open question.
- **Randomness creates variation, never invalidates play.** Variance lives in events with narrative, not in silent ticks.
- **Premium retention only.** Mastery + variety + collection. No timers, no streak punishment, no dark patterns — an offline premium sim cannot sustain them and doesn't need them.
- **Preserve the retro corporate noir identity and English-only game copy.**
- **The deal is people.** Ricardo, the buyers, and the rival are characters first, stat containers second.

---

## M0 — Trust the Numbers (foundation hygiene)

*The prerequisite for everything: visible numbers must be believable before more systems are stacked on them.*

**Scope**
- Remove `applyResourceNoise` drift from routine advances. Move variance into named events via the Event Director (which already supports tension-weighted draws). A delta labeled "Steady execution" must never be random noise.
- Integer resources everywhere (fix e.g. `Capacity 98.72%`). Round at the engine boundary, not in the UI.
- Honest decision labels: `respondToEmail` currently applies ±25% hidden variance to promised effects. Either show ranges ("+1 to +3 trust") or remove the variance. Promising "+2" and delivering "+1" reads as the game lying.
- Advance pacing transparency: the `~Nd` preview is computed from invisible rules (urgent email → 1d, task complexity → 1-3d, idle → 7d). Surface a one-line reason next to the CTA: *"Urgent reply pending — advancing to tomorrow."*

**Structural item (may split into its own session):** derive `dealMomentum` instead of storing it. Compute from task currency, active buyer count/interest, trust, and unresolved threats. Eliminates the "why did momentum drop?" class of confusion and removes the last god-stat.

**Exit criteria:** every delta chip in the tape has a concrete cause; no fractional values anywhere in the UI; option labels match applied effects; the Advance CTA explains its own pace.

**Primary files:** `src/engine/weekEngine.ts` (noise, momentum), `src/store/gameStore.ts` (respondToEmail, daysPreview), `src/engine/resourceDeltas.ts`, `src/screens/DashboardScreen.tsx`.

**Effort:** 1 session (momentum derivation: +1 session).

---

## M1 — The Cliffhanger Engine (one more turn)

*The Civilization rule: never let the player stop at a closed state. Cheapest milestone, highest moment-to-moment impact.*

**Scope**
- **Telegraph system on the tape.** The Event Director already supports chains (`signal → escalation → decision → consequence`). Expose the signal step as a teaser at the end of each turn's tape: *"Tomorrow: Schneider's IC meets on your proposal."*
- **Open-question guarantee.** The director ensures every advance ends with ≥1 visible pending hook (telegraphed event, expected email, approaching deadline, buyer decision due). If nothing is pending, it schedules a low-stakes signal.
- **End-of-phase cliffhangers.** The phase transition overlay already carries entry narrative; add an exit beat that frames the next phase as a question, not a summary.
- Teaser data model: `UpcomingBeat { id, dueDay, label, source }` stored alongside `eventDirectorState`, rendered in TurnTape and Timeline.

**Exit criteria:** ≥90% of advances end with a visible hook in playtests; players report advancing "to find out" rather than "to process".

**Primary files:** `src/engine/eventDirector.ts`, `src/engine/weekEngine.ts`, `src/components/TurnTape.tsx`, `src/components/PhaseTransitionOverlay.tsx`.

**Effort:** 1-2 sessions. **Depends on:** M0 (hooks must be trustworthy).

---

## M2 — People, Not Panels (the emotional core)

*The game's best data — "wife is pressuring him to retire; he is burned out but won't admit it" — currently lives in tooltips. Put it in the loop.*

**Scope**
- **Founder check-ins.** Periodic decision cards (reusing `DeskDecisionCard`) with Ricardo, whose emotional state is *derived* from deal state (momentum, phase pressure, days since last personal contact, recent setbacks). An anxious Ricardo in Phase 6 threatening to take the first offer is a systems-driven story beat, not a scripted email. Trust changes should predominantly flow through these interactions.
- **Buyers as characters.** Buyers already carry `chemistryWithSeller`, `executionCredibility`, `ddFriction`, `politicalSensitivity` — and these already feed the endgame. Add one relationship decision per active buyer per mid-game phase (3-6): the high-friction buyer demanding exclusive access, the strategic wanting direct founder contact, the PE fund probing your process discipline. Decisions move the attributes that decide the final offers.
- **Rival advisor as a character.** Beacon Partners stops being a one-off event and becomes a named recurring presence within the run (steals a buyer you neglect, pitches Ricardo when trust dips). This seeds M5's persistent antagonist.

**Exit criteria:** in a full run, the majority of trust/chemistry movement comes from decisions the player made about people; playtesters can name Ricardo's arc and at least two buyer personalities unprompted.

**Primary files:** `src/components/DeskDecisionCard.tsx` (generalize sources), `src/engine/weekEngine.ts`, `src/content/*` (decision content), `src/types/game.ts` (founder state, buyer decision types).

**Effort:** 2-3 sessions. **Depends on:** M0; benefits from M1 (check-ins can be telegraphed).

---

## M3 — The Reveal (offer ceremony)

*NBOs and final offers are this game's loot boxes — variable rewards currently delivered as list rows. Stage them.*

**Scope**
- **Offer reveal sequence:** offers arrive as sealed envelopes on the desk; opened one at a time with a pause, value counting up (GSAP counter exists), structure/conditions revealed line by line, Ricardo's reaction, one line of market chatter. Skippable, `prefers-reduced-motion` respected.
- Same ceremonial treatment for the three other apex moments: IC board decision (Phase 0), signing, and closing day wire.
- Offers arrive **over time** across the window (already partially supported by the deadline system) so each advance during offer season is a pull of the lever.

**Exit criteria:** playtesters describe an offer reveal as a highlight; offer moments are screenshotted/shared.

**Primary files:** new `src/components/OfferRevealOverlay.tsx`, `src/screens/FinalOffersScreen.tsx`, `src/engine/weekEngine.ts` (staggered arrival), `src/utils/motion.ts`.

**Effort:** 1-2 sessions. **Depends on:** M0. Independent of M1/M2 (can be parallelized).

---

## M4 — Builds (run identity)

*Runs must differ by player intent, not just dice.*

**Scope**
- **Fee structure as strategy.** The fee negotiation already exists as a strong minigame; make its outcome strategy-defining. Retainer-heavy = safe income, lower upside — supports a conservative, trust-focused playstyle. Aggressive ratchet = you only win big above a threshold EV — forces competitive-tension plays in phases 5-7. Scoring and career earnings (M5) flow through the chosen structure.
- **Advisor archetypes.** 3-4 picks at run start with asymmetric modifiers: *The Relationship Banker* (trust/chemistry bonuses, weaker modeling), *The Technician* (deliverable quality, slower outreach), *The Shark* (competitive tension, trust fragility). Modifiers touch existing systems only — no new mechanics required.
- **Run summary** on the results board names the build and shows style stats (decisions taken, risk profile, relationship index) so identity is legible in retrospect.

**Exit criteria:** two playtesters with different builds describe genuinely different runs; ratchet builds show measurably different phase 5-7 behavior.

**Primary files:** `src/components/FeeNegotiationModal.tsx`, `src/engine/resultsEngine.ts`, `src/store/gameStore.ts` (archetype state), new `src/content/archetypes.ts`, `src/screens/ResultsBoardScreen.tsx`.

**Effort:** 2 sessions. **Depends on:** M0 (scoring integrity); pairs naturally with M2.

---

## M5 — The Career (meta-layer, the destiny milestone)

*Without a meta-layer the Rainmaker is a good film; with one it's a game people come back to.*

**Scope**
- **Mandate market.** Between runs, choose the next mandate from a generated market: small deals (15-20 min, 4-5 phases compressed), mid deals (~40 min), and flagship 11-phase deals. Small mandates are the entry drug — nobody spontaneously replays 90 minutes, everybody accepts "one more small deal". Requires a phase-compression pass (reuse checkpoint/jump infrastructure).
- **Tombstone shelf.** Every closed deal mints a tombstone: company, buyer, EV, multiple, grade, date. Displayed as a collection shelf (the real M&A trophy, thematically perfect). Collapsed deals leave a permanent scar entry.
- **Persistent reputation** across mandates: gates access to bigger mandates, moves fee negotiation leverage, decays slightly on refused/failed deals.
- **Beacon Partners as persistent antagonist:** wins the mandates you decline or lose, maintains a parallel tombstone count, appears as rival bidder-advisor in flagship deals. Losing to a recurring name stings; beating them is the career's boss fight.
- **Save architecture:** career profile (`ma-rainmaker-career`) separate from run save; run save cleared per mandate, career never.

**Exit criteria:** a player finishes a mandate and immediately starts another; the shelf is the screen players show other people.

**Primary files:** new `src/store/careerStore.ts`, new `src/screens/CareerScreen.tsx` + `MandateMarketScreen.tsx`, `src/content/mandates.ts` (generation), `src/engine/resultsEngine.ts` (career scoring), `src/screens/LandingPage.tsx`.

**Effort:** 4-6 sessions (largest item; split into 5a market+compression, 5b tombstones+reputation, 5c antagonist). **Depends on:** M0-M4 (a career of runs is only as good as one run).

---

## M6 — The Habit (daily & comparability)

*Nearly free technically — the seeded RNG already exists — but only valuable once a run is worth repeating.*

**Scope**
- **Daily mandate:** one small mandate per day, same seed for everyone (`seed = f(date)`), fixed archetype rotation. Comparable outcomes.
- **Shareable result card:** score, grade, EV, multiple, build — as copyable text/emoji block (Wordle mechanism: comparability → conversation → daily return).
- **Personal bests & league:** career screen tracks best multiple, best EV, fastest close, per-mandate-size records.
- Optional: challenge seeds — share a seed string, friend plays the identical deal.

**Exit criteria:** internal playtest group returns on consecutive days unprompted.

**Primary files:** `src/engine/rng.ts` (date seeding), `src/screens/CareerScreen.tsx`, new share-card component.

**Effort:** 1-2 sessions. **Depends on:** M5 (small mandates), M4 (builds make comparison interesting).

---

## Sequencing

```
M0 ──► M1 ──► M2 ──┐
 │                 ├──► M4 ──► M5 ──► M6
 └──► M3 ──────────┘
```

- **M0 first, always.** Everything downstream stacks on trustworthy numbers.
- **M1 next** — cheapest, transforms moment-to-moment feel immediately.
- **M2 and M3 can run in parallel** across sessions (different files, different skills).
- **M4 before M5** — builds give the career its axis of variety.
- **M6 last** — habit mechanics on top of a game already worth the habit.

A recommended cadence: ship and playtest after every milestone (build + lint + tests + browser QA + deploy, per Handoff guardrails). M5 ships in three sub-releases.

## Measures of Success (offline proxies — no telemetry)

Per run (playtest observation):
- First meaningful decision < 30s; first visible consequence < 60s (Handoff targets, carried over).
- ≥90% of advances end with a visible open hook (M1).
- Majority of trust/chemistry deltas caused by player decisions about people (M2).
- First-run close rate stays ~65-75% — compulsion must not come from difficulty collapse.

Across runs:
- Playtesters start a second mandate in the same sitting (M5).
- Consecutive-day returns in the playtest group (M6).
- Players can name their build and their rival unprompted (M4/M5).

## Explicitly Out of Scope

- Audio/SFX layer (worth doing, separate track — biggest single juice multiplier after M3).
- Multiplayer, real-time features, server infrastructure (daily seed is client-side date math).
- Monetization mechanics of any kind.
- Mobile-native app (mobile web must keep working; it does as of Fluidity v2).

## Delivery Guardrails (inherited from Handoff.md)

- Edit `.tsx/.ts` as source of truth; compiled `.js/.d.ts` artifacts are committed and Vite resolves them **ahead of** `.tsx` — run `npx tsc -b` (or `npm run build`) before any browser verification.
- Keep Vite base `/therainmaker/`; game UI copy stays English.
- Before each deploy: `git status --short` clean, build, lint, tests, browser QA on desktop + mobile, then `npm run deploy` and verify the public URL.
