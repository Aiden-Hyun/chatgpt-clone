// app/_layout.tsx
import { LoadingScreen } from '@/components';
import { useFonts } from 'expo-font';
import { usePathname, useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { useEffect } from 'react';
import { AppState } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ToastContainer, ToastProvider } from '../src/features/alert';
import { AuthProvider, useAuth } from '../src/features/auth';
import { CustomDrawer } from '../src/features/chat/components/CustomDrawer';
import { configureServices } from '../src/features/chat/services/config/ServiceConfiguration';
import { LanguageProvider } from '../src/features/language';
import { ThemeProvider } from '../src/features/theme';
import { navigationTracker } from '../src/shared/lib/navigationTracker';
import { resetDebugGlobals } from '../src/shared/lib/resetDebugGlobals';

// Initialize services
configureServices();

function ProtectedRoutes() {
  const { session, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Define auth routes that don't require authentication
  const authRoutes = ['/auth', '/signup', '/forgot-password'];
  const isAuthRoute = authRoutes.includes(pathname);

  // 🧹 MEMORY LEAK PREVENTION: Reset debug globals when app backgrounds
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState !== 'active') {
        resetDebugGlobals();
      }
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!isLoading && !session && !isAuthRoute) {
      // Only redirect to auth if user is not on an auth route
      router.replace('/auth');
    }
  }, [isLoading, session, pathname, isAuthRoute, router]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  const handleSettings = () => {
    // Store the current pathname before navigating to settings
    const currentPath = pathname || '/chat';
    navigationTracker.setPreviousRoute(currentPath);
    router.push('/settings');
  };

  return (
    <>
      <Drawer 
        drawerContent={() => <CustomDrawer onSettings={handleSettings} />}
        screenOptions={{
          headerShown: false,
          drawerStyle: {
            backgroundColor: '#fff',
            width: 320,
          },
          drawerType: 'front',
        }}
      >
        <Drawer.Screen name="index" />
        <Drawer.Screen name="(auth)" />
        <Drawer.Screen name="settings/index" />
        <Drawer.Screen name="settings/theme-settings" />
        <Drawer.Screen name="theme-showcase" />
        <Drawer.Screen name="chat/index" />
        <Drawer.Screen name="chat/[roomId]" />
        <Drawer.Screen name="design-showcase" />
      </Drawer>
      <ToastContainer />
    </>
  );
}

export default function Layout() {
  const [fontsLoaded] = useFonts({
    CascadiaMono: require('../assets/fonts/Cascadia/CascadiaMono.ttf'),
    CascadiaMonoBold: require('../assets/fonts/Cascadia/CascadiaMono-Bold.otf'),
  });

  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              {fontsLoaded ? <ProtectedRoutes /> : <LoadingScreen />}
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}