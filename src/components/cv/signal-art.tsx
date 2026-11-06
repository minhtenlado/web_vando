'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Pause, Play } from 'lucide-react';
import { useLocale } from './locale-context';

export function SignalArt({ children, label }: { children?: ReactNode; label: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const pausedRef = useRef(false);
  const syncRef = useRef<() => void>(() => {});
  const { t } = useLocale();
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let renderer: ReturnType<typeof import('@/lib/cv/signal-field').createSignalField> = null;
    let disposed = false, visible = false, loading = false, lost = false;
    let frame = 0, last = 0, elapsed = 0, pointerX = 0, pointerY = 0;
    const stop = () => { cancelAnimationFrame(frame); frame = 0; last = 0; };
    const tick = (now: number) => {
      if (disposed || lost || !visible || document.hidden || !renderer) { stop(); return; }
      const interval = canvas.clientWidth < 600 ? 1000 / 24 : 1000 / 30;
      if (!last || now - last >= interval) {
        if (last && !pausedRef.current) elapsed += Math.min(now - last, 100) / 1000;
        last = now;
        renderer.draw(reduced.matches ? 0 : elapsed, reduced.matches ? 0 : pointerX, reduced.matches ? 0 : pointerY);
      }
      frame = reduced.matches || pausedRef.current ? 0 : requestAnimationFrame(tick);
    };
    const sync = () => {
      setReducedMotion(reduced.matches);
      stop();
      if (renderer && visible && !document.hidden && !lost) frame = requestAnimationFrame(tick);
    };
    syncRef.current = sync;
    const initialize = async () => {
      if (disposed || renderer || loading || lost) return;
      loading = true;
      try {
        const { createSignalField } = await import('@/lib/cv/signal-field');
        if (disposed || lost) return;
        renderer = createSignalField(canvas);
        setReady(Boolean(renderer)); sync();
      } catch { if (!disposed) setReady(false); }
      finally { loading = false; }
    };
    const observer = 'IntersectionObserver' in window ? new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) void initialize();
      sync();
    }) : null;
    observer?.observe(canvas);
    if (!observer) { visible = true; void initialize(); }
    const move = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || reduced.matches) return;
      const rect = canvas.getBoundingClientRect();
      pointerX = (event.clientX - rect.left) / rect.width * 2 - 1;
      pointerY = (event.clientY - rect.top) / rect.height * 2 - 1;
    };
    const leave = () => { pointerX = 0; pointerY = 0; };
    const contextLost = (event: Event) => { event.preventDefault(); lost = true; stop(); renderer?.dispose(); renderer = null; setReady(false); };
    const contextRestored = () => { lost = false; if (visible) void initialize(); };
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerleave', leave);
    canvas.addEventListener('webglcontextlost', contextLost);
    canvas.addEventListener('webglcontextrestored', contextRestored);
    document.addEventListener('visibilitychange', sync);
    reduced.addEventListener('change', sync);
    const resize = 'ResizeObserver' in window ? new ResizeObserver(sync) : null;
    if (resize) resize.observe(canvas); else window.addEventListener('resize', sync);
    return () => {
      disposed = true; syncRef.current = () => {}; stop(); observer?.disconnect(); resize?.disconnect();
      if (!resize) window.removeEventListener('resize', sync);
      renderer?.dispose();
      canvas.removeEventListener('pointermove', move); canvas.removeEventListener('pointerleave', leave);
      canvas.removeEventListener('webglcontextlost', contextLost); canvas.removeEventListener('webglcontextrestored', contextRestored);
      document.removeEventListener('visibilitychange', sync); reduced.removeEventListener('change', sync);
    };
  }, []);
  return <figure className="signal-art" data-ready={ready}>
    <svg className="signal-fallback" viewBox="0 0 1200 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {Array.from({ length: 30 }, (_, i) => <path key={i} d={`M-100 ${170 + i * 9} Q280 ${-140 + i * 13} 580 ${240 + i * 5} T1300 ${110 + i * 10}`} />)}
    </svg>
    <canvas ref={canvasRef} aria-hidden="true" />
    {ready && !reducedMotion && <button className="signal-pause" type="button" aria-label={paused ? t('Tiếp tục chuyển động', 'Resume animation') : t('Dừng chuyển động', 'Pause animation')} onClick={() => { pausedRef.current = !pausedRef.current; setPaused(pausedRef.current); syncRef.current(); }}>{paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}</button>}
    {children}
    <figcaption><span className="signal-cross" aria-hidden="true">+</span>{label}</figcaption>
  </figure>;
}
