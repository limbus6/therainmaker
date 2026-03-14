# M&A Dealmaker — Phase 6 Implementation Pack
## Final Offers
## Compatible with HTML, CSS and Vanilla JavaScript

## Purpose
This document turns **Phase 6 — Final Offers** into an implementable game system. It is designed to be sufficiently concrete for direct implementation in HTML, CSS, and vanilla JavaScript using procedural state updates.

The goal of this phase is to answer the question:
“How do we extract final value from the surviving field and choose the bidder most likely to maximise outcome while remaining executable?”

At this stage:
- Due Diligence has concluded for the surviving buyers
- the management presentations are over
- the buyers have submitted their final legally binding marks on the SPA
- the client expects to see numbers significantly higher than the Phase 4 NBOs
- the advisor must recommend who to grant Exclusivity, effectively shutting down the auction.

This phase is not just about receiving better offers; it is about detecting *False Winners*. The highest number is often attached to the weakest contract. The objective is to identify whether aggressive improvement is credible or fragile, and to lock in a Preferred Bidder while intentionally preserving a Backup Bidder to maintain leverage moving into Phase 7.

---

# 1. Operational Purpose of Phase 6
Phase 6 is the final competitive extraction point. 

Operationally, the advisor must receive Final Offers containing definitive price and legal mark-ups, score them across multiple dimensions (not just headline price), manage the client's emotional reaction to the final numbers, and make a formal recommendation. 

Selecting the wrong bidder here—seduced by a massive price tag attached to terrible structural conditions—guarantees a brutal retrade in Phase 7 or a total closing failure in Phase 8.

# 2. Phase 6 Core Player Experience
The intended player feeling during Phase 6 should emphasize:
- **Final competitive tension**: The rush of opening the last sealed envelopes.
- **Valuation versus executable reality**: The realization that the $150M bid is functionally impossible to close, while the $130M bid can sign tomorrow.
- **Danger of false clarity**: The anxiety that a bid looks *too* good.
- **Narrowing optionality**: The terrifying moment of calling the 3rd place bidder to tell them they lost.
- **Preferred-bidder pressure**: The heavy responsibility of advising the client to reject the highest numerical bidder in favor of a safer execution path.

# 3. Phase 6 Workstreams
Workstreams track the evaluation of the final submissions.

## Final Offer Collection
- **Measures**: The mechanical receipt of the final bids and SPA mark-ups by the deadline.
- **Low progress means**: A key buyer is demanding an extension at the 11th hour.
- **Low quality means**: They submitted a price but refused to mark up the legal contract.

## Final Offer Interpretation
- **Measures**: Decomposing the final bid into its absolute, unconditioned cash value.
- **Low progress means**: We haven't read the 40-page legal annex.
- **Low quality means**: We misunderstood their working capital peg.

## Bid Improvement Extraction
- **Measures**: The delta between their Phase 4 NBO and their Phase 6 Final Offer.
- **Low progress means**: The buyers held their NBO price without improving.
- **Low quality means**: The buyers improved the price but added a massive earn-out structure to do it.

## Executability Assessment
- **Measures**: The actual probability that the bidder will wire the funds at closing.
- **Low progress means**: We haven't asked for their final debt commitment letters.
- **Low quality means**: Their equity check is coming from a fund that hasn't closed yet.

## Preferred Bidder Selection
- **Measures**: The internal alignment on declaring the winner.
- **Low progress means**: The team is split.
- **Low quality means**: We chose the highest price despite massive Red Flags in their SPA mark-up.

## Backup Bidder Preservation
- **Measures**: Keeping the #2 bidder warm and hungry.
- **Low progress means**: We told the backup they lost too early.
- **Low quality means**: The backup knows they are the backup and has checked out.

## Client Alignment on Final Recommendation
- **Measures**: Convincing the client to accept the advisor's logic over their own emotional response.
- **Low progress means**: The client is shouting at the advisor.
- **Low quality means**: The client accepts the recommendation but fundamentally doesn't believe it.

## Exclusivity Readiness
- **Measures**: Drafting the formal legal lock-out agreement.
- **Low progress means**: We are entering Phase 7 without legal protection.
- **Low quality means**: We drafted an Exclusivity agreement that binds us, but leaves the buyer free to walk.

---

# 4. Phase 6 Deal Variables
Dynamic variables specific to the final extraction.

* `finalOfferStrength`: The raw numerical power of the bids relative to original expectations.
* `finalOfferComparability`: How easily the Phase 6 matrix reads. (Low if they heavily edited the SPA).
* `bidImprovement`: The gross multiplier applied to the NBO baseline.
* `improvementElasticity`: An internal buyer stat. How much can a specific archetype be pushed before they crack?
* `executableCertainty`: The inverse of `FalseWinnerRisk`. High certainty = the money is real.
* `winnerCurseRisk`: Triggers if a buyer stretches over 150% of their fundamental valuation capacity to win.
* `falseWinnerRisk`: High numerical value, but contingent on impossible future events (e.g. massive earn-outs).
* `clientPriceAnchoring`: The client's obsession with the highest number on the page.
* `preferredBidderConfidence`: The advisor's belief in the chosen winner.
* `backupBidderStrength`: The credibility of the threat you hold in reserve for Phase 7.
* `exclusivityReadiness`: The formal gating metric to enter Phase 7.
* `residualTension`: Are the buyers still bidding against each other, or do they know who won?
* `conditionalDrag`: The mathematical deduction applied to a bid because of its legal caveats.

# 5. Firm-Level Variables Relevant to Phase 6
The pressure of Phase 6 relies on the gravity of the decision.

* `recommendationCredibility`: The advisor's currency. You spend this to force a skeptical client to accept a lower, safer bid.
* `analyticalConfidence`: Reverts to its original role. High confidence means you catch legal traps in the SPA quickly.
* `clientTrust`: The safety net. If `clientTrust` collapses here, the client fires the advisor and runs the negotiation themselves, triggering an immediate "Bad Action" end-game slider.

---

# 6. Phase 6 Gates
To successfully complete Phase 6 and transition to Phase 7 (SPA Negotiation), the engine checks the following:

**Logical Conditions:**
* A `Preferred Bidder` has been formally designated in the deal state.
* An `Exclusivity Agreement` has been signed with the Preferred Bidder.

**Configurable Workstream Thresholds:**
* Executability Assessment.progress >= 80
* Client Alignment on Final Recommendation.progress >= 70

*Zombie Gate*: You can technically advance with an atrocious `falseWinnerRisk` buyer, practically guaranteeing a massive explosion in Phase 7.

---

# 7. Hard and Soft Dependencies

## 7.1 Hard Dependencies
* **Preferred Bidder Logic**: The engine physically cannot trigger the Phase 7 UI without a `dealState.preferredBidder` mapped.

## 7.2 Soft Dependencies
* **Phase 5 Retrade Ghost**: If a buyer accumulated high `retradeRisk` in Phase 5 due to uncontained issues, their `bidImprovement` modifier in Phase 6 will be negative. They will actually drop their price below their Phase 4 NBO.
* **Phase 3 Field Quality Echo**: If you relied entirely on `High Price, Low Certainty` archetypes from Phase 3, Phase 6 will present you with three massive numbers that are all legally un-closable, triggering a brutal `False Winner` dilemma.
* **Backup Bidder Vacuum**: If you exit Phase 5 with only 1 buyer, `residualTension` drops to 0. That buyer's Final Offer will flatline, and your `backupBidderStrength` will be 0, crippling you in Phase 7.

---

# 8. Risk Debt in Phase 6
Phase 6 forces the player to lock in the destiny of the deal.

* **Selecting the False Winner**: Yielding to client pressure and picking the highest number with terrible conditions converts `FalseWinnerRisk` into `Phase7RetradeVelocity`. The deal will bleed value every week in the next phase.
* **Abandoning the Backup**: Formally rejecting the 2nd place bidder too aggressively creates zero `backupBidderStrength`. When the Preferred Bidder stalls in Phase 7, the advisor has no leverage to threaten them with.
* **Winner's Curse Realized**: Pushing a `Price Leader` too hard over their `improvementElasticity` limit forces them to win, but causes severe governance friction on their end, delaying Phase 8 closing by months.

---

# 9. Resource Model for Phase 6
Phase 6 is a low-workload, high-consequence phase. 
Unlike the massive computational grind of Phase 5 Due Diligence, Phase 6 requires relatively little Team Capacity to execute tasks. However, the *Complexity* of the tasks is uniformly High. The resource drain is primarily felt through `recommendationCredibility` and the sheer strategic danger of the buttons pressed.

# 10. Pressure and Hidden Workload Model
Hidden workload in Final Offers revolves around legal obfuscation.

* **Low Complexity Tasks** (e.g. Compare Final Offer Values): 10% chance the raw number is mathematically misleading.
* **High Complexity Tasks** (e.g. Score Executability): 50% chance the team discovers a new, deeply buried liability cap adjustment in the SPA, triggering an intense "Clarify Final Bid Terms" cascade.

If `Pressure > 1.2`, the team misses the "Material Adverse Change" clause modifications entirely, silently reducing the `executableCertainty` of the bid without the player knowing.

---

# 11. Final Offer Evaluation Matrix
The Phase 6 UI centers around the Final Matrix. 

**Dimensions:**
* `Headline Value`: Visible immediately upon receipt.
* `Adjusted Cash Value`: Hidden until "Evaluate Retrade Risk" is run. Converts the headline down by applying the `conditionalDrag`.
* `Execution Risk`: Semi-hidden. Derived from the buyer's archetype and DD survival state.
* `SPA Aggression`: Hidden. A measure of how many redlines they put through the legal purchase agreement.

The player must choose: The $150M bid with 40% Execution Risk, or the $130M bid with 5% Execution Risk.

---

# 12. Bid Improvement Mechanics
Every surviving buyer calculates their Final Offer based on a complex algorithm:

**Final Offer = NBO Baseline * (Conviction Modifier) - (Phase 5 Retrade Risk) + (Competitive Responsiveness x Tension)**

* **Improvement Headroom**: A strategic buyer has a higher headroom cap than a financial sponsor.
* **Conviction Ceiling**: The absolute max they will pay. Once hit, no amount of pressure moves them.
* **Fatigue Drag**: If their `buyerFatigue` maxed out in Phase 5, their Conviction Modifier drops significantly.
* **Sponsor Discipline Threshold**: Private Equity buyers will explicitly refuse to improve if their internal Rate of Return (IRR) model dips below 20%.

---

# 13. False Winner Detection
A `False Winner` is the engine's favorite trap for negligent players.

**Mechanics of a False Winner:**
1. Generates the highest `Headline Value` in the Matrix.
2. Spikes `clientPriceAnchoring` to maximum.
3. Contains high `conditionalDrag` (e.g., $30M is tied to impossible Year 3 revenue targets).
4. Submits a highly aggressive SPA markup that shifts all legal risk to the seller.

**Detection:** The player must spend Work to run the "Test Apparent Winner Robustness" task. If successful, the UI will physically restate the `Adjusted Cash Value`, dropping the $150M bid down to $110M and correctly exposing them as the weaker option.

---

# 14. Winner's Curse Risk
If the player executes the "Preserve Live Fallback Tension" task repeatedly, they can artificially inflate the bids.

However, if a buyer's Final Offer exceeds 130% of their original NBO, the engine silently flags `winnerCurseRisk = true`. 
*Consequence*: The buyer will win the asset, but their Investment Committee will panic internally in Phase 7, causing massive delays, attempts to fire target-company management post-close, and aggressive nickel-and-diming over working capital mechanics to claw back the money they overpaid.

---

# 15. Preferred Bidder Selection Architecture
The structural climax of the phase. 

**The System State output requires three explicit variable assignments:**
1. `Preferred Bidder`: The party entering Exclusivity.
2. `Backup Bidder`: The runner-up. Must be assigned, or `backupStrength` defaults to 0. (Can be assigned as "None").
3. `Exclusivity Stance`:
    * *Hard Exclusivity*: Total legal lock-out. Best for completing the deal faster, worst for leverage if things go wrong.
    * *Soft Exclusivity*: "We are prioritizing you, but we reserve the right to talk to others." Hard to extract from buyers, but preserves massive leverage.

---

# 16. Final Offer Archetypes
Behind the scenes, the NBO archetypes from Phase 4 have mutated based on Phase 5 DD outcomes.

* **Loud but Hollow Winner**: The classic False Winner. Massive headline, terrible structure.
* **Clean and Executable Winner**: The holy grail. Improved price, minimal SPA markups, clean financing.
* **Understated but Strong Backup**: Held their price from NBO, but accepted the SPA perfectly. The perfect fallback option.
* **Strategic Stretch with Governance Risk**: Paid huge money, hit `Winner's Curse Risk`. Execution will be a nightmare.
* **Late Strengthening Backup**: A buyer who looked weak in Phase 4 but coasted cleanly through Phase 5, emerging with a highly credible final mark.
* **Drop-Down Retrade**: A buyer who used Phase 5 issues to justify a Final Offer that is 20% lower than their NBO. Disastrous if they are the only surviving buyer.

---

# 17. Phase 6 Task Library

## Final-Offer Collection Tasks
* **Confirm Final Offer Receipt**: (Work: 5, Cost: 0, Complexity: Low). Unlocks the Matrix.
* **Clarify Final Bid Terms**: (Work: 10, Cost: 0, Complexity: Medium). Triggers a check against `SPA Aggression`.
* **Accept Revised Final Bid**: (Work: 0, Cost: 0, Complexity: Low).
* **Chase Delayed Bidder Update**: (Work: 5, Cost: 0, Complexity: Medium). 

## Bid Analysis Tasks
* **Compare Final Offer Values**: (Work: 10, Cost: 0, Complexity: Low). Populates the `Headline Value` row.
* **Score Executability**: (Work: 20, Cost: 10, Complexity: High). Spends Legal Budget to reveal the `Execution Risk` row.
* **Assess Hidden Conditional Drag**: (Work: 15, Cost: 0, Complexity: High). Exposes Earn-outs and deferrals, adjusting the true Cash Value.
* **Build Final Recommendation Matrix**: (Work: 10, Cost: 0, Complexity: Medium). Formal deliverable creation.
* **Test Apparent Winner Robustness**: (Work: 15, Cost: 0, Complexity: High). The explicit "False Winner" detection tool.

## Recommendation Tasks
* **Recommend Preferred Bidder**: (Work: 10, Cost: 0, Complexity: High). Locks the internal advisor stance.
* **Name Backup Bidder**: (Work: 5, Cost: 0, Complexity: Low). Assigns the secondary threat variable.
* **Preserve Live Fallback Tension**: (Work: 15, Cost: 0, Complexity: Medium). Communicates to the backup that they are very close, keeping their `buyerFatigue` low.
* **Challenge Client Price Anchoring**: (Work: 20, Cost: 0, Complexity: High). Drains massive Work to lower `clientPriceAnchoring` when a False Winner is present.

## Client / Internal Alignment Tasks
* **Present Final-Offer Recommendation**: (Work: 15, Cost: 0, Complexity: High). The milestone check against client alignment. Will fail if `clientPriceAnchoring` favors a different bidder than the advisor's recommendation.
* **Align on Exclusivity Strategy**: (Work: 10, Cost: 0, Complexity: Medium). Sets the `Exclusivity Stance`.

## Transition Tasks
* **Notify Preferred Bidder**: (Work: 5, Cost: 0, Complexity: Low). Triggers exactly one buyer into Phase 7 status.
* **Notify Backup Bidder**: (Work: 10, Cost: 0, Complexity: Medium). Requires delicate phrasing to maintain `backupStrength`.
* **Notify Non-Selected Parties**: (Work: 5, Cost: 0, Complexity: Low). Formally drops remaining buyers.
* **Prepare Exclusivity Transition Pack**: (Work: 15, Cost: 5, Complexity: Low). Generates the gate to Phase 7.

---

# 18. Buyer Advancement / Winner Readability System
As analysis tasks are executed, the final UI Matrix updates the buyer cards to guide the player away from False Winners.

**Visible UI Interpretation Tags:**
* `Highest Headline` -> Baseline state on receipt.
* `Strong but Fragile` -> High Execution Risk exposed.
* `Best Executable Bid` -> The mathematical ideal. High certainty, solid price.
* `Valuable Backup` -> Clean structure, lower price.
* `High Price with Warning Signs` -> The explicit False Winner flag.
* `Credible but Capped` -> The Sponsor Discipline max-out.
* `Conditionality Heavy` -> Massive Earn-out structure detected.

---

# 19. Integrated World Content Layer

### 19.1 Final-Offer Buyer Identity Pools
* **ApexCloud Systems**: Returns a `Loud but Hollow` False Winner bid. Massive headline, but they require a 60-day delayed closing to raise debt.
* **Silverline Tech Partners**: Returns a `Credible but Capped` bid. A solid, clean LBO markup, exactly 8% higher than their NBO.

### 19.2 Buyer-Contact Identity Pools
* `Julian Mercer (Silverline)`: "Attached is our final, binding markup. Equity is fully committed. We have reached our ceiling. We look forward to your call."
* `Elena Rostova (ApexCloud)`: "We are thrilled to submit this premium offer. Note that our SPA markup includes standard carve-outs for the pending litigation we discussed in DD."

### 19.3 Buyer Tone Library (Final Conviction)
* **Disciplined Sponsor**: *"Our Investment Committee has authorized this as our final and best number. The structure is entirely clean."*
* **Strategic Pressure**: *"We believe our valuation vastly exceeds standalone prospects. This offer expires in 48 hours."*
* **Backup Preservation Language (Advisor to Buyer)**: *"Your offer was exceptionally strong, but we have granted a narrow exclusivity window to another party. Given the closeness of the bids, we strongly suggest you hold your modeling team in place."*

### 19.4 Internal Team Note Library
* **False Winner Alert**: *"Apex's $150M includes a $40M earn-out attached to EBITDA targets they control post-close. It's essentially a $110M bid disguised as a premium."*
* **Recommendation Confidence**: *"If the client forces us to take Apex, we are going to get murdered in the SPA negotiations next month."*

### 19.5 Client Message Library
* **Price Excitement**: *"Apex just blew Silverline out of the water! $150M! Tell Silverline they lost and let's sign with Apex tonight."*
* **Trust vs Emotion**: *"I hate the earn-out structure, but it's so much higher... if you really believe Silverline is the better execution path, I'll back your play."*

### 19.6 Headline / Market Context Library
* *"Sponsors Hold Firm Amidst Strategic Overbidding"* (Context for why the PE bid looks low but clean).
* *"Earn-Out Structures Surge in Tech M&A"* (Context for the False Winner trap).

### 19.7 Event Labels and Final-Card Microcopy
* `[Binding Commitment]`
* `[Heavy SPA Markup]`
* `[Winner's Curse Risk]`

---

# 20. Phase 6 Event Pool

* **Top Bid Raises Hidden Concern**
  * *Trigger*: "Assess Hidden Conditional Drag" on the False Winner.
  * *Effect*: UI reveals a 30% discount to True Cash Value. `clientPriceAnchoring` becomes hostile.
* **Client Anchors on Headline Price**
  * *Trigger*: NBO bids are > 20% apart in numerical value.
  * *Effect*: Automatically forces the advisor to spend 40 Work via "Challenge Anchoring" before they can select the cleaner, lower bid.
* **Strategic Buyer Reaches Conviction Ceiling**
  * *Trigger*: Inherited from Phase 5 Fatigue.
  * *Effect*: Their `bidImprovement` modifier is physically capped at 1.0x (no improvement from NBO).
* **Backup Bidder Strengthens Late**
  * *Trigger*: `residualTension` > 80.
  * *Effect*: The #3 bidder suddenly submits a completely clean, no-contingency offer that rivals the #2 bidder.
* **Winner’s Curse Warning Emerges**
  * *Trigger*: A buyer improves their bid by > 40%.
  * *Effect*: A silent flag triggers. Phase 7 and 8 closing difficulty multipliers increase by 200%.
* **Exclusivity Pressure Increases**
  * *Trigger*: Selecting a Preferred Bidder.
  * *Effect*: The winner demands immediate `Hard Exclusivity`, forcing the player to choose between capitulating (losing leverage) or pushing back (risking the deal).

---

# 21. Failure Conditions in Phase 6
* **Hard Failure (No Executable Bids)**: All surviving buyers from Phase 5 submit offers with `Execution Risk` > 90%. The deal is fundamentally un-closable.
* **Hard Failure (Client Rebellion)**: Attempting to force the client to accept a bid that is 30% numerically lower than the highest bid, without effectively running the "Align Client" tasks. Client trust falls to 0, you are fired.
* **Soft Failure (Selection of the False Winner)**: Selecting the $150M False Winner. You technically complete Phase 6, but you enter Phase 7 with a hostile, over-conditioned buyer who will mathematically force a massive retrade during the SPA phase.
* **Soft Failure (Naked Exclusivity)**: Entering Phase 7 without setting a `Backup Bidder`. You hand total Pricing Leverage to the buyer.

---

# 22. Decay Rules for Phase 6
* `finalBidFreshness`: Buyers will not wait forever after submitting binding offers. At cycle 3, they threaten to withdraw. At cycle 4, they drop their price by 5%.
* `backupBidderStrength`: Decays by 15% every cycle after the Preferred Bidder is notified, as the backup slowly reassigns their deal teams to other projects.

---

# 23. UI Layout Recommendations for Vanilla JS
* **Left Panel (The Reveal)**: High-impact visualization of the Final Offers coming in. The "Sealed Envelope" effect.
* **Center (The Selection Matrix)**: A dense, comparative grid. `Headline Value` in large bold font. Below it, the dynamically revealed `True Adjusted Cash`, `Execution Risk Bar`, and `SPA Redline Count`.
* **Right Panel (Client / Recommendation)**: The `clientPriceAnchoring` dial (redline indicator if anchored incorrectly). The `Select Preferred` and `Select Backup` assignment drop-downs.
* **Lower Overlay (Exclusivity Stance)**: A toggle switch for the exclusivity strategy transitioning into Phase 7.

---

# 24. Recommended Deal State Shape for Phase 6
```js
const dealState = {
  id: "deal_006",
  phaseId: 6,
  
  resources: {
    budget: 45, 
    maxCapacity: 60,
    usedCapacity: 30, // Lower workload, higher stress
  },

  variables: {
    finalOfferStrength: 115, // 15% premium over NBO
    falseWinnerRisk: 80, // Danger detected
    clientPriceAnchoring: 95, // Hostile
    recommendationConfidence: 0,
    residualTension: 85,
    backupBidderStrength: 0, // Pending assignment
  },

  workstreams: {
    offerCollection: { progress: 100, quality: 100 },
    offerInterpretation: { progress: 40, quality: 30 }, // Unread traps
    executabilityAssessment: { progress: 20, quality: 20 },
    preferredSelection: { progress: 0, quality: 0 },
    clientAlignment: { progress: 10, quality: 10 }
  },

  finalOffers: [
    {
      buyerId: "buy_01", // ApexCloud (False Winner)
      archetype: "Loud but Hollow",
      nboBaseline: 110,
      headlineFinal: 150,
      adjustedCash: 105, // Lower than NBO due to earn-out
      executionRisk: 75,
      spaAggression: "Extreme",
      improvementModifier: 1.36
    },
    {
      buyerId: "buy_02", // Silverline (Clean)
      archetype: "Best Executable Bid",
      nboBaseline: 85,
      headlineFinal: 105,
      adjustedCash: 105,
      executionRisk: 5,
      spaAggression: "Light",
      improvementModifier: 1.23
    }
  ],

  preferredBidder: null,
  backupBidder: null,
  exclusivityStance: "pending",
  
  riskDebt: 55, // Retrade damage inherited
  activeTasks: ["task_score_executability", "task_challenge_anchoring"],
  eventQueue: []
};
```

# 25. Recommended Core Functions for Vanilla JavaScript
* `getAvailablePhase6Tasks(dealState)`
* `receiveFinalOfffers(dealState)` -> Converts surviving Phase 5 buyers into Final Offer objects applying `improvementElasticity`.
* `evaluateFinalOffer(dealState, buyerId)` -> Calculates the `adjustedCash` and exposes `executionRisk`.
* `detectFalseWinner(offerArray)` -> AI logic flagging the delta between Headline and Adjusted cash.
* `applyClientPriceAnchoring(dealState)` -> Forces client alignment toward the highest headline number.
* `selectPreferredBidder(dealState, buyerId)` -> Locks the primary lane for Phase 7.
* `assignBackupBidder(dealState, buyerId)` -> Locks the secondary baseline threat.
* `calculatePhase6ExitRisk(dealState)` -> Validates if the player selected a False Winner.
* `checkPhase6Gate(dealState)` -> Validates `preferredBidder` is set and Exclusivity is aligned.
* `renderPhase6UI()` -> The high-tension reveal Matrix.

# 26. Recommended First Prototype Scope
To build the functional MVP of Phase 6:
1. Hard-code **2 Final Offer objects**.
2. **Buyer A** is the False Winner ($150M Headline, $100M Actual, 80% Risk). **Buyer B** is the Clean Executable ($120M Headline, $120M Actual, 10% Risk). 
3. The UI initially only shows the Headline metrics. The `clientExcitement` dial maxes out pointing at Buyer A.
4. Add the **"Score Executability"** task. Clicking it reveals the True Adjusted Cash and the Risk Bars.
5. Add the **"Challenge Client Anchoring"** task. The player must click this twice (using Work) before the UI physically allows them to assign Buyer B as the `Preferred Bidder`.
6. Gate transition to Phase 7 upon locking Buyer B as Preferred and Buyer A as Backup.

# 27. Design Philosophy for Phase 6
This phase teaches the player that *the final round is not a beauty contest for numbers*. 

A final offer is only as good as its ability to survive exclusivity, legal negotiation, and closing reality. The best visible winner is almost never the best *real* winner. The job of the advisor is not merely to celebrate the top number and cash the check; it is to protect the client from their own greed, pierce the legal obfuscation of the SPA, recommend the best path to an executable outcome, and hold a backup bidder hostage to ensure the winner doesn't retrade the moment the auction ends.
