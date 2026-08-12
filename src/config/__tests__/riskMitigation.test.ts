import { describe, expect, it } from 'vitest';
import { phase3Risks } from '../../content/phase3';
import { getRiskMitigationPlans } from '../riskMitigation';

describe('outreach risk mitigation plans', () => {
  it.each([
    ['Confidentiality Breach', ['confidentiality_control_cell', 'sequenced_outreach_ring']],
    ['NDA Processing Bottleneck', ['nda_triage_lane', 'external_nda_surge']],
    ['Low Response Rate', ['tier_one_reengagement', 'qualified_second_wave']],
  ])('maps %s to risk-specific actions', (riskName, expectedPlanIds) => {
    const risk = phase3Risks.find((candidate) => candidate.name === riskName);
    expect(risk).toBeDefined();
    expect(getRiskMitigationPlans(risk!).map((plan) => plan.id)).toEqual(expectedPlanIds);
  });
});
