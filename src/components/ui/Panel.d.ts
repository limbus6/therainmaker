import type { ReactNode } from 'react';
interface PanelProps {
    children: ReactNode;
    title?: string;
    subtitle?: string;
    variant?: 'default' | 'elevated' | 'accent' | 'critical';
    className?: string;
    headerRight?: ReactNode;
}
export default function Panel({ children, title, subtitle, variant, className, headerRight }: PanelProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=Panel.d.ts.map