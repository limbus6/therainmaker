import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../gameStore';
import { ADVISOR_ARCHETYPES } from '../../content/archetypes';

describe('advisor archetypes', () => {
  beforeEach(() => {
    useGameStore.setState({
      advisorArchetype: null,
      resources: { ...useGameStore.getState().resources, clientTrust: 40, reputation: 50 },
    });
  });

  it('applies disclosed one-time start modifiers on selection', () => {
    useGameStore.getState().selectArchetype('shark');
    const s = useGameStore.getState();
    expect(s.advisorArchetype).toBe('shark');
    expect(s.resources.clientTrust).toBe(37);   // -3
    expect(s.resources.reputation).toBe(55);    // +5
  });

  it('is one identity per run — reselection is a no-op', () => {
    useGameStore.getState().selectArchetype('shark');
    useGameStore.getState().selectArchetype('relationship_banker');
    const s = useGameStore.getState();
    expect(s.advisorArchetype).toBe('shark');
    expect(s.resources.reputation).toBe(55);
  });

  it('reduces deliverable work for the technician on current tasks', () => {
    useGameStore.setState({
      tasks: [
        { id: 't-del', name: 'CIM', description: '', phase: 0, category: 'deliverable', status: 'available', cost: 0, work: 10, complexity: 'medium', effectSummary: '' },
        { id: 't-mkt', name: 'Scan', description: '', phase: 0, category: 'market', status: 'available', cost: 0, work: 10, complexity: 'medium', effectSummary: '' },
      ],
    });
    useGameStore.getState().selectArchetype('technician');
    const tasks = useGameStore.getState().tasks;
    expect(tasks.find((t) => t.id === 't-del')?.work).toBe(9); // 10 * 0.85 rounded
    expect(tasks.find((t) => t.id === 't-mkt')?.work).toBe(10);
  });

  it('gives the shark extra negotiation patience at fee init', () => {
    useGameStore.setState({ advisorArchetype: 'shark', feeNegotiation: null });
    useGameStore.getState().presentPitch();
    expect(useGameStore.getState().feeNegotiation?.clientState.patienceRemaining).toBe(115);
  });

  it('migrates pre-v11 saves to the neutral (null) archetype', async () => {
    const migrate = useGameStore.persist.getOptions().migrate;
    const migrated = await migrate!({ advisorArchetype: 'shark' }, 10) as Record<string, unknown>;
    expect(migrated.advisorArchetype).toBeNull();
  });

  it('declares every archetype with disclosed effects copy', () => {
    for (const archetype of ADVISOR_ARCHETYPES) {
      expect(archetype.effects.length).toBeGreaterThan(0);
      expect(archetype.tagline.length).toBeGreaterThan(10);
    }
  });
});
