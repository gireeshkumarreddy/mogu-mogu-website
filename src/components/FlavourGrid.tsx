import { useLayoutEffect, useRef } from 'react';
import { flavours, type FlavourId } from '../data/flavours';
import { flavourGrid } from '../data/siteContent';
import { gsap, isSmallScreen } from '../motion/gsap';
import { useMotion } from '../motion/MotionContext';
import { handleAnchorClick } from '../motion/navigation';
import { FlavourCard } from './FlavourCard';
import './FlavourGrid.css';

export function FlavourGrid({ onExplore }: { onExplore: (id: FlavourId, trigger: HTMLElement) => void }) {
  const ref = useRef<HTMLElement>(null);
  const { motionOn } = useMotion();

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || !motionOn) return;
    const ctx = gsap.context(() => {
      const distance = isSmallScreen() ? 34 : 60;
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.querySelector('.grid'), start: 'top 78%', once: true },
        defaults: { clearProps: 'transform,opacity,visibility' },
      });
      tl.from('.section-head > *', { y: 22, autoAlpha: 0, duration: 0.5, stagger: 0.07, ease: 'power3.out' }, 0)
        .from('.card__bg-reveal', { autoAlpha: 0, scale: 1.06, duration: 0.6, stagger: 0.11, ease: 'power2.out' }, 0.05)
        .from(
          '.card__bottle-reveal',
          { y: distance, autoAlpha: 0, duration: 0.65, stagger: 0.11, ease: 'power3.out' },
          0.12,
        )
        .from('.card__body', { y: 14, autoAlpha: 0, duration: 0.45, stagger: 0.11, ease: 'power2.out' }, 0.3)
        .from('.grid-more', { autoAlpha: 0, duration: 0.4 }, 0.7);
    }, root);
    return () => ctx.revert();
  }, [motionOn]);

  return (
    <section ref={ref} id="flavours" className="flavours section-pad" aria-labelledby="flavours-title">
      <div className="section-head">
        <h2 id="flavours-title" className="flavours__title display">
          {flavourGrid.heading}
        </h2>
        <p className="flavours__intro">{flavourGrid.intro}</p>
      </div>
      <ul className="grid">
        {flavours.map((f, i) => (
          <FlavourCard key={f.id} flavour={f} index={i} onExplore={onExplore} />
        ))}
      </ul>
      <a className="text-link grid-more" href={flavourGrid.more.href} onClick={handleAnchorClick}>
        {flavourGrid.more.label} <span aria-hidden="true">→</span>
      </a>
    </section>
  );
}
