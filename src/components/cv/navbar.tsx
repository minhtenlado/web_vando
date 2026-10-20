'use client';

import { Sheet,SheetClose,SheetContent,SheetDescription,SheetTitle,SheetTrigger } from '@/components/ui/sheet';
import { externalUrl } from '@/lib/cv/presentation';
import { ArrowUpRight,Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale } from './locale-context';
import { useSiteData } from './site-data-context';

export function Navbar() {
  const { profile, settings } = useSiteData();
  const { t, locale, setLocale } = useLocale();
  const pathname = usePathname();
  const github = externalUrl(profile.github);
  const links = [
    { href: '/#projects', label: t('Dự án', 'Projects'), current: pathname.startsWith('/projects/') },
    { href: '/notes', label: t('Bài viết', 'Articles'), current: pathname === '/notes' || pathname.startsWith('/posts/') },
  ];
  const name = settings.portfolioName || 'Engineering Lab';
  return <>
    <a href="#main-content" className="pf-skip-link">{t('Đến nội dung chính', 'Skip to content')}</a>
    <header className="pf-header">
      <nav className="lab-container pf-navigation" aria-label={t('Điều hướng chính', 'Main navigation')}>
        <Link href="/" className="pf-brand">{name}</Link>
        <div className="pf-desktop-nav">
          {links.map((link) => <Link href={link.href} key={link.href} aria-current={link.current ? 'page' : undefined}>{link.label}</Link>)}
          {github && <a href={github} target="_blank" rel="noopener noreferrer">GitHub<ArrowUpRight size={13} aria-hidden="true" /></a>}
        </div>
        <div className="pf-nav-tools">
          <button className="pf-locale-button" onClick={() => setLocale(locale === 'vi' ? 'en' : 'vi')} aria-label={locale === 'vi' ? 'Switch to English' : 'Chuyển sang tiếng Việt'}>{locale.toUpperCase()}</button>
          <Sheet>
            <SheetTrigger asChild><button className="pf-icon-button pf-mobile-menu" aria-label={t('Mở menu', 'Open menu')}><Menu size={21} /></button></SheetTrigger>
            <SheetContent className="pf-mobile-sheet">
              <SheetTitle>{name}</SheetTitle>
              <SheetDescription className="sr-only">{t('Điều hướng dự án và bài viết kỹ thuật.', 'Navigate projects and technical articles.')}</SheetDescription>
              <div className="pf-mobile-links">
                {links.map((link) => <SheetClose asChild key={link.href}><Link href={link.href}>{link.label}<ArrowUpRight size={17} /></Link></SheetClose>)}
                {github && <SheetClose asChild><a href={github} target="_blank" rel="noopener noreferrer">GitHub<ArrowUpRight size={17} /></a></SheetClose>}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  </>;
}
