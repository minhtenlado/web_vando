'use client';

import { externalUrl } from '@/lib/cv/presentation';
import { ArrowUp,ArrowUpRight,Github,Mail } from 'lucide-react';
import Link from 'next/link';
import { LabMark } from './lab-mark';
import { useLocale } from './locale-context';
import { useSiteData } from './site-data-context';

export function Footer() {
  const { profile, settings } = useSiteData();
  const { t } = useLocale();
  const github = externalUrl(profile.github);
  const name = settings.portfolioName || 'Engineering Lab';
  return <footer className="ui-footer">
    <div className="lab-container">
      {(github || profile.email) && <section className="ui-cta" aria-labelledby="footer-cta-title">
        <div>
          <p className="ui-kicker">{t('Kết nối', 'Get in touch')}</p>
          <h2 id="footer-cta-title">{t('Cùng trao đổi về một dự án kỹ thuật?', 'Talk about an engineering project?')}</h2>
          <p>{t('Mã nguồn, tài liệu thiết kế và ghi chép thử nghiệm đều được chia sẻ công khai.', 'Source code, design files and lab notes are shared openly.')}</p>
        </div>
        <div className="ui-cta-actions">
          {profile.email && <a className="lab-button lab-button-primary" href={'mailto:' + profile.email}><Mail size={17} aria-hidden="true" />{t('Gửi email', 'Send an email')}</a>}
          {github && <a className="lab-button" href={github} target="_blank" rel="noopener noreferrer"><Github size={17} aria-hidden="true" />GitHub<ArrowUpRight size={15} aria-hidden="true" /></a>}
        </div>
      </section>}
      <div className="ui-footer-grid">
        <div className="ui-footer-brand">
          <Link href="/" className="ui-brand"><span className="ui-brand-mark"><LabMark /></span><span>{name}</span></Link>
          <p>{settings.portfolioTagline}</p>
        </div>
        <nav aria-label={t('Khám phá', 'Explore')}>
          <h3>{t('Khám phá', 'Explore')}</h3>
          <Link href="/#projects">{t('Dự án', 'Projects')}</Link>
          <Link href="/#domains">{t('Lĩnh vực', 'Domains')}</Link>
          {github && <Link href="/#github">{t('Mã nguồn mở', 'Open source')}</Link>}
          <Link href="/notes">{t('Bài viết', 'Articles')}</Link>
        </nav>
        <nav aria-label={t('Liên hệ', 'Contact')}>
          <h3>{t('Liên hệ', 'Contact')}</h3>
          {github && <a href={github} target="_blank" rel="noopener noreferrer">GitHub</a>}
          {profile.email && <a href={'mailto:' + profile.email}>Email</a>}
        </nav>
        <nav aria-label={t('Thông tin', 'Information')}>
          <h3>{t('Thông tin', 'Information')}</h3>
          <Link href="/privacy">{t('Chính sách bảo mật', 'Privacy policy')}</Link>
          <Link href="/terms">{t('Điều khoản sử dụng', 'Terms of use')}</Link>
        </nav>
      </div>
      <div className="ui-footer-bottom">
        <span>© {new Date().getFullYear()} {name}</span>
        <a href="#top">{t('Lên đầu trang', 'Back to top')}<ArrowUp size={14} aria-hidden="true" /></a>
      </div>
    </div>
  </footer>;
}
