# M&A Dealmaker — Event System Specification

## 1. Event System Overview

Events introduce uncertainty, friction, and emergent narrative into the deal process. They simulate real-world dynamics such as client behaviour, unexpected findings, workload escalation, team fatigue, and buyer reactions.

The Event System integrates directly with the Task System and the broader Phase Architecture, providing consequences for decisions about budgeting, capacity utilization, and process strategy. Events ensure the simulation feels responsive, complex, and appropriately stressful.

---

## 2. Event Types

The system supports four main event types:
1. **Hidden Workload Events** (triggered by task complexity)
2. **Process Events** (related to deal preparation and execution)
3. **Market Events** (external environment shifts)
4. **Team Events** (affecting capacity and morale)

---

## 3. Hidden Workload Events

These events are triggered probabilistically when executing tasks with a defined `Complexity`. They represent unexpected snags in routine execution.

**Trigger source:** `Task.HiddenWorkload`

**Example:**
* **Task**: Customer Analysis
* **Complexity**: Medium
* **HiddenWorkloadProbability**: 30%

**Example Event:** "Inconsistent revenue reporting discovered during analysis."

**Effects:**
* `AdditionalWork` +8
* `Risk` +2
* `ValuationPotential` −0.2

These events consume additional Work Units automatically, instantly impacting team capacity.

---

## 4. Cascade Events

Some tasks unlock new mandatory or optional tasks upon completion or specific event triggers. 

**Example:**
* **Task completed**: Draft Information Memorandum

**Cascade events may generate:**
* Additional Segment Analysis
* Market Benchmarking
* Customer Cohort Review

These tasks are added dynamically to the active task pool, forcing the player to re-evaluate their resource allocation strategy mid-phase.

---

## 5. Pressure-Based Events

Operational pressure can generate spontaneous negative events even if tasks are executing smoothly. 

**Pressure** = `WorkDemand / TeamCapacity`

When Pressure exceeds critical threshold levels (e.g. `Pressure > 1.2`):
* Team fatigue
* Modelling error discovered
* Deliverable delay
* Internal partner review

**Example Event:** "Associate flags inconsistencies in the financial model."

**Effects:**
* `AdditionalWork` +6
* `TeamMorale` −3

---

## 6. Process Events

Events related directly to the deal's preparation and execution dynamics with the client and counterparties.

**Examples:**
* Client delays sending key documents
* CFO challenges assumptions
* Board disagreement on valuation
* Unexpected operational metric discovered

**Effects may influence:**
* `ClientTrust`
* `Risk`
* `PreparationProgress`
* `ValuationPotential`

---

## 7. Market Events

External overarching environment events affecting buyer behavior.

**Examples:**
* Private equity fund raises new capital
* Strategic buyer launches acquisition program
* Interest rates rise
* Comparable transaction announced

**Effects influence:**
* `BuyerInterest`
* `ValuationPotential`
* `DealMomentum`

---

## 8. Team Events

Events directly affecting team capacity and morale, regardless of deal-specific pressure.

**Examples:**
* Senior analyst reassigned to another mandate
* Team member illness
* Overtime burnout
* Partner intervention

**Effects influence:**
* `TeamMorale`
* `TeamCapacity`
* `Risk`

---

## 9. Event Probability Model

Each event has a Base Probability, which is then mathematically modified by the current game state before testing for successful triggering.

Modifiers may include:
* Task complexity
* Operational pressure
* Risk level
* Deal momentum

**Example Formula:**
`FinalProbability` = `BaseProbability` × `ComplexityModifier` × `PressureModifier` × `RiskModifier`

---

## 10. Event Effects Model

Each event in the system must specify an immediate mechanical payload alongside its narrative flavor text.

**Structure:**
* `EventID`
* `TriggerCondition`
* `Probability`
* `Effects`
* `NarrativeText`

**Example Effects Payload:**
* `AdditionalWork`
* `ClientTrust`
* `TeamMorale`
* `Risk`
* `ValuationPotential`
* `BuyerInterest`
* `DealMomentum`

---

## 11. UI Behaviour

The UI must shield the player from the underlying mathematics to preserve the simulation's uncertainty.

**The player sees:**
* Event description (Narrative Text)
* Immediate effects (e.g. "Work +8, Morale -3")

**The player does NOT see:**
* Hidden probabilities
* Trigger logic equations
* Specific modifiers scaling the event

---

## 12. Phase Event Pools

Each of the 11 phases draws from its own specific event pool to ensure narrative alignment.

**Example: Phase 1 — Preparation Events**
* Client documentation delay
* Hidden accounting issue
* Partner challenges equity story
* Additional market analysis required

Later phases dynamically swap pools. For example, Phase 6 (Due Diligence) introduces buyer behaviour events, due diligence discoveries, and negotiation conflicts.

---

## 13. Event Chains

Some events may serve as primers, triggering follow-up events if certain conditions are met, creating deep narrative continuity across the process.

**Example:**
* *Initial Event:* "Hidden accounting issue discovered"
* *Follow-up event possibility unlocked:* "External accounting review required" (Cost +, Risk ++)

This mechanic forces players to choose whether to expend massive capacity solving root issues early or risk catastrophic Event Chains later in the simulation.
