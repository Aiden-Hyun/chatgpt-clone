// app/_layout.tsx
import { useFonts } from "expo-font";
import { usePathname, useRouter } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { useCallback, useEffect, useMemo } from "react";
import { AppState } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { LoadingScreen } from "@/shared/components/feedback/LoadingScreen";

import { AuthProvider, useAuth } from "../src/entities/session";
import { ToastContainer, ToastProvider } from "../src/features/alert";
import { Sidebar } from "../src/features/chat/components/Sidebar";
import { configureServices } from "../src/features/chat/services/config/ServiceConfiguration";
import { LanguageProvider } from "../src/features/language";
import { ThemeProvider, useThemeContext } from "../src/features/theme";
import { navigationTracker } from "../src/shared/lib/navigationTracker";
import { resetDebugGlobals } from "../src/shared/lib/resetDebugGlobals";

// Initialize services
configureServices();

function AppContent() {
  const [fontsLoaded] = useFonts({
    CascadiaMono: require("../assets/fonts/Cascadia/CascadiaMono.ttf"),
    CascadiaMonoBold: require("../assets/fonts/Cascadia/CascadiaMono-Bold.otf"),
  });

  const { isLoading: themeLoading } = useThemeContext();

  console.log("📊 [AppContent] Loading states:", { fontsLoaded, themeLoading });

  // Wait for both fonts and theme to be ready
  if (!fontsLoaded || themeLoading) {
    console.log("⏳ [AppContent] Showing loading screen");
    return <LoadingScreen />;
  }

  console.log("🚀 [AppContent] Both fonts and theme ready, rendering app");
  return <ProtectedRoutes />;
}

function ProtectedRoutes() {
  const { session, isLoading } = useAuth();

  const router = useRouter();
  const pathname = usePathname();

  console.log("🔐 [ProtectedRoutes] Auth state:", {
    hasSession: !!session,
    isLoading,
    pathname,
  });

  // Define auth routes that don't require authentication
  const authRoutes = ["/auth", "/signup", "/forgot-password"];
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

  useEffect(() => {
    if (!isLoading && !session && !isAuthRoute) {
      console.log("🔄 [ProtectedRoutes] Redirecting to auth - no session");
      // Only redirect to auth if user is not on an auth route
      router.replace("/auth");
    }
  }, [isLoading, session, pathname, isAuthRoute, router]);

  if (isLoading) {
    console.log("⏳ [ProtectedRoutes] Showing loading screen");
    return <LoadingScreen />;
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
      <LanguageProvider>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <AppContent />
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
