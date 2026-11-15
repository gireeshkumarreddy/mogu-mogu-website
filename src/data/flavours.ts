import type { AssetKey } from './assets';

export type FlavourId = 'strawberry' | 'mango' | 'lychee' | 'grape';

export interface Flavour {
  id: FlavourId;
  name: string;

  description: string;

  accent: string;

  onAccent: string;

  tint: string;

  label: string;
  drink: string;
  bottle: AssetKey;
  backdrop: AssetKey;
  bottleAlt: string;

  reveal: { poster: AssetKey; film: string; posterAlt: string; splash?: AssetKey };
}

export const flavours: Flavour[] = [
  {
    id: 'strawberry',
    name: 'Strawberry',
    description: 'Bright berry flavour with a chewy twist.',
    accent: '#E5262D',
    onAccent: '#FFFFFF',
    tint: '#FFE3E1',
    label: 'Red label, white cap',
    drink: 'Pink drink with nata de coco pieces',
    bottle: 'bottleStrawberry',
    backdrop: 'bgStrawberry',
    bottleAlt: 'Mogu Mogu Strawberry bottle with a red label and a pink drink full of nata de coco pieces',
    reveal: {
      poster: 'posterStrawberry',
      film: 'strawberry',
      posterAlt:
        'A Mogu Mogu Strawberry bottle with a red label stands in a swirl of red strawberry juice with strawberry halves and nata de coco cubes.',
    },
  },
  {
    id: 'mango',
    name: 'Mango',
    description: 'A sunny tropical flavour with chewy nata de coco.',
    accent: '#FFB81C',
    onAccent: '#171717',
    tint: '#FFF1CC',
    label: 'Green label, white cap',
    drink: 'Golden drink with nata de coco pieces',
    bottle: 'bottleMango',
    backdrop: 'bgMango',
    bottleAlt: 'Mogu Mogu Mango bottle with a green label and a golden drink full of nata de coco pieces',
    reveal: {
      poster: 'poster',
      film: 'mango',
      splash: 'splash',
      posterAlt:
        'A Mogu Mogu Mango bottle with a green label stands in a golden mango splash with mango slices and nata de coco cubes.',
    },
  },
  {
    id: 'lychee',
    name: 'Lychee',
    description: 'Delicate fruity flavour and a playful chewy bite.',
    accent: '#F59BB4',
    onAccent: '#171717',
    tint: '#FFE8EF',
    label: 'Pale pink label, white cap',
    drink: 'Soft pink drink with nata de coco pieces',
    bottle: 'bottleLychee',
    backdrop: 'bgLychee',
    bottleAlt: 'Mogu Mogu Lychee bottle with a pale pink label and a soft pink drink full of nata de coco pieces',
    reveal: {
      poster: 'posterLychee',
      film: 'lychee',
      posterAlt:
        'A Mogu Mogu Lychee bottle with a pale pink label stands in a swirl of pale pink lychee juice with peeled lychees and nata de coco cubes.',
    },
  },
  {
    id: 'grape',
    name: 'Grape',
    description: 'Bold grape flavour with signature chewy pieces.',
    accent: '#8A2F86',
    onAccent: '#FFFFFF',
    tint: '#F3E2F2',
    label: 'Purple label, white cap',
    drink: 'Deep magenta drink with nata de coco pieces',
    bottle: 'bottleGrape',
    backdrop: 'bgGrape',
    bottleAlt: 'Mogu Mogu Grape bottle with a purple label and a deep magenta drink full of nata de coco pieces',
    reveal: {
      poster: 'posterGrape',
      film: 'grape',
      posterAlt:
        'A Mogu Mogu Grape bottle with a purple label stands in a swirl of deep purple grape juice with grapes and nata de coco cubes.',
    },
  },
];

export const flavourById = (id: FlavourId): Flavour => flavours.find((f) => f.id === id) ?? flavours[0];
