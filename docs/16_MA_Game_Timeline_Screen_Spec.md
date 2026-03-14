\# The M\&A Rainmaker

\## Timeline / Phase Map Screen Specification

\### Version 1.0



---



\# 1. Purpose



This document defines the detailed screen specification for the \*\*Timeline / Phase Map\*\* screen in \*\*The M\&A Rainmaker\*\*.



The Timeline / Phase Map screen is the main temporal and progression control surface of the game.



It should function as:



\- the master view of process progression,

\- the primary screen for understanding phase structure and milestone flow,

\- the place where slippage, acceleration and sequencing become visible,

\- the map of current position versus expected path,

\- and the system through which time pressure becomes strategically legible.



This is not a decorative roadmap.

This is the temporal spine of the transaction.



The screen must help the player understand:



\- where the process currently stands,

\- what comes next,

\- which milestones are approaching,

\- what gates must be met,

\- how far actual progress deviates from target progress,

\- and where timeline pressure threatens execution quality or deal momentum.



---



\# 2. Screen Design Intent



The Timeline / Phase Map screen should feel like:



\- a premium process navigation map,

\- a strategic transaction calendar with structure,

\- a temporal control surface for the deal,

\- and a composed but pressurised overview of progression and constraint.



Visually, it should sit primarily between:



\- \*\*Terminal Prestige\*\*, for structured temporal logic, milestone systems and slippage signalling,

\- and \*\*Outlook Noir\*\*, for readability and controlled navigation.



A modest \*\*Cinematic Dealroom\*\* influence can appear in:

\- phase transitions,

\- key milestone summaries,

\- and major deviation or acceleration moments.



The mood should be:



\- clear,

\- strategic,

\- process-aware,

\- lightly tense,

\- and decisively directional.



This screen should make the player feel the deal is travelling through time, not floating in a timeless soup of tasks and emails.



---



\# 3. Gameplay Role



\# 3.1 Core Role

The Timeline / Phase Map screen is one of the central strategic orientation systems in the game.



It performs seven major functions:



1\. shows current phase progression,

2\. shows milestone sequencing,

3\. distinguishes target schedule from actual schedule,

4\. surfaces slippage and timetable compression,

5\. highlights gate requirements,

6\. links upcoming milestones to execution exposure,

7\. and gives the player a way to think ahead rather than merely react.



\# 3.2 Why It Matters

A deal is not only:

\- a collection of tasks,

\- a buyer universe,

\- and a client relationship.



It is also a timetable with windows, pacing, fatigue, sequencing and pressure.



Without a proper timeline screen, the process can feel spatial but not temporal.

That is a fine way to design a museum, less so a live M\&A simulation.



\# 3.3 What the Player Should Feel

The player should feel:



\- that the process is moving,

\- that time is always exerting pressure,

\- that certain moments matter more than others,

\- that delays have consequences,

\- and that forward planning can preserve optionality.



---



\# 4. Primary Player Questions



The Timeline / Phase Map screen must answer these questions quickly:



\- Where am I in the process?

\- What is the next milestone?

\- What gates must be cleared?

\- Am I on schedule, ahead or behind?

\- Which future points are at risk?

\- What is causing current slippage?

\- What will happen if I do not recover the timetable?



If the player cannot read time pressure and sequencing at a glance, the screen is not doing its work.



---



\# 5. Functional Objectives



The Timeline / Phase Map screen must support all of the following:



\- clear phase overview,

\- milestone visibility,

\- actual vs target progression visibility,

\- slippage tracking,

\- delay source visibility,

\- gate requirement visibility,

\- linked navigation to tasks, deliverables, inbox and risks,

\- time-sensitive alerting,

\- and phase-sensitive understanding of what matters next.



---



\# 6. Screen Architecture



\# 6.1 Canonical Layout



The Timeline / Phase Map screen should sit inside the standard application shell:



\- Topbar

\- Sidebar

\- Timeline Workspace



Inside the Timeline Workspace:



\- Workspace Header

\- Timeline Control Bar

\- Phase Strip / Main Timeline Area

\- Milestone Detail Zone

\- Gate Requirements Zone

\- Optional Bottom Forward-Look Band



\# 6.2 Main Structural Logic



The screen should support a \*\*2-tier primary structure\*\*:



\- Upper Tier: Process Timeline Map

\- Lower Tier or Side Detail Tier: Selected Milestone / Gate / Slippage Detail



This ensures the player can both:

\- read the whole process,

\- and inspect the selected temporal point in detail.



\# 6.3 Default Desktop Layout



Recommended structure:



\- Full-width upper timeline map

\- Lower split detail area:

&nbsp; - Milestone Detail Zone: 58%

&nbsp; - Gate / Exposure Zone: 42%



Alternative:

\- right-side detail panel when map interaction is lighter



The key principle is simple:

the timeline must be visible as a whole, not chopped into nervous fragments.



---



\# 7. Workspace Header



\# 7.1 Purpose

Establish current process position and overall time pressure.



\# 7.2 Content

Left side:

\- Screen title: `Timeline / Phase Map`

\- Secondary line: current phase + timetable summary



Right side:

\- quick actions

\- schedule status indicators



\# 7.3 Header Summary Examples

Examples:

\- `Week 10 · Phase 3 · on target overall · DD gate approaching in 2 weeks`

\- `Week 16 · Phase 5 · 1.5 weeks behind plan · legal and review delays accumulating`



\# 7.4 Header Actions

Recommended:

\- Jump to Current Week

\- View Delays

\- View Upcoming Gates

\- Open Linked Risks

\- Open Critical Tasks



Optional:

\- Compare Plan vs Actual

\- Focus Current Phase



\# 7.5 Behaviour

\- sticky inside workspace

\- concise

\- strongly directional



---



\# 8. Timeline Control Bar



\# 8.1 Purpose

Allow the player to change temporal perspective and filter timeline information.



\# 8.2 Control Bar Structure

Left side:

\- phase filter

\- milestone filter

\- show current week toggle



Right side:

\- show plan vs actual toggle

\- show gate requirements toggle

\- show risk overlays toggle

\- zoom level or density toggle, optional later



\# 8.3 Core Filters

Recommended filters:



\- Phase

\- Milestone Type

\- Critical Only

\- Delayed Only

\- Gate-Linked Only

\- Buyer-Linked Milestones

\- Client-Linked Milestones

\- Deliverable-Linked Milestones

\- Risk-Impacted Milestones



\# 8.4 Behaviour Rule

The control layer must help the player answer time-related questions quickly.

It should not become a miniature airport control tower staffed by dropdowns.



---



\# 9. Main Timeline Map



\# 9.1 Purpose

Represent the entire transaction progression in a structured temporal form.



\# 9.2 Layout

A full-width horizontal timeline occupies the main upper area.



It should contain:



\- phase bands

\- milestone nodes

\- current week marker

\- target progression line

\- actual progression line or progress marker

\- slippage indicators

\- major gate markers



\# 9.3 Core Elements



\## Phase Bands

Each process phase should occupy a segment of the timeline.



Examples:

\- Phase 0: Origination / Client Setup

\- Phase 1: Preparation

\- Phase 2: Buyer Outreach

\- Phase 3: Initial Feedback / IOIs

\- Phase 4: Management Interaction

\- Phase 5: Shortlisting / DD Entry

\- Phase 6: DD Execution

\- Phase 7: Offers / Negotiation

\- Phase 8: Exclusivity / SPA

\- Phase 9: Signing / Closing Readiness



These should reflect the actual phase architecture of the game.



\## Milestone Nodes

Key process moments shown as nodes anchored to the timeline.



Examples:

\- buyer list approved

\- teaser released

\- NDAs signed

\- IM distributed

\- initial buyer feedback received

\- management presentation completed

\- shortlist decided

\- DD pack opened

\- binding offers received

\- exclusivity granted

\- SPA terms aligned

\- closing conditions ready



\## Current Week Marker

A strong visual marker showing the current temporal position.



\## Target Schedule

A baseline representation of the intended process path.



\## Actual Schedule

A representation of where the deal actually stands relative to target.



\## Slippage Markers

Signals showing:

\- delay,

\- acceleration,

\- compressed windows,

\- or milestone drift.



\## Gate Markers

Major thresholds where certain conditions must be met.



\# 9.4 Design Rule

The player must be able to read:

\- the whole process,

\- the current position,

\- and the next constraints

within seconds.



This is a map, not a decorative procession of dots.



---



\# 10. Phase Strip Logic



\# 10.1 Purpose

Help the player understand the macro-structure of the deal.



\# 10.2 Phase Information

Each phase band should communicate:

\- phase name

\- phase sequence number

\- planned duration

\- actual status

\- phase pressure or health

\- completion state



\# 10.3 Phase States

Possible states:

\- Upcoming

\- Active

\- At Risk

\- Delayed

\- Completed

\- Compressed

\- Critical



\# 10.4 Behaviour

\- click phase band to focus that phase

\- hover reveals summary

\- current phase clearly highlighted



\# 10.5 Design Rule

Phases should feel like structured chapters of a live process, not arbitrary UI partitions.



---



\# 11. Milestone Nodes



\# 11.1 Purpose

Represent meaningful transaction events and decision points.



\# 11.2 Milestone Types

Core milestone types may include:

\- internal readiness milestone

\- market-facing milestone

\- buyer milestone

\- diligence milestone

\- legal milestone

\- client milestone

\- process-governance milestone



\# 11.3 Milestone Information Model

Each milestone should have at least:



\- Milestone Name

\- Milestone Type

\- Phase

\- Planned Week / Date

\- Actual Week / Date

\- Current Status

\- Gate Requirements

\- Linked Tasks

\- Linked Deliverables

\- Linked Risks

\- Linked Buyers / Client

\- Notes / Summary



\# 11.4 Milestone States

Possible states:

\- Upcoming

\- Due Soon

\- Ready

\- At Risk

\- Delayed

\- Completed

\- Missed

\- Conditional



\# 11.5 Behaviour

\- click node opens milestone detail

\- hover reveals summary and timing delta

\- delayed nodes clearly marked

\- next critical milestone visually prominent



\# 11.6 Design Rule

Milestones must feel consequential.

They are the vertebrae of the process.



---



\# 12. Actual vs Target Progression



\# 12.1 Purpose

Help the player see timetable drift clearly.



\# 12.2 Core Principle

The screen must distinguish:

\- what the timetable was meant to look like,

\- and what is actually happening.



\# 12.3 Representation Options

Possible representations:

\- baseline target line + actual marker,

\- target milestone positions + actual completion states,

\- or dual-track timeline overlays.



For first implementation, target milestone markers plus actual state overlay is likely the cleanest solution.



\# 12.4 Slippage Forms

The timeline should make visible:

\- local milestone delays

\- phase-level delay

\- compressed recovery windows

\- cumulative drift

\- acceleration where relevant



\# 12.5 Design Rule

Slippage should be unmistakable but not visually hysterical.



The deal is under pressure, yes.

The UI need not behave like it has seen a ghost.



---



\# 13. Gate Requirements Zone



\# 13.1 Purpose

Show what conditions must be satisfied to pass key milestones or advance phases.



\# 13.2 Layout

A dedicated panel in the lower or side detail area.



\# 13.3 Gate Requirement Types

Possible gate requirements:

\- deliverable ready

\- client approval received

\- buyer shortlist selected

\- DD pack opened

\- key issue contained

\- task cluster completed

\- management session completed

\- legal review returned

\- sufficient buyer tension maintained



\# 13.4 Gate Information Model

Each gate requirement should include:

\- requirement name

\- linked milestone / phase

\- current completion state

\- blocker source

\- urgency

\- linked system references



\# 13.5 States

Possible states:

\- Not Started

\- In Progress

\- Partially Met

\- Met

\- At Risk

\- Blocked



\# 13.6 Behaviour

\- clicking a requirement opens the relevant task, deliverable, risk or inbox thread

\- gate status should update dynamically with underlying systems



\# 13.7 Design Rule

Gate requirements should tell the player exactly why progression is or is not safe.

No mysticism. No oracle fog.



---



\# 14. Selected Milestone Detail Zone



\# 14.1 Purpose

Provide full detail for the selected milestone.



\# 14.2 Structure

The selected milestone detail area should contain:



1\. Milestone Header

2\. Milestone Summary

3\. Timing Block

4\. Readiness / Exposure Block

5\. Linked Requirements

6\. Linked Entities

7\. Consequences

8\. Action Area



\# 14.3 Milestone Header

Should include:

\- milestone name

\- milestone type

\- current state

\- phase reference

\- timing delta



Optional:

\- critical marker

\- client-visible marker

\- buyer-visible marker



\# 14.4 Milestone Summary

A concise explanation of what this milestone means in process terms.



Example:

\- `Transition point into buyer-facing process. Requires teaser readiness, approved buyer list and stable client alignment.`



This matters because milestones are not mere dates. They are operational states.



\# 14.5 Timing Block

Show:

\- planned timing

\- current expected timing

\- actual timing if completed

\- delta against plan

\- schedule sensitivity



\# 14.6 Readiness / Exposure Block

Show:

\- readiness state

\- key blockers

\- linked risks

\- dependency fragility

\- confidence in hitting date



\# 14.7 Linked Requirements

Show all gate conditions tied to this milestone.



\# 14.8 Linked Entities

Possible linked items:

\- Tasks

\- Deliverables

\- Risks

\- Buyers

\- Client

\- Inbox Threads

\- Workstreams



\# 14.9 Consequences

Show:

\- what happens if milestone is achieved on time

\- what happens if milestone slips

\- what becomes compressed downstream

\- which buyer/client effects may follow



\# 14.10 Action Area

Core actions may include:

\- Open Linked Tasks

\- Open Deliverables

\- Open Risks

\- Focus Current Blockers

\- Review Buyer Exposure

\- Mark Milestone Complete, only where system logic allows



---



\# 15. Forward-Look Band



\# 15.1 Purpose

Provide a concise view of upcoming timing pressure.



\# 15.2 Possible Content

This optional band may show:

\- next 3 upcoming milestones

\- nearest at-risk gate

\- largest current source of slippage

\- compressed future windows

\- major expected decision points



\# 15.3 Design Rule

This band is useful if it sharpens foresight.

Do not add it simply because empty horizontal space looked lonely.



---



\# 16. Time and Schedule Model



\# 16.1 Purpose

The timeline must reflect the game’s weekly simulation structure.



\# 16.2 Core Time Logic

The process progresses by weeks.

Milestones are planned against week numbers or internally mapped target dates.



\# 16.3 Schedule States

The process may be:

\- on target

\- slightly behind

\- materially delayed

\- compressed but recoverable

\- ahead of plan

\- unstable



\# 16.4 Compression Logic

A delay does not always merely push everything later.

Sometimes it compresses downstream windows.



This should be visible in the timeline.



That, in fact, is where a lot of the suffering comes from.



---



\# 17. Slippage and Recovery



\# 17.1 Purpose

The player must understand not only delay, but the nature of delay.



\# 17.2 Slippage Types

Possible slippage types:

\- isolated milestone delay

\- phase drift

\- cumulative delay

\- gate blockage

\- hidden delay risk

\- recovery compression



\# 17.3 Recovery Logic

Some delays may be recoverable through:

\- task acceleration

\- quality trade-offs

\- team overload

\- reduced buyer breadth

\- process simplification

\- tighter shortlisting



This screen should link to those decisions indirectly through gates and blockers.



\# 17.4 Design Rule

Time should feel like a constrained medium, not an endlessly stretchable rubber sheet.



---



\# 18. Linked Systems Integration



\# 18.1 Timeline as Temporal Hub

The Timeline / Phase Map screen must connect directly to:



\- Tasks \& Workstreams

\- Deliverables

\- Risks \& Issues

\- Inbox

\- Buyers

\- Client

\- Team

\- Market \& Signals



\# 18.2 Typical Cross-System Flows

Examples:

\- blocked deliverable delays milestone

\- buyer hesitation shifts actual timing

\- client review pushes gate risk

\- legal issue compresses negotiation window

\- overloaded team reduces confidence in phase completion

\- market shock re-pressurises timing assumptions



\# 18.3 Design Rule

The timeline must feel like the temporal reflection of the whole system, not a decorative overlay sitting above it.



---



\# 19. Dynamic Behaviour



\# 19.1 Timeline Evolution Over Time

The timeline must visibly evolve with each week.



Possible changes:

\- current marker advances

\- milestones move from upcoming to active to complete

\- delays surface

\- new risk overlays appear

\- gates become blocked or cleared

\- confidence in upcoming dates rises or falls



\# 19.2 Phase Sensitivity

Different phases may visually emphasise different things.



\## Early Phase

More emphasis on:

\- readiness milestones

\- preparation gates

\- outreach launch sequencing



\## Mid Phase

More emphasis on:

\- buyer feedback milestones

\- shortlisting gates

\- DD entry timing

\- competitive tension windows



\## Late Phase

More emphasis on:

\- DD closure

\- legal milestones

\- exclusivity pressure

\- SPA timing

\- closing readiness



\# 19.3 Event Sensitivity

Major events should visibly affect the timeline:

\- buyer drop-out

\- weak IOIs

\- DD issue

\- legal escalation

\- client indecision

\- market deterioration

\- deliverable failure



The player should be able to see the schedule react.



---



\# 20. UX States



\# 20.1 Standard States

The Timeline / Phase Map screen must support:

\- full loaded state

\- phase focus state

\- milestone selected state

\- delayed state

\- critical gate state

\- loading state



\# 20.2 No Milestone Selected State

Example:

\- `Select a milestone to review timing, readiness and gate requirements.`



\# 20.3 Loading State

Use:

\- skeleton phase bands

\- muted milestone placeholders

\- restrained shimmer if needed



\# 20.4 Delayed State

When the process is behind:

\- slippage markers become more visible

\- at-risk future gates become clearer

\- milestone confidence should visually soften or warn



\# 20.5 Critical Gate State

When a major gate is blocked:

\- the linked milestone and downstream path should feel visibly constrained

\- the player should immediately see what to open next



---



\# 21. Accessibility and Readability



\# 21.1 Contrast

\- phase states must remain readable

\- delayed and at-risk states must not rely only on colour

\- milestone nodes must remain legible even at higher density



\# 21.2 Click Targets

Nodes, phase bands, requirements and linked items must be easy to click.



\# 21.3 Hierarchy

The player’s eye should find quickly:

\- current week

\- current phase

\- next milestone

\- largest delay

\- most urgent gate



\# 21.4 Information Overload Rule

This screen should reduce temporal confusion, not simulate it artistically.



---



\# 22. Visual Style Guidance for This Screen



\# 22.1 Dominant Variant

The Timeline / Phase Map screen should primarily use \*\*Terminal Prestige\*\*.



\# 22.2 Supporting Variant

Use \*\*Outlook Noir\*\* for:

\- labels,

\- detail panels,

\- navigation controls,

\- and linked item clarity.



\# 22.3 Light Cinematic Accent

A small amount of \*\*Cinematic Dealroom\*\* may be used in:

\- phase-transition framing,

\- milestone completion moments,

\- and deal-critical timetable events.



\# 22.4 Visual Rules

\- strong horizontal structure

\- clear phase segmentation

\- crisp milestone logic

\- restrained accent usage

\- slippage clearly visible

\- current position unmistakable

\- lower detail areas calm and readable



This screen should feel like an executive process map, not a train timetable designed by a mystic.



---



\# 23. Example Timeline Scenarios



\# 23.1 Outreach Launch on Time

State:

\- teaser ready

\- buyer list approved

\- client aligned



Effect:

\- Phase 2 starts on target

\- buyer momentum potential preserved



Player tension:

\- controlled optimism



\# 23.2 DD Gate Slipping

State:

\- shortlist decided

\- DD pack not fully ready

\- one legal review unresolved



Effect:

\- milestone delayed

\- downstream negotiation window compressed



Player tension:

\- process still alive, but margin for error shrinking



\# 23.3 Late-Phase Legal Compression

State:

\- SPA issues unresolved

\- exclusivity clock running

\- signing milestone drifting



Effect:

\- critical pressure

\- increased re-trade and fatigue risk



Player tension:

\- fewer tasks, much greater consequence



\# 23.4 Recovery Through Controlled Compression

State:

\- earlier slippage absorbed by team push and reduced buyer breadth



Effect:

\- actual path converges partially back toward target

\- but quality and load risk rise elsewhere



Player tension:

\- recovery achieved at a cost



---



\# 24. Initial Build Scope



For first playable implementation, include:



\- workspace header

\- timeline control bar

\- horizontal phase strip

\- milestone nodes

\- current week marker

\- target vs actual timing visibility

\- selected milestone detail panel

\- gate requirements panel

\- slippage indicators

\- linked navigation to tasks, deliverables, risks and inbox



This is enough to make progression and time pressure feel real.



---



\# 25. Future Enhancements



Possible later additions:

\- zoomable timeline

\- alternative scenario projection

\- confidence intervals for future milestones

\- milestone dependency graph

\- calendar-like weekly lane view

\- board/client reporting mode

\- replay of schedule changes over time

\- milestone forecasting assistant

\- timeline annotations by major events



Useful, yes.

Necessary now, no.



---



\# 26. Final Screen Statement



The Timeline / Phase Map screen of \*\*The M\&A Rainmaker\*\* must function as a premium temporal control and progression system, making phases, milestones, gate requirements and slippage legible and consequential. It should give the player a clear view of where the deal stands, where it is heading and how time pressure is shaping the process, ensuring that progression is always visible, structured and strategically meaningful.

