\# The M\&A Rainmaker

\## UI Component Specification

\### Version 1.0



---



\# 1. Purpose



This document defines the UI component system for \*\*The M\&A Rainmaker\*\*.



It translates the core visual direction, Retro Corporate Noir, into concrete reusable interface patterns suitable for:

\- HTML

\- CSS

\- vanilla JavaScript



The objective is to ensure:

\- visual coherence,

\- implementation consistency,

\- scalable component reuse,

\- strong readability under professional information density,

\- and a UI language that feels both retro-inspired and operationally credible.



This is not a generic SaaS design system.

This is not a casual game HUD.

This is a professional simulation interface with cinematic restraint.



---



\# 2. Design Principles



\## 2.1 Functional Clarity First

Every component must prioritize readability and decision-making clarity.

The player should always understand:

\- what is happening,

\- what matters now,

\- what can be acted upon,

\- and what is at risk.



\## 2.2 Information Density with Breathing Room

The game must support dense workflow information without becoming visually bureaucratic.

Components should feel compact, but not cramped.



\## 2.3 Signal-Based Accent Usage

Accent colour, especially magenta, should not be decorative.

It should signal:

\- active selection,

\- urgency,

\- premium importance,

\- progress momentum,

\- or user intent.



\## 2.4 Modular UI Logic

Each component must be reusable across:

\- inbox,

\- dashboard,

\- bidder management,

\- task systems,

\- event systems,

\- and narrative phase transitions.



\## 2.5 Retro Through Tone, Not Gimmick

The retro identity should come from:

\- contrast,

\- typography,

\- glow,

\- panel geometry,

\- gradients,

\- and subtle system flavour.



Not from novelty effects or nostalgic parody.



---



\# 3. Core Layout Foundations



\# 3.1 Layout Model



The primary UI structure should be built around a desktop-style shell with:



\- top bar,

\- left navigation rail,

\- central content workspace,

\- optional right contextual panel,

\- overlay layer for modals / alerts / phase events.



\### Canonical Structure

\- `App Shell`

&nbsp; - `Topbar`

&nbsp; - `Sidebar`

&nbsp; - `Main Workspace`

&nbsp;   - `Workspace Header`

&nbsp;   - `Workspace Content`

&nbsp; - `Context Panel` optional

&nbsp; - `Overlay Layer`



\## 3.2 Grid Logic

Use a consistent layout grid:

\- desktop first,

\- 12-column content logic internally where needed,

\- spacing driven by tokens,

\- no arbitrary alignment.



Recommended container widths:

\- full app shell width

\- internal content regions max-width constrained when required for readability



\## 3.3 Layering Hierarchy

Recommended z-index hierarchy:



\- Base background

\- Surface panels

\- Elevated panels

\- Dropdowns / tooltips

\- Sticky headers

\- Modals

\- Global alerts / cinematic overlays



Visual depth should come primarily from:

\- tonal contrast,

\- subtle shadow,

\- glow restraint,

\- not exaggerated elevation.



---



\# 4. Component Families



The system should include the following component families:



1\. Structural components

2\. Navigation components

3\. Data display components

4\. Action components

5\. Feedback and state components

6\. Overlay components

7\. Narrative and special-event components



---



\# 5. Structural Components



\# 5.1 App Shell



\## Purpose

Main application wrapper for the game interface.



\## Visual Behaviour

\- Full-screen or near-full-screen layout.

\- Dark atmospheric gradient background.

\- UI surfaces float above background with subtle contrast.



\## Rules

\- Must always preserve visual stability.

\- No shifting of core layout when panels load.

\- Major transitions should occur inside workspace, not by moving shell structure.



---



\# 5.2 Topbar



\## Purpose

Persistent global bar for high-level navigation and player status.



\## Typical Content

\- game title or current save / company name

\- current week / phase indicator

\- player status indicators

\- available cash / budget

\- notifications icon

\- pause / settings / save buttons



\## Visual Style

\- low-height horizontal band

\- darker than workspace panels or equal with border separation

\- subtle bottom border

\- optional faint background noise or glow



\## Behaviour

\- sticky

\- always visible during normal gameplay

\- compact and highly legible



\## Interaction

\- icons use hover glow

\- no oversized buttons

\- critical alerts may appear as pulsing signal badge



---



\# 5.3 Sidebar Navigation



\## Purpose

Primary game mode navigation.



\## Typical Sections

\- Dashboard

\- Inbox

\- Client

\- Team

\- Buyers

\- Tasks

\- Deliverables

\- Market

\- Risks

\- Timeline / Phase Map



\## Visual Style

\- vertical, dark panel

\- narrow but not icon-only by default

\- selected item highlighted with accent colour and subtle glow edge

\- inactive items muted but readable



\## States

\- default

\- hover

\- active

\- alert

\- locked



\## Behaviour

\- active state must be extremely clear

\- some items may show status chips or counts

\- lock state should feel unavailable, not broken



\## Rule

Navigation should feel like enterprise software, not console menus.



---



\# 5.4 Workspace Header



\## Purpose

Defines the active screen context.



\## Typical Content

\- screen title

\- subtitle or phase context

\- breadcrumb or section label

\- key actions

\- optional quick metrics



\## Visual Style

\- high clarity

\- larger title hierarchy

\- may combine serif title and sans subtitle

\- consistent spacing from content below



\## Behaviour

\- static on simple screens

\- sticky on data-heavy screens if useful



---



\# 5.5 Context Panel



\## Purpose

Secondary information panel for contextual details.



\## Use Cases

\- selected buyer details

\- selected email preview

\- task details

\- event explanation

\- phase guidance

\- advisor commentary



\## Visual Style

\- right-side attached panel

\- slightly elevated over workspace

\- narrower than main content

\- clean section separators



\## Behaviour

\- may open/close

\- should not feel like a modal

\- must preserve main workflow continuity



---



\# 6. Navigation Components



\# 6.1 Nav Item



\## Purpose

Single interactive entry inside sidebar or internal navigation lists.



\## Elements

\- icon

\- label

\- optional badge

\- optional alert dot



\## States

\- default

\- hover

\- active

\- disabled

\- critical



\## Design Rules

\- active item uses accent edge, text brightening, and optional background tint

\- hover should be subtle

\- badge colours should obey system logic, not random palette choices



---



\# 6.2 Tab Bar



\## Purpose

Switch between related internal views.



\## Use Cases

\- buyer list / buyer heatmap / buyer detail

\- inbox / sent / flagged

\- deliverables by type

\- market intel / headlines / rumours



\## Visual Style

\- flat or underline-based

\- dark surface

\- active tab signalled with magenta accent or bright line

\- no pill-style bubbly tabs



\## Behaviour

\- fast switching

\- transition may fade content lightly

\- active state must dominate



---



\# 6.3 Breadcrumb



\## Purpose

Support navigation hierarchy in deeper screens.



\## Style

\- small, muted, precise

\- sans-serif

\- separators minimal



\## Rule

Never let breadcrumb visually compete with title.



---



\# 7. Data Display Components



\# 7.1 Panel



\## Purpose

Foundational reusable surface container.



\## Use Cases

\- dashboard modules

\- data blocks

\- inbox sections

\- buyer summaries

\- KPI groups

\- task tables



\## Visual Style

\- dark tonal block

\- restrained border or edge contrast

\- compact internal spacing

\- slight elevation through shadow or glow



\## Variants

\- default panel

\- elevated panel

\- accent panel

\- critical panel



\## Rules

\- use accent panel sparingly

\- use critical panel only for risk or escalation

\- panels should look operational, not decorative



---



\# 7.2 Section Block



\## Purpose

Sub-container inside panels or pages.



\## Use Cases

\- grouped metrics

\- grouped notes

\- buyer sub-sections

\- workstream breakdowns



\## Visual Style

\- lighter separation

\- smaller title

\- optional divider

\- no excessive card-within-card nesting



\## Rule

Avoid nesting too many section blocks inside each other.



---



\# 7.3 Data Table



\## Purpose

Core component for structured information.



\## Use Cases

\- buyer tracking

\- workstream status

\- tasks

\- deadlines

\- diligence requests

\- budget tracking

\- team allocation



\## Style

\- compact rows

\- strong typography hierarchy

\- clear column spacing

\- alternate row shading optional

\- subtle hover highlight

\- sorting indicators minimal



\## Row States

\- default

\- hover

\- selected

\- critical

\- completed

\- inactive



\## Column Types

\- text

\- numeric

\- status

\- owner

\- time/date

\- progress

\- action



\## Rules

\- tables must remain highly legible in dark mode

\- avoid excessive borders

\- use spacing and tonal contrast rather than rigid grid clutter



---



\# 7.4 Data Row Card



\## Purpose

Alternative to table rows for more visual summaries.



\## Use Cases

\- buyer cards

\- event cards

\- deliverable summaries

\- team member status



\## Style

\- horizontal card

\- strong primary label

\- secondary metadata

\- optional status chips

\- optional action zone



\## Behaviour

\- hover lift or glow minimal

\- selection state stronger than hover



---



\# 7.5 KPI Tile



\## Purpose

Display a single high-level metric.



\## Examples

\- deal health

\- client confidence

\- buyer interest

\- team capacity

\- timeline pressure

\- reputation



\## Visual Structure

\- label

\- value

\- optional trend

\- optional sparkline or micro-indicator

\- optional status hint



\## Style

\- compact but prestigious

\- slightly more visual weight than ordinary panels

\- no dashboard toy aesthetic



\## Rules

\- use only where decision value exists

\- avoid stuffing screen with meaningless metrics



---



\# 7.6 Progress Bar



\## Purpose

Represent completion, momentum, pressure, or confidence.



\## Use Cases

\- deliverable progress

\- bidder engagement

\- client trust

\- phase completion

\- risk exposure

\- team energy



\## Variants

\- standard progress

\- segmented progress

\- threshold progress

\- pressure bar



\## Design Rules

\- dark track

\- luminous fill

\- accent or state-based colour depending on meaning

\- labels always visible if critical



\## Rule

Do not use progress bars where discrete statuses are clearer.



---



\# 7.7 Timeline Strip



\## Purpose

Show temporal progress through weeks, milestones, or process stages.



\## Use Cases

\- phase progression

\- deal milestones

\- deadlines

\- key events

\- buyer round advancement



\## Style

\- horizontal structured band

\- milestone nodes

\- active point illuminated

\- delayed or risked items visibly flagged



\## Behaviour

\- hover or click may reveal detail

\- should feel like process control, not decorative chronology



---



\# 7.8 Heatmap / Signal Matrix



\## Purpose

Display comparative intensity across buyers, risks, workstreams, or momentum indicators.



\## Use Cases

\- buyer seriousness vs valuation vs execution risk

\- risk level per workstream

\- team workload map



\## Style

\- grid-based

\- dark base

\- tonal-to-accent colour logic

\- labels always crisp



\## Rule

Heatmaps must remain readable without relying only on colour.



---



\# 8. Text and Messaging Components



\# 8.1 Screen Title



\## Purpose

Primary heading for a screen.



\## Style

\- large

\- high contrast

\- elegant

\- may use display serif in major views



\## Rule

Keep titles short and decisive.



---



\# 8.2 Section Title



\## Purpose

Label major internal regions.



\## Style

\- sans-serif or restrained serif depending on context

\- smaller than screen title

\- uppercase optional if applied consistently



---



\# 8.3 Supporting Text



\## Purpose

Clarify context and reduce ambiguity.



\## Style

\- muted but readable

\- never too faint

\- compact line height



\## Rule

Dark UI often murders secondary text through bad contrast. Do not let it.



---



\# 8.4 Inline Meta Text



\## Use Cases

\- timestamps

\- ownership

\- bidder type

\- status origin

\- short annotations



\## Style

\- small

\- mono or sans depending on function

\- muted but precise



---



\# 9. Action Components



\# 9.1 Primary Button



\## Purpose

Main action in a given context.



\## Examples

\- Send

\- Advance Week

\- Approve

\- Call Buyer

\- Submit Deliverable



\## Style

\- accent colour fill or strong accent border

\- high contrast text

\- restrained glow

\- rectangular with limited radius



\## States

\- default

\- hover

\- active

\- disabled

\- loading



\## Rule

Only one true primary action per area whenever possible.



---



\# 9.2 Secondary Button



\## Purpose

Alternative action with lower priority.



\## Style

\- dark surface

\- border

\- bright text on hover



\## Use Cases

\- Review

\- Open

\- Compare

\- Reassign



---



\# 9.3 Ghost Button



\## Purpose

Low-weight utility action.



\## Use Cases

\- View details

\- Dismiss

\- Expand

\- Open notes



\## Rule

Should not dominate layout.



---



\# 9.4 Icon Button



\## Purpose

Compact utility interaction.



\## Use Cases

\- archive

\- filter

\- settings

\- quick action

\- mark important



\## Style

\- square hit area

\- icon centred

\- hover tint and glow subtle



\## Rule

Never rely on icon-only controls for critical destructive actions without tooltip or label support.



---



\# 9.5 Dropdown



\## Purpose

Compact option selection.



\## Use Cases

\- sort order

\- buyer filter

\- team view

\- difficulty mode

\- week scope

\- scenario filters



\## Style

\- dark elevated surface

\- restrained borders

\- active option highlighted

\- compact line spacing



\## Behaviour

\- open with precision

\- close on outside click

\- keyboard support desirable



---



\# 9.6 Segmented Control



\## Purpose

Switch between a small number of mutually exclusive views.



\## Use Cases

\- list vs board

\- weekly vs monthly

\- internal vs external view



\## Style

\- sharp segmented track

\- active segment highlighted

\- not rounded consumer toggle style



---



\# 10. Input Components



\# 10.1 Text Input



\## Use Cases

\- search

\- naming

\- filtering

\- notes



\## Style

\- dark field

\- subtle border

\- bright caret

\- visible focus ring in accent



\## States

\- default

\- hover

\- focus

\- filled

\- invalid

\- disabled



---



\# 10.2 Search Field



\## Purpose

Search-heavy interaction element.



\## Use Cases

\- buyer search

\- email search

\- task search

\- market lookup



\## Style

\- icon-led

\- slightly wider

\- fast visual feedback



\## Behaviour

\- immediate filtering where appropriate

\- debounced input if needed



---



\# 10.3 Text Area



\## Use Cases

\- internal notes

\- client drafts

\- advisor messages

\- strategy notes



\## Style

\- dark multi-line field

\- comfortable padding

\- clear focus state



\## Rule

Text areas should feel serious and tool-like, not chat-bubbly.



---



\# 10.4 Checkbox



\## Use Cases

\- filters

\- task completion

\- buyer inclusion

\- settings toggles



\## Style

\- square

\- compact

\- accent check or glow when active



---



\# 10.5 Radio Group



\## Use Cases

\- choose negotiation posture

\- choose deliverable style

\- choose phase response



\## Rule

Use when options are mutually exclusive and conceptually important.



---



\# 10.6 Toggle Switch



\## Use Cases

\- enable auto-reminders

\- show hidden metrics

\- lock internal notes



\## Style

\- restrained

\- technical

\- not playful mobile-app style



---



\# 11. Status and Feedback Components



\# 11.1 Status Chip



\## Purpose

Compact categorical state marker.



\## Use Cases

\- Active

\- Delayed

\- High Interest

\- Draft

\- Sent

\- Critical

\- Completed



\## Style

\- compact rectangular pill or sharp chip

\- minimal padding

\- colour-coded but readable

\- optional icon



\## Rule

Keep vocabulary consistent across the game.



---



\# 11.2 Signal Dot



\## Purpose

Tiny state indicator.



\## Use Cases

\- unread

\- urgent

\- active bidder

\- warning

\- available team member



\## Rule

Signal dots are supportive, not sufficient by themselves.



---



\# 11.3 Alert Banner



\## Purpose

Communicate important but non-modal information.



\## Use Cases

\- deadline approaching

\- client concern rising

\- buyer dropped interest

\- diligence issue detected



\## Variants

\- info

\- warning

\- critical

\- success



\## Style

\- horizontal band

\- strong label

\- brief explanation

\- optional action link



---



\# 11.4 Toast / Flash Message



\## Purpose

Transient confirmation or minor update.



\## Use Cases

\- note saved

\- action completed

\- message sent

\- filter applied



\## Rule

Use sparingly. This game should not feel like a mobile app chirping every 12 seconds.



---



\# 11.5 Empty State



\## Purpose

Handle absent data gracefully.



\## Use Cases

\- no emails

\- no buyers shortlisted yet

\- no deliverables pending

\- no risks identified



\## Style

\- elegant

\- minimal

\- informative

\- slightly atmospheric if desired



\## Rule

Empty states should never feel like an error unless it actually is one.



---



\# 12. Overlay Components



\# 12.1 Modal



\## Purpose

Focused interruption for decisions or detail.



\## Use Cases

\- approve action

\- confirm bidder move

\- inspect key event

\- open phase briefing

\- compare offers



\## Style

\- dark elevated panel

\- high contrast backdrop overlay

\- strong title

\- tight action footer



\## Rule

Use for decisions that deserve interruption.

Do not overuse.



---



\# 12.2 Drawer



\## Purpose

Slide-in detailed context without full interruption.



\## Use Cases

\- buyer profile

\- full task info

\- deliverable detail

\- team member detail



\## Style

\- side-mounted elevated surface

\- structured sections

\- optional sticky header



---



\# 12.3 Tooltip



\## Purpose

Clarify icons, statuses, metrics.



\## Style

\- compact

\- dark

\- sharp

\- highly legible



\## Rule

Tooltips should explain, not lecture.



---



\# 12.4 Command Overlay



\## Purpose

Fast navigation or quick action layer.



\## Use Cases

\- jump to section

\- search entity

\- trigger quick operations



\## Mood

Should feel elegant and terminal-adjacent.



---



\# 13. Narrative and Special Components



\# 13.1 Email Card / Inbox Row



\## Purpose

Core component for inbox-driven gameplay.



\## Elements

\- sender

\- subject

\- preview text

\- timestamp

\- priority indicator

\- optional thread count

\- status markers



\## Style

\- professional mail-client-inspired

\- compact row

\- selected row highlighted clearly

\- unread state stronger typography



\## Behaviour

\- click to open preview or full detail

\- hover subtle

\- right-click style menus optional



\## Rule

This component is central to the game fantasy and should be polished obsessively.



---



\# 13.2 Buyer Card



\## Purpose

Represent a bidder as a live strategic entity.



\## Elements

\- buyer name

\- buyer type

\- interest level

\- valuation posture

\- chemistry / trust

\- process status

\- key risk flags



\## Style

\- premium intelligence-card tone

\- strong hierarchy

\- compact strategic summary



\## Variants

\- list card

\- detailed card

\- comparison card



---



\# 13.3 Event Card



\## Purpose

Represent market events, client issues, rumours, internal escalations.



\## Style

\- more atmospheric than standard data card

\- retains discipline

\- may use accent edge or state tint



\## Rule

Event cards should feel consequential.



---



\# 13.4 Deliverable Card



\## Purpose

Represent IM, teaser, management presentation, process letter, DD package, SPA draft, etc.



\## Elements

\- deliverable name

\- owner

\- status

\- quality indicator

\- deadline

\- dependencies



---



\# 13.5 Phase Transition Screen



\## Purpose

Mark movement into a new phase of the process.



\## Mood

This is where the Cinematic Dealroom variant can breathe.



\## Elements

\- phase title

\- short narrative summary

\- key objectives

\- new mechanics unlocked

\- risks introduced



\## Style

\- richer gradient

\- more atmosphere

\- larger type

\- restrained animation



---



\# 13.6 Milestone Result Panel



\## Purpose

Present major outcome snapshots.



\## Examples

\- teaser campaign completed

\- indications received

\- shortlist confirmed

\- diligence issue surfaced

\- SPA agreed

\- deal failed



\## Style

\- elevated

\- dramatic but not melodramatic

\- strong status hierarchy



---



\# 14. Component State Logic



Each interactive component should define at least:



\- default

\- hover

\- active

\- selected

\- disabled

\- loading

\- critical, where relevant



\## State Rules

\- hover = small tonal shift or glow

\- active = stronger contrast and tactile press feel

\- selected = sustained accent logic

\- disabled = visibly unavailable, still legible

\- loading = restrained, not spinner carnival

\- critical = use danger colour carefully, never as decoration



---



\# 15. Content Behaviour Rules



\## 15.1 Hierarchy Rule

Every component must clearly answer:

\- what is primary,

\- what is secondary,

\- what is metadata,

\- what is action.



\## 15.2 Density Rule

The interface should support density, but each cluster must retain visual structure.



\## 15.3 Consistency Rule

A status should look and behave the same across screens.



\## 15.4 Accent Rule

Accent colour is meaningful. Do not dilute its value.



\## 15.5 Darkness Rule

Because the UI is dark, contrast discipline is non-negotiable.



---



\# 16. Accessibility and Readability Rules



Even in a stylized interface, readability is king.



\## Requirements

\- high contrast text

\- clear focus states

\- colour not used as the sole communicator

\- target hit area sufficient for repeated interaction

\- keyboard navigation where feasible

\- state differences visible without perfect vision



Dark mode without discipline becomes decorative murk. Avoid that swamp.



---



\# 17. CSS Architecture Recommendation



Recommended structure:



\- `tokens.css`

\- `base.css`

\- `layout.css`

\- `components/`

&nbsp; - `buttons.css`

&nbsp; - `panels.css`

&nbsp; - `tables.css`

&nbsp; - `forms.css`

&nbsp; - `navigation.css`

&nbsp; - `chips.css`

&nbsp; - `modals.css`

&nbsp; - `cards.css`

&nbsp; - `timeline.css`

&nbsp; - `inbox.css`



Use:

\- CSS variables for all tokens

\- BEM-like or structured class naming

\- utility classes only in moderation

\- component classes as primary system



---



\# 18. Suggested Initial Component Build Order



Build in this order:



1\. App Shell

2\. Topbar

3\. Sidebar

4\. Panel

5\. Button system

6\. Status chip

7\. Data table

8\. Inbox row + email preview

9\. Buyer card

10\. Modal / drawer

11\. KPI tile

12\. Timeline strip

13\. Event card

14\. Phase transition screen



This sequence creates a usable vertical slice quickly.



---



\# 19. Visual Quality Bar



A component is ready only if it satisfies all of the following:

\- readable at a glance

\- visually coherent with the Retro Corporate Noir system

\- clearly stateful

\- implementation-friendly

\- reusable

\- useful under repeated gameplay loops



If a component looks attractive but weakens decision clarity, it fails.

If it is clear but visually generic, it also fails.

The target is disciplined style with operational credibility.



---



\# 20. Final UI System Statement



The component system of \*\*The M\&A Rainmaker\*\* must feel like a premium late-night M\&A operating interface: dark, sharp, calm, pressurized, and unmistakably professional, with retro-futuristic undertones expressed through hierarchy, glow, typography, and controlled signal colour.

