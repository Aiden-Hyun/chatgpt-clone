import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

import { AppTheme, ThemeMode, ThemeStyle } from '../theme.types';
import themeRegistry from '../themeRegistry';

// Storage keys for persisting theme preferences
const THEME_MODE_STORAGE_KEY = '@theme_mode';
const THEME_STYLE_STORAGE_KEY = '@theme_style';

// Context type definition with enhanced theme switching capabilities
interface ThemeContextType {
  // Theme mode (light, dark, system)
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  
  // Theme style (which theme set to use, e.g., 'default', 'glassmorphism')
  themeStyle: ThemeStyle;
  setThemeStyle: (style: ThemeStyle) => void;
  
  // Current active theme based on mode and style
  currentTheme: AppTheme;
  
  // Available themes for UI selection
  availableThemes: ReturnType<typeof themeRegistry.getAllThemes>;
  
  // Loading state to track when theme preferences are being loaded
  isLoading: boolean;
}

// Create context with undefined default value
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme provider component
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // State for theme mode (light, dark, system)
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  
  // State for theme style (which theme set to use)
  const [themeStyle, setThemeStyleState] = useState<ThemeStyle>('default');
  
  // State for loading state
  const [isLoading, setIsLoading] = useState(true);

  // Get system color scheme
  const systemColorScheme = useColorScheme();

  // Load saved theme preferences from storage
  useEffect(() => {
    console.log('🎨 [ThemeContext] Loading theme preferences from storage...');
    const loadThemePreferences = async () => {
      setIsLoading(true);
      try {
        // Load theme mode
        const savedThemeMode = await AsyncStorage.getItem(THEME_MODE_STORAGE_KEY);
        if (savedThemeMode && ['light', 'dark', 'system'].includes(savedThemeMode)) {
          console.log('☀️ [ThemeContext] Loaded theme mode:', savedThemeMode);
          setThemeModeState(savedThemeMode as ThemeMode);
        }
        
        // Load theme style
        const savedThemeStyle = await AsyncStorage.getItem(THEME_STYLE_STORAGE_KEY);
        if (savedThemeStyle && themeRegistry.hasTheme(savedThemeStyle)) {
          console.log('✨ [ThemeContext] Loaded theme style:', savedThemeStyle);
          setThemeStyleState(savedThemeStyle);
        }
      } catch (error) {
        console.error('Failed to load theme preferences:', error);
      } finally {
        console.log('✅ [ThemeContext] Theme preferences loading complete');
        setIsLoading(false);
      }
    };

    loadThemePreferences();
  }, []);

  // Set theme mode with persistence
  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_MODE_STORAGE_KEY, mode);
      setThemeModeState(mode);
    } catch (error) {
      console.error('Failed to save theme mode:', error);
    }
  }, []);

  // Set theme style with persistence
  const setThemeStyle = useCallback(async (style: ThemeStyle) => {
    // Validate that the theme exists
    if (!themeRegistry.hasTheme(style)) {
      console.error(`Theme style "${style}" not found. Using default.`);
      style = themeRegistry.getDefaultTheme().id;
    }
    
    try {
      await AsyncStorage.setItem(THEME_STYLE_STORAGE_KEY, style);
      setThemeStyleState(style);
    } catch (error) {
      console.error('Failed to save theme style:', error);
    }
  }, []);

  // Determine current appearance based on mode and system preference
  const currentAppearance: 'light' | 'dark' = useMemo(() => {
    if (themeMode === 'system') {
      return systemColorScheme ?? 'light';
    }
    return themeMode;
  }, [themeMode, systemColorScheme]);

  // Get the current theme object based on style and appearance
  const currentTheme = useMemo(() => {
    const themeData = themeRegistry.getTheme(themeStyle) || themeRegistry.getDefaultTheme();
    return themeData.theme[currentAppearance];
  }, [themeStyle, currentAppearance]);

  // Get all available themes for UI selection
  const availableThemes = useMemo(() => {
    return themeRegistry.getAllThemes();
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => {
    return {
      themeMode,
      setThemeMode,
      themeStyle,
      setThemeStyle,
      currentTheme,
      availableThemes,
      isLoading,
    };
  }, [themeMode, setThemeMode, themeStyle, setThemeStyle, currentTheme, availableThemes, isLoading]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook to use theme context
export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}
