'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useId } from 'react';
import { galleryMotion } from '@/lib/cv/motion';
import { useLocale } from './locale-context';

export function CategoryFilters({ categories, value, onChange, label }: { categories: string[]; value: string; onChange: (value: string) => void; label: string }) {
  const id = useId();
  const reduced = useReducedMotion();
  const { t } = useLocale();
  return <div className="lab-filters" role="group" aria-label={label}>
    {['all', ...categories].map((category) => <button type="button" key={category} aria-pressed={category === value} onClick={() => onChange(category)}>
      {category === value && <motion.span aria-hidden="true" className="lab-filter-indicator" layoutId={'category-' + id} transition={reduced ? { duration: 0 } : galleryMotion.spring} />}
      {category === 'all' ? t('Tất cả', 'All') : category}
    </button>)}
  </div>;
}
