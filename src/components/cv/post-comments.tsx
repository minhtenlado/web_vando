'use client';

import { formatContentDate } from '@/lib/cv/presentation';
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useLocale } from './locale-context';

export type CommentItem = {
  id: string; postSlug: string; parentId: string | null; author: string; isAnonymous: boolean;
  isAuthor?: boolean; avatarUrl?: string | null; content: string; avatarColor: string; likes: number; createdAt: string;
};
type Props = { slug: string; title: string; onCommentCountChange?: (count: number) => void };

export function PostComments({ slug, onCommentCountChange }: Props) {
  const { t, locale } = useLocale();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [content, setContent] = useState('');
  const [reply, setReply] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [admin, setAdmin] = useState(false);
  const [asAuthor, setAsAuthor] = useState(true);
  const [busy, setBusy] = useState(false);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [liking, setLiking] = useState<string | null>(null);
  const [sort, setSort] = useState('newest');
  const [limit, setLimit] = useState(5);
  const countCallback = useRef(onCommentCountChange);
  useEffect(() => { countCallback.current = onCommentCountChange; }, [onCommentCountChange]);

  const fetchComments = useCallback(async () => {
    setLoading(true); setLoadError(false);
    try {
      const response = await fetch('/api/posts/' + encodeURIComponent(slug) + '/comments', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok || !data.ok || !Array.isArray(data.comments)) throw new Error();
      setComments(data.comments); countCallback.current?.(data.comments.length);
    } catch { setLoadError(true); }
    finally { setLoading(false); }
  }, [slug]);

  useEffect(() => {
    void fetchComments();
    let active = true;
    void fetch('/api/admin/session').then((response) => response.json()).then((data) => { if (active) setAdmin(Boolean(data.authed)); }).catch(() => {});
    try { setLiked(JSON.parse(localStorage.getItem('post_cmts_likes_' + slug) || '{}')); } catch { setLiked({}); }
    return () => { active = false; };
  }, [slug, fetchComments]);

  const roots = useMemo(() => comments.filter((comment) => !comment.parentId).sort((a, b) => sort === 'likes'
    ? b.likes - a.likes || Date.parse(b.createdAt) - Date.parse(a.createdAt)
    : Date.parse(b.createdAt) - Date.parse(a.createdAt)), [comments, sort]);

  async function submit(event: FormEvent, parentId: string | null) {
    event.preventDefault(); setMessage('');
    const text = (parentId ? replyContent : content).trim();
    if (text.length < 2 || text.length > 1000) { setMessage(t('Nội dung cần từ 2 đến 1000 ký tự.', 'Use 2–1000 characters.')); return; }
    if (!anonymous && !name.trim() && !(parentId && admin && asAuthor)) { setMessage(t('Nhập tên hoặc chọn ẩn danh.', 'Enter a name or choose anonymous.')); return; }
    setBusy(true);
    try {
      const authorReply = parentId && admin && asAuthor;
      const response = await fetch(authorReply ? '/api/admin/comments' : '/api/posts/' + encodeURIComponent(slug) + '/comments', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authorReply ? { action: 'reply', postSlug: slug, parentId, content: text } : { parentId, author: name.trim(), isAnonymous: anonymous, content: text }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok || !data.comment) throw new Error();
      const next = [data.comment, ...comments]; setComments(next); countCallback.current?.(next.length);
      if (parentId) { setReplyContent(''); setReply(null); } else setContent('');
      setMessage(t('Đã gửi bình luận.', 'Comment posted.'));
    } catch { setMessage(t('Không gửi được bình luận. Nội dung của bạn vẫn được giữ; hãy thử lại.', 'Could not post. Your text has been kept; please try again.')); }
    finally { setBusy(false); }
  }

  async function like(comment: CommentItem) {
    if (liking) return;
    setLiking(comment.id); setMessage('');
    try {
      const response = await fetch('/api/posts/' + encodeURIComponent(slug) + '/comments', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: liked[comment.id] ? 'unlike' : 'like', commentId: comment.id }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok || typeof data.likes !== 'number') throw new Error();
      setComments((previous) => previous.map((item) => item.id === comment.id ? { ...item, likes: data.likes } : item));
      const next = { ...liked, [comment.id]: !liked[comment.id] }; setLiked(next);
      try { localStorage.setItem('post_cmts_likes_' + slug, JSON.stringify(next)); } catch { /* Optional storage. */ }
    } catch { setMessage(t('Không lưu được lượt thích. Vui lòng thử lại.', 'Could not save your like. Please try again.')); }
    finally { setLiking(null); }
  }

  function commentView(comment: CommentItem, rootId: string) {
    return <article className="lab-comment" key={comment.id}>
      <header><strong>{comment.author}</strong>{comment.isAuthor && <span>{t('Tác giả', 'Author')}</span>}<time dateTime={comment.createdAt}>{formatContentDate(comment.createdAt, locale)}</time></header>
      <p>{comment.content}</p>
      <div className="lab-comment-actions"><button type="button" disabled={Boolean(liking)} aria-pressed={Boolean(liked[comment.id])} onClick={() => void like(comment)}>{t('Thích', 'Like')} · {Math.max(0, comment.likes)}</button><button type="button" onClick={() => { setReply(rootId); setReplyContent(comment.parentId ? '@' + comment.author + ' ' : ''); }}>{t('Trả lời', 'Reply')}</button></div>
    </article>;
  }

  return <section id="comments" className="lab-comments" aria-labelledby="comments-heading">
    <div className="lab-comments-heading"><h2 id="comments-heading">{t('Bình luận', 'Comments')} {comments.length > 0 && <span>({comments.length})</span>}</h2><label>{t('Sắp xếp', 'Sort')}<select value={sort} onChange={(event) => { setSort(event.target.value); setLimit(5); }}><option value="newest">{t('Mới nhất', 'Newest')}</option><option value="likes">{t('Nhiều lượt thích', 'Most liked')}</option></select></label></div>
    <form onSubmit={(event) => void submit(event, null)} className="lab-comment-form">
      <label className="lab-comment-anonymous"><input type="checkbox" checked={anonymous} onChange={(event) => setAnonymous(event.target.checked)} />{t('Bình luận ẩn danh', 'Comment anonymously')}</label>
      {!anonymous && <label>{t('Tên hoặc biệt danh', 'Name or nickname')}<input value={name} onChange={(event) => setName(event.target.value)} maxLength={50} autoComplete="nickname" /></label>}
      <label>{t('Nội dung bình luận', 'Your comment')}<textarea value={content} onChange={(event) => setContent(event.target.value)} maxLength={1000} rows={4} /></label>
      <div><button className="lab-button" disabled={busy || loading || loadError} type="submit">{busy ? t('Đang gửi…', 'Posting…') : t('Gửi bình luận', 'Post comment')}</button><span>{content.length}/1000</span></div>
    </form>
    {message && <p className="lab-comment-message" role="status">{message}</p>}
    {loadError && <div className="lab-content-error" role="alert"><p>{t('Không tải được bình luận.', 'Could not load comments.')}</p><button type="button" onClick={() => void fetchComments()}>{t('Thử lại', 'Retry')}</button></div>}
    {loading ? <p role="status">{t('Đang tải bình luận…', 'Loading comments…')}</p> : !loadError && !roots.length ? <p>{t('Chưa có bình luận.', 'No comments yet.')}</p> : roots.slice(0, limit).map((root) => <div className="lab-comment-thread" key={root.id}>
      {commentView(root, root.id)}
      <div className="lab-comment-replies">{comments.filter((item) => item.parentId === root.id).sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt)).map((item) => commentView(item, root.id))}</div>
      {reply === root.id && <form className="lab-comment-form lab-comment-reply-form" onSubmit={(event) => void submit(event, root.id)}>
        {admin && <label className="lab-comment-anonymous"><input type="checkbox" checked={asAuthor} onChange={(event) => setAsAuthor(event.target.checked)} />{t('Trả lời với tư cách tác giả', 'Reply as author')}</label>}
        {!(admin && asAuthor) && <><label>{t('Tên hoặc biệt danh', 'Name or nickname')}<input value={name} onChange={(event) => setName(event.target.value)} maxLength={50} disabled={anonymous} /></label><label className="lab-comment-anonymous"><input type="checkbox" checked={anonymous} onChange={(event) => setAnonymous(event.target.checked)} />{t('Ẩn danh', 'Anonymous')}</label></>}
        <label>{t('Nội dung trả lời', 'Your reply')}<textarea value={replyContent} onChange={(event) => setReplyContent(event.target.value)} rows={3} maxLength={1000} autoFocus /></label>
        <div><button type="submit" className="lab-button" disabled={busy}>{busy ? t('Đang gửi…', 'Posting…') : t('Gửi trả lời', 'Post reply')}</button><button type="button" onClick={() => setReply(null)}>{t('Hủy', 'Cancel')}</button></div>
      </form>}
    </div>)}
    {roots.length > limit && <button type="button" className="lab-button" onClick={() => setLimit(limit + 5)}>{t('Xem thêm bình luận', 'Load more comments')}</button>}
  </section>;
}
