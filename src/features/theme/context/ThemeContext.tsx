import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useColorScheme } from "react-native";

import { useReadProfile, useUpdateProfile } from "../../../entities/user";
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

  // Database hooks for profile persistence
  const { profile, loading: profileLoading } = useReadProfile();
  const { updateProfile, loading: updateLoading } = useUpdateProfile();

  // State for theme mode (light, dark, system)
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");

  // State for theme style (which theme set to use)
  const [themeStyle, setThemeStyleState] = useState<ThemeStyle>("default");

  // Enhanced loading state management
  const { loading: isLoading, executeWithLoading } = useLoadingState({
    initialLoading: true,
  });

  // Get system color scheme
  const systemColorScheme = useColorScheme();

  // Load saved theme preferences from local storage only
  useEffect(() => {
    const loadThemePreferences = async () => {
      await executeWithLoading(
        async () => {
          // Always load from local storage first (fast and immediate)
          const savedThemeMode = await mobileStorage.getItem(
            STORAGE_KEYS.THEME_MODE
          );
          if (
            savedThemeMode &&
            ["light", "dark", "system"].includes(savedThemeMode)
          ) {
            setThemeModeState(savedThemeMode as ThemeMode);
          }

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
  const setThemeMode = useCallback(
    async (mode: ThemeMode) => {
      try {
        // Update local state immediately
        setThemeModeState(mode);

        // Save to local storage first (fast and immediate)
        await mobileStorage.setItem(STORAGE_KEYS.THEME_MODE, mode);

        // Save to database in background (only when user makes changes)
        if (profile?.id) {
          logger.debug("Saving theme_mode to database:", { mode });
          await updateProfile({ theme_mode: mode });
          logger.debug("Theme mode saved successfully");
        } else {
          logger.warn("No profile found, cannot save theme_mode to database");
        }
      } catch (error) {
        // Use unified error handling system
        await errorHandler.handle(error, {
          operation: "setThemeMode",
          service: "theme",
          component: "ThemeContext",
          metadata: { mode },
        });
      }
    },
    [profile?.id, updateProfile]
  );

  // Set theme style with persistence
  const setThemeStyle = useCallback(
    async (style: ThemeStyle) => {
      // Validate that the theme exists
      if (!themeRegistry.hasTheme(style)) {
        logger.error(`Theme style "${style}" not found. Using default.`);
        style = themeRegistry.getDefaultTheme().id;
      }

      try {
        // Update local state immediately
        setThemeStyleState(style);

        // Save to local storage first (fast and immediate)
        await mobileStorage.setItem(STORAGE_KEYS.THEME_STYLE, style);

        // Save to database in background (only when user makes changes)
        if (profile?.id) {
          logger.debug("Saving theme_style to database:", { style });
          await updateProfile({ theme_style: style });
          logger.debug("Theme style saved successfully");
        } else {
          logger.warn("No profile found, cannot save theme_style to database");
        }
      } catch (error) {
        // Use unified error handling system
        await errorHandler.handle(error, {
          operation: "setThemeStyle",
          service: "theme",
          component: "ThemeContext",
          metadata: { style },
        });
      }
    },
    [profile?.id, updateProfile]
  );

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
      isLoading: isLoading || profileLoading || updateLoading,
    };
  }, [
    themeMode,
    setThemeMode,
    themeStyle,
    setThemeStyle,
    currentTheme,
    availableThemes,
    isLoading,
    profileLoading,
    updateLoading,
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
