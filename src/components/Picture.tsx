import { forwardRef, type ImgHTMLAttributes } from 'react';
import { assets, fallbackSrc, srcSet, type AssetKey } from '../data/assets';

interface PictureProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'width' | 'height'> {
  asset: AssetKey;
  sizes: string;
  alt: string;
  priority?: boolean;
}

export const Picture = forwardRef<HTMLImageElement, PictureProps>(function Picture(
  { asset, sizes, alt, priority = false, className, ...rest },
  ref,
) {
  const info = assets[asset];
  return (
    <picture>
      <source type="image/avif" srcSet={srcSet(asset, 'avif')} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(asset, 'webp')} sizes={sizes} />
      <img
        ref={ref}
        src={fallbackSrc(asset)}
        width={info.width}
        height={info.height}
        alt={alt}
        className={className}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        draggable={false}
        {...rest}
      />
    </picture>
  );
});
