import { useCallback, useState } from 'react';
import type { FlavourId } from './data/flavours';
import { MotionProvider } from './motion/MotionContext';
import { navigateTo } from './motion/navigation';
import { SiteHeader } from './components/SiteHeader';
import { HeroCheers } from './components/HeroCheers';
import { BenefitsBand } from './components/BenefitsBand';
import { FlavourGrid } from './components/FlavourGrid';
import { ProductReveal } from './components/ProductReveal';
import { TropicalStory } from './components/TropicalStory';
import { FlavourSelector } from './components/FlavourSelector';
import { SiteFooter } from './components/SiteFooter';
import { FlavourDialog } from './components/FlavourDialog';

export default function App() {
  const [selected, setSelected] = useState<FlavourId>('strawberry');
  const [dialog, setDialog] = useState<{ id: FlavourId; trigger: HTMLElement } | null>(null);

  const openDialog = useCallback((id: FlavourId, trigger: HTMLElement) => setDialog({ id, trigger }), []);
  const closeDialog = useCallback(() => setDialog(null), []);
  const pickFromDialog = useCallback((id: FlavourId) => {
    setSelected(id);

    window.setTimeout(() => navigateTo('#selector'), 30);
  }, []);

  return (
    <MotionProvider>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="page">
        <SiteHeader />
        <main id="main">
          <HeroCheers />
          <BenefitsBand />
          <FlavourGrid onExplore={openDialog} />
          <ProductReveal onExplore={openDialog} />
          <TropicalStory />
          <FlavourSelector selected={selected} onSelect={setSelected} onExplore={openDialog} />
        </main>
        <SiteFooter />
      </div>
      <FlavourDialog
        flavourId={dialog?.id ?? null}
        trigger={dialog?.trigger ?? null}
        onClose={closeDialog}
        onPick={pickFromDialog}
      />
    </MotionProvider>
  );
}
