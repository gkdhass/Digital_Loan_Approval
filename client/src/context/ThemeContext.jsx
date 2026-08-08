import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Initialize theme from localStorage or system preference
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }
    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // Remove both classes first
    root.classList.remove('light', 'dark');
    
    // Add the current theme class
    root.classList.add(theme);
    
    // Save to localStorage
    localStorage.setItem('theme', theme);

    // Set CSS custom properties for dynamic theming
    if (theme === 'dark') {
      root.style.setProperty('--color-bg-background', '#071521');
      root.style.setProperty('--color-bg-surface', '#0D2233');
      root.style.setProperty('--color-text-foreground', '#F8FAFC');
      root.style.setProperty('--color-text-foregroundSecondary', '#94A3B8');
      root.style.setProperty('--color-border-primary', '#1E3A4F');
    } else {
      root.style.setProperty('--color-bg-background', '#F4F7F9');
      root.style.setProperty('--color-bg-surface', '#FFFFFF');
      root.style.setProperty('--color-text-foreground', '#0F172A');
      root.style.setProperty('--color-text-foregroundSecondary', '#64748B');
      root.style.setProperty('--color-border-primary', '#D9E2E8');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const value = {
    theme,
    isDark: theme === 'dark',
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
