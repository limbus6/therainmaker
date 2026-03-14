\# M\&A Dealmaker — Phase 0 Implementation Pack

\## Deal Origination

\## Compatible with HTML, CSS and Vanilla JavaScript



\## Purpose



This document turns \*\*Phase 0 — Deal Origination\*\* into an implementable game system.



It is designed to be sufficiently concrete for direct implementation in:



\- HTML

\- CSS

\- vanilla JavaScript



The goal of this phase is to transform a raw lead into a \*\*qualified pitch opportunity\*\*.



At this stage:



\- there is no signed mandate yet

\- the target is not yet a formal client

\- information is incomplete

\- access is uncertain

\- timing may be fragile

\- competitor advisors may already be present



This phase should feel like a mixture of:



\- business development

\- market intelligence

\- judgment under incomplete information

\- relationship building

\- disciplined qualification



---



\# 1. Operational Purpose of Phase 0



Phase 0 exists to answer one core question:



\*\*Is this lead worth converting into a formal pitch process?\*\*



The player is not yet executing a deal.



The player is trying to determine:



\- whether there is a real opportunity

\- whether the firm can access the decision-maker

\- whether the timing is right

\- whether the firm should invest more resources

\- whether the lead should be dropped



This phase should produce tension because a lead may appear attractive but still be a bad use of scarce time and money.



---



\# 2. Phase 0 Core Player Experience



The intended player feeling in this phase is:



\- there is something promising here

\- but I do not know enough yet

\- the timing window may close

\- a competitor may intervene

\- my team cannot chase everything

\- if I overcommit too early, I may waste resources

\- if I underinvest, I may miss the mandate



This phase should teach the player that disciplined selection matters.



---



\# 3. Phase 0 Workstreams



Phase 0 uses six workstreams.



Each workstream tracks:



\- `progress` from 0 to 100

\- `quality` from 0 to 100



\## 3.1 Target Intelligence



Measures how well the firm understands the target company.



Examples of what it includes:



\- sector

\- business model

\- revenue size

\- profitability

\- ownership structure

\- market position

\- growth profile

\- risk areas



Low progress means the firm knows almost nothing.



Low quality means the firm has weak or unreliable understanding.



---



\## 3.2 Relationship Development



Measures strength of access and trust with founder or decision-maker.



Examples:



\- warm intro received

\- founder responded

\- first call completed

\- chemistry improved

\- CFO introduced

\- follow-up conversation agreed



This is not generic networking.



It is deal-specific relationship progression.



---



\## 3.3 Qualification



Measures how well the opportunity has been assessed.



Examples:



\- process timing

\- founder motivation

\- sell-side fit

\- mandate conversion likelihood

\- probability of process viability

\- alignment with firm strategy



This workstream is important because many bad deals begin with weak qualification.



---



\## 3.4 Valuation Framing



Measures robustness of the initial valuation view.



Examples:



\- basic multiple ranges

\- value drivers identified

\- likely buyer perspectives

\- realistic price framing

\- early expectations management



This does not mean full valuation work.



It means early, credible valuation positioning.



---



\## 3.5 Confidentiality \& Conflicts



Measures how well the firm is controlling risk around:



\- confidentiality

\- leaks

\- reputational exposure

\- conflicts of interest



This is a major source of later problems if neglected.



---



\## 3.6 Pitch Readiness



Measures whether the lead is sufficiently developed to justify a formal pitch.



It is a synthesis workstream.



It should depend on the other workstreams.



---



\# 4. Phase 0 Deal Variables



The deal state should also contain a set of lead-specific variables.



These are not workstreams. They are dynamic variables used by events, tasks and outcome logic.



Recommended variables:



\- `leadHeat`

\- `accessLevel`

\- `dataVisibility`

\- `competitivePressure`

\- `confidentialityRisk`

\- `fitScore`



\## 4.1 leadHeat



Measures urgency and timing quality.



High lead heat means:



\- founder is engaged

\- process window is open

\- momentum exists



Low lead heat means:



\- timing is weak

\- opportunity may go cold



---



\## 4.2 accessLevel



Measures practical access to decision-makers.



This is more granular than relationship progress.



Example:



\- a founder may like the firm but not yet involve CFO

\- access may be warm but shallow



---



\## 4.3 dataVisibility



Measures how much reliable information is currently known.



Important because many tasks depend on what the player actually knows.



---



\## 4.4 competitivePressure



Measures likelihood that:



\- rival advisor is present

\- founder is speaking with others

\- timing is competitive

\- the opportunity may be lost



---



\## 4.5 confidentialityRisk



Measures probability that process visibility causes leaks or market noise.



---



\## 4.6 fitScore



Measures how attractive and suitable the lead is for the firm.



Includes:



\- sector fit

\- deal size fit

\- likely conversion potential

\- ability to execute well



---



\# 5. Firm-Level Variables Relevant to Phase 0



In Career Mode, the player also manages the firm.



Recommended firm variables visible during Phase 0:



\- `reputation`

\- `teamMorale`

\- `teamWorkload`

\- `networkStrength`

\- `marketSentiment`

\- `cash`

\- `monthlyBurn`

\- `runwayMonths`

\- `pipelineLeads`

\- `pipelinePitch`

\- `pipelineMandates`

\- `pipelineClosed`



These should influence both opportunity generation and execution quality.



---



\# 6. Phase 0 Gates



The deal can move from Phase 0 to Phase 1 only if the lead is sufficiently mature.



Suggested gate thresholds:



\- Target Intelligence progress >= 40

\- Relationship Development progress >= 60

\- Qualification progress >= 50

\- Valuation Framing progress >= 35

\- Confidentiality \& Conflicts progress >= 30

\- Pitch Readiness progress >= 40



Additional logical conditions:



\- accessLevel >= 50

\- fitScore >= 50



These thresholds should be configurable.



---



\# 7. Hard and Soft Dependencies



\## 7.1 Hard Dependencies



These should block certain tasks or transitions.



\- Valuation Framing tasks require Target Intelligence progress >= 20

\- Pitch Readiness tasks require Qualification progress >= 25

\- Buyer Landscape Sketch requires Target Intelligence progress >= 20

\- Formal transition to Pitch requires all gate thresholds met

\- Any outward-facing sensitive task should require Confidentiality \& Conflicts progress >= 20



---



\## 7.2 Soft Dependencies



These should not block action but should reduce efficiency or increase risk.



\- low Relationship Development reduces effectiveness of founder-facing tasks

\- low Target Intelligence reduces quality of valuation-related tasks

\- low Qualification increases Risk Debt if player accelerates

\- low Confidentiality \& Conflicts increases probability of rumor events

\- high competitivePressure reduces time available before leadHeat decays



---



\# 8. Risk Debt in Phase 0



Phase 0 should already generate Risk Debt.



Risk Debt increases when the player:



\- overstates valuation too early

\- pushes toward pitch without qualification

\- ignores conflict checks

\- uses broad external contact without confidentiality discipline

\- spends too little time understanding founder motivations



Risk Debt generated here should surface later during:



\- Preparation

\- Due Diligence

\- SPA Negotiation



Example interpretation:



A player can win the mandate by being aggressive, but that success may plant future failure.



---



\# 9. Resource Model for Phase 0



The player must make two decisions:



\## 9.1 Decision 1 — What work needs to be done



Examples:



\- research target

\- prepare founder meeting

\- run conflict check

\- map sector

\- frame valuation

\- assess buyer landscape



---



\## 9.2 Decision 2 — How to execute it



Examples:



\- internal team

\- outsource

\- delay

\- cancel



Each task must therefore contain:



\- time cost

\- money cost

\- effect on workstreams

\- effect on variables

\- risk modifiers



This model is compatible with vanilla JavaScript because tasks can be stored as plain objects.



---



\# 10. Phase 0 Task Library



Below is the recommended initial task library.



Each task includes:



\- intent

\- execution options

\- resource cost

\- effects

\- notes



---



\## 10.1 Founder Research



\### Purpose

Gather initial information about the target and founder before direct interaction.



\### Internal Execution

\- Analyst: 3h

\- Associate: 1h

\- Cost: €0



\### Outsourced Execution

\- Associate: 1h

\- Cost: €1,500



\### Effects

\- Target Intelligence progress +10 to +18

\- Target Intelligence quality +4 to +8

\- dataVisibility +5 to +10

\- fitScore +2 to +5



\### Risk

Low



\### Notes

This is an ideal early task.



---



\## 10.2 Sector Mapping



\### Purpose

Understand the target sector, comparable players and strategic context.



\### Internal Execution

\- Analyst: 4h

\- Associate: 2h

\- Cost: €0



\### Outsourced Execution

\- Associate: 1h

\- Cost: €2,000



\### Effects

\- Target Intelligence progress +8 to +14

\- Target Intelligence quality +8 to +14

\- Qualification quality +4 to +8

\- fitScore +2 to +4



\### Risk

Low



\### Notes

Useful early if sector is unfamiliar.



---



\## 10.3 Prepare Founder Meeting



\### Purpose

Prepare questions, hypotheses and meeting structure for first contact.



\### Internal Execution

\- Partner: 1h

\- Associate: 2h

\- Analyst: 1h

\- Cost: €0



\### Outsourced Execution

Not recommended



\### Effects

\- Qualification progress +6 to +12

\- Qualification quality +6 to +12

\- Pitch Readiness progress +4 to +8



\### Risk

Low



\### Notes

Should improve success of Founder Intro Call.



---



\## 10.4 Founder Intro Call



\### Purpose

Engage directly with founder and test access, chemistry and timing.



\### Internal Execution

\- Partner: 1h

\- Associate: 1h

\- Cost: €0



\### Outsourced Execution

Not possible



\### Effects on success

\- Relationship Development progress +12 to +20

\- Relationship Development quality +8 to +14

\- accessLevel +10 to +18

\- leadHeat +4 to +10

\- dataVisibility +3 to +8

\- Qualification progress +4 to +8



\### Possible adverse outcomes

\- if chemistry weak, leadHeat -5

\- if founder cautious, accessLevel only +2

\- if competitivePressure high, founder may mention another advisor



\### Risk

Moderate



\### Notes

This is one of the most important early narrative tasks.



---



\## 10.5 Qualification Analysis



\### Purpose

Assess whether the lead should be pursued seriously.



\### Internal Execution

\- Associate: 3h

\- Analyst: 2h

\- Cost: €0



\### Outsourced Execution

\- Associate: 1h

\- Cost: €1,000



\### Effects

\- Qualification progress +10 to +18

\- Qualification quality +8 to +14

\- fitScore +3 to +8

\- Pitch Readiness progress +3 to +6



\### Risk

Low



\### Notes

Should be central to disciplined gameplay.



---



\## 10.6 Conflict Check



\### Purpose

Identify conflicts of interest and sensitivity risks.



\### Internal Execution

\- Associate: 2h

\- Cost: €0



\### Outsourced Execution

\- Associate: 1h

\- Cost: €500



\### Effects

\- Confidentiality \& Conflicts progress +12 to +20

\- Confidentiality \& Conflicts quality +10 to +18

\- confidentialityRisk -5 to -12



\### Risk

Low to Moderate



\### Special Outcome

May trigger hard negative event if actual conflict exists.



\### Notes

Should feel like boring work that sometimes saves the deal. Which is, regrettably, realistic.



---



\## 10.7 Preliminary Valuation Analysis



\### Purpose

Build an early but credible valuation frame.



\### Internal Execution

\- Associate: 4h

\- Analyst: 3h

\- Cost: €0



\### Outsourced Execution

\- Associate: 1h

\- Cost: €4,000



\### Requirements

\- Target Intelligence progress >= 20



\### Effects

\- Valuation Framing progress +12 to +20

\- Valuation Framing quality +8 to +14

\- Qualification progress +3 to +6



\### Risk

Moderate



\### Special Rule

If player uses aggressive framing without enough data:

\- Risk Debt +5 to +15



\### Notes

Should not be identical to full valuation work in later phases.



---



\## 10.8 Buyer Landscape Sketch



\### Purpose

Create initial view of likely buyer universe.



\### Internal Execution

\- Associate: 3h

\- Analyst: 3h

\- Cost: €0



\### Outsourced Execution

\- Associate: 1h

\- Cost: €2,500



\### Requirements

\- Target Intelligence progress >= 20



\### Effects

\- Pitch Readiness progress +8 to +14

\- Target Intelligence quality +3 to +6

\- Qualification quality +3 to +6



\### Risk

Low



\### Notes

Useful in framing the pitch later.



---



\## 10.9 Internal Go / No-Go Review



\### Purpose

Decide whether to continue investing in the lead.



\### Internal Execution

\- Partner: 1h

\- Associate: 1h

\- Cost: €0



\### Outsourced Execution

Not possible



\### Effects

No direct progress by itself



\### Strategic Effects

\- if decision is Go, unlocks aggressive pursuit

\- if decision is No-Go, lead may be dropped cleanly

\- if player ignores weak signals and continues, Risk Debt +3 to +8



\### Notes

Important in Career Mode to avoid chasing everything.



---



\## 10.10 Discreet Follow-Up Message



\### Purpose

Keep momentum without overexposure.



\### Internal Execution

\- Partner: 0.5h

\- Associate: 0.5h

\- Cost: €0



\### Outsourced Execution

Not possible



\### Effects

\- leadHeat +2 to +5

\- Relationship Development progress +2 to +5

\- accessLevel +1 to +3



\### Risk

Low



\### Notes

Can be used to reduce decay.



---



\## 10.11 Prepare Founder + CFO Meeting



\### Purpose

Prepare for second-level engagement once founder invites CFO or broader team.



\### Internal Execution

\- Partner: 1h

\- Associate: 3h

\- Analyst: 2h

\- Cost: €0



\### Outsourced Execution

Not recommended



\### Requirements

\- Founder Intro Call completed or event unlocked



\### Effects

\- Qualification quality +6 to +10

\- Pitch Readiness progress +8 to +14

\- Target Intelligence quality +4 to +8



\### Risk

Low



\### Notes

Strong bridge toward Pitch phase.



---



\# 11. Phase 0 Event Pool



Events should be plain data objects in vanilla JS.



Recommended initial event pool follows.



---



\## 11.1 Warm Introduction Arrives



\### Trigger

\- lead created via network or referral



\### Description

A trusted contact introduces the founder.



\### Choices

\- engage immediately

\- research first

\- decline politely



\### Typical Effects

\- accessLevel +5 to +10

\- leadHeat +3 to +6



---



\## 11.2 Founder Responds Positively



\### Trigger

\- successful follow-up or intro response



\### Description

Founder agrees to speak.



\### Choices

\- schedule quickly

\- prepare more first

\- ask for brief written context



\### Typical Effects

\- Relationship Development opportunity unlocked

\- leadHeat may rise or decay depending on response speed



---



\## 11.3 Founder Requests Valuation View



\### Trigger

\- after first strong interaction



\### Description

Founder asks what the company might be worth.



\### Choices

\- give disciplined range

\- refuse politely pending more data

\- give aggressive indicative range



\### Typical Effects

Disciplined range:

\- Relationship Development quality +2 to +5

\- Valuation Framing relevance +3

\- low Risk Debt



Refuse politely:

\- no Risk Debt

\- leadHeat may dip slightly



Aggressive range:

\- leadHeat +5

\- founder enthusiasm +5

\- Risk Debt +8 to +15



---



\## 11.4 Competing Advisor Appears



\### Trigger

\- competitivePressure >= threshold

\- random chance during active lead



\### Description

Founder mentions another advisor or market chatter suggests rival activity.



\### Choices

\- differentiate on sector credibility

\- accelerate pitch readiness

\- step back and qualify harder



\### Typical Effects

Varies by choice.



---



\## 11.5 Market Rumor



\### Trigger

\- confidentialityRisk high

\- sensitive external actions performed



\### Description

A market contact suggests the company may be exploring options.



\### Choices

\- deny and tighten control

\- ignore

\- accelerate process



\### Typical Effects

\- confidentialityRisk

\- founder trust

\- competitivePressure

all may change.



---



\## 11.6 Founder Invites CFO



\### Trigger

\- Relationship Development progress >= 40

\- positive founder interaction



\### Description

Founder proposes involving CFO in next conversation.



\### Choices

\- accept and prepare

\- delay to deepen founder relationship first



\### Typical Effects

\- accessLevel +8 to +12

\- Qualification potential improves

\- Pitch Readiness opportunity improves



---



\## 11.7 Timing Window Weakens



\### Trigger

\- no meaningful contact for several cycles

\- low task activity

\- high competitivePressure



\### Description

The opportunity begins to cool.



\### Effects

\- leadHeat -5 to -12

\- Relationship Development decay

\- chance of lead loss rises



---



\## 11.8 Hard Conflict Found



\### Trigger

\- Conflict Check task resolution



\### Description

A real conflict issue is identified.



\### Choices

\- seek waiver

\- reassign internally if possible

\- drop lead



\### Possible Effects

\- immediate deal loss

\- extra cost

\- reputational protection if handled cleanly



---



\# 12. Failure Conditions in Phase 0



The lead can fail during Phase 0.



Recommended failure scenarios:



\## 12.1 Founder Disengages

Caused by:

\- low responsiveness

\- weak chemistry

\- poor follow-up

\- too much pressure



\## 12.2 Competitor Wins Access

Caused by:

\- high competitivePressure

\- weak Relationship Development

\- slow player response



\## 12.3 Conflict Kills Opportunity

Caused by:

\- conflict check reveals unresolvable issue



\## 12.4 Confidentiality Breakdown

Caused by:

\- high confidentialityRisk

\- careless external signaling



\## 12.5 Timing Window Closes

Caused by:

\- leadHeat decays too far

\- founder postpones any transaction thinking



\## 12.6 Internal Capacity Constraint

Caused by:

\- team too stretched

\- player chooses not to continue investing



These failures are important because not all good leads should become pitches.



---



\# 13. Decay Rules for Phase 0



To create urgency, some variables should decay over time.



Recommended decay behavior per cycle if no relevant tasks are performed:



\- leadHeat: -2 to -5

\- Relationship Development progress: -1 to -3

\- Target Intelligence: no decay or minimal decay

\- Qualification relevance: no direct decay, but usefulness falls if leadHeat falls

\- confidentialityRisk: may rise if external chatter exists and player does nothing



This is simple to implement in vanilla JavaScript using a per-cycle update function.



---



\# 14. UI Layout Recommendations for Vanilla JS



The phase should be renderable with three columns.



\## Left Panel — Inbox / Events

Show:

\- latest emails

\- new events

\- urgent warnings

\- narrative choices



\## Center Panel — Lead Dashboard

Show:

\- target card

\- lead variables

\- workstream bars

\- gate progress

\- risk debt



\## Right Panel — Tasks and Resource Allocation

Show:

\- available tasks

\- execution mode selector

\- internal time cost

\- money cost

\- confirm action button



Keep UI simple.



Avoid drag-and-drop.



Buttons, bars, cards and modal prompts are enough.



---



\# 15. Recommended Deal State Shape for Phase 0



Example of a single lead in plain JavaScript:



```js

const dealState = {

&nbsp; id: "deal\_001",

&nbsp; name: "Project Atlas",

&nbsp; phaseId: 0,

&nbsp; status: "lead",



&nbsp; profile: {

&nbsp;   sector: null,

&nbsp;   revenue: null,

&nbsp;   ebitda: null,

&nbsp;   growth: null,

&nbsp;   ownership: null

&nbsp; },



&nbsp; variables: {

&nbsp;   leadHeat: 55,

&nbsp;   accessLevel: 20,

&nbsp;   dataVisibility: 10,

&nbsp;   competitivePressure: 15,

&nbsp;   confidentialityRisk: 20,

&nbsp;   fitScore: 50

&nbsp; },



&nbsp; workstreams: {

&nbsp;   targetIntelligence: { progress: 0, quality: 0 },

&nbsp;   relationshipDevelopment: { progress: 0, quality: 0 },

&nbsp;   qualification: { progress: 0, quality: 0 },

&nbsp;   valuationFraming: { progress: 0, quality: 0 },

&nbsp;   confidentialityConflicts: { progress: 0, quality: 0 },

&nbsp;   pitchReadiness: { progress: 0, quality: 0 }

&nbsp; },



&nbsp; riskDebt: 0,



&nbsp; flags: {

&nbsp;   founderIntroReceived: false,

&nbsp;   founderCallDone: false,

&nbsp;   cfoInvited: false,

&nbsp;   conflictChecked: false,

&nbsp;   hardConflictFound: false,

&nbsp;   dropped: false,

&nbsp;   pitchReady: false

&nbsp; },



&nbsp; history: \[],

&nbsp; activeTasks: \[],

&nbsp; eventQueue: \[]

};

This pattern can be reused for all tasks.

19. Recommended Core Functions for Vanilla JavaScript

The following functional architecture should be enough.

19.1 getAvailableTasks(dealState, firmState, phaseDef)

Returns tasks currently valid for the deal.

19.2 canExecuteTask(task, dealState, firmState, mode)

Checks:

requirements met

enough hours available

enough cash available

19.3 executeTask(taskId, mode, dealState, firmState)

Applies:

time cost

money cost

effect rolls

history entry

follow-up event probability

19.4 applyPhaseDecay(dealState)

Updates:

leadHeat

relationship drift

urgency changes

19.5 checkPhaseGate(dealState, phaseDef)

Returns whether deal can move to Phase 1.

19.6 resolveEvent(eventId, choice, dealState, firmState)

Applies narrative choices and updates state.

19.7 renderPhase0UI(dealState, firmState)

Main renderer for the phase.

This is enough for a working vanilla JS prototype.

20. Recommended First Prototype Scope

To keep Phase 0 implementable in a small prototype, start with:

Minimum viable workstreams

Target Intelligence

Relationship Development

Qualification

Pitch Readiness

Minimum viable variables

leadHeat

accessLevel

competitivePressure

fitScore

Minimum viable tasks

Founder Research

Prepare Founder Meeting

Founder Intro Call

Qualification Analysis

Conflict Check

Preliminary Valuation Analysis

Minimum viable events

Founder Responds Positively

Competing Advisor Appears

Founder Requests Valuation View

Timing Window Weakens

Minimum viable failure states

founder disengages

competitor wins access

lead goes cold

Then expand once the game loop feels right.

This matters because vanilla JavaScript can become messy quickly if Phase 0 starts bloated.

21. Design Philosophy for Phase 0

Phase 0 should teach one of the deepest truths of advisory work:

Not every interesting company is a good opportunity.

A weak player should chase too much.

A better player should learn to qualify.

A reckless player should sometimes win a mandate by being aggressive, but at the cost of future Risk Debt.

A disciplined player should build a healthier pipeline and better long-term outcomes.

That tension is the point.

22. Next Step

After implementing this Phase 0 structure, the next document to produce should be:

Phase 1 — Pitching / Mandate Acquisition Implementation Pack

using the same structure:

workstreams

tasks

event pool

gates

failure logic

vanilla JS state objects