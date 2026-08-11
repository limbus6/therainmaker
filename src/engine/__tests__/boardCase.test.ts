import { describe, it, expect } from 'vitest';
import { assessBoardCase } from '../boardCase';
import type { Lead, QualificationNote } from '../../types/game';

function makeLead(overrides: Partial<Lead> = {}): Lead {
  return {
    id: 'solara',
    companyName: 'Solara Systems',
    sector: 'Industrial SaaS',
    founderName: 'Ricardo Mendes',
    origin: 'referral',
    description: '',
    investmentCaseSummary: '',
    investigation: { sector: 'completed', company: 'completed', shareholder: 'completed', market: 'completed' },
    meetingDone: true,
    hiddenMotivations: '',
    hiddenGrowth: 'high',
    hiddenRisk: 'low',
    researchNotes: [],
    ...overrides,
  };
}

function notes(positive: number, negative = 0): QualificationNote[] {
  const list: QualificationNote[] = [];
  for (let i = 0; i < positive; i++) list.push({ id: `p${i}`, week: 1, source: 'team_research', content: 'good', sentiment: 'positive' });
  for (let i = 0; i < negative; i++) list.push({ id: `n${i}`, week: 1, source: 'team_research', content: 'bad', sentiment: 'negative' });
  return list;
}

describe('assessBoardCase', () => {
  it('rates a fully-prepared proceed case at 1.0 with no gaps', () => {
    const a = assessBoardCase({ lead: makeLead(), qualificationNotes: notes(3), recommendation: 'proceed' });
    expect(a.rating).toBe(1);
    expect(a.strength).toBe('strong');
    expect(a.gaps).toHaveLength(0);
  });

  it('rates a thin case low and names the gaps', () => {
    const lead = makeLead({
      investigation: { sector: 'none', company: 'none', shareholder: 'none', market: 'none' },
      meetingDone: false,
    });
    const a = assessBoardCase({ lead, qualificationNotes: [], recommendation: 'proceed' });
    expect(a.rating).toBeLessThan(0.55);
    expect(a.strength).toBe('thin');
    expect(a.gaps.join(' ')).toMatch(/Investigation incomplete/);
    expect(a.gaps.join(' ')).toMatch(/founder meeting/);
  });

  it('treats declining a deal the evidence argues against as good judgment', () => {
    const a = assessBoardCase({ lead: makeLead(), qualificationNotes: notes(1, 3), recommendation: 'decline' });
    expect(a.rating).toBeGreaterThanOrEqual(0.85);
  });

  it('treats declining a well-supported deal as a judgment miss', () => {
    const a = assessBoardCase({ lead: makeLead(), qualificationNotes: notes(4), recommendation: 'decline' });
    expect(a.rating).toBeLessThanOrEqual(0.5);
  });
});
