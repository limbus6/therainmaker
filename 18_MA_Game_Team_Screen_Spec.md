\# The M\&A Rainmaker

\## Team Screen Specification

\### Version 1.0



---



\# 1. Purpose



This document defines the detailed screen specification for the \*\*Team\*\* screen in \*\*The M\&A Rainmaker\*\*.



The Team screen is the main control surface for internal advisory resource management, capacity planning, execution quality and team strain.



It should function as:



\- the central screen for managing the internal M\&A team,

\- the place where allocation, utilisation and overload become visible,

\- the interface through which the player understands who is doing what,

\- the system for balancing execution quality, speed and capacity,

\- and the layer that turns internal team management into a core gameplay discipline.



This is not a staff directory.

This is a live execution-capacity management system.



The screen must help the player understand:



\- who is on the team,

\- how much capacity each person has,

\- how reliable each person is,

\- where overload is building,

\- which workstreams are under-supported,

\- and how team structure is affecting the process.



---



\# 2. Screen Design Intent



The Team screen should feel like:



\- a premium advisory staffing console,

\- a calm but high-pressure people-and-capacity interface,

\- a structured view of execution strength and fragility,

\- and a place where internal performance risk becomes legible without turning into HR cosplay.



Visually, it should sit primarily between:



\- \*\*Outlook Noir\*\*, for clean usability, roster structure and readable allocation views,

\- and \*\*Terminal Prestige\*\*, for capacity indicators, utilisation logic and analytical summaries.



A lighter \*\*Cinematic Dealroom\*\* influence may appear in:

\- high-pressure team states,

\- critical staffing decisions,

\- and major overload or recovery moments.



The mood should be:



\- operational,

\- human,

\- disciplined,

\- slightly tense,

\- and quietly revealing.



This screen should feel less cold than Tasks, but more structured than Client.



---



\# 3. Gameplay Role



\# 3.1 Core Role

The Team screen is one of the central execution systems of the game.



It performs eight major functions:



1\. tracks team composition,

2\. tracks utilisation and capacity,

3\. tracks assignment by task and workstream,

4\. surfaces overload and fatigue,

5\. shows quality and reliability differences across team members,

6\. reveals bottlenecks and under-resourced areas,

7\. supports reassignment and staffing decisions,

8\. and translates internal team management into execution quality and process resilience.



\# 3.2 Why It Matters

Deals are not executed by:

\- dashboards,

\- polished phrases,

\- or heroic abstractions.



They are executed by:

\- analysts,

\- associates,

\- VPs,

\- partners,

\- specialists,

\- and overstretched humans trying to maintain quality under compression.



Without a real team system, the game risks becoming a fantasy in which process capacity appears from the wallpaper.



\# 3.3 What the Player Should Feel

The player should feel:



\- that people are finite,

\- that utilisation matters,

\- that strong allocation improves process quality,

\- that overload creates fragility,

\- and that choosing who does what is a meaningful strategic act.



---



\# 4. Primary Player Questions



The Team screen must answer these questions quickly:



\- Who is available?

\- Who is overloaded?

\- Which workstreams are under-supported?

\- Who is best suited for a critical task?

\- Where is execution quality at risk because of staffing?

\- Which team members are becoming bottlenecks?

\- What can I rebalance before the process suffers?



If the player cannot identify internal strain before it becomes visible elsewhere, the screen has failed.



---



\# 5. Functional Objectives



The Team screen must support all of the following:



\- visibility of full team roster,

\- visibility of current allocations,

\- visibility of utilisation and remaining capacity,

\- visibility of fatigue / overload,

\- visibility of skill and reliability differences,

\- visibility of ownership by workstream,

\- support for reassignment,

\- support for staffing trade-offs,

\- and linkage to tasks, deliverables, risks and overall deal health.



---



\# 6. Screen Architecture



\# 6.1 Canonical Layout



The Team screen should sit inside the standard application shell:



\- Topbar

\- Sidebar

\- Team Workspace



Inside the Team Workspace:



\- Workspace Header

\- Team Summary Row

\- Main Team Area

\- Allocation / Workstream Area

\- Optional Bottom Warning Strip



\# 6.2 Main Structural Logic



The screen should support a \*\*2-column primary layout\*\*:



\- Left Column: team roster and capacity overview

\- Right Column: allocation detail, workload and workstream support



Optional lower layer:

\- bottlenecks, warnings and staffing imbalances



\# 6.3 Default Desktop Layout



Recommended width distribution:



\- Left Column: 44%

\- Right Column: 56%



The roster needs enough room for comparison.

The allocation side needs enough room for density and consequence.



---



\# 7. Workspace Header



\# 7.1 Purpose

Establish overall team state and current resource pressure.



\# 7.2 Content

Left side:

\- Screen title: `Team`

\- Secondary line: current execution-capacity summary



Right side:

\- quick actions

\- high-level counters



\# 7.3 Header Summary Examples

Examples:

\- `8 team members · 2 overloaded · DD and review queues under pressure`

\- `Execution capacity stable · buyer outreach covered · legal support thin`



\# 7.4 Header Actions

Recommended:

\- Open Overloaded

\- Review Allocations

\- View Workstream Coverage

\- Open Critical Tasks

\- Reassign Tasks



Optional:

\- Add Support Resource

\- View Reliability Risks



\# 7.5 Behaviour

\- sticky inside workspace

\- concise

\- strongly operational



---



\# 8. Team Summary Row



\# 8.1 Purpose

Provide an at-a-glance snapshot of internal execution capacity.



\# 8.2 Recommended Summary Tiles

Core tiles:

\- Team Capacity

\- Utilisation

\- Overload Risk

\- Quality Stability

\- Workstream Coverage

\- Bottleneck Count



Optional later:

\- Morale

\- Review Backlog

\- Error Risk



\# 8.3 Tile Structure

Each tile may contain:

\- label

\- current state or score

\- trend

\- short interpretation hint



Example:

\- `Utilisation`

\- `82%`

\- `↑`

\- `Review-heavy work creating concentration risk`



\# 8.4 Behaviour

\- clickable

\- opens filtered roster or allocation view

\- should help triage internal strain quickly



\# 8.5 Design Rule

These tiles should feel like staffing and execution vitals, not employee wellness posters in disguise.



---



\# 9. Left Column, Team Core



\# 9.1 Purpose

Represent who is on the team, what they are like, and how stretched they currently are.



\# 9.2 Recommended Modules



\## Module A. Team Roster Table / List

\### Content

Each team member entry should include:

\- name

\- role / seniority

\- current utilisation

\- current load state

\- reliability

\- quality strength

\- main workstream focus

\- current critical assignment marker



\### Behaviour

\- selectable

\- sortable

\- filterable

\- clicking opens member detail panel or area



\### Design Rule

This is the operational roster, not a decorative cast list.



\## Module B. Team Member Detail Panel

When a team member is selected, show:



\- role and seniority

\- workload summary

\- current assignments

\- key strengths

\- reliability profile

\- fatigue / overload state

\- recent performance signals

\- reassignment suitability



This can live either inline below the roster or as part of the right-side area.



\## Module C. Capacity State Panel

\### Content

A concise overview of internal capacity balance.



Example:

\- `Execution remains viable, but review and diligence effort are over-concentrated in two team members, increasing timing and quality fragility.`



This summary is very useful.

Raw percentages alone do not explain operational truth.



---



\# 10. Right Column, Allocation and Workload



\# 10.1 Purpose

Show how the team is currently being used and where the pressure sits.



\# 10.2 Recommended Modules



\## Module A. Allocation by Workstream

\### Content

Show team distribution across workstreams, such as:

\- Preparation

\- Buyer Outreach

\- Deliverables

\- Management Interaction

\- DD

\- Negotiation

\- Legal / Closing Support



Each workstream may show:

\- number of assigned people

\- current load

\- under-support risk

\- top owner

\- dependency pressure



\### Behaviour

\- clickable

\- can open filtered tasks or member list



\## Module B. Current Assignments Panel

\### Content

For selected team member or globally, show:

\- major active tasks

\- critical deliverables

\- review responsibilities

\- linked buyers or client duties



\### Design Rule

The player should be able to see not just that someone is busy, but what they are busy with.



\## Module C. Workload Distribution View

\### Content

A comparative view of team load, such as:

\- utilisation bars

\- capacity bands

\- overload markers

\- concentration warnings



This may be shown as:

\- ranked list

\- compact staffing bars

\- utilisation heatmap, later if needed



\## Module D. Bottlenecks and Concentration Risks

\### Content

Examples:

\- one associate owns too many review tasks

\- senior reviewer blocking multiple deliverables

\- DD concentrated in one person

\- partner attention split across client and buyer pressure



This module should make structural weakness visible.



---



\# 11. Team Member Information Model



\# 11.1 Purpose

Each team member should feel like a meaningful execution asset with distinct strengths and limits.



\# 11.2 Core Team Member Fields

Each team member should have at least:



\- Name

\- Role

\- Seniority

\- Functional Strengths

\- Current Utilisation

\- Capacity State

\- Reliability

\- Quality Level

\- Speed

\- Review Skill

\- Communication Skill

\- Stress Tolerance

\- Current Assignments

\- Workstream Focus

\- Fatigue State

\- Error Risk

\- Availability

\- Notes



\# 11.3 Team Member Roles

Examples:

\- Analyst

\- Associate

\- Vice President

\- Director

\- Partner

\- Specialist / Legal Liaison / Financial Modelling Support



These roles may differ in:

\- capacity,

\- review capability,

\- client handling strength,

\- buyer management suitability,

\- and escalation effectiveness.



---



\# 12. Utilisation and Capacity Logic



\# 12.1 Purpose

Capacity must be visible and consequential.



\# 12.2 Core Dimensions



\## Utilisation

How much of a team member’s available bandwidth is currently committed.



\## Capacity State

How sustainably that utilisation can be maintained.



\## Availability

How much room remains for additional work.



\## Load Concentration

How much critical work is concentrated in a small number of people.



\# 12.3 Suggested Capacity States

Possible states:

\- Available

\- Engaged

\- Busy

\- Stretched

\- Overloaded

\- Critical



\# 12.4 Design Rule

A person at 90% on routine low-stakes work is not the same as a person at 90% holding every critical review and buyer-sensitive item.

The game should respect this distinction.



---



\# 13. Reliability, Quality and Speed



\# 13.1 Purpose

Not all team members are equal in output profile.



\# 13.2 Core Performance Dimensions

Possible dimensions:

\- Reliability

\- Quality

\- Speed

\- Review Accuracy

\- Communication Strength

\- Pressure Handling

\- Buyer-Facing Confidence

\- Client-Facing Confidence



\# 13.3 Gameplay Relevance

These dimensions should influence:

\- task completion quality,

\- likelihood of delay,

\- probability of rework,

\- effect on client confidence,

\- effect on buyer communications,

\- and resilience under overload.



\# 13.4 Design Rule

Team differences should produce real trade-offs.



Fast but sloppy.

Reliable but slow.

Excellent with clients but poor under document pressure.

These distinctions make staffing choices interesting.



---



\# 14. Fatigue and Overload System



\# 14.1 Purpose

Team strain should accumulate visibly and matter operationally.



\# 14.2 Fatigue Inputs

Fatigue / overload may rise due to:

\- sustained high utilisation

\- concentration of urgent work

\- repeated review cycles

\- DD bursts

\- timeline compression

\- crisis weeks

\- unresolved blockers forcing rework



\# 14.3 Consequences

Fatigue may influence:

\- quality drops

\- slower turnaround

\- error risk

\- more blocked reviews

\- reduced reliability

\- increased task spillover into later weeks



\# 14.4 Presentation

Fatigue can be shown through:

\- load states

\- warning chips

\- trend indicators

\- narrative summaries



\# 14.5 Design Rule

This should feel like execution strain, not melodramatic burnout theatre.



---



\# 15. Assignment and Reassignment System



\# 15.1 Purpose

The player must be able to shape internal execution.



\# 15.2 Assignment Attributes

Tasks and deliverables should be assignable based on:

\- capacity

\- role suitability

\- reliability

\- workstream familiarity

\- stakeholder-facing requirements



\# 15.3 Reassignment Actions

Core reassignment actions may include:

\- move task to another owner

\- add reviewer support

\- rebalance workstream support

\- escalate to senior support

\- shift low-value work away from bottlenecks



\# 15.4 Trade-off Logic

Reassignment should not be frictionless.

It may:

\- reduce overload,

\- but reduce continuity,

\- create learning delay,

\- or move risk to another workstream.



That is good. Smooth perfection would be nonsense.



---



\# 16. Workstream Coverage System



\# 16.1 Purpose

The player must understand whether the team is structurally aligned with process needs.



\# 16.2 Coverage Dimensions

Each workstream may be:

\- Under-covered

\- Adequately Covered

\- Strongly Covered

\- Over-concentrated

\- Fragile



\# 16.3 Coverage Inputs

Coverage may depend on:

\- number of assigned people

\- role mix

\- seniority mix

\- current utilisation

\- task complexity

\- milestone proximity



\# 16.4 Gameplay Relevance

Poor coverage should affect:

\- task velocity

\- deliverable quality

\- response times

\- risk creation

\- process confidence



---



\# 17. Bottleneck and Concentration Logic



\# 17.1 Purpose

Some team problems are not about total capacity, but concentration of critical work.



\# 17.2 Typical Bottlenecks

Examples:

\- one person reviewing all key deliverables

\- one VP handling all buyer-sensitive interactions

\- one analyst carrying the DD pack

\- partner time fragmented across client and shortlist decisions



\# 17.3 Presentation

Bottlenecks may be shown through:

\- warning cards

\- concentration markers

\- workstream strain summaries

\- critical-owner tags



\# 17.4 Design Rule

The Team screen should reveal where the process depends too heavily on a few people.

That is one of the oldest and most expensive mistakes in advisory work.



---



\# 18. Linked Systems Integration



\# 18.1 Team Screen as Internal Execution Hub

The Team screen must connect directly to:



\- Tasks \& Workstreams

\- Deliverables

\- Inbox

\- Buyers

\- Client

\- Risks \& Issues

\- Timeline / Phase Map



\# 18.2 Typical Cross-System Flows

Examples:

\- overloaded reviewer delays deliverables

\- weak staffing creates timing risk

\- strong reallocation improves workstream health

\- client-facing work assigned poorly reduces trust

\- buyer follow-up concentrated in one person lowers responsiveness

\- DD pressure creates review bottlenecks



\# 18.3 Design Rule

The team must feel like a live operating force inside the process, not a passive reference table.



---



\# 19. Dynamic Behaviour



\# 19.1 Team Evolution Over Time

The team state must evolve visibly.



Possible changes:

\- utilisation rises

\- fatigue accumulates

\- assignments shift

\- reliability pressure increases

\- some workstreams become under-supported

\- bottlenecks emerge

\- recovery happens after rebalancing



\# 19.2 Phase Sensitivity

Different phases should emphasise different team pressures.



\## Early Phase

More emphasis on:

\- materials prep

\- buyer list building

\- internal review discipline



\## Mid Phase

More emphasis on:

\- outreach handling

\- buyer follow-ups

\- management prep

\- DD readiness



\## Late Phase

More emphasis on:

\- legal coordination

\- issue response

\- timetable compression

\- negotiation support

\- closing readiness



\# 19.3 Event Sensitivity

Major events should affect the team:

\- client escalation

\- buyer surge

\- DD shock

\- deliverable revision loop

\- legal bottleneck

\- weak capacity planning

\- phase acceleration



The screen must visibly reflect those consequences.



---



\# 20. Warning and Staffing Pressure Layer



\# 20.1 Purpose

Provide compressed visibility of internal execution strain.



\# 20.2 Optional Bottom Warning Strip

May show:

\- overloaded team members

\- critical review bottlenecks

\- under-supported workstreams

\- rising fatigue risk

\- capacity mismatch against next milestone



\# 20.3 Alert Examples

\- `Associate review queue now delaying two launch-critical deliverables`

\- `DD workstream under-covered ahead of gate`

\- `Buyer follow-up concentrated in one team member`

\- `Team utilisation high enough to create quality fragility next week`



\# 20.4 Behaviour Rule

Warnings must direct the player toward meaningful staffing choices.



---



\# 21. UX States



\# 21.1 Standard States

The Team screen must support:

\- full loaded state

\- stable-capacity state

\- overload-heavy state

\- bottleneck-heavy state

\- no roster filter results

\- loading state



\# 21.2 Stable State

When team health is good:

\- fewer warnings

\- stronger workstream balance

\- cleaner utilisation picture

\- more confident execution summaries



\# 21.3 Overload-Heavy State

When internal strain is high:

\- bottlenecks become more visible

\- utilisation and fatigue warnings sharpen

\- reassignment actions become more prominent



\# 21.4 Loading State

Use:

\- skeleton roster rows

\- muted allocation blocks

\- restrained shimmer if needed



No productivity-software melodrama.



---



\# 22. Accessibility and Readability



\# 22.1 Contrast

\- utilisation and load states must be readable

\- overload and bottleneck states must not rely only on colour

\- roster text and assignment summaries must remain crisp



\# 22.2 Click Targets

Roster rows, member cards, workstream blocks and reassignment controls must be easily usable.



\# 22.3 Hierarchy

The player should quickly find:

\- overloaded people

\- under-supported workstreams

\- reliability-sensitive assignments

\- top bottlenecks

\- nearest staffing intervention point



\# 22.4 Information Overload Rule

This screen should clarify internal execution structure, not drown the player in pseudo-resource-management ceremony.



---



\# 23. Visual Style Guidance for This Screen



\# 23.1 Dominant Variant

The Team screen should primarily use \*\*Outlook Noir\*\*.



\# 23.2 Supporting Variant

Use \*\*Terminal Prestige\*\* for:

\- utilisation bars

\- load indicators

\- allocation summaries

\- bottleneck and concentration views



\# 23.3 Limited Cinematic Accent

A small amount of \*\*Cinematic Dealroom\*\* may be used in:

\- critical overload states

\- major recovery moments

\- severe staffing imbalance warnings



\# 23.4 Visual Rules

\- calm structured layout

\- readable roster and assignment logic

\- restrained accent usage

\- clear differentiation between capacity, fatigue and quality risk

\- allocation views easy to scan

\- member detail panel informative but not cluttered



This screen should feel like a premium staffing console for people whose bad resourcing decisions acquire legal and financial consequences.



---



\# 24. Example Team Scenarios



\# 24.1 Analyst Overloaded During Materials Phase

State:

\- strong effort

\- low remaining capacity

\- multiple reviews pending



Player tension:

\- good short-term output, rising quality risk



\# 24.2 VP as Buyer Bottleneck

State:

\- all important buyer communication routed through one person

\- responsiveness slowing



Player tension:

\- process still looks active, but internal concentration risk rising



\# 24.3 DD Workstream Under-Covered

State:

\- enough total staff

\- wrong staffing distribution

\- diligence tasks accumulating



Player tension:

\- not a headcount problem, a deployment problem



\# 24.4 Rebalancing Improves Stability but Weakens Continuity

State:

\- tasks reassigned from overloaded associate

\- capacity improves

\- handover friction rises



Player tension:

\- relief purchased with some execution drag



---



\# 25. Initial Build Scope



For first playable implementation, include:



\- workspace header

\- team summary row

\- roster table or list

\- member detail panel

\- allocation by workstream view

\- workload distribution view

\- capacity / utilisation states

\- fatigue / overload indicators

\- bottleneck warning module

\- core reassignment actions

\- linked navigation to tasks, deliverables, risks and timeline



This is enough to make internal staffing a real gameplay system.



---



\# 26. Future Enhancements



Possible later additions:

\- richer skill matrix

\- interpersonal chemistry modifiers

\- morale layer

\- temporary external support

\- training / development effects

\- review accuracy submodel

\- staffing forecast for future milestones

\- succession / backup planning

\- personality-driven execution style



Useful, yes.

Necessary now, no.



---



\# 27. Final Screen Statement



The Team screen of \*\*The M\&A Rainmaker\*\* must function as a premium internal execution-capacity management system, making staffing, utilisation, overload, reliability and workstream coverage legible and consequential. It should give the player a disciplined way to manage the human engine of the deal, ensuring that internal team structure and resourcing are central forces shaping execution quality, timing and overall transaction resilience.

