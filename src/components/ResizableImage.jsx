import React, { useEffect, useState } from 'react';
import { Image } from '@/components/ui/image';

/**
 * Renders a content image at a free-form width (percentage of its container)
 * while preserving the image's natural aspect ratio — so wide tables and
 * diagrams never get squished or letterboxed by a fixed pixel height.
 */
export default function ResizableImage({ src, alt = '', caption, widthPct = 100 }) {
  const [ratio, setRatio] = useState(null);

  useEffect(() => { setRatio(null); }, [src]);

  const width = Math.min(100, Math.max(15, Number(widthPct) || 100));

  return (
    <figure
      className="glassine mx-auto overflow-hidden rounded-sm border border-border"
      style={{ width: `${width}%` }}
    >
      <div style={{ aspectRatio: ratio }} className="w-full">
        <Image
          src={src}
          alt={alt}
          className="w-full h-full"
          fittingType="fit"
          onLoad={(e) => {
            const t = e.currentTarget;
            if (t?.naturalWidth && t?.naturalHeight) {
              setRatio(`${t.naturalWidth} / ${t.naturalHeight}`);
            }
          }}
        />
      </div>
      {caption && (
        <figcaption className="mt-2 font-mono text-xs text-muted-foreground text-center">{caption}</figcaption>
      )}
    </figure>
  );
}