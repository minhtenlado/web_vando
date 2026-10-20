'use client';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useLocale } from './locale-context';

export function BackButton() {
  const { t } = useLocale();
  return <Link href="/notes" className="lab-detail-back"><ArrowLeft size={16} aria-hidden="true" />{t('Tất cả bài viết', 'All articles')}</Link>;
}
