# M&A Dealmaker — Phase 4 Implementation Pack
## Non-Binding Offers (NBOs)
## Compatible with HTML, CSS and Vanilla JavaScript

## Purpose
This document turns **Phase 4 — NBOs** into an implementable game system. It is designed to be sufficiently concrete for direct implementation in HTML, CSS, and vanilla JavaScript using procedural state updates.

The goal of this phase is to answer the question:
“How do we convert shortlist tension into first serious commercial expression and decide who deserves access to the next round?”

At this stage:
- the Information Memorandum has been digested
- the Q&A process from Phase 3 has mostly concluded
- buyers are legally submitting their first indicative bids
- excitement and anxiety in the client camp spike
- the advisor must interpret documents that are almost never structurally identical

This phase is not only about collecting NBOs. It is about interpretation under ambiguity, structured comparison, and the selective compression of the buyer field into a final Due Diligence pool without destroying the competitive tension built in Phase 3.

---

# 1. Operational Purpose of Phase 4
Phase 4 acts as the first brutal reality check of the M&A process. The abstract "Seriousness" scores from Phase 3 must now convert into hard financial numbers signed by an investment committee. 

Operationally, the advisor must receive NBOs (Non-Binding Offers), normalize their assumptions to create a true "apples-to-apples" comparison matrix, manage the client's emotional reaction to the raw headline numbers, and advance a curated group of 2 to 4 buyers into Phase 5 (Due Diligence). 

Advancing too many bidders creates operational gridlock in DD. Advancing too few destroys the advisor's leverage for Phase 6 (Final Offers).

# 2. Phase 4 Core Player Experience
The intended player feeling during Phase 4 should emphasize:
- **Interpretation under ambiguity**: High bids often come with lethal hidden conditions. Low bids sometimes offer clean exits.
- **Valuation excitement vs. structural caution**: The thrill of a huge number contrasted with the dread of noticing they assumed the wrong debt figure.
- **Imperfect bid comparability**: The frustration of realizing Buyer A bid on a Cash-Free/Debt-Free basis, while Buyer B bid on an Enterprise Value basis locked box.
- **Reducing the field without destroying tension**: The agony of having to cut the 5th place bidder, knowing they were your best backup.
- **Managing client reaction**: Stopping the founder from instantly declaring the highest bidder the winner before Due Diligence even starts.

# 3. Phase 4 Workstreams
Workstreams track the structural processing of the incoming bids.

## Offer Collection
- **Measures**: The mechanical receipt of the NBO documents relative to the set deadline.
- **Low progress means**: Buyers are missing the deadline, threatening process credibility.
- **Low quality means**: Bids are arriving via informal emails instead of the required legal format.

## Offer Interpretation
- **Measures**: Decomposing the NBO into Price, Structure, and Conditionality.
- **Low progress means**: We have a PDF but haven't read the fine print.
- **Low quality means**: We missed a massive legal condition in the appendix.

## Bid Comparability
- **Measures**: Mathematical normalization of the bids into a unified comparison matrix.
- **Low progress means**: The client cannot easily compare the offers side-by-side.
- **Low quality means**: The comparison matrix is fundamentally flawed, comparing apples to oranges.

## Competitive Tension Preservation
- **Measures**: Ensuring the advancing buyers know they are in a tight race.
- **Low progress means**: Buyers assume they are the only ones left.
- **Low quality means**: Transparency is poorly managed, causing bidders to collude or drop out.

## Buyer Advancement Selection
- **Measures**: Formulating the specific list of who enters Phase 5.
- **Low progress means**: Internal paralysis on who to cut.
- **Low quality means**: We advanced a noisy tourist just because their headline number was high.

## Client Alignment on Offer Meaning
- **Measures**: Detaching the client from the raw headline price and educating them on certainty.
- **Low progress means**: The client is reading the NBOs raw and drawing their own wild conclusions.
- **Low quality means**: The advisor caveated the risks so poorly the client assumes the deal is guaranteed.

## Next-Round Readiness
- **Measures**: Finalizing the Phase 5 VDR (Virtual Data Room) and management presentation schedules.
- **Low progress means**: If we invite a buyer to DD today, they will have nothing to look at.
- **Low quality means**: The VDR is chaotic, guaranteeing immediate Phase 5 frustration.

---

# 4. Phase 4 Deal Variables
Dynamic variables specific to bid dynamics.

* `nboVolume`: The raw number of bids received. Inherits natively from the Phase 3 Shortlist size.
* `nboQuality`: The blended strategic value of the bids (combining price and certainty).
* `bidComparability`: How easily the engine can render the comparison UI. Low comparability hides bid stats behind "Needs Normalization" tags.
* `priceVisibility`: The accuracy of the displayed valuation numbers to the player.
* `certaintyVisibility`: The accuracy of the displayed execution risk associated with an NBO.
* `offerCredibility`: Do we actually believe this buyer can fund this specific bid?
* `processTension`: Inherited from Phase 3, dictates how close together the NBOs cluster.
* `bidNoise`: The volume of caveat language and conditions attached to the average bid.
* `clientExcitement`: Rises parabolically with high headline numbers, becoming dangerous if unmanaged.
* `clientInterpretationQuality`: If low, the client fights your advancement recommendations.
* `nextRoundSelectivity`: The inverse of how many buyers you advance (advancing 2 = high selectivity; advancing 6 = low selectivity).
* `buyerAdvancementConfidence`: The team's belief that they picked the right horses.
* `downsideProtectionPressure`: The need to keep a safe `Certainty Anchor` alive even if their bid is low.

# 5. Firm-Level Variables Relevant to Phase 4
The stress of Phase 4 relies entirely on the pressure of rapid interpretation.

* `analyticalConfidence`: Replaces standard Phase 1/2 `progress` metrics. Represents the team's ability to untangle complex structural math accurately.
* `teamWorkload`: Spikes violently in the 48 hours following the NBO deadline as the matrix is built.
* `processDiscipline`: Waiving the deadline for a late buyer burns this firm currency globally.
* `clientTrust`: A massive shield. High trust allows the advisor to recommend dropping the highest monetary bidder due to execution risk without getting fired.

---

# 6. Phase 4 Gates
To successfully complete Phase 4 and transition to Phase 5 (Due Diligence), the engine checks the following:

**Logical Conditions:**
* `NBO Comparison Matrix` deliverable is marked `Complete`.
* An `Advancing Buyers Set` representing Phase 5 access has been locked and approved.
* `Phase 5 VDR` is unlocked.

**Configurable Workstream Thresholds:**
* Bid Comparability.progress >= 80
* Client Alignment on Offer Meaning.progress >= 70
* Next-Round Readiness.progress = 100

*Soft Zombie Gate*: You can technically advance 0 buyers if all NBOs are rejected, ending the game immediately as a Busted Process failure.

---

# 7. Hard and Soft Dependencies

## 7.1 Hard Dependencies
* **Build NBO Comparison Matrix**: Structurally requires at least 1 returned NBO object in the `dealState.nbos` array.
* **Prepare DD Entry Package**: Requires `Bid Comparability` to be largely stable, so you know what the buyers want to investigate.

## 7.2 Soft Dependencies
* **Phase 3 Shortlist Noise**: If you advanced a `Noisy Survivor` through Phase 3, they are 80% likely to submit a highly conditioned, structurally messy NBO here, dragging down `bidComparability`.
* **Weak Comparability Bias**: If you launch to Phase 5 while `bidComparability` < 50, the lack of clarity creates massive Risk Debt that detonates as a "Structural Misunderstanding" retrade in Phase 6.

---

# 8. Risk Debt in Phase 4
Phase 4 generates strategic Risk Debt primarily through misinterpretation.

* **Chasing Fake Price**: Advancing a "High Price, Low Certainty" archetype while rejecting a "Clean but Conservative" archetype sets a trap. In Phase 6, the high bidder will invent an excuse to drop their price by 40%, and your safe backup will be gone.
* **Carrying Too Many Bidders**: Recommending 5 buyers advance to DD seems safe, but it geometrically crushes Team Capacity in Phase 5 resulting in chaotic Q&A handling and across-the-board bidder frustration.
* **Excluding the Tension Asset**: Dropping the `Pressure Support Bidder` because their bid was slightly under market immediately causes the `Price Leader` to realize they are bidding against themselves. Tension collapses.
* **Unmanaged Client Joy**: Letting `clientExcitement` peak without executing "Challenge Headline-Price Bias" tasks means the client anchors to $100M. If DD reveals reality is $80M, the client fires the advisor later.

---

# 9. Resource Model for Phase 4
Phase 4 demands intense, short-burst capacity. 
The NBO deadline represents a temporal compression point. Buyers submit at the buzzer. The team must instantly spend massive Work units to read, normalize, and matrix the bids within 48-72 hours. 

If `availableCapacity` is low entering Phase 4, `bidComparability` stays low because the team literally doesn't have the hours to read the NBO footnotes, blinding the player to hidden conditions.

# 10. Pressure and Hidden Workload Model
Hidden workload in Phase 4 is derived from the structural messiness of the submissions.

* **Low Complexity Tasks** (e.g. Compare Headline Values): 10% chance a buyer used a different currency or gross/net phrasing, requiring minor rework.
* **High Complexity Tasks** (e.g. Normalise Bid Assumptions): 50% chance the team discovers a major EBITDA normalization disagreement hidden deep in the bid text, spawning a cascading "Clarify Valuation Math" task (High Work).

If `Pressure > 1.2`, the team completely misses "Subject to Financing" clauses in the NBOs, artificially inflating `certaintyVisibility` and leading the player into a lethal trap.

---

# 11. Offer Evaluation Matrix
Phase 4 relies heavily on a multi-dimensional offer reading system. The headline price (`$100M`) is almost never the actual enterprise value being offered.

**Hidden / Semi-Hidden Dimensions:**
* `Headline Price`: Highly visible. Often mathematically misleading.
* `Structure Quality`: Hidden until "Normalise Bid Assumptions" task is executed. (e.g., Does the $100M assume the founder leaves $20M in working capital behind?)
* `Certainty / Conditionality Burden`: Hidden until "Review Conditionality" task is run. (e.g., Is this subject to them raising a new fund first?)
* `Escalation Potential`: A hidden internal AI variable indicating if the buyer has room to push the bid up in Phase 6. Strategic buyers usually have higher escalation caps than Sponsors.

If the player advances buyers based purely on `Headline Price` without spending Work units to uncover `Structure Quality`, they are playing blind.

---

# 12. Offer Archetypes
Behind the scenes, every generated NBO assumes one of these canonical archetypes. The player must use UI tasks to correctly tag which archetype they are dealing with.

* **High Price, Low Certainty**: The classic trap. A huge headline number designed to ensure they get into DD, carrying a dozen escape clauses in the appendix. *Risk:* Will retrade aggressively in Phase 6.
* **Clean but Conservative**: A lower number, but fully cash-funded, no financing contingency, board approved. *Value*: The ultimate Phase 5 baseline protector.
* **Aggressive Strategic Stretch**: A massive synergy-backed bid from a Price Leader. *Risk:* Governance friction during DD.
* **Sponsor Platform Bid**: Standard private equity math. LBO modeled, highly predictable, average valuation.
* **Conditional Prestige Bid**: A top-tier logo bidding purely to secure an option, loaded with heavy exclusivity demands.
* **Fast but Underpriced**: Submitted two days early, clean structure, but 15% below market expectation. 
* **Noisy Defensive Bid**: Submitted merely to look inside the Data Room and scope out a competitor. Zero intention of closing.
* **Tactical Placeholder**: A bid submitted at the absolute minimum threshold to avoid auto-rejection.

---

# 13. Offer Comparability Logic
Offers rarely arrive looking the same.

**Canonical Comparability Patterns:**
* **Clean Comparable Set**: All buyers used the provided Process Letter template. Matrices map 1:1. (Requires high Phase 3 `Process Credibility`).
* **Price-Divergent but Readable Set**: Bids differ wildly in value but share structural math. Easy to interpret, hard to choose visually.
* **Structurally Messy Set**: One buyer bids on Enterprise Value, one on Equity Value, one includes an earn-out, one excludes real estate. *Visibility is near zero*.
* **Prestige-Distorted Set**: A massive Strategic buyer completely ignores your Process Letter and submits a 2-paragraph email stating "We will pay $X, grant us exclusivity."

If the engine determines the dealState holds a "Structurally Messy Set," the UI obfuscates the NBO comparison table until "Normalise Bid Assumptions" is heavily executed.

---

# 14. Client Interpretation and Price Bias
The client algorithm automatically locks onto the NBO with the highest `Headline Price`. 
If a `High Price, Low Certainty` trap offer is received, `clientExcitement` spikes, and `clientPriceBias` shifts entirely toward that bidder.

**Mechanics:**
If the advisor attempts to execute the "Exclude Weak Conditional Bidder" task against the highest numerical bidder, it will fail unless the advisor has previously executed "Challenge Headline-Price Bias" enough times to lower the client's excitement and raise `clientInterpretationQuality`. The advisor must spend capacity to teach the client the difference between a real offer and a fake one.

---

# 15. Phase 4 Task Library

## Offer Collection Tasks
* **Chase Missing NBO**: (Work: 5, Cost: 0, Complexity: Low). Prods a lagging buyer who missed the buzzer.
* **Accept Late NBO Under Conditions**: (Work: 0, Cost: 0, Complexity: Low). Lowers `processCredibility` but preserves optionality.
* **Reject Non-Compliant Submission**: (Work: 5, Cost: 0, Complexity: Medium). Kills a Noisy Defensive bid instantly. Boosts process discipline.

## Offer Analysis Tasks
* **Compare Headline Values**: (Work: 5, Cost: 0, Complexity: Low). Reveals the raw `$X` numbers in the UI.
* **Normalise Bid Assumptions**: (Work: 25, Cost: 0, Complexity: High). Massive work requirement. Converts raw headers into true Enterprise Value equivalents by adjusting for cash/debt.
* **Review Conditionality Profile**: (Work: 20, Cost: 5, Complexity: High). Internal legal review. Exposes the `Certainty` metric in the UI.
* **Build NBO Comparison Matrix**: (Work: 15, Cost: 0, Complexity: Medium). Major Deliverable. Compiles discovered values into a clean UI presentation.
* **Separate Headline Price from Real Quality**: (Work: 10, Cost: 0, Complexity: Low). Automatically flags "Trap" archetypes if Normalization has been done.

## Buyer Advancement Tasks
* **Build Recommendation for Next Round**: (Work: 15, Cost: 0, Complexity: High). Generates the proposed list.
* **Keep Borderline Bidder Alive**: (Work: 5, Cost: 0, Complexity: Low). 
* **Exclude Weak Conditional Bidder**: (Work: 5, Cost: 0, Complexity: Low).
* **Advance Premium Certainty Bidder**: (Work: 5, Cost: 0, Complexity: Low).
* **Advance Price Leader Despite Execution Risk**: (Work: 5, Cost: 0, Complexity: Medium). Adds a specific risk multiplier to Phase 5.

## Client / Internal Alignment Tasks
* **Present NBO Interpretation to Client**: (Work: 10, Cost: 0, Complexity: High). Battles the `clientExcitement` logic.
* **Challenge Headline-Price Bias**: (Work: 15, Cost: 0, Complexity: High). Spends Work to force the client to look at the Conditionality metrics.
* **Align on DD Invite List**: (Work: 10, Cost: 0, Complexity: Medium). Formally signs off the Phase 5 roster.

## Process Transition Tasks
* **Prepare DD Entry Package**: (Work: 20, Cost: 5, Complexity: Medium). Yields high `ddReadiness`.
* **Notify Advancing Buyers**: (Work: 5, Cost: 0, Complexity: Low). Formal communication triggering Phase 5 entry logic.
* **Tighten Next-Round Timetable**: (Work: 10, Cost: 0, Complexity: Low). Sets the stage for Phase 5 pacing.

---

# 16. Buyer Advancement Readability System
As analysis tasks are executed, the NBO UI cards upgrade their visible tags, guiding the player's advancement choice.

**Visible UI Interpretation Tags:**
* `Requires Normalization` -> The baseline state upon receipt.
* `Attractive but Risky` -> High Price, high conditionality revealed.
* `Clean Progression Candidate` -> Solid offer, standard terms, ready for DD.
* `Valuable for Tension` -> Underpriced, but strategically useful to keep the Price Leader scared.
* `Structurally Weak` -> Messy NBO, likely a drop.
* `Premium but Overconditioned` -> Great sponsor, but demands 30 days of exclusivity right now to proceed.

---

# 17. Integrated World Content Layer

### 17.1 NBO-Stage Buyer Identity Pools (Advancing Submissions)
* **Software**: *ApexCloud Systems* Submits the `Prestige-Distorted` email bid. *Silverline Tech Partners* submits the `Sponsor Platform Bid`.
* **Industrial**: *Vektor Heavy Industries* submits the `Aggressive Strategic Stretch`.

### 17.2 Buyer-Contact Identity Pools
* `Marcus Vance, Partner (Silverline Tech)`: "Enclosed is our NBO. Clean LBO model. Very little assumption risk here. Call me when you see our number."
* `Elena Rostova, Corp Dev VP (ApexCloud)`: "Please see attached indicative offer. It remains subject to board consultation and a 45-day tech diligence window."

### 17.3 Buyer Tone Library (NBO Sentiments)
* **Formal Bid Submission**: *"On behalf of Frontier Equity, we are pleased to submit this Non-Binding Indication of Interest..."*
* **Controlled Ambiguity**: *"Our valuation framework yields an enterprise value in the range of $80M - $105M, highly dependent on the outcome of our QofE findings and working capital targets."*
* **Prestige Signalling**: *"Given our unique strategic position in the market, we believe our offer represents the highest certainty of closure..."*

### 17.4 Internal Team Note Library
* **Comparability Issue**: *"Silverline priced on a cash-free basis, but ApexCloud included normalized working capital in their headline. We can't present this to the client yet; it looks like Apex bid $5M higher but they actually didn't."*
* **Bid-Quality Warning**: *"I read the footnotes on the Vektor bid. They inserted a clause making it contingent on retaining the entire engineering team. That's a massive risk."*

### 17.5 Client Message Library
* **Price Excitement**: *"Vektor bid $120M! This is incredible. Cancel the rest of the process, let's just go with them immediately."* (Requires intense advisor management).
* **Prestige Attachment**: *"I know ApexCloud's bid is lower, but I really want their logo on my website. Can we keep them in?"*

### 17.6 Headline / Market Context Library
* *"Sponsor Bids Soften on Debt Market Fears"* (Explains why the PE bids grouped together on the low side).
* *"Vektor Heavy Industries Announces Major Strategic Shift"* (Explains their aggressive out-of-bounds bid behavior).

### 17.7 Event Labels and NBO-Card Microcopy
* `[Subject to Financing]` (Red warning text revealed on Sponsor bids).
* `[Exclusivity Demanded]` (Warning tag forcing an immediate tactical choice).

---

# 18. Phase 4 Event Pool

* **High Headline Bid Masks Weak Certainty**
  * *Trigger*: "Review Conditionality" executed on a `High Price, Low Certainty` archetype.
  * *Effect*: UI reveals terrible structural terms. `offerCredibility` plummets.
* **Client Becomes Anchored to Top Number**
  * *Trigger*: NBOs received, player clicks "Next Cycle" without executing `Compare Headline Values` or `Challenge Bias` tasks.
  * *Effect*: `clientAlignment` locks to the highest bidder. Arguing against them now costs double Work capacity.
* **Prestige Buyer Overconditions Offer**
  * *Trigger*: NBO receipt from a Tier 1 Strategic.
  * *Effect*: They demand immediate exclusivity to enter Phase 5. Granting it kills the auction; denying it risks them walking away entirely.
* **Comparability Problem Emerges**
  * *Trigger*: Receiving a `Structurally Messy Set`.
  * *Effect*: Mandatory 20-Work task added to the queue to untangle the math before the Client Presentation can occur.
* **Late NBO Changes Interpretation**
  * *Trigger*: A `Pressure Support Bidder` submits 48 hours after deadline.
  * *Effect*: Do you reject them for discipline, or use their clean structure to bolster the comparison matrix?
* **Process Credibility Improves Through Strong NBO Set**
  * *Trigger*: `nboQuality` generated organically high.
  * *Effect*: Free massive boost to `processTension`.

---

# 19. Failure Conditions in Phase 4
* **Hard Failure (Busted Auction)**: 0 NBOs received. The market has comprehensively rejected the asset.
* **Hard Failure (Fired by Client)**: Forcefully excluding the highest bidder without properly normalizing the bids or educating the client first. Client trust hits 0.
* **Soft Failure (Garbage In, Garbage Out)**: Advancing 5 buyers without running "Normalise Bid Assumptions." You enter DD completely blind to their actual intentions, ensuring Phase 6 retrades will tear the deal apart.
* **Soft Failure (Loss of Tension)**: Advancing only 1 buyer. You transition to Phase 5 in an "Exclusivity" state, instantly stripping all your pricing leverage for the rest of the game.

---

# 20. Decay Rules for Phase 4
* `bidFreshness`: NBOs have a psychological shelf-life. If the player takes longer than 2 weeks to evaluate and notify the winners, the buyers assume the process is failing and their `Escalation Potential` decays.
* `clientTrust`: Decays rapidly if the NBOs come in far lower than the original `ValuationPotential` defined in Phase 1. 

---

# 21. UI Layout Recommendations for Vanilla JS
* **Left Panel (Inbox & Updates)**: Formal submission emails dropping the NBO payloads.
* **Center (The NBO Matrix)**: A grid comparing the surviving buyers based on: `Headline Price`, `Assumed Debt`, `Calculated EV`, `Conditionality`, `Timeline`. This grid starts heavily obscured (represented by ??) and clarifies as `Offer Analysis` tasks are executed.
* **Right Panel (Client & Interpretation)**: The client's portrait/status reacting dynamically to the highest visible number in the Center Matrix. Contains the `Advancement Roster` slots.
* **Lower Overlay (Phase Summary)**: The `bidComparability` tracker dial.

---

# 22. Recommended Deal State Shape for Phase 4
```js
const dealState = {
  id: "deal_004",
  phaseId: 4,
  
  resources: {
    budget: 80,
    maxCapacity: 60,
    usedCapacity: 55, // Spikes heavily due to matrix work
  },

  variables: {
    nboVolume: 3,
    nboQuality: 75,
    bidComparability: 20, // Low initially
    clientExcitement: 90,
    processTension: 85,
    clientInterpretationQuality: 30,
    ddReadiness: 10
  },

  workstreams: {
    offerCollection: { progress: 100, quality: 90 },
    offerInterpretation: { progress: 30, quality: 40 },
    bidComparability: { progress: 20, quality: 30 },
    buyerAdvancement: { progress: 0, quality: 0 },
    nextRoundReadiness: { progress: 40, quality: 50 }
  },

  nbos: [
    {
      buyerId: "buy_02", // Silverline (Anchor)
      archetype: "Clean but Conservative",
      headlinePrice: 85,
      calculatedEV: 85,
      normalizedVisibility: false,
      conditionality: "Low",
      advancementStatus: "pending"
    },
    {
      buyerId: "buy_01", // ApexCloud (Prestige)
      archetype: "High Price, Low Certainty",
      headlinePrice: 110,
      calculatedEV: 90, // Hidden until analysis
      normalizedVisibility: false,
      conditionality: "High (Exclusivity Trap)",
      advancementStatus: "pending"
    }
  ],

  advancingBuyers: [],
  excludedBuyers: ["buy_05"],
  
  riskDebt: 30,
  activeTasks: ["task_normalise_bids"],
  eventQueue: []
};
```

# 23. Recommended Core Functions for Vanilla JavaScript
* `getAvailablePhase4Tasks(dealState)`
* `receiveNBO(dealState, buyerId)` -> Populates the `nbos` array and fires Inbox events.
* `evaluateNBO(dealState, nboId)` -> Flips `normalizedVisibility` to true, revealing `calculatedEV` and `conditionality` strings to the UI.
* `classifyOfferArchetype(nboId)` -> Pure function identifying the hidden AI trap pattern behind a bid.
* `calculateBidComparability(dealState)` -> Checks how many NBOs have `normalizedVisibility: true`.
* `applyClientPriceBias(dealState)` -> Engine loop determining if the client is anchored to a toxic `HeadlinePrice`.
* `applyPhase4HiddenWorkload(task, currentPressure)`
* `updateBuyerAdvancementState(dealState, nboId, targetStatus)` -> Moves buyer into DD roster or Excluded bin.
* `checkPhase4Gate(dealState)` -> Validates that at least 1 buyer is Advancing and `ddReadiness > 80`.
* `generateNBOHeadline()` -> Pulls contextual news describing the NBO wave.

# 24. Recommended First Prototype Scope
To build the functional MVP of Phase 4:
1. Hard-code **3 NBO objects** inherited from the Phase 3 MVP.
2. Build the **NBO Comparison Matrix**. At spawn, `calculatedEV` is hidden behind a button labeled "Normalize Bid".
3. Add the **"Normalize Bid Assumptions"** task. Clicking it consumes Work, reveals the true `calculatedEV` numbers, and drops the massive "110" headline bid down to a real "90".
4. Build a volatile `clientExcitement` dial that maxes out when the "110" bid appears, and requires clicking a new **"Educate Client on Conditionality"** task to calm down before they allow you to click the "Advance to DD" button.
5. Gate transition to Phase 5 upon filling the `advancingBuyers` array with at least 1 normalized bid.

# 25. Design Philosophy for Phase 4
This phase teaches the player that *receiving offers is not the same as understanding them*. An NBO is not a winner announcement; it is an imperfect signal of value, conviction, and structure disguised as a legal document. 

A weak reading of an NBO sends a toxic buyer into Due Diligence, where they will spend 4 weeks wasting your client's time before dropping their price by 40%. A strong reading pierces the veil of the headline price, normalizes the math, educates the client, and carries a clean, tight, comparable group of buyers forward into the operational hell of Phase 5 while preserving maximum leverage.
