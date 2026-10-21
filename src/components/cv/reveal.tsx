'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/** Finite enhancement: content is visible even when JS or animation is unavailable. */
export function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element || !('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      element.animate?.([{ opacity: .45, transform: 'translateY(22px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 680, easing: 'cubic-bezier(.16,1,.3,1)' });
      observer.disconnect();
    }, { threshold: .08 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className={className}>{children}</div>;
}
