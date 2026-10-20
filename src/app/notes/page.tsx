import { PreviewNotice } from '@/components/cv/content-state';
import { Footer } from '@/components/cv/footer';
import { LocaleProvider } from '@/components/cv/locale-context';
import { Navbar } from '@/components/cv/navbar';
import { NotesLibrary } from '@/components/cv/notes-library';
import { SiteDataProvider } from '@/components/cv/site-data-context';
import { getSiteData } from '@/lib/cv/site-data-server';
import { toPresentationData } from '@/lib/cv/site-presentation';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Bài viết kỹ thuật | Engineering Lab',
  description: 'Ghi chép kỹ thuật, hướng dẫn triển khai và kết quả thử nghiệm về hệ thống nhúng, AI, IoT và robotics.',
  alternates: { canonical: '/notes' },
};

export default async function EngineeringNotesPage() {
  const locale = (await cookies()).get('cv-locale')?.value === 'en' ? 'en' : 'vi';
  const initialData = toPresentationData(await getSiteData(locale));
  return <LocaleProvider initialLocale={locale}><SiteDataProvider initialData={initialData}>
    <div className="lab-site"><Navbar /><main id="main-content" tabIndex={-1} className="lab-container lab-notes-page"><PreviewNotice /><NotesLibrary /></main><Footer /></div>
  </SiteDataProvider></LocaleProvider>;
}
