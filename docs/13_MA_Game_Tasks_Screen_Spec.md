\# The M\&A Rainmaker

\## Tasks \& Workstreams Screen Specification

\### Version 1.0



---



\# 1. Purpose



This document defines the detailed screen specification for the \*\*Tasks \& Workstreams\*\* screen in \*\*The M\&A Rainmaker\*\*.



The Tasks \& Workstreams screen is the main execution control surface of the game.



It should function as:



\- the operational engine of the transaction,

\- the primary interface for managing execution flow,

\- the place where dependencies, bottlenecks and team strain become visible,

\- the control room for workstream progress,

\- and the system through which planning discipline turns into transaction momentum.



This is not a generic to-do list.

This is a structured execution model for a live sell-side process.



The screen must help the player understand:



\- what needs to be done,

\- what is blocked,

\- what is late,

\- who is overloaded,

\- which dependencies threaten the timetable,

\- and where intervention will have the greatest impact.



---



\# 2. Screen Design Intent



The Tasks \& Workstreams screen should feel like:



\- a professional execution command layer,

\- a high-signal workflow board,

\- a process management terminal,

\- and a serious operational instrument under deadline pressure.



Visually, it should sit primarily between:



\- \*\*Terminal Prestige\*\*, for density, dependency logic and analytical structure,

\- and \*\*Outlook Noir\*\*, for workflow legibility and disciplined task handling.



There should be almost no \*\*Cinematic Dealroom\*\* influence here except perhaps in severe escalation states or phase-critical moments.



The mood should be:



\- focused,

\- methodical,

\- pressurised,

\- clear,

\- and quietly unforgiving.



This is where good intentions meet the wall clock.



---



\# 3. Gameplay Role



\# 3.1 Core Role

The Tasks \& Workstreams screen is one of the main systems that turns strategy into execution.



It performs seven major functions:



1\. tracks task progress,

2\. shows workstream status,

3\. reveals dependencies and blockers,

4\. monitors ownership and load,

5\. surfaces overdue and fragile areas,

6\. supports reassignment and reprioritisation,

7\. and links execution health to broader deal outcomes.



\# 3.2 Why It Matters

The game should not pretend that M\&A is only:

\- charm,

\- buyer theatre,

\- and beautifully phrased pressure emails.



Deals are also moved by:

\- drafts,

\- follow-ups,

\- data requests,

\- reviews,

\- revisions,

\- and people running out of hours.



This screen is where process realism earns its keep.



\# 3.3 What the Player Should Feel

The player should feel:



\- that the process has structure,

\- that sequencing matters,

\- that bottlenecks are dangerous,

\- that strong execution creates leverage,

\- and that neglecting operational discipline will eventually poison the deal.



---



\# 4. Primary Player Questions



The Tasks \& Workstreams screen must answer these questions quickly:



\- What must be done now?

\- What is late or at risk?

\- What is blocked?

\- Which workstreams are healthy, and which are fragile?

\- Who is overloaded?

\- What task has the biggest downstream impact?

\- Where should I intervene first?



If the player cannot identify the critical path of pain, the screen is not doing its job.



---



\# 5. Functional Objectives



The Tasks \& Workstreams screen must support all of the following:



\- full task visibility,

\- workstream grouping,

\- status tracking,

\- deadline tracking,

\- dependency visibility,

\- blocker identification,

\- owner and team load visibility,

\- quick reassignment,

\- quick prioritisation,

\- linking tasks to buyers, deliverables, risks and inbox items,

\- and making process slippage legible before it becomes catastrophic.



---



\# 6. Screen Architecture



\# 6.1 Canonical Layout



The Tasks \& Workstreams screen should sit inside the standard application shell:



\- Topbar

\- Sidebar

\- Tasks Workspace



Inside the Tasks Workspace:



\- Workspace Header

\- Tasks Control Bar

\- View Mode Bar

\- Main Task Universe Area

\- Selected Task Detail Zone

\- Optional Bottom Warning Band



\# 6.2 Main Structural Logic



The screen should support a \*\*2-zone primary layout\*\*:



\- Main Task Universe Zone

\- Selected Task Detail Zone



Supporting layer:

\- optional bottom warning / blocker summary strip



\# 6.3 Default Desktop Layout



Recommended width distribution:



\- Task Universe Zone: 64%

\- Task Detail Zone: 36%



This gives enough width for dense task lists while preserving readable detail.



If Dependency View is selected, the detail panel may collapse or move to drawer behaviour.



---



\# 7. Workspace Header



\# 7.1 Purpose

Establish current execution state and top operational pressure.



\# 7.2 Content

Left side:

\- Screen title: `Tasks \& Workstreams`

\- Secondary line: current week + execution summary



Right side:

\- quick actions

\- key counters



\# 7.3 Header Summary Examples

Examples:

\- `Week 9 · 34 open tasks · 5 blocked · 4 overdue · analyst load rising`

\- `Week 15 · DD execution under pressure · 3 critical dependencies at risk`



\# 7.4 Header Actions

Recommended:

\- Add Task

\- View Overdue

\- View Dependencies

\- Open Deliverables

\- Open Team Load



Optional:

\- Bulk Reassign

\- Open Critical Path



\# 7.5 Behaviour

\- sticky inside workspace

\- concise

\- strongly operational



---



\# 8. Tasks Control Bar



\# 8.1 Purpose

Allow filtering, sorting and mode switching across the task universe.



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



\- Workstream

\- Owner

\- Status

\- Urgency

\- Deadline Window

\- Blocked / Unblocked

\- Linked Entity Type

\- Risk Level

\- Requires Intervention

\- Team Member

\- Phase Relevance



\# 8.4 Search Behaviour

Search should include:

\- task title

\- owner name

\- workstream name

\- linked buyer/client/deliverable

\- notes

\- tags



\# 8.5 Sort Options

Recommended:

\- Deadline

\- Urgency

\- Recently Updated

\- Workstream

\- Owner

\- Risk

\- Dependency Weight

\- Requires Attention



\# 8.6 Behaviour Rule

Filtering must feel fast and useful.

This screen should support operational slicing without becoming a tax audit of dropdowns.



---



\# 9. View Modes



\# 9.1 Purpose

Different execution questions require different organisational views.



The Tasks \& Workstreams screen should support three core view modes:



1\. Task List View

2\. Workstream View

3\. Dependency View



Optional later:

4\. Calendar / Timeline View



---



\# 10. Task List View



\# 10.1 Purpose

Primary operational mode for scanning all tasks efficiently.



\# 10.2 Layout

A structured data table occupies the Task Universe Zone.



\# 10.3 Recommended Columns

Core columns:

\- Task Name

\- Workstream

\- Owner

\- Status

\- Deadline

\- Urgency

\- Dependency State

\- Linked Entity

\- Quality Risk

\- Last Updated



Optional later:

\- Estimated Effort

\- Team Load Impact

\- Phase Gate Relevance

\- Escalation State



\# 10.4 Column Behaviour

\- sortable

\- row selectable

\- hover states

\- important statuses shown as chips or compact indicators

\- clicking row opens Selected Task Detail Zone



\# 10.5 Strengths

Best for:

\- full operational scanning,

\- deadline control,

\- identifying overdue items,

\- administrative triage,

\- and quick reprioritisation.



\# 10.6 Design Rule

This table must remain calm under density.

If it becomes a spreadsheet swamp, the player will feel punished for caring.



---



\# 11. Workstream View



\# 11.1 Purpose

Help the player understand execution by process stream rather than by individual task.



\# 11.2 Layout

Tasks grouped into vertical workstream panels or grouped collapsible sections.



\# 11.3 Recommended Workstreams

Core workstreams may include:

\- Preparation

\- Financial Analysis

\- Marketing Materials

\- Buyer Outreach

\- Management Interaction

\- Due Diligence

\- Negotiation

\- Legal / Closing Readiness



These may vary slightly by game phase.



\# 11.4 Workstream Panel Content

Each workstream should show:

\- workstream name

\- overall progress

\- number of open tasks

\- blocked tasks

\- overdue tasks

\- pressure level

\- top current blocker

\- optional owner mix



Expanding a workstream reveals task rows/cards inside it.



\# 11.5 Strengths

Best for:

\- understanding where process strain sits,

\- seeing cluster-level health,

\- aligning task flow to M\&A logic,

\- and identifying neglected workstreams.



\# 11.6 Design Rule

Workstream View should reveal process shape, not just grouped admin clutter.



---



\# 12. Dependency View



\# 12.1 Purpose

Show sequencing logic and critical execution chains.



\# 12.2 Layout

A structured dependency map, chain list, or graph-assisted list occupies the main zone.



For first implementation, a structured dependency list may be better than a fully visual graph.



\# 12.3 Dependency Elements

Each dependency chain should show:

\- upstream task

\- downstream dependent task

\- current blocker state

\- criticality

\- owner

\- expected impact of delay



\# 12.4 Recommended Dependency Types

Examples:

\- deliverable draft before buyer outreach

\- buyer feedback before management Q\&A prep

\- DD checklist before dataroom activation

\- SPA comments before negotiation milestone

\- client review before final distribution



\# 12.5 Critical Path Logic

Some tasks should be marked as:

\- critical path,

\- high downstream impact,

\- or sequence-sensitive.



This is where the player understands which small operational failure can contaminate an entire phase.



\# 12.6 Strengths

Best for:

\- unblocking work,

\- preventing slippage,

\- identifying hidden fragility,

\- and understanding process sequencing.



\# 12.7 Design Rule

Dependency View must clarify causality.

If it becomes a spaghetti ritual of lines and boxes, it has betrayed civilisation.



---



\# 13. Selected Task Detail Zone



\# 13.1 Purpose

Provide full operational detail for a selected task.



\# 13.2 Structure

The detail panel should contain:



1\. Task Header

2\. Task Summary

3\. Ownership and Load

4\. Status and Timing

5\. Dependencies

6\. Risk and Quality

7\. Linked Entities

8\. Notes / History

9\. Action Area



\# 13.3 Task Header

Should include:

\- task name

\- workstream

\- status

\- urgency

\- key chips



Optional:

\- phase relevance tag

\- critical path marker



\# 13.4 Task Summary

A concise explanation of what the task is and why it matters.



Example:

\- `Prepare revised teaser language incorporating client comments before next buyer wave. Delay may reduce outreach momentum.`



This summary is extremely useful.

Tasks should not feel like dead labels.



\# 13.5 Ownership and Load

Show:

\- current owner

\- team member role

\- load level of owner

\- backup owner, if applicable

\- reassignment suitability



\# 13.6 Status and Timing

Show:

\- current status

\- creation date

\- due date

\- overdue state

\- estimated effort, if modelled

\- time sensitivity

\- last updated



\# 13.7 Dependencies

Show:

\- prerequisites

\- downstream tasks

\- blocker origin

\- dependency severity



This section should make clear whether the task is:

\- self-contained,

\- blocked,

\- or a gateway for many others.



\# 13.8 Risk and Quality

Show:

\- execution risk

\- quality sensitivity

\- if rushed, likely consequence

\- if ignored, likely consequence



Example:

\- `Low task complexity, but high schedule sensitivity. Delay could push buyer outreach by one week.`



\# 13.9 Linked Entities

Possible linked items:

\- Buyer

\- Client

\- Deliverable

\- Inbox Thread

\- Risk Item

\- Timeline Milestone



\# 13.10 Notes / History

Show:

\- short task history

\- last changes

\- comments or internal notes

\- escalation history if relevant



\# 13.11 Action Area

Core actions may include:

\- Assign / Reassign

\- Change Priority

\- Mark In Progress

\- Mark Complete

\- Escalate

\- Add Note

\- Open Linked Entity

\- Unblock, if dependency cleared

\- Create Follow-up Task



---



\# 14. Task Information Model



\# 14.1 Purpose

Tasks must feel like meaningful execution units, not generic admin tokens.



\# 14.2 Core Task Fields

Each task should have at least:



\- Task Name

\- Description / Summary

\- Workstream

\- Owner

\- Status

\- Priority / Urgency

\- Deadline

\- Created At

\- Updated At

\- Dependency List

\- Blocked State

\- Linked Entity Type

\- Linked Entity ID

\- Quality Sensitivity

\- Risk Level

\- Phase Relevance

\- Estimated Effort, optional

\- Escalation State

\- Notes



\# 14.3 Task Types

Different task types may exist, such as:

\- Deliverable Task

\- Communication Task

\- Review Task

\- Internal Coordination Task

\- DD Task

\- Legal Task

\- Client Management Task

\- Buyer Management Task

\- System / Administrative Task



These types may affect urgency logic, consequence logic and default actions.



---



\# 15. Task Status System



\# 15.1 Purpose

Status must reflect operational truth clearly.



\# 15.2 Recommended Statuses

Core statuses:

\- Not Started

\- In Progress

\- Waiting

\- Blocked

\- Review Needed

\- Completed

\- Overdue

\- Escalated



You may model Overdue as either:

\- a true status,

\- or a timing overlay on top of another status.



Overlay is often cleaner.



\# 15.3 Status Logic

Examples:

\- `Blocked` means cannot progress due to dependency or missing input

\- `Waiting` means paused externally but not structurally broken

\- `Review Needed` means task output exists but is pending validation

\- `Escalated` means operational concern has become managerial



\# 15.4 Design Rule

Statuses should be operationally distinct, not synonyms with different hats.



---



\# 16. Urgency and Criticality



\# 16.1 Purpose

Not all tasks matter equally.



\# 16.2 Recommended Distinctions

A task can be:

\- low urgency

\- medium urgency

\- high urgency

\- critical



Separately, it can have:

\- low downstream impact

\- medium downstream impact

\- high downstream impact



These should not be conflated.



A small urgent task can be annoying.

A high-impact dependency task can kill a timetable.



Different beasts.



\# 16.3 Presentation

Urgency and downstream impact should both be visible in the UI.

Possible methods:

\- urgency chip

\- impact chip

\- critical path marker

\- dependency weight icon



---



\# 17. Ownership and Team Load



\# 17.1 Purpose

Tasks only matter if people can realistically perform them.



\# 17.2 Ownership Rules

Each task should have:

\- one primary owner

\- optional secondary support

\- ownership history, later if desired



\# 17.3 Team Load Integration

The Tasks screen must show when:

\- owners are overloaded,

\- work is unevenly distributed,

\- reassignment is sensible,

\- completion risk is increased by capacity strain.



\# 17.4 Load Indicators

Possible load states:

\- Available

\- Busy

\- Stretched

\- Overloaded



These should influence:

\- task completion reliability,

\- error probability,

\- morale / burnout systems if present.



\# 17.5 Design Rule

A task assigned to an overloaded analyst should not feel equivalent to the same task assigned to someone with capacity.

That fiction would collapse the simulation.



---



\# 18. Dependencies and Blockers



\# 18.1 Purpose

Dependencies are where process realism lives.



\# 18.2 Dependency Rules

Tasks may depend on:

\- other tasks,

\- deliverable completion,

\- client review,

\- buyer response,

\- legal input,

\- data readiness,

\- team availability,

\- phase unlocks.



\# 18.3 Blocker Types

Examples:

\- waiting on client

\- waiting on buyer

\- waiting on internal review

\- waiting on document

\- waiting on legal input

\- waiting on management meeting

\- insufficient team capacity



\# 18.4 Blocker Visibility

Blocked tasks must be immediately visible in:

\- task list,

\- workstream view,

\- detail panel,

\- warning summaries.



\# 18.5 Design Rule

The player must be able to see not just that a task is blocked, but why.

Mystery is for buyers, not for task plumbing.



---



\# 19. Workstream Health



\# 19.1 Purpose

The player should understand execution health at workstream level.



\# 19.2 Workstream Indicators

Each workstream may expose:

\- progress

\- blocked count

\- overdue count

\- load intensity

\- quality fragility

\- milestone readiness

\- top blocker



\# 19.3 Workstream Health States

Possible states:

\- Stable

\- Active

\- Pressured

\- Fragile

\- Critical



\# 19.4 Behaviour

Workstream health should be influenced by:

\- task completion,

\- blockers,

\- team load,

\- linked buyer/client demands,

\- time compression,

\- and phase sensitivity.



This helps the screen become strategic, not merely clerical.



---



\# 20. Linked Systems Integration



\# 20.1 Tasks Screen as Operational Hub

The Tasks screen must connect directly to:



\- Inbox

\- Team

\- Deliverables

\- Buyers

\- Client

\- Risks \& Issues

\- Timeline / Phase Map



\# 20.2 Typical Cross-System Flows

Examples:

\- inbox email creates task

\- blocked deliverable task raises risk

\- buyer request spawns follow-up tasks

\- overdue client update harms confidence

\- DD issue creates critical workstream chain

\- timeline pressure increases task urgency



\# 20.3 Design Rule

The Tasks screen should feel like the execution spine of the whole system.



---



\# 21. Dynamic Behaviour



\# 21.1 Task Evolution Over Time

Tasks must visibly evolve as time advances.



Possible changes:

\- new tasks created

\- urgency increases

\- tasks become blocked

\- deadlines slip

\- review returns task to active

\- linked risks intensify

\- ownership changes



\# 21.2 Phase Sensitivity

Different phases should emphasise different workstreams.



\## Early Phase

More emphasis on:

\- preparation,

\- buyer list building,

\- teaser / IM preparation,

\- client alignment.



\## Mid Phase

More emphasis on:

\- buyer coordination,

\- management presentation prep,

\- DD readiness,

\- shortlist support.



\## Late Phase

More emphasis on:

\- legal,

\- SPA support,

\- diligence resolutions,

\- exclusivity pressures,

\- closing readiness.



\# 21.3 Event Sensitivity

Major events should spawn or reprioritise tasks:

\- client escalation

\- buyer drop-out

\- bid received

\- DD issue

\- legal dispute

\- timeline slip

\- market shock



The screen should reflect these changes clearly and promptly.



---



\# 22. Warning and Escalation Layer



\# 22.1 Purpose

Execution problems need summarised visibility.



\# 22.2 Optional Bottom Warning Band

May show:

\- overdue task count

\- blocked dependency chains

\- overloaded owners

\- critical-path slippage

\- review bottlenecks



\# 22.3 Alert Examples

\- `3 critical tasks overdue in DD workstream`

\- `Analyst Marta overloaded across 6 open items`

\- `Buyer outreach delayed due to unresolved teaser revision`

\- `Closing readiness exposed by unresolved legal review`



\# 22.4 Behaviour Rule

Warnings should point toward action.

Do not dump vague anxiety on the player and call it a feature.



---



\# 23. UX States



\# 23.1 Standard States

The Tasks \& Workstreams screen must support:

\- full loaded state

\- no tasks match filters

\- no task selected

\- high blocker state

\- overload-heavy state

\- loading state



\# 23.2 No Task Selected State

Example:

\- `Select a task to review ownership, dependencies and execution risk.`



\# 23.3 No Filter Results State

Example:

\- `No tasks match current filters.`



\# 23.4 Loading State

Use:

\- skeleton table rows

\- muted workstream shells

\- restrained shimmer if needed



\# 23.5 High Pressure State

Later phases or crisis moments may show:

\- more blocked items

\- more warnings

\- stronger critical-path indicators

\- denser intervention cues



Clarity must survive this escalation.



---



\# 24. Accessibility and Readability



\# 24.1 Contrast

\- task names and statuses must be crisp

\- overdue, blocked and critical states must not rely only on colour

\- dependency markers must remain legible in dense lists



\# 24.2 Click Targets

Rows, task chips, owner links and actions must be comfortably clickable.



\# 24.3 Hierarchy

The player’s eye should find quickly:

\- critical tasks,

\- blocked items,

\- overloaded owners,

\- and workstreams under strain.



\# 24.4 Information Overload Rule

This screen should clarify operational reality, not cosplay as project management complexity.



---



\# 25. Visual Style Guidance for This Screen



\# 25.1 Dominant Variant

The Tasks \& Workstreams screen should primarily use \*\*Terminal Prestige\*\*.



\# 25.2 Supporting Variant

Use \*\*Outlook Noir\*\* for:

\- readability,

\- table structure,

\- control bar clarity,

\- and action placement.



\# 25.3 Visual Rules

\- high-density but clean layout

\- strong column logic

\- restrained accent colour

\- urgency and blocker signals clearly differentiated

\- workstream grouping easy to scan

\- detail panel calm and readable



This screen should feel like a serious workflow instrument, not productivity theatre for people who enjoy rearranging digital post-its.



---



\# 26. Example Task Scenarios



\# 26.1 Teaser Revision Delay

Task:

\- revise teaser with client comments



Risk:

\- buyer outreach cannot proceed



Player tension:

\- small task, high downstream impact



\# 26.2 DD Request Bottleneck

Task:

\- collect HR data pack for shortlisted bidders



Risk:

\- diligence frustration

\- buyer confidence erosion



Player tension:

\- medium complexity, high timing sensitivity



\# 26.3 Overloaded Analyst Review Queue

Task cluster:

\- multiple deliverable review tasks assigned to same owner



Risk:

\- quality slippage

\- missed deadlines

\- hidden execution fragility



Player tension:

\- requires reassignment and prioritisation



\# 26.4 Legal Mark-up Delay

Task:

\- coordinate SPA comment turnaround



Risk:

\- exclusivity frustration

\- closing timeline slippage



Player tension:

\- late-phase pressure

\- low glamour, massive consequence



---



\# 27. Initial Build Scope



For first playable implementation, include:



\- workspace header

\- tasks control bar

\- task list view

\- workstream view

\- selected task detail panel

\- core statuses

\- owner and deadline visibility

\- blocked marker

\- basic dependency logic

\- core actions:

&nbsp; - assign / reassign

&nbsp; - change priority

&nbsp; - mark in progress

&nbsp; - mark complete

&nbsp; - open linked entity

\- workstream health summary

\- overdue and blocked warning layer



This is enough to make execution management feel real.



---



\# 28. Future Enhancements



Possible later additions:

\- advanced dependency graph

\- effort estimation model

\- drag-and-drop task reprioritisation

\- bulk reassignment tools

\- team morale integration

\- completion probability modelling

\- automatic task generation from events

\- critical path view

\- calendar mode

\- resource planning overlays



Useful, yes.

Necessary now, no.



---



\# 29. Final Screen Statement



The Tasks \& Workstreams screen of \*\*The M\&A Rainmaker\*\* must function as a premium execution control system for a live sell-side process, making deadlines, dependencies, blockers and ownership legible and actionable. It should turn operational discipline into meaningful gameplay, ensuring that execution quality and sequencing matter as much as judgement and buyer management.

