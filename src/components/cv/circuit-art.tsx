'use client';

import { useEffect, useRef, type PointerEvent } from 'react';
import { LabMark } from './lab-mark';
import { useLocale } from './locale-context';

export function CircuitArt() {
  const { t } = useLocale();
  const ref = useRef<HTMLElement>(null);
  const frame = useRef(0);
  useEffect(() => {
    const element = ref.current;
    if (!element || !('IntersectionObserver' in window)) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    const update = () => { element.dataset.active = String(visible && !document.hidden && !reduced.matches); };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); });
    observer.observe(element);
    document.addEventListener('visibilitychange', update);
    reduced.addEventListener('change', update);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', update); reduced.removeEventListener('change', update); cancelAnimationFrame(frame.current); };
  }, []);
  const move = (event: PointerEvent<HTMLElement>) => {
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const box = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - .5;
    const y = (event.clientY - box.top) / box.height - .5;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      ref.current?.style.setProperty('--circuit-x', `${x * 12}deg`);
      ref.current?.style.setProperty('--circuit-y', `${-y * 12}deg`);
    });
  };
  return <figure className="circuit-art" ref={ref} onPointerMove={move} onPointerLeave={() => { cancelAnimationFrame(frame.current); ref.current?.style.setProperty('--circuit-x', '0deg'); ref.current?.style.setProperty('--circuit-y', '0deg'); }}>
    <div className="circuit-stage" aria-hidden="true">
      <div className="circuit-board">
        <svg className="circuit-routes" viewBox="0 0 600 480" fill="none">
          <g className="circuit-static" stroke="currentColor" strokeWidth="1.5">
            <path d="M0 120h120l60 60h65M600 90H470l-60 60h-60M0 340h130l55-55h60M600 350H460l-60-60h-50M270 0v95l25 25v50M340 480V370l-25-25v-40M0 230h245M600 230H350" />
            <path d="M30 70h115l55 55h35M570 410H450l-55-55h-45M180 480V350M420 0v100" opacity=".35" />
            {[ [120,120],[470,90],[130,340],[460,350],[270,95],[340,370],[30,70],[570,410] ].map(([cx,cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="4" />)}
          </g>
          <g className="circuit-signal" stroke="currentColor" strokeWidth="2">
            <path d="M0 120h120l60 60h65M600 350H460l-60-60h-50M270 0v95l25 25v50" />
          </g>
        </svg>
        <span className="circuit-annotation circuit-input">01 / INPUT</span>
        <span className="circuit-annotation circuit-output">03 / OUTPUT</span>
        <div className="circuit-chip">
          <div className="chip-pins chip-pins-top">{Array.from({ length: 12 }, (_, i) => <i key={i} />)}</div>
          <div className="chip-pins chip-pins-bottom">{Array.from({ length: 12 }, (_, i) => <i key={i} />)}</div>
          <div className="chip-pins chip-pins-left">{Array.from({ length: 10 }, (_, i) => <i key={i} />)}</div>
          <div className="chip-pins chip-pins-right">{Array.from({ length: 10 }, (_, i) => <i key={i} />)}</div>
          <div className="chip-face"><LabMark /><span>ENGINEERING<br />LAB</span><small>02 / COMPUTE</small><b className="chip-notch" /></div>
        </div>
      </div>
    </div>
    <figcaption><span className="circuit-caption-line" />{t('Hình học mạch điện · Minh họa nhận diện', 'Circuit geometry · Identity study')}</figcaption>
  </figure>;
}
