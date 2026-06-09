import { useState, useEffect, useCallback } from 'react';
import { Storage } from '../utils/storage';

export function useThemeManager() {
  const [theme, setThemeState] = useState(Storage.loadTheme());
  const [mode, setModeState] = useState(Storage.loadMode());

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-mode', mode);
    if (mode === 'dark') {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  }, [theme, mode]);

  const toggleTheme = useCallback((newTheme) => {
    setThemeState(newTheme);
    Storage.saveTheme(newTheme);
  }, []);

  const toggleMode = useCallback(() => {
    setModeState((prev) => {
      const newMode = prev === 'dark' ? 'light' : 'dark';
      Storage.saveMode(newMode);
      return newMode;
    });
  }, []);

  return { theme, mode, toggleTheme, toggleMode };
}
