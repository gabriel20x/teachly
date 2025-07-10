import React from 'react';
import type { ReactNode } from 'react';
import { useTheme } from '../hooks/useTheme';
import { ThemeContext } from '../contexts/ThemeContext';

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const themeData = useTheme();

  return (
    <ThemeContext.Provider value={themeData}>
      {children}
    </ThemeContext.Provider>
  );
}; 