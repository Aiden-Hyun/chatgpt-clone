import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  currentTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@theme_mode';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const systemColorScheme = useColorScheme();

  // Load saved theme mode from storage
  useEffect(() => {
    const loadThemeMode = async () => {
      try {
        const savedThemeMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedThemeMode && ['light', 'dark', 'system'].includes(savedThemeMode)) {
          setThemeModeState(savedThemeMode as ThemeMode);
        }
      } catch (error) {
        console.error('Failed to load theme mode:', error);
      }
    };

    loadThemeMode();
  }, []);

  // 🎯 STEP 2: Memoize setThemeMode function to prevent recreation
  const setThemeMode = useCallback(async (mode: ThemeMode) => {

    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setThemeModeState(mode);
    } catch (error) {
      console.error('Failed to save theme mode:', error);
    }
  }, []); // Stable function - no dependencies needed

  // Determine current theme based on mode and system preference
  const currentTheme: 'light' | 'dark' = (() => {
    if (themeMode === 'system') {
      return systemColorScheme ?? 'light';
    }
    return themeMode;
  })();

  // 🎯 STEP 2: Memoize ThemeContext value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    themeMode,
    setThemeMode,
    currentTheme,
  }), [themeMode, setThemeMode, currentTheme]); // Only recreate when these actually change

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
} 