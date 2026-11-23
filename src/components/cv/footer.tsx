'use client';

import { externalUrl } from '@/lib/cv/presentation';
import { ArrowUp } from 'lucide-react';
import Link from 'next/link';
import { useLocale } from './locale-context';
import { useSiteData } from './site-data-context';
import { LabMark } from './lab-mark';

export function Footer() {
  const { profile, settings } = useSiteData();
  const { t } = useLocale();
  const github = externalUrl(profile.github);
  return <footer className="pf-footer">
    <div className="lab-container">
      <div className="pf-footer-top">
        <div><Link href="/" className="pf-brand"><LabMark /><span>{settings.portfolioName || 'Engineering Lab'}</span></Link><p>{settings.portfolioTagline}</p></div>
        <nav className="pf-footer-links" aria-label={t('Liên kết cuối trang', 'Footer links')}>
          <Link href="/#projects">{t('Dự án', 'Projects')}</Link>
          <Link href="/notes">{t('Bài viết', 'Articles')}</Link>
          {github && <Link href="/#github">{t('Mã nguồn mở', 'Open source')}</Link>}
          {github && <a href={github} target="_blank" rel="noopener noreferrer">GitHub</a>}
          {profile.email && <a href={'mailto:' + profile.email}>Email</a>}
        </nav>
      </div>
      <div className="pf-footer-bottom"><span>© {new Date().getFullYear()} {settings.portfolioName || 'Engineering Lab'}</span><div><Link href="/privacy">{t('Bảo mật', 'Privacy')}</Link><Link href="/terms">{t('Điều khoản', 'Terms')}</Link><a href="#top" className="pf-back-top">{t('Lên đầu trang', 'Back to top')}<ArrowUp size={13} aria-hidden="true" /></a></div></div>
    </div>
  </footer>;
}
