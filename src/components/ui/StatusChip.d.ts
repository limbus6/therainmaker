type ChipVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'accent' | 'muted';
interface StatusChipProps {
    label: string;
    variant?: ChipVariant;
    size?: 'sm' | 'md';
}
export default function StatusChip({ label, variant, size }: StatusChipProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=StatusChip.d.ts.map