// app/_layout.tsx
import { useFonts } from "expo-font";
import { usePathname, useRouter } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { AppState } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { LoadingScreen } from "@/shared/components/feedback/LoadingScreen";

import { AuthProvider, useAuth } from "../src/entities/session";
import { ToastContainer, ToastProvider } from "../src/features/alert";
import { Sidebar } from "../src/features/chat/components/Sidebar";
import { LanguageProvider } from "../src/features/language";
import { ThemeProvider, useThemeContext } from "../src/features/theme";
import { navigationTracker } from "../src/shared/lib/navigationTracker";
import { resetDebugGlobals } from "../src/shared/lib/resetDebugGlobals";
import { getLogger } from "../src/shared/services/logger";

// Services are now instantiated directly where needed - no configuration required

// Initialize console interceptor for centralized logging
// ConsoleInterceptor.intercept(); // Temporarily disabled to fix circular dependency

function AppContent() {
  const logger = getLogger("AppContent");
  const [fontsLoaded] = useFonts({
    // Load fonts but do not block app render on Android
    CascadiaMono: require("../assets/fonts/Cascadia/CascadiaMono.ttf"),
    CascadiaMonoBold: require("../assets/fonts/Cascadia/CascadiaMono-Bold.otf"),
  });

  const { isLoading: themeLoading } = useThemeContext();

  // Only gate the very first render on theme readiness; never re-gate after app shown
  const hasShownAppRef = useRef(false);
  useEffect(() => {
    if (!themeLoading) {
      hasShownAppRef.current = true;
    }
  }, [themeLoading]);

  const shouldShowLoading = themeLoading && !hasShownAppRef.current;

  logger.debug(
    `Loading states: fonts ${fontsLoaded ? "loaded" : "loading"}, theme ${
      themeLoading ? "loading" : "ready"
    }`
  );

  // Only block before first successful theme-ready render
  if (shouldShowLoading) {
    logger.debug("Showing loading screen");
    return <LoadingScreen />;
  }

  logger.debug("Theme ready, rendering app");
  return <ProtectedRoutes />;
}

function ProtectedRoutes() {
  const logger = getLogger("ProtectedRoutes");
  const { session, isLoading } = useAuth();

  const router = useRouter();
  const pathname = usePathname();

  logger.debug(
    `Auth state: ${
      !!session ? "authenticated" : "not authenticated"
    } (loading: ${isLoading}, path: ${pathname})`
  );

  // Define auth routes that don't require authentication
  const authRoutes = ["/auth", "/signup", "/forgot-password", "/auth/callback"];
  const isAuthRoute = authRoutes.includes(pathname);

  const handleSettings = useCallback(() => {
    const currentPath = pathname || "/chat";
    navigationTracker.setPreviousRoute(currentPath);
    router.push("/settings");
  }, [pathname, router]);

  // Memoize drawerContent to prevent unnecessary re-renders of Sidebar
  const drawerContent = useCallback(
    () => <Sidebar onSettings={handleSettings} />,
    [handleSettings]
  );

  const screenOptions = useMemo(() => {
    return {
      headerShown: false,
      drawerStyle: {
        backgroundColor: "transparent",
        width: 320,
      },
      drawerType: "front" as const,
    };
  }, []);

  // Reset debug globals when app backgrounds
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState !== "active") {
        resetDebugGlobals();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const shouldRedirectToAuth = !session && !isAuthRoute;

  useEffect(() => {
    if (shouldRedirectToAuth) {
      logger.debug(
        `Redirecting to auth - no session (current path: ${pathname})`
      );
      router.replace("/auth");
    }
  }, [shouldRedirectToAuth, pathname, router, logger]);

  if (!session) {
    if (isAuthRoute) {
      // Allow auth stack to render while unauthenticated
      logger.debug("Rendering auth routes (unauthenticated user)");
    } else {
      logger.debug("Unauthenticated and not on auth route, showing loader");
      return <LoadingScreen />;
    }
  }

  return (
    <>
      <Drawer
        drawerContent={drawerContent} // Use the memoized drawerContent
        screenOptions={screenOptions}
      >
        <Drawer.Screen name="index" />
        <Drawer.Screen name="(auth)" />
        <Drawer.Screen name="settings/index" />
        <Drawer.Screen name="settings/themes" />
        <Drawer.Screen name="chat/index" />
        <Drawer.Screen name="chat/[roomId]" />
        <Drawer.Screen name="design-showcase" />
      </Drawer>
      <ToastContainer />
    </>
  );
}

export default function Layout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <LanguageProvider>
          <ThemeProvider>
            <ToastProvider>
              <AppContent />
            </ToastProvider>
          </ThemeProvider>
        </LanguageProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
