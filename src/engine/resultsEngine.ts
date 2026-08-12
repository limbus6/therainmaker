import type { GameStore } from '../store/gameStore';
import type { ProcessCategory, ProcessScoringModel } from '../types/game';
import { PHASE_BASE_BUDGETS } from '../config/phaseBudgets';
import {
  PROCESS_CATEGORY_LABELS,
  calculateCausalProcessScore,
} from './processScoring';

const TOTAL_GAME_BUDGET = Object.values(PHASE_BASE_BUDGETS).reduce((a, b) => a + b, 0); // ~265 k€

// ============================================
// Results Board — Endgame Scoring Engine
// ============================================

export interface ResultsBoard {
  dealOutcome: 'deal_failed' | 'closed_with_friction' | 'clean_close' | 'premium_close';
  financial: {
    closingValue: number;       // €M
    feePercent: number;
    successFee: number;         // €k — base success fee
    ratchetBonus: number;       // €k — ratchet payout when closing clears the threshold
    retainerIncome: number;     // €k — retainer collected across the mandate
    totalAdvisoryFee: number;   // €k — retainer + success fee + ratchet
    internalCost: number;       // €k — budget spent
    netProjectProfit: number;   // €k
    projectMargin: number;      // 0-1
    budgetVariance: number;     // €k — positive = under budget
  };
  client: {
    satisfaction: number;       // 0-100
    trust: number;
    expectationFit: number;
    rehireProbability: number;
    label: 'Disappointed' | 'Satisfied' | 'Very Satisfied' | 'Trusted Advisor';
  };
  team: {
    morale: number;
    burnout: number;            // inverse of morale history
    cohesion: number;
    pride: number;
    label: 'Burnt Out' | 'Strained' | 'Solid' | 'Strong';
  };
  process: {
    judgment: number;
    execution: number;
    stakeholder: number;
    risk: number;
    negotiation: number;
    model: ProcessScoringModel;
    difficultyAdjustment: number;
  };
  career: {
    reputationGain: number;
    rainmakerScore: number;
    sectorCredibilityGain: number;
  };
  style: {
    decisionsTaken: number;
    riskProfile: 'Controlled' | 'Balanced' | 'Aggressive';
    riskControl: number;
    relationshipIndex: number;
    abilityUsed: boolean;
  };
  scores: {
    financialScore: number;
    clientScore: number;
    teamScore: number;
    processScore: number;
    careerImpactScore: number;
    overallDealScore: number;
    overallGrade: 'Weak Outcome' | 'Acceptable Outcome' | 'Strong Outcome' | 'Excellent Outcome' | 'Elite Rainmaker Outcome';
  };
  debrief: DebriefFinding[];
}

export interface DebriefFinding {
  headline: string;
  explanation: string;
  tone: 'positive' | 'warning' | 'neutral';
  sourceRecordId?: string;
}

// --- Financial Score ---
function calculateFinancialScore(state: GameStore): ResultsBoard['financial'] & { score: number } {
  const dealClosed = state.phase === 10;
  const baseValue = 120; // €M baseline for Solara Systems

  let closingValue = 0;
  let score = 0;
  
  const selectedOffer = state.finalOffers?.find((o) => o.buyerId === state.preferredBidderId);
  const preferredBuyer = state.buyers?.find((b) => b.id === state.preferredBidderId);

  if (dealClosed) {
    if (selectedOffer && preferredBuyer) {
      const executionMultiplier = preferredBuyer.executionCredibility / 100;
      const conditionDiscount = 
        selectedOffer.conditionality === 'clean' ? 1.0 :
        selectedOffer.conditionality === 'light_conditions' ? 0.95 :
        selectedOffer.conditionality === 'heavy_conditions' ? 0.85 : 1.0;
        
      closingValue = Math.round(selectedOffer.totalEV * executionMultiplier * conditionDiscount);
      
      const cashCertainty = selectedOffer.totalEV > 0 ? selectedOffer.cashEV / selectedOffer.totalEV : 0;
      const structureScore = 
        selectedOffer.structure === 'full_cash' ? 1.0 :
        selectedOffer.structure === 'mixed' ? 0.75 : 0.5;
      const combinedCashScore = (cashCertainty + structureScore) / 2;

      const conditionScore = 
        selectedOffer.conditionality === 'clean' ? 1.0 :
        selectedOffer.conditionality === 'light_conditions' ? 0.75 :
        0.5;
        
      const benchmarkMultiple = 10;
      const multipleScore = Math.min(1.0, selectedOffer.impliedMultiple / benchmarkMultiple);
      const executionScore = preferredBuyer.executionCredibility / 100;
      
      score += 25 * combinedCashScore;
      score += 25 * conditionScore;
      score += 25 * multipleScore;
      score += 25 * executionScore;
    } else {
      const momentumMod = state.resources.dealMomentum / 100;
      closingValue = Math.round(baseValue * (0.7 + momentumMod * 0.5));
    }
  }

  const feePercent = state.agreedFeeTerms
    ? state.agreedFeeTerms.successFeePercent / 100
    : 0.015;
  const successFee = dealClosed ? Math.round(closingValue * feePercent * 1000) : 0; // €k

  // The agreed structure is the strategy: a ratchet only pays when the close
  // clears its threshold, and retainers pay whether or not the deal lands.
  const terms = state.agreedFeeTerms;
  const ratchetBonus = dealClosed && terms?.ratchetEnabled && terms.ratchetThresholdEV !== undefined
    && closingValue >= terms.ratchetThresholdEV
    ? Math.round((closingValue - terms.ratchetThresholdEV) * ((terms.ratchetBonusPercent ?? 0) / 100) * 1000)
    : 0;
  const monthsRetained = terms ? Math.max(0, Math.floor((state.week - terms.agreedWeek) / 4)) : 0;
  const phasesRetained = Object.keys(state.phaseEntryDay ?? {}).filter((p) => Number(p) >= 2).length;
  const retainerIncome = !terms ? 0
    : terms.retainerType === 'monthly' ? terms.retainerAmount * monthsRetained
    : terms.retainerType === 'per_phase' ? terms.retainerAmount * phasesRetained
    : terms.retainerType === 'upfront' ? terms.retainerAmount
    : 0;
  const totalAdvisoryFee = successFee + ratchetBonus + retainerIncome;

  // Cumulative spend: sum all previous phases + current phase spend
  const currentPhaseSpent = Math.max(0, state.resources.budgetMax - state.resources.budget);
  const totalSpent = (state.totalBudgetSpent ?? 0) + currentPhaseSpent;
  const internalCost = Math.round(totalSpent * 2.4); // Convert budget units to €k cost
  const netProjectProfit = totalAdvisoryFee - internalCost;
  const projectMargin = totalAdvisoryFee > 0 ? netProjectProfit / totalAdvisoryFee : 0;
  // Budget efficiency: what fraction of total game budget was NOT spent
  const budgetEfficiency = Math.max(0, 1 - totalSpent / TOTAL_GAME_BUDGET);
  const budgetVariance = Math.round(TOTAL_GAME_BUDGET - totalSpent); // k€ unspent

  if (dealClosed && !(selectedOffer && preferredBuyer)) {
    // Score: 0-100 fallback logic
    score += 20; // base for closing
    score += Math.min(20, Math.max(0, projectMargin) * 22);
    score += Math.min(25, (closingValue / baseValue) * 20);
    score += Math.min(20, budgetEfficiency * 25);
    score += Math.min(15, successFee > 0 ? 15 : 0);
  }
  
  score = Math.round(Math.max(0, Math.min(100, score)));

  return {
    closingValue,
    feePercent,
    successFee,
    ratchetBonus,
    retainerIncome,
    totalAdvisoryFee,
    internalCost,
    netProjectProfit: Math.round(netProjectProfit),
    projectMargin: Math.round(projectMargin * 100) / 100,
    budgetVariance,
    score,
  };
}

// --- Client Score ---
function calculateClientScore(state: GameStore): ResultsBoard['client'] & { score: number } {
  const trust = state.resources.clientTrust;
  const momentum = state.resources.dealMomentum;

  const satisfaction = Math.round(trust * 0.5 + momentum * 0.3 + state.resources.reputation * 0.2);
  const expectationFit = Math.round(momentum * 0.6 + trust * 0.4);
  const rehireProbability = Math.round(trust * 0.6 + satisfaction * 0.4);

  const score = Math.round(satisfaction * 0.3 + trust * 0.3 + expectationFit * 0.2 + rehireProbability * 0.2);

  const label: ResultsBoard['client']['label'] =
    score >= 80 ? 'Trusted Advisor' :
    score >= 60 ? 'Very Satisfied' :
    score >= 40 ? 'Satisfied' : 'Disappointed';

  return { satisfaction, trust, expectationFit, rehireProbability, label, score };
}

// --- Team Score ---
function calculateTeamScore(state: GameStore): ResultsBoard['team'] & { score: number } {
  const morale = state.resources.morale;
  // Burnout is inverse of morale + capacity pressure
  const burnout = Math.max(0, 100 - morale - (state.resources.teamCapacity > 50 ? 10 : -10));
  const cohesion = Math.round(morale * 0.6 + (state.resources.teamCapacity / state.resources.teamCapacityMax) * 40);
  // Pride based on momentum and deal progress
  const pride = Math.round(state.resources.dealMomentum * 0.5 + morale * 0.3 + state.resources.reputation * 0.2);

  const score = Math.round(morale * 0.35 + (100 - burnout) * 0.25 + cohesion * 0.2 + pride * 0.2);

  const label: ResultsBoard['team']['label'] =
    score >= 75 ? 'Strong' :
    score >= 55 ? 'Solid' :
    score >= 35 ? 'Strained' : 'Burnt Out';

  return { morale, burnout, cohesion, pride, label, score };
}

// --- Process Score ---
function calculateProcessScore(state: GameStore): ResultsBoard['process'] & { score: number } {
  if (state.scoringModelVersion === 'causal-v2') {
    const causal = calculateCausalProcessScore(state.processLog ?? [], state.mandateDifficulty);
    return {
      judgment: causal.categories.judgment,
      execution: causal.categories.execution,
      stakeholder: causal.categories.stakeholder,
      risk: causal.categories.risk,
      negotiation: causal.categories.negotiation,
      model: 'causal-v2',
      difficultyAdjustment: causal.difficultyAdjustment,
      score: causal.score,
    };
  }

  // Historical saves retain the v1 end-state formula so an upgrade does not
  // silently rewrite the meaning of a run that was already in progress.
  const totalTasks = state.tasks.length;
  const completedTasks = state.tasks.filter((t) => t.status === 'completed').length;
  const completionRate = totalTasks > 0 ? completedTasks / totalTasks : 0;

  const activeBuyers = state.buyers.filter((b) => !['dropped', 'excluded'].includes(b.status)).length;
  const totalBuyers = state.buyers.length;
  const buyerRetention = totalBuyers > 0 ? activeBuyers / totalBuyers : 0;

  // Retired risks remain in the historical log but no longer dilute execution quality.
  const scoreableRisks = state.risks.filter((risk) => !risk.retired);
  const mitigatedRisks = scoreableRisks.filter((risk) => risk.mitigated).length;
  const totalRisks = scoreableRisks.length;
  const riskMitigation = totalRisks > 0 ? mitigatedRisks / totalRisks : 1;

  const processQuality = Math.round(completionRate * 100);
  const buyerManagement = Math.round(buyerRetention * 60 + state.resources.dealMomentum * 0.4);
  const riskControl = Math.round(riskMitigation * 60 + (100 - state.resources.riskLevel) * 0.4);
  const negotiationQuality = Math.round(state.resources.reputation * 0.5 + state.resources.dealMomentum * 0.3 + state.resources.clientTrust * 0.2);
  const closingQuality = Math.round(state.resources.dealMomentum * 0.4 + processQuality * 0.3 + (100 - state.resources.riskLevel) * 0.3);

  const score = Math.round(
    processQuality * 0.25 + buyerManagement * 0.2 + riskControl * 0.2 + negotiationQuality * 0.2 + closingQuality * 0.15
  );

  return {
    judgment: Math.round((processQuality + negotiationQuality) / 2),
    execution: processQuality,
    stakeholder: buyerManagement,
    risk: riskControl,
    negotiation: negotiationQuality,
    model: 'legacy-v1',
    difficultyAdjustment: 0,
    score,
  };
}

// --- Career Impact Score ---
function calculateCareerScore(state: GameStore, financialScore: number, processScore: number): ResultsBoard['career'] & { score: number } {
  const reputationGain = Math.round(state.resources.reputation * 0.3 + financialScore * 0.3 + processScore * 0.4) - 40;
  const rainmakerScore = Math.round(financialScore * 0.35 + processScore * 0.3 + state.resources.clientTrust * 0.2 + state.resources.reputation * 0.15);
  const sectorCredibilityGain = Math.round(state.resources.reputation * 0.4 + state.resources.dealMomentum * 0.3 + financialScore * 0.3) - 30;

  const score = Math.round(rainmakerScore);

  return {
    reputationGain: Math.max(-20, Math.min(30, reputationGain)),
    rainmakerScore: Math.max(0, Math.min(100, rainmakerScore)),
    sectorCredibilityGain: Math.max(-10, Math.min(25, sectorCredibilityGain)),
    score: Math.max(0, Math.min(100, score)),
  };
}

function calculateStyleStats(state: GameStore): ResultsBoard['style'] {
  const liveBuyerChemistry = state.buyers
    .filter((buyer) => !['dropped', 'excluded'].includes(buyer.status))
    .map((buyer) => Number.isFinite(buyer.chemistryWithSeller) ? buyer.chemistryWithSeller : 50);
  const buyerRelationship = liveBuyerChemistry.length > 0
    ? liveBuyerChemistry.reduce((sum, value) => sum + value, 0) / liveBuyerChemistry.length
    : state.resources.clientTrust;
  const relationshipIndex = Math.round((state.resources.clientTrust * 0.6) + (buyerRelationship * 0.4));
  const riskControl = Math.max(0, Math.min(100, 100 - state.resources.riskLevel));
  const riskProfile: ResultsBoard['style']['riskProfile'] = riskControl >= 75
    ? 'Controlled'
    : riskControl >= 50
      ? 'Balanced'
      : 'Aggressive';

  return {
    decisionsTaken: new Set((state.processLog ?? []).map((record) => record.dedupeKey)).size,
    riskProfile,
    riskControl,
    relationshipIndex,
    abilityUsed: !!state.archetypeAbilityUse,
  };
}

// --- Legacy context (used only for migrated saves without a causal log) ---
function generateLegacyDrivers(state: GameStore): string[] {
  const drivers: string[] = [];

  // Financial drivers — evaluate against total game budget (TOTAL_GAME_BUDGET k€)
  const currentPhaseSpentForDrivers = Math.max(0, state.resources.budgetMax - state.resources.budget);
  const totalSpentForDrivers = (state.totalBudgetSpent ?? 0) + currentPhaseSpentForDrivers;
  const spendRatio = totalSpentForDrivers / TOTAL_GAME_BUDGET;
  if (spendRatio < 0.45) {
    drivers.push('Disciplined budget management preserved project economics.');
  } else if (spendRatio > 0.75) {
    drivers.push('Heavy budget expenditure compressed project margins.');
  }

  // Client drivers
  if (state.resources.clientTrust >= 70) {
    drivers.push('Strong client trust built through consistent communication and good counsel.');
  } else if (state.resources.clientTrust < 40) {
    drivers.push('Weak client relationship reduced satisfaction and referral potential.');
  }

  // Team drivers
  if (state.resources.morale >= 70) {
    drivers.push('Team morale held through disciplined workload management.');
  } else if (state.resources.morale < 40) {
    drivers.push('Heavy deal pressure materially reduced team morale and execution quality.');
  }

  // Process drivers
  const completionRate = state.tasks.filter((t) => t.status === 'completed').length / Math.max(1, state.tasks.length);
  if (completionRate >= 0.7) {
    drivers.push('High task completion rate demonstrated strong process control.');
  }

  // Buyer drivers
  const activeBuyers = state.buyers.filter((b) => !['dropped', 'excluded'].includes(b.status)).length;
  if (activeBuyers >= 3) {
    drivers.push('Effective buyer management sustained competitive tension through the process.');
  } else if (activeBuyers <= 1 && state.buyers.length > 0) {
    drivers.push('Narrow buyer field eliminated competitive leverage in later phases.');
  }

  // Risk drivers
  if (state.resources.riskLevel > 60) {
    drivers.push('Elevated risk levels throughout the deal undermined execution confidence.');
  } else if (state.resources.riskLevel < 20) {
    drivers.push('Clean risk profile supported stable deal progression.');
  }

  // Momentum drivers
  if (state.resources.dealMomentum >= 70) {
    drivers.push('Strong deal momentum drove buyer conviction and improved final pricing.');
  }

  return drivers.slice(0, 5);
}

function buildReservationReveals(state: GameStore): DebriefFinding[] {
  const reveals: DebriefFinding[] = [];
  const fee = state.feeNegotiation;
  if (fee && (fee.status === 'agreed' || fee.status === 'failed')) {
    reveals.push({
      headline: 'What the client would have signed',
      explanation: `The workable success-fee corridor was ${fee.clientState.reservationSuccessFeeMin.toFixed(2)}%–${fee.clientState.reservationSuccessFeeMax.toFixed(2)}%. This is revealed only after the negotiation ends.`,
      tone: 'neutral',
    });
  }

  const spa = state.spaNegotiation;
  if (spa && (spa.status === 'agreed' || spa.status === 'failed')) {
    reveals.push({
      headline: 'Where the buyer could have settled',
      explanation: `The buyer's minimum positions were a ${spa.buyerState.reservationWarrantyCap}% warranty cap and ${spa.buyerState.reservationEscrowPercent}% escrow. This is revealed only after the negotiation ends.`,
      tone: 'neutral',
    });
  }
  return reveals;
}

function generateDebrief(state: GameStore): DebriefFinding[] {
  const reservationReveals = buildReservationReveals(state);
  const availableMomentSlots = Math.max(3, 5 - reservationReveals.length);

  if (state.scoringModelVersion === 'causal-v2' && (state.processLog?.length ?? 0) > 0) {
    const ranked = [...state.processLog].sort((a, b) => {
      const impactA = a.weight * (0.5 + Math.abs(a.rating - 0.5));
      const impactB = b.weight * (0.5 + Math.abs(b.rating - 0.5));
      return impactB - impactA || b.day - a.day || a.id.localeCompare(b.id);
    });

    // Start with different disciplines so one busy mechanic cannot monopolise
    // the debrief, then use the remaining highest-impact moments.
    const selected = ranked.reduce<typeof ranked>((moments, record) => {
      if (moments.length >= availableMomentSlots) return moments;
      if (!moments.some((moment) => moment.category === record.category)) moments.push(record);
      return moments;
    }, []);
    for (const record of ranked) {
      if (selected.length >= availableMomentSlots) break;
      if (!selected.some((moment) => moment.id === record.id)) selected.push(record);
    }

    const moments: DebriefFinding[] = selected.map((record) => ({
      headline: record.headline,
      explanation: `${record.explanation} ${PROCESS_CATEGORY_LABELS[record.category as ProcessCategory]}: ${Math.round(record.rating * 100)}/100.`,
      tone: record.rating >= 0.7 ? 'positive' : record.rating <= 0.45 ? 'warning' : 'neutral',
      sourceRecordId: record.id,
    }));
    return [...moments, ...reservationReveals].slice(0, 5);
  }

  const legacy: DebriefFinding[] = generateLegacyDrivers(state).map((explanation) => ({
    headline: state.scoringModelVersion === 'legacy-v1' ? 'Legacy run context' : 'Run context',
    explanation,
    tone: 'neutral',
  }));
  return [...legacy.slice(0, Math.max(0, 5 - reservationReveals.length)), ...reservationReveals].slice(0, 5);
}

// ============================================
// Main Results Board Calculation
// ============================================

export function buildResultsBoard(state: GameStore): ResultsBoard {
  const dealClosed = state.phase === 10;

  const financial = calculateFinancialScore(state);
  const client = calculateClientScore(state);
  const team = calculateTeamScore(state);
  const process = calculateProcessScore(state);
  const career = calculateCareerScore(state, financial.score, process.score);
  const style = calculateStyleStats(state);

  // Overall score: weighted blend
  const overallDealScore = Math.round(
    financial.score * 0.35 +
    client.score * 0.20 +
    team.score * 0.15 +
    process.score * 0.20 +
    career.score * 0.10
  );

  const overallGrade: ResultsBoard['scores']['overallGrade'] =
    overallDealScore >= 85 ? 'Elite Rainmaker Outcome' :
    overallDealScore >= 70 ? 'Excellent Outcome' :
    overallDealScore >= 55 ? 'Strong Outcome' :
    overallDealScore >= 35 ? 'Acceptable Outcome' : 'Weak Outcome';

  const dealOutcome: ResultsBoard['dealOutcome'] =
    !dealClosed ? 'deal_failed' :
    overallDealScore >= 70 ? 'premium_close' :
    overallDealScore >= 50 ? 'clean_close' : 'closed_with_friction';

  const scores: ResultsBoard['scores'] = {
    financialScore: financial.score,
    clientScore: client.score,
    teamScore: team.score,
    processScore: process.score,
    careerImpactScore: career.score,
    overallDealScore,
    overallGrade,
  };

  const debrief = generateDebrief(state);

  return {
    dealOutcome,
    financial: {
      closingValue: financial.closingValue,
      feePercent: financial.feePercent,
      successFee: financial.successFee,
      ratchetBonus: financial.ratchetBonus,
      retainerIncome: financial.retainerIncome,
      totalAdvisoryFee: financial.totalAdvisoryFee,
      internalCost: financial.internalCost,
      netProjectProfit: financial.netProjectProfit,
      projectMargin: financial.projectMargin,
      budgetVariance: financial.budgetVariance,
    },
    client: {
      satisfaction: client.satisfaction,
      trust: client.trust,
      expectationFit: client.expectationFit,
      rehireProbability: client.rehireProbability,
      label: client.label,
    },
    team: {
      morale: team.morale,
      burnout: team.burnout,
      cohesion: team.cohesion,
      pride: team.pride,
      label: team.label,
    },
    process: {
      judgment: process.judgment,
      execution: process.execution,
      stakeholder: process.stakeholder,
      risk: process.risk,
      negotiation: process.negotiation,
      model: process.model,
      difficultyAdjustment: process.difficultyAdjustment,
    },
    career: {
      reputationGain: career.reputationGain,
      rainmakerScore: career.rainmakerScore,
      sectorCredibilityGain: career.sectorCredibilityGain,
    },
    style,
    scores,
    debrief,
  };
}
