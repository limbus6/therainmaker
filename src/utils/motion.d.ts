/** Checks if user prefers reduced motion */
export declare function prefersReducedMotion(): boolean;
/** Animates numeric counter smoothly from startValue to endValue */
export declare function animateCounter(element: HTMLElement | null, startValue: number, endValue: number, duration?: number, prefix?: string, suffix?: string): gsap.core.Tween | null;
/** Staggered reveal for list items or card grids */
export declare function staggerReveal(elements: (HTMLElement | null)[], staggerTime?: number, duration?: number): gsap.core.Tween | null;
/** Shake feedback for errors or rejected negotiation offers */
export declare function shakeFeedback(element: HTMLElement | null): gsap.core.Tween | null;
/** Pulsing glow animation for active CTAs or major events */
export declare function pulseGlow(element: HTMLElement | null, color?: string): gsap.core.Tween | null;
//# sourceMappingURL=motion.d.ts.map