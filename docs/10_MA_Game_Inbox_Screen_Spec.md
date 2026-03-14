\# The M\&A Rainmaker

\## Inbox Screen Specification

\### Version 1.0



---



\# 1. Purpose



This document defines the detailed screen specification for the \*\*Inbox\*\* in \*\*The M\&A Rainmaker\*\*.



The Inbox is one of the most important screens in the game and should function as:



\- a primary decision intake system,

\- a professional communication hub,

\- a gameplay pacing engine,

\- and a narrative delivery surface for transaction tension.



This is not a decorative mailbox.

This is a core gameplay instrument.



The Inbox is where the player experiences the living pressure of the process through:

\- client demands,

\- bidder signals,

\- internal team friction,

\- legal and diligence issues,

\- market noise,

\- strategic opportunities,

\- and time-sensitive decisions.



---



\# 2. Screen Design Intent



The Inbox should feel like:



\- a premium late-night professional mail client,

\- a disciplined transaction command surface,

\- a place where small signals can become major consequences,

\- and a credible operating environment for a sell-side M\&A advisor.



It should visually sit between:

\- \*\*Outlook Noir\*\*, for usability and workflow realism,

\- and \*\*Terminal Prestige\*\*, for statefulness, signal logic, and strategic density.



The mood should be:

\- calm on the surface,

\- tense underneath,

\- elegant,

\- clear,

\- and operationally addictive.



---



\# 3. Gameplay Role



\# 3.1 Core Role

The Inbox is one of the central engines of the weekly gameplay loop.



It performs five major functions:



1\. delivers new information,

2\. frames urgency,

3\. presents decisions,

4\. links entities and systems,

5\. creates rhythm between planning and reaction.



\# 3.2 What Happens in the Inbox

Through the Inbox, the player should:

\- receive messages,

\- review and interpret them,

\- decide what matters,

\- route issues,

\- trigger follow-up actions,

\- and manage competing pressures.



\# 3.3 Why the Inbox Matters

The Inbox is where the simulation becomes emotionally legible.



A buyer does not just lose momentum in an abstract dashboard.

A buyer sends a message that arrives at 22:46 with a subtle shift in tone.



A client does not just lose confidence numerically.

A client sends a short, tense email asking why nobody has yet updated them on bidder feedback.



That is the good stuff. Civilised dread, professionally formatted.



---



\# 4. Primary Player Questions



The Inbox screen must answer these questions immediately:



\- What is new?

\- What is urgent?

\- What requires a decision?

\- Which entities are involved?

\- What will happen if I ignore this?



If the player has to excavate this information like an archaeologist in a spreadsheet tomb, the screen has failed.



---



\# 5. Functional Objectives



The Inbox must support all of the following:



\- fast triage of incoming messages,

\- clear distinction between categories,

\- message reading with context,

\- decision-taking directly from message view,

\- conversion of messages into actions,

\- cross-navigation to related systems,

\- signalling of consequences and urgency,

\- phase-sensitive communication logic,

\- and support for both routine and major narrative moments.



---



\# 6. Screen Architecture



\# 6.1 Canonical Layout



The Inbox should use a three-pane desktop structure inside the standard application shell:



\- Topbar

\- Sidebar

\- Inbox Workspace



Inside the Inbox Workspace:



\- Workspace Header

\- Inbox Toolbar

\- Message List Pane

\- Message Preview Pane

\- Optional Related Context Pane



\# 6.2 Pane Logic



\## Left Pane

Message List  

Purpose: triage and selection.



\## Centre Pane

Message Preview  

Purpose: reading, interpretation, decision and action.



\## Right Pane, optional

Related Context  

Purpose: linked entity intelligence and downstream awareness.



This structure is the correct skeleton. It is robust, legible, and deeply on-brand for the kind of fantasy the game wants to create.



---



\# 7. Spatial Layout Specification



\# 7.1 Desktop Layout Ratios



Recommended internal width distribution:



\- Message List Pane: 32%

\- Message Preview Pane: 48%

\- Context Pane: 20%, optional



When Context Pane is closed:

\- Message List Pane: 36%

\- Message Preview Pane: 64%



\# 7.2 Minimum Behaviour Rules

\- Message List must remain usable without truncating core scanning fields.

\- Preview Pane must comfortably support long-form reading.

\- Context Pane must never crowd the preview so hard that reading becomes unpleasant.

\- Pane resizing is optional but desirable in later versions.



\# 7.3 Vertical Structure

From top to bottom:



1\. Workspace Header

2\. Toolbar / filters

3\. Main pane area

4\. Optional sticky action footer inside preview pane



---



\# 8. Workspace Header



\# 8.1 Purpose

Establish screen identity and current inbox context.



\# 8.2 Content

Left side:

\- Screen title: `Inbox`

\- Secondary line: current week + current phase + message summary



Right side:

\- quick summary counters

\- optional quick action buttons



\# 8.3 Header Summary Examples

Examples of secondary line:

\- `Week 7 · Phase 2 · 18 messages · 4 unread · 2 urgent`

\- `Week 11 · Phase 4 · Buy-side pressure increasing`



\# 8.4 Header Actions

Possible actions:

\- Review Urgent

\- Open Flagged

\- Toggle Context Pane

\- Convert Selected to Task, if selection model supports it



\# 8.5 Behaviour

\- Header remains fixed at top of workspace.

\- Must be concise.

\- Must not consume excessive vertical space.



---



\# 9. Inbox Toolbar



\# 9.1 Purpose

Allow triage, filtering and sorting without clutter.



\# 9.2 Layout

Toolbar should be a horizontal control band immediately below the header.



Left group:

\- Search field

\- Category tabs



Right group:

\- Sort dropdown

\- Priority filter

\- Read / unread filter

\- Flagged filter

\- Compact / expanded density toggle, optional later



\# 9.3 Category Tabs

Recommended categories:

\- All

\- Client

\- Internal

\- Buyers

\- Market

\- Legal / Issues



Optional additional categories later:

\- Board

\- Finance

\- Data Room

\- System



\# 9.4 Sort Options

Recommended sorts:

\- Most Recent

\- Urgency

\- Unread First

\- Sender

\- Entity

\- Decision Required



\# 9.5 Filter Rules

The toolbar must make it easy to isolate:

\- urgent items,

\- unread items,

\- a specific entity type,

\- decision-triggering emails,

\- and internal vs external flow.



\# 9.6 Search Behaviour

Search should include:

\- sender name,

\- subject,

\- body preview text,

\- linked entity names,

\- tags or classifications.



Debounced live filtering is preferable.



---



\# 10. Message List Pane



\# 10.1 Purpose

Provide fast scannable triage of message traffic.



\# 10.2 Pane Structure

From top to bottom:

\- optional subheader or result count

\- scrollable message list

\- optional sticky group markers



\# 10.3 Message Row Information Model

Each row should include:



Primary line:

\- sender name

\- timestamp



Secondary line:

\- subject



Tertiary line:

\- short preview text



Additional markers:

\- category marker

\- unread status

\- urgency level

\- linked entity icon or chip

\- thread count, if applicable

\- decision-required marker, if applicable



\# 10.4 Message Row Visual Hierarchy

Order of perceptual importance:

1\. unread and urgency state

2\. sender

3\. subject

4\. timestamp

5\. category / entity markers

6\. preview line



\# 10.5 Message Categories

Messages should be clearly classified, for example:

\- Client

\- Buyer

\- Internal Team

\- Legal

\- Market Intel

\- Diligence

\- System / Phase



Each category should have:

\- a label,

\- an icon or marker,

\- and possibly a subtle tint logic.



Do not over-colour this. The user is here to think, not to be attacked by confetti.



\# 10.6 Message Row States

Each message row must support:



\- default

\- hover

\- selected

\- unread

\- urgent

\- flagged

\- resolved / archived, if shown

\- decision-required



Combinations must also work, for example:

\- unread + urgent

\- selected + flagged

\- urgent + decision-required



\# 10.7 Unread Behaviour

Unread items should be immediately visible through:

\- stronger text weight,

\- brighter text colour,

\- signal marker,

\- and potentially a subtle edge accent.



Unread should not mean “maybe slightly bolder if you squint”.



\# 10.8 Urgent Behaviour

Urgent messages should be distinguished through:

\- urgency chip or icon,

\- stronger signal colour,

\- possible priority ordering,

\- and optional pulse in extreme cases only.



Use animation very sparingly.



\# 10.9 Decision-Required Behaviour

Some emails are not just informative.

They contain a choice or demand response.



These should be marked with:

\- `Decision Required`

\- or a compact equivalent badge.



This is one of the most important gameplay markers in the entire screen.



\# 10.10 Message Grouping, optional

Later versions may support grouping by:

\- Today

\- Yesterday

\- Earlier this week

\- Phase event

\- Entity cluster



Initial version can remain a flat sorted list.



---



\# 11. Message Preview Pane



\# 11.1 Purpose

This is the main reading and action surface of the Inbox.



\# 11.2 Structure

The preview pane should contain:



1\. Message Header Block

2\. Linked Entity Strip

3\. Message Body

4\. Attachments / References

5\. Decision \& Action Panel

6\. Consequence / Interpretation Area, optional

7\. Internal Note Area, optional later



\# 11.3 Message Header Block

Should contain:

\- sender

\- recipients or routing context

\- subject

\- timestamp

\- classification

\- thread information



Optional:

\- entity portrait/icon

\- buyer/client badge

\- phase relevance tag



\# 11.4 Linked Entity Strip

A compact strip below the header showing links such as:

\- Buyer: House Atreides Capital

\- Client: Project Kraken

\- Task: Finalise teaser feedback

\- Deliverable: IM draft v2

\- Risk: Client expectation mismatch



Each should be clickable.



This strip is critical because it makes the Inbox feel integrated with the rest of the game instead of being a lonely island of formatted anxiety.



\# 11.5 Message Body

The body should support:

\- plain structured message text

\- short paragraphs

\- bullet points where appropriate

\- quoted responses or thread history, optionally in later versions

\- highlighted key phrases if needed for major events



The reading experience must be comfortable.

Good line-height, good spacing, no visual suffocation.



\# 11.6 Attachments / References

Where relevant, show:

\- attachment list

\- linked deliverables

\- linked data room items

\- linked prior message or thread



Examples:

\- `Attachment: Updated bidder feedback pack`

\- `Linked deliverable: Management Presentation v3`

\- `Reference: Buyer call notes`



\# 11.7 Action Panel

This is where the player acts on the message.



Core actions may include:

\- Reply

\- Delegate

\- Escalate

\- Convert to Task

\- Mark Important

\- Open Linked Entity

\- Archive / Dismiss

\- Choose Response Option, if branching event



The actions shown should depend on message type.



Example:

A routine internal update does not need the same action set as a client escalation or buyer threat.



\# 11.8 Consequence / Interpretation Area

This is optional, but highly valuable.



It can present:

\- likely consequence if ignored,

\- a short advisor-style interpretation,

\- or key state implications.



Examples:

\- `Ignoring this may reduce client confidence next week.`

\- `This bidder is signalling interest, but also pushing for process control.`

\- `Delaying response could increase legal risk.`



This helps the player understand meaning without flattening the game into crude hand-holding.



\# 11.9 Empty Preview State

If no message is selected:

\- show a refined empty state

\- such as: `Select a message to review current communications.`



Should feel elegant, not broken.



---



\# 12. Related Context Pane



\# 12.1 Purpose

Provide linked intelligence without forcing the player to leave the Inbox.



\# 12.2 When It Appears

The pane may:

\- remain collapsed by default,

\- open when relevant,

\- or be manually toggled.



\# 12.3 Possible Modules Inside Context Pane

Depending on selected message, show one or more of:



\- Buyer Summary Card

\- Client Mood Card

\- Linked Task Snapshot

\- Deliverable Readiness

\- Risk Summary

\- Communication History

\- Suggested Actions

\- Thread Map, later version



\# 12.4 Buyer Summary Card Example

Could include:

\- buyer name

\- interest level

\- process phase

\- valuation posture

\- seriousness

\- main risk flags



\# 12.5 Client Mood Card Example

Could include:

\- confidence level

\- current stress level

\- top concern

\- last major interaction

\- expectation gap warning



\# 12.6 Behaviour Rule

The context pane must support the preview, not compete with it.



If it becomes a second inbox shouting across the room, it has become a nuisance.



---



\# 13. Message Types



\# 13.1 Core Message Types

The system should support at least these message types:



\- Informational

\- Warning

\- Escalation

\- Decision Request

\- Narrative Event

\- Deliverable Feedback

\- Buyer Signal

\- Client Pressure

\- Internal Coordination

\- Legal / Diligence Issue



\# 13.2 Message Type Logic

Each message type should influence:

\- row styling,

\- available actions,

\- urgency defaults,

\- linked context,

\- and possible downstream consequences.



\# 13.3 Example Distinctions

\## Informational

\- low urgency

\- read and move on

\- may update state silently



\## Warning

\- medium to high urgency

\- potential future consequence

\- may convert to task or risk



\## Escalation

\- immediate attention

\- usually tied to client, team or diligence breakdown



\## Decision Request

\- explicit branching choice

\- should present options clearly



\## Buyer Signal

\- may be ambiguous

\- player must interpret seriousness and intent



---



\# 14. Action System Inside Inbox



\# 14.1 Action Philosophy

Actions should feel specific, professional and consequential.



Do not use vague gamey actions like:

\- “Do thing”

\- “Boost confidence”

\- “Manage issue”



Use language grounded in transaction work.



\# 14.2 Core Action Types

Recommended core actions:

\- Reply

\- Acknowledge

\- Delegate to Team

\- Escalate Internally

\- Request Clarification

\- Convert to Task

\- Open Buyer

\- Open Client

\- Open Deliverable

\- Flag for Review

\- Defer

\- Ignore, only where logical



\# 14.3 Branching Response Actions

For key emails, the preview may show direct branching options.



Example:

Client email asks whether to accelerate outreach.

Possible options:

\- Accelerate outreach immediately

\- Maintain current sequencing

\- Call client before deciding



These should appear as explicit decision buttons or response cards.



\# 14.4 Action Placement

Hierarchy:

\- primary action near bottom right or in clear action block

\- secondary actions nearby

\- low-priority utilities in overflow menu or secondary row



\# 14.5 Action Feedback

After action, the UI should clearly indicate:

\- what happened,

\- whether the message changed state,

\- and whether linked systems were affected.



Examples:

\- `Task created and assigned to Analyst.`

\- `Client confidence unchanged.`

\- `Buyer flagged for follow-up.`



---



\# 15. Consequence Design



\# 15.1 Why Consequences Matter

Inbox actions must affect the game.



Otherwise the Inbox becomes a stylish prop with no teeth, and nobody respects a prop.



\# 15.2 Types of Consequences

Message handling may influence:

\- client confidence

\- buyer interest

\- buyer trust

\- team load

\- risk level

\- deliverable quality

\- process delay

\- market perception

\- shortlist logic

\- phase progression pacing



\# 15.3 Direct vs Delayed Consequences

Some consequences should happen immediately.

Others should emerge later.



\## Immediate

\- message marked resolved

\- task created

\- buyer flagged

\- trust change



\## Delayed

\- bidder loses patience next week

\- client becomes more demanding

\- legal issue escalates

\- internal bottleneck worsens



\# 15.4 Consequence Visibility

The player should not always see the full internal math.

But they should understand enough to form a mental model.



This balance matters.

Too visible, and the system becomes mechanical.

Too hidden, and it becomes arbitrary goblin sorcery.



---



\# 16. UX States



\# 16.1 Standard States

The Inbox must support:

\- empty inbox

\- no results from filters

\- no message selected

\- loading state

\- selected message state

\- action in progress state

\- error state, if applicable



\# 16.2 Empty Inbox State

Example:

\- `No messages in this view.`

\- optional supporting text:

&nbsp; `Current communications are under control.`



\# 16.3 No Filter Results State

Example:

\- `No messages match current filters.`



\# 16.4 Loading State

Should be restrained:

\- skeleton rows

\- muted content placeholders

\- subtle shimmer optional



No circus spinners.



\# 16.5 Error State

If any system issue occurs:

\- clear message

\- retry option

\- non-breaking language



---



\# 17. Density Modes, Optional Later



The Inbox could later support:

\- Compact mode

\- Comfortable mode



\## Compact

More rows visible, less preview spacing.



\## Comfortable

More breathing room, easier reading.



Initial version can stay with one tuned density.



---



\# 18. Keyboard and Efficiency Behaviour



\# 18.1 Why It Matters

A workflow-heavy screen benefits from efficient navigation.



\# 18.2 Recommended Keyboard Support, later phase

\- up/down to move through messages

\- enter to open / focus selected message

\- slash `/` to focus search

\- `f` to flag

\- `r` to reply

\- `t` to convert to task

\- escape to close context or modal



Not essential for first build, but very desirable later.



---



\# 19. Accessibility Rules



\# 19.1 Contrast

\- unread vs read must be distinguishable

\- urgency must not rely only on colour

\- decision-required must not rely only on colour

\- all important text must meet strong contrast standards



\# 19.2 Click Targets

\- message rows must have comfortable click zones

\- action buttons must not be cramped

\- filter controls must be usable repeatedly without irritation



\# 19.3 Semantic Clarity

Icons should be supported by text where meaning is important.



Dark elegant UI has a bad habit of becoming self-satisfied mush unless disciplined.



---



\# 20. Visual Style Guidance for This Screen



\# 20.1 Dominant Variant

The Inbox should primarily use \*\*Outlook Noir\*\*.



\# 20.2 Supporting Variant

Use elements of \*\*Terminal Prestige\*\* for:

\- signal markers,

\- metadata,

\- timestamps,

\- linked system status,

\- decision-state clarity.



\# 20.3 Visual Rules

\- rows clean and compact

\- preview pane slightly calmer and more spacious

\- accent colour reserved for selected state, urgency, and major action

\- subtle divider logic

\- restrained glow

\- very clear text hierarchy



\# 20.4 Typographic Guidance

\- sender and subject in UI sans

\- timestamps and meta in mono or restrained small sans

\- major message subject can use slightly elevated weight or size

\- avoid overusing serif here, except perhaps in rare phase-event or high-drama messages



The Inbox is a working screen, not an opera programme.



---



\# 21. Example Content Scenarios



\# 21.1 Client Pressure Email

Row markers:

\- Client

\- Unread

\- Urgent

\- Decision Required



Preview actions:

\- Reply now

\- Schedule call

\- Delegate update preparation



Related context:

\- client confidence

\- last communication

\- current unresolved concerns



\# 21.2 Buyer Ambiguity Email

Row markers:

\- Buyer

\- Important

\- Moderate urgency



Preview actions:

\- Respond positively

\- Hold position

\- Ask for clarification

\- Open buyer profile



Related context:

\- interest level

\- chemistry

\- valuation posture

\- shortlist probability



\# 21.3 Internal Team Escalation

Row markers:

\- Internal

\- Warning



Preview actions:

\- Reassign task

\- Escalate

\- Open workstream

\- Convert to issue



Related context:

\- team load

\- overdue task

\- blocked dependency



\# 21.4 Legal Issue Email

Row markers:

\- Legal / Issues

\- Urgent

\- Decision Required



Preview actions:

\- Escalate to counsel

\- Inform client

\- Delay response

\- Open risk register



Related context:

\- issue severity

\- affected buyer or document

\- mitigation status



---



\# 22. Integration With Other Systems



\# 22.1 Linked Systems

The Inbox must connect cleanly with:

\- Client screen

\- Buyers screen

\- Tasks \& Workstreams

\- Deliverables

\- Risks \& Issues

\- Timeline / Phase Map



\# 22.2 Typical Cross-System Flows

Examples:

\- email becomes task

\- buyer email updates buyer heat

\- client complaint increases risk score

\- diligence request opens deliverable dependency

\- legal warning creates issue entry

\- phase event email unlocks new objective



\# 22.3 Design Rule

The Inbox should feel like a nerve centre, not an isolated module.



---



\# 23. Initial Build Scope



For first playable implementation, include:



\- header

\- toolbar

\- message list

\- preview pane

\- category filters

\- unread / urgent / decision-required states

\- linked entity strip

\- core actions:

&nbsp; - Reply

&nbsp; - Delegate

&nbsp; - Convert to Task

&nbsp; - Open Linked Entity

&nbsp; - Flag

\- optional basic context pane

\- basic consequence text for key messages



This is enough to create a real playable loop.



---



\# 24. Future Enhancements



Possible later enhancements:

\- threaded conversations

\- message drafting mini-system

\- saved filters

\- keyboard shortcuts

\- AI-style advisor interpretation layer

\- relationship history panel

\- message snooze / defer

\- internal notes pinned to thread

\- communication style tracking per stakeholder

\- hidden-information or misdirection mechanics



These are valuable, but not required for the first serious version.



---



\# 25. Final Screen Statement



The Inbox of \*\*The M\&A Rainmaker\*\* must feel like a premium, high-pressure transaction communication system where information, tone, urgency, and consequence converge. It should be elegant, dense, readable, and deeply integrated into the simulation, turning professional communication into one of the main instruments of gameplay, tension, and process control.

