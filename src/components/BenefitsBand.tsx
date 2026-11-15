import { useRef } from 'react';
import { benefits } from '../data/siteContent';
import { useReveal } from '../motion/useReveal';
import { WaveDivider } from './WaveDivider';
import './BenefitsBand.css';

export function BenefitsBand() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref, { selector: '[data-reveal]', stagger: 0.08 });
  return (
    <section ref={ref} id="why" className="benefits" aria-labelledby="why-title">
      <WaveDivider edge="top" />
      <div className="benefits__inner section-pad">
        <h2 id="why-title" className="benefits__title display" data-reveal>
          {benefits.heading}
        </h2>
        <ul className="benefits__list">
          {benefits.items.map((item) => (
            <li key={item.title} className="benefits__item" data-reveal>
              <h3 className="benefits__item-title display">{item.title}</h3>
              <p className="benefits__item-body">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
      <WaveDivider edge="bottom" />
    </section>
  );
}
