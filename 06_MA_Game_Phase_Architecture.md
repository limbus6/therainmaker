\# M\&A Dealmaker — Phase Architecture Specification

\## Compatible with HTML, CSS and Vanilla JavaScript



\## Purpose



This document defines the \*\*Phase Architecture\*\* of the M\&A Dealmaker simulation.



Its purpose is to translate the real-world sell-side M\&A process into a structure that is:



\- operationally realistic

\- narratively rich

\- compatible with the simulation engine

\- simple enough to implement in \*\*HTML, CSS and vanilla JavaScript\*\*



This document assumes the game is built without frameworks.



Therefore, the phase system must be:



\- modular

\- data-driven

\- easy to render from JSON-like objects

\- manageable with simple state objects and procedural update functions



---



\# Design Principle



The game should not model each phase as a fixed linear sequence.



Instead, each phase is represented by:



\- a set of \*\*active workstreams\*\*

\- a set of \*\*available tasks\*\*

\- a set of \*\*phase-specific events\*\*

\- a set of \*\*gates\*\*

\- a set of \*\*failure conditions\*\*



Each phase is therefore a \*\*state container\*\* with its own logic.



This is especially important for vanilla JavaScript implementation, because it allows the game to operate through:



\- one central state object

\- phase configuration objects

\- reusable rendering functions



---



\# High-Level Phase Model



Each deal moves across 10 macro phases:



0. Deal Origination  
1. Pitch / Mandate Acquisition  
2. Preparation  
3. Market Outreach  
4. IM Distribution & Bidder Engagement  
5. NBO Analysis, Short Listing & DD Entry  
6. Due Diligence  
7. BO / BAFO  
8. SPA Negotiation  
9. Signing  
10. Closing



Each phase has:



\- objectives

\- workstreams

\- gates

\- risks

\- tasks

\- event pools



---



\# Recommended Vanilla JS Data Model



Each phase should be defined as a plain object.



Example structure:



```js

const phaseDefinition = {

&nbsp; id: 0,

&nbsp; name: "Deal Origination",

&nbsp; objectives: \[],

&nbsp; workstreams: \[],

&nbsp; gates: \[],

&nbsp; tasks: \[],

&nbsp; events: \[],

&nbsp; failConditions: \[]

};

````



This should be kept in static config files or constant objects.



The game engine should read from these definitions and update the main game state.



---



\# Core Rules for Phase Design



\## 1. Phases are not timelines



A phase is not a list of steps.



A phase is a \*\*bundle of parallel progress systems\*\*.



This is important both for realism and for implementation simplicity.



---



\## 2. Progress is not enough



Each workstream must track:



\* progress

\* quality



Because many M\&A problems arise not from lack of activity, but from low-quality execution.



---



\## 3. Early phases must be lightweight



For vanilla JS implementation, early phases should avoid too many micro-systems at once.



The player should understand:



\* what the deal is

\* what needs to happen

\* what resources are available

\* what might go wrong



without facing overwhelming UI complexity.



---



\## 4. Later phases can become denser



Complexity should increase as the deal advances.



This mirrors real M\&A and makes the game easier to learn.



---



\# Universal Phase Structure



Each phase should be designed using the following template.



\## Phase Definition Template



\### 1. Phase Description



What this phase represents operationally.



\### 2. Objectives



What must be achieved to move forward.



\### 3. Active Workstreams



Which dimensions of progress matter in this phase.



\### 4. Dependencies



Hard and soft dependencies between workstreams.



\### 5. Gates



Thresholds required to advance.



\### 6. Available Tasks



Tasks the player can trigger.



\### 7. Typical Events



Narrative events likely to occur in this phase.



\### 8. Key Decisions



Strategic decisions that affect future outcomes.



\### 9. Failure Conditions



How the deal can stall or die.



\### 10. UI Notes



How this phase should be represented in vanilla HTML/CSS/JS.



---



\# Phase 0 — Deal Origination



\## 1. Description



Deal Origination is the phase in which the advisory firm identifies, qualifies and develops a potential sell-side opportunity before a formal mandate exists.



At this stage:



\* the company is not yet a client

\* access is partial

\* information is incomplete

\* timing is uncertain

\* competing advisors may exist



The purpose of the phase is to transform a raw lead into a \*\*qualified pitch opportunity\*\*.



---



\## 2. Objectives



Main objectives:



\* understand the target sufficiently

\* establish founder access

\* assess whether the opportunity is worth pursuing

\* frame an initial valuation view

\* manage confidentiality

\* become ready to enter Pitching



---



\## 3. Active Workstreams



Recommended workstreams:



\### Target Intelligence



How well the advisory firm understands the company.



\### Relationship Development



How strong access and trust are with the founder or decision-maker.



\### Qualification



How clearly the opportunity has been assessed in terms of fit, timing, and probability of mandate conversion.



\### Valuation Framing



How robust the initial view on valuation and value drivers is.



\### Confidentiality \& Conflicts



How well confidentiality is being preserved and whether any conflict issues exist.



\### Pitch Readiness



How prepared the firm is to move into a formal pitch process.



---



\## 4. Dependencies



\### Hard Dependencies



\* Pitch Readiness cannot advance meaningfully without Qualification progress.

\* Formal pitch cannot start if Confidentiality \& Conflicts is below minimum threshold.

\* Valuation Framing requires minimum Target Intelligence.



\### Soft Dependencies



\* Weak Relationship Development reduces founder responsiveness.

\* Weak Qualification increases Risk Debt.

\* Weak Confidentiality control increases rumor probability.



---



\## 5. Gates



Suggested gate for moving to Phase 1:



\* Target Intelligence ≥ 40

\* Relationship Development ≥ 60

\* Qualification ≥ 50

\* Valuation Framing ≥ 35

\* Confidentiality \& Conflicts ≥ 30

\* Pitch Readiness ≥ 40



These values should be configurable in plain objects.



---



\## 6. Available Tasks



Examples:



\* Founder Research

\* Sector Mapping

\* Prepare Founder Meeting

\* Founder Intro Call

\* Qualification Analysis

\* Conflict Check

\* Preliminary Valuation Analysis

\* Buyer Landscape Sketch

\* Internal Go / No-Go Review



Tasks should be stored as data objects and filtered by phase.



---



\## 7. Typical Events



Examples:



\* Founder replies to intro email

\* Competing advisor appears

\* Market rumor emerges

\* Founder asks for valuation indication

\* Sector news affects attractiveness

\* Internal referral arrives

\* Founder invites CFO to next call



---



\## 8. Key Decisions



Examples:



\* pursue or drop the lead

\* aggressive vs conservative valuation framing

\* broad relationship approach vs discreet approach

\* invest more internal time vs outsource research

\* accelerate toward pitch vs deepen qualification



---



\## 9. Failure Conditions



Examples:



\* founder disengages

\* competing advisor wins access

\* conflict issue kills opportunity

\* confidentiality leak damages process

\* opportunity timing disappears

\* team cannot support pursuit



---



\## 10. UI Notes



Vanilla implementation suggestion:



\* left panel: inbox / events

\* center panel: opportunity card + workstreams

\* right panel: available tasks + resource allocation



All rendered from state.



No complex drag-and-drop required.



Buttons and simple forms are sufficient.



---



\# Phase 1 — Pitching / Mandate Acquisition



\## 1. Description



This phase begins when the opportunity is sufficiently qualified to justify a formal pitch for advisory mandate.



The objective is to convince the founder or shareholders that the firm is the right advisor.



This phase is not just about presentation quality.



It also depends on:



\* trust

\* perceived sector expertise

\* valuation credibility

\* execution confidence

\* chemistry with management



---



\## 2. Objectives



\* prepare a compelling pitch

\* align internal view on deal strategy

\* build trust with client stakeholders

\* define proposed process structure

\* win the mandate



---



\## 3. Active Workstreams



\### Pitch Preparation



Quality and readiness of pitch materials and arguments.



\### Client Trust Building



Confidence built with founder and key stakeholders.



\### Deal Strategy Definition



Clarity of approach, buyer universe logic, process design, and positioning.



\### Internal Alignment



Readiness of the advisory team to execute the process if mandate is won.



\### Mandate Conversion



Likelihood of mandate signature.



---



\## 4. Dependencies



\### Hard Dependencies



\* Pitch meeting cannot occur without minimum Pitch Preparation.

\* Mandate signature cannot happen without minimum Client Trust Building.

\* Deal Strategy Definition requires sufficient Origination data.



\### Soft Dependencies



\* weak valuation framing reduces credibility

\* weak chemistry lowers mandate win rate

\* internal overpromising increases future Risk Debt



---



\## 5. Gates



Suggested gate for mandate win resolution:



\* Pitch Preparation ≥ 60

\* Client Trust Building ≥ 60

\* Deal Strategy Definition ≥ 50

\* Internal Alignment ≥ 40



A hidden probability model then resolves whether mandate is won.



---



\## 6. Available Tasks



Examples:



\* Draft pitch deck

\* Benchmark sector transactions

\* Build valuation argument

\* Prepare process roadmap

\* Prepare founder objections

\* Conduct internal rehearsal

\* Refine buyer universe

\* CFO alignment meeting

\* Mandate terms discussion



---



\## 7. Typical Events



Examples:



\* founder asks for previous credentials

\* rival advisor submits pitch

\* founder questions fee proposal

\* management wants more clarity on timeline

\* founder asks for valuation range too early

\* CFO challenges assumptions



---



\## 8. Key Decisions



Examples:



\* pitch premium positioning vs pragmatic positioning

\* aggressive valuation promise vs disciplined framing

\* generalist approach vs specialist angle

\* low fee to win mandate vs defend pricing

\* broad process proposal vs tightly curated process



---



\## 9. Failure Conditions



Examples:



\* mandate lost to competitor

\* founder distrusts process

\* valuation expectations become misaligned

\* fee discussion breaks trust

\* internal pitch quality too weak



---



\## 10. UI Notes



The phase can use:



\* a pitch readiness dashboard

\* trust meter

\* key stakeholder cards

\* mandate probability indicator



Simple bar UI is sufficient.



No animation dependency required.



---



\# Phase 2 — Preparation



\## 1. Description



Once the mandate is signed, the deal enters Preparation.



This is the phase in which the advisory team builds the foundations of the process.



The quality of this phase strongly affects later outcomes.



This is where weak discipline quietly creates future disaster.



---



\## 2. Objectives



\* build high-quality deal materials

\* gather financial and operational information

\* prepare equity story

\* organize process strategy

\* align management



---



\## 3. Active Workstreams



\### Information Collection



Depth and completeness of internal company information.



\### Financial Analysis



Quality of financial understanding and normalization.



\### Equity Story Development



Strength of the narrative that will support buyer interest.



\### Documentation Quality



Robustness of materials produced.



\### Management Alignment



How aligned management is with the process and messaging.



\### Process Structuring



Readiness of timeline, buyer list logic, and execution plan.



---



\## 4. Dependencies



\### Hard Dependencies



\* teaser / IM drafting requires sufficient Information Collection

\* buyer strategy requires Process Structuring progress

\* strong equity story requires Financial Analysis and Management Alignment



\### Soft Dependencies



\* weak management alignment creates inconsistency later

\* weak documentation increases Q\&A pain

\* weak analysis creates DD retrades



---



\## 5. Gates



Suggested gate for entering Marketing:



\* Information Collection ≥ 65

\* Financial Analysis ≥ 60

\* Equity Story Development ≥ 60

\* Documentation Quality ≥ 55

\* Management Alignment ≥ 50

\* Process Structuring ≥ 60



---



\## 6. Available Tasks



Examples:



\* management interviews

\* financial normalization

\* KPI analysis

\* draft teaser

\* draft information memorandum

\* buyer list design

\* equity story workshop

\* management coaching

\* data room architecture setup



---



\## 7. Typical Events



Examples:



\* management disagrees on positioning

\* missing numbers delay materials

\* founder pushes for inflated story

\* analyst finds issue in revenue quality

\* board asks to change process structure



---



\## 8. Key Decisions



Examples:



\* how ambitious the equity story should be

\* whether to exclude certain buyers

\* how much time to invest in material quality

\* whether to disclose known weaknesses early

\* whether to accelerate preparation to catch market window



---



\## 9. Failure Conditions



Examples:



\* mandate remains active but process stalls

\* management misalignment damages preparation

\* low-quality materials weaken launch

\* hidden issues already build significant Risk Debt



---



\## 10. UI Notes



Use:



\* workstream bars

\* material preparation checklist

\* management alignment meter

\* timeline readiness indicator



---



\# Phase 3 — Market Outreach



\## 1. Description



The deal is launched to test market reaction.



This phase includes first buyer contacts, teaser distribution, and NDA signature. The Information Memorandum is **not yet distributed**. If Tier-1 buyers respond strongly, Tier-2 buyers may not be contacted.



A good process widens competitive tension without losing control.



---



\## 2. Objectives



\* reach relevant buyers

\* generate interest

\* maintain confidentiality

\* build process momentum

\* maximize participation quality



---



\## 3. Active Workstreams



\### Buyer Landscape



Quality and coverage of targeted buyers.



\### Outreach Execution



How effectively the process is being launched.



\### Buyer Engagement



Depth of buyer participation and responsiveness.



\### Confidentiality Control



Protection of process secrecy.



\### Deal Momentum



Perception that the process is moving and worth prioritizing.



---



\## 4. Dependencies



\### Hard Dependencies



\* outreach requires materials from Preparation

\* buyer engagement requires sufficient buyer targeting quality



\### Soft Dependencies



\* poor confidentiality control creates rumors

\* weak momentum reduces bidder motivation

\* poor buyer selection reduces offer quality



---



\## 5. Gates



Suggested gate for entering Q\&A:



\* Buyer Landscape ≥ 60

\* Outreach Execution ≥ 60

\* Buyer Engagement ≥ 50

\* Confidentiality Control ≥ 50

\* Deal Momentum ≥ 50



---



\## 6. Available Tasks



Examples:



\* send teaser

\* manage NDAs

\* buyer prioritization

\* follow-up calls

\* buyer FAQs

\* confidentiality monitoring

\* expand buyer pool

\* remove weak buyers



---



\## 7. Typical Events



Examples:



\* buyer requests fast-track access

\* rumor reaches market

\* unexpected strategic buyer shows interest

\* weak buyers go silent

\* founder worries process is too visible



---



\## 8. Key Decisions



Examples:



\* broad vs selective outreach

\* keep process slow and controlled vs accelerate

\* admit extra bidder late vs preserve discipline

\* disclose more to serious buyer vs keep level field



---



\## 9. Failure Conditions



Examples:



\* insufficient buyer interest

\* leak damages founder confidence

\* wrong buyer mix leads to weak participation

\* process loses momentum



---



\## 10. UI Notes



Good vanilla UI components:



\* buyer list cards

\* buyer status tags

\* engagement score bar

\* confidentiality alert indicators



---



\# Phase 4 — IM Distribution \& Bidder Engagement



\## 1. Description



The Information Memorandum and data pack are shared with selected buyers.



Initial Q&A occurs focused on the IM, and bidder engagement is managed. This phase may include early management meetings and ends with the receipt of indicative offers (NBOs).



---



\## 2. Objectives



\* answer buyer questions efficiently

\* maintain consistency across bidders

\* preserve trust and process control

\* surface issues early enough to manage them



---



\## 3. Active Workstreams



\### Data Room Readiness



Completeness and structure of shared information.



\### Q\&A Responsiveness



Speed and quality of responses.



\### Information Consistency



Whether answers and disclosures remain coherent.



\### Buyer Trust



Confidence in the credibility of the process.



\### Issue Containment



Ability to manage sensitive findings before they escalate.



---



\## 4. Dependencies



\### Hard Dependencies



\* Q\&A responsiveness depends on data room readiness

\* buyer trust depends on information consistency



\### Soft Dependencies



\* low preparation quality makes Q\&A painful

\* delayed answers reduce bidder motivation

\* inconsistent disclosures increase DD risk later



---



\## 5. Gates



Suggested gate for entering First Round Offers:



\* Data Room Readiness ≥ 65

\* Q\&A Responsiveness ≥ 60

\* Information Consistency ≥ 60

\* Buyer Trust ≥ 55

\* Issue Containment ≥ 50



---



\## 6. Available Tasks



Examples:



\* upload documents

\* draft Q\&A responses

\* align management answers

\* prioritize bidder questions

\* run issue review

\* create clarification notes



---



\## 7. Typical Events



Examples:



\* buyer identifies discrepancy

\* CFO delays response

\* sensitive legal document missing

\* one bidder requests extra access

\* management gives inconsistent answer



---



\## 8. Key Decisions



Examples:



\* answer fast vs answer perfectly

\* disclose risk early vs defer

\* provide equal treatment vs favor stronger bidder

\* keep buyer in despite noise vs de-prioritize



---



\## 9. Failure Conditions



Examples:



\* bidder confidence drops sharply

\* process becomes chaotic

\* management loses patience

\* material inconsistency creates major trust problem



---



\## 10. UI Notes



Simple tables and cards work well:



\* bidder question queue

\* response status

\* trust indicators

\* outstanding issue tracker



---



\# Phase 5 — NBO Analysis, Short Listing \& DD Entry



\## 1. Description



Analysis of received indicative offers.



The purpose of this phase is to compare NBOs, rank bidders, clarify terms, and define the formal shortlist of (typically 2–4) bidders to proceed into Due Diligence.



---



\## 2. Objectives



\* maximize participation

\* secure credible offers

\* compare bidders effectively

\* preserve negotiating leverage



---



\## 3. Active Workstreams



\### Offer Participation



How many relevant bidders submit offers.



\### Offer Quality



Strength and credibility of bids.



\### Competitive Tension



Degree of bidder rivalry.



\### Bidder Fit



Strategic and execution fit of each bidder.



\### Process Control



Ability to keep timeline and comparisons disciplined.



---



\## 4. Dependencies



\### Hard Dependencies



\* offer quality depends on earlier buyer engagement and trust



\### Soft Dependencies



\* weak competition lowers valuation

\* weak process control reduces leverage

\* wrong bidder mix distorts results



---



\## 5. Gates



Suggested gate for entering Management Presentations:



\* Offer Participation ≥ 50

\* Offer Quality ≥ 55

\* Competitive Tension ≥ 50

\* Process Control ≥ 55



Also requires at least one viable bidder.



---



\## 6. Available Tasks



Examples:



\* manage bidder clarifications

\* compare bids

\* shortlist bidders

\* request improved indicative offers

\* build bidder comparison matrix

\* advise founder on bidder selection



---



\## 7. Typical Events



Examples:



\* one bidder submits unexpectedly high bid

\* strategic bidder bids low but with strong fit

\* PE bidder requests exclusivity signal

\* founder dislikes strongest bidder

\* offers come below expectations



---



\## 8. Key Decisions



Examples:



\* optimize for price vs certainty

\* keep more bidders alive vs narrow aggressively

\* select strategic buyer vs PE

\* signal preference vs preserve ambiguity



---



\## 9. Failure Conditions



Examples:



\* no credible bids

\* founder rejects market reality

\* bidders sense weak process and soften stance

\* competition collapses



---



\## 10. UI Notes



Vanilla-friendly components:



\* offer table

\* bidder comparison cards

\* color-coded fit / price / certainty indicators



---



\# Phase 6 — Due Diligence

\## 1. Description

This phase represents the grueling deep investigation stage of the transaction. Buyers deploy their third-party advisors (lawyers, accountants, tax experts) to audit the Information Memorandum claims.

Strategically, the player must defend the valuation, manage the exhausting Q&A data room, and maintain buyer confidence even when skeletons are uncovered.



---



\## 2. Objectives



\* present management strongly

\* reinforce buyer conviction

\* reduce execution concerns

\* improve offer confidence



---



\## 3. Active Workstreams



\### Management Performance



Quality of presentation and interaction.



\### Strategic Alignment



How strongly buyer and target logic connect.



\### Buyer Confidence



Confidence in business, management and execution.



\### Narrative Consistency



Consistency between materials and live answers.



\### Bidder Commitment



Likelihood that bidder remains serious.



---



\## 4. Dependencies



\### Hard Dependencies



\* presentations require shortlist and management preparation



\### Soft Dependencies



\* weak chemistry reduces commitment

\* inconsistent messaging increases DD intensity later

\* poor presentation quality weakens competitive momentum



---



\## 5. Gates



Suggested gate for entering Due Diligence:



\* Management Performance ≥ 60

\* Strategic Alignment ≥ 55

\* Buyer Confidence ≥ 60

\* Narrative Consistency ≥ 60

\* Bidder Commitment ≥ 55



---



\## 6. Available Tasks



Examples:



\* presentation coaching

\* Q\&A rehearsal

\* management script alignment

\* bidder briefing prep

\* follow-up call planning



---



\## 7. Typical Events



Examples:



\* founder dominates meeting badly

\* CFO answers brilliantly

\* bidder CEO connects well with management

\* buyer raises concern on product scalability

\* management contradicts deck narrative



---



\## 8. Key Decisions



Examples:



\* scripted vs natural management approach

\* reveal more operational detail vs stay high-level

\* prioritize chemistry vs control

\* keep multiple bidders close vs favor strongest one



---



\## 9. Failure Conditions



Examples:



\* management underperforms

\* key bidder loses confidence

\* live answers reveal hidden weaknesses

\* founder becomes emotionally attached to wrong bidder



---



\## 10. UI Notes



Suggested UI:



\* shortlisted bidder cards

\* management readiness meters

\* bidder confidence bars

\* post-meeting reaction summary



---



\# Phase 7 — BO / BAFO (Binding Offers)

\## 1. Description

This is the decisive competitive stage where remaining bidders submit their Binding Offers (BO) or Best and Final Offers (BAFO).

This phase tests the advisor's ability to maintain maximum competitive tension, prevent buyers from dropping out, and ruthlessly negotiate the highest possible binding valuation before exclusivity is granted.



---



\## 2. Objectives



\* sustain buyer confidence

\* manage findings

\* contain issues

\* preserve price and certainty



---



\## 3. Active Workstreams



\### Information Accuracy



Reliability of the disclosed information.



\### DD Responsiveness



Ability to manage requests quickly and coherently.



\### Risk Containment



Ability to prevent issues from escalating.



\### Buyer Confidence



Strength of bidder conviction.



\### Price Defense



Ability to protect valuation against retrades.



---



\## 4. Dependencies



\### Hard Dependencies



\* DD responsiveness depends on process readiness and team capacity



\### Soft Dependencies



\* high Risk Debt weakens price defense

\* poor accuracy damages confidence

\* slow DD handling reduces certainty



---



\## 5. Gates



Suggested gate for entering SPA Negotiation:



\* Information Accuracy ≥ 70

\* DD Responsiveness ≥ 65

\* Risk Containment ≥ 60

\* Buyer Confidence ≥ 60

\* Price Defense ≥ 55



At least one bidder must remain viable.



---



\## 6. Available Tasks



Examples:



\* DD request triage

\* issue memo drafting

\* management clarification sessions

\* legal coordination

\* price defense preparation

\* bidder reassurance calls



---



\## 7. Typical Events



Examples:



\* accounting discrepancy found

\* customer concentration concern escalates

\* legal issue discovered

\* bidder requests retrade

\* bidder internal IC delays decision



---



\## 8. Key Decisions



Examples:



\* concede early vs fight price pressure

\* disclose full issue context vs narrow response

\* prioritize certainty vs valuation

\* keep backup bidder alive vs focus on lead bidder



---



\## 9. Failure Conditions



Examples:



\* bidder walks away

\* retrade becomes unacceptable

\* founder loses confidence

\* multiple issues accumulate beyond recovery



---



\## 10. UI Notes



Suggested UI:



\* DD issue tracker

\* buyer confidence indicator

\* retrade pressure meter

\* outstanding request queue



---



\# Phase 8 — SPA Negotiation

\## 1. Description

This phase represents the intense legal and contractual negotiation of the Sale and Purchase Agreement (SPA) with a single, exclusive buyer. 

The advisor must guide the seller through warranty thresholds, indemnities, and working capital peg mechanisms, fighting to protect the net cash the founder will actually receive.



---



\## 2. Objectives



\* maintain commercial deal integrity

\* negotiate acceptable legal terms

\* balance price, risk and certainty

\* reach signable documentation



---



\## 3. Active Workstreams



\### Negotiation Leverage



Strength of the seller’s position.



\### Legal Clarity



How clearly deal terms and liabilities are framed.



\### Deal Certainty



Probability that negotiations conclude successfully.



\### Seller Protection



How well the client is protected from post-closing exposure.



\### Buyer Commitment



Likelihood that the bidder stays committed to signing.



---



\## 4. Dependencies



\### Hard Dependencies



\* SPA negotiation requires one active bidder and advanced DD completion



\### Soft Dependencies



\* weak leverage increases concessions

\* poor legal clarity creates delays

\* low buyer commitment increases signing risk



---



\## 5. Gates



Suggested gate for entering Signing \& Closing:



\* Negotiation Leverage ≥ 50

\* Legal Clarity ≥ 65

\* Deal Certainty ≥ 65

\* Buyer Commitment ≥ 60



---



\## 6. Available Tasks



Examples:



\* negotiate SPA mark-up

\* prepare fallback positions

\* align seller red lines

\* coordinate legal advisors

\* manage bidder pressure

\* preserve alternative option leverage



---



\## 7. Typical Events



Examples:



\* buyer pushes hard on warranties

\* indemnity cap dispute emerges

\* locked-box leakage issue appears

\* legal language causes founder concern

\* buyer threatens timing pressure



---



\## 8. Key Decisions



Examples:



\* defend economics vs defend legal protections

\* escalate to founder now vs shield management

\* concede on cap vs price vs earn-out mechanics

\* preserve optionality with backup bidder vs go all-in



---



\## 9. Failure Conditions



Examples:



\* legal deadlock

\* founder refuses final terms

\* buyer commitment weakens

\* cumulative concessions destroy attractiveness



---



\## 10. UI Notes



Suggested UI:



\* negotiation tracker

\* clause pressure indicators

\* seller red-line panel

\* certainty meter



---



\# Phase 9 — Signing

\## 1. Description

The formal legal commitment to the transaction. Both parties establish the finalized contracts but funds are not yet transferred.

This phase is primarily administrative but carries severe bottleneck risks concerning regulatory clearances and final legal approvals.



---



\## 2. Objectives



\* coordinate final steps

\* manage approvals and conditions precedent

\* preserve commitment until funds move

\* complete transaction successfully



---



\## 3. Active Workstreams



\### Execution Coordination



Alignment of all closing steps.



\### Closing Readiness



Preparedness of documents, parties and approvals.



\### Regulatory / CP Completion



Progress on conditions precedent.



\### Commitment Stability



Risk that one party wobbles late.



\### Completion Certainty



Probability of successful close.



---



\## 4. Dependencies



\### Hard Dependencies



\* signing requires final documents

\* closing requires CP completion



\### Soft Dependencies



\* low commitment stability raises late-failure risk

\* poor coordination creates delay and fatigue



---



\## 5. Gates



Successful deal close requires:



\* Execution Coordination ≥ 70

\* Closing Readiness ≥ 70

\* Regulatory / CP Completion ≥ 65

\* Commitment Stability ≥ 60

\* Completion Certainty ≥ 70



---



\## 6. Available Tasks



Examples:



\* CP tracking

\* closing checklist coordination

\* financing follow-up

\* regulatory submission management

\* final stakeholder alignment

\* signature logistics



---



\## 7. Typical Events



Examples:



\* lender delay

\* regulatory request

\* document correction needed

\* founder nerves spike

\* bidder asks for final operational update



---



\## 8. Key Decisions



Examples:



\* push for speed vs preserve accuracy

\* escalate problem publicly vs solve quietly

\* keep pressure on counterparty vs maintain calm

\* accept minor delay vs take execution risk



---



\## 9. Failure Conditions



Examples:



\* CP not satisfied

\* financing breaks

\* signing delayed into collapse

\* final confidence shock derails close



---



\## 10. UI Notes



Suggested UI:



\* closing checklist

\* CP tracker

\* readiness bars

\* final close probability indicator



---

\# Phase 10 — Closing

\## 1. Description

The ultimate goal of the game: Transaction Completion. Funds are wired, keys are handed over, and the advisor collects their success fee.

---

\## 2. Objectives

\* confirm funds received
\* execute success fee invoice
\* celebrate with client

---

\## 3. Active Workstreams

\### Fund Transfer Coordination
Monitoring the actual bank wires.

\### Transaction Completion
Final administrative wrap-up.

---

\## 4. Dependencies
Requires Signing (Phase 9) and all CPs met.

---

\## 5. Gates
Cash in bank.

---

\## 6. Available Tasks
\* Chase buyer bank
\* Send Success Fee invoice
\* Order Tombstone

---

\## 7. Typical Events
\* Bank compliance delay
\* Founder emotional breakdown

---

\## 8. Key Decisions
\* When to officially pop the champagne.

---

\## 9. Failure Conditions
\* Extreme black swan event (e.g. buyer bankruptcy exactly during wire window).

---

\## 10. UI Notes
Celebratory UI state. Score recap generated.

---

\# Vanilla JavaScript Implementation Notes



\## 1. Keep phase definitions static



Store all phase definitions in plain JS objects or JSON-like modules.



Example:



```js

const PHASES = {

&nbsp; 0: { ... },

&nbsp; 1: { ... },

&nbsp; 2: { ... }

};

```



---



\## 2. Separate config from state



Do not mix:



\* what a phase is

\* the current state of a deal



Use:



\* `phaseDefinitions`

\* `gameState`

\* `dealState`



---



\## 3. Render from state only



The UI should read the current phase and render:



\* phase title

\* active workstreams

\* available tasks

\* gates

\* events



Avoid hardcoding phase-specific HTML.



---



\## 4. Use reusable components



Even in vanilla JS, create reusable render functions:



\* `renderWorkstreamBars()`

\* `renderTaskList()`

\* `renderEvents()`

\* `renderGateStatus()`



This will prevent the codebase from turning into a spaghetti opera.



---



\## 5. Use plain arrays for phase logic



Each deal state can contain:



```js

deal = {

&nbsp; phaseId: 2,

&nbsp; workstreams: {

&nbsp;   informationCollection: { progress: 45, quality: 60 },

&nbsp;   financialAnalysis: { progress: 30, quality: 55 }

&nbsp; },

&nbsp; activeTasks: \[],

&nbsp; eventQueue: \[],

&nbsp; riskDebt: 12

};

```



This is enough to drive the whole system.



---

# Action System Integration

The simulation runs exclusively on a unified **Action System** architecture (detailed in `MA_Game_Action_Library_Phase0_Phase1.md`). 

## Unified Action Schema
Every valid action in the game follows a rigorous structured schema:
* `name`, `category`, `phase`, `cost`, `work`, `complexity`, `hidden_work_probability`, `hidden_work_range`, `effects`

## Resource Constraints
Actions are no longer constrained by simple "actions per round" limits. Instead, they dynamically draw from your finite **Budget** (Cost) and **Team Capacity** (Work). Operating past your Team Capacity sends you into Critical Pressure, drastically multiplying failure events.

## Cross-Phase Action Reuse
Certain structural tasks (such as "Draft Financial Model Update") are reused across multiple phases. The underlying schema remains identical, while `phase` tags determine exactly when the task populates the UI.

## Integration with Event System
Tasks with high `complexity` generate probability spikes inside the Event System mapping to "Hidden Workload." Whenever a Task triggers Hidden Workload, it automatically spins up new Event dialogs forcing the player to allocate more Work Units instantly to prevent structural `Risk` accumulation.

---

# Design Roadmap

The following foundational areas require future documentation and mechanical specification before the simulation is entirely feature-complete:

1. **Phase 2–10 Action Libraries**: Explicitly detailing the database of available actions post-origination.
2. **Balancing of Work vs Budget economy**: Mathematical tuning of how quickly resources burn against baseline funding.
3. **Event probability calibration**: Setting the hard mathematical floors and ceilings for Risk variables modifying Event triggers.
4. **Team staffing system**: Defining how hiring/firing/burning out analysts modifies total base weekly Work Capacity.
5. **Buyer behaviour modelling**: Establishing the AI logic shaping competing strategic vs PE buyer reactions during Phase 6 and 7.
6. **Deal valuation engine**: The exact formula converting `ValuationPotential` into an absolute Euro calculation during BO/BAFO.
7. **Negotiation mechanics**: How SPA redlines map to leverage point expenditures.



