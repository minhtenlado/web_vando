'use client';

import { normalizeProjectImage } from '@/lib/cv/project-input';
import Image from 'next/image';
import { useState } from 'react';

export function ContentImage({ src, alt, sizes, priority = false, fit = 'cover' }: {
  src?: string | null; alt: string; sizes: string; priority?: boolean; fit?: 'cover' | 'contain';
}) {
  const [failedSource, setFailedSource] = useState<string>();
  const safeSource = normalizeProjectImage(src);
  if (!safeSource || failedSource === safeSource) {
    return <div className="lab-image-fallback" role={alt ? 'img' : undefined} aria-label={alt ? alt + ' — image unavailable' : undefined} aria-hidden={!alt}>
      <span>{alt ? 'Image unavailable' : '—'}</span>
    </div>;
  }
  return <Image src={safeSource} alt={alt} fill sizes={sizes} preload={priority} quality={fit === "contain" ? 90 : 75} style={{ objectFit: fit }} onError={() => setFailedSource(safeSource)} />;
}
