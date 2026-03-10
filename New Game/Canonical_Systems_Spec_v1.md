# The M&A Rainmaker — Canonical Systems Spec v1

## 1. Purpose

This document defines the canonical systems architecture for **The M&A Rainmaker**.

Its purpose is to establish a stable design and implementation foundation across:

* phase architecture
* core gameplay loop
* action system
* task system
* deliverables
* buyers
* events
* risk and outcome logic
* UI / UX shell
* state management for implementation in HTML, CSS and vanilla JavaScript

This file should be treated as the **master systems reference** for future content design and implementation.

---

## 2. Design Principles

### 2.1 Core fantasy

The player should feel like a high-performing M&A advisor managing a live sell-side process inside a professional environment.

The experience should convey:

* professional pressure
* imperfect information
* constant prioritisation
* interdependence between work quality and future outcomes
* live market dynamics
* consequences that accumulate over time

### 2.2 What the game is

The game is a hybrid of:

* simulation game
* management game
* inbox / decision game
* process execution game
* risk management game

### 2.3 What the game is not

The game is **not**:

* an action point tactics game
* a spreadsheet-only simulator
* a visual novel with superficial choices
* a project management skin with no emergent consequences

### 2.4 Design constraints

The game must remain:

* readable
* elegant
* stable in UI structure across phases
* data-driven
* implementable in vanilla JavaScript
* deep without becoming opaque to the point of boredom

---

## 3. Canonical Phase Architecture

## 3.1 Master phase list

The canonical phase structure is:

0. Deal Origination / Pitch Qualification
1. Preparation
2. Market Outreach
3. Shortlist
4. NBOs
5. Due Diligence
6. Final Offers
7. SPA Negotiation
8. Signing
9. Closing

## 3.2 Phase logic

### Phase 0 — Deal Origination / Pitch Qualification

Transform a lead into a qualified pitch opportunity and convert it into a mandate.

### Phase 1 — Preparation

Transform a signed mandate into a market-ready asset.

### Phase 2 — Market Outreach

Launch into market, contact buyers, manage initial engagement and confidentiality.

### Phase 3 — Shortlist

Filter the buyer universe into a serious shortlist and shape competitive dynamics.

### Phase 4 — NBOs

Collect and interpret first-round offers and select who proceeds.

### Phase 5 — Due Diligence

Manage buyer scrutiny, information flow, issue containment and process endurance.

### Phase 6 — Final Offers

Drive bidders to improved offers while balancing valuation and certainty.

### Phase 7 — SPA Negotiation

Negotiate legal and economic terms under exclusivity or near-final tension.

### Phase 8 — Signing

Convert agreed documents into a signed transaction.

### Phase 9 — Closing

Manage conditions precedent, interim risk, final coordination and closing certainty.

## 3.3 Signature mechanic by phase

Each phase should maintain the same UI shell but feel distinct through one dominant systems focus.

| Phase | Signature mechanic                         |
| ----- | ------------------------------------------ |
| 0     | Qualification under ambiguity              |
| 1     | Preparation under workload pressure        |
| 2     | Confidential outreach and market reception |
| 3     | Funnel shaping and buyer filtering         |
| 4     | Price vs fit interpretation                |
| 5     | Scrutiny endurance and issue containment   |
| 6     | Competitive tension vs certainty           |
| 7     | Legal erosion and negotiation trade-offs   |
| 8     | Coordination discipline                    |
| 9     | Closing certainty under residual risk      |

---

## 4. Canonical Weekly Game Loop

## 4.1 Week structure

Each game week is divided into two logical stages:

1. **Planning**
2. **Resolution**

### Planning

The player:

* reads inbox and messages
* reviews headlines and market context
* checks deliverables and workstreams
* allocates team capacity
* chooses actions
* responds to decisions and requests
* escalates or defers priorities

### Resolution

The engine:

* converts actions into tasks and consequences
* consumes work and budget
* applies pressure effects
* resolves hidden workload
* advances deliverables
* updates buyers
* triggers events
* updates risk debt
* checks phase gates
* generates summary logs, emails and new requests

## 4.2 Weekly loop formula

```text
Inbox / Context Review
→ Player Choices
→ Task Generation
→ Capacity Allocation
→ Work Resolution
→ Hidden Work Resolution
→ Event Resolution
→ Deliverable / Buyer / Risk Update
→ Weekly Summary
→ Phase Gate Check
```

## 4.3 Why this matters

This structure keeps:

* the UI stable
* the player rhythm understandable
* the simulation layered but controlled
* implementation manageable in vanilla JS

---

## 5. Core Resource Model

The player is not limited by action points.

The player is constrained by:

1. **Budget**
2. **Team Capacity**

## 5.1 Budget

Budget represents available process spend and internal execution autonomy.

Budget is used for:

* advisors and specialists
* outsourced work
* market mapping
* vendor DD support
* legal support
* premium analysis
* process acceleration actions
* selective quality upgrades

## 5.2 Team Capacity

Team capacity represents how much work the internal team can absorb in a week.

Capacity should be modelled numerically and can vary based on:

* team size
* seniority mix
* morale
* fatigue
* parallel workstreams
* temporary reinforcements
* unexpected disruptions

## 5.3 Work

Every action and task consumes **work**.

Work is the primary operational load variable.

## 5.4 Core action cost structure

Every action must specify:

* cost
* work
* complexity
* visible effects

Some actions also create:

* hidden workload
* event chains
* task cascades
* risk debt
* buyer reactions

---

## 6. Pressure System

## 6.1 Definition

Pressure is the ratio between workload demand and available team capacity.

```text
Pressure = Workload Demand / Team Capacity
```

## 6.2 Pressure bands

Use four pressure zones.

| Pressure          | Zone     | Meaning             |
| ----------------- | -------- | ------------------- |
| ≤ 0.85            | Healthy  | Team has buffer     |
| > 0.85 and ≤ 1.00 | Tight    | Team near full load |
| > 1.00 and ≤ 1.20 | Strained | Overload begins     |
| > 1.20            | Critical | Sustained overload  |

## 6.3 Pressure effects

### Healthy

* no penalty
* slight positive morale drift possible
* lower secondary risk

### Tight

* minor increase in review friction
* small chance of stalled progress on lower-priority tasks

### Strained

* hidden workload multiplier increases
* delay chance increases
* morale declines slightly
* deliverable quality improvement becomes harder

### Critical

* hidden workload multiplier increases sharply
* errors more likely
* delays more likely
* morale drops materially
* some completed work may reopen
* more team stress events

## 6.4 Design rule

Pressure should never hard-stop play.

The player may choose to overwork the team, but the system should make that expensive over time.

This is essential because the fantasy is not “perfect efficiency”. It is “managing a demanding live process under professional pressure”.

---

## 7. Complexity and Hidden Workload

## 7.1 Complexity levels

The player sees only:

* Low
* Medium
* High

Internal hidden workload probabilities are:

* Low → 10%
* Medium → 30%
* High → 50%

## 7.2 Hidden workload meaning

Hidden workload represents:

* revisions
* clarifications
* inconsistencies
* rework
* additional requests
* quality review comments
* management questions
* buyer follow-up
* diligence expansion

## 7.3 Hidden workload behaviour

When triggered, hidden workload should generate additional work inside a configured range.

Example:

```js
hiddenWorkRange: [2, 6]
```

This should usually:

* add tasks
* reopen existing deliverables
* create timing pressure
* increase probability of future friction

## 7.4 Pressure interaction

Hidden workload probability should be modified by pressure.

Example rule:

```text
Healthy: x1.00
Tight: x1.05
Strained: x1.25
Critical: x1.50
```

## 7.5 Visibility rule

The player must never see explicit hidden workload probabilities.

The player should infer them through play from:

* action complexity labels
* team pressure
* historical patterns
* message tone and warnings

This preserves professional uncertainty.

---

## 8. Core Object Model

The game should be built around a small number of persistent object families.

## 8.1 Primary object families

* Deal State
* Actions
* Tasks
* Deliverables
* Workstreams
* Buyers
* Stakeholders
* Messages
* Events
* Headlines
* Team
* Risk Debt

---

## 9. Canonical Deal State Schema

The master deal state can be represented as a plain JavaScript object.

```js
const gameState = {
  meta: {
    saveVersion: 1,
    runId: "deal_001"
  },
  clock: {
    week: 1,
    phaseWeek: 1,
    phase: 0
  },
  deal: {
    name: "Project Atlas",
    sector: "Software",
    geography: "Portugal",
    sizeBand: "mid_market",
    sellSideMandateSigned: false,
    status: "active"
  },
  resources: {
    budget: 100,
    spent: 0,
    capacityBase: 20,
    capacityAvailable: 20,
    morale: 75,
    fatigue: 10
  },
  processDesign: {
    strategy: null,
    confidentialityModifier: 0,
    tensionModifier: 0,
    certaintyModifier: 0,
    buyerUniverseModifier: 0,
    timelineModifier: 0
  },
  team: {
    members: [],
    reinforcements: [],
    assignments: []
  },
  deliverables: [],
  workstreams: [],
  buyers: [],
  stakeholders: [],
  tasks: [],
  messages: [],
  headlines: [],
  events: [],
  logs: [],
  riskDebt: {
    analytical: 0,
    narrative: 0,
    process: 0
  },
  flags: {
    teaserReady: false,
    imReady: false,
    dataRoomReady: false,
    shortlistLocked: false,
    exclusivityGranted: false,
    signingAchieved: false,
    closingAchieved: false
  },
  score: {
    reputation: 0,
    clientTrust: 0,
    buyerConfidence: 0,
    executionQuality: 0
  }
};
```

## 9.1 State design philosophy

Keep the state:

* explicit
* serialisable
* easy to save / load
* easy to inspect in development
* modular enough for future extension

No framework is required for this model.

---

## 10. Actions, Tasks and Resolution Logic

## 10.1 Actions

Actions are what the player chooses.

They should be declarative entries in an action library.

Example:

```js
{
  id: "prep_build_im_v1",
  name: "Draft Information Memorandum v1",
  category: "deliverable",
  phase: 1,
  cost: 4,
  work: 6,
  complexity: "medium",
  hiddenWorkProbability: 0.30,
  hiddenWorkRange: [2, 5],
  effects: {
    createTask: "task_im_v1",
    deliverableProgress: { target: "im", amount: 20 },
    narrativeRiskDelta: -1
  }
}
```

## 10.2 Tasks

Tasks are operational work units produced by actions, events or system consequences.

Tasks should contain:

* owner
* required work
* due timing
* priority
* linked deliverable
* reopen status
* quality sensitivity

Example:

```js
{
  id: "task_im_v1",
  type: "deliverable_work",
  deliverableId: "im",
  status: "open",
  workRemaining: 6,
  priority: "high",
  dueInWeeks: 2,
  qualitySensitivity: "high",
  reopenCount: 0
}
```

## 10.3 Design rule

Actions should rarely modify the world directly.

Preferred logic:

* action selected
* task created or updated
* weekly resolution engine processes task
* resulting state changes applied

This keeps causality clean and easier to debug.

---

## 11. Deliverable System

## 11.1 Deliverables are persistent objects

Deliverables must not be decorative progress bars.

They are core simulation objects whose quality affects later phases.

## 11.2 Canonical deliverable schema

```js
{
  id: "im",
  type: "information_memorandum",
  name: "Information Memorandum",
  status: "not_started",
  completion: 0,
  qualityTier: "basic",
  qualityScore: 0,
  owner: "team",
  dependencies: ["teaser", "financial_model"],
  commentCount: 0,
  openIssues: [],
  history: [],
  downstreamEffects: {
    buyerInterest: 0,
    buyerTrust: 0,
    diligenceResilience: 0,
    valuationSupport: 0
  }
}
```

## 11.3 Quality tiers

Each major deliverable has three quality tiers:

* Basic
* Solid
* Exceptional

## 11.4 Quality logic

Quality should depend on:

* cumulative work invested
* team pressure during execution
* hidden workload handled or ignored
* relevant team mix
* supporting inputs quality
* whether the deliverable was rushed

## 11.5 Important rule

Completion and quality are different.

A deliverable may be:

* complete but weak
* delayed but ultimately strong
* complete and later reopened

This distinction is vital for realistic gameplay.

## 11.6 Core deliverables by early phases

### Phase 0

* pitch deck
* qualification memo
* internal opportunity note

### Phase 1

* teaser
* information memorandum
* financial model
* buyer long list
* data room
* management Q&A prep
* process plan

### Later phases

* indications tracker
* shortlist rationale
* diligence tracker
* Q&A pack
* vendor DD support packs
* final offer comparison grid
* SPA issues list
* CP tracker

---

## 12. Workstream System

## 12.1 Purpose

Workstreams are broader execution tracks that allow the player to understand where the process is strong or weak without reading every task.

## 12.2 Suggested canonical workstreams

* Client Management
* Team Management
* Process Design
* Financial Analysis
* Materials Preparation
* Buyer Coverage
* Diligence Management
* Negotiation Management
* Legal / Documentation
* Closing Coordination

## 12.3 Workstream properties

Each workstream should track:

* progress
* health
* pressure exposure
* risk contribution
* recent issues

Example:

```js
{
  id: "financial_analysis",
  progress: 45,
  health: 68,
  pressureExposure: 0.9,
  recentIssues: 1,
  linkedDeliverables: ["financial_model"],
  riskContribution: {
    analytical: 3,
    narrative: 0,
    process: 0
  }
}
```

## 12.4 Why use workstreams

Workstreams help the UI stay elegant.

The player sees a small number of stable process lanes rather than a chaotic task wall.

---

## 13. Buyer System

## 13.1 Buyers are persistent simulation actors

Buyers must have memory, preferences and behavioural differences.

## 13.2 Canonical buyer schema

```js
{
  id: "buyer_01",
  name: "NorthBridge Capital",
  type: "pe",
  active: true,
  status: "screening",
  interest: 45,
  conviction: 30,
  processFit: 50,
  pricingBias: 55,
  speed: 60,
  certainty: 40,
  diligenceAggressiveness: 70,
  confidentialitySensitivity: 65,
  relationshipWarmth: 20,
  fatigue: 0,
  notes: [],
  bidHistory: []
}
```

## 13.3 Key buyer attributes

* **Interest**: how attracted they are initially
* **Conviction**: how strongly they believe in the asset
* **Process Fit**: how well they suit the chosen process design
* **Pricing Bias**: how likely they are to pay up
* **Speed**: how quickly they move
* **Certainty**: how likely they are to sign and close cleanly
* **Diligence Aggressiveness**: how invasive they are in DD
* **Confidentiality Sensitivity**: how much leak risk matters
* **Relationship Warmth**: how well the interaction has been handled

## 13.4 Buyer evolution

Buyer attributes should change based on:

* process design
* quality of teaser / IM / model
* speed of Q&A
* data room quality
* market context
* direct interactions
* negative events
* exclusivity dynamics

## 13.5 Design rule

Offers should emerge from buyer state, not from arbitrary scripts.

This is one of the main levers of replayability.

---

## 14. Process Design Decision

## 14.1 Canonical decision

During Preparation, the player must choose one of:

* Broad Auction
* Targeted Auction
* Pre-emptive Strategy

## 14.2 Why it must be persistent

This is not a cosmetic choice.

It must influence later systems across multiple phases.

## 14.3 Suggested systemic effects

### Broad Auction

* larger buyer universe
* higher competitive tension
* higher confidentiality exposure
* lower certainty per buyer
* more process admin workload

### Targeted Auction

* smaller buyer universe
* more controlled process
* better confidentiality
* moderate tension
* better average buyer fit

### Pre-emptive Strategy

* very limited buyer count
* higher speed and certainty potential
* lower competitive tension
* lower admin load
* higher dependence on one relationship and one offer dynamic

## 14.4 Canonical state representation

```js
processDesign: {
  strategy: "broad_auction",
  confidentialityModifier: 15,
  tensionModifier: 20,
  certaintyModifier: -5,
  buyerUniverseModifier: 25,
  timelineModifier: 5
}
```

## 14.5 Design rule

The process design choice should shape:

* buyer generation
* leak event probabilities
* workload intensity in outreach and diligence
* pricing outcomes
* certainty outcomes
* final narrative of the deal

---

## 15. Risk Debt System

## 15.1 Purpose

Risk Debt is the hidden memory of compromised process quality.

It captures things the player has postponed, rushed, oversold or neglected.

## 15.2 Canonical categories

Use three hidden buckets:

* Analytical Risk Debt
* Narrative Risk Debt
* Process Risk Debt

## 15.3 Meanings

### Analytical Risk Debt

Created by:

* weak model work
* poor data validation
* inconsistencies in numbers
* incomplete data room structure
* unresolved analytical questions

Likely to hurt:

* diligence
* final offers
* legal / price adjustments

### Narrative Risk Debt

Created by:

* exaggerated equity story
* weak market positioning
* overstated growth narrative
* inconsistent messaging
* client overpromising

Likely to hurt:

* buyer trust
* management sessions
* valuation support
* negotiation credibility

### Process Risk Debt

Created by:

* poor targeting
* bad pacing
* rushed launch
* weak shortlist logic
* process leaks
* poor stakeholder coordination

Likely to hurt:

* competitive tension
* certainty
* bidder retention
* signing / closing stability

## 15.4 Design rule

Risk Debt should remain hidden from the player as a numeric system.

The player should experience it through consequences.

## 15.5 Phase sensitivity mapping

| Phase | Main risk debt exposure        |
| ----- | ------------------------------ |
| 0     | Narrative, Process             |
| 1     | Analytical, Narrative, Process |
| 2     | Process                        |
| 3     | Process, Narrative             |
| 4     | Narrative, Process             |
| 5     | Analytical, Process            |
| 6     | Analytical, Narrative          |
| 7     | Analytical, Narrative          |
| 8     | Process                        |
| 9     | Process, Analytical            |

---

## 16. Message and Inbox System

## 16.1 Inbox is a core interface pillar

The inbox is not flavour text. It is one of the main delivery channels for:

* requests
* decisions
* warnings
* commentary
* approvals
* friction
* ambiguity
* status updates

## 16.2 Message types

Suggested types:

* Client Email
* Internal Team Note
* Buyer Message
* Legal Update
* Market Headline
* Weekly Summary
* Urgent Escalation
* Deliverable Review

## 16.3 Message roles

Messages should:

* create decisions
* create tasks
* reveal consequences
* change priorities
* reinforce atmosphere
* pace the simulation

## 16.4 Design rule

Only a minority of messages should demand action.

Too many urgent prompts will destroy the professional elegance of the UI.

---

## 17. Event System

## 17.1 Event classes

Events should be generated from a combination of:

* phase context
* player choices
* buyer states
* pressure level
* risk debt
* deliverable quality
* random variance within bounded ranges

## 17.2 Suggested event classes

* Team events
* Client events
* Buyer events
* Market events
* Process events
* Deliverable events
* Legal events

## 17.3 Event design rule

Events should feel causally plausible.

They must not feel like arbitrary punishment from a spiteful spreadsheet goblin.

## 17.4 Event source mix

A healthy balance is:

* some deterministic consequences
* some probabilistic consequences modified by current state
* a small amount of pure variance for texture

---

## 18. Phase Gates and Progression

## 18.1 Phase gates should not be purely time-based

Advancing to the next phase should require a combination of:

* minimum deliverable readiness
* enough buyer / process state
* key decisions made
* no unresolved blocking issues

## 18.2 Gate examples

### Phase 0 → Phase 1

* mandate signed
* opportunity sufficiently qualified

### Phase 1 → Phase 2

* teaser ready
* IM at least usable
* buyer universe prepared
* process design chosen
* data room minimum readiness met

### Phase 2 → Phase 3

* sufficient buyer coverage achieved
* NDA / early engagement threshold met

### Phase 3 → Phase 4

* shortlist formed
* enough engaged buyers remain

### Phase 4 → Phase 5

* NBOs received
* shortlist / next-round decision made

### Phase 5 → Phase 6

* DD sufficiently progressed
* major issues contained enough for final bids

### Phase 6 → Phase 7

* final offer selected or exclusivity granted

### Phase 7 → Phase 8

* SPA sufficiently agreed

### Phase 8 → Phase 9

* signing achieved

### Phase 9 → End

* CPs satisfied
* closing achieved

## 18.3 Design rule

Phase progression should feel earned, not automatic.

---

## 19. UI / UX Shell Rules

## 19.1 Stable shell

The interface should remain structurally stable across phases.

Canonical layout:

* **Top bar**: deal state, phase, week, budget, capacity, pressure, major alerts
* **Left panel**: inbox / messages / email list
* **Center panel**: actions, deliverables, decisions, active tasks
* **Right panel**: headlines, buyer context, market signals, workstream summary
* **Bottom layer or overlay**: weekly summary, phase report, logs, outcome review

## 19.2 Design objective

The player should feel grounded in one professional workspace that evolves in content, not one that radically changes shape every phase.

## 19.3 Information hierarchy

Always prioritise:

1. what needs attention now
2. what is drifting into risk
3. what is progressing well
4. what broader context is changing

## 19.4 Minimalism rule

Not everything deserves a notification.

Urgency should be used sparingly.

The UI should feel calm even when the underlying systems are tense.

That contrast is part of the fantasy.

---

## 20. Resolution Engine Order

The weekly resolution engine should run in a fixed order.

## 20.1 Canonical order

```js
function runWeekResolution(state) {
  resolveQueuedTasks(state);
  applyCapacityConsumption(state);
  applyPressureEffects(state);
  triggerHiddenWorkload(state);
  triggerScheduledEvents(state);
  triggerConditionalEvents(state);
  updateDeliverables(state);
  updateWorkstreams(state);
  updateBuyerStates(state);
  updateRiskDebt(state);
  updateResources(state);
  generateMessages(state);
  generateHeadlines(state);
  checkPhaseTransition(state);
  pushWeeklySummary(state);
  advanceClock(state);
  return state;
}
```

## 20.2 Why fixed order matters

A fixed order ensures:

* predictable debugging
* easier balancing
* reproducible state evolution
* cleaner separation of causes and consequences

---

## 21. Vanilla JavaScript Implementation Architecture

## 21.1 Recommended file structure

```text
/src
  index.html
  /css
    styles.css
    layout.css
    components.css
  /js
    game-state.js
    phase-definitions.js
    action-library.js
    event-library.js
    buyer-library.js
    deliverable-library.js
    resolution-engine.js
    ui-renderers.js
    ui-actions.js
    save-system.js
    helpers.js
```

## 21.2 Implementation philosophy

Use:

* plain objects
* arrays
* pure utility functions where possible
* simple render functions
* event listeners bound to DOM actions

Avoid premature complexity.

No framework is necessary for v1.

## 21.3 Rendering strategy

Recommended approach:

* central `gameState`
* user action mutates state through controlled functions
* resolution engine processes turn
* render functions redraw relevant UI sections

Example:

```js
function renderApp(state) {
  renderTopBar(state);
  renderInbox(state);
  renderCenterPanel(state);
  renderRightPanel(state);
  renderBottomLayer(state);
}
```

## 21.4 Save / load

Because the state is serialisable, save / load can be handled with:

* `localStorage` for prototype stage
* JSON import / export for debug and balancing

---

## 22. Balancing Rules for v1

## 22.1 Early balancing goals

The player should often feel:

* stretched but not helpless
* capable but not omnipotent
* able to recover from mistakes, but not from all mistakes equally

## 22.2 Healthy v1 balancing profile

* early phases teach workload and quality trade-offs
* mid phases expose accumulated weaknesses
* late phases reward coherent preparation
* no single action should guarantee victory
* no single bad week should usually kill the process outright
* combinations of weaknesses should be dangerous

## 22.3 Replayability levers

Replayability should come from:

* different buyer mixes
* different event sequences
* different hidden workload outcomes
* different process design choices
* different pressure histories
* different risk debt profiles

---

## 23. Canonical Design Rules Summary

These rules should govern all future content design.

1. The UI shell remains stable across phases.
2. The player is constrained by budget and capacity, not action points.
3. Complexity is visible, hidden workload probabilities are not.
4. Pressure can be exceeded, but at escalating cost.
5. Actions should mostly generate tasks, not directly rewrite the world.
6. Deliverables are persistent objects with quality and downstream consequences.
7. Buyers are persistent actors with evolving state.
8. Process design is a persistent strategic choice.
9. Risk debt accumulates invisibly and manifests later.
10. Events should be state-driven, not arbitrary.
11. Phase progression should depend on gates, not just time.
12. Completion and quality must remain distinct variables.
13. The game should feel professional, elegant and alive.
14. Depth should mostly live in systems, not in UI clutter.
15. All new content should map cleanly to this architecture.

---

## 24. Immediate Next Design Documents

After this canonical systems spec, the recommended next documents are:

1. **Canonical Data Schemas v1**
   Detailed schemas for actions, tasks, buyers, deliverables, events and messages.

2. **Phase 2 Systems Spec**
   Full design for Market Outreach using this canonical architecture.

3. **Buyer Behaviour Framework v1**
   Rules for buyer generation, scoring, progression and offer logic.

4. **Deliverable Quality Framework v1**
   How quality is produced, measured and translated into outcomes.

5. **Resolution Engine Rules Matrix v1**
   Precise formulas and state transitions for weekly simulation.

---

## 25. Final Note

This document is intended to stop fragmentation.

Whenever a future design proposal conflicts with this spec, the proposal should either:

* be revised to fit the spec, or
* explicitly justify why the canonical architecture itself should be updated

That discipline matters.

Without it, the game risks becoming a pile of clever mechanics wearing the tie of an M&A process.

With it, **The M&A Rainmaker** can become a coherent professional simulation with real texture, replayability and implementation discipline.
