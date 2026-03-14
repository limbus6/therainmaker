
# M&A Dealmaker — Action Library (Phase 0 & Phase 1)

This document defines the action catalogue for the early phases of the M&A Dealmaker simulation.

All actions follow the same schema so they can be processed by the game engine.

## Action Schema

- name
- category
- phase
- cost (budget consumed)
- work (team capacity consumed)
- complexity (Low / Medium / High)
- hidden_work_probability
- hidden_work_range
- effects

Complexity determines hidden workload probability:

| Complexity | Hidden Workload Probability |
|------------|-----------------------------|
| Low        | 10%                         |
| Medium     | 30%                         |
| High       | 50%                         |

---

# Phase 0 — Deal Origination / Pitch

Goal: Validate the opportunity and secure the advisory mandate.

Typical workload of the phase: ~40–50 work units.

## Relationship Building

Founder Intro Meeting  
Cost: 3  
Work: 5  
Complexity: Medium  
HiddenWork: 30% (3–6)  
Effects: ClientAlignment +5, DealMomentum +2

Informal Industry Dinner  
Cost: 4  
Work: 4  
Complexity: Low  
HiddenWork: 10% (2–4)  
Effects: ClientAlignment +4, InformationBase +2

Board Member Introduction  
Cost: 5  
Work: 6  
Complexity: Medium  
HiddenWork: 30% (3–6)  
Effects: ClientAlignment +6, MandateProbability +4

Founder Strategy Discussion  
Cost: 3  
Work: 6  
Complexity: Medium  
HiddenWork: 30% (3–6)  
Effects: InformationBase +4, PitchStrength +2

Early Valuation Discussion  
Cost: 2  
Work: 4  
Complexity: Low  
HiddenWork: 10% (2–4)  
Effects: ClientAlignment +3, Risk +1

Share Market Insights  
Cost: 2  
Work: 3  
Complexity: Low  
HiddenWork: 10% (2–3)  
Effects: ClientAlignment +2, DealMomentum +1

---

# Phase 1 — Preparation

Goal: Transform the mandate into a market-ready asset.

Typical workload of the phase: ~100 work units.

## Financial Analysis

Financial Deep Dive  
Cost: 5  
Work: 12  
Complexity: Medium  
HiddenWork: 30% (6–10)  
Effects: DataQuality +6, ValuationPotential +0.2

Revenue Quality Analysis  
Cost: 4  
Work: 10  
Complexity: Medium  
HiddenWork: 30% (5–8)  
Effects: DataQuality +5

Cost Structure Review  
Cost: 4  
Work: 10  
Complexity: Medium  
HiddenWork: 30% (5–8)  
Effects: DataQuality +5

Margin Bridge Analysis  
Cost: 4  
Work: 8  
Complexity: Medium  
HiddenWork: 30% (4–7)  
Effects: DataQuality +4

Working Capital Analysis  
Cost: 4  
Work: 9  
Complexity: Medium  
HiddenWork: 30% (4–7)  
Effects: Risk −1

Forecast Stress Test  
Cost: 5  
Work: 12  
Complexity: High  
HiddenWork: 50% (6–10)  
Effects: ValuationPotential +0.3

## Materials Creation

Draft Teaser  
Cost: 4  
Work: 8  
Complexity: Medium  
HiddenWork: 30% (4–6)  
Effects: BuyerInterestPotential +4

Draft Information Memorandum  
Cost: 12  
Work: 30  
Complexity: High  
HiddenWork: 50% (10–15)  
Effects: BuyerInterestPotential +10, PreparationProgress +15

Prepare Management Presentation  
Cost: 5  
Work: 10  
Complexity: Medium  
HiddenWork: 30% (4–8)  
Effects: ClientTrust +5

Financial Model Integration  
Cost: 6  
Work: 15  
Complexity: High  
HiddenWork: 50% (8–12)  
Effects: DataQuality +7

Prepare Executive Summary  
Cost: 4  
Work: 8  
Complexity: Medium  
HiddenWork: 30% (4–6)  
Effects: EquityStoryStrength +4

## Buyer Universe

Map Strategic Buyers  
Cost: 5  
Work: 10  
Complexity: Low  
HiddenWork: 10% (2–4)  
Effects: BuyerUniverse +8

Map Private Equity Buyers  
Cost: 4  
Work: 8  
Complexity: Low  
HiddenWork: 10% (2–4)  
Effects: BuyerUniverse +7

Map International Buyers  
Cost: 5  
Work: 10  
Complexity: Medium  
HiddenWork: 30% (4–6)  
Effects: BuyerUniverse +9

Build Long List  
Cost: 4  
Work: 8  
Complexity: Low  
HiddenWork: 10% (2–3)  
Effects: BuyerUniverse +6

Buyer Intelligence Deep Dive  
Cost: 6  
Work: 12  
Complexity: Medium  
HiddenWork: 30% (5–8)  
Effects: BuyerInterestPotential +5

## Data Room Preparation

Data Room Structure  
Cost: 4  
Work: 10  
Complexity: Medium  
HiddenWork: 30% (4–6)  
Effects: DataQuality +4

Upload Financials  
Cost: 4  
Work: 10  
Complexity: Medium  
HiddenWork: 30% (4–6)  
Effects: DataQuality +4

Upload Legal Documents  
Cost: 4  
Work: 10  
Complexity: Medium  
HiddenWork: 30% (4–6)  
Effects: Risk −1

Quality Check Data Room  
Cost: 5  
Work: 12  
Complexity: Medium  
HiddenWork: 30% (5–8)  
Effects: DataQuality +6

Final Data Room Validation  
Cost: 5  
Work: 10  
Complexity: Medium  
HiddenWork: 30% (5–8)  
Effects: Risk −2

---

Design target:

Phase 0 → 30 actions  
Phase 1 → 90 actions  
Total system → 120 actions
