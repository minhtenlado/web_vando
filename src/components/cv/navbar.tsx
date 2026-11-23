'use client';

import { Sheet,SheetClose,SheetContent,SheetDescription,SheetTitle,SheetTrigger } from '@/components/ui/sheet';
import { externalUrl } from '@/lib/cv/presentation';
import { ArrowUpRight,Github,Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LabMark } from './lab-mark';
import { useLocale } from './locale-context';
import { useSiteData } from './site-data-context';
import { ThemeToggle } from './theme-toggle';

export function Navbar() {
  const { profile, settings } = useSiteData();
  const { t, locale, setLocale } = useLocale();
  const pathname = usePathname();
  const github = externalUrl(profile.github);
  const links = [
    { href: '/#projects', label: t('Dự án', 'Projects'), current: pathname.startsWith('/projects/') },
    { href: '/#domains', label: t('Lĩnh vực', 'Domains'), current: false },
    ...(github ? [{ href: '/#github', label: t('Mã nguồn', 'Open source'), current: false }] : []),
    { href: '/notes', label: t('Bài viết', 'Articles'), current: pathname === '/notes' || pathname.startsWith('/posts/') },
  ];
  const name = settings.portfolioName || 'Engineering Lab';
  const switchLocale = () => setLocale(locale === 'vi' ? 'en' : 'vi');
  return <>
    <a href="#main-content" className="pf-skip-link">{t('Đến nội dung chính', 'Skip to content')}</a>
    <header className="ui-header">
      <nav className="lab-container ui-nav" aria-label={t('Điều hướng chính', 'Main navigation')}>
        <Link href="/" className="ui-brand"><span className="ui-brand-mark"><LabMark /></span><span>{name}</span></Link>
        <div className="ui-nav-links">
          {links.map((link) => <Link href={link.href} key={link.href} aria-current={link.current ? 'page' : undefined}>{link.label}</Link>)}
        </div>
        <div className="ui-nav-tools">
          {github && <a className="ui-icon-button ui-hide-mobile" href={github} target="_blank" rel="noopener noreferrer" aria-label="GitHub"><Github size={17} aria-hidden="true" /></a>}
          <ThemeToggle />
          <button type="button" className="ui-icon-button ui-locale-button" onClick={switchLocale} aria-label={locale === 'vi' ? 'Switch to English' : 'Chuyển sang tiếng Việt'}>{locale === 'vi' ? 'VI' : 'EN'}</button>
          <Sheet>
            <SheetTrigger asChild><button type="button" className="ui-icon-button ui-menu-button" aria-label={t('Mở menu', 'Open menu')}><Menu size={19} aria-hidden="true" /></button></SheetTrigger>
            <SheetContent className="pf-mobile-sheet">
              <SheetTitle className="ui-sheet-title"><span className="ui-brand-mark"><LabMark /></span>{name}</SheetTitle>
              <SheetDescription className="sr-only">{t('Điều hướng dự án và bài viết kỹ thuật.', 'Navigate projects and technical articles.')}</SheetDescription>
              <div className="pf-mobile-links">
                {links.map((link) => <SheetClose asChild key={link.href}><Link href={link.href} aria-current={link.current ? 'page' : undefined}>{link.label}<ArrowUpRight size={17} aria-hidden="true" /></Link></SheetClose>)}
                {github && <SheetClose asChild><a href={github} target="_blank" rel="noopener noreferrer">GitHub<ArrowUpRight size={17} aria-hidden="true" /></a></SheetClose>}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  </>;
}
