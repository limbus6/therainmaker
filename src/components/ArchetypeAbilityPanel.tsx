import { CheckCircle2, Sparkles, Zap } from 'lucide-react';
import { getArchetype } from '../content/archetypes';
import { getArchetypeAbilityAvailability } from '../engine/archetypeAbilities';
import { useGameStore } from '../store/gameStore';

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
    <div className="flex flex-col gap-3 rounded-[var(--radius-md)] border border-border-subtle bg-surface-default px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-text-accent">
          <Sparkles size={13} />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="text-[11px] font-semibold text-text-primary">{archetype.ability.name}</p>
            <span className="text-[9px] font-mono uppercase tracking-wider text-text-muted">{archetype.name} edge</span>
            {used && <span className="inline-flex items-center gap-1 text-[9px] text-state-success"><CheckCircle2 size={10} /> Used</span>}
          </div>
          <p className="mt-0.5 truncate text-[10px] text-text-muted" title={archetype.ability.effects.join(' · ')}>
            {used ? `Used on Day ${used.day}.` : `${archetype.ability.effects.slice(0, 3).join(' · ')} — ${availability.reason}`}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={state.useArchetypeAbility}
        disabled={!availability.available}
        title={archetype.ability.description}
        className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-[var(--radius-sm)] border border-border-accent bg-border-accent/10 px-3 py-1.5 text-[10px] font-semibold text-text-accent hover:bg-border-accent/20 disabled:cursor-not-allowed disabled:border-border-subtle disabled:bg-transparent disabled:text-text-muted"
      >
        <Zap size={11} /> {used ? 'Ability spent' : archetype.ability.command}
      </button>
    </div>
  );
}
