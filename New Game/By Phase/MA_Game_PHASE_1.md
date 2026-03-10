# M&A Dealmaker — Phase 1 Implementation Pack
## Preparation
## Compatible with HTML, CSS and Vanilla JavaScript

## Purpose
This document turns **Phase 1 — Preparation** into an implementable game system. 
It is designed to be sufficiently concrete for direct implementation in HTML, CSS, and vanilla JavaScript using procedural state updates.

The goal of this phase is to answer the question:
“How do we convert a signed mandate into a credible, market-ready process?”

At this stage:
- the company is now a formal client
- the market has NOT yet been contacted
- buyer communications have not started
- the advisor is preparing the process foundations
- deliverables, narrative and process design are being built
- team workload increases sharply
- resource allocation becomes critical

This phase should feel like a mixture of intense execution, heavy deliverable production, and building a foundation that will withstand rigorous buyer scrutiny later on.

---

# 1. Operational Purpose of Phase 1
Phase 1 exists to translate the raw messy reality of a client's business into a structured, highly valuable "asset" that can be sold.

It requires the advisory team to dig into the financials, operational metrics, and management assertions to build a watertight Equity Story. It is the phase where all marketing materials are created and the strategic path to market is chosen. Crucially, the market must not be approached until the firm is completely ready—once confidentiality is lifted, the asset's value drops rapidly if execution is sloppy.

# 2. Phase 1 Core Player Experience
The intended player feeling during Phase 1 should emphasize:
- **There is real work to do now**: The abstract pitch is won; reality hits.
- **We are under time pressure**: The market window might close or the founder might get impatient.
- **The team can become overloaded**: Heavy analytical and drafting tasks will max out small teams.
- **Underpreparation creates fragility**: If we underprepare, later phases (like Due Diligence) become significantly weaker.
- **Overspending damages optionality**: If we burn too much budget or burn out the team now, we lack the resources to survive the SPA negotiation phase.

# 3. Phase 1 Workstreams
Workstreams track the structural completion of the preparation process. Each workstream tracks both `progress` (how much work is done) and `quality` (how robust and crash-proof the work is).

## Information Collection
- **Measures**: Gathering historical financials, KPI metrics, cap tables, and legal structures.
- **Low progress means**: We cannot even begin drafting the Financial Model or IM.
- **Low quality means**: We relied on founder approximations instead of audited numbers.

## Financial Analysis
- **Measures**: The rigorous normalisation of EBITDA, working capital deep dives, and revenue quality tests.
- **Low progress means**: Valuation assertions have zero mathematical backing.
- **Low quality means**: Diligence algorithms will shred the financials in Phase 6, causing severe retrades.

## Equity Story Development
- **Measures**: Synthesizing the data into a compelling narrative of growth and strategic value.
- **Low progress means**: The asset appears as just another boring business.
- **Low quality means**: The narrative sounds like marketing fluff without strategic substance.

## Buyer Universe Design
- **Measures**: Identifying and tiering the exact strategic and PE buyers to contact.
- **Low progress means**: We have no one to send the Teaser to.
- **Low quality means**: We approach the wrong buyers, resulting in immediate rejections.

## Documentation Quality
- **Measures**: The actual drafting of the Teaser, Information Memorandum, and Process Letter.
- **Low progress means**: The marketing assets do not physically exist yet.
- **Low quality means**: Buyers will read a confusing, typo-ridden document and lose interest.

## Data Room Readiness
- **Measures**: Structuring the VDR (Virtual Data Room) folder index and uploading clean diligence files.
- **Low progress means**: If a buyer pre-empts with an early bid, we can't let them drop into diligence.
- **Low quality means**: Information is chaotic, breaching trust instantly upon DD access.

## Process Readiness
- **Measures**: The overarching meta-measurement of being ready to launch into Phase 2.
- **Low progress means**: We cannot hit the market launch button.
- **Low quality means**: The strategy is undefined, exposing the deal to massive execution risks.

---

# 4. Phase 1 Deal Variables
Dynamic deal variables track the atmospheric and numerical realities of the mandate.

* `preparationPressure`: Tracks how tightly timeline demands are crushing against team capacity. High pressure drives errors.
* `buyerInterestPotential`: The theoretical ceiling of how many buyers will engage. Driven heavily by the Equity Story.
* `valuationPotential`: The mathematical justification ceiling for the price. Driven by Financial Analysis quality.
* `clientAlignment`: How well the client understands and agrees with the current trajectory. If this drops, the client might fire the advisor.
* `dataQuality`: The underlying truthfulness and cleanliness of the client's internal reporting.
* `executionReadiness`: A single blended metric dictating how safely the deal can launch.
* `confidentialityExposure`: The risk that rumors of the deal leak to competitors before launch.

# 5. Firm-Level Variables Relevant to Phase 1
* `teamMorale`: Drops sharply if the team is forced to execute High Complexity tasks while under Critical Pressure.
* `teamWorkload`: Tracks the raw number of current Work Units assigned per week.
* `budget`: The firm's financial runway. Bringing in external accountants drains budget rapidly.
* `availableCapacity`: The mathematical ceiling of Work Units your current headcount can burn per week.
* `reputation`: High-quality deliverables executed on time increase firm reputation marginally.
* `marketSentiment`: An external macro variable that might shift the optimal Process Design choice (e.g. going Broad in a hot market).

---

# 6. Phase 1 Gates
To successfully complete Phase 1 and transition to Phase 2 (Market Outreach), the engine checks the following thresholds:

**Logical Conditions:**
* A Strategic Process Design choice has been locked in.
* Teaser and IM deliverables are marked as "Completed".
* `executionReadiness` >= 80

**Configurable Workstream Thresholds:**
* Documentation Quality.progress = 100
* Financial Analysis.progress >= 85
* Buyer Universe Design.progress >= 90

If the player chooses to manually override and launch the process with `executionReadiness` at 60, massive Risk Debt is generated.

---

# 7. Hard and Soft Dependencies
Tasks cannot execute out of order.

## 7.1 Hard Dependencies
* **Draft Information Memorandum**: Inherently requires `Information Collection.progress >= 60`. You cannot write without data.
* **Buyer Universe Design**: Requires `Equity Story Development.progress >= 50`. You cannot target buyers until you know what you are selling.
* **Launch Market Outreach (Phase Transition)**: Requires the Teaser deliverable to exist.

## 7.2 Soft Dependencies
* **High Preparation Pressure**: Activating heavy tasks while Pressure > 1.2 geometrically increases `Hidden Workload Probability`.
* **Low Client Alignment**: Drastically increases the likelihood that Deliverable QA tasks bounce back as "Client rejects draft".

---

# 8. Risk Debt in Phase 1
Risk Debt is the ultimate consequence for cutting corners during Preparation. This hidden variable accumulates invisibly and detonates in later phases.

* **Weak IM Quality**: Generates Risk Debt that detonates in Phase 4 (IM Distribution), causing immediate mass drop-offs.
* **Rushed Financial Model**: Generates massive Risk Debt that detonates in Phase 6 (Due Diligence) as a "Hidden Accounting Deficit Discovered" Event.
* **Poor Buyer Targeting**: Limits Phase 2 outreach, throttling the auction.
* **Over-Optimistic Narrative**: Creates a Valuation Gap that detonates in Phase 7 (SPA Negotiation) as an aggressive retrade.

---

# 9. Resource Model for Phase 1
Phase 1 operates on a unified strict two-layer economic model:
1. Determine what tasks are structurally necessary to advance Workstreams.
2. Determine how to fund and staff them using Budget & Team Capacity.

Every single task executed consumes a defined `Cost` (Euros derived from the baseline budget) and a defined `Work` (Bandwidth units drawn against the team's Weekly Capacity). Player over-allocation is allowed, but pushing `usedWork / availableCapacity > 1.0` triggers the Pressure algorithms resulting in forced errors and morale decay.

# 10. Pressure and Hidden Workload Model
Phase 1 introduces the **Hidden Workload** concept strongly. 
Because building an IM and a Financial Model requires sifting through messy reality, initial tasks often uncover chaotic data requiring deeper analysis.

**Probability Tiers based on Task Complexity:**
* **Low Complexity**: 10% chance to trigger hidden workload.
* **Medium Complexity**: 30% chance.
* **High Complexity**: 50% chance.

When playing a High Complexity task (e.g., *Revenue Quality Review*), there is a 50% chance the engine fires a cascade event such as: 
*"Client's revenue recognition policy violates structural accounting norms."* 
This event instantly subtracts -15 additional Work Units from the team and adds a new mandatory "Normalize Revenue Policy" task to the backlog.

Pressure (`WorkDemand / AvailableCapacity`) acts as a global multiplier on these base probabilities. If Pressure > 1.2, Hidden Workload probability scales violently.

---

# 11. Phase 1 Task Library
All these tasks are integrated into the central Action System schema.

## Information / Analysis Tasks
* **Collect Historical Financials**: (Work: 15, Cost: 2, Complexity: Low). Unlocks Financial Analysis.
* **Collect KPI Pack**: (Work: 10, Cost: 1, Complexity: Medium). 
* **Revenue Quality Review**: (Work: 30, Cost: 5, Complexity: High). Massive impact on `valuationPotential`. High risk of hidden workload.
* **Working Capital Review**: (Work: 25, Cost: 5, Complexity: High). Prevents SPA pegs from failing later.
* **Customer Analysis**: (Work: 20, Cost: 3, Complexity: Medium). 
* **Market Growth Analysis**: (Work: 15, Cost: 10, Complexity: Low). Often requires buying external data reports (higher Cost).
* **Competitor Mapping**: (Work: 10, Cost: 2, Complexity: Low).

## Narrative Tasks
* **Build Investment Thesis**: (Work: 20, Cost: 0, Complexity: High). Core driver of `Equity Story`.
* **Define Equity Story**: (Work: 25, Cost: 0, Complexity: High). 
* **Growth Narrative Draft**: (Work: 15, Cost: 0, Complexity: Medium). 
* **Strategic Buyer Angle**: (Work: 15, Cost: 0, Complexity: Medium).
* **Valuation Support Framing**: (Work: 25, Cost: 5, Complexity: High). 

## Deliverable Tasks
* **Draft Teaser**: (Work: 15, Cost: 0, Complexity: Low). Yields Deliverable: Teaser.
* **Draft Information Memorandum**: (Work: 60, Cost: 5, Complexity: High). The biggest task. Huge cascade potential. Yields Deliverable: IM.
* **Build Financial Model**: (Work: 50, Cost: 10, Complexity: High). Massive Risk generator if rushed. Yields Deliverable: Financial Model.
* **Prepare Management Presentation**: (Work: 30, Cost: 5, Complexity: Medium). 
* **Build Buyer FAQ**: (Work: 15, Cost: 0, Complexity: Low). 
* **Prepare Process Letter**: (Work: 10, Cost: 5, Complexity: Low). Legal drafting.
* **Prepare Data Room Structure**: (Work: 20, Cost: 5, Complexity: Medium). 
* **Upload Core Documents**: (Work: 15, Cost: 0, Complexity: Low). Tedious administrative drain.
* **Final Data Room Validation**: (Work: 10, Cost: 2, Complexity: Low). Generates huge Risk Debt if skipped.

## Buyer Universe Tasks
* **Map Strategic Buyers**: (Work: 15, Cost: 5, Complexity: Low). 
* **Map Private Equity Buyers**: (Work: 15, Cost: 5, Complexity: Low). 
* **International Buyer Scan**: (Work: 20, Cost: 15, Complexity: Medium). High budget requirement.
* **Prioritise Buyer Universe**: (Work: 10, Cost: 0, Complexity: Medium). 
* **Long List Review**: (Work: 10, Cost: 0, Complexity: Low). Required client touchpoint.

## Internal / Staffing / Review Tasks
* **Internal Kick-Off**: (Work: 5, Cost: 0, Complexity: Low). Boosts alignment.
* **Partner Review**: (Work: 10, Cost: 0, Complexity: High). High chance to trigger cascade revisions, but boosts Quality.
* **Deliverable Quality Review**: (Work: 10, Cost: 0, Complexity: Medium).
* **Add Temporary Analyst**: (Work: 0, Cost: 25, Complexity: Low). Increases Team Capacity globally but burns massive Budget.
* **Reallocate Team Capacity**: (Work: 5, Cost: 0, Complexity: Low). 
* **Weekend Push**: (Work: -20, Cost: 5, Complexity: High). Grants immediate bonus capacity but crushes Morale.
* **Hire External Advisor**: (Work: 0, Cost: 40, Complexity: Low). Instantly solves complex analysis bottlenecks but drains Budget.

---

# 12. Deliverables in Phase 1
Deliverables are hard game objects that persist across phases. 

* **Teaser**: A 2-page anonymous summary. Dictates absolute hit-rate in Phase 2 Outreach.
* **Information Memorandum (IM)**: A 50-page deep dive. Dictates conversion rate from NBO to DD.
* **Financial Model**: An interactive excel artifact. Dictates ultimate Valuation resilience.
* **Buyer Long List**: Dictates the total addressable pool of competitors.
* **Virtual Data Room (VDR)**: The central repository. If unorganized, buyer confidence shatters during DD.

**Quality Tiers:**
Every deliverable resolves cleanly into one of three states (`Basic`, `Solid`, `Exceptional`) based on the Quality metric of its associated workstreams when finalized.
* Example: Generating a Financial Model while `Financial Analysis.quality` is at 45 defaults the artifact to `Basic`, guaranteeing massive friction during Phase 7.

---

# 13. Phase 1 Event Pool
Events inject narrative friction dynamically.

* **Client Delays Documentation**
  * *Trigger*: Low client alignment or random early-phase bad luck.
  * *Effect*: Team Capacity unused this cycle expires. `preparationPressure` rises. 
* **CFO Challenges Assumptions**
  * *Trigger*: Financial Model generation finishes.
  * *Effect*: Adds mandatory "Negotiate with CFO" task. `clientAlignment` drops heavily if ignored.
* **Partner Rejects Draft IM**
  * *Trigger*: High complexity IM draft generation.
  * *Effect*: Instantly creates +25 Work Units of revision cascades. IM Quality tier drops unless solved.
* **Hidden Accounting Issue Found**
  * *Trigger*: Revenue Quality Review (High Complexity hidden load).
  * *Effect*: Narrative warning. If ignored, huge Risk Debt. If addressed via "Hire External Advisor" task, solves safely but costs high Budget.
* **Data Room Folder Structure Breaks**
  * *Trigger*: Upload Core Documents executed under high Pressure.
  * *Effect*: VDR Quality drops by 30 points instantly.
* **Strong Internal Metric Discovered**
  * *Trigger*: Market Growth Analysis (Positive Variance).
  * *Effect*: `valuationPotential` bumps by +0.5x EBITDA logic.
* **Team Fatigue Emerging**
  * *Trigger*: Sustaining `Pressure > 1.2` for two consecutive weeks.
  * *Effect*: `availableCapacity` permanently loses 5 units as analysts slow down.
* **Market Multiple Headline Improves Narrative**
  * *Trigger*: Pure RNG Macro Event.
  * *Effect*: `buyerInterestPotential` receives a free global multiplier.

---

# 14. Failure Conditions in Phase 1
* **Structural Failure (Game Over)**: `clientAlignment` drops to zero due to massive delays or ignored communications. The client fires you.
* **Soft Failure (Zombie Deal)**: You launch to Phase 2 with a `Basic` IM, an unscrubbed Financial Model, and low `Buyer Interest`. The deal goes to market, but no NBOs will emerge.
* **Budget Exhaustion**: You run out of runway before launching the process.
* **Morale Collapse**: Multiple `Weekend Pushes` drive morale to critical bounds. The team essentially refuses to absorb Hidden Workload spikes.

# 15. Decay Rules for Phase 1
* `teamMorale`: Natural slow decay if Pressure remains high.
* `clientAlignment`: Decays naturally every turn if no Relationship task or Review touchpoint is executed.
* `executionReadiness`: Cannot exceed 100, but will decay backward if the deal sits fully prepped but unlaunched for too long (data becomes stale).

# 16. UI Layout Recommendations for Vanilla JS
* **Left Panel (Narrative & Inbox)**: Displays the active Event Chain (e.g. "CFO has pushed back on your Working Capital assumptions. Awaiting directives.").
* **Center Top (Deliverables Grid)**: 5 visual slots for the major Deliverables. They appear greyed out, fill up as progress hits 100%, and stamp with a color flag (Bronze=Basic, Silver=Solid, Gold=Exceptional) once finalized.
* **Center Bottom (Workstreams)**: Simple progress bars detailing `Progress` and `Quality`.
* **Right Panel (Action & Resource Engine)**: The core interactive pane. Lists all available Phase 1 Tasks, displaying Cost and Work clearly. At the top, two highly visible gauges: "Current Budget" and "Team Capacity / Pressure Zone". 
* **Header / Overlay**: Deal Phase Title and high-level `clientAlignment` indicator.

# 17. Recommended Deal State Shape for Phase 1
```js
const dealState = {
  id: "deal_002",
  name: "Project Titan",
  phaseId: 1,
  
  resources: {
    budget: 150,
    maxCapacity: 60,
    usedCapacity: 45, // Calculates to a Pressure of 0.75 (Comfortable)
  },

  variables: {
    preparationPressure: 0.75,
    buyerInterestPotential: 50,
    valuationPotential: 40,
    clientAlignment: 80,
    dataQuality: 60,
    executionReadiness: 25,
    confidentialityExposure: 5,
    teamMorale: 85
  },

  workstreams: {
    informationCollection: { progress: 40, quality: 70 },
    financialAnalysis: { progress: 10, quality: 40 },
    equityStoryDevelopment: { progress: 0, quality: 0 },
    buyerUniverseDesign: { progress: 0, quality: 0 },
    documentationQuality: { progress: 0, quality: 0 },
    dataRoomReadiness: { progress: 0, quality: 0 },
    processReadiness: { progress: 15, quality: 50 }
  },

  deliverables: {
    teaser: { status: "empty", tier: null }, // empty, drafting, complete
    im: { status: "empty", tier: null },
    model: { status: "empty", tier: null },
    buyerList: { status: "empty", tier: null },
    vdr: { status: "empty", tier: null }
  },

  strategicProcessChoice: null, // "Broad", "Targeted", Wait
  riskDebt: 0,
  
  history: [],
  activeTasks: ["task_collect_fin", "task_map_competitors"],
  eventQueue: []
};
```

# 18. Recommended Core Functions for Vanilla JavaScript
* `getAvailableTasks(dealState, phaseLibrary)`
* `canExecuteTask(dealState, task)` -> Checks if Cost & Capacity constraints allow execution.
* `executeTask(dealState, task)` -> Deducts resources, adds payload.
* `applyHiddenWorkload(task, currentPressure)` -> Performs the RNG roll against task.complexity and scales by pressure to instantly add new activeTasks or drain Capacity.
* `applyPhasePressure(dealState)` -> Engine loop to calculate the math for Morale decay and Risk tracking.
* `updateDeliverableQuality(dealState)` -> A specialized check evaluating Workstream metrics to lock in the `Basic/Solid/Exceptional` tiers.
* `checkPhaseGate(dealState)` -> Checks executionReadiness limits.
* `resolveEvent(dealState, eventDecision)`
* `renderPhase1UI(dealState)` -> Pure procedural re-painting of the DOM nodes based on JSON.

# 19. Recommended First Prototype Scope
To build the functional MVP of Phase 1:
1. Hard-code just **three tasks**: "Financial Deep Dive", "Draft IM", "Build Buyer List".
2. Render the Budget and Capacity constraint bars.
3. Make "Draft IM" trigger a Hidden Workload drop in Morale to prove the pressure cascade works.
4. Render a "Launch Process" button that only illuminates when the IM deliverable hits "Complete".

# 20. Design Philosophy for Phase 1
This phase teaches the player that *preparation quality drives process quality*. 
Players who want to rush to the exciting part (negotiating with buyers) will quickly realize that attempting to sell a half-baked asset with missing financials and a weak IM results in total catastrophe. M&A is won in the quiet rooms doing chaotic data scrubbing. Capacity management matters immensely here; if you grind your analysts to dust trying to achieve 'Exceptional' quality on everything immediately, your morale will break before you even launch the business. Rushed work plants the seeds of future failure.
