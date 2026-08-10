// ============================================
// GSAP Motion & Animation Utilities
// ============================================
// Reusable motion wrappers respecting prefers-reduced-motion.

import gsap from 'gsap';

/** Checks if user prefers reduced motion */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Animates numeric counter smoothly from startValue to endValue */
export function animateCounter(
  element: HTMLElement | null,
  startValue: number,
  endValue: number,
  duration = 0.8,
  prefix = '',
  suffix = ''
): gsap.core.Tween | null {
  if (!element) return null;
  if (prefersReducedMotion()) {
    element.textContent = `${prefix}${endValue}${suffix}`;
    return null;
  }

  const obj = { val: startValue };
  return gsap.to(obj, {
    val: endValue,
    duration,
    ease: 'power2.out',
    onUpdate: () => {
      element.textContent = `${prefix}${Math.round(obj.val)}${suffix}`;
    },
  });
}

/** Staggered reveal for list items or card grids */
export function staggerReveal(
  elements: (HTMLElement | null)[],
  staggerTime = 0.08,
  duration = 0.4
): gsap.core.Tween | null {
  const validElements = elements.filter((el): el is HTMLElement => el !== null);
  if (validElements.length === 0) return null;
  if (prefersReducedMotion()) return null;

  return gsap.fromTo(
    validElements,
    { opacity: 0, y: 10 },
    { opacity: 1, y: 0, duration, stagger: staggerTime, ease: 'power2.out' }
  );
}

/** Shake feedback for errors or rejected negotiation offers */
export function shakeFeedback(element: HTMLElement | null): gsap.core.Tween | null {
  if (!element || prefersReducedMotion()) return null;

  return gsap.fromTo(
    element,
    { x: -6 },
    { x: 6, duration: 0.08, repeat: 3, yoyo: true, ease: 'sine.inOut' }
  );
}

/** Pulsing glow animation for active CTAs or major events */
export function pulseGlow(element: HTMLElement | null, color = 'rgba(240, 79, 165, 0.4)'): gsap.core.Tween | null {
  if (!element || prefersReducedMotion()) return null;

  return gsap.fromTo(
    element,
    { boxShadow: `0 0 0px ${color}` },
    { boxShadow: `0 0 20px ${color}`, duration: 0.5, yoyo: true, repeat: 1, ease: 'power2.out' }
  );
}
