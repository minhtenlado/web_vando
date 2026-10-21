'use client';

import { loadYouTubeAPI, type YouTubePlayer } from '@/lib/cv/youtube-api';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocale } from './locale-context';

export function ProjectVideo({ videoId, title, suspended = false }: {
  videoId: string; title: string; suspended?: boolean;
}) {
  const { t } = useLocale();
  const viewport = useRef<HTMLDivElement>(null);
  const mount = useRef<HTMLDivElement>(null);
  const playback = useRef({ visible: false, reduced: false, suspended: false, manual: false, ready: false, player: null as YouTubePlayer | null });
  const [activated, setActivated] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'loading' | 'ready' | 'blocked' | 'error'>('idle');

  const syncPlayback = useCallback(() => {
    const state = playback.current;
    if (!state.ready || !state.player) return;
    const fullscreen = viewport.current?.contains(document.fullscreenElement);
    if ((state.visible || fullscreen) && !document.hidden && !state.suspended && (!state.reduced || state.manual)) {
      state.manual = false;
      state.player.playVideo();
    } else state.player.pauseVideo();
  }, []);

  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const onPreference = () => { playback.current.reduced = reduced.matches; syncPlayback(); };
    onPreference();
    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(([entry]) => {
      const visible = entry.isIntersecting && entry.intersectionRatio >= .5;
      playback.current.visible = visible;
      if (visible) setActivated(true);
      syncPlayback();
    }, { threshold: [0, .5], rootMargin: '-76px 0px 0px' });
    observer?.observe(element);
    // Unsupported observers retain a usable manual player.
    if (!observer) playback.current.visible = true;
    document.addEventListener('visibilitychange', syncPlayback);
    document.addEventListener('fullscreenchange', syncPlayback);
    reduced.addEventListener('change', onPreference);
    return () => {
      observer?.disconnect();
      document.removeEventListener('visibilitychange', syncPlayback);
      document.removeEventListener('fullscreenchange', syncPlayback);
      reduced.removeEventListener('change', onPreference);
    };
  }, [syncPlayback]);

  useEffect(() => {
    playback.current.suspended = suspended;
    syncPlayback();
  }, [suspended, syncPlayback]);

  useEffect(() => {
    const container = mount.current;
    if (!activated || !container) return;
    let disposed = false;
    let player: YouTubePlayer | undefined;
    setPhase('loading');
    loadYouTubeAPI().then((api) => {
      if (disposed) return;
      const target = document.createElement('div');
      container.replaceChildren(target);
      player = new api.Player(target, {
        host: 'https://www.youtube-nocookie.com',
        videoId,
        playerVars: { origin: window.location.origin, enablejsapi: 1, autoplay: 0, playsinline: 1, rel: 0 },
        events: {
          onReady: ({ target }) => {
            if (disposed) return;
            playback.current.player = target;
            playback.current.ready = true;
            target.mute();
            setPhase('ready');
            syncPlayback();
          },
          onStateChange: ({ data }) => { if (!disposed && data === 1) setPhase('ready'); },
          onAutoplayBlocked: () => { if (!disposed) setPhase('blocked'); },
          onError: () => { if (!disposed) setPhase('error'); },
        },
      });
      const frame = player.getIframe();
      frame.title = title;
      frame.allow = 'autoplay; fullscreen; encrypted-media; picture-in-picture';
      frame.allowFullscreen = true;
      frame.referrerPolicy = 'strict-origin-when-cross-origin';
    }).catch(() => { if (!disposed) setPhase('error'); });
    return () => {
      disposed = true;
      playback.current.ready = false;
      playback.current.player = null;
      player?.destroy();
      container.replaceChildren();
    };
  }, [activated, attempt, videoId, title, syncPlayback]);

  const playManually = () => {
    playback.current.manual = true;
    if (phase === 'error') setAttempt((value) => value + 1);
    else if (!activated) setActivated(true);
    else { setPhase('ready'); syncPlayback(); }
  };

  return <div className="lab-video" ref={viewport}>
    <div className="lab-video-player" ref={mount} />
    {phase !== 'ready' && <div className="lab-video-state">
      {phase === 'loading' ? <p role="status">{t('Đang tải video…', 'Loading video…')}</p> : <>
        {phase === 'error' && <p role="status">{t('Không thể tải trình phát video.', 'The video player could not load.')}</p>}
        <button className="lab-button" type="button" onClick={playManually}>{phase === 'error' ? t('Thử lại', 'Retry') : t('Phát video', 'Play video')}</button>
        <a href={'https://www.youtube.com/watch?v=' + encodeURIComponent(videoId)} target="_blank" rel="noopener noreferrer">{t('Xem trên YouTube', 'Watch on YouTube')}</a>
      </>}
    </div>}
  </div>;
}
