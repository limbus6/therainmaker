# The M&A Rainmaker - Canonical Implementation Spec v1

## 1. Purpose
This document defines the implementation baseline for the first playable build.
It resolves source conflicts, locks core schemas, and sets MVP boundaries.

## 2. Source Priority
Use sources in this order when conflicts appear:
1. `00_MA_Game_Documentation_Index.md` (project-level authority)
2. Numbered system docs `02` to `06`
3. `By Phase/MA_Game_PHASE_0.md` to `By Phase/MA_Game_PHASE_9.md`
4. Screen specs `10` to `20`
5. `Canonical_Systems_Spec_v1.md` (legacy but still useful reference)

## 3. Canonical Phase Model (Locked)
The implementation uses **10 phases, indexed 0 to 9**:
0. Deal Origination
1. Preparation
2. Market Outreach
3. Shortlist
4. NBOs
5. Due Diligence
6. Final Offers
7. SPA Negotiation
8. Signing
9. Closing

Notes:
- `By Phase/MA_Game_PHASE_10.md` is treated as legacy reference only.
- Any "11-phase" text remains historical and should not drive runtime IDs.

## 4. Canonical Data Contracts

### 4.1 Game State
```js
{
  meta: { version: "0.1.0", rngSeed: 123456789 },
  deal: { id: "deal_001", name: "Project Atlas", phaseId: 0, status: "lead" },
  clock: { week: 1 },
  resources: { budget: 150, maxCapacity: 60, usedCapacity: 0, pressure: 0 },
  team: { morale: 85 },
  variables: {
    leadHeat: 55,
    accessLevel: 20,
    dataVisibility: 10,
    competitivePressure: 15,
    confidentialityRisk: 20,
    fitScore: 50
  },
  workstreams: {
    targetIntelligence: { progress: 0, quality: 0 },
    relationshipDevelopment: { progress: 0, quality: 0 },
    qualification: { progress: 0, quality: 0 },
    valuationFraming: { progress: 0, quality: 0 },
    confidentialityConflicts: { progress: 0, quality: 0 },
    pitchReadiness: { progress: 0, quality: 0 }
  },
  deliverables: {
    teaser: { status: "empty", qualityTier: null, progress: 0 },
    im: { status: "empty", qualityTier: null, progress: 0 },
    model: { status: "empty", qualityTier: null, progress: 0 },
    buyerList: { status: "empty", qualityTier: null, progress: 0 },
    vdr: { status: "empty", qualityTier: null, progress: 0 }
  },
  buyers: [],
  riskDebt: 0,
  inbox: [],
  headlines: [],
  history: [],
  activeTasks: [],
  planning: { selectedTaskIds: [] },
  runtime: { lastResolvedTaskIds: [], lastEventIds: [], weeklySummary: null },
  ui: { selectedTaskId: null }
}
```

### 4.2 Action
```js
{
  id: "p0_founder_research",
  name: "Founder Research",
  category: "Information",
  phaseIds: [0],
  cost: 3,
  work: 6,
  complexity: "Medium", // Low | Medium | High
  hiddenWorkRange: [2, 5],
  effects: {
    variables: { dataVisibility: 8, fitScore: 3 },
    workstreams: { targetIntelligence: { progress: 12, quality: 8 } },
    team: { morale: -1 },
    riskDebt: 0
  }
}
```

### 4.3 Event
```js
{
  id: "ev_competing_advisor",
  phaseIds: [0],
  kind: "conditional", // scheduled | conditional
  title: "Competing Advisor Appears",
  text: "A rival advisor has started courting the founder.",
  baseProbability: 0.18,
  effects: { variables: { competitivePressure: 10, leadHeat: -4 } }
}
```

### 4.4 Buyer
```js
{
  id: "buyer_001",
  name: "ApexCloud Systems",
  type: "Strategic",
  shortlistState: "watch",
  visibleState: "No Reply",
  hiddenConviction: 55,
  scores: { strategicFit: 70, valuationPosture: 62, executionCredibility: 75 },
  riskFlags: []
}
```

### 4.5 Deliverable
```js
{
  id: "teaser",
  name: "Teaser",
  unlockPhaseId: 1,
  dependsOn: ["targetIntelligence", "qualification"],
  thresholds: { completeProgress: 60, solidQuality: 55, exceptionalQuality: 75 }
}
```

## 5. Weekly Resolution Order (Locked)
The engine must keep this order:
1. resolveQueuedTasks
2. applyCapacityConsumption
3. applyPressureEffects
4. triggerHiddenWorkload
5. triggerScheduledEvents
6. triggerConditionalEvents
7. updateDeliverables
8. updateWorkstreams
9. updateBuyerStates
10. updateRiskDebt
11. updateResources
12. generateMessages
13. generateHeadlines
14. checkPhaseTransition
15. pushWeeklySummary
16. advanceClock

## 6. MVP Scope (First Playable)
Included:
- Engine: resource model, pressure, hidden workload, event triggers, phase gate check
- Phases: full Phase 0, partial Phase 1
- Screens: Dashboard shell, Inbox, Tasks/Workstreams, Progression summary strip
- Save/Load: `localStorage`
- Deterministic RNG: seedable, state-persisted

Deferred:
- Full Phases 2 to 9 implementation
- Full Buyers/Deliverables/Risks/Timeline detailed UI modes
- Advanced balancing layer and large content pools

## 7. Exit Criteria for Sprint 1
1. A new game can be started and advanced week by week.
2. Tasks consume budget and capacity and apply effects.
3. Hidden workload and events can fire.
4. Weekly summary is generated and stored.
5. State survives reload through save/load.
6. Phase transition from 0 to 1 is possible via gate logic.
