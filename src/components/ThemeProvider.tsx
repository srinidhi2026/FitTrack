
import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check if theme is stored in localStorage
    const storedTheme = localStorage.getItem('fittrack-theme') as Theme | null;
    
    if (storedTheme) {
      return storedTheme;
    }
    
    // Check if user prefers dark mode
    if (typeof window !== 'undefined') {
      const userPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return userPrefersDark ? 'dark' : 'light';
    }
    
    return 'light';
  });
  
  // Update document class when theme changes
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches 
        ? 'dark' 
        : 'light';
      
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
    
    // Save theme to localStorage
    localStorage.setItem('fittrack-theme', theme);
  }, [theme]);
  
  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(mediaQuery.matches ? 'dark' : 'light');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [theme]);
  
  const value = { theme, setTheme };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};
