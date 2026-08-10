import type { GameEvent, EventDirectorState, TensionCategory, PlayerResources, Risk, Email } from '../types/game';
import type { SeededRng } from './rng';
export interface EventDirectorConfig<TState = unknown> {
    id: string;
    phases: number[];
    baseProbability: number;
    weight?: number;
    cooldownDays?: number;
    chainId?: string;
    chainStep?: number;
    tensionCategory?: TensionCategory;
    condition?: (state: TState) => boolean;
    generate: (state: TState, rng: SeededRng) => {
        event: GameEvent;
        resourceEffects?: Partial<PlayerResources>;
        riskGenerated?: Risk;
        emailGenerated?: Email;
    };
}
export declare function createInitialEventDirectorState(): EventDirectorState;
export interface SelectionResult<TState = unknown> {
    selectedTemplates: EventDirectorConfig<TState>[];
    nextDirectorState: EventDirectorState;
}
/**
 * Selects 0 to maxEvents eligible events using weighted selection, seeded RNG,
 * cooldown enforcement, tension balancing, and chain progression.
 */
export declare function selectEvents<TState extends {
    phase: number;
    day: number;
    risks?: Risk[];
}>(pool: EventDirectorConfig<TState>[], state: TState, directorState: EventDirectorState, daysElapsed: number, rng: SeededRng, maxEvents?: number): SelectionResult<TState>;
//# sourceMappingURL=eventDirector.d.ts.map