import React from 'react';
import { Image } from '@/components/ui/image';

export const IGCSE_LOGO_URL = 'https://media.base44.com/images/public/6a9374897e9609e0d36beee4/0f4aabd83_image.png';
export const IB_LOGO_URL = 'https://media.base44.com/images/public/6a9374897e9609e0d36beee4/95af804a6_image.png';

/**
 * Renders the track's official badge.
 * - IGCSE: the Cambridge IGCSE logo ships as an orange disc on a black
 *   background. We crop it to a circle and over-scale slightly so the black
 *   margin falls outside the clip — the black background disappears.
 * - IB: already a transparent-circle PNG, shown as-is.
 */
export default function TrackLogo({ track, size = 48, className = '' }) {
  if (track === 'igcse') {
    return (
      <span
        className={`inline-block rounded-full overflow-hidden shrink-0 ${className}`}
        style={{ width: size, height: size }}
      >
        <Image
          src={IGCSE_LOGO_URL}
          alt="Cambridge IGCSE"
          fittingType="fill"
          className="w-full h-full scale-[1.18]"
        />
      </span>
    );
  }
  if (track === 'ib') {
    return (
      <span
        className={`inline-block rounded-full overflow-hidden shrink-0 ${className}`}
        style={{ width: size, height: size }}
      >
        <Image src={IB_LOGO_URL} alt="IB" fittingType="fit" className="w-full h-full" />
      </span>
    );
  }
  return null;
}