\# The M\&A Rainmaker

\## Dashboard Screen Specification

\### Version 1.0



---



\# 1. Purpose



This document defines the detailed screen specification for the \*\*Dashboard\*\* in \*\*The M\&A Rainmaker\*\*.



The Dashboard is the player’s primary control room and situational awareness screen.



It should function as:



\- a live overview of the transaction,

\- a weekly prioritisation surface,

\- a process health monitor,

\- a navigation hub,

\- and a decision-orientation layer before the player dives into detailed screens.



This is not a decorative home screen.

This is the operational cockpit of the game.



It must help the player understand, within seconds:



\- how the deal is progressing,

\- where pressure is building,

\- what needs attention now,

\- and where to go next.



---



\# 2. Screen Design Intent



The Dashboard should feel like:



\- the command centre of a live sell-side process,

\- a premium professional workflow cockpit,

\- a disciplined executive interface with real signal density,

\- and a quiet room full of illuminated trouble.



Visually, it should sit between:



\- \*\*Outlook Noir\*\*, for readability, composure and workflow structure,

\- \*\*Terminal Prestige\*\*, for metrics, system logic and signal clarity,

\- with very light \*\*Cinematic Dealroom\*\* influence in high-importance summary blocks.



The mood should be:



\- sober,

\- tense,

\- legible,

\- intelligent,

\- and immediately useful.



This screen should not feel noisy, playful or ornamental.

It should feel like competence under fluorescent existential pressure.



---



\# 3. Gameplay Role



\# 3.1 Core Role

The Dashboard is the default strategic overview screen of the game.



It performs six major functions:



1\. summarises current process condition,

2\. surfaces priorities,

3\. flags pressure points,

4\. links to detailed operational screens,

5\. frames the weekly agenda,

6\. and reinforces the sense that the process is alive.



\# 3.2 When the Player Uses It

The player should naturally land here:



\- at the start of a week,

\- after advancing time,

\- after a milestone result,

\- after major message clusters,

\- and when needing to re-centre on the overall process.



\# 3.3 Why It Matters

Without a strong Dashboard, the game risks becoming a pile of good screens with no governing intelligence.



The Dashboard is the place where the player feels:

\- “I understand the shape of the battle.”

Not every trench, not every memo, but the shape.



---



\# 4. Primary Player Questions



The Dashboard must answer these questions immediately:



\- How is the deal going overall?

\- What matters most this week?

\- Where is the pressure?

\- Which systems are improving or deteriorating?

\- What should I open next?

\- Am I in control, or merely performing a tasteful collapse?



If the player cannot answer these within a few seconds, the screen is too vague or too crowded.



---



\# 5. Functional Objectives



The Dashboard must support all of the following:



\- at-a-glance deal overview,

\- weekly prioritisation,

\- surfacing urgent issues,

\- KPI monitoring,

\- linking to inbox, buyers, tasks, risks and timeline,

\- summarising core active workstreams,

\- showing process momentum,

\- showing process fragility,

\- and presenting the deal as a system, not as isolated modules.



---



\# 6. Screen Architecture



\# 6.1 Canonical Layout



The Dashboard should sit inside the standard application shell:



\- Topbar

\- Sidebar

\- Dashboard Workspace



Inside the Dashboard Workspace:



\- Workspace Header

\- KPI Strip

\- Main Overview Grid

\- Optional Bottom Summary Band

\- Optional Right Context Panel, if interactive detail mode is used



\# 6.2 Main Structural Logic



The Dashboard should use a \*\*3-column main grid\*\* after the KPI strip.



Recommended structure:



\- Left Column: priorities and incoming pressure

\- Centre Column: deal core and process summary

\- Right Column: alerts, timing, risk and control signals



This layout supports a strong hierarchy:

\- centre for core process health,

\- left for action intake,

\- right for control and danger.



That is the correct geometry for this kind of screen. Elegant, practical, mildly ominous.



---



\# 7. Spatial Layout Specification



\# 7.1 Desktop Vertical Stack



From top to bottom:



1\. Workspace Header

2\. KPI Strip

3\. Main 3-column body

4\. Optional bottom support band



\# 7.2 Recommended Column Width Ratios



Main body:



\- Left Column: 30%

\- Centre Column: 42%

\- Right Column: 28%



This gives the centre enough authority without starving the action and risk zones.



\# 7.3 Height Logic



The screen should avoid full-page scrolling where possible on standard desktop.

The main body should fit within the viewport with independent internal scroll only where needed.



Priority:

\- dashboard must feel like a control surface,

\- not like a long report pretending to be interactive.



---



\# 8. Workspace Header



\# 8.1 Purpose

Establish the current snapshot of the game’s state.



\# 8.2 Content

Left side:

\- Screen title: `Dashboard`

\- Secondary line: current week, current phase, and short summary



Right side:

\- high-priority quick actions

\- optional mini status summary



\# 8.3 Header Summary Examples

Examples:

\- `Week 8 · Phase 2 · Buyer outreach underway · 3 critical actions pending`

\- `Week 14 · Phase 5 · DD pressure rising · Client confidence stable`



\# 8.4 Header Actions

Recommended:

\- Open Inbox

\- Review Priorities

\- Open Timeline

\- Advance Week



Optional:

\- Open Risks

\- Open Buyers



\# 8.5 Behaviour

\- sticky within workspace

\- concise

\- high signal, low clutter



---



\# 9. KPI Strip



\# 9.1 Purpose

Provide immediate summary metrics across the most important dimensions of the process.



\# 9.2 KPI Strip Structure

A full-width horizontal row of compact KPI tiles directly below the header.



Recommended number of tiles:

\- 5 to 7



\# 9.3 Recommended KPI Set

Core KPIs:

\- Deal Health

\- Client Confidence

\- Buyer Heat

\- Team Capacity

\- Timeline Pressure

\- Budget Burn

\- Risk Load



Optional later:

\- Reputation

\- Deliverable Readiness

\- Closing Probability



\# 9.4 KPI Tile Structure

Each tile should contain:



\- label

\- current value or state

\- direction / trend indicator

\- optional short supporting hint



Example:

\- `Deal Health`

\- `72`

\- `↑ 4`

\- `Strong buyer tension building`



\# 9.5 KPI Behaviour

\- each tile clickable

\- click opens related screen or filtered detailed view

\- hover may reveal short explanation

\- trends should be visible but not theatrical



\# 9.6 KPI Design Rule

The KPI strip should not look like a consumer app dashboard.

It should feel analytical and professional.



These are not fitness stats for a cheerful smartwatch.

They are transaction vitals.



---



\# 10. Main Body Structure



\# 10.1 Overview

The main body should be divided into:



\- Left Action Column

\- Centre Process Column

\- Right Control Column



Each column should contain stacked modules with clear hierarchy.



---



\# 11. Left Column, Action and Intake



\# 11.1 Purpose

Surface immediate priorities, recent pressure, and action intake.



This column answers:

\- what needs attention now?

\- what is arriving?

\- what is unresolved?



\# 11.2 Recommended Modules



\## Module A. Priority Actions Panel

This is one of the most important modules on the screen.



\### Content

Show 3 to 5 top priority actions based on current game state.



Each item should include:

\- action title

\- linked entity

\- urgency level

\- due timing

\- quick-open action



Examples:

\- `Reply to buyer clarification request`

\- `Review teaser delays with analyst`

\- `Call founder after weak feedback from Buyer 3`



\### Behaviour

\- clicking opens linked screen or object

\- items reorder dynamically

\- should feel curated, not dumped from a task table



This panel is the Dashboard’s “what matters now” brain.



\## Module B. Inbox Snapshot

Compact preview of most relevant recent messages.



\### Content

Show 4 to 6 message rows with:

\- sender

\- subject

\- category

\- urgency marker

\- unread marker



\### Behaviour

\- click opens Inbox with selected message

\- messages should not display full conversation clutter

\- focus on relevance and triage



\## Module C. Pending Decisions, optional

Can be a separate small panel or integrated into Priority Actions.



\### Content

Highlight decisions that require player input:

\- shortlist choice

\- client response choice

\- sequencing decision

\- escalation response



This is particularly useful once the game deepens.



---



\# 12. Centre Column, Core Process State



\# 12.1 Purpose

Represent the heart of the transaction at a systemic level.



This column answers:

\- is the process healthy?

\- what is moving?

\- what is stuck?

\- how is the transaction breathing?



\# 12.2 Recommended Modules



\## Module A. Deal Health Panel

Primary centrepiece module.



\### Content

A composite overview of the current process condition.



Include:

\- deal health score / state

\- short executive summary text

\- top positive drivers

\- top negative drivers

\- optional mini visual trend



Example summary:

\- `Momentum is positive, but execution strain is increasing and one strategic buyer is becoming less predictable.`



\### Behaviour

\- should update meaningfully with game state

\- click opens deeper process or timeline view

\- summary text should feel interpretive, not generic



This module should feel like the dashboard’s central pulse.



\## Module B. Active Workstreams Summary

Compact but meaningful workstream view.



\### Content

Display major workstreams with:

\- current status

\- progress indicator

\- blocked marker if relevant

\- pressure marker



Example workstreams:

\- Preparation

\- Buyer Outreach

\- Materials

\- DD Readiness

\- Negotiation



\### Behaviour

\- each row clickable

\- blocked items visually obvious

\- should not try to replace the Tasks screen, only summarise it



\## Module C. Buyer Momentum Summary

Show the current state of the buyer universe.



\### Content

Can include:

\- top active buyers

\- shortlist pressure

\- buyer engagement temperature

\- buyer drop-off risk

\- current competitive tension state



Possible formats:

\- compact buyer cards

\- ranked list

\- mini heat summary



\### Behaviour

\- clicking opens Buyers screen

\- must quickly communicate whether tension is building or evaporating



\## Module D. Deliverable Readiness, optional

Later addition if needed.



\### Content

Show readiness of critical deliverables:

\- teaser

\- IM

\- management presentation

\- DD pack



Useful once execution depth increases.



---



\# 13. Right Column, Alerts, Control and Risk



\# 13.1 Purpose

Surface danger, timing and systemic fragility.



This column answers:

\- where is the risk?

\- what could slip?

\- what is the next gate?

\- where am I exposed?



\# 13.2 Recommended Modules



\## Module A. Alerts and Escalations Stack

High-importance stacked alert list.



\### Content

Examples:

\- client impatience rising

\- legal review delayed

\- buyer request unresolved

\- analyst overloaded

\- diligence red flag detected



Each alert should include:

\- short label

\- severity

\- linked entity

\- open action



\### Behaviour

\- alerts should be actionable

\- do not flood the stack with low-value noise

\- must feel curated and important



\## Module B. Timeline Snapshot

Compact process timing panel.



\### Content

Show:

\- current phase

\- current week

\- next major milestone

\- slippage indicator

\- days/weeks to next gate



Optional:

\- mini horizontal milestone strip



\### Behaviour

\- clicking opens Timeline / Phase Map

\- should help the player understand pacing pressure quickly



\## Module C. Risk Summary

A compact view of overall risk exposure.



\### Content

Possible contents:

\- current risk load

\- top 3 live risks

\- mitigation progress

\- rising / stable / falling risk trend



\### Behaviour

\- click opens Risk Register

\- risks should be visible in business language, not just colour blocks



\## Module D. Team Stress Snapshot, optional

If not surfaced strongly enough elsewhere, this can appear here.



\### Content

\- overloaded staff

\- critical under-capacity warning

\- execution fragility markers



---



\# 14. Optional Bottom Support Band



\# 14.1 Purpose

Provide secondary strategic or narrative support without crowding the main columns.



\# 14.2 Possible Uses

\- market signal strip

\- recent milestone log

\- weekly advisory note

\- comparative trend panel

\- board/client expectation note



\# 14.3 Rule

This band is optional.

Do not add it unless it genuinely adds value.



The dashboard should not become a luxury department store of interesting rectangles.



---



\# 15. Module Behaviour Rules



\# 15.1 Actionability Rule

Every major module must allow the player to act or drill down.



The Dashboard is not a museum of indicators.



\# 15.2 Priority Rule

There must be a clear answer to:

\- what deserves attention first,

\- what can wait,

\- what is background condition.



\# 15.3 Compression Rule

Summary modules must compress complexity without becoming vague.



\# 15.4 Signal Discipline Rule

Accent colour should highlight:

\- critical modules,

\- important changes,

\- current focus,

\- or severe pressure.



Do not spend the accent budget on decorative excitement.



---



\# 16. Dynamic Behaviour



\# 16.1 Week-to-Week Evolution

The Dashboard must visibly evolve as the process evolves.



Changes may include:

\- different priorities,

\- new alerts,

\- rising or falling buyer heat,

\- worsening or improving timeline pressure,

\- different module emphasis by phase.



\# 16.2 Phase Sensitivity

The relative importance of modules may shift by phase.



Examples:



\## Early Phase

\- outreach,

\- materials readiness,

\- buyer coverage,

\- client alignment.



\## Mid Phase

\- buyer seriousness,

\- process tension,

\- DD readiness,

\- shortlisting decisions.



\## Late Phase

\- exclusivity pressure,

\- legal issues,

\- timetable compression,

\- closing readiness.



\# 16.3 Event Sensitivity

After major events:

\- milestone completion

\- buyer drop-out

\- diligence issue

\- client escalation

\- major inbound offer



the Dashboard should feel updated, not static.



The player should sense that the room has changed temperature.



---



\# 17. Data Model Implications



\# 17.1 Dashboard as Aggregation Layer

The Dashboard should aggregate data from multiple systems:



\- Inbox

\- Buyers

\- Client

\- Team

\- Tasks

\- Deliverables

\- Risks

\- Timeline

\- Market



\# 17.2 Derived Information

Many Dashboard elements should be derived, not manually authored.



Examples:

\- priority list generated from weighted urgency

\- deal health summary generated from system state

\- risk load calculated from active risks

\- timeline pressure derived from slippage and upcoming gates



\# 17.3 Interpretation Layer

The Dashboard benefits from a light interpretation layer.



It should not only show raw data.

It should explain, briefly, what the data means.



That distinction matters enormously.

A cockpit with no interpretation is just a tasteful panic engine.



---



\# 18. UX States



\# 18.1 Standard States

The Dashboard must support:

\- normal loaded state

\- early game low-density state

\- high-pressure dense state

\- loading state

\- no-alerts state

\- critical instability state



\# 18.2 Early Game State

In early weeks, the Dashboard may be lighter.



This is acceptable, provided it still feels alive.



Possible treatment:

\- more guidance

\- fewer alerts

\- slightly more explanatory copy



\# 18.3 High-Pressure State

Later weeks may increase density modestly.



Key rule:

\- density rises,

\- clarity must not fall.



\# 18.4 No-Alerts State

If there are no major alerts:

\- show calm informative replacement

\- such as:

&nbsp; `No major escalations at present. Execution risk remains moderate.`



This should feel reassuring, not empty.



\# 18.5 Loading State

Use:

\- skeleton KPI tiles

\- panel placeholders

\- restrained shimmer if needed



No frantic loading theatre.



---



\# 19. Cross-Screen Navigation



\# 19.1 Navigation Role

The Dashboard must serve as a navigation intelligence layer.



Key links should open:

\- Inbox

\- Buyers

\- Tasks

\- Risks

\- Timeline

\- Client

\- Deliverables



\# 19.2 Navigation Behaviour

Clicking a module should open:

\- the related screen,

\- optionally already filtered to the relevant context.



Examples:

\- click buyer momentum → Buyers screen with active buyers highlighted

\- click timeline snapshot → Timeline screen at current milestone

\- click priority task → Tasks screen with selected task open



This greatly improves flow and makes the system feel properly integrated.



---



\# 20. Accessibility and Readability



\# 20.1 Contrast

\- KPI values must be highly legible

\- alerts must not rely only on colour

\- blocked / delayed / critical states must be clearly distinguishable

\- small meta text must remain readable on dark surfaces



\# 20.2 Hierarchy

The eye should naturally move:

\- first to KPIs and deal core,

\- then to priorities,

\- then to alerts and timing.



\# 20.3 Click Zones

Dashboard modules and items must have generous click zones.

This is a screen the player may visit constantly.



\# 20.4 Overload Prevention

Do not present ten equal emergencies at once.

The Dashboard should reduce overload, not perform it.



---



\# 21. Visual Style Guidance for This Screen



\# 21.1 Dominant Variant

The Dashboard should primarily use \*\*Outlook Noir\*\*.



\# 21.2 Supporting Variant

Use \*\*Terminal Prestige\*\* for:

\- KPI logic,

\- status indicators,

\- timeline signals,

\- structured summaries,

\- and analytical sub-elements.



\# 21.3 Light Cinematic Accent

A small amount of \*\*Cinematic Dealroom\*\* can be used in:

\- the central deal health module,

\- milestone-sensitive summary text,

\- and major weekly-state framing.



\# 21.4 Visual Rules

\- strong structural clarity

\- consistent panel rhythm

\- clean spacing

\- compact KPI strip

\- restrained accent colour

\- slight glow only where meaningful

\- no overcrowded dashboard fetishism



This screen should look expensive, serious and useful.

That rare and mythical trinity.



---



\# 22. Example Weekly Dashboard Scenarios



\# 22.1 Early Outreach Week

Main priorities:

\- finalise buyer list

\- approve teaser edits

\- respond to initial buyer questions



Dashboard tone:

\- moderate pressure

\- increasing momentum

\- manageable risk



\# 22.2 Shortlisting Week

Main priorities:

\- assess buyer credibility

\- compare IOIs

\- manage founder expectations

\- prepare DD access



Dashboard tone:

\- higher buyer heat

\- more decisions

\- more visible client pressure



\# 22.3 DD Stress Week

Main priorities:

\- resolve diligence issues

\- control team load

\- maintain bidder confidence

\- prevent timetable slip



Dashboard tone:

\- high alert density

\- heavier risk stack

\- timeline pressure prominent



\# 22.4 Late Negotiation Week

Main priorities:

\- resolve SPA issues

\- manage exclusivity tension

\- align client

\- monitor closing readiness



Dashboard tone:

\- fewer but more consequential priorities

\- high pressure, lower noise

\- legal and timing modules more prominent



---



\# 23. Initial Build Scope



For first playable implementation, include:



\- workspace header

\- KPI strip with 6 core KPIs

\- priority actions panel

\- inbox snapshot

\- deal health panel

\- active workstreams summary

\- buyer momentum summary

\- alerts stack

\- timeline snapshot

\- risk summary

\- click-through navigation to related screens



This is enough to create a genuinely useful strategic overview.



---



\# 24. Future Enhancements



Possible later additions:

\- configurable KPI strip

\- pinned module preferences

\- compact weekly advisory summary

\- trend sparklines

\- personalised player-style recommendations

\- scenario forecasts

\- phase-sensitive layout shifts

\- comparative week-over-week deltas

\- board reporting mode



Interesting, yes.

Necessary now, no.



---



\# 25. Final Screen Statement



The Dashboard of \*\*The M\&A Rainmaker\*\* must function as a premium strategic control room for a live sell-side transaction, compressing complexity into a clear, high-signal executive overview. It should help the player understand the shape of the process, the location of pressure, and the next priorities with elegance, discipline and real operational value.

