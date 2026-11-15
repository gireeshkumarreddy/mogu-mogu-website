import type { CSSProperties } from 'react';
import type { Flavour, FlavourId } from '../data/flavours';
import { Picture } from './Picture';

interface Props {
  flavour: Flavour;
  index: number;
  onExplore: (id: FlavourId, trigger: HTMLElement) => void;
}

export function FlavourCard({ flavour: f, index, onExplore }: Props) {
  const style = {
    '--accent': f.accent,
    '--tilt': index % 2 ? '3.5deg' : '-3.5deg',
    '--shift': index % 2 ? '-5px' : '5px',
  } as CSSProperties;
  return (
    <li className="card" style={style}>
      <div
        className="card__media"
        onClick={(e) => onExplore(f.id, (e.currentTarget.closest('.card') as HTMLElement).querySelector('button')!)}
      >
        <div className="card__bg-reveal">
          <div className="card__bg-hover">
            <Picture asset={f.backdrop} alt="" sizes="(min-width: 900px) 20vw, 46vw" className="card__bg" />
          </div>
        </div>
        <div className="card__bottle-reveal">
          <div className="card__bottle-hover">
            <Picture asset={f.bottle} alt={f.bottleAlt} sizes="(min-width: 900px) 9vw, 22vw" className="card__bottle" />
          </div>
        </div>
      </div>
      <div className="card__body">
        <div className="card__row">
          <span className="card__swatch" aria-hidden="true" />
          <h3 className="card__name display">{f.name}</h3>
        </div>
        <p className="card__desc">{f.description}</p>
        <button
          type="button"
          className="card__explore"
          aria-haspopup="dialog"
          onClick={(e) => onExplore(f.id, e.currentTarget)}
        >
          Explore<span className="sr-only"> {f.name}</span>
          <span aria-hidden="true" className="card__arrow">
            →
          </span>
        </button>
      </div>
    </li>
  );
}
