# The M&A Rainmaker — Master Documentation Index

## A. Project Overview
**The M&A Rainmaker** is a comprehensive, simulation-driven sell-side Mergers & Acquisitions game. The repository contains multiple documentation layers charting the mechanics, phases, user interface, and narrative worldbuilding of the game.

**CRITICAL PRESERVATION NOTE:** 
All files in this repository represent a chronological and structural evolution of the game’s design. **NO FILES SHOULD BE DELETED.** Overlapping files represent iterative design phases or alternative perspectives. They are preserved intentionally to maintain the project's memory and ensure no logic is lost during implementation. If a file is superseded, it is marked as *Legacy* in this index, but it must remain in the repository.

---

## B. Canonical Reading Order
For a new collaborator, LLM, or developer seeking to understand the architecture of the game, read the documentation in the following sequence:

1. **`01_MA_Game_Narrative_Context.md`** (What is this game and who is the player?)
2. **`The_MA_Rainmaker_Core_Game_Loop.md`** (How is the game fundamentally played?)
3. **`06_MA_Game_Phase_Architecture.md`** (What are the 10 stages of the game?)
4. **Core Systems `02` through `05`** (How do tasks, events, and variables work?)
5. **The `By Phase\` Collection** (Detailed, procedural logic for Phases 0 through 9)
6. **`MA_Game_UI_UX_Design.md` & `08_MA_Game_Main_Screens_Spec.md`** (Visual philosophy and screen mapping)
7. **Screen Specifications `10` through `20`** (Detailed UI blueprints)
8. **Worldbuilding Reference Files** (Lore, naming logic, and buyer generation)

---

## C. File-by-File Index & Architecture

### 1. Core Project Context & Worldbuilding
Files establishing the premise, narrative tone, and procedural generation logic.

* **`01_MA_Game_Narrative_Context.md`**
  * *Purpose*: Establishes the narrative premise, player role, and overarching themes.
  * *Status*: **Core Reference**
* **`The_MA_Rainmaker_Core_Game_Loop.md`**
  * *Purpose*: Explains the high-level cycle of actions, phases, and resource consumption.
  * *Status*: **Core Reference**
* **`The_MA_Rainmaker_Naming_and_Worldbuilding_Framework.md`**
  * *Purpose*: Ground rules for naming, tone, and setting generation.
  * *Status*: **Supporting**
* **`The_MA_Rainmaker_Procedural_Naming_Library_v1.md`**
  * *Purpose*: Tables and arrays for procedural name generation (companies, people).
  * *Status*: **Reference**
* **`The_MA_Rainmaker_Recurring_Institutions_and_Marquee_Firms.md`**
  * *Purpose*: Lore regarding banks, private equity funds, and law firms.
  * *Status*: **Core Reference**
* **`The_MA_Rainmaker_Buyer_Generation_Framework_v1.md`**
  * *Purpose*: Algorithmic logic for generating buyer archetypes and behaviors.
  * *Status*: **Core Reference**

---

### 2. System Design
Files detailing the underlying mathematical and procedural mechanics of the simulation engine.

* **`02_MA_Game_Task_System.md`**
  * *Purpose*: Core mechanics of consuming Budget and Team Capacity.
  * *Status*: **Core Reference**
* **`03_MA_Game_Workstreams_System.md`**
  * *Purpose*: Logic defining workstream progression, quality delays, and outputs.
  * *Status*: **Core Reference**
* **`04_MA_Game_Event_System.md`**
  * *Purpose*: The game's random and triggered event architecture.
  * *Status*: **Core Reference**
* **`05_MA_Game_Risk_Outcome_System.md`**
  * *Purpose*: Post-game outcome integrity and risk debt accumulation tracking.
  * *Status*: **Core Reference**
* **`06_MA_Game_Phase_Architecture.md`**
  * *Purpose*: Master document mapping the structural pipeline from Origin to Close.
  * *Status*: **Core Reference**
* **`MA_Game_Action_Library_Phase0_Phase1.md`**
  * *Purpose*: Action schema catalog and initial phase concrete actions.
  * *Status*: **Core Reference**

---

### 3. Phase Design (The Implementation Packs)
Located in the `By Phase\` directory. These files contain the deepest level of procedural logic and vanilla JS-ready architecture for each stage of the deal.

* **`By Phase\MA_Game_PHASE_0.md`** - Phase 0 (Pitch & Origination)
  * *Status*: **Core System Pack**
* **`By Phase\MA_Game_PHASE_1.md`** - Phase 1 (Preparation)
  * *Status*: **Core System Pack**
* **`By Phase\MA_Game_PHASE_2.md`** - Phase 2 (Market Outreach)
  * *Status*: **Core System Pack**
* **`By Phase\MA_Game_PHASE_3.md`** - Phase 3 (Shortlist)
  * *Status*: **Core System Pack**
* **`By Phase\MA_Game_PHASE_4.md`** - Phase 4 (Non-Binding Offers)
  * *Status*: **Core System Pack**
* **`By Phase\MA_Game_PHASE_5.md`** - Phase 5 (Due Diligence)
  * *Status*: **Core System Pack**
* **`By Phase\MA_Game_PHASE_6.md`** - Phase 6 (Final Offers)
  * *Status*: **Core System Pack**
* **`By Phase\MA_Game_PHASE_7.md`** - Phase 7 (SPA Negotiation)
  * *Status*: **Core System Pack**
* **`By Phase\MA_Game_PHASE_8.md`** - Phase 8 (Signing)
  * *Status*: **Core System Pack**
* **`By Phase\MA_Game_PHASE_9.md`** - Phase 9 (Closing & Execution)
  * *Status*: **Core System Pack (Canonical Conclusion)**
* **`By Phase\MA_Game_PHASE_10.md`** - Phase 10 (Final Execution)
  * *Purpose*: Earlier design iteration isolating the specific wire-fund mechanics.
  * *Status*: **Legacy but safely preserved.** *(Note: All relevant mechanical logic from this file has been absorbed into the revised `Phase_9.md`, which is now the canonical endgame).*

---

### 4. UI / UX / Visual Design
Files establishing how the simulation looks, feels, and organizes information.

* **`MA_Game_UI_UX_Design.md`**
  * *Purpose*: Master visual and interaction design philosophy.
  * *Status*: **Core Reference**
* **`The_MA_Rainmaker_Art_direction_Spec.md`**
  * *Purpose*: Aesthetic, color palette, and thematic styling.
  * *Status*: **Core Reference**
* **`07_MA_Game_UI_Component_Spec.md`**
  * *Purpose*: Technical styling spec for individual components (buttons, panels, typography).
  * *Status*: **Core Reference**
* **`08_MA_Game_Main_Screens_Spec.md`**
  * *Purpose*: High-level overview of the screen architecture and navigation routing.
  * *Status*: **Core Reference**
* **`09_MA_Game_Screen_Wireframes.md`**
  * *Purpose*: ASCII layout visualizers for primary views.
  * *Status*: **Core Reference**

---

### 5. Screen Component Specifications
Detailed blueprints for the specific React/Vanilla JS views.
*(Status: All marked as **Core System Specs**)*

* **`10_MA_Game_Inbox_Screen_Spec.md`**
* **`11_MA_Game_Dashboard_Screen_Spec.md`**
* **`12_MA_Game_Buyers_Screen_Spec.md`**
* **`13_MA_Game_Tasks_Screen_Spec.md`**
* **`14_MA_Game_Deliverables_Screen_Spec.md`**
* **`15_MA_Game_Risks_Screen_Spec.md`**
* **`16_MA_Game_Timeline_Screen_Spec.md`**
* **`17_MA_Game_Client_Screen_Spec.md`**
* **`18_MA_Game_Team_Screen_Spec.md`**
* **`19_MA_Game_Market_Screen_Spec.md`**
* **`20_MA_Game_Progression_Events_Screen_Spec.md`**

---

### 6. Legacy / Iteration / Reference Files
Files kept for project memory ensuring no historical logic or early-draft momentum is lost.

* **`Canonical_Systems_Spec_v1.md`**
  * *Purpose*: An older, unified monolithic systems design document representing an earlier iteration of the simulation's math rules.
  * *Status*: **Legacy (Preserved)** *(Note: Superseded by the `02` through `06` numbered system files).*
* **`changes\walkthrough.md`**
  * *Purpose*: Work logs of the LLM/Developer's implementation of the Action system.
  * *Status*: **Process Reference**
