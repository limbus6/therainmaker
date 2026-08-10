interface KpiTileProps {
    label: string;
    value: string | number;
    /** Rendered before/after numeric values, e.g. "€" / "k". Only used when value is a number. */
    prefix?: string;
    suffix?: string;
    trend?: 'up' | 'down' | 'stable';
    color?: 'default' | 'success' | 'warning' | 'danger' | 'accent';
    onClick?: () => void;
    /** Attributable change from the last advance; shows a floating chip. */
    delta?: number;
    deltaReason?: string;
    /** Changes to this key retrigger the delta chip (e.g. current game day). */
    deltaKey?: string | number;
    /** When true, positive deltas are bad (e.g. risk level). */
    invertDelta?: boolean;
}
export default function KpiTile({ label, value, prefix, suffix, trend, color, onClick, delta, deltaReason, deltaKey, invertDelta, }: KpiTileProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=KpiTile.d.ts.map