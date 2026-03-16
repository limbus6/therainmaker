# The M&A Rainmaker — Especificação Completa do Estado Atual (Implementado)

## 1. Objetivo do Documento
Este documento descreve o estado **realmente implementado** do jogo no repositório atual, incluindo:
- arquitetura e stack;
- sistemas de jogo e regras;
- progressão por fases;
- UX e ecrãs disponíveis;
- persistência e condições de fim de jogo.

Escopo: versão atual do código em `C:\antigravity\AG-P004` (store/engine/screens/components/content).

---

## 2. Visão Geral do Jogo
**The M&A Rainmaker** é um jogo de gestão/processo de M&A sell-side em que o jogador conduz a venda da Solara Systems ao longo de 11 fases (Phase 0 a 10), equilibrando:
- execução operacional (tasks/workstreams/deliverables),
- relacionamento (client trust),
- dinâmica de mercado (headlines/events/buyers),
- risco e orçamento.

### 2.1 Condição macro de sucesso
- Concluir o processo até à fase final com gate final cumprido.

### 2.2 Condições de colapso (derrota)
O jogo pode terminar antes por:
- `client_walked`: `clientTrust <= 0`;
- `all_buyers_gone`: sem compradores ativos (fases com compradores);
- `firm_cannot_continue`: orçamento a 0 e moral crítica;
- `momentum_dead`: momentum a 0 em fases mais avançadas.

---

## 3. Stack e Arquitetura Técnica
## 3.1 Stack
- Frontend: React 19 + TypeScript + Vite.
- Routing: `react-router-dom`.
- State management: Zustand com `persist`.
- UI/icons: Tailwind v4 + `lucide-react`.

## 3.2 Arquitetura de runtime
- Estado global central em `src/store/gameStore.ts`.
- Motor de simulação temporal e eventos em `src/engine/weekEngine.ts`.
- Motor de scoring final em `src/engine/resultsEngine.ts`.
- Conteúdo por fase em `src/content/phase1.ts` ... `phase10.ts`.
- Tipos canónicos em `src/types/game.ts`.

## 3.3 Persistência
- Chave localStorage: `ma-rainmaker-save`.
- Versão de persistência: `2`.
- Migração v2 adiciona `day`, `totalDays`, e normaliza `weekHistory`.
- Estado transitório excluído da persistência: `lastWeekResult`, `phaseGate`, `isWeekInProgress`, `toasts`.

---

## 4. Modelo de Tempo
- O contador principal é **day**.
- `week` é derivado por `Math.ceil(day / 7)` no fluxo de avanço.
- `advanceWeek()` não avança sempre 7 dias; avança `1..7` dias com `calcDaysToAdvance`.

Heurística de avanço:
- emails urgentes e tarefas low complexity puxam para 1 dia;
- médium/high tasks, board pending, budget pending e competitor threat encurtam o salto;
- default sem urgência: 7 dias.

---

## 5. Core Loop Atual
Loop principal do jogador:
1. Ler inbox e responder/escalar.
2. Iniciar tarefas (disponíveis/recomendadas).
3. Mitigar riscos / gerir budget / staffing.
4. Ajustar sistemas de fase (fee, SPA, dataroom, final offers).
5. `Advance` (simulação de N dias).
6. Rever `WeekSummaryOverlay`.
7. Cumprir `PhaseGate` e avançar de fase.

---

## 6. Recursos e KPIs de Jogo
Recursos centrais (`PlayerResources`):
- `budget`, `budgetMax`
- `teamCapacity`, `teamCapacityMax`
- `morale`
- `clientTrust`
- `dealMomentum`
- `riskLevel`
- `reputation`

Estado inicial (Phase 0):
- budget: 20k
- teamCapacity: 90/100
- morale: 80
- clientTrust: 40
- dealMomentum: 15
- riskLevel: 10
- reputation: 40

---

## 7. Estrutura de Progressão por Fases
Fases implementadas:
- 0: Deal Origination
- 1: Pitch & Mandate
- 2: Preparation
- 3: Market Outreach
- 4: Shortlist
- 5: Non-Binding Offers
- 6: Due Diligence
- 7: Final Offers
- 8: SPA Negotiation
- 9: Signing
- 10: Closing & Execution

Ao avançar de fase (`advancePhase`):
- injeta conteúdo da fase (tasks/emails/deliverables/risks/headlines; buyers na fase 2);
- ativa workstreams adicionais conforme fase;
- acumula budget gasto da fase em `totalBudgetSpent`;
- aplica orçamento da nova fase: `newBudget = carryover + phaseBase`;
- fase 7 gera `finalOffers` automaticamente.

---

## 8. Conteúdo Atual (quantitativo)
Totais implementados (incluindo fase 0 seed):
- Tasks: **116**
- Emails: **78**
- Deliverables: **31**
- Risks: **31**
- Headlines: **58**
- Buyers seed (phase2): **5**

Distribuição por fase 1-10:
- Phase1: 9 tasks, 3 emails
- Phase2: 11 tasks, 11 emails
- Phase3: 11 tasks, 9 emails
- Phase4: 9 tasks, 5 emails
- Phase5: 11 tasks, 8 emails
- Phase6: 13 tasks, 10 emails
- Phase7: 13 tasks, 8 emails
- Phase8: 12 tasks, 8 emails
- Phase9: 10 tasks, 6 emails
- Phase10: 11 tasks, 8 emails

---

## 9. Simulação de Semana/Dia (Week Engine)
`resolveWeek(state, daysToAdvance)` executa:
- progressão/completação de tasks com probabilidade por complexidade;
- consumo de budget/capacidade/moral proporcional aos dias;
- variação de momentum/trust por categoria de task;
- ruído estocástico leve em recursos;
- hidden workload (complicações inesperadas);
- critical outcomes (sucessos/falhas excepcionais);
- progressão de buyers (status + interest);
- geração de eventos (pool grande com probabilidades e condições);
- resolução de budget requests pendentes;
- resolução de board submission pendente;
- narrativa sumária.

Eventos:
- pool implementado com ~**78 templates**.
- probabilidades por evento tipicamente entre 7% e 20%, com condições por fase/estado.

---

## 10. Sistemas de Jogo Implementados
## 10.1 Tasks / Workstreams / Deliverables
- Task statuses: available/recommended/locked/in_progress/completed/reopened.
- `unlockTasks()` desbloqueia por dependências completas.
- `syncDeliverables()`:
  - linked task completed => deliverable approved, completion 100.
  - linked task in_progress => drafting, completion mínimo 30.
- Workstream progress atualizado por fração de tasks concluídas.

## 10.2 Inbox e respostas
- Emails com categorias, prioridade, estado, flag/escalation.
- Resposta aplica efeitos de recursos com variação ±25%.
- Escalar email para Marcus:
  - cria resposta contextual de aconselhamento;
  - custo fixo de 2k no budget.

## 10.3 Riscos
- Mitigação manual por botão (`RisksScreen`).
- Custo por severidade (k€): low 2, medium 4, high 6, critical 8.
- Mitigar reduz probabilidade do risco e baixa `riskLevel`.

## 10.4 Budget por fase
Base budgets (k€):
- P0 20, P1 30, P2 50, P3 30, P4 15, P5 20, P6 45, P7 20, P8 25, P9 15, P10 20.

Budget request:
- pedido criado com estado `pending`;
- engine decide aprovação/rejeição em avanço seguinte;
- aprovação injeta valor aprovado no budget.

## 10.5 Qualification + Board (Phase 0)
- Qual notes automáticas surgem ao concluir tasks-chave de qualificação.
- Board recommendation é submetida manualmente no modal.
- Aprovação é resolvida no engine com chance dependente de momentum/reputation.
- Gate de transição de fase 0 exige board aprovado + tarefas críticas.

## 10.6 Staffing
- Hires permanentes com custo one-off e aumento de capacidade.
- Contractors temporários por task com `weeklyRate` e `speedMultiplier`.
- Contractors são libertados automaticamente quando a task ligada conclui.

## 10.7 Competitor Mitigation
- Threats surgem quando eventos de “competing advisor” disparam.
- Ações de mitigação (relationship/process) aplicam efeitos de trust/momentum/reputation e custo.
- Threat resolvida após 2+ ações usadas.

## 10.8 Fee Negotiation (Phase 1)
- Fluxo: `presentPitch` -> `startFeeNegotiation` -> rounds.
- Componentes: retainer, success fee, ratchet.
- Cliente tem profile oculto com prioridades, reservas e paciência.
- Resultado por round: counter/accepted/rejected.
- Progressive locking de componentes com hints dinâmicos.
- Aceite grava `agreedFeeTerms`; falha reduz clientTrust.

## 10.9 Final Offers (Phase 7)
- Geradas automaticamente ao entrar na fase 7 com base em:
  - tipo de buyer,
  - valuation posture,
  - momentum,
  - DD friction.
- Inclui cash/earnout/total EV/conditionality/nota de advisor.
- Jogador seleciona `preferredBidder`.

## 10.10 SPA Negotiation (Phase 8)
- Inicializada para buyer preferido.
- Componentes: warranty scope, warranty cap, escrow, specific indemnity.
- Buyer profile oculto (aggressive/reasonable/conservative) com reservas/prioridades/paciência.
- Até 3 rounds com locking progressivo e hints.
- Aceite atualiza `agreedSPATerms` e melhora recursos; falha penaliza.

## 10.11 Dataroom (Phase >= 5)
- Categorias com sensibilidade e access level (`restricted/partial/full`).
- Alterar acesso impacta momentum/risk/trust conforme direção e sensibilidade.
- KPI de exposição e readiness calculados no ecrã.

## 10.12 Results Board (endgame)
- Scorecard final com blocos:
  - financial,
  - client,
  - team,
  - process,
  - career.
- Gera `overallDealScore`, grade e key drivers.
- Considera closing value, fee terms, budget gasto acumulado e métricas do estado final.

---

## 11. Phase Gates (Estado Atual)
Cada fase tem critérios explícitos em `checkPhaseGate()`:
- fase 0: tasks-chave de qualificação + board approval.
- fase 1: completion ratio + trust + pitch apresentado + fee agreed.
- fases 2..9: combinações de tasks-chave, completion ratios e thresholds de momentum/trust.
- fase 10: conclusão global baseada em completion ratio + momentum.

O dashboard mostra requisitos e readiness de gate em tempo real.

---

## 12. UI/UX Implementada
## 12.1 Rotas principais
- `/` landing
- `/game` dashboard
- `/inbox`, `/client`, `/team`, `/buyers`, `/tasks`, `/deliverables`, `/market`, `/risks`, `/timeline`
- `/dataroom` (aparece no nav a partir da phase 5)
- `/final-offers` (a partir da phase 7)
- `/results` results board

## 12.2 Overlays/Modais ativos
- Onboarding overlay inicial.
- Week summary overlay após cada avanço.
- Phase transition overlay.
- Deal collapse overlay em colapso.
- Modais: Settings, Budget Request, Board Submission, Staffing, Pitch Presentation, Fee Negotiation, SPA Negotiation.

## 12.3 Navegação e badges
- Sidebar com badges dinâmicos (emails não lidos, risks ativos, pending tasks).
- Topbar com phase/day/week e strip de KPIs.

---

## 13. Estado Inicial Narrativo/Entidades
Cliente inicial:
- Ricardo Mendes, Solara Systems (Industrial SaaS / Energy Tech).
- objetivos explícitos de valuation/continuidade/tempo.

Equipa inicial:
- 3 membros seed (VP, Associate, Analyst).

Seed Phase 0:
- 2 emails,
- 6 tasks,
- 1 risk,
- 3 headlines,
- workstream de origination ativo.

---

## 14. Notas Técnicas Importantes (Estado Atual)
- O jogo é parcialmente estocástico (progressão de tasks, eventos, noise de recursos, buyer interest drift).
- `Advance` opera em dias variáveis, não semanas fixas.
- O sistema de cliente tem sincronização `client.trust/confidence` via `syncClient` após avanço.
- `saveGame` é timestamp-only; o estado persistido é mantido pelo middleware `persist`.
- O botão “Play Again” limpa `ma-rainmaker-save`.

---

## 15. Conclusão
O estado atual já implementa um loop completo jogável de M&A de ponta a ponta, com:
- progressão por 11 fases,
- gates objetivos,
- sistemas económicos e de relacionamento,
- eventos estocásticos,
- minijogos de negociação (fee e SPA),
- e scoring final robusto.

Funcionalmente, é um “vertical slice avançado” com elevada cobertura de fluxo principal, forte densidade de conteúdo por fase e mecanismos de decisão com trade-offs claros.

