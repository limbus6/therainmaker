\# The M\&A Rainmaker

\## Deliverables Screen Specification

\### Version 1.0



---



\# 1. Purpose



This document defines the detailed screen specification for the \*\*Deliverables\*\* screen in \*\*The M\&A Rainmaker\*\*.



The Deliverables screen is the main control surface for all formal transaction materials and process outputs.



It should function as:



\- the production and readiness hub for transaction materials,

\- the main screen for tracking content quality and completion,

\- the place where document readiness, revision cycles and approval discipline become visible,

\- the bridge between execution and market-facing process quality,

\- and the system through which the player manages how the deal is presented to buyers.



This is not a document library.

This is a live production and readiness system for transaction-critical materials.



The screen must help the player understand:



\- which deliverables exist,

\- which are ready,

\- which are weak,

\- which are blocked,

\- which are late,

\- who owns them,

\- and how their quality and timing affect buyer momentum and deal credibility.



---



\# 2. Screen Design Intent



The Deliverables screen should feel like:



\- a premium transaction production desk,

\- a controlled editorial workflow for M\&A materials,

\- a serious quality-and-readiness interface,

\- and a disciplined support layer for buyer-facing execution.



Visually, it should sit primarily between:



\- \*\*Outlook Noir\*\*, for clarity, document-oriented structure and workflow usability,

\- and \*\*Terminal Prestige\*\*, for readiness indicators, quality logic and dependency structure.



A very light \*\*Cinematic Dealroom\*\* influence can appear in:

\- milestone-ready materials,

\- major launch states,

\- and high-importance deliverable summary blocks.



The mood should be:



\- focused,

\- polished,

\- pressurised,

\- quality-conscious,

\- and quietly consequential.



This screen should make the player feel that materials are not background admin. They are strategic instruments with deadlines and consequences.



---



\# 3. Gameplay Role



\# 3.1 Core Role

The Deliverables screen is one of the key execution-quality systems in the game.



It performs six major functions:



1\. tracks deliverable readiness,

2\. tracks deliverable quality,

3\. manages ownership and review loops,

4\. surfaces dependencies and blockers,

5\. links materials to buyers, phases and milestones,

6\. and translates production discipline into buyer confidence and process momentum.



\# 3.2 Why It Matters

In a sell-side process, the quality and timing of materials shape perception.



A buyer may not say:

\- `your Information Memorandum lacks narrative discipline and operational coherence`.



But the process will feel it.



Weak materials can:

\- reduce buyer engagement,

\- create confusion,

\- damage credibility,

\- delay outreach,

\- create avoidable questions,

\- and weaken competitive tension.



This screen makes that reality playable.



\# 3.3 What the Player Should Feel

The player should feel:



\- that good materials create leverage,

\- that weak materials create drag,

\- that revision cycles matter,

\- and that launch timing, quality and internal alignment are part of the game’s strategic spine.



---



\# 4. Primary Player Questions



The Deliverables screen must answer these questions quickly:



\- Which deliverables are critical right now?

\- Which are ready, and which are not?

\- Which have quality risk?

\- Which are blocked by review or dependency issues?

\- Which are delaying the process?

\- Which buyers or milestones depend on them?

\- Where should I intervene to improve quality or unlock momentum?



If the player cannot tell whether the process is market-ready, the screen is failing.



---



\# 5. Functional Objectives



The Deliverables screen must support all of the following:



\- full deliverable visibility,

\- readiness tracking,

\- quality tracking,

\- ownership and reviewer visibility,

\- revision cycle visibility,

\- dependency tracking,

\- deadline tracking,

\- linking deliverables to tasks, buyers, risks and milestones,

\- phase-sensitive relevance,

\- and making material quality a real gameplay variable.



---



\# 6. Screen Architecture



\# 6.1 Canonical Layout



The Deliverables screen should sit inside the standard application shell:



\- Topbar

\- Sidebar

\- Deliverables Workspace



Inside the Deliverables Workspace:



\- Workspace Header

\- Deliverables Control Bar

\- View Mode Bar

\- Main Deliverables Area

\- Selected Deliverable Detail Zone

\- Optional Bottom Warning / Readiness Strip



\# 6.2 Main Structural Logic



The screen should support a \*\*2-zone primary layout\*\*:



\- Main Deliverables Universe Zone

\- Selected Deliverable Detail Zone



Supporting layer:

\- optional bottom strip for blocked, overdue or launch-critical items



\# 6.3 Default Desktop Layout



Recommended width distribution:



\- Deliverables Universe Zone: 62%

\- Deliverable Detail Zone: 38%



This preserves enough width for list/pipeline views while keeping detail readable.



---



\# 7. Workspace Header



\# 7.1 Purpose

Establish current deliverables state and main production pressure.



\# 7.2 Content

Left side:

\- Screen title: `Deliverables`

\- Secondary line: current phase + readiness summary



Right side:

\- quick actions

\- key counters



\# 7.3 Header Summary Examples

Examples:

\- `Phase 1 · 6 active deliverables · 2 not ready · teaser launch at risk`

\- `Phase 4 · DD materials under revision · quality stable · deadlines compressing`



\# 7.4 Header Actions

Recommended:

\- Create Deliverable

\- View Launch-Critical

\- View Quality Risks

\- Open Linked Tasks

\- Open Review Queue



Optional:

\- Compare Versions

\- Open Timeline Dependencies



\# 7.5 Behaviour

\- sticky inside workspace

\- concise

\- immediately informative



---



\# 8. Deliverables Control Bar



\# 8.1 Purpose

Allow filtering, sorting and segmentation across the deliverables universe.



\# 8.2 Control Bar Structure

Left side:

\- Search field

\- Filter dropdowns



Right side:

\- Sort dropdown

\- View mode switch

\- optional saved views later



\# 8.3 Core Filters

Recommended filters:



\- Deliverable Type

\- Status

\- Readiness Level

\- Quality Level

\- Deadline Window

\- Owner

\- Reviewer

\- Workstream

\- Linked Buyer / Buyer Group

\- Milestone Relevance

\- Phase Relevance

\- Blocked / Unblocked



\# 8.4 Search Behaviour

Search should include:

\- deliverable name

\- type

\- owner

\- linked entity names

\- notes

\- tags



\# 8.5 Sort Options

Recommended:

\- Deadline

\- Readiness

\- Quality Risk

\- Most Recently Updated

\- Type

\- Owner

\- Most Critical

\- Launch Priority



\# 8.6 Behaviour Rule

The control layer must help the player find exposure quickly.

This is not the place for rummaging through document archaeology.



---



\# 9. View Modes



\# 9.1 Purpose

Different questions require different representations of deliverable state.



The Deliverables screen should support three core view modes:



1\. Deliverables List View

2\. Deliverables Pipeline View

3\. Deliverables Quality / Readiness View



Optional later:

4\. Version / Revision View

5\. Timeline View



---



\# 10. Deliverables List View



\# 10.1 Purpose

Primary operational mode for scanning all deliverables efficiently.



\# 10.2 Layout

A structured data table occupies the Deliverables Universe Zone.



\# 10.3 Recommended Columns

Core columns:

\- Deliverable Name

\- Type

\- Status

\- Readiness

\- Quality

\- Owner

\- Reviewer

\- Deadline

\- Dependencies

\- Linked Phase / Milestone

\- Linked Buyer Scope

\- Last Updated



Optional later:

\- Version

\- Revision Count

\- Approval State

\- Distribution State



\# 10.4 Column Behaviour

\- sortable

\- row selectable

\- hover states

\- important statuses shown as chips, bars or compact indicators

\- clicking row opens Deliverable Detail Zone



\# 10.5 Strengths

Best for:

\- operational tracking,

\- review queue management,

\- deadline scanning,

\- identifying weak materials quickly.



\# 10.6 Design Rule

This table should feel orderly and editorial, not bureaucratic sludge.



---



\# 11. Deliverables Pipeline View



\# 11.1 Purpose

Show deliverables as a progression through production stages.



\# 11.2 Layout

A stage-based pipeline or grouped columns represent deliverables across status stages.



\# 11.3 Recommended Pipeline Stages

Core stages may include:

\- Not Started

\- Drafting

\- Internal Review

\- Client Review

\- Revision

\- Approved

\- Ready

\- Distributed / Used



These may be adapted per deliverable type.



\# 11.4 Pipeline Card Content

Each deliverable card should show:

\- deliverable name

\- type

\- owner

\- deadline

\- readiness marker

\- quality marker

\- blocker marker

\- key linked milestone



\# 11.5 Strengths

Best for:

\- visualising flow,

\- spotting review bottlenecks,

\- seeing where materials stall,

\- understanding launch readiness.



\# 11.6 Design Rule

The pipeline should emphasise process flow, not imitate generic startup kanban theatre.



---



\# 12. Deliverables Quality / Readiness View



\# 12.1 Purpose

Show which deliverables are fit for use and which are risky, weak or incomplete.



\# 12.2 Layout

A ranked or matrix-style view occupies the main zone.



Possible axes:

\- readiness vs quality

\- criticality vs readiness

\- deadline proximity vs quality risk



\# 12.3 Recommended Dimensions

Examples:

\- Readiness

\- Quality Strength

\- Review Stability

\- Deadline Pressure

\- Buyer Sensitivity

\- Strategic Importance



\# 12.4 Use Case

Best for:

\- deciding where intervention matters most,

\- preparing for phase transitions,

\- deciding whether to launch or hold.



\# 12.5 Behaviour

\- clicking an item opens its full detail

\- hover may reveal interpretation

\- should surface attractive-but-unsafe materials clearly



\# 12.6 Design Rule

This view should help the player make launch and improvement decisions, not just admire coloured boxes.



---



\# 13. Selected Deliverable Detail Zone



\# 13.1 Purpose

Provide full production, readiness and quality detail for a selected deliverable.



\# 13.2 Structure

The detail panel should contain:



1\. Deliverable Header

2\. Strategic Purpose Summary

3\. Readiness \& Quality Block

4\. Ownership \& Review

5\. Timeline \& Deadline

6\. Dependencies

7\. Version / Revision Snapshot

8\. Linked Entities

9\. Risks \& Consequences

10\. Action Area



\# 13.3 Deliverable Header

Should include:

\- deliverable name

\- type

\- current status

\- readiness state

\- key chips



Optional:

\- milestone-critical marker

\- buyer-facing marker

\- launch-sensitive marker



\# 13.4 Strategic Purpose Summary

A concise explanation of what the deliverable is for and why it matters.



Example:

\- `Core outreach material for initial buyer engagement. Delay reduces process momentum and weakens first-market impression.`



Deliverables should not feel like file names in a dark cupboard.



\# 13.5 Readiness \& Quality Block

Display clearly:

\- readiness level

\- quality level

\- current fit-for-use state

\- review stability

\- urgency of improvement



These can be shown through:

\- labelled scales,

\- bars,

\- chips,

\- compact narrative hints.



\# 13.6 Ownership \& Review

Show:

\- current owner

\- lead reviewer

\- client review state

\- internal review queue

\- review bottleneck warnings



\# 13.7 Timeline \& Deadline

Show:

\- creation date

\- last updated

\- target ready date

\- launch / use date

\- delay risk

\- time sensitivity



\# 13.8 Dependencies

Show:

\- prerequisite tasks

\- required inputs

\- missing data / approvals

\- linked deliverables

\- downstream process steps affected



\# 13.9 Version / Revision Snapshot

For first implementation, this can be simple.



Show:

\- current version label

\- revision count

\- most recent revision reason

\- review history summary



Optional later:

\- compare versions

\- show full revision chain



\# 13.10 Linked Entities

Possible linked items:

\- Buyer Group

\- Client

\- Task Chain

\- Inbox Thread

\- Risk Item

\- Timeline Milestone

\- Workstream



\# 13.11 Risks \& Consequences

Show:

\- if delayed, likely impact

\- if low quality, likely impact

\- if launched too early, likely impact

\- if ignored, likely impact



Example:

\- `Low quality may reduce buyer confidence and increase clarification load.`

\- `Delay may postpone outreach and weaken timetable confidence.`



\# 13.12 Action Area

Core actions may include:

\- Assign / Reassign Owner

\- Send to Review

\- Approve

\- Mark Ready

\- Request Revision

\- Open Linked Tasks

\- Open Linked Buyer Scope

\- Flag Quality Risk

\- Delay Launch

\- Trigger Distribution / Use



---



\# 14. Deliverable Information Model



\# 14.1 Purpose

Deliverables must behave like meaningful process assets.



\# 14.2 Core Deliverable Fields

Each deliverable should have at least:



\- Deliverable Name

\- Deliverable Type

\- Description / Purpose

\- Owner

\- Reviewer

\- Status

\- Readiness Level

\- Quality Level

\- Deadline

\- Planned Use / Launch Date

\- Created At

\- Updated At

\- Revision Count

\- Current Version Label

\- Dependency List

\- Blocked State

\- Linked Entity Type / IDs

\- Buyer Scope

\- Phase Relevance

\- Milestone Relevance

\- Risk Sensitivity

\- Notes



\# 14.3 Deliverable Types

Core deliverable types may include:

\- Teaser

\- NDA Package

\- Buyer List

\- Information Memorandum

\- Financial Model

\- Process Letter

\- Management Presentation

\- DD Pack

\- Vendor DD Summary

\- SPA Support Pack

\- Closing Checklist



These types may appear or matter differently by phase.



---



\# 15. Status System



\# 15.1 Purpose

Deliverable status must describe production reality clearly.



\# 15.2 Recommended Statuses

Core statuses:

\- Not Started

\- Drafting

\- In Review

\- Revision Required

\- Approved

\- Ready

\- Used / Distributed

\- Delayed

\- Blocked



As with tasks, some may be overlays rather than mutually exclusive states.



\# 15.3 Status Logic

Examples:

\- `In Review` means content exists but is awaiting approval

\- `Revision Required` means feedback has been received and readiness is impaired

\- `Ready` means fit for intended use

\- `Used / Distributed` means already released into process

\- `Blocked` means missing dependency or approval prevents progress



\# 15.4 Design Rule

Statuses should map to real production states, not decorative jargon.



---



\# 16. Readiness System



\# 16.1 Purpose

Readiness answers a simple but crucial question:

\- can this deliverable be used now with confidence?



\# 16.2 Recommended Readiness States

Possible readiness states:

\- Not Ready

\- Partially Ready

\- Nearly Ready

\- Ready

\- Ready but Fragile, optional

\- Launch Risk, optional overlay



\# 16.3 Readiness Inputs

Readiness may depend on:

\- completion status

\- review completion

\- data completeness

\- dependency clearance

\- client sign-off

\- quality threshold



\# 16.4 Design Rule

Readiness is not just status by another name.

A document can be complete and still not be ready.



That distinction matters a great deal.



---



\# 17. Quality System



\# 17.1 Purpose

Quality turns deliverables into strategic gameplay objects.



\# 17.2 Recommended Quality States

Possible quality states:

\- Weak

\- Acceptable

\- Strong

\- Excellent

\- High Risk, optional overlay



\# 17.3 Quality Inputs

Quality may be influenced by:

\- team skill

\- time allocated

\- reviewer quality

\- client input stability

\- overload

\- rushed deadlines

\- prior preparation strength



\# 17.4 Gameplay Relevance

Quality should influence:

\- buyer engagement

\- buyer clarification load

\- process credibility

\- client confidence

\- milestone smoothness

\- risk creation



\# 17.5 Design Rule

Quality should matter, but not in a cartoonishly deterministic way.

A weak IM should hurt. It should not summon lightning from the heavens.



---



\# 18. Ownership and Review Logic



\# 18.1 Purpose

Deliverables need both creation and validation discipline.



\# 18.2 Ownership Model

Each deliverable should have:

\- primary owner

\- reviewer

\- optional client approval state



\# 18.3 Review States

Possible review states:

\- Not Reviewed

\- Internal Review Pending

\- Internal Review Complete

\- Client Review Pending

\- Client Comments Received

\- Approved



\# 18.4 Bottleneck Logic

Review delays should create real exposure:

\- launch delays

\- revision loops

\- team load pressure

\- milestone compression



\# 18.5 Design Rule

The player must be able to see whether the bottleneck is:

\- drafting,

\- review,

\- client sign-off,

\- or missing data.



That is the useful truth.



---



\# 19. Dependencies and Blockers



\# 19.1 Purpose

Deliverables are almost never fully standalone.



\# 19.2 Dependency Types

Deliverables may depend on:

\- task completion

\- financial data

\- management input

\- legal input

\- client feedback

\- buyer list finalisation

\- previous deliverable completion

\- DD findings

\- phase unlocks



\# 19.3 Blocker Examples

\- waiting on client comments

\- waiting on updated financials

\- waiting on analyst draft

\- waiting on legal language

\- waiting on management presentation inputs



\# 19.4 Blocker Visibility

Blocked deliverables must be clearly visible in:

\- list view

\- pipeline view

\- detail panel

\- warning summaries



\# 19.5 Design Rule

The player should see both:

\- what is blocked,

\- and what the blocked deliverable is holding up downstream.



That is where consequences become interesting.



---



\# 20. Buyer and Milestone Relevance



\# 20.1 Purpose

Deliverables should connect directly to process progression.



\# 20.2 Buyer Scope

Some deliverables may be:

\- universal

\- buyer-specific

\- shortlist-specific

\- late-stage exclusive materials



\# 20.3 Milestone Relevance

Examples:

\- teaser before outreach

\- IM before broad buyer engagement

\- management presentation before deeper diligence

\- DD pack before advanced process

\- SPA support before negotiation milestones



\# 20.4 Design Rule

The Deliverables screen must make visible not just what a material is, but where it matters in the process.



---



\# 21. Linked Systems Integration



\# 21.1 Deliverables Screen as Process Bridge

The Deliverables screen must connect directly to:



\- Tasks \& Workstreams

\- Inbox

\- Buyers

\- Client

\- Risks \& Issues

\- Timeline / Phase Map

\- Team



\# 21.2 Typical Cross-System Flows

Examples:

\- inbox feedback triggers revision

\- blocked deliverable creates task escalation

\- weak material reduces buyer momentum

\- improved readiness unlocks phase progression

\- rushed review increases quality risk

\- buyer-specific request generates tailored deliverable follow-up



\# 21.3 Design Rule

The Deliverables screen should feel like the process presentation layer wired into operational reality.



---



\# 22. Dynamic Behaviour



\# 22.1 Deliverable Evolution Over Time

Deliverables must visibly evolve as the process advances.



Possible changes:

\- drafting starts

\- review begins

\- comments return

\- revisions accumulate

\- readiness improves

\- quality drops under time pressure

\- deliverable launches

\- late-stage reuse creates strain



\# 22.2 Phase Sensitivity

Different phases should emphasise different deliverables.



\## Early Phase

More emphasis on:

\- teaser

\- buyer list

\- NDA package

\- IM draft



\## Mid Phase

More emphasis on:

\- management presentation

\- DD pack

\- buyer-specific follow-up materials



\## Late Phase

More emphasis on:

\- legal support packs

\- closing lists

\- issue trackers

\- negotiation-support materials



\# 22.3 Event Sensitivity

Major events should affect materials:

\- client comment shock

\- buyer dissatisfaction

\- market shift

\- DD problem

\- legal update

\- team overload

\- phase acceleration or delay



The screen should reflect these shifts clearly.



---



\# 23. Warning and Readiness Layer



\# 23.1 Purpose

Summarise material exposure quickly.



\# 23.2 Optional Bottom Warning Strip

May show:

\- launch-critical deliverables not ready

\- quality-risk materials

\- blocked review queue

\- overdue revisions

\- buyer-sensitive materials under strain



\# 23.3 Alert Examples

\- `Teaser not ready for planned outreach wave`

\- `Management presentation quality risk rising due to rushed revision`

\- `DD pack blocked by unresolved financial input`

\- `Client review delaying IM release`



\# 23.4 Behaviour Rule

Warnings must point to actionable intervention.



---



\# 24. UX States



\# 24.1 Standard States

The Deliverables screen must support:

\- full loaded state

\- no deliverable selected

\- no results for filters

\- blocked-heavy state

\- launch-critical state

\- loading state



\# 24.2 No Deliverable Selected State

Example:

\- `Select a deliverable to review readiness, quality and dependencies.`



\# 24.3 No Filter Results State

Example:

\- `No deliverables match current filters.`



\# 24.4 Loading State

Use:

\- skeleton rows or cards

\- muted pipeline columns

\- restrained shimmer if needed



\# 24.5 Launch-Critical State

At sensitive moments:

\- readiness and deadline pressure become more visually prominent

\- quality warnings sharpen

\- linked buyer / milestone relevance should be easier to access



---



\# 25. Accessibility and Readability



\# 25.1 Contrast

\- readiness and quality states must remain readable

\- blocked, delayed and risky states must not rely only on colour

\- table and pipeline text must remain crisp in dark UI



\# 25.2 Click Targets

Rows, cards, readiness markers and actions must all be comfortably usable.



\# 25.3 Hierarchy

The player should quickly find:

\- critical deliverables,

\- weak materials,

\- launch blockers,

\- and review bottlenecks.



\# 25.4 Information Overload Rule

The screen should clarify production reality, not drown the player in pseudo-document management ritual.



---



\# 26. Visual Style Guidance for This Screen



\# 26.1 Dominant Variant

The Deliverables screen should primarily use \*\*Outlook Noir\*\*.



\# 26.2 Supporting Variant

Use \*\*Terminal Prestige\*\* for:

\- readiness markers,

\- quality indicators,

\- dependency states,

\- and production logic.



\# 26.3 Light Cinematic Accent

A small amount of \*\*Cinematic Dealroom\*\* may be used in:

\- milestone-critical deliverable states,

\- launch-ready hero materials,

\- and major release moments.



\# 26.4 Visual Rules

\- clean document-oriented structure

\- compact but polished layout

\- strong clarity on readiness and quality

\- restrained accent usage

\- review states clearly differentiated

\- detail panel calm and readable



This screen should feel like a high-end transaction production desk, not a file browser with delusions of grandeur.



---



\# 27. Example Deliverable Scenarios



\# 27.1 Teaser Delay Before Outreach

Deliverable:

\- teaser



Risk:

\- buyer outreach slips

\- early momentum weakens



Player tension:

\- small document, disproportionate process consequence



\# 27.2 IM Strong but Awaiting Client Review

Deliverable:

\- Information Memorandum



Risk:

\- high quality, not yet releasable

\- review bottleneck blocks progress



Player tension:

\- readiness impaired by governance, not execution



\# 27.3 DD Pack Ready but Low Quality

Deliverable:

\- DD pack



Risk:

\- can technically be shared

\- but may frustrate buyers and increase clarification burden



Player tension:

\- launch now and absorb friction, or improve and lose time



\# 27.4 Management Presentation Under Revision Loop

Deliverable:

\- management presentation



Risk:

\- repeated client comments

\- team overload

\- buyer schedule at risk



Player tension:

\- quality ambition versus timetable discipline



---



\# 28. Initial Build Scope



For first playable implementation, include:



\- workspace header

\- deliverables control bar

\- list view

\- pipeline view

\- selected deliverable detail panel

\- core statuses

\- readiness states

\- quality states

\- owner / reviewer visibility

\- dependency and blocker visibility

\- core actions:

&nbsp; - assign / reassign

&nbsp; - send to review

&nbsp; - approve

&nbsp; - mark ready

&nbsp; - open linked tasks

&nbsp; - open linked entities

\- warning layer for launch-critical and blocked materials



This is enough to make deliverables strategically relevant.



---



\# 29. Future Enhancements



Possible later additions:

\- version comparison

\- richer revision timeline

\- buyer-specific material variants

\- approval chain modelling

\- document quality sub-factors

\- auto-generated follow-up tasks

\- distribution history

\- material fatigue / reuse effects

\- presentation rehearsal mechanics



Useful, yes.

Necessary now, no.



---



\# 30. Final Screen Statement



The Deliverables screen of \*\*The M\&A Rainmaker\*\* must function as a premium readiness and quality control system for transaction materials, making document production, revision discipline and launch timing legible and consequential. It should turn process materials into meaningful gameplay assets whose quality and timing shape buyer perception, execution flow and overall deal momentum.

