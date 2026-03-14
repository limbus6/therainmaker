# M&A Dealmaker — Phase 7 Implementation Pack
## SPA Negotiation
## Compatible with HTML, CSS and Vanilla JavaScript

## Purpose
This document turns **Phase 7 — SPA Negotiation** into an implementable game system. It is designed to be sufficiently concrete for direct implementation in HTML, CSS, and vanilla JavaScript using procedural state updates.

The goal of this phase is to answer the question:
“How do we convert a preferred-bidder choice into executable paper that preserves enough value while remaining signable?”

At this stage:
- The auction has been largely shut down.
- The `Preferred Bidder` has been granted some form of exclusivity.
- The conceptual pricing from Phase 6 has been converted into a 100-page Sale & Purchase Agreement (SPA).
- Teams of lawyers are now arguing over the exact wording of every single sentence.

This phase is not just about resisting every legal change. It is about understanding the *value* of the clauses, knowing when to concede gracefully, and constructing a credible path to a final signature before the `Preferred Bidder` gets cold feet. 

---

# 1. Operational Purpose of Phase 7
Phase 7 is the zone of maximum leverage asymmetry. The seller has surrendered optionality (by giving the winner Exclusivity). The buyer knows this, and will use their legal counsel to slowly claw back value, shift liability onto the seller, and build "out" clauses.

Operationally, the advisor must triage the incoming legal attacks into manageable "Clause Packages." They must decide which points to concede (reducing `valueProtectionQuality`) to buy speed and momentum (`signingReadiness`). They must manage the fragility of the buyer, keeping them on the hook without giving away the store, all while managing a client who thinks every legal redline is a personal insult.

# 2. Phase 7 Core Player Experience
The intended player feeling during Phase 7 should emphasize:
- **Compression of optionality:** The suffocating realization that if this buyer walks, there is no one else to call.
- **Legal-Economic Trade-offs:** The agony of telling the client to accept a $5M liability cap purely to get the deal signed by Friday.
- **Clause pressure:** The exhaustion of turning page after page of heavily red-lined documents.
- **Fragility of exclusivity:** The persistent threat that the buyer is using Exclusivity to drag out the clock and force a massive price cut.
- **The narrowing corridor:** The balancing act between protecting the seller's money and protecting the signing momentum.

# 3. Phase 7 Workstreams
Workstreams track the structural path to signing.

## Term Architecture
- **Measures**: The organization of thousands of legal redlines into a digestible framework for the client.
- **Low progress means**: We are arguing over grammar instead of economics.
- **Low quality means**: We missed a fatal flaw hidden in an obscure appendix.

## Clause Negotiation Control
- **Measures**: The actual pushing back and forth of term sheets.
- **Low progress means**: The lawyers haven't spoken in 4 days.
- **Low quality means**: We are unilaterally giving up value without getting anything in return.

## Concession Discipline
- **Measures**: The strategic pacing of giving the buyer what they want.
- **Low progress means**: We are fighting every single point to a standstill.
- **Low quality means**: We conceded 3 major liability points in the same turn without requesting a trade.

## Fallback Leverage Preservation
- **Measures**: Keeping the `Backup Bidder` warm without violating the Exclusivity agreement.
- **Low progress means**: The Backup has formally disbanded their deal team.
- **Low quality means**: The Backup knows they are just being used and refuses to engage.

## Preferred Bidder Stability
- **Measures**: Ensuring the winner is actually trying to close the deal.
- **Low progress means**: The buyer is delaying calls and missing deadlines.
- **Low quality means**: The buyer's lawyers are sending deliberately aggressive markups to stall the process.

## Client Alignment on Legal Trade-Offs
- **Measures**: Educating the client on why they have to accept standard legal risks.
- **Low progress means**: The client refuses to read the SPA summary.
- **Low quality means**: The client rejects every concession the advisor proposes.

## Signing Path Construction
- **Measures**: The logistical scheduling of the signing event (board approvals, wet-ink signatures).
- **Low progress means**: The paper is agreed but no one is in the room to sign it.
- **Low quality means**: We scheduled the signing before resolving the Working Capital clause.

## Paper Quality Control
- **Measures**: The stability and coherence of the drafted document.
- **Low progress means**: The document is full of bracketed, undecided text.
- **Low quality means**: The document contains massive contradictions that will guarantee a lawsuit in Year 2.

---

# 4. Phase 7 Deal Variables
Dynamic variables specific to the closing crucible.

* `signingReadiness`: The master progress bar tracking toward 100%.
* `residualLegalDrag`: The volume of unresolved, contested clauses blocking the path to signing.
* `valueProtectionQuality`: How well the seller's money is protected post-close (indemnities, caps, escrows). Drops as concessions are made.
* `clausePressure`: The aggression level of the buyer's legal team.
* `clausePackageComplexity`: How intertwined the open issues are (e.g., you can't solve Price without solving Liability).
* `concessionDiscipline`: High if the player trades things; drops if the player simply surrenders.
* `fallbackLeverage`: Inherited from Phase 6 `backupStrength`. Reduces the buyer's ability to exert `clausePressure`.
* `preferredBidderStability`: Tracks whether the buyer is trying to close or trying to retrade.
* `falseClosureRisk`: The danger that the UI says "90% Ready" but the remaining 10% contains unresolvable deal-breakers.
* `paperFragility`: If `valueProtectionQuality` drops too low, the paper is fragile, exposing the client to massive post-closing lawsuits.
* `legalControl`: The advisor's grip on the drafting pen. He who drafts, controls the tone.
* `clientValueSensitivity`: How violently the client reacts when you tell them to accept a liability clause.

# 5. Firm-Level Variables Relevant to Phase 7
Phase 7 relies heavily on maintaining a credible posture under fatigue.

* `recommendationCredibility`: The currency used to force the client to accept painful but necessary concessions. (Carries over from Phase 6).
* `teamWorkload`: Steady, intense grind. Not the frantic burst of Phase 5, but a relentless marathon of 2 AM legal calls.
* `legalConfidence`: Replaces Analytical Confidence. High confidence means you can shut down frivolous buyer redlines instantly without spending Client Credibility.

---

# 6. Phase 7 Gates
To successfully complete Phase 7 and transition to Phase 8 (Signing), the engine checks the following:

**Logical Conditions:**
* `residualLegalDrag` is reduced to 0.
* A "Signing Checklist" has been fully executed.

**Configurable Workstream Thresholds:**
* Signing Path Construction.progress >= 100
* Preferred Bidder Stability >= 50
* False Closure Risk < 30 (If higher, the transition fails and bounces back to Phase 7 with newly spawned issues).

*Hard Failure Gate*: If `preferredBidderStability` drops to 0 while `fallbackLeverage` is 0, the deal dies instantly.

---

# 7. Hard and Soft Dependencies

## 7.1 Hard Dependencies
* **Preferred Bidder Baseline**: Inherits the `executionRisk` and `spaAggression` traits outputted by Phase 6. A `False Winner` structurally spawns 3x the normal `clausePressure` in Turn 1.

## 7.2 Soft Dependencies
* **Shadow Fallback**: If `fallbackLeverage` > 50, the `Preferred Bidder`'s lawyers automatically accept 40% of the player's pushback on clauses. If it is < 10, they reject 90% of pushback, demanding total capitulation.
* **Winner's Curse Realization**: If `winnerCurseRisk` was triggered in Phase 6, the `Preferred Bidder` will weaponize the "Interim Conduct" and "Working Capital" clauses in Phase 7 to try and claw back the money they realize they overpaid. 

---

# 8. Risk Debt in Phase 7
Phase 7 creates the final, permanent structural legacy of the deal. The consequences manifest immediately in Phase 8 (Closing), or in unseen post-game narrative lore.

* **The Glass Shield**: Dropping `valueProtectionQuality` below 30 to rush a signing generates massive Risk Debt. The deal will sign, but the client will be sued by the buyer 12 months later and the advisor's reputation will permanently tank outside the game scope.
* **Over-Lawyering**: Refusing to concede any points (keeping `valueProtectionQuality` at 100) requires massive `Work` spending and drives `preferredBidderStability` into the ground. Pursuing "perfect paper" almost always kills the deal.
* **False Closure Explosion**: Allowing `falseClosureRisk` to accumulate by hiding difficult issues from the client until the last minute will cause the client to blow up the deal *at the signing table* in Phase 8.

---

# 9. Resource Model for Phase 7
Phase 7 introduces **Trade-off Budgeting**.
The player manages a finite pool of `Negotiation Leverage` (derived from Backup strength and Client Trust). 

Instead of merely spending `Work` to analyze data (like in DD), the player is spending `Leverage` to force the buyer to drop clauses, or spending `Client Trust` to force the seller to accept them. Once Leverage is gone, the player must either make dangerous unilateral concessions or watch the deal die.

# 10. Pressure and Hidden Workload Model
Hidden workload in SPA negotiation stems from the "Hydra Effect" of legal changes.

* **Low Complexity Tasks**: 10% chance changing a definition in Clause A breaks a mechanism in Clause D, spawning a new minor issue.
* **High Complexity Tasks**: 50% chance a major concession on "Liability Caps" emboldens the buyer to suddenly reopen the previously settled "Earn-out Mechanics."

If `negotiationFatigue` rises, the team's ability to detect `False Closure Risk` drops entirely, making the UI progress bars lie to the player.

---

# 11. Term Architecture
Phase 7 does not treat issues as an undifferentiated pile. The `residualLegalDrag` is categorized into canonical term families:

* **Price & Adjustment Mechanics**: Working capital peg, cash/debt definitions. *Impacts absolute final cash value.*
* **Reps & Warranties**: The promises the seller is making about the business. *Impacts certainty.*
* **Liability & Indemnity**: The cap on how much the buyer can sue the seller for later. *Impacts valueProtectionQuality heavily.*
* **Interim Conduct**: What the business is allowed to do between Signing and Closing. *Impacts seller control.*
* **Closing Conditions (MAC clause)**: The "out" clauses. *Impacts execution certainty.*

An SPA process cannot succeed unless ALL families are driven to zero open items.

---

# 12. Clause Taxonomy and Issue Triage
Issues spawning in Phase 7 require triage. The player must choose their battles.

* **Value Leakage Issue**: A buyer trying to redefine "Debt" to include the client's office lease. *Action*: Must be fought.
* **Certainty Issue**: A buyer adding a "Subject to Board Approval" clause. *Action*: Deal-breaker. Must be fought to the death.
* **Control Issue**: A buyer demanding veto rights over hiring before the deal closes. *Action*: Annoying, but standard. Highly concessible.
* **Cosmetic Issue**: Arguments over formatting or standard legal boilerplate. *Action*: Instantly concede to buy goodwill. *If you spend Work fighting this, you are a bad advisor.*

---

# 13. Concession Discipline
The core mechanical heart of Phase 7 negotiations.

**If the player executes "Hold Line":**
- `valueProtectionQuality` increases.
- `signingReadiness` stalls.
- `preferredBidderStability` decays.

**If the player executes "Concede Clause":**
- `valueProtectionQuality` drops (permanently).
- `signingReadiness` jumps forward.
- `preferredBidderStability` improves.

**If the player executes "Trade Concession for Certainty" (Package Trade):**
- The ideal move. Costs `Work`, but advances `signingReadiness` without severely damaging `valueProtectionQuality`.

---

# 14. Clause Package Logic
Terms should never be negotiated in isolation. 

**Canonical Package Patterns:**
* **Balanced Protection Package**: Conceding the `Liability Cap` slightly (pro-buyer) in exchange for shortening the `Survival Period` (pro-seller). 
* **Overlawyered Deadlock Package**: The engine detects the player has refused to concede on 3 interlinked clauses in a row. Automatically spawns a `Legal Deadlock` event, freezing all progress until an Escalation task is run.
* **Fragile Near-Agreement**: Progress looks like 95%, but all the resolved points were cosmetic. The three remaining points are massive `Certainty Issues` that have been deferred for two weeks.

---

# 15. Fallback Leverage and Shadow Competition
Exclusivity is a decaying shield.

If the player negotiated "Soft Exclusivity" in Phase 6, they can execute the "Preserve Shadow Leverage" task cheaply in Phase 7. This keeps `fallbackLeverage` high, acting as a passive aura that weakens the buyer's `clausePressure`.

If they granted "Hard Exclusivity", the Backup Bidder automatically drops to 0 over 2 cycles. Once `fallbackLeverage` = 0, the `Preferred Bidder` knows they have the seller trapped, and their SPA markups double in aggression.

---

# 16. False Closure Risk
The engine actively lies to the player if they play poorly.

If the player frequently uses the "Accept Controlled Legal Compromise" task on complex `Structure Issues` without spending extra capacity on "Review Package Coherence," the `signingReadiness` bar will artificially inflate to 98%. However, `falseClosureRisk` will silently climb to 80. When the player clicks "Trigger Signing," the deal will fail, the UI will flash red, and 4 massive fatal flaws will spawn in the `residualLegalDrag` queue—the lawyers found critical contradictions at the printing press.

---

# 17. Preferred Bidder Fragility
The winner is not immortal. 

**Visible Stability States:**
* `Stable Counterparty`: Negotiating in good faith. Working toward a signature.
* `Hard-Nosed but Executable`: Refuses your trades, demands their standard paper, but has the cash ready.
* `Stretching Aggressively`: Overpaid to win, now using the lawyers to claw back $10M through sneaky Working Capital adjustments.
* `Fragile in Exclusivity`: Their debt financing is looking shaky. They are deliberately slowing down the SPA turns to buy time.
* `At Risk of Breakdown`: Has given a "take it or leave it" ultimatum on the Liability Cap.

---

# 18. Phase 7 Task Library

## Term Architecture Tasks
* **Build Clause Priority Map**: (Work: 10, Cost: 0, Complexity: Low). Unlocks the ability to see which clauses are "Cosmetic" vs "Value Leakage."
* **Package Linked Issues**: (Work: 15, Cost: 0, Complexity: High). Groups 3 open issues into a single negotiation block, reducing total Work needed to resolve them.
* **Redesign Negotiation Sequence**: (Work: 10, Cost: 0, Complexity: Low). Defers a Dealbreaker issue until the minor issues build momentum.

## Negotiation Control Tasks
* **Push Back on Aggressive Markup**: (Work: 10, Cost: 0, Complexity: Medium). Refuses a buyer clause. Costs `preferredBidderStability`.
* **Hold Line on High-Value Protection**: (Work: 15, Cost: 0, Complexity: High). Refuses a clause, but costs `Leverage` instead of `Stability`.
* **Accept Controlled Legal Compromise**: (Work: 5, Cost: 0, Complexity: Low). Quick progress. Slight `valueProtection` drop.
* **Trade Concession for Certainty**: (Work: 20, Cost: 0, Complexity: High). The ultimate professional move. High `Work` cost, excellent outcome.
* **Tighten Fallback Signalling**: (Work: 10, Cost: 0, Complexity: Medium). Re-inflates `fallbackLeverage`.

## Client / Internal Alignment Tasks
* **Brief Client on Legal Trade-Offs**: (Work: 15, Cost: 0, Complexity: High). Required to spend `Concessions` without infuriating the seller.
* **Defend Concession Recommendation**: (Work: 10, Cost: 0, Complexity: Medium). Uses `recommendationCredibility`.
* **Challenge Overreaction to Legal Leakage**: (Work: 20, Cost: 0, Complexity: High). Calms a client who thinks a standard indemnity is a conspiracy to rip them off.

## Preferred Bidder Management Tasks
* **Test Preferred Bidder Stability**: (Work: 10, Cost: 0, Complexity: Low). Reveals their hidden State and true intentions for the SPA markup.
* **Push for Cleaner Signability**: (Work: 15, Cost: 0, Complexity: High). Forces them to drop Cosmetic redlines.
* **Pressure Bidder on Overreach**: (Work: 10, Cost: 0, Complexity: Medium). Uses `fallbackLeverage` to instantly close a stalled Value issue.

## Signing Path Tasks
* **Build Signing Checklist**: (Work: 10, Cost: 0, Complexity: Low). Prerequisite for Phase 8.
* **Reduce Residual Legal Drag**: (Work: Variable, Cost: Variable, Complexity: Low). General catch-all to clean up minor text issues.
* **Run Pre-Signing Paper Review**: (Work: 25, Cost: 10, Complexity: High). Massive capacity drain that explicitly checks for and neutralizes `False Closure Risk`.

---

# 19. Negotiation Readability System
As packages are traded, the UI updates the Global Stance.

**Visible UI Interpretation Tags:**
* `Legally Heavy` -> Initial state. Thousands of redlines.
* `Under Control` -> Routine negotiation. Healthy progress.
* `Value Leakage Risk` -> Player is conceding too much too quickly to buy progress.
* `Near Agreement but Fragile` -> Progress is 90% but `Certainty Issues` remain open.
* `Aggressive Buyer Position` -> Buyer is rejecting all pushback. Fallback Leverage required.
* `Warning: False Closure Risk` -> Visual indicator if the system detects unstable compromise packages.
* `Clean Signing Path Emerging` -> The victory state indicating Phase 8 is viable.

---

# 20. Integrated World Content Layer

### 20.1 SPA-Stage Buyer Identity Pools
Buyers carry their Phase 6 archetypes into the legal arena.
* **ApexCloud Systems**: Known for deploying armies of aggressive white-shoe lawyers who argue every comma to justify their massive NBO valuation.
* **Silverline Tech Partners**: Known for an intensely disciplined, highly standardized SPA out of the box that they refuse to deviate from ("The Sponsor Playbook").

### 20.2 Buyer-Contact Identity Pools
The contacts shift from deal-makers to rigid legal executors.
* `Jonathan Vance, Lead Counsel (Apex)`: Never uses the phone. Only sends 40-page PDF markups at 11:30 PM on a Friday.
* `Sarah Jenkins, Sponsor Counsel (Silverline)`: Utterly unmoving on Indemnity Caps. "This is our fund's standard policy, we literally cannot change it."

### 20.3 Message Tone Library (SPA Posture)
* **Hard Legal Posture**: *"Seller's proposed revisions to Section 4.2 are fundamentally unacceptable and represent a departure from market standard. Reverted to Buyer's initial draft."*
* **Packaging Proposal**: *"Without prejudice to our other positions, we could accept your cap on general reps if you agree to drop the materiality scrape."*
* **Buyer Overreach**: *"We require an unlimited indemnity for the historic IP litigation discussed in DD."* (A classic mid-phase ambush attack).

### 20.4 Internal Team Note Library
* **False Closure Warning**: *"The lawyers are celebrating closing out the reps, but we still haven't agreed on the Working Capital peg. They are ignoring the commercial points to claim a legal victory."*
* **Weak Fallback**: *"Apex's lawyers know the Backup bidder walked yesterday. They just re-traded the liability cap. We have no stick to hit them with."*

### 20.5 Client Message Library
* **Impatience to Sign**: *"I don't care about a 'Fundamental Rep Survival Period.' Just sign the document, I want this finished."* (A dangerous temptation to drop value protection).
* **Resistance to Standard Points**: *"Why are we guaranteeing the inventory is perfect? No business operates like that! Tell them no."* 

### 20.6 Headline / Market Context Library
* *"MAC Clauses Invoked as Macro Uncertainty Shakes Deal Confidence"* (Increases the ambient difficulty of negotiating Certainty clauses).
* *"White-Shoe Law Firms Report Record Deal Bottlenecks"* (Explains exogenous delays in document turns).

### 20.7 Event Labels and SPA-Card Microcopy
* `[Deadlocked Clause]`
* `[Value Concession Accepted]`
* `[Path to Signing: Blocked]`

---

# 21. Phase 7 Event Pool

* **Buyer Pushes New Liability Demand**
  * *Trigger*: Inherited from a Phase 5 Issue that was only "Partially Mitigated."
  * *Effect*: Suddenly adds a massive `Liability & Indemnity` block to the `residualLegalDrag`.
* **Client Resists Concession**
  * *Trigger*: Player executes "Accept Controlled Compromise" while `clientValueSensitivity` is high.
  * *Effect*: Task fails, Work is consumed, and Progress resets. You must educate them first.
* **Package Trade Improves Signability**
  * *Trigger*: Player successfully executes "Trade Concession for Certainty".
  * *Effect*: Clears 3 open issues simultaneously and boosts `preferredBidderStability`.
* **Fallback Leverage Weakens**
  * *Trigger*: 3 Turns pass without executing "Preserve Shadow Leverage."
  * *Effect*: `fallbackLeverage` decays by 30%. Buyer's SPA markups instantly become more aggressive in the next turn.
* **Near-Agreed Paper Reveals Hidden Fragility**
  * *Trigger*: Attempting to execute "Final Signing Readiness Check" while `falseClosureRisk` > 50.
  * *Effect*: A fatal flaw is discovered. `signingReadiness` drops by 20% and 4 new tasks spawn to fix the paper.
* **Preferred Bidder Overreaches**
  * *Trigger*: Buyer has `Winner's Curse Risk` active.
  * *Effect*: They attempt to rewrite the commercial deal entirely inside the legal definitions. Requires an immediate "Escalate Structural Concern" response to stop it.

---

# 22. Failure Conditions in Phase 7
* **Hard Failure (Deal Collapse)**: The player refuses to concede any points. `preferredBidderStability` hits 0. The buyer formally breaks Exclusivity and walks away. Deal dead.
* **Hard Failure (Client Rebellion)**: The player unilaterally concedes all value protections without managing the client. `clientTrust` hits 0. The client fires the advisor just before the finish line.
* **Soft Failure (The Toothless Tiger)**: The deal signs, but `valueProtectionQuality` is completely tanked. The seller receives their money but is functionally guaranteed to lose 20% of it in escrow clawbacks.
* **Soft Failure (Exhaustion)**: The paper is signed 6 weeks late because of terrible package management. The business deteriorates during the delay, creating massive Phase 8 closing risks.

---

# 23. Decay Rules for Phase 7
* `preferredBidderStability`: Decays if `signingReadiness` does not advance for 2 consecutive turns. They get bored and paranoid if the paper isn't moving.
* `fallbackLeverage`: Decays constantly. Time confirms that the Backup is no longer a viable threat.
* `clientTrust`: Decays as legal bills mount and the frustrating reality of indemnities sets in.

---

# 24. UI Layout Recommendations for Vanilla JS
* **Left Panel (The Redline Inbox)**: Heavy text-focus. The inbox flashes when new "Clause Markups" emerge. Escalation notes from internal counsel.
* **Center (The Term Architecture Board)**: A structural map of the SPA divided by families (Price, Reps, Liability, Conduct, Conditions). Shows exactly where the `residualLegalDrag` is clustered. Drag-and-drop mechanics to package issues.
* **Right Panel (The Scales of Leverage)**: A visual balance showing the Buyer's Aggression vs Seller's Fallback Leverage. The `Value Protection` vs `Signing Speed` slider.
* **Lower Overlay (Progress to Execution)**: The `signingReadiness` master bar, with hidden `False Closure Risk` indicators underneath.

---

# 25. Recommended Deal State Shape for Phase 7
```js
const dealState = {
  id: "deal_007",
  phaseId: 7,
  
  resources: {
    budget: 30, // Draining on external legal fees
    maxCapacity: 60,
    usedCapacity: 45, // Steady marathon
  },

  variables: {
    signingReadiness: 65,
    valueProtectionQuality: 85,
    concessionDiscipline: 70,
    fallbackLeverage: 40, // Decaying
    preferredBidderStability: 60,
    falseClosureRisk: 25,
    clientValueSensitivity: 80 // High resistance to giving up money
  },

  workstreams: {
    termArchitecture: { progress: 100, quality: 90 },
    negotiationControl: { progress: 60, quality: 70 },
    clientAlignment: { progress: 50, quality: 60 },
    signingPathConstruction: { progress: 20, quality: 30 }
  },

  openClauses: [
    {
      id: "cl_102",
      family: "Liability & Indemnity",
      issueType: "Value Leakage",
      buyerAggression: "High",
      status: "Deadlocked", // Awaiting player task
      leverageRequiredToHold: 15
    },
    {
      id: "cl_044",
      family: "Reps & Warranties",
      issueType: "Cosmetic",
      buyerAggression: "Low",
      status: "Open",
      leverageRequiredToHold: 1
    }
  ],

  preferredBidder: {
    id: "buy_02", // Silverline
    stabilityState: "Stable Counterparty",
    winnerCurseFlags: false
  },
  
  riskDebt: 60, // Carried forward from previous phases
  activeTasks: ["task_package_issues", "task_trade_concession"],
  eventQueue: []
};
```

# 26. Recommended Core Functions for Vanilla JavaScript
* `getAvailablePhase7Tasks(dealState)`
* `classifyClauseIssue(clauseKey)` -> AI logic sorting incoming bullet points into 'Value', 'Control', or 'Cosmetic' buckets.
* `buildClausePackage(dealState, arrayOfClauseIds)` -> UI function linking 3 issues together so a single task resolves them all at a blended cost.
* `calculateConcessionQuality(dealState)` -> Algorithm comparing `valueProtection` drops against `signingReadiness` gains.
* `updateFallbackLeverage(dealState)` -> Entropy loop decaying the ghost of the Backup Bidder.
* `calculateFalseClosureRisk(dealState)` -> Checks if the player is ignoring Dealbreaker clauses while conceding all Cosmetic ones.
* `processBuyerMarkup(dealState)` -> RNG generator introducing new `openClauses` based on Phase 5 issues.
* `checkPhase7Gate(dealState)` -> Verifies `openClauses` array is empty and `signingReadiness` is 100.
* `renderPhase7UI()` -> Renders the SPA architecture map and the Leverage Scales.

# 27. Recommended First Prototype Scope
To build the functional MVP of Phase 7:
1. Hard-code a starting array of **10 `openClauses`** across 3 families.
2. Build the **"Hold Line"** task: Costs 10 `Leverage`, drops `Bidder Stability` by 5, resolves the clause.
3. Build the **"Concede Clause"** task: Costs 0 Leverage, drops `valueProtectionQuality` by 10, resolves the clause.
4. If `preferredBidderStability` drops below 20, disable the "Hold Line" task entirely (you have no power left).
5. Add the **"Preserve Shadow Leverage"** task to slowly buy back `Leverage`.
6. Gate transition to Phase 8 when the `openClauses` array hits 0.

# 28. Design Philosophy for Phase 7
This phase teaches the player that *SPA negotiation is not a contest of stubbornness*. 

It is a disciplined exercise in protecting value without destroying signability. Not every clause matters equally. A brilliant advisor knows that fighting over a formatting definition while the economy burns down is a dereliction of duty. Not every concession is weakness; some concessions are beautiful tactical trades that buy immense certainty. Paper that looks nearly closed is not always safe paper. The advisor’s job isn't to play lawyer and win every sentence—the job is to construct a signable contract that protects the economic integrity of the deal before the buyer realizes they actually have all the leverage.
