import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeMode;
  isDark: boolean;
  setTheme: (theme: ThemeMode) => void;
  colors: typeof lightColors;
}

export const lightColors = {
  background: '#f3f4f6',
  surface: '#ffffff',
  text: '#1f2937',
  textSecondary: '#6b7280',
  textMuted: '#9ca3af',
  border: '#e5e7eb',
  primary: '#3b82f6',
  primaryDark: '#2563eb',
  error: '#ef4444',
  success: '#10b981',
  warning: '#f59e0b',
  card: '#ffffff',
  tabBar: '#ffffff',
};

export const darkColors = {
  background: '#121212',
  surface: '#1e1e2d',
  text: '#e5e7eb',
  textSecondary: '#9ca3af',
  textMuted: '#6b7280',
  border: '#2d2d3d',
  primary: '#3b82f6',
  primaryDark: '#2563eb',
  error: '#ef4444',
  success: '#10b981',
  warning: '#f59e0b',
  card: '#1e1e2d',
  tabBar: '#1e1e2d',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemScheme = useColorScheme();
  const [theme, setTheme] = useState<ThemeMode>('system');

  useEffect(() => {
    AsyncStorage.getItem('app_theme').then(saved => {
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        setTheme(saved);
      }
    });
  }, []);

  const handleSetTheme = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    AsyncStorage.setItem('app_theme', newTheme);
  };

  const isDark = theme === 'system' ? systemScheme === 'dark' : theme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme: theme, isDark, setTheme: handleSetTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};