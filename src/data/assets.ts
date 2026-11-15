import manifest from './assetManifest.json';

export type AssetKey = keyof typeof manifest;

export interface AssetInfo {
  width: number;
  height: number;
  alpha: boolean;
  variants: { w: number; h: number }[];
}

export const assets = manifest as Record<AssetKey, AssetInfo>;

export const srcSet = (key: AssetKey, ext: 'avif' | 'webp') =>
  assets[key].variants.map((v) => `/img/${key}-${v.w}.${ext} ${v.w}w`).join(', ');

export const fallbackSrc = (key: AssetKey) => {
  const v = assets[key].variants;
  return `/img/${key}-${v[Math.min(1, v.length - 1)].w}.webp`;
};

export const bestSrc = (key: AssetKey, cssWidth: number, ext: 'avif' | 'webp' = 'avif') => {
  const target = cssWidth * Math.min(window.devicePixelRatio || 1, 2);
  const v = assets[key].variants.find((x) => x.w >= target) ?? assets[key].variants[assets[key].variants.length - 1];
  return `/img/${key}-${v.w}.${ext}`;
};
