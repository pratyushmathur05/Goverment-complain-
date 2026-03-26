'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  toggleTheme: () => {},
  isDark: false,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  // Apply stored/preferred theme on mount — NO early return null
  useEffect(() => {
    try {
      const stored = localStorage.getItem('ccp-theme') as Theme | null;
      const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark' : 'light';
      const initial = stored ?? preferred;
      setTheme(initial);
      document.documentElement.setAttribute('data-theme', initial);
    } catch { /* ignore */ }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem('ccp-theme', next);
        document.documentElement.setAttribute('data-theme', next);
      } catch { /* ignore */ }
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}