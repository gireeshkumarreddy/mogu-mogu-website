import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { hero } from '../data/siteContent';
import type { AssetKey } from '../data/assets';
import { Picture } from './Picture';
import { gsap, ScrollTrigger, canHover, isMotionOn } from '../motion/gsap';
import { buildHeroTimeline, settleHero, type HandRig, type HeroRig } from '../motion/heroTimeline';
import { handleAnchorClick, registerIntroFinisher } from '../motion/navigation';
import { useMotion } from '../motion/MotionContext';
import './HeroCheers.css';

const SESSION_KEY = 'mogu:intro';
const DECODE_TIMEOUT_MS = 2600;
const markPlayed = () => {
  try {
    sessionStorage.setItem(SESSION_KEY, 'played');
  } catch {}
};
const alreadyPlayed = () => {
  try {
    return sessionStorage.getItem(SESSION_KEY) === 'played';
  } catch {
    return false;
  }
};

type Side = 'centre' | 'left' | 'right';
const HANDS: { side: Side; asset: AssetKey; sizes: string; edges: [number, number][] }[] = [
  {
    side: 'centre',
    asset: 'handCentre',
    sizes: '(min-width: 1280px) 18vw, (min-width: 900px) 22vw, 28vw',
    edges: [
      [13, 12.5],
      [87, 12.5],
    ],
  },
  {
    side: 'left',
    asset: 'handLeft',
    sizes: '(min-width: 1280px) 37vw, (min-width: 900px) 44vw, 64vw',
    edges: [[95, 24]],
  },
  {
    side: 'right',
    asset: 'handRight',
    sizes: '(min-width: 1280px) 37vw, (min-width: 900px) 44vw, 64vw',
    edges: [[3.5, 24]],
  },
];

function Drop() {
  return (
    <svg className="drop" viewBox="0 0 12 16" aria-hidden="true">
      <path d="M6 0C6 0 0 7.2 0 10.4A6 6 0 0 0 12 10.4C12 7.2 6 0 6 0Z" />
    </svg>
  );
}

type Phase = 'pending' | 'intro' | 'settled';

export function HeroCheers() {
  const { motionOn } = useMotion();
  const heroRef = useRef<HTMLElement>(null);
  const run = useRef<{ tl: gsap.core.Timeline | null; ctx: gsap.Context | null; detach: () => void }>({
    tl: null,
    ctx: null,
    detach: () => {},
  });
  const [phase, setPhase] = useState<Phase>('pending');

  const collectRig = useCallback((): HeroRig | null => {
    const root = heroRef.current;
    if (!root) return null;
    const q = <T extends HTMLElement>(sel: string) => root.querySelector<T>(sel)!;
    const hand = (side: Side): HandRig => ({
      layout: q(`.hand--${side}`),
      intro: q(`.hand--${side} .hand__intro`),
      pivot: q(`.hand--${side} [data-marker="pivot"]`),
      edge: q(`.hand--${side} [data-marker="edge-0"]`),
      edgeB: root.querySelector<HTMLElement>(`.hand--${side} [data-marker="edge-1"]`) ?? undefined,
    });
    return {
      hero: root,
      centre: hand('centre'),
      left: hand('left'),
      right: hand('right'),
      lines: Array.from(root.querySelectorAll<HTMLElement>('.hero__word')),
      sub: q('.hero__sub'),
      ctas: q('.hero__ctas'),
      extras: [q('.hero__replay')],
      dropsLeft: q('.hero__drops--left'),
      dropsRight: q('.hero__drops--right'),
    };
  }, []);

  const finish = useCallback(() => {
    const r = run.current;
    const tl = r.tl;
    if (!tl) return;

    r.tl = null;
    r.detach();
    tl.eventCallback('onComplete', null);
    tl.progress(1);
    tl.kill();
    r.ctx?.revert();
    r.ctx = null;
    const rig = collectRig();
    if (rig) settleHero(rig);
    markPlayed();
    setPhase('settled');
  }, [collectRig]);

  const start = useCallback(
    (waitForImages: boolean) => {
      const rig = collectRig();
      if (!rig) return;
      finish();
      const r = run.current;
      let started = false;
      let timer = 0;

      r.ctx = gsap.context(() => {
        r.tl = buildHeroTimeline(rig);
      }, heroRef);
      const tl = r.tl!;
      tl.eventCallback('onComplete', () => {
        if (run.current.tl === tl) finish();
      });

      const interrupt = () => {
        if (run.current.tl === tl) finish();
      };
      const onKey = (e: KeyboardEvent) => {
        if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'End', 'Home', ' ', 'Escape'].includes(e.key)) interrupt();
      };
      const onScroll = () => {
        if (window.scrollY > 4) interrupt();
      };

      const startWidth = window.innerWidth;
      const onResize = () => {
        if (Math.abs(window.innerWidth - startWidth) > 24) interrupt();
      };
      window.addEventListener('wheel', interrupt, { passive: true });
      window.addEventListener('touchmove', interrupt, { passive: true });
      window.addEventListener('keydown', onKey);
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onResize);
      r.detach = () => {
        window.clearTimeout(timer);
        window.removeEventListener('wheel', interrupt);
        window.removeEventListener('touchmove', interrupt);
        window.removeEventListener('keydown', onKey);
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onResize);
        r.detach = () => {};
      };

      setPhase('intro');
      const go = () => {
        if (started || run.current.tl !== tl) return;
        started = true;
        window.clearTimeout(timer);
        tl.play(0);
      };
      if (!waitForImages) {
        go();
        return;
      }

      timer = window.setTimeout(() => {
        if (!started) interrupt();
      }, DECODE_TIMEOUT_MS);
      const imgs = Array.from(heroRef.current!.querySelectorAll<HTMLImageElement>('img[data-critical]'));
      Promise.all(
        imgs.map((img) =>
          (img.complete && img.naturalWidth
            ? img.decode()
            : new Promise((res) => {
                img.addEventListener('load', () => img.decode().then(res, res), { once: true });
                img.addEventListener('error', res, { once: true });
              })
          ).catch(() => undefined),
        ),
      )
        .then(() => {
          const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
          return Promise.race([fonts?.ready ?? Promise.resolve(), new Promise((res) => setTimeout(res, 400))]);
        })
        .then(go);
    },
    [collectRig, finish],
  );

  useLayoutEffect(() => {
    const rig = collectRig();
    registerIntroFinisher(finish);
    if (!rig) return;
    try {
      if (!isMotionOn() || alreadyPlayed()) {
        settleHero(rig);
        setPhase('settled');
      } else {
        start(true);
      }
    } catch (err) {
      console.error(err);
      settleHero(rig);
      setPhase('settled');
    }
    return () => {
      registerIntroFinisher(null);
      const r = run.current;
      r.detach();
      r.tl?.kill();
      r.tl = null;
      r.ctx?.revert();
      r.ctx = null;
    };
  }, [collectRig, finish, start]);

  useEffect(() => {
    if (!motionOn) finish();
  }, [motionOn, finish]);

  useLayoutEffect(() => {
    if (!motionOn) return;
    const root = heroRef.current!;
    const ctx = gsap.context(() => {
      const st = { trigger: root, start: 'top top', end: 'bottom top', scrub: 0.4 };
      gsap.fromTo('.hero__sky-scroll', { yPercent: 0 }, { yPercent: 14, ease: 'none', scrollTrigger: st });
      gsap.fromTo('.hero__palm-scroll', { yPercent: 0 }, { yPercent: 9, ease: 'none', scrollTrigger: { ...st } });
    }, root);
    return () => ctx.revert();
  }, [motionOn]);

  useEffect(() => {
    if (!motionOn || phase !== 'settled' || !canHover()) return;
    const root = heroRef.current!;
    const layers = [
      { el: root.querySelector('.hand--left .hand__parallax'), x: 9, y: 5 },
      { el: root.querySelector('.hand--right .hand__parallax'), x: 9, y: 5 },
      { el: root.querySelector('.hand--centre .hand__parallax'), x: 5, y: 3 },
      { el: root.querySelector('.hero__palm--left .hero__palm-parallax'), x: -4, y: -2 },
      { el: root.querySelector('.hero__palm--right .hero__palm-parallax'), x: -4, y: -2 },
    ].filter((l) => l.el) as { el: HTMLElement; x: number; y: number }[];
    const movers = layers.map((l) => ({
      ...l,
      qx: gsap.quickTo(l.el, 'x', { duration: 0.9, ease: 'power3.out' }),
      qy: gsap.quickTo(l.el, 'y', { duration: 0.9, ease: 'power3.out' }),
    }));
    const onMove = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
      const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
      movers.forEach((m) => {
        m.qx(nx * m.x);
        m.qy(ny * m.y);
      });
    };
    const onLeave = () => movers.forEach((m) => (m.qx(0), m.qy(0)));
    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerleave', onLeave);
    return () => {
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerleave', onLeave);
      gsap.killTweensOf(layers.map((l) => l.el));
      gsap.set(
        layers.map((l) => l.el),
        { clearProps: 'transform' },
      );
    };
  }, [motionOn, phase]);

  useEffect(() => {
    if (phase !== 'settled') return;
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 50);
    return () => window.clearTimeout(id);
  }, [phase]);

  const onReplay = () => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    start(false);
  };

  return (
    <section ref={heroRef} id="top" className={`hero hero--${phase}`} aria-labelledby="hero-title">
      <div className="hero__sky" aria-hidden="true">
        <div className="hero__sky-scroll">
          <Picture
            asset="heroSky"
            alt=""
            sizes="(min-width: 1280px) 74vw, 100vw"
            priority
            data-critical
            className="hero__sky-img"
          />
        </div>
      </div>

      {(['left', 'right'] as const).map((side) => (
        <div key={side} className={`hero__palm hero__palm--${side}`} aria-hidden="true">
          <div className="hero__palm-scroll">
            <div className="hero__palm-parallax">
              <Picture asset="palm" alt="" sizes="(min-width: 900px) 26vw, 40vw" priority />
            </div>
          </div>
        </div>
      ))}

      <div className="hero__copy">
        <h1 id="hero-title" className="hero__title display">
          {hero.lines.map((line, i) => (
            <span key={i} className="hero__line">
              {line.map((word, j) => (
                <Fragment key={word}>
                  {j > 0 && ' '}
                  <span className="hero__word">{word}</span>
                </Fragment>
              ))}
            </span>
          ))}
        </h1>
        <p className="hero__sub">{hero.sub}</p>
        <div className="hero__ctas">
          <a className="btn btn--dark" href={hero.primary.href} onClick={handleAnchorClick}>
            {hero.primary.label}
          </a>
          <a className="btn btn--light" href={hero.secondary.href} onClick={handleAnchorClick}>
            <svg viewBox="0 0 14 14" aria-hidden="true">
              <path
                d="M3 1.8v10.4a.8.8 0 0 0 1.2.7l8.4-5.2a.8.8 0 0 0 0-1.4L4.2 1.1A.8.8 0 0 0 3 1.8Z"
                fill="currentColor"
              />
            </svg>
            {hero.secondary.label}
          </a>
        </div>
      </div>

      <div className="hero__stage">
        <div className="hero__hands" role="img" aria-label={hero.handsAlt}>
          {HANDS.map(({ side, asset, sizes, edges }) => (
            <div key={side} className={`hand hand--${side}`}>
              <div className="hand__parallax">
                <div className="hand__intro">
                  <Picture asset={asset} alt="" sizes={sizes} priority data-critical className="hand__img" />
                  <i className="hand__marker" data-marker="pivot" />
                  {edges.map(([x, y], i) => (
                    <i
                      key={i}
                      className="hand__marker"
                      data-marker={`edge-${i}`}
                      style={{ left: `${x}%`, top: `${y}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
          <div className="hero__drops hero__drops--left" aria-hidden="true">
            <Drop />
            <Drop />
            <Drop />
            <Drop />
          </div>
          <div className="hero__drops hero__drops--right" aria-hidden="true">
            <Drop />
            <Drop />
            <Drop />
            <Drop />
          </div>
        </div>
      </div>

      <button type="button" className="hero__replay" onClick={onReplay} disabled={phase === 'intro'}>
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path
            d="M13.5 8A5.5 5.5 0 1 1 11.9 4.1M12 1.5v3h-3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {hero.replay}
      </button>
    </section>
  );
}
