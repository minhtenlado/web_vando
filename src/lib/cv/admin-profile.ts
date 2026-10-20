import type { SiteProfile } from './site-data-server';

/** CMS forms need the authenticated record, never the reduced public profile. */
export async function readAdminProfile(locale: string): Promise<SiteProfile> {
  const response = await fetch('/api/admin/profile?locale=' + (locale === 'en' ? 'en' : 'vi'), { cache: 'no-store' });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.ok || !data.profile || typeof data.profile !== 'object' || Array.isArray(data.profile)) {
    throw new Error('Không tải được dữ liệu quản trị. Vui lòng tải lại trước khi lưu.');
  }
  return data.profile;
}
