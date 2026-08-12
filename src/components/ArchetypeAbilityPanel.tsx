import { CheckCircle2, Sparkles, Zap } from 'lucide-react';
import { getArchetype } from '../content/archetypes';
import { getArchetypeAbilityAvailability } from '../engine/archetypeAbilities';
import { useGameStore } from '../store/gameStore';
import Panel from './ui/Panel';

export default function ArchetypeAbilityPanel() {
  const state = useGameStore();
  const archetype = getArchetype(state.advisorArchetype);
  if (!archetype) return null;

  const availability = getArchetypeAbilityAvailability({
    advisorArchetype: state.advisorArchetype,
    usedAbilityId: state.archetypeAbilityUse?.abilityId ?? null,
    phase: state.phase,
    resources: state.resources,
    buyers: state.buyers,
    risks: state.risks,
  });
  const used = state.archetypeAbilityUse;

  return (
    <Panel
      title={`${archetype.name} — Active mandate ability`}
      subtitle="One visible, consequential action per mandate"
      variant="accent"
      headerRight={used ? (
        <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-state-success">
          <CheckCircle2 size={12} /> Used Day {used.day}
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-text-accent">
          <Zap size={12} /> 1 use ready
        </span>
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="shrink-0 text-text-accent" />
            <p className="text-[13px] font-semibold text-text-primary">{archetype.ability.name}</p>
          </div>
          <p className="mt-1.5 max-w-2xl text-[11px] leading-relaxed text-text-secondary">{archetype.ability.description}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {archetype.ability.effects.map((effect) => (
              <span key={effect} className="rounded-full border border-border-subtle bg-surface-default px-2 py-1 text-[9px] font-mono text-text-muted">{effect}</span>
            ))}
          </div>
          <p className={`mt-2 text-[10px] ${availability.available ? 'text-state-success' : 'text-text-muted'}`}>
            {availability.reason}
          </p>
        </div>
        <button
          type="button"
          onClick={state.useArchetypeAbility}
          disabled={!availability.available}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-[var(--radius-md)] bg-accent-primary px-4 py-2.5 text-[12px] font-semibold text-white hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-surface-default disabled:text-text-muted"
        >
          <Zap size={13} /> {used ? 'Ability spent' : archetype.ability.command}
        </button>
      </div>
    </Panel>
  );
}
