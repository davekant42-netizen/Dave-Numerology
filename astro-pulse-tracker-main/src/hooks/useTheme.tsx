import { useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';

const KEY = 'dave-theme';

function applyTheme(t: Theme) {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(t);
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'dark';
    return (localStorage.getItem(KEY) as Theme) || 'dark';
  });

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(KEY, theme);
  }, [theme]);

  return {
    theme,
    toggle: () => setTheme(t => (t === 'dark' ? 'light' : 'dark')),
    setTheme,
  };
}
