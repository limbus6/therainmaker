interface KpiTileProps {
    label: string;
    value: string | number;
    trend?: 'up' | 'down' | 'stable';
    color?: 'default' | 'success' | 'warning' | 'danger' | 'accent';
    onClick?: () => void;
}
export default function KpiTile({ label, value, trend, color, onClick }: KpiTileProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=KpiTile.d.ts.map