\# M\&A Dealmaker — Narrative \& Simulation Framework Context



\## Purpose of this document



This document provides the context required to continue designing the \*\*narrative and simulation structure\*\* of a strategic management game based on the \*\*sell-side M\&A process\*\*.



The goal is to iteratively construct the \*\*operational narrative of M\&A transactions phase by phase\*\*, in a way that is compatible with a \*\*generic simulation engine\*\* that can also support other management games (e.g. restaurant management, football manager, project management).



This document should be used as the \*\*starting prompt for further design sessions\*\*.



---



\# Core Concept of the Game



The game simulates the professional life of an \*\*M\&A advisor\*\* managing deal processes, teams, and pipeline over time.



The player’s goal is to:



\- originate deals

\- win mandates

\- execute transactions

\- maximize accumulated capital



The simulation must capture the \*\*uncertainty, timing pressure, and resource constraints\*\* typical of real M\&A processes.



Deals can fail at multiple stages.



---



\# Game Modes



\## Workshop Mode



Pedagogical mode.



Characteristics:



\- only one active project

\- focus on understanding the M\&A process

\- simplified resource management



Goal: learn how deals unfold.



---



\## Career Mode



Full simulation.



Characteristics:



\- multiple deals simultaneously

\- pipeline management

\- team hiring and staffing

\- financial management of the advisory firm



Goal: maximize long-term capital and reputation.



---



\# Career Cycles



The game can be played over different time horizons.



3-year cycle  

5-year cycle  

10-year cycle



---



\# Rainmaker Status



Optional achievement.



Success rate required:



3-year cycle → 100% deal success  

5-year cycle → ≥ 85% success  

10-year cycle → ≥ 75% success  



Success rate = deals closed / mandates signed.



---



\# Macro Phases of the M\&A Process



The game models the full sell-side process.



0. Deal Origination  

1. Pitch / Mandate Acquisition  

2. Preparation  

3. Market Outreach  

4. IM Distribution & Bidder Engagement  

5. NBO Analysis, Short Listing & DD Entry  

6. Due Diligence  

7. BO / BAFO  

8. SPA Negotiation  

9. Signing  

10. Closing



Deals may fail in several phases, including late stages.

The process is designed as a delicate progression from **Origination (Phase 0)**, where everything is highly qualitative and relationship-driven, down towards **Due Diligence (Phase 6)** and **BO/BAFO (Phase 7)**, where the process becomes highly quantitative and legally binding. 

Phase 7 (BO/BAFO) typically represents the most stressful period for an advisor. It requires balancing multiple aggressive bidders, mitigating suddenly uncovered risks, and ensuring the seller’s valuation expectations are mathematically supported by the final binding offers. Failure at these later stages carries a devastating reputational cost.

---

\# Simulation Engine — Core Architecture



The game engine runs on a \*\*repeating operational cycle\*\*.



\## Simulation Loop



Each cycle contains:



1\. Events / Information  

2\. Player Decisions  

3\. Resource Allocation  

4\. Execution  

5\. Outcome Resolution  

6\. State Update



---



# Two-Layer Decision Model

Player decisions occur in two steps.

## Step 1 — Action Execution

The player selects actions from the unified **Action System** (detailed in `MA_Game_Action_Library_Phase0_Phase1.md`). 

Actions are NOT limited by a discrete number of actions per turn. Instead, they are realistically constrained by two finite resources: 
* **Budget** (Financial Autonomy)
* **Team Capacity** (Work Units). 

Every action dynamically consumes these resources, meaning the player must mathematically balance what the firm can achieve each week.

\- analyze valuation

\- map potential buyers

\- run a conflict check

\- prepare a pitch



This creates \*\*tasks\*\*.



Tasks do not immediately consume resources.



---



\## Step 2 — Execute Work (Execution)



The player decides \*\*how the work is executed\*\*.



Options include:



\- internal team

\- outsourcing

\- delay

\- automation

\- cancellation



Execution consumes resources.



---



\# Resources in the Simulation



The game models four core organizational resources.



\## 1. Time



Human capacity.



Measured in hours of:



\- Partner

\- Associate

\- Analyst



Example:



Partner → 6 productive hours/day  

Associate → 7 hours/day  

Analyst → 7 hours/day



---



\## 2. Money



Operational budget.



Used for:



\- outsourcing work

\- hiring staff

\- purchasing data

\- travel

\- research



Financial discipline affects runway.



---



\## 3. Organizational Capacity



Size and skill of the team.



Includes:



\- number of employees

\- expertise

\- efficiency

\- workload pressure



Overload reduces morale and efficiency.



---



\## 4. Relational Capital



Reputation and network.



Influences:



\- deal sourcing

\- access to founders

\- buyer engagement

\- success probability in pitches



---



\# Tasks vs Workstreams



Important conceptual distinction.



\## Tasks



Concrete activities performed by the team.



Examples:



\- prepare valuation analysis

\- map buyer universe

\- prepare founder meeting

\- conflict check



Tasks consume resources.



---



\## Workstreams



Dimensions of progress in a deal.



Workstreams accumulate progress over time.



Example workstreams in Origination:



\- Target Intelligence

\- Relationship Development

\- Qualification

\- Valuation Framing

\- Confidentiality \& Conflicts

\- Pitch Readiness



Tasks contribute progress to workstreams.



---



\# Task Structure



Each task has three components.



\## Inputs



Resources required.



Examples:



\- hours of staff

\- financial cost

\- skills



---



\## Outputs



Effects produced.



Examples:



\- progress in workstreams

\- improved information

\- changes in deal variables



---



\## Risk



Tasks may trigger events.



Examples:



\- competitor appears

\- information leak

\- founder loses interest

\- valuation expectations inflate



---



\# Deal Variables



Each opportunity contains dynamic variables.



Examples:



Lead Heat  

Access Level  

Data Visibility  

Competitive Pressure  

Confidentiality Risk  

Fit Score  



These variables influence outcomes and events.



---



\# Firm-Level Variables



Global metrics affect all deals.



Examples:



Team Morale  

Team Workload  

Reputation  

Network Strength  

Market Sentiment  

Financial Runway



---



\# Pipeline Structure



The firm manages a pipeline of opportunities.



Pipeline stages:



Leads  

Pitch  

Mandates  

Closed Deals



Each stage has probabilities of conversion.



---



\# Risk Debt Concept



Early decisions may create hidden risks.



Examples:



\- overpromising valuation

\- leaking information

\- weak qualification

\- under-resourced preparation



Risk Debt may surface later during:



\- due diligence

\- negotiations

\- buyer confidence shifts



---



\# Narrative Layer



The simulation includes narrative events such as:



emails  

calls  

rumours  

competitive approaches  

internal team issues



These events shape decisions and outcomes.



Example narrative events:



Founder requesting valuation range  

Competitor advisor entering the situation  

Buyer interest emerging  

Information leak in the market  

Team member burnout



---



\# Desired Player Experience



The game should create a sense that:



\- progress is being made

\- uncertainty remains high

\- deals can collapse unexpectedly

\- early decisions have long-term consequences



In many real transactions, deals fail due to \*\*multiple small issues interacting\*\*, not a single cause.



The game should reflect this reality.



---



\# Next Design Step



The next stage of development is to design \*\*each macro phase of the M\&A process in detail\*\*, including:



\- description of the phase

\- workstreams active in that phase

\- micro-phases

\- dependencies between workstreams

\- progress thresholds

\- player actions

\- narrative events

\- critical decisions

\- failure scenarios



The process should start with:



\*\*Phase 0 — Deal Origination\*\*



and then proceed sequentially through the full M\&A lifecycle.



The design must remain compatible with the simulation architecture described above.

