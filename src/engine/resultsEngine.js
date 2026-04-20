import { PHASE_BASE_BUDGETS } from '../config/phaseBudgets';
const TOTAL_GAME_BUDGET = Object.values(PHASE_BASE_BUDGETS).reduce((a, b) => a + b, 0); // ~265 k€
// --- Financial Score ---
function calculateFinancialScore(state) {
    const dealClosed = state.phase === 10;
    // Base closing value derived from deal momentum and preparation quality
    const baseValue = 120; // €M baseline for Solara Systems
    const momentumMod = state.resources.dealMomentum / 100;
    const closingValue = dealClosed ? Math.round(baseValue * (0.7 + momentumMod * 0.5)) : 0;
    const feePercent = state.agreedFeeTerms
        ? state.agreedFeeTerms.successFeePercent / 100
        : 0.015;
    const successFee = dealClosed ? Math.round(closingValue * feePercent * 1000) : 0; // €k
    // Cumulative spend: sum all previous phases + current phase spend
    const currentPhaseSpent = Math.max(0, state.resources.budgetMax - state.resources.budget);
    const totalSpent = (state.totalBudgetSpent ?? 0) + currentPhaseSpent;
    const internalCost = Math.round(totalSpent * 2.4); // Convert budget units to €k cost
    const netProjectProfit = successFee - internalCost;
    const projectMargin = successFee > 0 ? netProjectProfit / successFee : 0;
    // Budget efficiency: what fraction of total game budget was NOT spent
    const budgetEfficiency = Math.max(0, 1 - totalSpent / TOTAL_GAME_BUDGET);
    const budgetVariance = Math.round(TOTAL_GAME_BUDGET - totalSpent); // k€ unspent
    // Score: 0-100
    // 20 pts: deal closed base
    // 20 pts: margin quality (net profit vs success fee)
    // 25 pts: value creation (closing value vs baseline)
    // 20 pts: budget efficiency (% of total game budget unspent)
    // 15 pts: fee negotiated
    let score = 0;
    if (dealClosed) {
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
        internalCost,
        netProjectProfit: Math.round(netProjectProfit),
        projectMargin: Math.round(projectMargin * 100) / 100,
        budgetVariance,
        score,
    };
}
// --- Client Score ---
function calculateClientScore(state) {
    const trust = state.resources.clientTrust;
    const momentum = state.resources.dealMomentum;
    const satisfaction = Math.round(trust * 0.5 + momentum * 0.3 + state.resources.reputation * 0.2);
    const expectationFit = Math.round(momentum * 0.6 + trust * 0.4);
    const rehireProbability = Math.round(trust * 0.6 + satisfaction * 0.4);
    const score = Math.round(satisfaction * 0.3 + trust * 0.3 + expectationFit * 0.2 + rehireProbability * 0.2);
    const label = score >= 80 ? 'Trusted Advisor' :
        score >= 60 ? 'Very Satisfied' :
            score >= 40 ? 'Satisfied' : 'Disappointed';
    return { satisfaction, trust, expectationFit, rehireProbability, label, score };
}
// --- Team Score ---
function calculateTeamScore(state) {
    const morale = state.resources.morale;
    // Burnout is inverse of morale + capacity pressure
    const burnout = Math.max(0, 100 - morale - (state.resources.teamCapacity > 50 ? 10 : -10));
    const cohesion = Math.round(morale * 0.6 + (state.resources.teamCapacity / state.resources.teamCapacityMax) * 40);
    // Pride based on momentum and deal progress
    const pride = Math.round(state.resources.dealMomentum * 0.5 + morale * 0.3 + state.resources.reputation * 0.2);
    const score = Math.round(morale * 0.35 + (100 - burnout) * 0.25 + cohesion * 0.2 + pride * 0.2);
    const label = score >= 75 ? 'Strong' :
        score >= 55 ? 'Solid' :
            score >= 35 ? 'Strained' : 'Burnt Out';
    return { morale, burnout, cohesion, pride, label, score };
}
// --- Process Score ---
function calculateProcessScore(state) {
    const totalTasks = state.tasks.length;
    const completedTasks = state.tasks.filter((t) => t.status === 'completed').length;
    const completionRate = totalTasks > 0 ? completedTasks / totalTasks : 0;
    const activeBuyers = state.buyers.filter((b) => !['dropped', 'excluded'].includes(b.status)).length;
    const totalBuyers = state.buyers.length;
    const buyerRetention = totalBuyers > 0 ? activeBuyers / totalBuyers : 0;
    const mitigatedRisks = state.risks.filter((r) => r.mitigated).length;
    const totalRisks = state.risks.length;
    const riskMitigation = totalRisks > 0 ? mitigatedRisks / totalRisks : 1;
    const processQuality = Math.round(completionRate * 100);
    const buyerManagement = Math.round(buyerRetention * 60 + state.resources.dealMomentum * 0.4);
    const riskControl = Math.round(riskMitigation * 60 + (100 - state.resources.riskLevel) * 0.4);
    const negotiationQuality = Math.round(state.resources.reputation * 0.5 + state.resources.dealMomentum * 0.3 + state.resources.clientTrust * 0.2);
    const closingQuality = Math.round(state.resources.dealMomentum * 0.4 + processQuality * 0.3 + (100 - state.resources.riskLevel) * 0.3);
    const score = Math.round(processQuality * 0.25 + buyerManagement * 0.2 + riskControl * 0.2 + negotiationQuality * 0.2 + closingQuality * 0.15);
    return { processQuality, buyerManagement, riskControl, negotiationQuality, closingQuality, score };
}
// --- Career Impact Score ---
function calculateCareerScore(state, financialScore, processScore) {
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
// --- Key Drivers ---
function generateKeyDrivers(state, _scores) {
    const drivers = [];
    // Financial drivers — evaluate against total game budget (TOTAL_GAME_BUDGET k€)
    const currentPhaseSpentForDrivers = Math.max(0, state.resources.budgetMax - state.resources.budget);
    const totalSpentForDrivers = (state.totalBudgetSpent ?? 0) + currentPhaseSpentForDrivers;
    const spendRatio = totalSpentForDrivers / TOTAL_GAME_BUDGET;
    if (spendRatio < 0.45) {
        drivers.push('Disciplined budget management preserved project economics.');
    }
    else if (spendRatio > 0.75) {
        drivers.push('Heavy budget expenditure compressed project margins.');
    }
    // Client drivers
    if (state.resources.clientTrust >= 70) {
        drivers.push('Strong client trust built through consistent communication and good counsel.');
    }
    else if (state.resources.clientTrust < 40) {
        drivers.push('Weak client relationship reduced satisfaction and referral potential.');
    }
    // Team drivers
    if (state.resources.morale >= 70) {
        drivers.push('Team morale held through disciplined workload management.');
    }
    else if (state.resources.morale < 40) {
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
    }
    else if (activeBuyers <= 1 && state.buyers.length > 0) {
        drivers.push('Narrow buyer field eliminated competitive leverage in later phases.');
    }
    // Risk drivers
    if (state.resources.riskLevel > 60) {
        drivers.push('Elevated risk levels throughout the deal undermined execution confidence.');
    }
    else if (state.resources.riskLevel < 20) {
        drivers.push('Clean risk profile supported stable deal progression.');
    }
    // Momentum drivers
    if (state.resources.dealMomentum >= 70) {
        drivers.push('Strong deal momentum drove buyer conviction and improved final pricing.');
    }
    return drivers.slice(0, 5);
}
// ============================================
// Main Results Board Calculation
// ============================================
export function buildResultsBoard(state) {
    const dealClosed = state.phase === 10;
    const financial = calculateFinancialScore(state);
    const client = calculateClientScore(state);
    const team = calculateTeamScore(state);
    const process = calculateProcessScore(state);
    const career = calculateCareerScore(state, financial.score, process.score);
    // Overall score: weighted blend
    const overallDealScore = Math.round(financial.score * 0.35 +
        client.score * 0.20 +
        team.score * 0.15 +
        process.score * 0.20 +
        career.score * 0.10);
    const overallGrade = overallDealScore >= 85 ? 'Elite Rainmaker Outcome' :
        overallDealScore >= 70 ? 'Excellent Outcome' :
            overallDealScore >= 55 ? 'Strong Outcome' :
                overallDealScore >= 35 ? 'Acceptable Outcome' : 'Weak Outcome';
    const dealOutcome = !dealClosed ? 'deal_failed' :
        overallDealScore >= 70 ? 'premium_close' :
            overallDealScore >= 50 ? 'clean_close' : 'closed_with_friction';
    const scores = {
        financialScore: financial.score,
        clientScore: client.score,
        teamScore: team.score,
        processScore: process.score,
        careerImpactScore: career.score,
        overallDealScore,
        overallGrade,
    };
    const keyDrivers = generateKeyDrivers(state, scores);
    return {
        dealOutcome,
        financial: {
            closingValue: financial.closingValue,
            feePercent: financial.feePercent,
            successFee: financial.successFee,
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
            processQuality: process.processQuality,
            buyerManagement: process.buyerManagement,
            riskControl: process.riskControl,
            negotiationQuality: process.negotiationQuality,
            closingQuality: process.closingQuality,
        },
        career: {
            reputationGain: career.reputationGain,
            rainmakerScore: career.rainmakerScore,
            sectorCredibilityGain: career.sectorCredibilityGain,
        },
        scores,
        keyDrivers,
    };
}
//# sourceMappingURL=resultsEngine.js.map