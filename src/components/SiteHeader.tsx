import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { nav } from '../data/siteContent';
import { handleAnchorClick, navigateTo } from '../motion/navigation';
import { useMotion } from '../motion/MotionContext';
import './SiteHeader.css';

export function Logo({ className = '' }: { className?: string }) {
  return <img className={`logo ${className}`} src="/img/mogu-mogu-logo.svg" width={205} height={36} alt="Mogu Mogu" />;
}

export function MotionToggle({ className = '' }: { className?: string }) {
  const { motionOn, toggleMotion } = useMotion();
  return (
    <button type="button" className={`motion-toggle ${className}`} aria-pressed={motionOn} onClick={toggleMotion}>
      <span className="motion-toggle__dot" aria-hidden="true" />
      Motion {motionOn ? 'on' : 'off'}
    </button>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  const close = useCallback((restoreFocus: boolean) => {
    setOpen(false);
    if (restoreFocus) toggleRef.current?.focus();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>('a, button')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close(true);
      }
    };
    const onPointer = (e: PointerEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) close(false);
    };
    const onFocus = (e: FocusEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) close(false);
    };
    const onResize = () => {
      if (window.matchMedia('(min-width: 900px)').matches) close(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('focusin', onFocus);
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('focusin', onFocus);
      window.removeEventListener('resize', onResize);
    };
  }, [open, close]);

  const onMenuLink = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const href = e.currentTarget.getAttribute('href')!;
    setOpen(false);
    navigateTo(href);
  };

  return (
    <header ref={headerRef} className={`site-header${scrolled ? ' is-scrolled' : ''}${open ? ' is-open' : ''}`}>
      <div className="site-header__bar">
        <button
          ref={toggleRef}
          type="button"
          className="site-header__menu-btn"
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((o) => !o)}
        >
          <span className="burger" aria-hidden="true">
            <span />
            <span />
          </span>
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
        </button>

        <nav className="site-header__links" aria-label="Main">
          <ul>
            {nav.links.map((l, i) => (
              <li key={l.href}>
                <a href={l.href} onClick={handleAnchorClick} className={i === 0 ? 'is-accent' : undefined}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <a href="#top" className="site-header__brand" onClick={handleAnchorClick} aria-label="Mogu Mogu, back to top">
          <Logo />
        </a>

        <div className="site-header__actions">
          <MotionToggle className="site-header__motion" />
          <a href={nav.action.href} onClick={handleAnchorClick} className="btn btn--dark btn--small site-header__cta">
            <span className="site-header__cta-long">{nav.action.label}</span>
            <span className="site-header__cta-short">{nav.action.short}</span>
          </a>
        </div>
      </div>

      <div id={menuId} ref={panelRef} className="site-header__panel" hidden={!open}>
        <nav aria-label="Mobile">
          <ul>
            {nav.links.map((l) => (
              <li key={l.href}>
                <a href={l.href} onClick={onMenuLink}>
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <a href="#selector" onClick={onMenuLink}>
                Pick your flavour
              </a>
            </li>
          </ul>
        </nav>
        <MotionToggle className="site-header__panel-motion" />
      </div>
    </header>
  );
}
