import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  forwardRef,
  type CSSProperties,
} from 'react';
import { reveal } from '../data/siteContent';
import { flavourById, type Flavour, type FlavourId } from '../data/flavours';
import { gsap } from '../motion/gsap';
import { useMotion } from '../motion/MotionContext';
import { onNavigate } from '../motion/navigation';
import { Picture } from './Picture';
import './ProductReveal.css';

interface Player {
  play: (fromStart?: boolean) => void;
  pause: () => void;
}

type Status = 'poster' | 'playing' | 'paused' | 'ended';
type Cut = 'full' | 'cut';

const LayeredReveal = forwardRef<
  Player,
  { flavour: Flavour; duration: number; onEnded: () => void; onPlaying: () => void }
>(function LayeredReveal({ flavour, duration, onEnded, onPlaying }, ref) {
  const root = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const t = gsap.timeline({ paused: true, onComplete: onEnded });
      const k = duration / 5;
      t.set('.layers__final', { autoAlpha: 0 }, 0)
        .fromTo(
          '.layers__bottle',
          { yPercent: 46, scale: 0.92, rotation: -5 },
          { yPercent: 0, scale: 1, rotation: -3, duration: 0.45 * k, ease: 'back.out(1.3)' },
          0,
        )
        .fromTo(
          '.layers__wave',
          { yPercent: 0, autoAlpha: 1 },
          { yPercent: 70, autoAlpha: 0, duration: 0.7 * k, ease: 'power2.in' },
          0.3 * k,
        )
        .to('.layers__bottle', { rotation: 3, scale: 1.03, duration: 1.15 * k, ease: 'sine.inOut' }, 0.45 * k)
        .to('.layers__bottle', { rotation: -1, duration: 1 * k, ease: 'sine.inOut' }, 2.5 * k)
        .to('.layers__bottle', { rotation: 0, scale: 1, duration: 0.9 * k, ease: 'power2.out' }, 3.5 * k)
        .to('.layers__final', { autoAlpha: 1, duration: 0.35 * k, ease: 'none' }, 4.25 * k)
        .to({}, { duration: 0.6 * k }, 4.4 * k);
      if (flavour.reveal.splash) {
        t.fromTo(
          '.layers__splash',
          { autoAlpha: 0, scale: 0.55, rotation: -12 },
          { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.9 * k, ease: 'power3.out' },
          1.6 * k,
        )
          .to('.layers__splash', { scale: 1.05, duration: 1 * k, ease: 'sine.inOut' }, 2.5 * k)
          .to('.layers__splash', { scale: 1, duration: 0.9 * k, ease: 'sine.out' }, 3.5 * k);
      }
      tl.current = t;
    }, root);
    return () => ctx.revert();
  }, [duration, onEnded, flavour]);

  useImperativeHandle(ref, () => ({
    play: (fromStart) => {
      const t = tl.current;
      if (!t) return;
      if (fromStart || t.progress() === 1) t.restart();
      else t.play();
      onPlaying();
    },
    pause: () => tl.current?.pause(),
  }));

  return (
    <div ref={root} className="layers" aria-hidden="true" style={{ '--layers-tint': flavour.tint } as CSSProperties}>
      {flavour.reveal.splash && (
        <div className="layers__splash">
          <Picture asset={flavour.reveal.splash} alt="" sizes="(min-width: 900px) 52vw, 90vw" />
        </div>
      )}
      <div className="layers__bottle">
        <Picture asset={flavour.bottle} alt="" sizes="(min-width: 900px) 14vw, 30vw" />
      </div>
      <svg className="layers__wave" viewBox="0 0 400 80" preserveAspectRatio="none">
        <path d="M0 52C60 40 110 18 170 24c40 4 52 26 80 26 40 0 90-28 150-18v48H0Z" fill={flavour.accent} />
      </svg>
      <div className="layers__final">
        <Picture asset={flavour.reveal.poster} alt="" sizes="(min-width: 1280px) 70vw, 100vw" />
      </div>
    </div>
  );
});

export function ProductReveal({ onExplore }: { onExplore: (id: FlavourId, trigger: HTMLElement) => void }) {
  const { motionOn } = useMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const layersRef = useRef<Player>(null);
  const [filmId, setFilmId] = useState<FlavourId>(reveal.order[0]);
  const [status, setStatus] = useState<Status>('poster');
  const [cut, setCut] = useState<Cut>('full');
  const [failed, setFailed] = useState<Set<FlavourId>>(() => new Set());
  const [near, setNear] = useState(false);
  const userPaused = useRef(false);
  const autoPlayed = useRef(false);
  const visible = useRef(false);

  const f = flavourById(filmId);
  const useVideo = reveal.useFilms && !failed.has(filmId);
  const src = `/media/${f.reveal.film}-reveal-${cut === 'full' ? '5s' : '2s'}.mp4`;

  const player: Player = {
    play: (fromStart) => {
      if (useVideo) {
        const v = videoRef.current;
        if (!v) return;
        if (fromStart || v.ended) v.currentTime = 0;
        v.play().catch(() => setStatus((s) => (s === 'playing' ? 'paused' : s)));
      } else {
        layersRef.current?.play(fromStart);
      }
    },
    pause: () => (useVideo ? videoRef.current?.pause() : layersRef.current?.pause()),
  };
  const playerRef = useRef(player);
  playerRef.current = player;

  const start = useCallback((fromStart = false) => {
    userPaused.current = false;
    setNear(true);

    requestAnimationFrame(() => playerRef.current.play(fromStart));
  }, []);

  const motionOnRef = useRef(motionOn);
  motionOnRef.current = motionOn;

  useEffect(() => {
    const stage = stageRef.current!;
    const nearObs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setNear(true);
      },
      { rootMargin: '600px 0px' },
    );
    const visObs = new IntersectionObserver(
      ([e]) => {
        visible.current = e.intersectionRatio >= 0.55;
        if (e.intersectionRatio < 0.2) {
          playerRef.current.pause();
        } else if (visible.current && motionOnRef.current && !autoPlayed.current && !userPaused.current) {
          autoPlayed.current = true;
          start(true);
        }
      },
      { threshold: [0, 0.2, 0.55, 0.8] },
    );
    nearObs.observe(stage);
    visObs.observe(stage);
    const onVis = () => {
      if (document.hidden) playerRef.current.pause();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      nearObs.disconnect();
      visObs.disconnect();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [start]);

  useEffect(() => {
    if (!motionOn) playerRef.current.pause();
  }, [motionOn]);

  useEffect(
    () =>
      onNavigate((hash) => {
        if (hash !== '#splash') return;
        autoPlayed.current = true;
        window.setTimeout(() => start(true), 450);
      }),
    [start],
  );

  const onToggle = () => {
    if (status === 'playing') {
      userPaused.current = true;
      player.pause();
    } else {
      start(status === 'ended');
    }
  };

  const restartWith = (change: () => void) => {
    change();
    autoPlayed.current = true;
    setStatus('poster');
    window.setTimeout(() => start(true), 60);
  };
  const switchCut = (next: Cut) => next !== cut && restartWith(() => setCut(next));
  const switchFilm = (next: FlavourId) => next !== filmId && restartWith(() => setFilmId(next));

  const label = status === 'playing' ? 'Pause' : status === 'ended' ? 'Replay' : 'Play';
  const kind = useVideo ? 'film' : 'animation';

  return (
    <section
      id="splash"
      className="reveal section-pad"
      aria-labelledby="splash-title"
      style={{ '--accent': f.accent, '--on-accent': f.onAccent } as CSSProperties}
    >
      <div className="reveal__head">
        <div>
          <p className="eyebrow reveal__eyebrow">{reveal.eyebrow}</p>
          <h2 id="splash-title" className="reveal__title display" aria-live="polite">
            {reveal.heading(f.name)}
          </h2>
        </div>
        <div className="reveal__aside">
          <p className="reveal__body">{reveal.body(f.description)}</p>
          <button
            type="button"
            className="btn btn--dark"
            aria-haspopup="dialog"
            onClick={(e) => onExplore(f.id, e.currentTarget)}
          >
            {reveal.cta(f.name)}
          </button>
        </div>
      </div>

      <div className="reveal__tabs" role="group" aria-label={reveal.tabsLabel}>
        {reveal.order.map((id) => {
          const x = flavourById(id);
          return (
            <button
              key={id}
              type="button"
              className="reveal__tab"
              aria-pressed={id === filmId}
              style={{ '--swatch': x.accent } as CSSProperties}
              onClick={() => switchFilm(id)}
            >
              <span className="reveal__tab-swatch" aria-hidden="true" />
              {x.name}
            </button>
          );
        })}
      </div>

      <div ref={stageRef} className={`reveal__stage is-${status}`}>
        <Picture
          key={f.reveal.poster}
          asset={f.reveal.poster}
          alt={f.reveal.posterAlt}
          sizes="(min-width: 1280px) 70vw, 100vw"
          className="reveal__poster"
        />
        {useVideo && near && (
          <video
            ref={videoRef}
            key={src}
            className="reveal__video"
            muted
            playsInline
            preload="auto"
            aria-label={`${f.name} product film, ${cut === 'full' ? '5' : '2'} seconds, silent`}
            onPlaying={() => setStatus('playing')}
            onPause={(e) => {
              if (!e.currentTarget.ended) setStatus((s) => (s === 'poster' ? s : 'paused'));
            }}
            onEnded={() => setStatus('ended')}
            onError={(e) => {
              const v = e.currentTarget;
              window.setTimeout(() => {
                if (v.error || v.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
                  setFailed((s) => new Set(s).add(filmId));
                  setStatus('poster');
                }
              }, 0);
            }}
          >
            <source src={src.replace('.mp4', '-1080.mp4')} type="video/mp4" media="(min-width: 900px)" />
            <source src={src} type="video/mp4" />
          </video>
        )}
        {!useVideo && (
          <LayeredReveal
            ref={layersRef}
            key={`${filmId}-${cut}`}
            flavour={f}
            duration={cut === 'full' ? 5 : 2}
            onPlaying={() => setStatus('playing')}
            onEnded={() => setStatus('ended')}
          />
        )}

        <div className="reveal__controls">
          <button
            type="button"
            className="reveal__btn"
            onClick={onToggle}
            aria-label={`${label} the ${f.name} ${kind}`}
          >
            {status === 'playing' ? (
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <rect x="3" y="2" width="3.6" height="12" rx="1" fill="currentColor" />
                <rect x="9.4" y="2" width="3.6" height="12" rx="1" fill="currentColor" />
              </svg>
            ) : status === 'ended' ? (
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
            ) : (
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path
                  d="M4 2.2v11.6a.9.9 0 0 0 1.4.8l9.2-5.8a.9.9 0 0 0 0-1.6L5.4 1.4A.9.9 0 0 0 4 2.2Z"
                  fill="currentColor"
                />
              </svg>
            )}
            <span>{label}</span>
          </button>
          <button
            type="button"
            className="reveal__btn reveal__btn--ghost"
            onClick={() => start(true)}
            aria-label={`Replay the ${f.name} ${kind} from the start`}
          >
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
          </button>
          <div className="reveal__cuts" role="group" aria-label="Edit length">
            <button type="button" aria-pressed={cut === 'full'} onClick={() => switchCut('full')}>
              5 s
            </button>
            <button type="button" aria-pressed={cut === 'cut'} onClick={() => switchCut('cut')}>
              2 s cut
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
