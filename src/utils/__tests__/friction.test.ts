import { describe, expect, it } from 'vitest';
import type { Email, GameTask } from '../../types/game';
import { getRoutineEmails, getRoutineTasks } from '../friction';
import { formatTaskEffectSummary } from '../effectLabels';

describe('M0.5 friction batching', () => {
  it('never batches mail that carries a response choice', () => {
    const base = {
      week: 1, phase: 2, sender: 'System', body: 'Update', preview: 'Update', timestamp: 'Day 1',
      category: 'system', state: 'unread', priority: 'normal',
    } satisfies Omit<Email, 'id' | 'subject'>;
    const informational = { ...base, id: 'info', subject: 'FYI' } as Email;
    const decision = {
      ...base, id: 'decision', subject: 'Choose', responseOptions: [{ id: 'yes', label: 'Approve' }],
    } as Email;

    expect(getRoutineEmails([informational, decision], 2).map((email) => email.id)).toEqual(['info']);
  });

  it('keeps strategic, relationship, and recommended work out of the routine queue', () => {
    const makeTask = (id: string, category: GameTask['category'], status: GameTask['status'] = 'available') => ({
      id, name: id, description: id, phase: 2, category, status, cost: 0, work: 1,
      complexity: 'low', effectSummary: id,
    }) as GameTask;
    const tasks = [
      makeTask('internal', 'internal'),
      makeTask('document', 'deliverable'),
      makeTask('strategy', 'strategic'),
      makeTask('relationship', 'relationship'),
      makeTask('recommended', 'internal', 'recommended'),
    ];

    expect(getRoutineTasks(tasks, 2).map((task) => task.id)).toEqual(['internal', 'document']);
  });

  it('does not promise exact movement in the derived momentum view', () => {
    expect(formatTaskEffectSummary('+8 momentum, +5 trust')).toBe('advances live process, +5 trust');
    expect(formatTaskEffectSummary('-3 deal momentum if delayed')).toBe('may slow live process if delayed');
  });
});
