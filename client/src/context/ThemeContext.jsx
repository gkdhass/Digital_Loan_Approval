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
      root.style.setProperty('--color-bg-primary', '#1A1A1A');
      root.style.setProperty('--color-bg-surface', '#0A0A0A');
      root.style.setProperty('--color-text-primary', '#E5E7EB');
      root.style.setProperty('--color-text-secondary', '#9CA3AF');
      root.style.setProperty('--color-text-heading', '#E8C547');
      root.style.setProperty('--color-border-primary', '#374151');
    } else {
      root.style.setProperty('--color-bg-primary', '#F3F4F6');
      root.style.setProperty('--color-bg-surface', '#FFFFFF');
      root.style.setProperty('--color-text-primary', '#1F2937');
      root.style.setProperty('--color-text-secondary', '#6B7280');
      root.style.setProperty('--color-text-heading', '#D4AF37');
      root.style.setProperty('--color-border-primary', '#E5E7EB');
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
