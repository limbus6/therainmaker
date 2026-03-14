# Projeto M&A Rainmaker — Possible Roadmap (O que falta fazer)

Com base no estado atual da base de código, nas mecânicas implementadas até agora (incluindo as recentes alterações de estado para o nome do jogador, onboarding e save system), e nos documentos de design das Fases, aqui está um roadmap detalhado do que ainda falta concluir no projeto para que o jogo fique na sua versão final, rica e completa.

---

## 1. Onboarding & Sistema de Gravação (Save/Load)
*As fundações no store (`playerName`, `savedAt`, `hasSeenOnboarding`) já foram adicionadas, mas falta a Interface.*

- [ ] **Ecrã de Onboarding/Start:** Criar um ecrã inicial de título (Start Screen) onde o jogador insere o seu nome (`playerName`), vê a premissa inicial do mandato (Solara Systems) e aprende as regras base antes de entrar na Fase 0.
- [ ] **Tutorial Contextual:** Pequenos tooltips ou popups na primeira vez que o jogador entra num ecrã (ex: como alocar contractors na primeira vez que se abre o Staffing).
- [ ] **Interface de Save/Load:** Implementar auto-save persistente e uma interface para mostrar a última gravação ("Last saved at..."). Possibilidade de fazer "Restart" à simulação.

---

## 2. As "Pontas Soltas" do Motor (Week Engine)
*O UI das mecânicas da Sprint anterior já está criado (Fees, Contractors, Board), mas falta injetar o impacto matemático diretamente no motor (`weekEngine.ts` e `resultsEngine.ts`).*

- [ ] **Contratados Temporários (Contractors):** Deduzir automaticamente o `weeklyRate` do budget a cada semana que passa; aplicar o `speedMultiplier` de verdade à lógica computacional de `resolveTaskProgress` para as tarefas ficarem concluídas mais rápido.
- [ ] **Ameaças da Concorrência (Competitor Threats):** Fazer spawn nativo da interface de ameaça quando o evento `evt-competing-advisor` for fisgado no jogo.
- [ ] **Verificação Rigorosa dos Phase Gates:** 
  - Impedir ativamente o avanço da Fase 0 para a 1 ser feito sem a recomendação do Board (`boardSubmission.status === 'approved'`).
  - Impedir o avanço da Fase 1 adiante sem que os Fees tenham sido formalmente acordados (`feeNegotiation.status === 'agreed'`).
- [ ] **Integração Real dos Fees no Score Final:** Fazer com que o `resultsEngine.ts` use os `agreedFeeTerms` (Retainer, Ratchets e % acordada) em vez de usar uma constante estática para a comissão final de sucesso.

---

## 3. Mini-Jogos e Mecânicas das Fases Avançadas (Fases 2 a 10)
*O modelo atual tem painéis fortes para Originação e Pitch (Fases 0 e 1), mas o documento foca nas complexidades das fases mais agudas (ex: Phase 6).*

- [ ] **Gestão do "Dataroom" / Due Diligence (Fase 5/6):** Painéis para gerir níveis de acesso à informação sensível, responder a perguntas de compradores e evitar que investidores (buyers) se assustem e desistam (`dropped`).
- [ ] **Seleção de Propostas Finais (Phase 6 - Final Offers):** Criar a UI de "Grid de Propostas Finais" (Final Offer Grid). Onde os diferentes compradores metem o valor na mesa, com diferentes estruturas (muito dinheiro vs dinheiro sujeito a métricas futuras - earnouts). O jogador tem de recomendar um ao board baseado no fit!
- [ ] **Mecânica de SPA (Sale and Purchase Agreement - Fase 8/9):** Outro mini-jogo tipo o das Fees (FIFA 23-style), mas agora a negociar as cláusulas de garantia (Warranties, Indemnities).
- [ ] **Eventos Surpresa Avançados:** Exemplo: *Key Employee deixa a empresa a meio da Due Diligence* ou *Mercado entra em crash*. Como o jogador reage (gasta budget de emergência, fala com buyers para acalmar).

---

## 4. UI Polish & Quality of Life (Afinar Detalhes)
*Pequenos toques que fazem o projeto passar de um "protótipo" a um Web Game cativante.*

- [ ] **Notificações Globais "Toasts":** O jogo atualmente acontece em painéis silenciosos. Precisa de pop-ups no canto do ecrã para: *“Tarefa Completa!”*, *“Novo email urgente recebido!”* ou *“Budget Deduzido”*.
- [ ] **Animações de Progressão:** A barra verde do projeto avançar suavemente; as estatísticas de Confiança (Client Trust) darem feedback visual (ex: luzinhas verdes/vermelhas + e -) sempre que acontece uma ação com impacto.
- [ ] **Sombras do Outlook:** Um design mais imersivo no ecrã de Email (`Inbox`), permitindo separar claramente emails lidos de não lidos, e com ícones de anexo caso existam ficheiros.

---

## 5. Balanceamento e Balancing Fino
*Garantir que não é nem fácil demais nem impossível.*
- [ ] Equilibrar o budget e os custos (talvez o Contractor cobre demasiado depressa o budget).
- [ ] Distribuir as dificuldades das tarefas (low, medium, high) com precisões logísticas mais exatas de forma a que o jogador não se sinta aborrecido, forçando a contratação ou os "Temp Allocations" perante prazos urgentes.
- [ ] O Grade final da Board (Elite Rainmaker vs Weak Outcome) necessita de uns fine-tunes quando o jogo inteiro se conjuga (Fees Reais da Fee Negotiation vs Retainers acordados).

**Próximo Passo Lógico:** Começar pelo **Onboarding e Ecrã Inicial**, visto serem a porta de entrada da experiência, ou saltar diretamente para fechar as pontas soltas no **Week Engine**!
