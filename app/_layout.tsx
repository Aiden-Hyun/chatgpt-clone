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
  console.log('[ProtectedRoutes] 🎯 About to call useAuth()');
  const { session, isLoading } = useAuth();
  console.log('[ProtectedRoutes] ✅ useAuth() called successfully');
  
  const router = useRouter();
  const pathname = usePathname();

  console.log('[ProtectedRoutes] 🔄 Render - Component ID:', Math.random().toString(36).substr(2, 9));
  console.log('[ProtectedRoutes] 📊 State:', { 
    hasSession: !!session, 
    isLoading, 
    pathname,
    userId: session?.user?.id,
    timestamp: new Date().toISOString()
  });

  // Define auth routes that don't require authentication
  const authRoutes = ['/auth', '/signup', '/forgot-password'];
  const isAuthRoute = authRoutes.includes(pathname);

  console.log('[ProtectedRoutes] 🛣️ Route check:', { pathname, isAuthRoute, authRoutes });

  // 🧹 MEMORY LEAK PREVENTION: Reset debug globals when app backgrounds
  useEffect(() => {
    console.log('[ProtectedRoutes] 📱 Setting up AppState listener');
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      console.log('[ProtectedRoutes] 📱 AppState changed:', nextAppState);
      if (nextAppState !== 'active') {
        console.log('[ProtectedRoutes] 🧹 Resetting debug globals');
        resetDebugGlobals();
      }
    });

    return () => {
      console.log('[ProtectedRoutes] 🧹 Cleaning up AppState listener');
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    console.log('[ProtectedRoutes] 🔍 Auth check effect triggered:', {
      isLoading,
      hasSession: !!session,
      isAuthRoute,
      pathname
    });
    
    if (!isLoading && !session && !isAuthRoute) {
      console.log('[ProtectedRoutes] 🔀 Redirecting to auth - no session and not on auth route');
      // Only redirect to auth if user is not on an auth route
      router.replace('/auth');
    } else {
      console.log('[ProtectedRoutes] ✅ No redirect needed');
    }
  }, [isLoading, session, pathname, isAuthRoute, router]);

  if (isLoading) {
    console.log('[ProtectedRoutes] ⏳ Showing loading screen');
    return <LoadingScreen />;
  }

  console.log('[ProtectedRoutes] 🎨 Rendering main content');

  const handleSettings = () => {
    console.log('[ProtectedRoutes] ⚙️ Settings button clicked');
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
        <Drawer.Screen name="chat/index" />
        <Drawer.Screen name="chat/[roomId]" />
        <Drawer.Screen name="design-showcase" />
      </Drawer>
      <ToastContainer />
    </>
  );
}

export default function Layout() {
  console.log('[Layout] 🔄 Layout render - Component ID:', Math.random().toString(36).substr(2, 9));
  
  const [fontsLoaded] = useFonts({
    CascadiaMono: require('../assets/fonts/Cascadia/CascadiaMono.ttf'),
    CascadiaMonoBold: require('../assets/fonts/Cascadia/CascadiaMono-Bold.otf'),
  });

  console.log('[Layout] 📚 Fonts loaded:', fontsLoaded);

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