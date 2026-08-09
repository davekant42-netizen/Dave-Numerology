import { useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';

const KEY   = 'dave-theme';
const EVENT = 'dave-theme-change';

function applyTheme(t: Theme) {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(t);
}

export function useTheme() {
  const [theme, _setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'dark';
    return (localStorage.getItem(KEY) as Theme) || 'dark';
  });

  // Apply CSS class + persist whenever this instance's theme changes
  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(KEY, theme);
  }, [theme]);

  // Listen for changes made by OTHER component instances
  useEffect(() => {
    const handler = (e: Event) => {
      _setTheme((e as CustomEvent<Theme>).detail);
    };
    window.addEventListener(EVENT, handler);
    return () => window.removeEventListener(EVENT, handler);
  }, []);

  // Public setTheme: updates local state AND broadcasts to all other instances
  const setTheme = (t: Theme) => {
    _setTheme(t);
    window.dispatchEvent(new CustomEvent(EVENT, { detail: t }));
  };

  return {
    theme,
    toggle: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
    setTheme,
  };
}
