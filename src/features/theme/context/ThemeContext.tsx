import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useColorScheme } from "react-native";

import { useLoadingState } from "../../../shared/hooks/useLoadingState";
import { mobileStorage, STORAGE_KEYS } from "../../../shared/lib/storage";
import { errorHandler } from "../../../shared/services/error";
import { getLogger } from "../../../shared/services/logger";

import { AppTheme, ThemeMode, ThemeStyle } from "../theme.types";
import { themeRegistry } from "../themeRegistry";

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
  const logger = getLogger("ThemeContext");

  // State for theme mode (light, dark, system)
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");

  // State for theme style (which theme set to use)
  const [themeStyle, setThemeStyleState] = useState<ThemeStyle>("default");

  // Enhanced loading state management
  const {
    loading: isLoading,
    error: loadingError,
    executeWithLoading,
  } = useLoadingState({ initialLoading: true });

  // Get system color scheme
  const systemColorScheme = useColorScheme();

  // Load saved theme preferences from storage
  useEffect(() => {
    const loadThemePreferences = async () => {
      await executeWithLoading(
        async () => {
          // Load theme mode
          const savedThemeMode = await mobileStorage.getItem(
            STORAGE_KEYS.THEME_MODE
          );
          if (
            savedThemeMode &&
            ["light", "dark", "system"].includes(savedThemeMode)
          ) {
            setThemeModeState(savedThemeMode as ThemeMode);
          }

          // Load theme style
          const savedThemeStyle = await mobileStorage.getItem(
            STORAGE_KEYS.THEME_STYLE
          );
          if (savedThemeStyle && themeRegistry.hasTheme(savedThemeStyle)) {
            setThemeStyleState(savedThemeStyle);
          }
        },
        {
          onError: (error) => {
            logger.error("Failed to load theme preferences:", error);
          },
        }
      );
    };

    loadThemePreferences();
  }, [executeWithLoading]);

  // Set theme mode with persistence
  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    try {
      await mobileStorage.setItem(STORAGE_KEYS.THEME_MODE, mode);
      setThemeModeState(mode);
    } catch (error) {
      // Use unified error handling system
      await errorHandler.handle(error, {
        operation: "setThemeMode",
        service: "theme",
        component: "ThemeContext",
        metadata: { mode },
      });
    }
  }, []);

  // Set theme style with persistence
  const setThemeStyle = useCallback(async (style: ThemeStyle) => {
    // Validate that the theme exists
    if (!themeRegistry.hasTheme(style)) {
      logger.error(`Theme style "${style}" not found. Using default.`);
      style = themeRegistry.getDefaultTheme().id;
    }

    try {
      await mobileStorage.setItem(STORAGE_KEYS.THEME_STYLE, style);
      setThemeStyleState(style);
    } catch (error) {
      // Use unified error handling system
      await errorHandler.handle(error, {
        operation: "setThemeStyle",
        service: "theme",
        component: "ThemeContext",
        metadata: { style },
      });
    }
  }, []);

  // Determine current appearance based on mode and system preference
  const currentAppearance: "light" | "dark" = useMemo(() => {
    if (themeMode === "system") {
      return systemColorScheme ?? "light";
    }
    return themeMode;
  }, [themeMode, systemColorScheme]);

  // Get the current theme object based on style and appearance
  const currentTheme = useMemo(() => {
    const themeData =
      themeRegistry.getTheme(themeStyle) || themeRegistry.getDefaultTheme();
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
  }, [
    themeMode,
    setThemeMode,
    themeStyle,
    setThemeStyle,
    currentTheme,
    availableThemes,
    isLoading,
  ]);

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
    throw new Error("useThemeContext must be used within a ThemeProvider");
  }
  return context;
}
