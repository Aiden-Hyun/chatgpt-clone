// source/presentation/app/_layout.tsx
import { useFonts } from "expo-font";
import { usePathname, useRouter } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { useCallback, useEffect, useMemo } from "react";
import { AppState } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { navigationTracker } from "../../service/navigation/utils/navigationTrackerInstance";
import { resetDebugGlobals } from "../../service/shared/lib/resetDebugGlobals";
import { ToastContainer, ToastProvider } from "../alert/toast";
import { AuthProvider, useAuth } from "../auth/context/AuthContext";
import { Sidebar } from "../chat/components/Sidebar";
import { LoadingScreen } from "../components";
import { LanguageProvider } from "../language/LanguageContext";
import { BusinessContextProvider } from "../shared/BusinessContextProvider";
import { ThemeProvider, useThemeContext } from "../theme/context/ThemeContext";
import { useAppTheme } from "../theme/hooks/useTheme";

// Debug imports
console.log('🔍 Import checks:', {
  ToastContainer: !!ToastContainer,
  ToastProvider: !!ToastProvider,
  AuthProvider: !!AuthProvider,
  useAuth: !!useAuth,
  Sidebar: !!Sidebar,
  LoadingScreen: !!LoadingScreen,
  LanguageProvider: !!LanguageProvider,
  BusinessContextProvider: !!BusinessContextProvider,
  ThemeProvider: !!ThemeProvider,
  useThemeContext: !!useThemeContext,
  useAppTheme: !!useAppTheme
});

function AppContent() {
  const [fontsLoaded] = useFonts({
    CascadiaMono: require("../../../assets/fonts/Cascadia/CascadiaMono.ttf"),
    CascadiaMonoBold: require("../../../assets/fonts/Cascadia/CascadiaMono-Bold.otf"),
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
  const theme = useAppTheme();

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
    () => {
      console.log('🔍 drawerContent: Creating Sidebar');
      console.log('🔍 drawerContent: Sidebar component:', !!Sidebar);
      console.log('🔍 drawerContent: handleSettings:', !!handleSettings);
      return <Sidebar onSettings={handleSettings} />;
    },
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

  console.log('🔍 ProtectedRoutes: About to render Drawer');
  console.log('🔍 ProtectedRoutes: Drawer component:', !!Drawer);
  console.log('🔍 ProtectedRoutes: drawerContent:', !!drawerContent);
  console.log('🔍 ProtectedRoutes: screenOptions:', !!screenOptions);
  console.log('🔍 ProtectedRoutes: ToastContainer:', !!ToastContainer);

  return (
    <>
      <Drawer
        drawerContent={drawerContent} // Use the memoized drawerContent
        screenOptions={screenOptions}
      >
        <Drawer.Screen name="index" />
        <Drawer.Screen name="(auth)/auth" />
        <Drawer.Screen name="settings/index" />
        <Drawer.Screen name="chat/index" />
      </Drawer>
      <ToastContainer />
    </>
  );
}

export default function Layout() {
  console.log('🔍 Layout: Starting render');
  console.log('🔍 Layout: Component checks:', {
    SafeAreaProvider: !!SafeAreaProvider,
    BusinessContextProvider: !!BusinessContextProvider,
    LanguageProvider: !!LanguageProvider,
    ThemeProvider: !!ThemeProvider,
    AuthProvider: !!AuthProvider,
    ToastProvider: !!ToastProvider,
    AppContent: !!AppContent
  });
  
  return (
    <SafeAreaProvider>
      <BusinessContextProvider>
        <LanguageProvider>
          <ThemeProvider>
            <AuthProvider>
              <ToastProvider>
                <AppContent />
              </ToastProvider>
            </AuthProvider>
          </ThemeProvider>
        </LanguageProvider>
      </BusinessContextProvider>
    </SafeAreaProvider>
  );
}