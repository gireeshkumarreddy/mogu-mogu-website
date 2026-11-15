import './WaveDivider.css';

export function WaveDivider({ edge, colour = 'var(--ink)' }: { edge: 'top' | 'bottom'; colour?: string }) {
  return <div className={`wave wave--${edge}`} style={{ backgroundColor: colour }} aria-hidden="true" />;
}
