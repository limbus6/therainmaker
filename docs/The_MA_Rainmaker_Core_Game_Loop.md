# The M&A Rainmaker — Core Game Loop & Interaction Flow

## Purpose

This document defines the full gameplay loop of **The M&A Rainmaker**.

Its objective is to describe, in a structured way:

- how the player experiences each in-game week
- how actions, emails, news, events and deliverables interact
- how the interface should remain stable across phases
- how the rhythm of the game should feel
- how the simulation should balance realism with playability

This document is written as a design blueprint for implementation in a lightweight simulation game.

---

# 1. Core Design Intent

The game should feel like running a live M&A process inside a professional environment.

The player is not simply “clicking actions”.
The player is:

- receiving emails
- responding to stakeholders
- allocating scarce resources
- reacting to unexpected developments
- preparing deliverables under pressure
- navigating market context
- trying to keep the deal alive and competitive

The gameplay rhythm should combine:

- short-term operational decisions
- medium-term process planning
- long-term deal consequences

The player should constantly feel:

- busy, but not overwhelmed
- pressured, but not confused
- informed, but never omniscient

The experience should feel closer to:

- an M&A operating desk
- a football career mode inbox and dashboard
- a high-pressure professional simulator

and not like:

- a spreadsheet with buttons
- a pure text adventure
- a chaotic notification storm

---

# 2. High-Level Weekly Loop

Each in-game week follows a repeatable loop.

## Weekly Loop Structure

1. Week Opens
2. Inbox & News Update
3. New Events / Triggered Developments
4. Player Review of Deal State
5. Player Decisions & Responses
6. Resource Allocation
7. Action Execution
8. Hidden Workload / Cascades / Surprise Effects
9. End-of-Week Resolution
10. State Update
11. Phase Progress Check
12. Transition or Next Week

This loop should remain stable across all phases.

Only the content changes by phase.
The structure does not.

That stability is crucial for UI clarity.

---

# 3. The Stable Interface Principle

The UI should remain largely constant from Phase 0 to Closing.

The player should always understand where to look for:

- what happened
- what needs a response
- what can be done
- what resources remain
- how the deal is evolving

## Permanent Interface Zones

### A. Top Bar
Persistent summary of the deal.

Should always show:

- Current phase
- Week number
- Deal momentum
- Risk
- Budget remaining
- Team capacity remaining
- Team morale
- Client trust

### B. Left Column — Communication Center
The inbox and message flow.

Contains:

- emails
- short internal notes
- buyer outreach responses
- partner feedback
- urgent action requests

### C. Center Workspace — Active Decisions
The main working area.

Contains:

- available actions
- active deliverables
- decision prompts
- current objectives
- cascade tasks

### D. Right Column — Market & Context
The environmental layer.

Contains:

- market headlines
- industry developments
- rumors
- passive context updates
- comparable transactions
- macro news

### E. Bottom / Expandable Layer — Logs & Reports
Contains:

- recent action log
- weekly outcome summaries
- phase transition reports
- deal history

The layout should not materially change between phases.
Only the data inside each zone changes.

---

# 4. Player Experience Goal by Loop Stage

## 4.1 Week Opens

The start of the week should feel like arriving at your desk on Monday morning.

The player immediately sees:

- what phase the deal is in
- what is outstanding
- what happened since last week
- which new messages require attention
- how much capacity and budget remain

This first screen should create a professional “scan the dashboard” feeling.

## 4.2 Inbox & News Update

Before the player acts, the world talks back.

This is critical.

The inbox and market feed are how the simulation feels alive.

The player should rarely begin a week with a blank screen.
There should almost always be some combination of:

- one or two emails
- one passive market headline
- one internal note
- a new follow-up task
- or a reminder of unresolved issues

This creates continuity.

## 4.3 New Events / Triggered Developments

Events then surface.

Some are active and require decisions.
Some are passive and only change context.
Some create extra workload.

The player should understand the difference between:

- something that needs a reply now
- something that changed the environment
- something that added work

## 4.4 Review of Deal State

Before acting, the player reads the situation.

The central workspace should show:

- phase objectives
- progress bars
- priority deliverables
- active risks
- available actions
- blocked items, if any

## 4.5 Decisions & Responses

The player then interacts with:

- emails requiring a response
- action cards
- strategic choices
- staffing choices
- process design choices

This is the heart of the game.

## 4.6 Resource Allocation

Every chosen action consumes:

- Budget
- Work

If over-capacity is used, pressure rises.

The player must feel that resources matter more than click volume.

## 4.7 Action Execution

Chosen actions resolve into:

- progress
- variable changes
- deliverable creation
- relationship shifts
- market preparation
- buyer dynamics

## 4.8 Hidden Workload & Cascade Tasks

Some tasks trigger hidden extra work or new required tasks.

This is essential for realism.

The player should frequently think:

“I thought that would take one week. It didn’t.”

## 4.9 End-of-Week Resolution

The week closes with a concise but satisfying summary:

- what was completed
- what changed
- what new issues appeared
- whether the deal improved or worsened

## 4.10 State Update

The simulation engine updates all relevant state variables.

## 4.11 Phase Progress Check

If thresholds are reached, the player gets a phase completion report.
If not, the loop repeats.

---

# 5. The Five Information Streams

To keep the game elegant, all game information should come through five streams only.

## 5.1 Inbox Stream
Requires reading and sometimes responding.

Examples:

- CFO asks for model clarification
- Partner pushes for stronger buyer strategy
- Founder asks whether valuation expectations are realistic
- Buyer asks for more information
- Team member flags inconsistency

## 5.2 Headline Stream
Passive context layer.

Examples:

- “Large strategic buyer launches European acquisition plan”
- “Rates remain elevated, PE financing discipline tightens”
- “Comparable SaaS deal closes at 11.5x EBITDA”

These modify environment variables but do not require player reply.

## 5.3 Action Stream
The set of possible deliberate moves by the player.

Examples:

- Draft IM
- Build financial model
- Conduct customer analysis
- Map strategic buyers
- Rehearse management presentation

## 5.4 Event Stream
Unexpected operational developments.

Examples:

- hidden workload
- discovered issue
- buyer loses momentum
- client delays documentation
- analyst burnout

## 5.5 Report Stream
Summaries of what happened.

Examples:

- weekly summary
- phase readiness report
- end-of-phase review
- final post-mortem

Restricting the game to these five streams helps maintain UI discipline.

---

# 6. The Communication Center

## Design Goal

The inbox should be one of the emotional centers of the game.

It should feel lightly inspired by Outlook or football career mode inboxes, but more deliberate and professional.

The inbox is not just decoration.
It is a decision surface.

## Message Types

Each message should clearly belong to a type:

- Client
- Internal Team
- Partner
- Buyer
- Advisor / Expert
- Market Intelligence
- System

Each message type should have slightly different styling.

## Message States

Messages can be:

- Informational
- Requires Response
- Urgent
- Follow-up
- Resolved

## Message Interaction

When opening an email, the player can:

- reply with one of several structured options
- ignore
- defer
- escalate
- convert to task

Not every email needs a response.
Some only update context.

## Good Inbox Rhythm

Per week, the player should usually see:

- 2 to 5 total messages
- only 1 to 2 truly important responses
- not more than 1 urgent message in most normal weeks
- more in crisis periods

The inbox should feel meaningful, not spammy.

---

# 7. The Headline System

## Purpose

Headlines create world texture.

They make the game feel broader than the player’s inbox.

They should be visually separate from email.

They are not private communications.
They are environmental context.

## Headline Categories

- Macro / rates / financing
- Sector activity
- Comparable transactions
- Competitor sales
- Regulatory / legal environment
- Buyer strategy shifts

## Behaviour

Headlines can:

- change market temperature
- alter buyer appetite
- shift valuation ranges
- create narrative pressure
- generate rumor risk

## Important Rule

Headlines should not “inflate the interface”.

They should be brief and glanceable.

One line.
Possibly two at most.

The player should absorb them like ticker information.

Examples:

- “PE financing spreads tighten again across Europe.”
- “Industrial consolidator signals appetite for Iberian acquisitions.”
- “Cloud software multiples recover after volatile quarter.”

---

# 8. The Action Layer

## Core Principle

The player is constrained by resources, not by action count.

Every action consumes:

- Cost
- Work

Some actions also carry:

- Complexity
- Hidden workload probability
- Cascade task potential

## Action Presentation

Every action card should show only:

- Action Name
- Cost
- Work
- Complexity
- Short effect summary

The player should not see hidden workload probability explicitly.
That belongs to the simulation layer, not the presentation layer.

## Action Filters

To keep the center workspace clean, actions should be filterable by:

- Category
- Priority
- Deliverable
- Relationship
- Market
- Internal
- External Advisor

## Action States

Actions can be:

- Available
- Recommended
- Locked
- In Progress
- Completed
- Reopened by cascade

---

# 9. Deliverables as a Core Interaction Object

The game should not only display abstract actions.
It should also show concrete deliverables.

This makes the work feel real.

## Example Deliverables

Phase 0:
- Pitch deck
- valuation framing
- sector scan

Phase 1:
- teaser
- information memorandum
- financial model
- buyer long list
- data room

Later phases:
- Q&A pack
- NBO analysis memo
- bidder comparison table
- SPA issue list

## Deliverable Cards

Each deliverable should have:

- status
- completion level
- quality tier
- owner / team load
- dependencies
- open review comments

This adds operational realism without changing the overall UI structure.

---

# 10. Email-to-Task Conversion

A very useful system for elegance is this:

Some messages create tasks.
Some tasks create messages.

That feedback loop gives life to the simulation.

## Example

Email:
“Client asks for revised valuation bridge.”

Player options:
- respond only
- convert to task
- escalate to partner
- ignore

If converted, a new task appears in the action layer.

Likewise:

Completing “Draft Information Memorandum” may trigger:
- partner review email
- client feedback message
- new cascade task

This makes the world feel interconnected.

---

# 11. Weekly Cadence by Phase

The underlying loop stays stable, but intensity changes by phase.

## Phase 0 — Origination / Pitch
Rhythm:
- lighter operational load
- more relationship messaging
- more narrative building
- fewer large deliverables

Inbox style:
- warm outreach
- management dialogue
- partner coaching
- competitor signals

## Phase 1 — Preparation
Rhythm:
- heaviest workload escalation
- most deliverable pressure
- highest chance of hidden work
- strongest team-capacity management relevance

Inbox style:
- CFO clarifications
- partner comments on materials
- client requests for narrative changes
- internal red flags

## Phase 2 — Market Outreach
Rhythm:
- more buyer responses
- more communication volume
- more timing tension

Inbox style:
- NDA responses
- teaser reactions
- buyer filtering
- confidentiality concerns

## Phase 3 onward
Rhythm:
- fewer “build” tasks
- more response, prioritisation and negotiation
- communication becomes more external and adversarial

The same UI can handle this because the containers stay the same.

---

# 12. Hidden Workload in the Loop

This mechanic deserves special treatment because it adds realism.

## Role in the Loop

Hidden workload should usually appear after action resolution, not before.

This preserves surprise.

## UX Rule

When hidden work appears, it should feel like:

“New complication”
not
“Random punishment”

Therefore the notification should always include a believable narrative explanation.

## Good Examples

- “Revenue cohort analysis reveals inconsistent client tagging. Additional clean-up required.”
- “Partner requests stronger benchmarking before approving IM draft.”
- “Client asks to add segment-level profitability analysis.”

## Bad Examples

- “+8 work because random.”

The narrative wrapper matters.

---

# 13. Pressure & Burnout Layer

## Purpose

Pressure turns resource allocation into something meaningful.

If the player pushes too much work through too little team capacity, the game should react.

## Pressure Sources

- too much work scheduled
- repeated over-capacity weeks
- too many high-complexity tasks in parallel
- too many unresolved cascade tasks

## Pressure Consequences

- morale drops
- error events rise
- hidden workload more likely
- deliverable quality declines
- partner intervention messages appear

## Pressure Presentation

Pressure should be visible as a simple indicator:

Low  
Normal  
High  
Critical

Do not overload the player with formulas in the UI.

The formula can exist under the hood.

---

# 14. Weekly Resolution Screen

At the end of every week, the player should receive a concise review.

## Must Include

- actions completed
- key messages resolved
- new risks emerged
- deliverables advanced
- team/budget usage
- phase progress change

## Nice-to-Have

- brief narrative summary
- one “what changed most” highlight
- one “watch item” for next week

## Example Tone

“This week the process gained momentum. The teaser and first buyer mapping work improved outreach readiness, but the financial model required more revision than expected.”

This should feel like a smart executive summary, not an audit log.

---

# 15. Phase Transition Reports

At the end of each phase, the player should receive a formal transition report.

## Structure

### A. What was achieved
- key deliverables completed
- quality level
- resulting state variables

### B. What carries forward
- unresolved risks
- team fatigue
- client expectation issues
- market conditions

### C. What this means for the next phase
- expected buyer interest
- likely negotiation leverage
- risk warning

These reports create continuity and make phase-to-phase causality legible.

---

# 16. Decision Hierarchy

Not all player choices are equally important.
The game should distinguish three levels.

## Level 1 — Tactical
Low-impact week-to-week choices.

Examples:
- respond politely vs firmly
- choose which analysis to do first
- assign review now or later

## Level 2 — Operational
Important execution choices.

Examples:
- build IM now
- hire advisor
- reinforce team
- push overtime
- prioritise strategic buyers

## Level 3 — Structural
Major process-shaping choices.

Examples:
- choose broad vs targeted auction
- short list size
- grant early management access
- move to exclusivity
- resist retrade

The UI should make structural choices feel more significant than normal actions.

---

# 17. Recommendations on Notification Discipline

A common design failure in management simulators is notification bloat.

The M&A Rainmaker should avoid that.

## Rules

- no more than one major pop-up per week unless crisis week
- passive headlines stay in the news feed
- informational emails stay in the inbox
- only urgent decisions interrupt flow
- end-of-week summary absorbs small changes

In short:
not every event deserves a modal

This preserves elegance.

---

# 18. Suggested Monday-to-Friday Feel Without Literal Daily Simulation

The game should simulate a week, not individual days.
But each week should *feel* like a professional week.

You can achieve this through sequencing.

## Suggested Internal Rhythm

### Monday feeling
Inbox and news arrive.

### Tuesday/Wednesday feeling
Player acts, allocates work, responds.

### Thursday feeling
Complications and feedback emerge.

### Friday feeling
Weekly resolution summary closes the loop.

This creates temporal texture without daily micromanagement.

---

# 19. The Role of Reputation and Identity

The player is **The M&A Rainmaker**.

This identity should matter.

It should appear subtly in:

- partner expectations
- buyer responses
- internal commentary
- end-of-phase reports
- career progression systems

The game should occasionally reflect the player’s reputation.

Examples:

- “Your growing reputation helped secure a warm introduction.”
- “The client expects rainmaker-level execution.”
- “Buyers are taking the process seriously because the market knows who is running it.”

This strengthens the fantasy.

---

# 20. Minimal UI State Model

For implementation, every week should be representable by a minimal UI state object.

## Recommended UI State Components

- dealHeader
- inboxItems
- newsHeadlines
- activeActions
- deliverables
- alerts
- weeklySummary
- phaseObjectives
- resourceBars
- rightColumnContext

This reinforces stable rendering logic.

---

# 21. Roadmap for Future UX Layers

The first implementation should stay lean.
But the loop should be designed to support future additions.

## Future-compatible additions

- multi-deal mode
- cross-deal staffing conflicts
- saved message threads
- buyer memory
- richer partner personalities
- mobile layout adaptation
- deeper career mode dashboards

These should plug into the same loop, not replace it.

---

# 22. Summary of the Full Game Loop

The full loop should feel like this:

The week begins.
The player scans the dashboard.
Messages arrive.
The market whispers through headlines.
Problems and opportunities emerge.
The player chooses what to answer and what work to fund.
The team executes.
Unexpected complications appear.
The week closes with consequences.
The deal shifts.
The next week starts.

That loop, repeated with different content across phases, is the core of the game.

If it is elegant, stable and alive, the game works.

If it is noisy, fragmented or overly mechanical, the illusion breaks.

---

# 23. Final Design Principle

The interface should always answer five questions clearly:

1. What happened?
2. What needs my attention?
3. What can I do?
4. What will it cost me?
5. Is the deal getting better or worse?

If the UI answers those five questions every week, the player remains oriented.

That is the foundation of The M&A Rainmaker.
