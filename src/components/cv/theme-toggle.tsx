'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';
import { useLocale } from './locale-context';

const subscribe = () => () => {};

/** Light/dark switch; renders the dark-theme state on the server to match the default theme. */
export function ThemeToggle({ className = 'ui-icon-button' }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const { t } = useLocale();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const dark = !mounted || resolvedTheme !== 'light';
  return <button type="button" className={className} onClick={() => setTheme(dark ? 'light' : 'dark')}
    aria-label={dark ? t('Chuyển sang giao diện sáng', 'Switch to light theme') : t('Chuyển sang giao diện tối', 'Switch to dark theme')}
    title={dark ? t('Giao diện sáng', 'Light theme') : t('Giao diện tối', 'Dark theme')}>
    {dark ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
  </button>;
}
