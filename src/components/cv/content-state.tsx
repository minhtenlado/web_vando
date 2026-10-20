'use client';

import { useLocale } from './locale-context';
import { useSiteData } from './site-data-context';

export function ContentError({ resource }: { resource: 'projects' | 'posts' }) {
  const { errors, requestFailed, loading, refresh } = useSiteData();
  const { t } = useLocale();
  if (!errors?.[resource] && !requestFailed) return null;
  return (
    <div className="lab-content-error" role="alert">
      <p>{resource === 'projects'
        ? t('Dữ liệu dự án tạm thời chưa tải được.', 'Project data is temporarily unavailable.')
        : t('Dữ liệu bài viết tạm thời chưa tải được.', 'Article data is temporarily unavailable.')}</p>
      <span>{t('Đây là lỗi tải dữ liệu, không phải danh sách trống.', 'This is a loading error, not an empty library.')}</span>
      <button type="button" disabled={loading} onClick={() => void refresh()}>{loading ? t('Đang tải…', 'Loading…') : t('Thử lại', 'Try again')}</button>
    </div>
  );
}

export function PreviewNotice() {
  const { source } = useSiteData();
  if (source !== 'snapshot') return null;
  return <p className="lab-preview-notice" role="status">Local preview · existing content snapshot · database not connected</p>;
}
