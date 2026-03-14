# The M&A Rainmaker — UI Layout Specification

## Purpose

This document defines the visual, structural and interaction design of the interface for **The M&A Rainmaker**.

Its goal is to translate the game loop, the action system and the narrative simulation into a coherent user interface that is:

- stable across all phases of the deal
- readable under pressure
- immersive without being noisy
- professional in tone
- modular enough for future expansion

The interface should feel like a hybrid between:

- an M&A execution workspace
- an Outlook-style communication environment
- a football career mode dashboard
- a structured decision simulator

The player should feel like they are sitting at a deal desk, actively managing a live M&A process in real time.

This is not a fantasy game interface.
This is not a spreadsheet disguised as a game.
This is a professional simulation layer with strong narrative clarity.

---

# 1. Core UI Design Principles

## 1.1 Stability Across Phases

The layout must remain structurally stable from Phase 0 to Closing.

The player should not need to relearn the interface every time the phase changes.

Only the content should change:

- emails become buyer-heavy later in the process
- deliverables change from pitch deck to IM to SPA issue list
- the market feed becomes more or less relevant depending on the phase
- the same components remain visible and familiar

This principle reduces cognitive friction and allows the player to focus on decision quality.

---

## 1.2 Information Hierarchy First

The interface must answer five questions at all times:

1. What happened?
2. What needs my attention?
3. What can I do now?
4. What will it cost me?
5. Is the deal improving or deteriorating?

If a screen cannot answer these questions clearly, the design is failing.

---

## 1.3 Professional Tone, Not Dry Tone

The interface should feel credible and business-like, but it must not feel dead.

It should have:

- elegant motion
- restrained drama
- concise narrative feedback
- moments of pressure
- visible consequences

The tone is professional, but alive.

---

## 1.4 Controlled Density

This game contains a lot of information:

- deal state
- team state
- email threads
- market news
- actions
- deliverables
- hidden workload consequences
- phase progress

The UI must be information-dense but never visually bloated.

That means:

- not every item needs a large card
- not every event needs a pop-up
- some things belong in the feed
- some things belong in inbox
- some things belong in the end-of-week summary

The interface should feel curated, not flooded.

---

## 1.5 The Player as Operator, Not Spectator

The UI should communicate that the player is doing real work.

It is not enough to show abstract meters moving.
The interface should make the player feel they are:

- answering people
- preparing deliverables
- managing pressure
- choosing trade-offs
- shaping the process

That requires visible operational objects:

- tasks
- deliverables
- comments
- message threads
- review loops
- deadlines
- phase gates

---

# 2. Global Screen Architecture

The interface is built around five permanent zones.

These zones remain fixed throughout the game.

## 2.1 Layout Overview

```text
┌────────────────────────────────────────────────────────────────────┐
│ Top Bar — Deal Status / Resources / Phase / Week                  │
├────────────────────────────────────────────────────────────────────┤
│ Left Panel         │ Center Workspace        │ Right Panel         │
│ Communication      │ Actions / Deliverables  │ Market & Context    │
│ Inbox / Threads    │ Objectives / Decisions  │ Feed / Headlines    │
│                    │                         │                     │
│                    │                         │                     │
├────────────────────────────────────────────────────────────────────┤
│ Bottom Layer — Weekly Summary / Logs / Reports / Phase Review     │
└────────────────────────────────────────────────────────────────────┘
````

This structure should be responsive, but the logic of the zones should remain identical even on smaller screens.

---

## 2.2 Zone Philosophy

Each zone has a distinct function.

### Top Bar

Orientation and health of the deal.

### Left Panel

Communication and incoming narrative pressure.

### Center Workspace

Deliberate action and execution.

### Right Panel

External context and environmental change.

### Bottom Layer

Memory, reporting and continuity.

This division is important because it avoids mixing “things happening to me” with “things I choose to do”.

---

# 3. Top Bar — Deal Status Layer

## 3.1 Purpose

The top bar is the player’s permanent cockpit.

It should provide a fast, glanceable understanding of the situation.

The player should be able to read the top bar in under two seconds and understand whether the deal is:

* healthy
* under pressure
* slipping
* entering a critical moment

---

## 3.2 Mandatory Data Points

The top bar should show:

* Game Title: **The M&A Rainmaker**
* Current Deal Name
* Current Phase
* Week Number
* Deal Momentum
* Risk Level
* Client Trust
* Team Morale
* Budget Remaining
* Team Capacity Remaining

Optional later additions:

* active buyer count
* exclusivity status
* DD heat
* signing / closing certainty

---

## 3.3 Presentation Logic

### Current Phase

Displayed as a strong label.

Example:

`Phase 1 — Preparation`

### Week Number

Displayed as:

`Week 3 of 6`
or
`Week 14`

depending on pacing model.

### Deal Momentum

A qualitative and visual indicator.

Suggested levels:

* Weak
* Building
* Strong
* Very Strong
* Fragile
* Deteriorating

### Risk Level

A simplified risk state.

Suggested levels:

* Low
* Moderate
* Elevated
* High
* Critical

### Budget Remaining

Displayed numerically and visually.

Example:

`Budget: 38 / 60`

### Team Capacity Remaining

Displayed numerically and visually.

Example:

`Capacity: 12 / 30`

### Client Trust

Can be shown as a score or band.

Example:

`Client Trust: 74`

### Team Morale

Same style.

Example:

`Team Morale: 61`

---

## 3.4 Design Behaviour

The top bar should remain pinned.

It should not scroll away.

Changes in key values should animate subtly:

* small upward / downward pulse
* colour transition
* no dramatic flashing

This is a finance simulator, not a fruit machine.

---

# 4. Left Panel — Communication Center

## 4.1 Purpose

The Communication Center is the main narrative interface.

This is where the player feels the process becoming human:

* clients ask things
* partners interfere
* buyers respond
* the team flags issues
* advisors raise warnings

This panel should feel lightly inspired by Outlook, but much cleaner and more game-oriented.

---

## 4.2 Core Structure

The left panel contains:

* message filters
* inbox list
* thread list
* unread markers
* urgency markers

Message categories should be filterable.

Suggested filters:

* All
* Client
* Partner
* Team
* Buyer
* Advisor
* System

---

## 4.3 Message List Row Design

Each row should contain:

* sender name
* sender type
* subject line
* timestamp or week marker
* unread state
* urgency state

Optional:

* icon for category
* small preview line

Example row:

**CFO**
Question on margin bridge assumptions
Requires response

Example row:

**Partner — Rui Miranda**
Need stronger strategic buyer logic
Urgent

---

## 4.4 Message States

Messages can exist in one of several states:

* Informational
* Requires Response
* Urgent
* Follow-up
* Resolved
* Deferred

These states should be visually distinct.

### Informational

No action needed.

### Requires Response

At least one player choice expected.

### Urgent

Should materially affect the week if ignored.

### Follow-up

Continuation of prior discussion.

### Resolved

Still readable, but visually dimmed.

### Deferred

Player chose to postpone.

---

## 4.5 Message Detail View

When a message is opened, the center workspace may switch into thread mode or show a message pane.

The message detail should show:

* sender
* subject
* body
* context tag
* urgency level
* response options

Example:

**From:** CFO
**Subject:** Need clarity on growth assumptions
**Category:** Client
**Urgency:** Moderate

Body text should be short but meaningful.

---

## 4.6 Response System

Messages may offer several structured responses.

Examples:

* Explain assumptions
* Revise the model
* Escalate to partner
* Ignore for now
* Convert to task
* Request more information

Each response may:

* change variables directly
* generate a task
* spawn a follow-up message
* trigger an event
* cost work or budget

This is where the inbox stops being cosmetic and becomes mechanical.

---

## 4.7 Email Tone

Messages should feel believable, concise and differentiated by sender.

### Client emails

Often practical, occasionally anxious, sometimes emotionally loaded.

### Partner emails

Sharper, more demanding, more judgmental.

### Buyer emails

Transactional, probing, strategic.

### Team emails

Operational, warning-based, or collaborative.

### Advisor / expert emails

Specialised, concise, often advisory rather than emotional.

---

## 4.8 Communication Load Discipline

Per week, the player should generally see:

* 2 to 5 total messages
* 1 to 2 meaningful response points
* rarely more than 1 urgent interruption
* occasional calm weeks
* crisis weeks only at selected moments

Too many messages will make the inbox feel synthetic.
Too few will make the world feel dead.

---

# 5. Center Workspace — Execution Layer

## 5.1 Purpose

This is the operational core of the game.

It is where the player:

* selects actions
* reviews active deliverables
* allocates scarce resources
* responds to tasks created by events
* advances the phase

This area should always feel like the place where work is being done.

---

## 5.2 Workspace Modes

The center workspace should support several modes without changing layout logic.

### Default Mode

Action cards + phase objective + deliverables.

### Message Response Mode

Opened email with response options.

### Deliverable Mode

Detailed view of a specific deliverable.

### Decision Mode

Major structural choice screen.

### Weekly Resolution Mode

Read-only summary after the week.

These are modes, not different interfaces.

---

## 5.3 Available Actions Panel

Actions should be shown as cards or rows, grouped by category.

Suggested categories:

* Relationship
* Information
* Market Intelligence
* Narrative
* Materials
* Buyer Intelligence
* Process Management
* Team Management
* External Advisors

The player should be able to filter or collapse categories.

---

## 5.4 Action Card Specification

Each action card must show only visible player-facing information.

### Required Fields

* Action name
* Category
* Cost
* Work
* Complexity
* Effect summary

### Optional Fields

* Recommended tag
* Deliverable link
* Phase tag
* Dependency indicator

### Example

**Draft Information Memorandum**
Category: Materials
Cost: 12
Work: 30
Complexity: High
Effects: Buyer Interest +10, Preparation Progress +15

Hidden workload probability must not be shown.

That belongs to the simulation engine.

---

## 5.5 Complexity Presentation

Complexity should be visual, quick and intuitive.

Suggested display:

* Low → green dot / label
* Medium → amber dot / label
* High → red dot / label

This allows the player to feel risk without seeing underlying formulas.

---

## 5.6 Action States

Actions can be:

* Available
* Locked
* In Progress
* Recommended
* Reopened
* Completed

### Available

Can be chosen immediately.

### Locked

Dependency not met.

### In Progress

Being worked on across weeks.

### Recommended

System suggests high relevance.

### Reopened

Previously completed area needs revisiting because of cascade / hidden workload.

### Completed

Done and archived or dimmed.

---

# 6. Deliverables System

## 6.1 Purpose

Deliverables turn abstract effort into concrete outputs.

This is essential for immersion.

The player should not feel that they are only moving bars.
They should feel that they are producing actual documents and process assets.

---

## 6.2 Deliverable Types by Phase

### Phase 0

* Pitch deck
* valuation framing
* market scan
* process concept note

### Phase 1

* teaser
* information memorandum
* financial model
* buyer long list
* data room

### Later phases

* Q&A pack
* buyer comparison memo
* NBO evaluation memo
* DD tracker
* SPA issues list

---

## 6.3 Deliverable Card Fields

Each deliverable card should show:

* Name
* Status
* Completion %
* Quality level
* Open comments
* Dependencies
* Owner / load tag if needed

### Example

**Information Memorandum**
Status: In Progress
Completion: 60%
Quality: Solid
Open Comments: 2
Review Pending: Partner

---

## 6.4 Deliverable Quality Levels

Suggested levels:

* Basic
* Solid
* Exceptional

Quality should depend on:

* work invested
* pressure level
* over-capacity usage
* review loops
* hidden workload outcomes

Quality affects later phases.

So the UI must make it visible.

---

## 6.5 Review Comment Layer

Deliverables should occasionally receive comments from:

* partner
* client
* team
* buyer, later in process

Example comment:

“Need stronger benchmarking on European strategics.”

This creates realism and helps justify reopened work.

---

# 7. Right Panel — Market & Context Feed

## 7.1 Purpose

This is the world outside the inbox.

The right panel gives the player a sense that the market exists independently of them.

It should contain:

* headlines
* macro context
* market noise
* comparable transaction references
* sector shifts
* discreet rumours

This panel should enrich the experience without demanding too much attention.

---

## 7.2 Content Types

### Market Headlines

Short one-line items.

### Comparable Transaction Notes

Brief references to pricing or activity.

### Macro Notes

Rates, financing, liquidity, regulatory shifts.

### Sector Signals

Consolidation waves, buyer appetite, market weakness.

### Rumour Layer

Occasional discreet references that increase tension.

---

## 7.3 Headline Format

Headlines should be short and glanceable.

Good examples:

* “European software multiples stabilise after volatile quarter.”
* “PE financing discipline remains tight in large-cap deals.”
* “Strategic acquirers re-enter Iberian business services market.”
* “Comparable ERP asset trades at 10.8x EBITDA.”

The player should absorb these in seconds.

They should not become essays.

---

## 7.4 Headline Behaviour

Headlines may:

* change market sentiment
* alter buyer appetite
* affect valuation ranges
* modify risk background
* create indirect pressure

Usually they should not require direct response.

They are context, not conversation.

---

# 8. Notification & Alert System

## 8.1 Purpose

Not everything belongs in the inbox.
Not everything deserves a modal.
Not everything should be hidden.

The notification system manages this balance.

---

## 8.2 Notification Types

### Passive Feed Item

Lives in market/context feed.

### Inbox Item

Lives in communication center.

### Banner Alert

Appears at top of workspace for urgent developments.

### End-of-Week Note

Appears only in weekly summary.

---

## 8.3 Banner Alert Use Cases

Banner alerts should be reserved for genuinely consequential moments.

Examples:

* Client requests urgent valuation revision
* Buyer threatens to pause process
* Team capacity collapses due to burnout
* Critical hidden workload emerges
* Phase gate reached

Banner alerts should be rare enough to feel significant.

---

## 8.4 Visual Rules for Alerts

Urgent alerts should be visible but not hysterical.

No full-screen flashing nonsense.
This is M&A, not a spaceship breach.

Suggested treatment:

* slim but strong banner
* red or amber accent
* concise text
* one or two options to act

---

# 9. Weekly Resolution Screen

## 9.1 Purpose

At the end of each week, the game must pause and tell the player what the week meant.

This is critical for readability.

Without a proper weekly summary, the simulation becomes mush.

---

## 9.2 Required Summary Fields

Each weekly resolution should show:

* actions completed
* deliverables progressed
* budget spent
* work consumed
* morale change
* risk change
* momentum change
* new issues discovered
* new tasks created
* outstanding urgent items

---

## 9.3 Summary Tone

The weekly resolution should sound like a smart internal summary.

Example tone:

“This week the process gained momentum. The teaser and financial model improved market readiness, but additional analytical work emerged after inconsistencies were found in revenue segmentation.”

The text should be:

* concise
* informative
* slightly interpretive
* never melodramatic

---

## 9.4 Visual Layout

The weekly resolution may be shown as:

* overlay panel
* slide-in summary
* bottom panel expansion

It should feel like a formal closing of the week.

Not a random notification dump.

---

# 10. Phase Completion Report

## 10.1 Purpose

At the end of each phase, the player must understand:

* what was achieved
* what quality was reached
* what risks carry forward
* how the next phase is shaped

This is where causality between phases becomes legible.

---

## 10.2 Recommended Structure

### A. Phase Outcome

What the player completed.

### B. Carry-Forward Variables

What continues into the next phase.

### C. Strategic Implication

What the result means.

### D. Next Phase Preview

What will now matter.

---

## 10.3 Example

**Preparation Phase Complete**

Buyer Universe: 34
Equity Story Strength: Strong
Data Quality: High
Process Readiness: 81

Projected Impact:

* Strong initial buyer engagement expected
* Lower DD disruption risk
* Client expectations elevated

This is where the game says, politely but firmly, “here is the bill for your previous decisions”.

---

# 11. Interaction Discipline

## 11.1 The Problem to Avoid

Many management games collapse under interface obesity.

Too many modals.
Too many icons.
Too many interruptions.
Too many small meaningless updates.

That must be avoided.

---

## 11.2 Design Rules

* Most information should live passively in panels
* Only urgent items should interrupt flow
* Inbox should absorb narrative load
* Headlines should absorb environmental load
* Weekly summary should absorb low-level state changes
* Major decisions should feel clearly distinct

---

## 11.3 Rule of Calm Intensity

The process can be intense.
The interface should still feel calm.

This creates contrast.
It also feels more realistic.

Real professional pressure is often quiet, not cartoonishly loud.

---

# 12. Visual Style Specification

## 12.1 Tone

The visual tone should be:

* elegant
* restrained
* premium
* professional
* slightly cinematic in its polish
* never playful or arcade-like

---

## 12.2 Colour Palette

### Core Colours

* Deep Navy → primary interface tone
* Steel Blue / Slate → supporting neutral
* Gold Accent → achievement / premium / strong result
* Soft Grey → surfaces and cards
* White / Off-white → text and structure

### Functional Colours

* Green → positive movement
* Amber → caution / medium complexity
* Red → risk / urgent / deterioration

Avoid overly saturated colours.
This is not a crypto dashboard with a caffeine problem.

---

## 12.3 Typography

Typography should resemble:

* financial dashboard UI
* enterprise platforms
* modern productivity tools

It should be:

* clean
* compact
* highly legible
* hierarchy-driven

Avoid decorative display fonts.

---

## 12.4 Motion & Animation

Animation should be subtle.

Good uses:

* smooth panel expansion
* unread message highlight fade
* stat change pulse
* end-of-week summary reveal
* progress bar transition

Bad uses:

* bouncing cards
* loud animation loops
* unnecessary particle effects
* arcade-style reward blasts

The interface should feel premium, not needy.

---

# 13. Player Identity Layer

## 13.1 Role Reinforcement

The player is not generic.
The player is **The M&A Rainmaker**.

That identity should occasionally surface in text, reports and commentary.

Examples:

* “Your reputation is helping sustain buyer interest.”
* “The client expects rainmaker-level execution.”
* “The market is taking the process seriously because of who is running it.”

This should be subtle.
Not every screen needs to shout it.

---

## 13.2 Career Fantasy Function

The title strengthens the long-term fantasy of:

* building credibility
* winning mandates
* executing under pressure
* becoming a recognised closer

This matters for emotional continuity.

---

# 14. Responsive Behaviour

## 14.1 Desktop First

The interface should be designed desktop-first.

This is the natural format for:

* inbox
* dashboards
* multi-panel comparison
* deliverables
* action selection

---

## 14.2 Tablet / Narrow Layout

On narrower screens, the same zones can become tabbed or stacked.

But the logical order must remain:

1. top bar
2. inbox
3. actions
4. context
5. summary

Do not redesign the whole product just because the viewport shrinks.
That way madness lies.

---

# 15. Future Expansion Compatibility

The layout must support future systems without structural redesign.

## 15.1 Planned-Compatible Systems

* Career Mode
* Multi-deal pipeline
* Staff allocation conflicts
* Buyer relationship memory
* League tables
* Firm growth
* Reputation system
* Cross-deal inbox threads

---

## 15.2 Design Rule for Expansion

Future systems should plug into existing zones.

Examples:

Multi-deal mode may add deal selector in top bar.

Buyer memory may add deeper thread history in inbox.

Career mode may add dashboard tabs, not replace core screen structure.

---

# 16. Component Inventory

To support front-end implementation, the UI should eventually be broken into reusable components.

Suggested component list:

* DealStatusBar
* ResourcePill
* PhaseBadge
* InboxPanel
* MessageRow
* MessageDetail
* ResponseOptionGroup
* ActionCard
* ActionFilterBar
* DeliverableCard
* DeliverableDetail
* HeadlineFeed
* HeadlineItem
* AlertBanner
* WeeklySummaryPanel
* PhaseCompletionReport
* RiskIndicator
* MomentumIndicator
* ProgressBar
* ComplexityBadge

This keeps the system modular and consistent.

---

# 17. UX Examples by Phase

## 17.1 Phase 0 — Origination / Pitch

Inbox style:

* client introductions
* partner coaching
* founder reactions
* competitor signals

Center workspace:

* pitch-related actions
* narrative-building tasks
* valuation framing

Right panel:

* sector headlines
* comparable transactions
* buyer appetite context

---

## 17.2 Phase 1 — Preparation

Inbox style:

* CFO clarifications
* partner review comments
* client input on narrative
* internal warnings

Center workspace:

* heavy deliverable build
* IM, teaser, model, data room, buyer mapping
* staffing pressure

Right panel:

* strategic buyer movement
* macro financing tone
* sector transaction headlines

---

## 17.3 Later Phases

Inbox becomes more external and sharper:

* buyer questions
* DD pushback
* legal issues
* negotiation pressure
* financing concerns

The same panels still work.
Only the nature of the content shifts.

---

# 18. Final Design Standard

The interface succeeds if, every week, the player can instinctively understand:

* what is coming at them
* what they need to respond to
* what work they can fund
* what is getting better
* what is getting worse

The interface fails if the player feels:

* lost
* spammed
* over-notified
* unclear about consequences
* unsure where to look

The target is a system that feels like an elegant, living, professional M&A workspace.

That is the standard for **The M&A Rainmaker**.

---

# End of Document

```
```
