'use client';

import { Heart,MessageSquare,Share2 } from 'lucide-react';
import { useEffect,useState } from 'react';
import { useLocale } from './locale-context';

type Props = { slug: string; title: string; likes: number; shares?: number; commentsCount: number; isCommentsOpen: boolean; onToggleComments: () => void; preview?: boolean };

export function PostEngagementBar({ slug, title, likes, commentsCount, isCommentsOpen, onToggleComments, preview = false }: Props) {
  const { t } = useLocale();
  const [count, setCount] = useState(likes);
  const [liked, setLiked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => { try { setLiked(localStorage.getItem('like_' + slug) === 'true'); } catch { /* Storage may be disabled. */ } }, [slug]);

  async function toggleLike() {
    if (busy || preview) return;
    setBusy(true); setMessage('');
    try {
      const response = await fetch('/api/posts/' + encodeURIComponent(slug) + '/stats', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: liked ? 'unlike' : 'like' }) });
      if (!response.ok) throw new Error();
      const data = await response.json();
      if (typeof data.likes === 'number') setCount(data.likes);
      const next = !liked; setLiked(next);
      try { localStorage.setItem('like_' + slug, String(next)); } catch { /* The server result is still valid. */ }
    } catch { setMessage(t('Không lưu được lượt thích. Vui lòng thử lại.', 'Could not save your like. Please try again.')); }
    finally { setBusy(false); }
  }

  async function share() {
    try {
      if (navigator.share) await navigator.share({ title, url: window.location.href });
      else { await navigator.clipboard.writeText(window.location.href); setMessage(t('Đã sao chép liên kết.', 'Link copied.')); }
    } catch (error) { if (!(error instanceof DOMException && error.name === 'AbortError')) setMessage(t('Không thể chia sẻ liên kết.', 'Could not share the link.')); }
  }

  return <div className="lab-engagement">
    <div>{!preview && <><button type="button" onClick={() => void toggleLike()} disabled={busy} aria-pressed={liked}><Heart size={16} aria-hidden="true" />{t('Thích', 'Like')}{count > 0 && <span>{count}</span>}</button><button type="button" onClick={onToggleComments} aria-expanded={isCommentsOpen} aria-controls="comments-section"><MessageSquare size={16} aria-hidden="true" />{t('Bình luận', 'Comments')}{commentsCount > 0 && <span>{commentsCount}</span>}</button></>}<button type="button" onClick={() => void share()}><Share2 size={16} aria-hidden="true" />{t('Chia sẻ', 'Share')}</button></div>
    {message && <p role="status">{message}</p>}
  </div>;
}
