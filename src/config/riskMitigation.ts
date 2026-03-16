import type { Risk, PlayerResources } from '../types/game';

export interface RiskMitigationPlan {
  id: string;
  title: string;
  actions: string[];
  budgetCost: number;
  capacityCost: number;
  successChance: number; // 0..1
  catastrophicFailureChance?: number; // 0..1
  boardRecommendation?: {
    recommendation: 'proceed' | 'decline';
    rationale: string;
  };
  onSuccess: Partial<Record<keyof PlayerResources, number>> & { probabilityDelta?: number };
  onFailure: Partial<Record<keyof PlayerResources, number>> & { probabilityDelta?: number };
  catastrophicHeadline?: string;
  catastrophicDescription?: string;
}

function founderCommitmentPlans(): RiskMitigationPlan[] {
  return [
    {
      id: 'client_commitment_gate',
      title: 'Commitment Fee + Extended Discovery Sprint',
      actions: [
        'Propor fee de compromisso para research inicial.',
        'Executar sprint adicional de validação de mercado com equipa interna.',
        'Condicionar o arranque formal da venda à aceitação do compromisso.',
      ],
      budgetCost: 0,
      capacityCost: 12,
      successChance: 0.62,
      catastrophicFailureChance: 0.18,
      onSuccess: { clientTrust: 6, dealMomentum: 5, riskLevel: -8, probabilityDelta: -25 },
      onFailure: { clientTrust: -8, dealMomentum: -4, riskLevel: 6, probabilityDelta: 10 },
      catastrophicHeadline: 'Client Walked After Commitment Ask',
      catastrophicDescription:
        'Ricardo rejected the commitment structure and terminated the engagement immediately.',
    },
    {
      id: 'external_reputational_dd',
      title: 'Reputational DD + External KIC',
      actions: [
        'Contratar due diligence reputacional independente.',
        'Trazer consultor externo KIC para validar sinais de compromisso.',
        'Reenquadrar proposta de processo com base em evidência externa.',
      ],
      budgetCost: 5,
      capacityCost: 6,
      successChance: 0.76,
      onSuccess: { clientTrust: 4, dealMomentum: 4, reputation: 5, riskLevel: -7, probabilityDelta: -20 },
      onFailure: { budget: -1, dealMomentum: -2, riskLevel: 4, probabilityDelta: 8 },
    },
  ];
}

function competingAdvisorPlans(): RiskMitigationPlan[] {
  return [
    {
      id: 'fast_track_board_memo',
      title: 'Fast-Track Board Memo',
      actions: [
        'Draft accelerated board memo to move ahead of the rival advisor.',
        'Burn extra internal effort to compress the approval cycle.',
        'Ask the board to release you into full pitch mode immediately.',
      ],
      budgetCost: 0,
      capacityCost: 20,
      successChance: 0.58,
      boardRecommendation: {
        recommendation: 'proceed',
        rationale: 'We need to move now to stay ahead of the competing advisor.',
      },
      onSuccess: { dealMomentum: 7, reputation: 2, riskLevel: -5, probabilityDelta: -18 },
      onFailure: { dealMomentum: -5, morale: -4, riskLevel: 7, probabilityDelta: 10 },
    },
    {
      id: 'client_dinner_reset',
      title: 'Private Dinner With Client',
      actions: [
        'Meet Ricardo informally over dinner.',
        'Reinforce chemistry and show tailored attention.',
        'Probe whether the rival advisor is really converting trust into momentum.',
      ],
      budgetCost: 1,
      capacityCost: 4,
      successChance: 0.69,
      onSuccess: { clientTrust: 8, dealMomentum: 3, riskLevel: -4, probabilityDelta: -14 },
      onFailure: { clientTrust: -2, dealMomentum: -2, probabilityDelta: 6 },
    },
    {
      id: 'golf_club_invitation',
      title: 'Golf Club Invitation',
      actions: [
        'Invite Ricardo to a club setting to build personal rapport.',
        'Test whether he values social chemistry over pure advisor brand.',
        'Accept that the move can either unlock trust fast or backfire as tone-deaf.',
      ],
      budgetCost: 1,
      capacityCost: 3,
      successChance: 0.5,
      catastrophicFailureChance: 0.1,
      onSuccess: { clientTrust: 12, dealMomentum: 4, probabilityDelta: -16 },
      onFailure: { clientTrust: -6, reputation: -3, probabilityDelta: 8 },
      catastrophicHeadline: 'Client Rejected Social Positioning',
      catastrophicDescription:
        'Ricardo read the golf club invitation as superficial and misaligned. The relationship broke down immediately.',
    },
  ];
}

const CATEGORY_PLANS: Record<string, RiskMitigationPlan[]> = {
  client: [
    {
      id: 'stakeholder_alignment_sprint',
      title: 'Stakeholder Alignment Sprint',
      actions: [
        'Mapear decisores e desalinhamentos do cliente.',
        'Executar 2 sessões de alinhamento executivo.',
        'Publicar plano de comunicação semanal formal.',
      ],
      budgetCost: 2,
      capacityCost: 8,
      successChance: 0.74,
      onSuccess: { clientTrust: 7, dealMomentum: 4, riskLevel: -6, probabilityDelta: -18 },
      onFailure: { clientTrust: -4, dealMomentum: -3, riskLevel: 5, probabilityDelta: 8 },
    },
    {
      id: 'partner_intervention',
      title: 'Partner Intervention Track',
      actions: [
        'Envolver partner sénior em reuniões críticas.',
        'Re-negociar expectativas de valuation e timeline.',
        'Formalizar governance com checkpoints quinzenais.',
      ],
      budgetCost: 3,
      capacityCost: 6,
      successChance: 0.7,
      onSuccess: { clientTrust: 6, reputation: 3, riskLevel: -5, probabilityDelta: -15 },
      onFailure: { clientTrust: -5, riskLevel: 5, probabilityDelta: 8 },
    },
  ],
  buyer: [
    {
      id: 'buyer_reengagement_pack',
      title: 'Buyer Re-Engagement Pack',
      actions: [
        'Preparar pack de respostas estratégicas por buyer.',
        'Reabrir calls 1:1 com decision-makers.',
        'Atualizar racional de valor por sinergia.',
      ],
      budgetCost: 2,
      capacityCost: 7,
      successChance: 0.71,
      onSuccess: { dealMomentum: 6, reputation: 2, riskLevel: -6, probabilityDelta: -16 },
      onFailure: { dealMomentum: -4, riskLevel: 6, probabilityDelta: 10 },
    },
    {
      id: 'targeted_management_roadshow',
      title: 'Targeted Management Roadshow',
      actions: [
        'Agendar mini-roadshow com equipa de gestão.',
        'Cobrir objeções técnicas em sessões dedicadas.',
        'Atualizar data points críticos antes de follow-up.',
      ],
      budgetCost: 4,
      capacityCost: 10,
      successChance: 0.68,
      onSuccess: { dealMomentum: 7, clientTrust: 3, riskLevel: -5, probabilityDelta: -15 },
      onFailure: { morale: -4, dealMomentum: -3, riskLevel: 6, probabilityDelta: 9 },
    },
  ],
  diligence: [
    {
      id: 'dd_control_tower',
      title: 'DD Control Tower',
      actions: [
        'Criar sala de guerra de DD com owners por tema.',
        'Impor SLA de 48h para respostas críticas.',
        'Publicar log diário de bloqueios e decisões.',
      ],
      budgetCost: 3,
      capacityCost: 9,
      successChance: 0.73,
      onSuccess: { dealMomentum: 4, riskLevel: -8, probabilityDelta: -20 },
      onFailure: { morale: -3, riskLevel: 6, probabilityDelta: 10 },
    },
    {
      id: 'specialist_gap_closure',
      title: 'Specialist Gap Closure',
      actions: [
        'Contratar especialistas para tópicos de maior fricção.',
        'Executar revisão independente de documentação crítica.',
        'Fechar lacunas com evidência auditável.',
      ],
      budgetCost: 5,
      capacityCost: 6,
      successChance: 0.78,
      onSuccess: { reputation: 4, riskLevel: -9, probabilityDelta: -22 },
      onFailure: { budget: -1, riskLevel: 5, probabilityDelta: 9 },
    },
  ],
  legal: [
    {
      id: 'legal_redline_sprint',
      title: 'Legal Redline Sprint',
      actions: [
        'Reforçar equipa legal para ronda intensiva de redlines.',
        'Negociar fallback clauses com buyer counsel.',
        'Fixar pontos não negociáveis com cliente.',
      ],
      budgetCost: 4,
      capacityCost: 7,
      successChance: 0.7,
      onSuccess: { dealMomentum: 3, riskLevel: -7, probabilityDelta: -18 },
      onFailure: { dealMomentum: -3, riskLevel: 7, probabilityDelta: 10 },
    },
    {
      id: 'outside_counsel_escalation',
      title: 'Outside Counsel Escalation',
      actions: [
        'Escalar para counsel externo especialista.',
        'Obter opinião escrita sobre riscos de cláusulas críticas.',
        'Reforçar posição negocial com precedentes.',
      ],
      budgetCost: 5,
      capacityCost: 5,
      successChance: 0.75,
      onSuccess: { reputation: 3, riskLevel: -8, probabilityDelta: -20 },
      onFailure: { budget: -1, riskLevel: 5, probabilityDelta: 8 },
    },
  ],
  financing: [
    {
      id: 'financing_contingency_track',
      title: 'Financing Contingency Track',
      actions: [
        'Mapear alternativas de financiamento em paralelo.',
        'Atualizar buyer com estrutura de fallback.',
        'Blindar cronograma de signing/closing.',
      ],
      budgetCost: 3,
      capacityCost: 6,
      successChance: 0.69,
      onSuccess: { dealMomentum: 5, riskLevel: -6, probabilityDelta: -17 },
      onFailure: { dealMomentum: -4, riskLevel: 6, probabilityDelta: 10 },
    },
    {
      id: 'banking_advisor_fastlane',
      title: 'Banking Advisor Fastlane',
      actions: [
        'Trazer advisor de debt/financing para fast review.',
        'Garantir cartas de conforto adicionais.',
        'Reduzir risco de retração na última milha.',
      ],
      budgetCost: 5,
      capacityCost: 5,
      successChance: 0.74,
      onSuccess: { dealMomentum: 4, reputation: 2, riskLevel: -7, probabilityDelta: -18 },
      onFailure: { budget: -1, riskLevel: 5, probabilityDelta: 8 },
    },
  ],
  timing: [
    {
      id: 'critical_path_replan',
      title: 'Critical Path Replan',
      actions: [
        'Rebaselinar caminho crítico com marcos diários.',
        'Eliminar dependências não essenciais.',
        'Redistribuir equipa para desbloqueio imediato.',
      ],
      budgetCost: 2,
      capacityCost: 10,
      successChance: 0.72,
      onSuccess: { dealMomentum: 6, riskLevel: -6, probabilityDelta: -16 },
      onFailure: { morale: -4, riskLevel: 6, probabilityDelta: 10 },
    },
    {
      id: 'parallel_workstream_push',
      title: 'Parallel Workstream Push',
      actions: [
        'Executar frentes em paralelo com owners dedicados.',
        'Aumentar cadência de governance para 2x por semana.',
        'Fechar decisões em 24h para itens bloqueados.',
      ],
      budgetCost: 3,
      capacityCost: 9,
      successChance: 0.7,
      onSuccess: { dealMomentum: 5, riskLevel: -5, probabilityDelta: -15 },
      onFailure: { morale: -5, dealMomentum: -3, probabilityDelta: 10 },
    },
  ],
  team: [
    {
      id: 'team_load_rebalancing',
      title: 'Team Load Rebalancing',
      actions: [
        'Rebalancear carga entre séniores e mid-level.',
        'Cortar backlog não crítico por 1 semana.',
        'Definir rota de recuperação de moral.',
      ],
      budgetCost: 1,
      capacityCost: 4,
      successChance: 0.77,
      onSuccess: { morale: 8, teamCapacity: 6, riskLevel: -5, probabilityDelta: -14 },
      onFailure: { morale: -3, riskLevel: 4, probabilityDelta: 8 },
    },
    {
      id: 'targeted_external_support',
      title: 'Targeted External Support',
      actions: [
        'Alocar suporte externo para tarefas de pico.',
        'Proteger equipa core de burnout.',
        'Manter output crítico sem sacrificar qualidade.',
      ],
      budgetCost: 4,
      capacityCost: 3,
      successChance: 0.74,
      onSuccess: { morale: 6, teamCapacity: 5, riskLevel: -5, probabilityDelta: -13 },
      onFailure: { budget: -1, morale: -2, probabilityDelta: 7 },
    },
  ],
  market: [
    {
      id: 'market_repositioning_memo',
      title: 'Market Repositioning Memo',
      actions: [
        'Reformular equity story para contexto macro adverso.',
        'Atualizar comparables e tese de defensibilidade.',
        'Recomunicar narrativa aos buyers ativos.',
      ],
      budgetCost: 2,
      capacityCost: 7,
      successChance: 0.71,
      onSuccess: { dealMomentum: 4, reputation: 3, riskLevel: -5, probabilityDelta: -14 },
      onFailure: { dealMomentum: -4, riskLevel: 5, probabilityDelta: 9 },
    },
    {
      id: 'countercyclical_buyer_expansion',
      title: 'Counter-Cyclical Buyer Expansion',
      actions: [
        'Expandir universo para buyers contracíclicos.',
        'Ativar redes internacionais de coverage.',
        'Criar shortlist alternativa para preservar competição.',
      ],
      budgetCost: 4,
      capacityCost: 8,
      successChance: 0.67,
      onSuccess: { dealMomentum: 6, reputation: 2, riskLevel: -4, probabilityDelta: -13 },
      onFailure: { dealMomentum: -3, riskLevel: 6, probabilityDelta: 9 },
    },
  ],
};

export function getRiskMitigationPlans(risk: Risk): RiskMitigationPlan[] {
  const name = risk.name.toLowerCase();
  if (name.includes('founder') && name.includes('serious')) {
    return founderCommitmentPlans();
  }
  if (name.includes('competing advisor') || name.includes('competitor')) {
    return competingAdvisorPlans();
  }
  return CATEGORY_PLANS[risk.category] ?? CATEGORY_PLANS.market;
}
