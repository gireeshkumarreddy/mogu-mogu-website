import { useLayoutEffect, type RefObject } from 'react';
import { gsap, isSmallScreen } from './gsap';
import { useMotion } from './MotionContext';

interface RevealOptions {
  selector: string;
  y?: number;
  stagger?: number;
  duration?: number;
  start?: string;
}

export function useReveal(
  ref: RefObject<HTMLElement | null>,
  { selector, y = 26, stagger = 0.08, duration = 0.55, start = 'top 82%' }: RevealOptions,
) {
  const { motionOn } = useMotion();
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || !motionOn) return;
    const ctx = gsap.context(() => {
      const els = root.querySelectorAll(selector);
      if (!els.length) return;
      gsap.from(els, {
        y: isSmallScreen() ? y * 0.6 : y,
        autoAlpha: 0,
        duration,
        stagger,
        ease: 'power3.out',
        clearProps: 'transform,opacity,visibility',
        scrollTrigger: { trigger: root, start, once: true },
      });
    }, root);
    return () => ctx.revert();
  }, [ref, motionOn, selector, y, stagger, duration, start]);
}
