// source/presentation/app/_layout.tsx
import { useFonts } from "expo-font";
import { Slot, usePathname, useRouter } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { useCallback, useEffect, useMemo } from "react";
import { AppState } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { navigationTracker } from "../../service/navigation/utils/navigationTrackerInstance";
import { resetDebugGlobals } from "../../service/shared/lib/resetDebugGlobals";
import { ToastContainer, ToastProvider } from "../alert/toast";
import { AuthGuard } from "../auth/components/AuthGuard";
import { AuthProvider } from "../auth/context/AuthContext";
import { Sidebar } from "../chat/components/Sidebar";
import { LoadingScreen } from "../components";
import { LanguageProvider } from "../language/LanguageContext";
import { BusinessContextProvider } from "../shared/BusinessContextProvider";
import { ThemeProvider, useThemeContext } from "../theme/context/ThemeContext";

function AppContent() {
  const [fontsLoaded] = useFonts({
    CascadiaMono: require("../../../assets/fonts/Cascadia/CascadiaMono.ttf"),
    CascadiaMonoBold: require("../../../assets/fonts/Cascadia/CascadiaMono-Bold.otf"),
  });

  const { isLoading: themeLoading } = useThemeContext();

  // Wait for both fonts and theme to be ready
  if (!fontsLoaded || themeLoading) {
    return <LoadingScreen />;
  }

  return <MainLayout />;
}

function MainLayout() {
  const pathname = usePathname();
  const router = useRouter();

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

  const screenOptions = useMemo(() => ({
    headerShown: false,
    drawerStyle: {
      backgroundColor: "transparent",
      width: 320,
    },
    drawerType: "front" as const,
  }), []);

  // Define public routes that don't use drawer
  const publicRoutes = ['/auth', '/signup', '/forgot-password'];

  return (
    <AuthGuard publicRoutes={publicRoutes}>
      {publicRoutes.includes(pathname) ? (
        <>
          <Slot />
          <ToastContainer />
        </>
      ) : (
        <>
          <Drawer
            drawerContent={drawerContent}
            screenOptions={screenOptions}
          >
            {/* Drawer should only list private screens that are part of this group */}
            <Drawer.Screen name="index" />
            <Drawer.Screen name="settings/index" />
            <Drawer.Screen name="chat/index" />
          </Drawer>
          <ToastContainer />
        </>
      )}
    </AuthGuard>
  );
}

export default function Layout() {
  return (
    <SafeAreaProvider>
      <BusinessContextProvider>
        <LanguageProvider>
          <ThemeProvider>
            <ToastProvider>
              <AuthProvider>
                <AppContent />
              </AuthProvider>
            </ToastProvider>
          </ThemeProvider>
        </LanguageProvider>
      </BusinessContextProvider>
    </SafeAreaProvider>
  );
}