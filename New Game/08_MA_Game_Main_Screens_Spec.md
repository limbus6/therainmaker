\# The M\&A Rainmaker

\## Main Screens Specification

\### Version 1.0



---



\# 1. Purpose



This document defines the main screens of \*\*The M\&A Rainmaker\*\*.



Its purpose is to translate the game’s core design, workflow logic, and UI component system into concrete screen structures suitable for implementation in:

\- HTML

\- CSS

\- vanilla JavaScript



This document focuses on:

\- screen purpose,

\- layout hierarchy,

\- major UI components,

\- information flow,

\- player interaction patterns,

\- and mood / presentation logic.



The goal is to ensure that each screen feels:

\- operational,

\- coherent,

\- readable,

\- systemically useful,

\- and aligned with the Retro Corporate Noir identity.



---



\# 2. Global Screen Architecture



All major screens should inherit a common shell structure.



\## Standard App Shell

\- Topbar

\- Left Sidebar Navigation

\- Main Workspace

\- Optional Right Context Panel

\- Overlay Layer for modals, alerts, phase events, milestone results



\## Global Rules

\- The shell should remain visually stable during normal navigation.

\- Navigation should occur primarily inside the workspace.

\- The player should always know:

&nbsp; - where they are,

&nbsp; - what week it is,

&nbsp; - which phase they are in,

&nbsp; - what requires attention,

&nbsp; - and what decision pressure exists.



---



\# 3. Core Screen List



The main playable structure should include the following core screens:



1\. Home Dashboard

2\. Inbox

3\. Client

4\. Team

5\. Buyers

6\. Tasks \& Workstreams

7\. Deliverables

8\. Market \& Signals

9\. Risks \& Issues

10\. Timeline / Phase Map

11\. Phase Transition Screen

12\. Milestone / Outcome Screen



These are the backbone screens.

Additional screens can be added later, but these should define the playable vertical slice.



---



\# 4. Screen 01. Home Dashboard



\## Purpose

The Dashboard is the command centre of the game.



It should answer, at a glance:

\- how the process is going,

\- what matters this week,

\- where pressure is building,

\- and what the player should probably open next.



\## Gameplay Role

This is the player’s default situational awareness screen.



It should feel like:

\- a live advisory control room,

\- a weekly transaction cockpit,

\- a clear executive summary of process health.



\## Layout Structure

\### Main Zones

\- Workspace Header

\- KPI Strip

\- Priority Action Panel

\- Deal Health \& Momentum Panel

\- Active Workstreams Panel

\- Buyer Status Summary

\- Timeline Snapshot

\- Risk / Alert Stack

\- Optional latest inbox preview



\## Recommended Layout

\- top row: KPI strip across width

\- main left column: priorities + workstreams + inbox preview

\- main centre column: deal health + buyers summary

\- right column: alerts + timeline snapshot + quick stats



\## Key Components

\- Screen Title

\- KPI Tiles

\- Priority Panel

\- Alert Banners

\- Workstream Status Table or Cards

\- Buyer Summary Cards

\- Timeline Strip

\- Risk Chips

\- Inbox Preview Rows



\## Core Metrics to Display

\- Deal Health

\- Client Confidence

\- Buyer Heat

\- Team Capacity

\- Timeline Pressure

\- Budget Burn

\- Deliverable Readiness

\- Reputation / Advisor Standing, if part of system



\## Behaviour

\- Clicking any dashboard widget should open the related screen.

\- Alerts should be actionable.

\- Priority area should change dynamically week by week.



\## Mood

Dashboard should feel sharp, sober, and alive.

It should be the strongest example of Outlook Noir mixed with light Terminal Prestige.



---



\# 5. Screen 02. Inbox



\## Purpose

The Inbox is one of the central gameplay screens.



It is where:

\- client messages arrive,

\- team escalations surface,

\- bidder updates appear,

\- market rumours are delivered,

\- deadlines and issues are framed,

\- and key choices are triggered.



\## Gameplay Role

This is the main decision theatre of the game.



The inbox should not be cosmetic.

It should be one of the principal engines of gameplay pacing.



\## Layout Structure

\### Main Zones

\- Workspace Header

\- Inbox Toolbar

\- Mail List Pane

\- Email Preview Pane

\- Optional Action Panel / Thread Detail



\## Canonical Layout

\- left section: mail list

\- centre / right large section: selected email preview

\- optional right narrow context strip: related entity details or response options



\## Key Components

\- Search Field

\- Filter Dropdown

\- Tab Bar, Inbox / Flagged / Internal / External

\- Email Rows

\- Email Preview

\- Status Chips

\- Signal Dots

\- Action Buttons

\- Thread Indicators

\- Attachment / Deliverable Links



\## Email Categories

The inbox should visually distinguish:

\- Client communications

\- Internal team messages

\- Buyer interactions

\- Market intelligence

\- Legal / diligence issues

\- System / phase updates



\## Email Row Fields

\- Sender

\- Subject

\- Preview line

\- Time / date

\- Priority level

\- Thread count, if relevant

\- Status markers

\- Entity icon or classification marker



\## Preview Pane Content

\- Full subject

\- Sender and recipient context

\- Message body

\- Attachments

\- Related task / phase / buyer links

\- Action buttons

\- Notes or interpretation box, if desired



\## Typical Actions

\- Reply

\- Escalate

\- Delegate

\- Ignore

\- Mark Important

\- Convert to Task

\- Open Buyer / Deliverable / Issue

\- Decide from response options



\## Behaviour

\- Emails may trigger game logic.

\- Some emails are purely informative.

\- Some are branching decisions.

\- Some change state after delay.

\- Unread state must be visually strong.

\- Important decisions should be visible without feeling melodramatic.



\## Mood

This screen is the soul of the game’s daily loop.

It should feel like a premium 1990s professional mail client under pressure.



---



\# 6. Screen 03. Client



\## Purpose

Central view of the client relationship.



\## Gameplay Role

The player manages:

\- trust,

\- expectations,

\- alignment,

\- emotional stability of the seller,

\- and strategic readiness.



\## Main Zones

\- Client Header

\- Relationship Summary

\- Current Client Priorities

\- Client Concerns

\- Communication Log

\- Strategic Positioning Notes

\- Key Decisions Pending

\- Trust / Pressure Indicators



\## Key Components

\- Client Profile Card

\- KPI Tiles

\- Notes Panel

\- Issue List

\- Communication Timeline

\- Status Chips

\- Action Buttons



\## Core Information

\- client objectives

\- valuation expectations

\- time sensitivity

\- appetite for process aggression

\- tolerance for bidder risk

\- internal politics / founder dynamics

\- current confidence level



\## Behaviour

\- This screen should make the client feel like a live stakeholder, not a static portrait.

\- Trust and pressure indicators should evolve.

\- Certain client personalities may require different handling.



\## Mood

Calm, personal, high-stakes.

Slightly more Cinematic Dealroom influence than raw system screens.



---



\# 7. Screen 04. Team



\## Purpose

Manage the internal advisory team.



\## Gameplay Role

The player allocates capacity, monitors stress, handles execution quality, and prevents bottlenecks.



\## Main Zones

\- Team Header

\- Team Capacity Summary

\- Allocation Table

\- Individual Team Member Cards

\- Workload / Burnout Indicators

\- Current Assignments

\- Escalations / Bottlenecks

\- Hiring / Support actions, if applicable



\## Key Components

\- Team Table

\- Capacity Bars

\- Status Chips

\- Member Detail Drawer

\- Workstream Allocation View

\- Warning Alerts



\## Core Information

\- availability

\- seniority

\- morale / fatigue

\- task ownership

\- responsiveness

\- current workstream load

\- special skills or reliability traits



\## Behaviour

\- Overloading team members should create consequences.

\- Strong team allocation should improve deliverable quality and reduce risk.

\- Internal frictions may appear through alerts or inbox messages.



\## Mood

Operational and managerial.

This screen should lean toward Terminal Prestige with human overlays.



---



\# 8. Screen 05. Buyers



\## Purpose

Central management view of the buyer universe.



\## Gameplay Role

The player tracks bidders as dynamic strategic actors.



This screen should support:

\- buyer selection,

\- prioritisation,

\- bidding tension,

\- communication sequencing,

\- shortlist progression,

\- and drop-off risk.



\## Main Zones

\- Buyer Header

\- Buyer Funnel Overview

\- Buyer List / Buyer Cards

\- Buyer Comparison Matrix

\- Selected Buyer Detail

\- Buyer Heat / Momentum View

\- Red Flags / Strategic Notes



\## View Modes

\- List

\- Card grid

\- Comparison matrix

\- Heatmap



\## Buyer Fields

\- name

\- type, strategic / PE / family office / other

\- geography

\- interest level

\- valuation posture

\- process behaviour

\- chemistry with seller

\- execution credibility

\- likely DD friction

\- political sensitivity

\- current phase



\## Key Components

\- Buyer Cards

\- Buyer Comparison Table

\- Heatmap / Signal Matrix

\- Status Chips

\- Notes Panel

\- Action Buttons

\- Shortlist markers



\## Behaviour

\- Buyers should visibly evolve through the process.

\- Interest and credibility should not always move together.

\- Some buyers may look attractive and then become execution nightmares. Corporate theatre, the ancient art.



\## Mood

Analytical, tense, very alive.

This screen is one of the main expressions of the simulation layer.



---



\# 9. Screen 06. Tasks \& Workstreams



\## Purpose

Operational control screen for execution.



\## Gameplay Role

Tracks the work required to move the process forward.



\## Main Zones

\- Workstream Header

\- Global Task Filters

\- Task Table

\- Workstream Panels

\- Dependency View

\- Deadline Zone

\- Escalations

\- Selected Task Detail



\## Main Workstreams

Examples:

\- Preparation

\- Financials

\- Marketing Materials

\- Buyer Outreach

\- Management Interaction

\- Due Diligence

\- Negotiation

\- Closing Readiness



\## Task Fields

\- task name

\- owner

\- workstream

\- status

\- deadline

\- dependency status

\- quality risk

\- urgency

\- linked entity



\## Key Components

\- Data Table

\- Status Chips

\- Progress Bars

\- Dependency Indicators

\- Deadline Badges

\- Filters

\- Detail Drawer



\## Behaviour

\- Dependencies must matter.

\- Poor sequencing should create downstream pain.

\- Workstream visibility must reward organised play.



\## Mood

This is the most explicitly “workflow simulator” screen.

It should feel efficient, dense, and under control when the player is doing well.



---



\# 10. Screen 07. Deliverables



\## Purpose

Track all formal process outputs.



\## Gameplay Role

Deliverables are not decorative assets.

Their timing, quality, and readiness affect the process.



\## Typical Deliverables

\- Teaser

\- NDA package

\- Information Memorandum

\- Financial model

\- Buyer list

\- Process letter

\- Management presentation

\- DD pack

\- SPA mark-up support materials

\- Closing documents checklist



\## Main Zones

\- Deliverables Header

\- Deliverable Pipeline

\- Deliverable Cards or Table

\- Quality Indicators

\- Readiness Dependencies

\- Owner Assignments

\- Revision History

\- Critical Missing Elements



\## Key Components

\- Deliverable Cards

\- Progress Bars

\- Quality Chips

\- Deadline Alerts

\- Dependency Markers

\- Open / Review / Approve buttons



\## Behaviour

\- Deliverables should have visible impact on buyer interest, timing, and risk.

\- Low-quality or delayed materials should carry consequences.

\- Some deliverables may unlock later phases.



\## Mood

A blend of craft and pressure.

This should feel like professional production, not document storage.



---



\# 11. Screen 08. Market \& Signals



\## Purpose

Surface the external environment.



\## Gameplay Role

Adds context, noise, opportunity, and instability.



\## Main Zones

\- Market Header

\- News Feed

\- Sector Mood Indicators

\- Buyer Sentiment Signals

\- Macro or financing environment indicators

\- Rumour / Noise cards

\- Event reaction prompts



\## Key Components

\- Event Cards

\- News Ticker or Headlines List

\- KPI Tiles

\- Sentiment Indicators

\- Signal Chips

\- Action Links



\## Behaviour

\- Not every signal should be equally reliable.

\- The player should learn to distinguish noise from meaningful trend.

\- Some events should affect buyers differently.



\## Mood

Atmospheric and slightly volatile.

This screen should feel like the outside world pressing into the process.



---



\# 12. Screen 09. Risks \& Issues



\## Purpose

Structured management of transaction risk.



\## Gameplay Role

This is where the player sees what could derail the deal.



\## Main Zones

\- Risk Header

\- Risk Heat Summary

\- Risk Register Table

\- Issue Detail Panel

\- Escalation Queue

\- Mitigation Actions

\- Historical issue log



\## Risk Categories

Examples:

\- client risk

\- buyer risk

\- diligence risk

\- legal risk

\- financing risk

\- timing risk

\- team execution risk

\- market risk



\## Key Components

\- Risk Table

\- Severity Chips

\- Heatmap

\- Mitigation Tracker

\- Alerts

\- Linked entity references



\## Behaviour

\- Risks should evolve, not stay frozen.

\- Mitigation should matter.

\- Some hidden risks should only surface later.



\## Mood

Controlled anxiety.

This screen should feel clean, unsentimental, and important.



---



\# 13. Screen 10. Timeline / Phase Map



\## Purpose

Provide the player with a strategic overview of process progression.



\## Gameplay Role

Helps the player understand:

\- where they are,

\- what phase comes next,

\- what gates exist,

\- and where slippage is accumulating.



\## Main Zones

\- Timeline Header

\- Phase Strip

\- Milestone Nodes

\- Current Week Marker

\- Gate Requirements

\- Delay Indicators

\- Upcoming Critical Events



\## Key Components

\- Timeline Strip

\- Milestone Cards

\- Phase Labels

\- Delay Warnings

\- Dependency Markers



\## Behaviour

\- Clicking milestones opens related detail.

\- Timeline should show both actual progress and expected path.

\- Slippage should be visible, not hidden in the plumbing.



\## Mood

Strategic and process-oriented.

A calmer screen, but one loaded with consequences.



---



\# 14. Screen 11. Phase Transition Screen



\## Purpose

Mark entry into a new phase of the deal.



\## Gameplay Role

This is where pacing, mood, and progression become tangible.



\## Main Content

\- Phase number / name

\- short narrative summary

\- what changes in this phase

\- new priorities

\- new mechanics unlocked

\- new risks introduced

\- carry-over warnings from previous phase



\## Key Components

\- Large Title Block

\- Narrative Intro Text

\- Objective List

\- New Mechanics List

\- Continue Button

\- Optional animated background treatment



\## Behaviour

\- Appears at major progression points

\- should feel rewarding and serious

\- not too frequent



\## Mood

Cinematic Dealroom at full strength.

This is where the game briefly takes a breath before tightening the screws again.



---



\# 15. Screen 12. Milestone / Outcome Screen



\## Purpose

Present a meaningful event result.



\## Examples

\- teaser campaign launched

\- IOIs received

\- shortlist defined

\- DD issue triggered

\- exclusivity granted

\- SPA agreed

\- deal collapsed



\## Main Zones

\- Milestone Title

\- Result Summary

\- Consequence Breakdown

\- Metrics Impact

\- Follow-up Actions

\- Continue / Review options



\## Key Components

\- Outcome Panel

\- Metric Delta Cards

\- Alert Summary

\- Linked Actions

\- Narrative Commentary



\## Behaviour

\- must clearly explain what changed

\- must not bury the impact in decorative language

\- may trigger new inbox items, tasks, or risks



\## Mood

Elevated and consequential.

This is where feedback becomes emotionally legible.



---



\# 16. Cross-Screen UX Rules



\## 16.1 Navigation Rule

The player should always be one or two interactions away from:

\- inbox

\- buyers

\- tasks

\- risks

\- timeline



\## 16.2 Attention Rule

Every major screen should contain a clear “what matters now” area.



\## 16.3 Entity Linking Rule

Entities should cross-link cleanly:

\- email to buyer

\- buyer to task

\- task to deliverable

\- risk to client

\- milestone to timeline

\- timeline to workstream



\## 16.4 Density Rule

Screens should support professional density without collapsing into clutter.



\## 16.5 Phase Sensitivity Rule

Screens may subtly evolve by phase:

\- new widgets

\- changed emphasis

\- new alerts

\- more pressure indicators



The shell remains stable, but the process breathes through it.



---



\# 17. Recommended Vertical Slice Priority



For first playable build, implement these screens first:



1\. Home Dashboard

2\. Inbox

3\. Buyers

4\. Tasks \& Workstreams

5\. Timeline / Phase Map

6\. Phase Transition Screen



This gives a usable core loop with:

\- situational awareness

\- decision intake

\- bidder management

\- execution tracking

\- progression visibility



Everything else can layer on top later.



---



\# 18. Final Screen System Statement



The main screens of \*\*The M\&A Rainmaker\*\* must feel like a premium professional operating environment for a live sell-side process, combining workflow density, strategic tension, and retro-futuristic executive atmosphere without sacrificing clarity, usability, or systemic depth.

