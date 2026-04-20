import type { PhaseId } from '../types/game';
interface Props {
    fromPhase: PhaseId;
    toPhase: PhaseId;
    onComplete: () => void;
}
export default function PhaseTransitionOverlay({ fromPhase, toPhase, onComplete }: Props): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=PhaseTransitionOverlay.d.ts.map