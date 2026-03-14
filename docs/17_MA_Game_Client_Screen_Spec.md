\# The M\&A Rainmaker

\## Client Screen Specification

\### Version 1.0



---



\# 1. Purpose



This document defines the detailed screen specification for the \*\*Client\*\* screen in \*\*The M\&A Rainmaker\*\*.



The Client screen is the main control surface for seller relationship management, expectation alignment, decision readiness and internal client dynamics.



It should function as:



\- the central screen for managing the seller relationship,

\- the place where trust, pressure and alignment become visible,

\- the interface through which the player understands what the client wants versus what the process is delivering,

\- the system for tracking communication quality, internal client tensions and decision bottlenecks,

\- and the layer that turns “managing the client” into a core gameplay discipline.



This is not a static company profile.

This is a live stakeholder management interface.



The screen must help the player understand:



\- what the client wants,

\- how the client currently feels,

\- how aligned the client is with market reality,

\- which internal client tensions are active,

\- what decisions are pending,

\- and where relationship deterioration could damage the deal.



---



\# 2. Screen Design Intent



The Client screen should feel like:



\- a premium stakeholder management console,

\- a calm but high-stakes relationship interface,

\- a professional space for reading trust, pressure and alignment,

\- and a place where the emotional and political dimensions of the sell-side process become legible without melodrama.



Visually, it should sit primarily between:



\- \*\*Outlook Noir\*\*, for calm readability, communication history and structured relationship management,

\- and \*\*Cinematic Dealroom\*\*, for emotional tone, trust-state framing and consequence-heavy moments.



A lighter \*\*Terminal Prestige\*\* influence may appear in:

\- indicators,

\- alignment metrics,

\- objective tracking,

\- and decision readiness markers.



The mood should be:



\- calm on the surface,

\- politically charged underneath,

\- elegant,

\- readable,

\- and quietly tense.



This screen should feel less mechanical than Tasks or Risks, but no less consequential.



---



\# 3. Gameplay Role



\# 3.1 Core Role

The Client screen is one of the central human systems of the game.



It performs seven major functions:



1\. tracks client trust and confidence,

2\. tracks expectation alignment,

3\. tracks seller objectives and constraints,

4\. surfaces internal client dynamics,

5\. shows pending decisions and approval readiness,

6\. links client mood to process events,

7\. and turns relationship management into strategic gameplay.



\# 3.2 Why It Matters

A sell-side process can fail even with:

\- solid buyers,

\- decent materials,

\- and acceptable execution,



if the client becomes:

\- frustrated,

\- misaligned,

\- indecisive,

\- unrealistic,

\- politically split,

\- or emotionally destabilised by the process.



This screen is where that fragility becomes visible and governable.



\# 3.3 What the Player Should Feel

The player should feel:



\- that the client is a living stakeholder, not a fixed object,

\- that trust must be earned and maintained,

\- that expectation management matters as much as buyer management,

\- that internal seller dynamics can support or sabotage progress,

\- and that relationship mistakes often have delayed consequences.



---



\# 4. Primary Player Questions



The Client screen must answer these questions quickly:



\- How confident is the client right now?

\- How aligned is the client with market reality and process strategy?

\- What is the client most concerned about?

\- Are there internal client tensions active?

\- Which decisions are pending?

\- Where is relationship risk increasing?

\- What does the client need from me next?



If the player cannot tell whether the seller is steady or drifting toward frustration, the screen has failed.



---



\# 5. Functional Objectives



The Client screen must support all of the following:



\- visibility of current trust and confidence,

\- visibility of expectation gap,

\- visibility of seller objectives and constraints,

\- visibility of communication history,

\- visibility of internal client dynamics,

\- visibility of pending approvals and decisions,

\- linkage to buyer reactions and process state,

\- and clear understanding of what may improve or damage the relationship.



---



\# 6. Screen Architecture



\# 6.1 Canonical Layout



The Client screen should sit inside the standard application shell:



\- Topbar

\- Sidebar

\- Client Workspace



Inside the Client Workspace:



\- Workspace Header

\- Client Summary Row

\- Main Relationship Area

\- Communication \& Decision Area

\- Optional Bottom Pressure Strip



\# 6.2 Main Structural Logic



The screen should support a \*\*2-column primary layout\*\*:



\- Left Column: relationship state and client profile

\- Right Column: communications, decisions and active tensions



Optional bottom layer:

\- key pressure / expectation strip



\# 6.3 Default Desktop Layout



Recommended width distribution:



\- Left Column: 42%

\- Right Column: 58%



The left needs enough space for relationship interpretation.

The right needs enough space for logs, decisions and active dynamics.



---



\# 7. Workspace Header



\# 7.1 Purpose

Establish the client relationship state and current governance pressure.



\# 7.2 Content

Left side:

\- Screen title: `Client`

\- Secondary line: client name / project name + current relationship summary



Right side:

\- quick actions

\- high-level indicators



\# 7.3 Header Summary Examples

Examples:

\- `Project Helios · founder confidence stable · valuation expectations slightly ahead of market tone`

\- `Project Triton · board alignment weakening · decision pressure rising ahead of shortlist`



\# 7.4 Header Actions

Recommended:

\- Open Communication History

\- Review Pending Decisions

\- Open Buyer Feedback Context

\- Open Client Risks

\- Add Internal Note



Optional:

\- Prepare Update

\- Schedule Call, if represented in system logic



\# 7.5 Behaviour

\- sticky inside workspace

\- concise

\- emotionally informative without verbosity



---



\# 8. Client Summary Row



\# 8.1 Purpose

Provide a quick at-a-glance snapshot of the seller relationship.



\# 8.2 Recommended Summary Tiles

Core tiles:

\- Trust

\- Confidence

\- Expectation Alignment

\- Decision Readiness

\- Pressure Level

\- Internal Cohesion



Optional later:

\- Founder Energy

\- Board Support

\- Tolerance for Delay



\# 8.3 Tile Structure

Each tile may contain:

\- label

\- current state or score

\- trend

\- short interpretation hint



Example:

\- `Expectation Alignment`

\- `Moderate Gap`

\- `↓`

\- `Buyer tone softer than client assumes`



\# 8.4 Behaviour

\- clickable

\- opens relevant module or filtered detail

\- trends should be visible but restrained



\# 8.5 Design Rule

These should feel like relationship and governance vitals, not gamified mood bars from a life simulator.



---



\# 9. Left Column, Relationship Core



\# 9.1 Purpose

Represent who the client is, what they want, and how stable the relationship currently is.



\# 9.2 Recommended Modules



\## Module A. Client Profile Block

\### Content

Show:

\- client / project name

\- company type

\- ownership situation

\- primary stakeholder(s)

\- process type

\- high-level transaction objective



Optional:

\- founder-led

\- family-owned

\- PE-backed

\- board-heavy governance marker



\### Design Rule

This is identity and context, not decoration.



\## Module B. Relationship State Panel

\### Content

A short interpretive summary of current relationship state.



Example:

\- `Client remains engaged and trusting, but recent buyer tone has increased sensitivity around valuation expectations and speed of updates.`



This module is critical.

The player must not be left to infer everything from isolated indicators.



\## Module C. Seller Objectives Panel

\### Content

Show core objectives such as:

\- target valuation ambition

\- timing priority

\- certainty priority

\- legacy / strategic fit concerns

\- confidentiality sensitivity

\- preferred buyer type

\- aversion to complexity

\- willingness to accept phased or structured outcomes



\### Behaviour

Objectives may evolve or reprioritise over time.



\## Module D. Expectations Gap Panel

\### Content

Show where client expectations diverge from process reality.



Possible gap dimensions:

\- valuation

\- timing

\- buyer quality

\- process complexity

\- legal smoothness

\- DD burden

\- negotiation pain



\### Design Rule

This panel should be one of the most useful in the entire screen.



---



\# 10. Right Column, Communications and Decisions



\# 10.1 Purpose

Surface active relationship management work.



\# 10.2 Recommended Modules



\## Module A. Communication Log

\### Content

Structured log of relevant client interactions:

\- update sent

\- call held

\- escalation received

\- feedback delivered

\- board question raised

\- founder concern noted



Each entry may include:

\- date / week

\- interaction type

\- short summary

\- tone marker

\- impact marker



\### Behaviour

\- clickable for detail

\- filterable by interaction type

\- supports relationship pattern reading over time



\## Module B. Pending Decisions Panel

\### Content

Show active client decisions awaiting input, such as:

\- buyer inclusion or exclusion

\- shortlist approval

\- DD access comfort

\- response to weak offers

\- willingness to accelerate or delay

\- exclusivity acceptance

\- legal posture choices



Each item should include:

\- decision name

\- urgency

\- dependency context

\- likely consequence of delay



\### Design Rule

Client indecision should be visible as a gameplay variable, not hidden inside narrative text.



\## Module C. Internal Dynamics Panel

\### Content

Show internal seller-side dynamics, such as:

\- founder vs board tension

\- shareholder disagreement

\- different buyer preferences

\- risk appetite mismatch

\- emotional fatigue

\- confidence split after buyer feedback



This can be represented through:

\- short cards

\- tension indicators

\- stakeholder alignment chips



\### Behaviour

Internal dynamics may be:

\- stable

\- emerging

\- active

\- escalating

\- resolved



\## Module D. Current Concerns Panel

\### Content

Top current seller concerns, for example:

\- valuation softness

\- process speed

\- buyer seriousness

\- confidentiality

\- legal burden

\- management distraction

\- reputational concern



\### Design Rule

This module should tell the player what the client is mentally chewing on right now.



---



\# 11. Communication History System



\# 11.1 Purpose

The player needs to see how the relationship has been managed over time.



\# 11.2 Communication Entry Model

Each communication entry should include:

\- timestamp / week

\- interaction type

\- sender / receiver context

\- summary

\- tone

\- effect on trust / confidence / pressure, if applicable

\- linked entity or milestone



\# 11.3 Interaction Types

Examples:

\- Status Update

\- Bad News Delivery

\- Buyer Feedback Discussion

\- Process Recommendation

\- Escalation Response

\- Strategic Advice

\- Board Clarification

\- Reassurance / Alignment Call



\# 11.4 Tone Markers

Possible tone states:

\- Calm

\- Positive

\- Neutral

\- Concerned

\- Frustrated

\- Defensive

\- Urgent



\# 11.5 Design Rule

Communication history should allow the player to detect pattern, not just chronology.



---



\# 12. Trust, Confidence and Pressure Logic



\# 12.1 Purpose

The seller relationship should be dynamic and measurable without becoming simplistic.



\# 12.2 Core Dimensions



\## Trust

How much the client believes the advisor is competent, aligned and dependable.



\## Confidence

How much the client believes the process is moving in a good direction.



\## Pressure

How strained the client currently feels because of the process.



\## Expectation Alignment

How closely the client’s assumptions match process reality.



\## Decision Readiness

How prepared the client is to make required choices without paralysis or panic.



\## Internal Cohesion

How aligned the seller-side decision-makers are with one another.



\# 12.3 Design Rule

These dimensions should not collapse into one “happy/unhappy” state.

That would be elegant nonsense.



\# 12.4 Behaviour

These dimensions may improve or worsen due to:

\- buyer feedback

\- missed updates

\- process delays

\- strong materials

\- good calls

\- clear advice

\- surprises

\- bad news timing

\- internal disagreement

\- market deterioration



---



\# 13. Seller Objectives and Constraints



\# 13.1 Purpose

The client is not only a mood state.

The client also has goals, fears and hard constraints.



\# 13.2 Objective Types

Examples:

\- maximise price

\- preserve certainty

\- minimise execution risk

\- protect management distraction

\- preserve confidentiality

\- find strategic home

\- retain minority upside

\- move fast

\- avoid reputational damage



\# 13.3 Constraint Types

Examples:

\- timing constraints

\- board process requirements

\- shareholder politics

\- founder sensitivities

\- employee concerns

\- customer concentration worries

\- debt / covenant timing

\- personal fatigue



\# 13.4 Design Rule

The Client screen should make visible not only what the seller wants, but what they cannot comfortably tolerate.



---



\# 14. Expectations Gap System



\# 14.1 Purpose

Expectation mismatch is one of the most important drivers of seller-side tension.



\# 14.2 Gap Dimensions

Possible expectation gaps:

\- valuation gap

\- speed gap

\- buyer quality gap

\- complexity gap

\- legal friction gap

\- DD burden gap

\- certainty gap



\# 14.3 Presentation

This can be shown as:

\- gap indicators by category

\- narrative summary

\- trend direction

\- severity flag



\# 14.4 Example

\- `Valuation expectations remain above the level signalled by current buyer behaviour.`

\- `Client assumed faster progression into shortlist than process conditions currently support.`



\# 14.5 Gameplay Relevance

Expectation gaps should influence:

\- trust pressure

\- emotional stability

\- willingness to follow advice

\- decision speed

\- risk of reactive behaviour



---



\# 15. Internal Dynamics System



\# 15.1 Purpose

Seller-side politics should be visible enough to matter.



\# 15.2 Potential Dynamics

Examples:

\- founder vs CFO friction

\- board caution vs founder impatience

\- minority shareholder pressure

\- family disagreement

\- different buyer preferences

\- disagreement on exclusivity

\- tension after weak buyer tone



\# 15.3 Dynamics States

Possible states:

\- Stable

\- Latent

\- Active

\- Escalating

\- Contained

\- Resolved



\# 15.4 Design Rule

Internal dynamics should create texture and consequence, not soap opera.

The point is governance friction, not melodrama in a waistcoat.



---



\# 16. Pending Decisions System



\# 16.1 Purpose

Client decisions are major pacing gates in a sell-side process.



\# 16.2 Decision Types

Examples:

\- approve teaser

\- approve buyer list

\- allow buyer into next round

\- approve shortlist

\- accept weaker price for certainty

\- grant exclusivity

\- escalate on legal points

\- continue or pause process



\# 16.3 Decision Attributes

Each decision should include:

\- title

\- urgency

\- linked milestone

\- linked buyer(s)

\- required by week / gate

\- current readiness

\- likely consequence of delay



\# 16.4 Design Rule

The player must see clearly when the process is waiting on the client, not just vaguely “under pressure”.



---



\# 17. Linked Systems Integration



\# 17.1 Client Screen as Relationship Hub

The Client screen must connect directly to:



\- Inbox

\- Buyers

\- Tasks \& Workstreams

\- Deliverables

\- Risks \& Issues

\- Timeline / Phase Map

\- Market \& Signals



\# 17.2 Typical Cross-System Flows

Examples:

\- weak buyer feedback lowers confidence

\- missed weekly update reduces trust

\- strong deliverable quality improves confidence

\- delay in shortlist decision increases timeline pressure

\- internal disagreement becomes active risk

\- good communication mitigates expectation mismatch



\# 17.3 Design Rule

The client should feel connected to the whole process, not isolated as a portrait with mood text.



---



\# 18. Dynamic Behaviour



\# 18.1 Relationship Evolution Over Time

The seller relationship must evolve visibly.



Possible changes:

\- trust rises after strong advice

\- confidence falls after weak buyer responses

\- pressure rises under delay

\- alignment improves after market education

\- internal cohesion worsens after disagreement

\- decision readiness falls under fatigue

\- reassurance efforts stabilise tensions



\# 18.2 Phase Sensitivity

Different phases should emphasise different relationship dynamics.



\## Early Phase

More emphasis on:

\- alignment on process design

\- valuation expectations

\- buyer list comfort

\- materials confidence



\## Mid Phase

More emphasis on:

\- reaction to buyer feedback

\- shortlist tension

\- patience with process complexity

\- tolerance for ambiguity



\## Late Phase

More emphasis on:

\- exclusivity decisions

\- legal fatigue

\- execution certainty

\- willingness to compromise

\- emotional resilience



\# 18.3 Event Sensitivity

Major events should affect the client state:

\- weak IOIs

\- buyer drop-out

\- strong strategic interest

\- DD issue

\- legal friction

\- market deterioration

\- internal conflict

\- missed update cadence



The screen must visibly reflect these shifts.



---



\# 19. Warning and Pressure Layer



\# 19.1 Purpose

Provide compressed visibility of relationship and governance strain.



\# 19.2 Optional Bottom Pressure Strip

May show:

\- trust under pressure

\- valuation expectation mismatch widening

\- board alignment weakening

\- decision deadline approaching

\- founder frustration rising

\- client confidence drop after buyer event



\# 19.3 Alert Examples

\- `Founder expectations now materially above buyer tone`

\- `Shortlist approval delayed by internal disagreement`

\- `Confidence weakened after two weeks of limited external momentum`

\- `Process pressure rising due to missed update cadence`



\# 19.4 Behaviour Rule

Warnings must point to relationship management action, not just atmospheric dread.



---



\# 20. UX States



\# 20.1 Standard States

The Client screen must support:

\- full loaded state

\- stable relationship state

\- pressure-heavy state

\- internal dynamics active state

\- no communication filter results

\- loading state



\# 20.2 Stable State

When relationship is healthy:

\- fewer warnings

\- stronger confidence framing

\- clearer objective focus

\- calmer log tone



\# 20.3 Pressure-Heavy State

When tension is rising:

\- expectation gap becomes more visible

\- pending decisions become more urgent

\- concern and internal dynamics modules become more prominent



\# 20.4 Loading State

Use:

\- skeleton summary tiles

\- muted log entries

\- restrained shimmer if needed



No emotional loading drama.



---



\# 21. Accessibility and Readability



\# 21.1 Contrast

\- relationship indicators must be readable

\- concern and pressure states must not rely only on colour

\- communication log text must remain crisp



\# 21.2 Click Targets

Tiles, communication rows, decision cards and linked entities must be easily usable.



\# 21.3 Hierarchy

The player should quickly find:

\- current confidence state

\- top concern

\- major expectation gap

\- next required decision

\- active internal tension



\# 21.4 Information Overload Rule

This screen should clarify seller psychology and governance, not drown the player in pseudo-therapy disguised as product design.



---



\# 22. Visual Style Guidance for This Screen



\# 22.1 Dominant Variant

The Client screen should primarily use \*\*Outlook Noir\*\*.



\# 22.2 Supporting Variant

Use \*\*Cinematic Dealroom\*\* for:

\- relationship summary blocks,

\- pressure-sensitive framing,

\- and major confidence / alignment moments.



\# 22.3 Limited Terminal Accent

Use \*\*Terminal Prestige\*\* sparingly for:

\- indicators,

\- readiness markers,

\- and structured objective / gap displays.



\# 22.4 Visual Rules

\- calmer layout than Tasks or Risks

\- strong narrative summaries

\- elegant but disciplined indicators

\- communication log readable and structured

\- pressure and confidence states clearly differentiated

\- restrained accent use



This screen should feel like a premium relationship dashboard for people managing expensive tension in tailored clothes.



---



\# 23. Example Client Scenarios



\# 23.1 Founder Confidence Stable, Expectations Slightly High

State:

\- good relationship

\- market education partially successful

\- valuation expectation gap still open



Player tension:

\- stable now, but vulnerable to weak buyer signals



\# 23.2 Board Alignment Weakening During Shortlist

State:

\- one stakeholder wants price

\- another wants certainty

\- shortlist approval delayed



Player tension:

\- internal seller politics starting to contaminate process timing



\# 23.3 Confidence Shock After Weak Buyer Tone

State:

\- external momentum appears softer than expected

\- founder questions process strategy

\- trust intact but pressure rising



Player tension:

\- communication quality and framing become critical



\# 23.4 Late-Phase Fatigue and Legal Exhaustion

State:

\- seller tired

\- decision readiness falling

\- legal friction creating emotional drag



Player tension:

\- process still viable, but relationship stamina weakening



---



\# 24. Initial Build Scope



For first playable implementation, include:



\- workspace header

\- client summary row

\- client profile block

\- relationship state panel

\- seller objectives panel

\- expectations gap panel

\- communication log

\- pending decisions panel

\- internal dynamics panel

\- current concerns panel

\- linked navigation to inbox, buyers, risks and timeline



This is enough to make the seller relationship a real gameplay system.



---



\# 25. Future Enhancements



Possible later additions:

\- stakeholder-by-stakeholder view

\- board / founder split dashboards

\- communication style preferences

\- trust recovery mechanics

\- persuasion / framing interaction layer

\- client personality archetypes

\- private concern discovery mechanics

\- decision fatigue model

\- separate board memo preparation mode



Useful, yes.

Necessary now, no.



---



\# 26. Final Screen Statement



The Client screen of \*\*The M\&A Rainmaker\*\* must function as a premium seller-relationship and governance management system, making trust, confidence, alignment, pressure and internal dynamics legible and consequential. It should give the player a disciplined way to manage the human side of the sell-side process, ensuring that client handling is not background flavour but one of the central forces shaping the outcome of the deal.

