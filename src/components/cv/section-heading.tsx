'use client';

import type { ReactNode } from 'react';
import { Reveal } from './reveal';

/** Numbered section title shared by every homepage section. */
export function SectionHeading({ index, kicker, title, caption, id, action }: {
  index: string; kicker: string; title: string; caption?: string; id: string; action?: ReactNode;
}) {
  return <Reveal className="ui-section-heading">
    <div>
      <p className="ui-kicker"><span className="ui-kicker-index">{index}</span>{kicker}</p>
      <h2 id={id}>{title}</h2>
      {caption && <p className="ui-section-caption">{caption}</p>}
    </div>
    {action}
  </Reveal>;
}
