'use client';

import { ContentImage } from '@/components/cv/content-image';
import '@/components/cv/detail-polish.css';
import { Dialog,DialogContent,DialogDescription,DialogTitle } from '@/components/ui/dialog';
import { plainText } from '@/lib/cv/presentation';
import { sanitizePostHtml } from '@/lib/validation';
import { useMemo } from 'react';
import type { PostForm } from './post-types';

export function PostPreview({ form, onClose }: { form: PostForm; onClose: () => void }) {
  const html = useMemo(() => sanitizePostHtml(form.content), [form.content]);
  return <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
    <DialogContent className="lab-site lab-post-preview">
      <DialogTitle>{form.title || 'Bài viết chưa có tiêu đề'}</DialogTitle>
      <DialogDescription>Xem trước nội dung đang sửa. Thay đổi chưa được lưu hoặc xuất bản.</DialogDescription>
      {form.coverImage && <div className="lab-article-cover"><ContentImage src={form.coverImage} alt={form.title} sizes="780px" /></div>}
      {form.excerpt && <p className="lab-detail-lead">{plainText(form.excerpt)}</p>}
      <div className="lab-prose ql-editor-display" dangerouslySetInnerHTML={{ __html: html }} />
    </DialogContent>
  </Dialog>;
}
