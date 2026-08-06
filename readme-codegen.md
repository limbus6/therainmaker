# README Codegen - The M&A Rainmaker

Documento para agentes LLM/codegen que venham desenvolver este jogo. O objetivo e dar contexto tecnico, narrativo e operacional suficiente para alterar o projeto sem quebrar o fluxo de jogo, o deploy em GitHub Pages ou a consistencia da narrativa.

## Indice

1. Visao geral do projeto
2. Stack tecnica e comandos
3. GitHub, branches e GitHub Pages
4. Conceito do jogo
5. Narrativa principal
6. Estrutura das fases
7. Mapa tecnico do codigo
8. Estado global e motores de jogo
9. Conteudo, UI e componentes
10. Sistema de reviews e Fixes.md
11. Regras importantes para agentes codegen
12. Checklist antes de entregar alteracoes

## 1. Visao geral do projeto

The M&A Rainmaker e um jogo web single-player sobre a execucao de um processo sell-side de M&A. O jogador atua como banker na Clearwater Advisory e conduz uma transacao desde a origination ate ao closing.

O projeto e uma aplicacao React/Vite com estado global em Zustand. O jogo e essencialmente data-driven: fases, tarefas, emails, deliverables, riscos, compradores e headlines vivem em ficheiros de conteudo por fase, enquanto a logica transversal vive no store e no motor semanal.

Repositorio GitHub:

- Remote: `https://github.com/limbus6/therainmaker.git`
- Branch principal: `main`
- Branch de publicacao: `gh-pages`
- URL live: `https://limbus6.github.io/therainmaker/`

## 2. Stack tecnica e comandos

Stack principal:

- React 19
- TypeScript
- Vite 8
- Zustand
- React Router
- Tailwind CSS via `@tailwindcss/vite`
- Lucide React para icones
- `gh-pages` para deploy

Comandos:

```bash
npm.cmd run dev
npm.cmd run build
npm.cmd run deploy
npm.cmd run lint
```

Notas:

- `npm.cmd run build` executa `tsc -b && vite build`.
- `npm.cmd run deploy` executa build e publica `dist` no branch `gh-pages`.
- O Vite usa `base: '/therainmaker/'`, indispensavel para GitHub Pages.
- O projeto tem artefactos gerados `.js`, `.d.ts` e `.map` dentro de `src/` versionados. Depois de alterar TypeScript/TSX, correr `npm.cmd run build` para os regenerar.

## 3. GitHub, branches e GitHub Pages

Fluxo esperado:

1. Alterar ficheiros fonte em `src/`.
2. Correr `npm.cmd run build`.
3. Confirmar que artefactos gerados foram atualizados.
4. Fazer commit para `main`.
5. Fazer push para `origin main`.
6. Correr `npm.cmd run deploy` para publicar em `gh-pages`.
7. Verificar a URL live.

Detalhes importantes:

- O GitHub Pages serve o branch `gh-pages`.
- O HTML pode ficar em cache durante alguns minutos no edge da GitHub/Fastly.
- Para confirmar deploy real, comparar `origin/gh-pages:index.html` com `dist/index.html`.
- Se o HTML base parecer antigo mas os assets novos responderem `200 OK`, normalmente e cache.
- O caminho publico deve sempre usar `/therainmaker/`, nao `/`.

## 4. Conceito do jogo

O jogo simula um processo sell-side de M&A com decisoes operacionais e narrativas. O jogador gere:

- Budget
- Team capacity
- Morale
- Prospect/client trust
- Deal momentum
- Risk level
- Reputation
- Buyers e interesse
- Tasks, workstreams e deliverables
- Emails, eventos e headlines
- Riscos e mitigacoes

A filosofia desejada e: o jogo deve ser desafiante por consequencias, trade-offs e pressao organica, nao por blockers antigos ou requisitos sem sentido. Riscos devem influenciar score, narrativa e qualidade, mas nao devem bloquear artificialmente fases quando o processo ja avancou.

## 5. Narrativa principal

O inicio correto da narrativa e:

1. O jogador ainda nao tem o mandato.
2. Solara Systems surge como lead prioritario.
3. Ricardo Mendes e prospect/founder, nao cliente fechado na Fase 0.
4. O jogador qualifica Solara, investiga o mercado e avalia as motivacoes de Ricardo.
5. Se houver evidencias suficientes, submete uma recomendacao ao board.
6. Se aprovado, entra em Phase 1 para fazer pitch e negociar o mandato.
7. Depois do mandato ganho, Ricardo/Solara passam a ser o cliente ativo do processo.

Evitar voltar a introduzir multiplas empresas como se fossem targets equivalentes se o conteudo posterior continuar escrito para Solara/Ricardo. As fases 1-10 estao fortemente centradas em Solara, Ricardo, Helena, Kestrel, Vektor e Schneider.

## 6. Estrutura das fases

As fases estao definidas em `src/types/game.ts` atraves de `PhaseId` e `PHASE_NAMES`.

Resumo narrativo:

- Phase 0 - Deal Origination: qualificar Solara como lead prioritario, investigar mercado/founder e obter aprovacao interna para pitch.
- Phase 1 - Pitch & Mandate: preparar pitch, apresentar proposta a Ricardo e negociar fee/mandato.
- Phase 2 - Preparation: construir modelo, CIM, teaser, buyer list e preparar materiais.
- Phase 3 - Market Outreach: contactar compradores, gerir NDAs, Q&A inicial e acesso controlado.
- Phase 4 - Shortlist: filtrar compradores, aprovar shortlist e preparar processo de NBO.
- Phase 5 - Non-Binding Offers: receber/analisar NBOs, escolher candidatos para DD e preparar entrada em diligence.
- Phase 6 - Due Diligence: gerir Q&A, data room, management sessions, riscos de informacao e binding offers.
- Phase 7 - Final Offers: comparar ofertas finais, ajustar valor por estrutura/certeza e selecionar preferred bidder.
- Phase 8 - SPA Negotiation: negociar SPA, protecoes, disclosure schedules e signing checklist.
- Phase 9 - Signing: fechar versoes de documentos, briefing final e assinatura.
- Phase 10 - Closing & Execution: condicoes precedentes, fundos, approvals e conclusao do deal.

Regras de gating recentes:

- Phase 6 pode avancar quando ha process letter/final DD readiness, binding offers e pelo menos um comprador ativo. Nao deve esperar por deadline antiga se binding offers ja existem.
- Phase 7 pode avancar quando ha preferred bidder selecionado. A exclusivity pack e melhoria de qualidade/risco, nao blocker absoluto.
- Phase 9 nao deve ser bloqueada por `riskLevel` alto se documentos estao prontos e SPA assinada; risco alto deve aparecer como aviso nao-bloqueante.

## 7. Mapa tecnico do codigo

Entrada da app:

- `src/main.tsx`: monta React.
- `src/App.tsx`: routing principal e layout.
- `src/index.css`: estilos globais e tokens visuais.

Estado e motores:

- `src/store/gameStore.ts`: estado global Zustand, actions, transicoes de fase, debug jumps, tarefas, emails, compradores, SPA, budget, staffing.
- `src/engine/weekEngine.ts`: resolve passagem de dias/semanas, progresso de tarefas, eventos, buyer progression, gates de fase e colapso do deal.
- `src/engine/resultsEngine.ts`: calcula resultados finais e scoring de outcome.
- `src/utils/gameplayState.ts`: helpers transversais para lifecycle de riscos, workstreams por fase, deliverables de dashboard, labels de momentum e labels de valuation/offers.
- `src/utils/numberFormat.ts`: formatacao numerica.

Tipos:

- `src/types/game.ts`: tipos principais de jogo.
- `Risk` inclui `retired`, `retiredReason`, `expiresAfterPhase`.
- `PhaseId` cobre fases 0-10.

Conteudo:

- `src/content/phase1.ts` ate `src/content/phase10.ts`: tarefas, emails, deliverables, riscos, headlines e buyers por fase.
- `src/content/loadPhaseContent.ts`: carregamento dinamico do conteudo de fases.
- A Fase 0 e seedada diretamente em `gameStore.ts`, nao em `src/content/phase0.ts`.

Configuracao:

- `src/config/phaseBudgets.ts`: budgets base, staff profiles, contractors, acoes de budget/staffing.
- `src/config/riskMitigation.ts`: planos de mitigacao de risco.
- `src/config/reviewCheckpoints.ts`: checkpoints de gameplay review/debug.

Screens principais:

- `src/screens/DashboardScreen.tsx`: dashboard principal, KPIs, phase gate, deliverables, active risks, workstreams.
- `src/screens/TasksScreen.tsx`: tarefas e workstreams.
- `src/screens/ClientScreen.tsx`: prospect/client relationship e notas.
- `src/screens/BuyersScreen.tsx`: buyer universe e valuation/offer.
- `src/screens/RisksScreen.tsx`: riscos ativos, mitigados e retired.
- `src/screens/DeliverablesScreen.tsx`: deliverables com current phase primeiro.
- `src/screens/DataroomScreen.tsx`: acesso a data room.
- `src/screens/FinalOffersScreen.tsx`: comparacao de final offers e selecao de preferred bidder.
- `src/screens/ResultsBoardScreen.tsx`: resultado final.
- `src/screens/InboxScreen.tsx`, `MarketScreen.tsx`, `TeamScreen.tsx`, `TimelineScreen.tsx`: superficies auxiliares.

Componentes importantes:

- `src/components/OnboardingOverlay.tsx`: introducao do jogo.
- `src/components/PhaseZeroDashboard.tsx`: UI de qualificacao do lead Solara.
- `src/components/BoardSubmissionModal.tsx`: submissao ao board para perseguir o mandato.
- `src/components/PitchPresentationModal.tsx`: pitch a Ricardo.
- `src/components/FeeNegotiationModal.tsx`: negociacao de fee.
- `src/components/PhaseDeadlineModal.tsx`: definicao de deadlines processuais.
- `src/components/ReviewBar.tsx`: barra de gameplay review.
- `src/components/ReviewSubmissionPanel.tsx`: submissao de feedback/fixes.
- `src/components/StaffingModal.tsx`, `ContractorPanel.tsx`: staffing e capacidade temporaria.
- `src/components/SPANegotiationModal.tsx`: negociacao de SPA.
- `src/components/CompetitorMitigationPanel.tsx`: ameacas de competing advisor.
- `src/components/layout/Sidebar.tsx`, `Topbar.tsx`, `GameLayout.tsx`: layout.

UI base:

- `src/components/ui/Panel.tsx`
- `src/components/ui/KpiTile.tsx`
- `src/components/ui/StatusChip.tsx`
- `src/components/ui/ProgressBar.tsx`
- `src/components/ui/ToastStack.tsx`

## 8. Estado global e motores de jogo

`gameStore.ts` e o centro do jogo. Alterar com cuidado.

Actions mais importantes:

- `advanceWeek`: passa tempo, resolve tarefas, eventos, recursos, buyers, riscos e gates.
- `advancePhase`: carrega conteudo da proxima fase e recalibra budget/workstreams/riscos.
- `debugJumpToPhase`: salta para uma fase para testes.
- `debugJumpToCheckpoint`: salta para checkpoint predefinido.
- `startTask`: inicia tarefa e consome budget uma vez.
- `completeTask`: completa tarefa e sincroniza deliverables/workstreams.
- `mitigateRisk` e `executeRiskMitigationPlan`: mitigacao manual ou planeada.
- `submitBoardRecommendation`: board approval para sair da Fase 0.
- `presentPitch`, `submitFeeRound`: fluxo de pitch/mandato.
- `selectPreferredBidder`: escolhe bidder na Fase 7.
- `initSPANegotiation`, `submitSPARound`, `acceptSPATerms`: fluxo SPA.

`weekEngine.ts` contem:

- `resolveWeek`
- `checkPhaseGate`
- `unlockTasks`
- `checkDealCollapse`
- `calcDaysToAdvance`
- sistemas de eventos, emails, buyer progression e resource consumption.

Cuidados:

- Nao contar riscos `retired` como ativos.
- Riscos sem metadata explicita ficam ativos na fase em que surgem e nas duas fases seguintes; depois passam ao historico.
- Nao cobrar `task.cost` semanalmente; custo de tarefa e one-time em `startTask`.
- Tarefas em curso acumulam `progress`; nunca voltar a uma resolucao semanal puramente aleatoria e sem memoria.
- Existem IDs legacy repetidos entre fases; todos os lookups e updates de tarefas devem usar `(phase, id)`. Novas tarefas devem continuar a receber IDs globais unicos.
- Contractor/temp capacity pode ter burn semanal.
- Workstreams devem ser phase-aware via `WORKSTREAMS_BY_PHASE`.
- Debug jumps devem aplicar retirement de riscos e workstreams atuais.
- O phase gate mostrado no Dashboard deve ser derivado do estado atual, para reagir imediatamente a deadlines e selecao de bidder.
- Requisitos opcionais melhoram qualidade/risco mas nao podem bloquear a transicao.
- Na Fase 10, um gate concluido chama `completeGame` e abre Results; nunca tentar avancar para uma Fase 11.
- O conteudo das Fases 8-10 deve usar `preferredBidderId`; Kestrel e apenas o default editorial, nao um vencedor fixo.

## 9. Conteudo, UI e componentes

Padrao de conteudo por fase:

- `phaseXTasks`
- `phaseXEmails`
- `phaseXDeliverables`
- `phaseXRisks`
- `phaseXHeadlines`
- `phaseXBuyers` quando aplicavel

Ao adicionar uma nova tarefa:

- Dar `id` unico.
- Definir `phase`.
- Definir `category`, `status`, `cost`, `work`, `complexity`.
- Usar `dependencies` se desbloqueia por fluxo.
- Usar `linkedDeliverableId` se deve atualizar deliverable.
- Usar `workstreamId` se pertence a workstream especifica.
- Evitar custos em budget para tarefas internas; preferir `work`.

Ao adicionar um risco:

- Definir `surfacedPhase` e `surfacedWeek`.
- Considerar `expiresAfterPhase` se o risco deixa de fazer sentido depois de uma fase.
- Riscos historicos devem poder aparecer como retired, mas nao bloquear gates nem contar como ativos.

Ao alterar UI:

- Manter copy em ingles dentro do jogo.
- Evitar misturar portugues no produto live.
- Preservar o design system existente.
- O texto de Fase 0 deve dizer prospect/lead, nao client, ate ao mandato.

## 10. Sistema de reviews e Fixes.md

Existe uma barra/painel de gameplay review para testes.

Ficheiros relevantes:

- `src/components/ReviewBar.tsx`
- `src/components/ReviewSubmissionPanel.tsx`
- `src/config/reviewCheckpoints.ts`
- `Fixes.md`
- `vite.config.ts`

Em desenvolvimento local:

- `vite.config.ts` define `reviewCapturePlugin`.
- POST `/api/reviews` grava feedback em `Fixes.md`.

Em GitHub Pages:

- GitHub Pages e static hosting.
- Nao consegue escrever em `Fixes.md`.
- O fluxo deve tratar isso como fallback: copiar/guardar localmente ou orientar para GitHub issues, sem prometer escrita no repo.

## 11. Regras importantes para agentes codegen

Regras de produto:

- O jogo deve ser full English no UI/copy live.
- A Fase 0 e prospect/origination, nao cliente ja fechado.
- Nao reintroduzir multiplos leads como escolha real sem refatorar todas as fases posteriores.
- Riscos antigos devem expirar/retirar quando deixam de fazer sentido.
- O jogo deve ser fluido e organico, nao bloqueado por tarefas ou riscos obsoletos.
- Dificuldade deve vir de trade-offs, budget/capacity, timing, buyer confidence e riscos vivos.

Regras tecnicas:

- Alterar `.ts`/`.tsx` como fonte principal.
- Correr `npm.cmd run build` apos alteracoes.
- Incluir artefactos gerados se o repo os versiona.
- Nao mudar `vite.config.ts` base `/therainmaker/` sem motivo forte.
- Nao quebrar `npm.cmd run deploy`.
- Evitar alteracoes destrutivas em git.

Regras de narrativa:

- Solara Systems e o ativo central.
- Ricardo Mendes e founder/prospect na Fase 0 e cliente depois do mandato.
- Kestrel, Vektor e Schneider sao compradores relevantes mais tarde; a narrativa legal deve seguir o bidder realmente selecionado.
- A narrativa deve evoluir de origination para pitch, preparacao, outreach, offers, DD, SPA, signing e closing.

## 12. Checklist antes de entregar alteracoes

Antes de concluir trabalho:

```bash
npm.cmd run build
git status --short
```

Checklist funcional:

- A Fase 0 ainda distingue prospect de client?
- O Dashboard mostra o label correto de momentum por fase?
- Riscos retired nao aparecem como riscos ativos?
- Gates de fase continuam coerentes?
- Workstreams atuais correspondem a fase?
- Deliverables do dashboard focam fase atual/proxima critica?
- Buyers mostram valuation/offer corretamente?
- `Fixes.md`/review flow continua sem prometer escrita em GitHub Pages?
- A app ainda funciona em `/therainmaker/`?

Checklist de deploy:

```bash
npm.cmd run build
git add <ficheiros>
git commit -m "<mensagem>"
git push origin main
npm.cmd run deploy
```

Verificacao de Pages:

```bash
git ls-remote origin main gh-pages
curl.exe -L -I https://limbus6.github.io/therainmaker/
```

Se o HTML parecer antigo, verificar `origin/gh-pages:index.html` e lembrar que GitHub Pages pode servir cache durante alguns minutos.
