\# M\&A Dealmaker — Workstreams System Specification



\## Purpose



This document defines the \*\*Workstream System\*\*, the core mechanism used to represent the progress of deals in the M\&A Dealmaker simulation.



Workstreams measure \*\*progress across the different dimensions of a transaction process\*\*.



They translate task execution into structured deal progression.



---



\# Conceptual Model



Deals do not progress in a single linear sequence.



Instead, they evolve through \*\*multiple parallel workstreams\*\* that advance at different speeds.



Example:



\- relationship building may advance quickly

\- valuation understanding may lag

\- buyer landscape may be incomplete



The interaction between these workstreams determines whether the deal can move forward.



---



\# Workstreams vs Tasks



Important distinction.



Tasks are actions performed by the team, defined strictly in the central **Action Library** (`MA_Game_Action_Library_Phase0_Phase1.md`).

Workstreams measure **progress in the deal process** which are advanced exclusively by executing these actions. Every action dictates explicit `Effects` that mathematically increase the `Progress` or `Quality` metrics of a workstream.

Example:

Action: `Prepare Founder Meeting`  
Workstream impact: `Relationship Development` +10

---



\# Workstream Structure



Each workstream contains two metrics.



Progress  

Quality



Both range from 0 to 100.



---



\## Progress



Represents \*\*how much work has been completed\*\*.



Example:



Target Intelligence



0 → no information  

50 → basic understanding  

100 → full understanding



---



\## Quality



Represents \*\*how reliable and robust the work is\*\*.



Example:



Valuation Framing



Progress 60 / Quality 25



Means:



work has been done  

but assumptions are weak



Low quality increases risk later.



---



\# Quality Importance



Quality influences later outcomes.



Examples:



Low quality valuation analysis may cause:

- unrealistic founder expectations
- buyer retrades
- negotiation breakdown

Low quality buyer mapping may cause:

- weak buyer competition
- lower offers

In later phases, the consequences of `Quality` become brutal. For example, poor 'Target Intelligence' executed back in Phase 0 translates directly into severe 'Risk Exposure' catastrophes during Phase 6 (Due Diligence). High `Progress` merely means you rushed the work; high `Quality` means the work survives contact with hostile private equity auditors.

Quality therefore directly affects **deal outcomes**.



---



\# Workstream Progress Mechanism



Tasks contribute progress.



Example:



Financial Intelligence Task



Target Intelligence +20 progress  

Target Intelligence +10 quality



Some tasks increase progress but not quality.



Example:



Quick Research



+15 progress  

+2 quality



Others focus on quality improvement.



Example:



Deep Analysis



+5 progress  

+15 quality



---



\# Workstream Dependencies



Certain workstreams influence others.



Example:



Target Intelligence affects Valuation Framing.



Relationship Development affects Qualification.



Buyer Landscape affects Marketing.



Dependencies ensure realistic sequencing.



---



\# Workstream Thresholds



Each phase requires minimum thresholds.



Example:



Pitch phase may require:



Relationship Development ≥ 60  

Qualification ≥ 50  

Target Intelligence ≥ 40



These thresholds act as \*\*gates\*\*.



---



\# Workstream Decay



Some workstreams may decay over time.



Examples:



Relationship strength may fade without contact.



Market intelligence may become outdated.



Decay introduces time pressure.



---



\# Risk Debt



Low quality in early workstreams generates \*\*Risk Debt\*\*.



Risk Debt increases probability of problems in later phases.



Examples:



Weak qualification  

Poor valuation framing  

Incomplete buyer mapping



Risk Debt surfaces during:



Due Diligence  

SPA Negotiations  

Final Closing



---



\# Workstream Categories by Phase



\## Phase 0 — Deal Origination



Target Intelligence  

Relationship Development  

Qualification  

Valuation Framing  

Confidentiality \& Conflicts  

Pitch Readiness



---



\## Phase 1 — Pitching



Pitch Preparation  

Client Trust Building  

Deal Strategy Definition



---



\## Phase 2 — Preparation



Information Collection  

Financial Analysis  

Equity Story Development  

Documentation Quality



---



\## Phase 3 — Market Outreach



Buyer Landscape  

Teaser Distribution \& NDA Signature  

Buyer Screening \& Interest Testing



---



\## Phase 4 — IM Distribution \& Bidder Engagement



IM \& Data Pack Disclosure  

Buyer Questions Resolution  

Trust Maintenance



---



\## Phase 5 — NBO Analysis, Short Listing \& DD Entry



Offer Comparison \& Clarification  

Bidder Ranking  

DD Shortlisting



---



## Phase 6 — Due Diligence

Information Accuracy  
Risk Exposure  
Management Defensibility

---

## Phase 7 — BO / BAFO

Binding Offer Generation  
Competitive Tension Maintenance  
Valuation Maximization

---

## Phase 8 — SPA Negotiation

Negotiation Leverage  
Legal Clarity  
Deal Certainty

---

## Phase 9 — Signing

Execution Coordination  
Regulatory Clearance Preparation

---

## Phase 10 — Closing

Fund Transfer Coordination  
Transaction Completion

---



\# Workstream Data Structure (Conceptual)



Example representation.



