'use client';

import { externalUrl } from '@/lib/cv/presentation';
import Link from 'next/link';
import { useLocale } from './locale-context';
import { useSiteData } from './site-data-context';

export function Footer() {
  const { profile, settings } = useSiteData();
  const { t } = useLocale();
  const github = externalUrl(profile.github);
  return <footer className="pf-footer">
    <div className="lab-container">
      <div className="pf-footer-top">
        <div><Link href="/" className="pf-brand">{settings.portfolioName || 'Engineering Lab'}</Link><p>{settings.portfolioTagline}</p></div>
        <nav className="pf-footer-links" aria-label={t('Liên kết cuối trang', 'Footer links')}>
          <Link href="/notes">{t('Bài viết', 'Articles')}</Link>
          {github && <a href={github} target="_blank" rel="noopener noreferrer">GitHub</a>}
          {profile.email && <a href={'mailto:' + profile.email}>Email</a>}
        </nav>
      </div>
      <div className="pf-footer-bottom"><span>© {new Date().getFullYear()} {settings.portfolioName || 'Engineering Lab'}</span><div><Link href="/privacy">{t('Bảo mật', 'Privacy')}</Link><Link href="/terms">{t('Điều khoản', 'Terms')}</Link></div></div>
    </div>
  </footer>;
}
