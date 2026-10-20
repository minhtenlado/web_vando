'use client';

import { normalizeSearch } from '@/lib/cv/presentation';
import { useEffect,useState } from 'react';
import { useLocale } from './locale-context';

type Item = { id: string; text: string; level: number };
export function TableOfContents({ selector = '.lab-prose' }: { selector?: string }) {
  const [items, setItems] = useState<Item[]>([]);
  const [active, setActive] = useState('');
  const { t } = useLocale();
  useEffect(() => {
    const content = document.querySelector(selector);
    if (!content) return;
    const headings = Array.from(content.querySelectorAll<HTMLElement>('h2, h3'));
    const list = headings.map((heading, index) => {
      if (!heading.id) { const base = normalizeSearch(heading.textContent || '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'section'; heading.id = document.getElementById(base) ? base + '-' + index : base; }
      return { id: heading.id, text: heading.textContent || '', level: Number(heading.tagName[1]) };
    });
    setItems(list);
    const observer = new IntersectionObserver((entries) => { for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id); }, { rootMargin: '-10% 0px -70% 0px' });
    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [selector]);
  if (items.length < 3) return null;
  return <nav className="lab-toc" aria-label={t('Mục lục bài viết', 'Table of contents')}><h2>{t('Trong bài viết', 'On this page')}</h2><ul>{items.map((item) => <li key={item.id} className={item.level > 2 ? 'lab-toc-nested' : ''}><a href={'#' + item.id} aria-current={active === item.id ? 'location' : undefined}>{item.text}</a></li>)}</ul></nav>;
}
