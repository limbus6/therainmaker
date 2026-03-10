# M&A Dealmaker — Task System Specification

## 1. Task System Overview

The **Task System** is a core component of the M&A Dealmaker simulation engine. It governs how the player (the advisory firm) spends resources to execute work across all phases of the deal lifecycle. 

Tasks represent concrete actions performed by the advisory firm. Instead of a hard limit on the number of actions a player can take per turn, the game constrains actions organically through an economic and operational resource model. 

Every action in the system must support the core mechanics: Financial Autonomy (Budget) consumption, Team Capacity (Work Units) consumption, Hidden Workload probability, and Cascading consequences.

---

## 2. Resource Constraints (Budget & Capacity)

Actions are NOT limited by a strict number of actions per turn. Instead, they are constrained by two primary resources. Every action must consume both.

### Financial Autonomy (Budget)
Represents financial resources consumed by the action (`Cost`).
Examples:
* external advisors
* research reports and databases
* travel
* overtime and commercial analysis

### Team Capacity (Work Units)
Represents the human bandwidth required to execute the action (`Work`).
Measured in Work Units. Team capacity per week depends on staffing levels.
Example baseline:
* 2 staff → 20 work units per week
* 3 staff → 30 work units per week
* 4 staff → 40 work units per week

Over-capacity execution is allowed, but pushing the team beyond their Weekly Capacity will trigger severe pressure penalties.

---

## 3. Task Data Structure

Every task in the system must support the following fields to guarantee cross-phase compatibility:

* **TaskID**: Unique identifier.
* **Name**: The display name of the task.
* **Category**: For UI filtering.
* **PhaseAvailability**: Array of phase IDs (0-10) where this task can be executed.
* **Cost**: Budget consumed.
* **Work**: Work units consumed.
* **Complexity**: Low, Medium, or High (dictates hidden work probability).
* **Effects**: Impact on game variables.
* **HiddenWorkload**: Probability and ranges for unexpected extra work.
* **CascadeTriggers**: Other tasks unlocked upon completion.

---

## 4. Complexity & Hidden Workload

Every task has a `Complexity` level, which determines the probability of generating unexpected friction or extra work.

### Complexity Levels & Probabilities:
* **Low** → 10% probability
* **Medium** → 30% probability
* **High** → 50% probability

### Hidden Workload Structure
Tasks that trigger this mechanic generate sudden additional work and related narrative events.

**Example Structure:**
```yaml
HiddenWorkload:  
  Probability: 0.30  
  AdditionalWork: 6–10  
  PossibleEvents:  
    - Additional analysis requested  
    - Client clarification required  
    - Internal partner review  
    - Data inconsistency discovered  
```

Hidden workload events instantly consume additional Work Units, often pushing the team into critical pressure states if they were already highly utilized.

---

## 5. Cascade Tasks

Some tasks are sequential and unlock deeper, more specific actions. These are defined by `CascadeTriggers`.

**Example:**
Action: *Draft Information Memorandum*
CascadeTriggers:
* Additional Segment Analysis
* Customer Cohort Breakdown
* Market Benchmarking

These new tasks appear dynamically in the task list only after the parent task is engaged or completed.

---

## 6. Pressure Interaction

Operational pressure dynamically modifies task outcomes and risk probabilities.
Pressure is defined as: `WorkDemand / TeamCapacity`

When pressure is high, the system enters critical zones:
* Hidden workload probability increases
* Error events become more likely
* Team morale decreases

**Example Ruleset:**
* If Pressure > 1.2:
  * `HiddenWorkloadProbability` × 1.5
  * Deliverable Quality drops
  * Risk variables increase

---

## 7. Task Categories

To provide a consistent UI experience and allow for strategic filtering, every task must belong to one of the following main categories:

1. **Information**: Gathering data, conducting deep dives, and researching.
2. **Narrative**: Drafting teasers, building equity stories and investment theses.
3. **Materials**: Hard deliverables (IMs, Financial Models, Management Presentations).
4. **Market Intelligence**: Mapping strategic and PE buyer universes.
5. **Negotiation**: Actions related to bidding, SPA terms, and legal sparring.
6. **Process Control**: Managing data rooms, NDAs, and deal momentum.

---

## 8. Task Effects Model

Task effects drive the simulation forward by modifying core game state variables.

Key variables affected include:
* `ClientTrust`
* `TeamMorale`
* `Risk`
* `ValuationPotential`
* `BuyerInterest`
* `DealMomentum`
* `PreparationProgress`

**Example Task:**
**Draft Information Memorandum**
* **Cost**: 12
* **Work**: 30
* **Complexity**: High
* **Effects**:
  * `BuyerInterest` +5
  * `ValuationPotential` +0.2
  * `TeamMorale` −1

---

## 9. UI Interaction Model

The UI must present complex data cleanly, hiding the math behind the simulation. 

The task execution interface must display ONLY the following attributes to the player:
* Name
* Cost
* Work
* Complexity
* Effects summary

**Hidden Mechanics:**
Hidden workload probabilities and specific mathematical triggers should NOT be visible to the player. They should only manifest organically through event notifications (e.g., "Customer concentration analysis reveals accounting inconsistencies: Work +8, Risk +2").

---

## 10. Cross-Phase Compatibility

The Task System is engineered to work identically across all 11 phases of the M&A process. 

The identical task data structure supports:
* Pitch actions (Phase 1)
* Preparation actions (Phase 2)
* Buyer outreach (Phase 3)
* Due diligence responses (Phase 6)
* SPA Negotiation actions (Phase 8)

The only differentiator is `PhaseAvailability`, which determines exactly when tasks populate in the player's UI based on the current active phase.
