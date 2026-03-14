\# The M\&A Rainmaker

\## Screen Wireframes Specification

\### Version 1.0



---



\# 1. Purpose



This document defines the functional wireframes for the main playable screens of \*\*The M\&A Rainmaker\*\*.



Its purpose is to translate:

\- the visual art direction,

\- the UI component system,

\- and the main screen architecture



into concrete screen compositions that can be implemented in:

\- HTML

\- CSS

\- vanilla JavaScript



This is not a visual mockup document.

This is a structural and UX wireframe document.



It defines:

\- what appears on each screen,

\- where it appears,

\- what it does,

\- what the player should understand at a glance,

\- and how each screen supports the core gameplay loop.



---



\# 2. Global Wireframe Rules



\## 2.1 Persistent Shell

All screens should use a shared shell:



\- Topbar

\- Left Sidebar

\- Main Workspace

\- Optional Right Context Panel

\- Overlay Layer



\## 2.2 Stable Navigation

The shell should remain stable across screen changes.

The player should feel that they are operating inside one continuous professional system.



\## 2.3 At-a-Glance Logic

Each screen must answer three questions immediately:



\- What is the current situation?

\- What matters now?

\- What can I do next?



\## 2.4 Visual Density Rule

Wireframes should support high information density, but preserve hierarchy and breathing room.



\## 2.5 Screen Priority Rule

Each screen must have one primary zone, one supporting zone, and one optional contextual zone.

No screen should present five equally loud regions fighting like petty aristocrats.



---



\# 3. Shared Shell Wireframe



\## 3.1 Topbar

Persistent horizontal bar across the top.



\### Left Area

\- Game logo / title

\- Save / company name



\### Centre Area

\- Current week

\- Current phase

\- Global deal status mini-indicator



\### Right Area

\- Budget / resources

\- Notifications

\- Settings

\- Pause / save controls



\### Behaviour

\- Always visible

\- Compact height

\- High clarity

\- Minimal motion



---



\## 3.2 Sidebar

Persistent left navigation rail.



\### Items

\- Dashboard

\- Inbox

\- Client

\- Team

\- Buyers

\- Tasks

\- Deliverables

\- Market

\- Risks

\- Timeline



\### Optional Lower Section

\- Objectives

\- Help / glossary

\- Save / exit



\### Behaviour

\- Active item strongly highlighted

\- Alert dots / counts allowed

\- Locked items visible if phase-relevant



---



\## 3.3 Main Workspace

The primary content area.



\### Internal Zones

\- Workspace Header

\- Main Content Body

\- Optional Secondary Content Rail



---



\## 3.4 Context Panel

Optional right-side panel.



\### Typical Uses

\- selected entity detail

\- quick notes

\- linked tasks

\- recommendations

\- related metrics



\### Behaviour

\- should slide open or appear with stability

\- should not displace critical content in a chaotic way



---



\# 4. Screen Wireframe 01. Dashboard



\# 4.1 Player Question This Screen Must Answer

“How is the process going right now, and where should I focus this week?”



\# 4.2 Functional Role

The Dashboard is the central overview screen and primary landing screen after each weekly advance or key event.



\# 4.3 Wireframe Layout



\## Row A. Workspace Header

\- Screen title: Dashboard

\- Subtitle: current phase / current week summary

\- Quick actions on right:

&nbsp; - Open Inbox

&nbsp; - Advance Week

&nbsp; - Review Priorities



\## Row B. KPI Strip

Horizontal row of compact KPI tiles.



\### Tiles

\- Deal Health

\- Client Confidence

\- Buyer Heat

\- Team Capacity

\- Timeline Pressure

\- Budget Burn



\### Behaviour

\- each tile clickable

\- each tile opens the relevant screen or filtered view



\## Row C. Main Body, 3-column layout



\### Left Column, Priority Stack

1\. \*\*Priority Actions Panel\*\*

&nbsp;  - 3 to 5 urgent actions

&nbsp;  - deadline markers

&nbsp;  - quick open buttons



2\. \*\*Inbox Snapshot\*\*

&nbsp;  - 4 to 6 important recent messages

&nbsp;  - unread emphasis

&nbsp;  - sender + subject + category



\### Centre Column, Process Core

1\. \*\*Deal Health Panel\*\*

&nbsp;  - composite status

&nbsp;  - summary text

&nbsp;  - main drivers up / down



2\. \*\*Active Workstreams Panel\*\*

&nbsp;  - workstream list

&nbsp;  - status per stream

&nbsp;  - delayed / blocked markers

&nbsp;  - progress bars



3\. \*\*Buyer Momentum Summary\*\*

&nbsp;  - key buyers

&nbsp;  - active phase

&nbsp;  - engagement level

&nbsp;  - shortlist pressure or drop-off risk



\### Right Column, Control and Risk

1\. \*\*Alerts / Escalations Stack\*\*

&nbsp;  - client concern

&nbsp;  - buyer issue

&nbsp;  - legal issue

&nbsp;  - team overload

&nbsp;  - timing slippage



2\. \*\*Timeline Snapshot\*\*

&nbsp;  - current phase node

&nbsp;  - next milestone

&nbsp;  - time remaining or delay status



3\. \*\*Quick Stats / Notes\*\*

&nbsp;  - small supporting metrics

&nbsp;  - optional internal note preview



\# 4.4 Primary Interactions

\- click KPI tile

\- open urgent item

\- open inbox message

\- inspect buyer

\- inspect workstream

\- advance week



\# 4.5 Optional Right Context Panel

\- selected alert detail

\- selected KPI explanation

\- weekly advisor summary



\# 4.6 Wireframe Priority Logic

Primary zone: centre column  

Supporting zone: left priority stack  

Context zone: right risk/timeline stack



---



\# 5. Screen Wireframe 02. Inbox



\# 5.1 Player Question This Screen Must Answer

“What is coming at me now, what is important, and what requires a decision?”



\# 5.2 Functional Role

The Inbox is the core decision intake screen and one of the main engines of gameplay pacing.



\# 5.3 Wireframe Layout



\## Row A. Workspace Header

\- Screen title: Inbox

\- Subtitle: message volume / current week context

\- Quick actions:

&nbsp; - Compose internal note, if system supports

&nbsp; - Filter

&nbsp; - Mark all reviewed, if appropriate



\## Row B. Inbox Toolbar

Horizontal control bar.



\### Left

\- search field

\- category tabs:

&nbsp; - All

&nbsp; - Client

&nbsp; - Internal

&nbsp; - Buyers

&nbsp; - Market

&nbsp; - Legal / Issues



\### Right

\- sort dropdown

\- priority filter

\- unread toggle

\- flagged toggle



\## Row C. Main Inbox Split Layout



\### Left Pane, Message List

Vertical list of email rows.



\#### Each row contains

\- sender

\- category marker

\- subject

\- preview line

\- timestamp

\- unread marker

\- priority / urgency marker

\- optional linked entity icon

\- optional thread count



\#### Message list behaviour

\- selectable

\- sortable

\- filterable

\- scrollable independently



\### Centre Pane, Message Preview

Selected message opens here.



\#### Preview structure

1\. Message header

&nbsp;  - sender

&nbsp;  - recipients / context

&nbsp;  - subject

&nbsp;  - timestamp

&nbsp;  - linked entities



2\. Body content

&nbsp;  - full message text

&nbsp;  - key highlighted points if needed

&nbsp;  - attachments / linked items



3\. Decision / action area

&nbsp;  - Reply

&nbsp;  - Delegate

&nbsp;  - Escalate

&nbsp;  - Convert to Task

&nbsp;  - Open Linked Entity

&nbsp;  - Ignore / Archive if appropriate



4\. Consequence hint area, optional

&nbsp;  - small box indicating likely implications



\### Optional Right Pane, Related Context

This panel appears only when useful.



\#### Possible content

\- buyer profile summary

\- client mood summary

\- linked task

\- issue status

\- deliverable relation

\- response options tree



\# 5.4 Primary Interactions

\- select email

\- filter category

\- sort

\- take action on selected email

\- open linked entity

\- convert to task

\- escalate



\# 5.5 UX Rules

\- unread messages must stand out immediately

\- critical emails must not rely only on red colour

\- preview must support long-form reading without clutter

\- decision actions must be clear and close to content

\- inbox should feel operational, not chat-like



\# 5.6 Wireframe Priority Logic

Primary zone: centre preview pane  

Supporting zone: left message list  

Context zone: optional right related panel



---



\# 6. Screen Wireframe 03. Buyers



\# 6.1 Player Question This Screen Must Answer

“Which buyers matter most right now, how are they evolving, and where is leverage building or collapsing?”



\# 6.2 Functional Role

The Buyers screen is the central screen for bidder management and competitive tension.



\# 6.3 Wireframe Layout



\## Row A. Workspace Header

\- Screen title: Buyers

\- Subtitle: current buyer universe state

\- Quick actions:

&nbsp; - Compare selected

&nbsp; - Shortlist view

&nbsp; - Export / review notes, if relevant



\## Row B. Buyer Control Bar

\- search

\- buyer type filter

\- geography filter

\- phase filter

\- sort by interest / price / credibility / risk

\- view mode switch:

&nbsp; - List

&nbsp; - Cards

&nbsp; - Matrix

&nbsp; - Heatmap



\## Row C. Main Body, 2-column layout



\### Left Main Zone, Buyer Universe

Depending on selected view mode:



\#### List View

Table with columns such as:

\- buyer

\- type

\- interest

\- valuation posture

\- chemistry

\- execution credibility

\- current phase

\- risk flag



\#### Card View

Buyer cards in grid or vertical stack.



\#### Matrix View

Comparison table for selected buyers.



\#### Heatmap View

Signal matrix comparing important variables.



\### Right Detail Zone, Selected Buyer Detail

When a buyer is selected, show:



1\. Buyer header

&nbsp;  - name

&nbsp;  - type

&nbsp;  - geography

&nbsp;  - current phase

&nbsp;  - status chips



2\. Strategic summary

&nbsp;  - interest level

&nbsp;  - likely valuation range

&nbsp;  - seller fit

&nbsp;  - seriousness

&nbsp;  - likely bottlenecks



3\. Timeline / process status

&nbsp;  - last interaction

&nbsp;  - next expected move

&nbsp;  - urgency level



4\. Risk / note area

&nbsp;  - key concerns

&nbsp;  - internal notes

&nbsp;  - political considerations



5\. Actions

&nbsp;  - Contact

&nbsp;  - Prioritise

&nbsp;  - Deprioritise

&nbsp;  - Add to shortlist

&nbsp;  - Compare

&nbsp;  - Open linked messages/tasks



\## Row D. Bottom Optional Comparison Strip

If multiple buyers are selected:

\- show compact comparison strip

\- allow quick pin / unpin



\# 6.4 Primary Interactions

\- select buyer

\- filter universe

\- compare buyers

\- shift shortlist status

\- inspect key risks

\- open linked entities



\# 6.5 Wireframe Priority Logic

Primary zone: buyer universe list/matrix  

Supporting zone: selected buyer detail  

Context zone: comparison strip / notes



---



\# 7. Screen Wireframe 04. Tasks \& Workstreams



\# 7.1 Player Question This Screen Must Answer

“What needs to be done, what is blocked, who is overloaded, and where can the process slip?”



\# 7.2 Functional Role

This is the operational execution control screen.



\# 7.3 Wireframe Layout



\## Row A. Workspace Header

\- Screen title: Tasks \& Workstreams

\- Subtitle: execution status this week

\- Quick actions:

&nbsp; - Add task

&nbsp; - Filter overdue

&nbsp; - View dependencies



\## Row B. Task Control Bar

\- search

\- workstream filter

\- owner filter

\- status filter

\- urgency filter

\- toggle:

&nbsp; - Task list

&nbsp; - Workstream view

&nbsp; - Dependency view



\## Row C. Main Body, 2-column layout



\### Left Main Zone, Task Universe



\#### List Mode

Task table with columns:

\- task

\- workstream

\- owner

\- deadline

\- status

\- urgency

\- dependency state

\- linked entity



\#### Workstream Mode

Grouped vertical workstream panels:

\- Preparation

\- Marketing Materials

\- Buyer Outreach

\- Management Interaction

\- Diligence

\- Negotiation

\- Closing



Each stream shows:

\- number of tasks

\- blocked tasks

\- progress

\- pressure level



\#### Dependency Mode

Visual dependency list or structured map:

\- task chains

\- blockers

\- critical path hints



\### Right Detail Zone, Selected Task Detail

Selected task detail panel includes:

1\. task header

2\. owner

3\. linked workstream

4\. deadline

5\. dependency chain

6\. quality / delay risk

7\. notes

8\. action buttons:

&nbsp;  - assign

&nbsp;  - reprioritise

&nbsp;  - mark complete

&nbsp;  - escalate

&nbsp;  - open linked deliverable / buyer / inbox thread



\## Row D. Bottom Warning Zone, optional

\- overdue tasks summary

\- overloaded staff warning

\- blocked chain summary



\# 7.4 Primary Interactions

\- filter tasks

\- inspect blocked items

\- reassign task

\- inspect workstream health

\- view critical path

\- open linked entity



\# 7.5 Wireframe Priority Logic

Primary zone: task universe  

Supporting zone: selected task detail  

Context zone: warning strip / dependency summary



---



\# 8. Secondary Wireframe Sketches



These screens may initially be implemented in lighter form, but should follow the same logic.



---



\# 8.1 Client Screen Wireframe Summary

\## Layout

\- header

\- client profile block

\- trust / pressure KPIs

\- concern list

\- communication timeline

\- strategic notes

\- pending decisions



\## Primary zone

client relationship state



\## Supporting zone

concerns + communication timeline



---



\# 8.2 Team Screen Wireframe Summary

\## Layout

\- header

\- capacity KPIs

\- team allocation table

\- member cards

\- overload warnings

\- selected member detail



\## Primary zone

allocation table



\## Supporting zone

member detail



---



\# 8.3 Deliverables Screen Wireframe Summary

\## Layout

\- header

\- deliverables pipeline

\- deliverables table/cards

\- readiness indicators

\- selected deliverable detail

\- dependency notes



\## Primary zone

deliverables pipeline / table



\## Supporting zone

detail panel



---



\# 8.4 Market \& Signals Screen Wireframe Summary

\## Layout

\- header

\- headline feed

\- sentiment indicators

\- rumour / signal cards

\- event detail panel



\## Primary zone

news/signal feed



\## Supporting zone

impact interpretation



---



\# 8.5 Risks \& Issues Screen Wireframe Summary

\## Layout

\- header

\- risk heat summary

\- risk register table

\- issue detail

\- mitigation tracker

\- escalation queue



\## Primary zone

risk register



\## Supporting zone

issue detail / mitigation



---



\# 8.6 Timeline / Phase Map Screen Wireframe Summary

\## Layout

\- header

\- horizontal phase timeline

\- milestone nodes

\- current week marker

\- delay markers

\- requirement panel



\## Primary zone

timeline strip



\## Supporting zone

milestone detail / gate requirements



---



\# 9. Overlay Wireframes



\# 9.1 Modal Wireframe

Used for:

\- confirmations

\- key decisions

\- event popups

\- milestone results



\## Structure

\- title

\- concise description

\- implication summary

\- decision buttons

\- optional linked data block



---



\# 9.2 Right Drawer Wireframe

Used for:

\- buyer detail

\- task detail

\- deliverable detail

\- risk detail



\## Structure

\- sticky header

\- entity summary

\- sub-sections

\- action footer



---



\# 9.3 Phase Transition Overlay

\## Structure

\- full-width or centred panel

\- phase title

\- short narrative block

\- objectives

\- new mechanics

\- continue button



This should feel more atmospheric than normal screens.



---



\# 10. Recommended Build Order for Wireframe-to-UI Implementation



Implement in this order:



1\. Shared Shell

2\. Dashboard

3\. Inbox

4\. Buyers

5\. Tasks \& Workstreams

6\. Timeline

7\. Modal / Drawer system

8\. Client

9\. Team

10\. Deliverables

11\. Risks

12\. Market

13\. Phase Transition / Milestone screens



This provides the fastest route to a credible playable slice.



---



\# 11. Final Wireframe System Statement



The wireframes of \*\*The M\&A Rainmaker\*\* must support a game experience that feels like operating a live sell-side M\&A process through a premium retro-futuristic professional interface, where information density, decision pressure, and process control are always legible and actionable.

