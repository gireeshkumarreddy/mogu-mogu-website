import { isMotionOn } from './gsap';

let finishIntroFn: (() => void) | null = null;
export const registerIntroFinisher = (fn: (() => void) | null) => {
  finishIntroFn = fn;
};
export const finishIntro = () => finishIntroFn?.();

type Listener = (hash: string) => void;
const listeners = new Set<Listener>();

export const onNavigate = (fn: Listener) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};

export function navigateTo(hash: string, opts: { focus?: boolean } = {}) {
  finishIntro();
  const target = document.querySelector<HTMLElement>(hash);
  if (!target) return;
  const header = document.querySelector<HTMLElement>('.site-header');
  const offset = (header?.offsetHeight ?? 0) + 8;
  const top = target.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: isMotionOn() ? 'smooth' : 'auto' });
  if (history.replaceState) history.replaceState(null, '', hash);
  if (opts.focus !== false) {
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  }
  listeners.forEach((fn) => fn(hash));
}

export const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
  const href = e.currentTarget.getAttribute('href');
  if (!href || !href.startsWith('#')) return;
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
  e.preventDefault();
  navigateTo(href);
};
