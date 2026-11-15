import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { flavours, flavourById, type FlavourId } from '../data/flavours';
import { selector } from '../data/siteContent';
import { bestSrc } from '../data/assets';
import { gsap } from '../motion/gsap';
import { useMotion } from '../motion/MotionContext';
import { Picture } from './Picture';
import './FlavourSelector.css';

interface Props {
  selected: FlavourId;
  onSelect: (id: FlavourId) => void;
  onExplore: (id: FlavourId, trigger: HTMLElement) => void;
}

export function FlavourSelector({ selected, onSelect, onExplore }: Props) {
  const { motionOn } = useMotion();
  const [shown, setShown] = useState<FlavourId>(selected);
  const swapRefs = useRef<HTMLElement[]>([]);
  const firstRun = useRef(true);
  const f = flavourById(shown);

  useEffect(() => {
    const id = window.setTimeout(() => {
      flavours.forEach((x) => {
        [bestSrc(x.bottle, 260), bestSrc(x.backdrop, 460)].forEach((src) => {
          const img = new Image();
          img.src = src;
        });
      });
    }, 1200);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (selected === shown) return;
    const els = swapRefs.current.filter(Boolean);
    if (!motionOn) {
      setShown(selected);
      return;
    }
    const tween = gsap.to(els, {
      autoAlpha: 0,
      y: 10,
      duration: 0.16,
      ease: 'power1.in',
      onComplete: () => setShown(selected),
    });
    return () => {
      tween.kill();
    };
  }, [selected, shown, motionOn]);

  useLayoutEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    const els = swapRefs.current.filter(Boolean);
    if (!motionOn) {
      gsap.set(els, { clearProps: 'opacity,visibility,transform' });
      return;
    }
    gsap.set(els, { autoAlpha: 0, y: -10 });
    const imgs = els.flatMap((el) => Array.from(el.querySelectorAll('img')));
    let cancelled = false;
    Promise.all(imgs.map((img) => img.decode().catch(() => undefined))).then(() => {
      if (cancelled) return;
      gsap.to(els, { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power2.out', stagger: 0.03, clearProps: 'transform' });
    });
    return () => {
      cancelled = true;
    };
  }, [shown, motionOn]);

  const setSwap = (i: number) => (el: HTMLElement | null) => {
    if (el) swapRefs.current[i] = el;
  };

  const style = { '--accent': f.accent, '--on-accent': f.onAccent, '--tint': f.tint } as CSSProperties;

  return (
    <section id="selector" className="selector section-pad" aria-labelledby="selector-title">
      <div className="selector__panel" style={style}>
        <div className="selector__stage">
          <div className="selector__stage-inner" ref={setSwap(0)}>
            <Picture
              key={`bg-${f.id}`}
              asset={f.backdrop}
              alt=""
              sizes="(min-width: 900px) 34vw, 90vw"
              className="selector__bg"
            />
            <Picture
              key={`b-${f.id}`}
              asset={f.bottle}
              alt={f.bottleAlt}
              sizes="(min-width: 900px) 14vw, 34vw"
              className="selector__bottle"
            />
          </div>
        </div>

        <div className="selector__side">
          <p className="eyebrow selector__eyebrow">{selector.eyebrow}</p>
          <h2 id="selector-title" className="selector__title display">
            {selector.heading}
          </h2>

          <fieldset className="selector__options">
            <legend className="sr-only">{selector.legend}</legend>
            {flavours.map((x) => (
              <label
                key={x.id}
                className={`pill${x.id === selected ? ' is-checked' : ''}`}
                style={{ '--swatch': x.accent } as CSSProperties}
              >
                <input
                  type="radio"
                  name="flavour"
                  value={x.id}
                  checked={x.id === selected}
                  onChange={() => onSelect(x.id)}
                />
                <span className="pill__swatch" aria-hidden="true" />
                {x.name}
              </label>
            ))}
          </fieldset>

          <div className="selector__info" ref={setSwap(1)} aria-live="polite">
            <h3 className="selector__name display">{f.name}</h3>
            <p className="selector__desc">{f.description}</p>
            <dl className="selector__facts">
              <div>
                <dt>Texture</dt>
                <dd>Chewy nata de coco</dd>
              </div>
              <div>
                <dt>In the bottle</dt>
                <dd>{f.drink}</dd>
              </div>
              <div>
                <dt>Packaging</dt>
                <dd>{f.label}</dd>
              </div>
            </dl>
          </div>
          <button
            type="button"
            className="btn btn--dark selector__cta"
            aria-haspopup="dialog"
            onClick={(e) => onExplore(f.id, e.currentTarget)}
          >
            Explore {f.name}
          </button>
        </div>
      </div>
    </section>
  );
}
