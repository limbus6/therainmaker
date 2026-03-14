\# M\&A Dealmaker — Risk \& Outcome System Specification



\## Purpose



This document defines the \*\*Risk \& Outcome System\*\*, which determines how deals evolve toward success or failure in the M\&A Dealmaker simulation.



While:



\- \*\*Tasks\*\* represent work performed

\- \*\*Workstreams\*\* represent deal progress

\- \*\*Events\*\* represent narrative developments



the \*\*Risk \& Outcome System\*\* determines the \*\*final consequences of those elements\*\*.



This system ensures that:



\- deal outcomes are uncertain

\- early decisions have long-term consequences

\- weak execution increases failure probability



---



\# Conceptual Model



The outcome of a deal is not deterministic.



Instead, it follows the structure:



Expected Result + Controlled Variance



Expected Result depends on:



\- workstream progress

\- workstream quality

\- deal variables

\- market conditions



Variance introduces uncertainty.



---



\# Outcome Layers



The system evaluates outcomes across three layers.



\## 1. Operational Layer



Measures execution quality.



Key inputs:



Workstream progress  

Workstream quality  

Task execution quality



This layer determines how well the process has been run.



---



\## 2. Market Layer



Represents external market forces.



Examples:



Market Sentiment  

Sector Multiples  

Buyer Liquidity  

Macroeconomic conditions



These factors affect:



\- buyer interest

\- valuation levels

\- deal timing



---



\## 3. Behavioral Layer



Represents human decision-making.



Examples:



Founder expectations  

Buyer confidence  

Trust between parties  

Negotiation dynamics



This layer introduces volatility.



---



\# Risk Debt



Risk Debt is a hidden variable that accumulates when early decisions are weak.



Examples:



Overpromising valuation  

Weak qualification of founder motivations  

Incomplete financial understanding  

Poor buyer mapping



Risk Debt may not affect early stages but increases the probability of problems later.



---



Risk Debt can surface during:

Phase 6 — Due Diligence  
Phase 7 — BO / BAFO  
Phase 8 — SPA Negotiation  
Phase 9 — Signing

The consequences become severely amplified because the buyer has already been granted exclusivity. A failure cascade from Phase 4 (IM Distribution) where financials were not thoroughly scrubbed will guarantee discovering hidden risks during Phase 6 (Due Diligence).

Examples:



Buyers discover hidden risks  

Buyers retrade price  

Founder loses confidence  

Negotiations collapse



---



# Risk Debt Accumulation

Risk Debt increases when:

* Workstream quality is low  
* Player triggers a high 'Hidden Workload' event and fails to allocate Additional Work capacity to solve it  
* Player skips key tasks  
* Player accelerates process prematurely



Example:



Pitching without proper qualification.



---



\# Risk Debt Resolution



Risk Debt can be reduced by:



Additional analysis  

Relationship management  

Improved documentation



However, late mitigation is often costly.



---



\# Buyer Competition Model



Buyer competition is one of the most important drivers of deal outcomes.



Competition depends on:



Buyer Landscape workstream  

Marketing effectiveness  

Deal attractiveness  

Market sentiment



---



\## Competition Effects



High competition:



\- increases valuation

\- improves deal certainty



Low competition:



\- reduces offers

\- increases negotiation risk



---



\# Valuation Model



Each deal has a \*\*valuation baseline\*\*.



Baseline depends on:



Revenue  

EBITDA  

Growth  

Sector multiples



---



\## Valuation Adjustments



Valuation is adjusted by:



Buyer competition  

Market conditions  

Perceived risk  

Quality of equity story



---



\## Example



Baseline EV:



€40M



Adjustments:



Competition bonus +10%  

Risk discount −5%  

Market sentiment +3%



Final EV:



€42.8M



---



\# Offer Generation

During the offer phase, buyers generate bids. The NBO multiple depends on a mathematical integration of previous phases:

CompetitionFactor = 1 + 0.05 × (ActiveBidders − 1)
PreparationFactor = 1 + (PreparationQuality − 50) / 200
InfoFactor = 1 + (InformationConfidence − 50) / 250
MarketFactor = 1 + (MarketTemperature − 50) / 150
ExpectationAnchorFactor = 1 + (ExpectationAnchor − BaselineMultiple) / (BaselineMultiple × 4)

ExpectedMultiple = 
BaselineMultiple ×  
CompetitionFactor ×  
PreparationFactor ×  
InfoFactor ×  
MarketFactor ×  
ExpectationAnchorFactor

Each buyer generates its own NBO:
OfferMultiple = ExpectedMultiple × BuyerBias × RandomNoise

BuyerBias depends on buyer type:
- strategic buyer
- private equity buyer
- opportunistic buyer

RandomNoise represents controlled variance.

---



\# Offer Distribution



Offers are generated within a range.



Example:



Low competition:



€32M – €38M



High competition:



€38M – €48M



---



\# Deal Failure Conditions



Deals may fail for multiple reasons.



Examples:



Founder rejects offers  

Buyers withdraw during diligence  

Legal risks discovered  

Negotiations collapse



Failures often result from \*\*multiple small issues interacting\*\*.



---



\# Outcome Resolution



At each phase, the engine evaluates:



1\. Workstream state

2\. Risk Debt

3\. Market conditions

4\. Random variance



These inputs determine whether the deal:



progresses  

stalls  

fails



---



\# Failure Cascades



Some failures occur gradually.



Example:



Weak financial understanding  

↓



Buyer discovers issues in diligence  

↓



Buyer retrades price  

↓



Founder refuses retrade  

↓



Deal collapses



---



\# Success Conditions



Successful deals require:



Strong workstream progress  

High workstream quality  

Low Risk Debt  

Healthy buyer competition  

Positive market conditions



---



\# Player Feedback



The game should communicate outcomes through:



buyer reactions  

founder communications  

market signals



Players should infer the causes of success or failure.



---



\# Data Structure (Conceptual)



Example representation.





DealOutcomeModel {

expected\_value

variance



workstream\_inputs

market\_inputs

behavioral\_inputs



risk\_debt



competition\_level



}





---



\# Design Principles



The outcome system should:



reward disciplined execution  

penalize shortcuts  

reflect real M\&A dynamics  

maintain uncertainty



The player should feel that:



good preparation increases probability of success  

but certainty is never guaranteed.



---



\# Next Design Step



The next step is defining the \*\*Phase Architecture\*\*, detailing:



\- micro-phases within each stage

\- phase gates

\- key decisions

\- task libraries for each phase



starting with:



Phase 0 — Deal Origination

