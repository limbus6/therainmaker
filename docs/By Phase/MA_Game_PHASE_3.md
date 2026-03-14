# M&A Dealmaker — Phase 3 Implementation Pack
## Shortlist & Process Architecture
## Compatible with HTML, CSS and Vanilla JavaScript

## Purpose
This document turns **Phase 3 — Shortlist** into an implementable game system. It is designed to be sufficiently concrete for direct implementation in HTML, CSS, and vanilla JavaScript using procedural state updates.

The goal of this phase is to answer the question:
“How do we move from broad engagement to a disciplined set of credible, competitive buyers capable of producing meaningful first-round offers?”

At this stage:
- Phase 2 noise is dying down
- initial NDAs are signed
- the buyer pool must be actively compressed
- the player must architect the competitive tension for the next phase
- client politics and emotional attachments to specific buyers flare up
- weak signals must be filtered from genuine interest

This phase stops being broad market exploration and becomes selective competitive management. It is not just about keeping the best buyers; it is about building a functional shortlist composition that preserves valuation leverage while protecting execution certainty.

---

# 1. Operational Purpose of Phase 3
Phase 3 is the architectural bridge between early marketing (Phase 2) and hard financial offers (Phase 4). Its operational purpose is to cull the herd of "tourists" (buyers fishing for data) and to legally and procedurally elevate the survivors into the Non-Binding Offer (NBO) phase.

If the advisor advances too many buyers, the firm's Team Capacity will shatter under the weight of answering 15 simultaneous Q&A tracking sheets. If the advisor advances too few, the asset becomes "price-tethered"—there is no credible threat to force bids higher. The ideal structural baseline is **4 buyers**, curated to assume specific tactical roles in the upcoming auction.

# 2. Phase 3 Core Player Experience
The intended player feeling during Phase 3 should emphasize:
- **Filtration under uncertainty**: Deciding who deserves time and access when signals are mixed.
- **Process design under pressure**: The tension between price potential and execution certainty.
- **Political judgment**: Managing the client’s emotional reaction to the inclusion of risky sponsors or the exclusion of prestigious but low-paying strategics.
- **Controlled concentration**: Resisting the temptation to keep too many names alive out of fear.
- **Tactical ambiguity**: Protecting optionality without diluting the process credibility.

# 3. Phase 3 Workstreams
Workstreams track the structural completion of the shortlist design process.

## Buyer Filtering
- **Measures**: The active mechanical process of separating serious contenders from tourists.
- **Low progress means**: The inbox is still a mess; no one has been officially rejected.
- **Low quality means**: We are using the wrong criteria, dropping high-payers out of laziness.

## Buyer Prioritisation
- **Measures**: Assigning the remaining live buyers into functional tiers.
- **Low progress means**: All remaining buyers are treated equally.
- **Low quality means**: We are overweighting noisy buyers over quiet but highly credible ones.

## Shortlist Composition
- **Measures**: The holistic balance of the chosen 4-5 survivors (e.g., mixing Strategics and Sponsors).
- **Low progress means**: We haven't formally picked the final group.
- **Low quality means**: The shortlist is structurally flawed (e.g., 4 identical private equity firms who will all hit the exact same LBO debt ceiling).

## Competitive Tension Management
- **Measures**: Keeping borderline buyers technically live to pressure the frontrunners.
- **Low progress means**: Buyers know they are practically alone in the process.
- **Low quality means**: We are bluffing so obviously that buyers call it and drop out.

## Client Alignment on Buyer Selection
- **Measures**: Getting the client to agree to exclude specific companies.
- **Low progress means**: The client refuses to sign off on the shortlist.
- **Low quality means**: The client forced their favorite (but financially weak) buyer into the shortlist against your advice.

## Offer Readiness Preparation
- **Measures**: Generating the First-Round Process Letter dictating the NBO rules.
- **Low progress means**: The buyers don't technically know how to submit a bid yet.
- **Low quality means**: The Process Letter has gaping legal holes destroying NBO comparability.

---

# 4. Phase 3 Deal Variables
Dynamic variables specific to the architecture of the shortlist.

* `shortlistQuality`: The raw combined capability of the surviving buyers to actually close the deal.
* `shortlistDepth`: The volume of credible names remaining.
* `shortlistCompositionScore`: A meta-score tracking role diversity (do we have a Price Leader AND a Certainty Anchor?).
* `buyerSeriousness`: A tracking array grading the market's response to the initial IM data.
* `competitiveTension`: The most important metric in Phase 3. Dictates `valuationPotential` multipliers.
* `processCredibility`: High if you enforce strict deadlines; drops if you grant constant extensions to whiny buyers.
* `exclusionRisk`: The danger of incorrectly dropping a buyer who was secretly preparing a massive pre-emptive bid.
* `optionality`: The ability to pivot the process if the primary buyer path fails.
* `clientShortlistBias`: The degree to which the client is attempting to overrule the advisor's logic.
* `shortlistNoise`: The volume of administrative drag generated by keeping weak buyers alive.
* `firstRoundOfferReadiness`: How well prepared the data room and process letters are to accept NBOs.
* `firstRoundOfferComparability`: The degree to which NBOs will arrive structurally identical (EBITDA vs Net Cash, etc.).

# 5. Firm-Level Variables Relevant to Phase 3
Phase 3 narrows focus and intensifies engagement, making certain firm-level variables highly volatile.

* `teamMorale`: Takes a massive hit if forced to service `shortlistNoise`.
* `teamWorkload`: Concentrates away from volume (Phase 2) into heavy analytical depth answering specific buyer Q&A.
* `processDiscipline`: A firm-level tracker. Yielding to extreme buyer demands lowers this, creating Risk Debt.
* `clientTrust`: Spent as currency. Proposing a controversial shortlist drains `clientTrust` to execute.

---

# 6. Phase 3 Gates
To successfully complete Phase 3 and transition to Phase 4 (NBOs), the engine checks the following:

**Logical Conditions:**
* `First-Round Process Note` deliverable is marked `Complete`.
* A final Shortlist of names has been locked and approved.
* The Client has formally signed off on the exclusions.

**Configurable Workstream Thresholds:**
* Shortlist Composition.progress = 100
* Client Alignment on Buyer Selection.progress >= 70
* Offer Readiness Preparation.progress >= 85

*Soft Zombie Gate*: You can theoretically launch Phase 4 with only 1 buyer or 12 buyers, but the structural algorithms will guarantee an immediate soft-failure in the next phase due to collapsed tension or instantaneous capacity burnout.

---

# 7. Hard and Soft Dependencies

## 7.1 Hard Dependencies
* **Build Provisional Shortlist**: Explicitly requires at least 2 buyers to be marked as `Credible` in the Phase 2 funnel.
* **Prepare First-Round Process Note**: Requires `Shortlist Composition.progress >= 50`. You cannot write rules until you know who is playing.

## 7.2 Soft Dependencies
* **Weak Phase 2 Follow-up**: If Phase 2 `responseBacklogPressure` was high, Phase 3 starts with inherently lower `competitiveTension` because buyers already sense firm weakness.
* **High Shortlist Noise**: Retaining more than 6 buyers drastically reduces the quality of `FirstRoundOfferComparability` because the team cannot properly standardize the Q&A responses for that many players.

---

# 8. Risk Debt in Phase 3
Phase 3 generates some of the most lethal delayed-fuse Risk Debt in the simulation.

* **Hoarding Weak Buyers**: Keeping 8 buyers alive feels safe, but it geometrically inflates admin burden. By Phase 5 (Due Diligence), the team will literally collapse physically, resulting in massive valuation retrades from the actual serious buyers who were ignored.
* **Eliminating the Wildcard Early**: Dropping a highly strategic but unusual buyer early reduces price tension later, flattening the ultimate NBO curve.
* **Client-Political Shortlists**: Allowing the client to force a "Prestige" strategic into the NBO round who has zero intention of paying up distorts the process and creates severe downstream NBO failure when their bid arrives at 50% of expectation.
* **Weak Comparability Prep**: If you skip "Formalise timeline for NBO phase," the NBOs in Phase 4 will arrive completely unstandardized, making "Apples-to-Apples" comparison impossible.

---

# 9. Resource Model for Phase 3
Phase 3 dramatically shifts the Resource Model constraint matrix.

In Phase 2, tasks were high-volume, low-work (e.g. sending 20 generic NDAs). 
In Phase 3, actions are low-volume, extremely high-work (e.g., executing "Compare Buyer Process Fit" takes 15 Work Units for just *one* specific buyer).

The player must use Budget and Work surgically. Allocating 25 Work Units to answer a Q&A pack from a "Noisy Survivor" PE firm literally steals that capacity from preparing the Process Letter for the "Price Leader." The player learns that time is a zero-sum weapon.

# 10. Pressure and Hidden Workload Model
Hidden workload spikes in Phase 3 are highly political and analytical.

* **Low Complexity Tasks** (e.g. Exclude Low-Fit Buyer): 10% chance the buyer appeals directly to the Founder, triggering a 10-Work "Defend Controversial Exclusion" mitigation task.
* **High Complexity Tasks** (e.g. Present Shortlist Recommendation): 50% chance the client rejects the logic due to `logoBias`, forcing a total rethink and draining massive `clientAlignment`.

If `Pressure > 1.2`, the internal team begins dropping balls on the comparisons, generating literal errors in the Q&A packs that carry over as `Risk Debt` into Phase 6.

---

# 11. Buyer Evaluation Matrix
Phase 3 replaces the binary "Interested/Not Interested" flags with a multi-dimensional buyer profile.

**Hidden / Semi-Hidden Dimensions:**
* `Hidden Seriousness`: Will they actually bid, or are they fishing for market IP?
* `Price Potential`: The theoretical ceiling of their valuation model.
* `Certainty`: Will they actually close the deal, or will they drop at the first sign of macro trouble?
* `Governance Friction`: How painfully slow their internal Board approvals are.

**Visible UI Dimensions:**
The user interface never explicitly shows a "90% Certainty" number. Instead, the UI interprets these values through microcopy tags:
* *UI Tag*: "Known for dropping late in diligence." (Translates to Low Certainty).
* *UI Tag*: "Currently closing an aggressively over-levered fund." (Translates to Low Price Potential, High Governance Friction).

---

# 12. Buyer Role Architecture
The engine explicitly recognizes canonical shortlist roles. A robust shortlist of 4 buyers optimally contains overlapping coverage of these archetypes.

* **Price Leader**: A strategic buyer capable of paying massive synergies. *Risk*: Can become arrogant and demand exclusivity early.
* **Certainty Anchor**: A top-tier sponsor with $5B dry powder. They won't pay the highest price, but if everyone else drops out, their check will clear in 30 days. *Value*: Puts a hard floor on the NBOs.
* **Pressure Support Bidder**: A mid-market player you keep alive purely to scare the Price Leader into thinking it's a hot auction.
* **Wildcard Upside**: A random international conglomerate entering the space. *Risk*: 80% chance they drop out due to governance, 20% chance they overpay massively.
* **Prestige Strategic (Logo)**: The client loves them because they are famous. The advisor hates them because they almost never actually acquire mid-cap assets.
* **Noisy Survivor**: A buyer who asks 500 questions a day but lacks the capital to actually win. Must be killed quickly.

---

# 13. Shortlist Composition Logic
A shortlist containing 4 "Price Leaders" is actually a **Fragile Shortlist**, because if the macro market turns, all 4 highly-levered strategics might drop simultaneously.

**Canonical Shortlist Patterns:**
* **Balanced Shortlist**: (1 Price Leader, 1 Certainty Anchor, 1 Pressure, 1 Wildcard). Generates maximum `processCredibility` and baseline `competitiveTension`.
* **Price-Heavy Shortlist**: High upside, but massive Phase 6 execution risk.
* **Certainty-Heavy Shortlist**: (4 Sponsors). NBO arrival is guaranteed, but the valuation multiplier defaults to a lower industry average. Safe, boring outcome.
* **Noisy Shortlist**: (6+ buyers). `competitiveTension` is superficially high, but `shortlistNoise` crushes team capacity, ruining NBO comparability.

---

# 14. Client Politics and Preference Distortion
Client interference operates as a major system layer in Phase 3. 
By default, `clientShortlistBias` is Medium. 

**Mechanics:**
The client's AI evaluates the surviving buyer pool with a massive logic misfire algorithm:
* **The Logo Bias**: The client artificially assigns +30 `Hidden Seriousness` to highly prestigious names (e.g. ApexCloud Systems) even if the buyer is legally stalling.
* **The Anti-Sponsor Bias**: The founder "hates Private Equity" and will resist advancing the Certainty Anchor.

The player must spend `Work Units` on tasks like "Defend Controversial Inclusion" to override the client. If they yield to the client, the `shortlistCompositionScore` structurally breaks, poisoning Phase 4.

---

# 15. Phase 3 Task Library

## Buyer Assessment Tasks
* **Score Buyer Seriousness**: (Work: 15, Cost: 0, Complexity: Medium). Refines UI tags, upgrading "Potentially Credible" to "Serious Contender".
* **Assess Strategic vs PE Credibility**: (Work: 10, Cost: 0, Complexity: Low). Updates the Governance Friction metadata.
* **Review Buyer Question Patterns**: (Work: 20, Cost: 0, Complexity: High). Massive work drain. Identifies if a buyer is on a fishing expedition.
* **Separate Warm Interest from Weak Conviction**: (Work: 10, Cost: 0, Complexity: Low). Eliminates `shortlistNoise`.

## Shortlist Design Tasks
* **Build Provisional Shortlist**: (Work: 15, Cost: 0, Complexity: High). Triggers the Composition Check algorithms.
* **Exclude Low-Fit Buyer Cluster**: (Work: 10, Cost: 0, Complexity: Medium). Kills off 3-4 noisy survivors instantly. 50% chance to anger client if a "Logo" was inside.
* **Retain Optional Backup Bidder**: (Work: 5, Cost: 0, Complexity: Low). Keeps a buyer technically alive but paused in the queue.
* **Create Shortlist Rationale Memo**: (Work: 15, Cost: 0, Complexity: Medium). Protects against client pushback.

## Competitive-Tension Tasks
* **Signal Competitive Progress Selectively**: (Work: 10, Cost: 0, Complexity: High). Leaking tactical hints of hot competition to the Certainty Anchor to force their price up.
* **Keep Borderline Buyer Warm**: (Work: 5, Cost: 0, Complexity: Low). Cheap action to prevent a Phase 2 survivor from going cold.

## Client / Internal Alignment Tasks
* **Present Shortlist Recommendation to Client**: (Work: 10, Cost: 0, Complexity: High). The core gate battle. Highly sensitive to `clientShortlistBias`. 
* **Defend Controversial Exclusion**: (Work: 15, Cost: 0, Complexity: High). Costs massive Work to argue with the Founder about killing a bad buyer.
* **Run Internal Challenge Session**: (Work: 10, Cost: 0, Complexity: Low). Firm partners review the list, occasionally catching a Governance Friction flag you missed.

## Offer-Readiness Tasks
* **Prepare First-Round Process Note**: (Work: 30, Cost: 5, Complexity: High). Major Deliverable. Spikes `firstRoundOfferComparability`.
* **Ready Q&A Support for Serious Buyers**: (Work: 25, Cost: 0, Complexity: High). Pre-loads capacity to survive Phase 4.
* **Formalize Timeline for NBO Phase**: (Work: 10, Cost: 0, Complexity: Low). Locks the process schedule.

---

# 16. Buyer Seriousness / Shortlist Readability System
In Phase 3, the buyer cards upgrade their status text from Phase 2 processing states into deep analytical tags.

**Visible UI Seriousness Tags:**
* `Passive Interest` -> Still in the system, but mathematically useless.
* `Watching but Uncommitted` -> Waiting to see if the auction gets hot before spending resource dollars on diligence.
* `Credible but Slow` -> High Certainty, High Governance Friction.
* `Serious Contender` -> Active Q&A, fast NDA turn, strong fit.
* `Strategic Wildcard` -> Unpredictable behavior patterns.
* `Politically Attractive but Weak` -> The client loves them, but the numbers don't add up.
* `Exclude from Next Round` -> Death mark pending client approval.

---

# 17. Integrated World Content Layer

### 17.1 Shortlist Buyer Identity Pools (Surviving Profiles)
Based on Phase 2 generation, these buyers survive into Phase 3 with deep backstories.
* **Software**: *ApexCloud Systems* (Prestige Strategic, high logo bias, very slow mover). *Silverline Tech Partners* (Sponsor Certainty Anchor, highly aggressive).
* **Industrial**: *Vektor Heavy Industries* (Strategic Price Leader, massive synergies, demands early exclusivity).

### 17.2 Buyer-Contact Identity Pools
Messages in Phase 3 escalate from Analysts up to decision-makers.
* `Marcus Vance, Partner (Silverline Tech)`: Direct, impatient, focus on timeline certainty.
* `Elena Rostova, Corp Dev VP (ApexCloud)`: Cautious, governance-heavy, requires massive Q&A handholding.

### 17.3 Buyer Tone Library
* **Governance-Heavy Delay**: *"Our internal investment committee requires a deeper breakdown of the SaaS metrics before we can formalize a sponsor mandate for the NBO layer. Extension requested."*
* **Competitive Posture Emerging**: *"We understand this is a highly competitive process, but we will walk if you cannot promise a targeted management presentation prior to NBO submission."*
* **Soft Defense Against Exclusion**: *"We know we missed the deadline on the core Q&A, but our CEO is flying in next week. Please keep us in the loop."*

### 17.4 Internal Team Note Library
* **Shortlist Ambiguity**: *"I can't tell if Vektor is stalling because they hate the numbers, or stalling because their committee is on holiday."*
* **Process Dilution Warning**: *"We are servicing 9 buyers right now. The associates haven't slept in three days. The Q&A quality is dropping. Recommend we cull the bottom 4 immediately."*

### 17.5 Client Message Library
* **Logo Attachment**: *"I saw you marked ApexCloud for exclusion. They are the biggest name in the industry. Absolutely not. Keep them in."*
* **Fear of Losing Tension**: *"If we drop the three smaller PE funds, won't Silverline Tech realize they are basically bidding against themselves?"*

### 17.6 Headline / Market Context Library
* *"Software Valuations Cool Following Minor Tech Rout: Sponsors Demand Better Visibility"* (Damages General Price Potential).
* *"ApexCloud Announces C-Suite Shakeup"* (Spikes Governance Friction for that specific buyer).

### 17.7 Event Labels and Buyer-Card Microcopy
* `[Flight Risk]` (Warning tag on a Priority Buyer).
* `[Client Favorite]` (Modifier preventing easy exclusion UI clicks).

---

# 18. Phase 3 Event Pool

* **Premium Buyer Becomes Serious**
  * *Trigger*: A Strategic Wildcard hits 3 cycles of active Q&A.
  * *Effect*: Immediately re-classifies as `Price Leader`. `competitiveTension` spikes.
* **Strategic Buyer Slows Under Governance**
  * *Trigger*: Random check on any Strategic with size > $10B.
  * *Effect*: Buyer generates a request to delay the NBO deadline by 2 weeks. Refusal breaks them out of the process; acceptance pisses off the fast-moving Sponsors.
* **Client Resists Excluding Weak Buyer**
  * *Trigger*: Moving a `[Client Favorite]` to the `Exclude` list.
  * *Effect*: Blocks the exclusion. Forces mandatory "Defend Controversial Exclusion" task (High Work).
* **Weak Buyer Consumes Disproportionate Attention**
  * *Trigger*: Keeping a `Noisy Survivor` alive while Pressure > 1.0.
  * *Effect*: Buyer submits a 100-question Excel tracker. Instantly drains 30 Work Capacity.
* **Internal Team Questions Shortlist Logic**
  * *Trigger*: Establishing a `Noisy Shortlist` composition (6+ buyers).
  * *Effect*: `teamMorale` drops heavily. Team begs for process discipline.

---

# 19. Failure Conditions in Phase 3
* **Hard Failure**: Moving to Phase 4 with 0 or 1 buyer. The process collapses entirely as competitive tension ceases to exist mathematically.
* **Hard Failure (Client Rebellion)**: Attempting to force an NBO rule-set entirely contrary to `clientAlignment`. You are fired.
* **Soft Failure (Lethal Dilution)**: Advancing 8 chaotic buyers into Phase 4. Team Capacity instantly exceeds 200% upon NBO generation, dropping `firstRoundOfferComparability` to 0, ensuring no deals can be analyzed and the process dies in a confusing slog.
* **Soft Failure (False Comfort)**: Advancing 4 PE Sponsors with identical LBO return metrics. You get bids, but they will never exceed standard market multiples. Valuation upside destroyed.

---

# 20. Decay Rules for Phase 3
* `buyerSeriousness`: Decays rapidly if they receive no active engagement or signals from the advisor while left on the borderline.
* `competitiveTension`: Bleeds out cycle-over-cycle if the NBO deadline isn't set quickly. Momentum is a perishable commodity.
* `clientTrust`: Erosively decays if the player constantly argues against `Logo Bias` without providing `Create Shortlist Rationale Memos`.

---

# 21. UI Layout Recommendations for Vanilla JS
* **Left Panel (Client & Critical Alerts)**: Inbox is now reserved only for the surviving serious buyers and VIP Client reactions. Noise is visually removed.
* **Center (The Shortlist Board)**: A drag-and-drop or ranking list matrix. Buyers exist either in the `Pending Shortlist`, `Approved Shortlist`, or `Excluded Bin`. Contains visual role tags (e.g. `[Anchor]`).
* **Right Panel (Process Dashboard)**: Tracking the overarching `Composition Score`, `Tension Indicator`, and the `Comparability` dial reading readiness for Phase 4.
* **Lower Overlay (Exclusion Log)**: A historical ledger tracking who was killed and why, preventing player confusion.

---

# 22. Recommended Deal State Shape for Phase 3
```js
const dealState = {
  id: "deal_003",
  phaseId: 3,
  
  resources: {
    budget: 90,
    maxCapacity: 60,
    usedCapacity: 45,
  },

  variables: {
    shortlistQuality: 85,
    shortlistDepth: 4,
    shortlistCompositionScore: 70, // Measured organically by analyzing 'buyer.role' overlaps
    competitiveTension: 80,
    processCredibility: 90,
    exclusionRisk: 15,
    clientAlignment: 65,
    firstRoundOfferComparability: 40 // Rises with prep tasks
  },

  workstreams: {
    buyerFiltering: { progress: 85, quality: 90 },
    buyerPrioritization: { progress: 60, quality: 75 },
    shortlistComposition: { progress: 40, quality: 60 },
    clientAlignmentOnSelection: { progress: 50, quality: 50 },
    offerReadiness: { progress: 10, quality: 0 }
  },

  shorlistBoard: {
    approved: ["buy_02", "buy_05"],
    pending: ["buy_01", "buy_08", "buy_11"],
    excluded: ["buy_03", "buy_04"]
  },

  buyers: [
    {
      id: "buy_02",
      name: "Silverline Tech Partners",
      visibleState: "Serious Contender",
      assignedRole: "Certainty Anchor",
      clientFavorite: false,
      governanceFriction: "Low",
      noiseLevel: 2
    },
    {
      id: "buy_01",
      name: "ApexCloud Systems",
      visibleState: "Credible but Slow",
      assignedRole: "Prestige Strategic",
      clientFavorite: true,
      governanceFriction: "High",
      noiseLevel: 5
    }
  ],

  strategicProcessChoice: "Targeted Auction",
  riskDebt: 25,
  activeTasks: ["task_score_seriousness"],
  eventQueue: []
};
```

# 23. Recommended Core Functions for Vanilla JavaScript
* `getAvailablePhase3Tasks(dealState)`
* `evaluateBuyerSeriousness(buyerId)` -> Exposes hidden metadata tags to the UI.
* `assignBuyerRole(buyerId, roleId)` -> Appends formal archetype logic to a combatant.
* `calculateShortlistCompositionScore(dealState)` -> Pure function checking the `approved` array for healthy archetype distribution (e.g. Price + Anchor + Wildcard = 95 Score. 4 Anchors = 40 Score).
* `applyClientShortlistBias(dealState)` -> Checks if the player dropped a `clientFavorite` and violently generates a UI warning Event.
* `applyShortlistHiddenWorkload(task, currentPressure)`
* `updateBuyerShortlistState(buyerId, targetList)` -> Moves buyers between pending/approved/excluded.
* `checkPhase3Gate(dealState)` -> Verifies `OfferReadiness.progress` and `approved` array sizes.
* `generateShortlistHeadline()`

# 24. Recommended First Prototype Scope
To build the functional MVP of Phase 3:
1. Hard-code **6 buyer cards** passing over from Phase 2.
2. Build the **Drag-to-Approve / Drag-to-Exclude** UI array lists.
3. Hook up the `calculateShortlistCompositionScore()` array mapping. Prove mathematically that putting only Sponsors in the Approved column renders a "Fragile Composition" warning banner.
4. Add the **"Present Shortlist Recommendation"** task; if a `clientFavorite` is in the Excluded bin, immediately bounce the task and drain `clientAlignment`.
5. Gate transition to NBO upon achieving an Approved array size of between 2 and 5, with the `Process Note` task completed.

# 25. Design Philosophy for Phase 3
This phase teaches the player that *not all live buyers are equally valuable*. A shortlist is not just a smaller list; it is a deliberate act of process architecture. 

A weak shortlist poisons the next phase quietly. If you cave to the client and fill the list with famous logos who have zero intention of bidding, or if you keep too many noisy tourists alive because you are afraid of losing them, your team will drown in Q&A and your NBO comparisons will be unusable. A strong shortlist produces comparability, tension, and credible offer dynamics. Culling the herd requires massive discipline.
