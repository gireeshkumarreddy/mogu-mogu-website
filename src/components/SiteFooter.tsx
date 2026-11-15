import { useRef } from 'react';
import { finale, footer, nav } from '../data/siteContent';
import { flavours } from '../data/flavours';
import { handleAnchorClick } from '../motion/navigation';
import { useReveal } from '../motion/useReveal';
import { Picture } from './Picture';
import { Logo, MotionToggle } from './SiteHeader';
import './SiteFooter.css';

export function SiteFooter() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref, { selector: '[data-reveal]', stagger: 0.07, y: 24 });
  return (
    <>
      <section ref={ref} className="finale section-pad" aria-labelledby="finale-title">
        <div className="finale__panel">
          <div className="finale__palm finale__palm--left" aria-hidden="true">
            <Picture asset="palm" alt="" sizes="(min-width: 900px) 16vw, 30vw" />
          </div>
          <div className="finale__palm finale__palm--right" aria-hidden="true">
            <Picture asset="palm" alt="" sizes="(min-width: 900px) 16vw, 30vw" />
          </div>
          <h2 id="finale-title" className="finale__title display" data-reveal>
            {finale.heading}
          </h2>
          <ul className="finale__bottles" aria-hidden="true">
            {flavours.map((f, i) => (
              <li key={f.id} data-reveal style={{ rotate: `${[-7, -2, 3, 8][i]}deg` }}>
                <Picture asset={f.bottle} alt="" sizes="(min-width: 900px) 70px, 14vw" />
              </li>
            ))}
          </ul>
          <a className="btn btn--dark finale__cta" href={finale.button.href} onClick={handleAnchorClick} data-reveal>
            {finale.button.label}
          </a>
        </div>
      </section>

      <footer className="footer section-pad">
        <div className="footer__top">
          <a href="#top" onClick={handleAnchorClick} className="footer__brand" aria-label="Mogu Mogu, back to top">
            <Logo />
          </a>
          <nav aria-label="Footer">
            <ul className="footer__links">
              {nav.links.map((l) => (
                <li key={l.href}>
                  <a href={l.href} onClick={handleAnchorClick}>
                    {l.label}
                  </a>
                </li>
              ))}
              <li>
                <a href="#selector" onClick={handleAnchorClick}>
                  Pick your flavour
                </a>
              </li>
              <li>
                <a href={footer.official.href} target="_blank" rel="noopener noreferrer">
                  {footer.official.label}
                  <span className="sr-only"> (opens in a new tab)</span>
                  <span aria-hidden="true"> ↗</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>
        <div className="footer__bottom">
          <MotionToggle />
        </div>
      </footer>
    </>
  );
}
