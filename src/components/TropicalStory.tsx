import { useRef } from 'react';
import { story } from '../data/siteContent';
import { useReveal } from '../motion/useReveal';
import { Picture } from './Picture';
import './TropicalStory.css';

const CUBES = [
  { x: '8%', y: '18%', s: 26, r: -14 },
  { x: '88%', y: '12%', s: 20, r: 18 },
  { x: '80%', y: '74%', s: 30, r: 32 },
  { x: '16%', y: '78%', s: 18, r: 8 },
];

export function TropicalStory() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref, { selector: '[data-reveal]', stagger: 0.1, y: 22 });
  return (
    <section ref={ref} id="story" className="story section-pad" aria-labelledby="story-title">
      <div className="story__panel">
        <div className="story__palm story__palm--left" aria-hidden="true">
          <Picture asset="palm" alt="" sizes="(min-width: 900px) 18vw, 34vw" />
        </div>
        <div className="story__palm story__palm--right" aria-hidden="true">
          <Picture asset="palm" alt="" sizes="(min-width: 900px) 18vw, 34vw" />
        </div>
        {CUBES.map((c, i) => (
          <span
            key={i}
            className="story__cube"
            aria-hidden="true"
            style={{ left: c.x, top: c.y, width: c.s, height: c.s, rotate: `${c.r}deg` }}
          />
        ))}
        <div className="story__copy">
          <p className="eyebrow story__eyebrow" data-reveal>
            Our story
          </p>
          <h2 id="story-title" className="story__title display" data-reveal>
            {story.headingLines.map((line) => (
              <span key={line} className="story__line">
                {line}
              </span>
            ))}
          </h2>
          <p className="story__body" data-reveal>
            {story.body}
          </p>
        </div>
      </div>
    </section>
  );
}
