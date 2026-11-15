import { useEffect, useRef, type CSSProperties } from 'react';
import { flavourById, type FlavourId } from '../data/flavours';
import { Picture } from './Picture';
import './FlavourDialog.css';

interface Props {
  flavourId: FlavourId | null;
  trigger: HTMLElement | null;
  onClose: () => void;
  onPick: (id: FlavourId) => void;
}

export function FlavourDialog({ flavourId, trigger, onClose, onPick }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const f = flavourId ? flavourById(flavourId) : null;

  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    if (flavourId && !dlg.open) {
      triggerRef.current = trigger;
      dlg.showModal();
      document.documentElement.classList.add('has-dialog');
      dlg.querySelector<HTMLElement>('.dialog__close')?.focus();
    } else if (!flavourId && dlg.open) {
      dlg.close();
    }
  }, [flavourId, trigger]);

  useEffect(() => {
    const dlg = ref.current!;
    const onDialogClose = () => {
      document.documentElement.classList.remove('has-dialog');
      onClose();
      const t = triggerRef.current;
      triggerRef.current = null;
      if (t && document.contains(t)) requestAnimationFrame(() => t.focus());
    };

    const onClick = (e: MouseEvent) => {
      if (e.target === dlg) dlg.close();
    };
    dlg.addEventListener('close', onDialogClose);
    dlg.addEventListener('click', onClick);
    return () => {
      dlg.removeEventListener('close', onDialogClose);
      dlg.removeEventListener('click', onClick);
    };
  }, [onClose]);

  return (
    <dialog
      ref={ref}
      className="dialog"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-desc"
      style={f ? ({ '--accent': f.accent, '--tint': f.tint } as CSSProperties) : undefined}
    >
      {f && (
        <div className="dialog__panel">
          <div className="dialog__media">
            <Picture asset={f.backdrop} alt="" sizes="(min-width: 760px) 380px, 90vw" className="dialog__bg" />
            <Picture
              asset={f.bottle}
              alt={f.bottleAlt}
              sizes="(min-width: 760px) 170px, 40vw"
              className="dialog__bottle"
            />
          </div>
          <div className="dialog__content">
            <p className="eyebrow dialog__eyebrow">Mogu Mogu</p>
            <h2 id="dialog-title" className="display dialog__title">
              {f.name}
            </h2>
            <p id="dialog-desc" className="dialog__desc">
              {f.description}
            </p>
            <dl className="dialog__facts">
              <div>
                <dt>Texture</dt>
                <dd>Chewy nata de coco pieces</dd>
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
            <div className="dialog__actions">
              <button
                type="button"
                className="btn btn--dark"
                onClick={() => {
                  ref.current?.close();
                  onPick(f.id);
                }}
              >
                Pick {f.name}
              </button>
              <button type="button" className="btn btn--outline" onClick={() => ref.current?.close()}>
                Close
              </button>
            </div>
          </div>
          <button
            type="button"
            className="dialog__close"
            onClick={() => ref.current?.close()}
            aria-label={`Close ${f.name} details`}
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M3 3l10 10M13 3 3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}
    </dialog>
  );
}
