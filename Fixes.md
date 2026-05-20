# Gameplay Fixes

This file receives feedback submitted from the gameplay review bar in the local development environment.

---

> **Status key:** ✅ Fixed · ℹ️ Already implemented · ⏳ Pending


## 2026-05-18 16:38:56.645 UTC
- Phase: P0 — Deal Origination
- Checkpoint: Kickoff
- Route: /game
- Context: Fresh origination, no board approval or qualification notes yet.

Deal momentum in this phase should indicate a possible deal.

> ℹ️ Already implemented — Phase 0 KPI shows "Opportunity Signal" (not "Deal Momentum"). No change needed.


## 2026-05-19 10:33:01.357 UTC
- Phase: P6 — Due Diligence
- Checkpoint: DD Live
- Route: /dataroom
- Context: Q&A tracker launched and buyer DD streams opened.

In this phase we are seeing in the section "RISKS" some risks to be addressed that are related to other phases, such is: Competing advisor - this is for pitch and once the client signs the mandate the risk probabloty goes to 0, therefore should disapear. There are ohher risks that could disapear by the phase end such the "NDA processing bottleneck". Additionally, stuff like "Material Quality Risk" is the kind of issues that are more probable to generate a problem before the DD phase, as it is the support for the NBO's.

> ✅ Fixed — `getActiveRisks` now applies `retireObsoleteRisks` defensively on every render, including on save-game load. "Competing Advisor" retires after Phase 1, "NDA processing bottleneck" after Phase 3, "Material Quality Risk" after Phase 5 or once binding offers are received.


## 2026-05-19 10:37:22.656 UTC
- Phase: P6 — Due Diligence
- Checkpoint: DD Live
- Route: /dataroom
- Context: Q&A tracker launched and buyer DD streams opened.

On the Tasks there is Active workstreams and it show "Origination & Qualifications" at 8% - when we are at thte dd phase.

> ✅ Fixed — Dashboard now applies `applyPhaseWorkstreams` defensively at render time. "Origination & Qualification" is excluded from Phase 6+ active workstreams.


## 2026-05-19 10:39:20.181 UTC
- Phase: P6 — Due Diligence
- Checkpoint: DD Live
- Route: /dataroom
- Context: Q&A tracker launched and buyer DD streams opened.

In the buyers list there should be a column for valuation

> ℹ️ Already implemented — the Buyers table has a "Valuation / Offer" column showing the estimated range (based on buyer posture) before binding offers, and the actual offer amount once received.


## 2026-05-19 10:44:37.258 UTC
- Phase: P6 — Due Diligence
- Checkpoint: DD Live
- Route: /dataroom
- Context: Q&A tracker launched and buyer DD streams opened.

Most urgent issues to mitigate should be on top

> ℹ️ Already implemented — `getActiveRisks` sorts by urgency score (severity × probability × phase proximity). Critical risks appear first.


## 2026-05-19 10:47:01.458 UTC
- Phase: P6 — Due Diligence
- Checkpoint: DD Live
- Route: /dataroom
- Context: Q&A tracker launched and buyer DD streams opened.

Overall: costs of tasks and Budget is not ballanced. There are costs of tasks that should 0 in terms of monye but should be a burden in capacituy.

> ✅ Fixed — Internal tasks with incorrectly assigned monetary costs zeroed: task-18 (€1k→0), task-26 (€3k→0), task-30 (€2k→0), task-47 (€5k→0), task-gen-02 (€2k→0). ~€13k freed across early phases.


## 2026-05-19 10:55:14.799 UTC
- Phase: P6 — Due Diligence
- Checkpoint: DD Live
- Route: /dataroom
- Context: Q&A tracker launched and buyer DD streams opened.

It is not advancing for next phase, despite we have already receive the Binding offers. Now we should be in the phase to attribute exclusivity or negotiate more with the bidders.

> ✅ Fixed — Phase 6 gate requirement now clearly reads "Final DD Readiness Review completed (process gate)" instead of the opaque "Process letter issued" label. This task (task-92) must be completed alongside having binding offers. The gate correctly allows transition once both conditions are met.


## 2026-05-19 10:56:43.825 UTC
- Phase: P6 — Due Diligence
- Checkpoint: DD Live
- Route: /dataroom
- Context: Q&A tracker launched and buyer DD streams opened.

on the dashboard the deliverables are showing stuff from very initial phases. it shoudl update accordding to the phase.

> ✅ Fixed — `getDashboardDeliverables` no longer falls back to all deliverables. Only current and next-phase deliverables are shown; the panel is empty if no deliverables exist for the current phase.


## 2026-05-19 11:19:27.876 UTC
- Phase: P6 — Due Diligence
- Checkpoint: DD Live
- Route: /dataroom
- Context: Q&A tracker launched and buyer DD streams opened.

It's taking too long to have exclusivity agreement prepared. and we could have a possibility to simply attribute exclusivity to whoever we would want not the one htat is asking.

> ⏳ Pending — Proactive exclusivity assignment (player chooses bidder rather than waiting for buyer request) is a feature addition. Not implemented in this cycle.


## 2026-05-19 11:35:55.268 UTC
- Phase: P7 — Final Offers
- Checkpoint: Final Offers Live
- Route: /final-offers
- Context: Binding offers are on the table.

The buyer that is moving to sign is not what I selected as preferred.

> ✅ Fixed — `initSPANegotiation` now strictly uses `preferredBidderId` to find the buyer for SPA. The previous OR-fallback (`|| b.status === 'preferred'`) that could select a different buyer has been removed.


## 2026-05-19 11:39:06.583 UTC
- Phase: P9 — Signing
- Checkpoint: Signing Desk
- Route: /timeline
- Context: Documents almost ready for signature.

I can finalize because risk level is too high. comittee does not allow more budget, and there are risks that are not relevant anymore.

> ✅ Fixed — (1) Stale risks now retire defensively on every render (see 10:33 entry above), which reduces inflated risk level. (2) The "High residual risk flagged (non-blocking)" label has been removed from the Phase 9 gate requirements — risk level is not and never was a Phase 9 blocker; the label was misleading.


## 2026-05-19 11:51:07.007 UTC
- Phase: P9 — Signing
- Checkpoint: Signing Desk
- Route: /timeline
- Context: Documents almost ready for signature.

I have no more acrions to do, and rick level continuies high not letting close the deal. It does not make sense. Risk level should not be a condition to not close the deal. I think.

> ✅ Fixed — Same as above. Phase 9 gate only requires "Signature version locked" and "SPA signed". Risk level is informational only.


## 2026-05-20 11:52:39.304 UTC
- Phase: P0 — Deal Origination
- Checkpoint: Kickoff
- Route: /game
- Context: Fresh origination, no board approval or qualification notes yet.

recebi um email a dizer que vou receber leads, e não apareceram.

> ✅ Fixed — The Phase 0 kickoff email from Marcus Aldridge has been rewritten. It no longer says leads will arrive "shortly" — it directly references Solara Systems (already in state from game start) and tells the player to act now.


## 2026-05-20 12:08:45.304 UTC
- Phase: P0 — Deal Origination
- Checkpoint: Kickoff
- Route: /game
- Context: Fresh origination, no board approval or qualification notes yet.

Opções para avançar tarefas (mais velocidade com algum custo)

> ✅ Fixed — Sprint / Standard / Deliberate pace selector added to Dashboard. Sprint speeds task completion ×1.35, increases contractor cost ×1.25, costs −5 morale but adds +2 deal momentum. Deliberate slows completion to ×0.75, reduces contractor cost ×0.8, recovers +7 morale and suppresses idle momentum decay.


## 2026-05-20 15:28:39.786 UTC
- Phase: P0 — Deal Origination
- Checkpoint: Kickoff
- Route: /game
- Context: Fresh origination, no board approval or qualification notes yet.

Os deep dive e research adicionais não deveriam ter custo financeiro mas sim ser sobrecarga na equipa
