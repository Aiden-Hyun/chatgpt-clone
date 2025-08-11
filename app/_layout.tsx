// app/_layout.tsx
import { Stack, usePathname, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { ToastContainer, ToastProvider } from '../src/features/alert';
import { AuthProvider, useAuth } from '../src/features/auth';
import { configureServices } from '../src/features/chat/services/config/ServiceConfiguration';
import { LanguageProvider } from '../src/features/language';
import { ThemeProvider } from '../src/features/theme';

// Initialize services
configureServices();

function ProtectedRoutes() {
  const { session, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Define auth routes that don't require authentication
  const authRoutes = ['/auth', '/signup', '/forgot-password'];
  const isAuthRoute = authRoutes.includes(pathname);

  useEffect(() => {
    if (!isLoading && !session && !isAuthRoute) {
      // Only redirect to auth if user is not on an auth route
      router.replace('/auth');
    }
  }, [isLoading, session, pathname, isAuthRoute]);

  // Redirect to /chat by default for authenticated users
  useEffect(() => {
    if (!isLoading && session && pathname === '/') {
      // Redirect to fresh new chat instead of home screen
      router.replace('/chat');
    }
  }, [isLoading, session, pathname]);

  if (isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#FFFFFF'
      }}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="settings/index" />
        <Stack.Screen name="chat/index" />
        <Stack.Screen name="chat/[roomId]" />
        <Stack.Screen name="design-showcase" />
        <Stack.Screen name="chatgpt-demo" />
      </Stack>
      <ToastContainer />
    </>
  );
}

export default function Layout() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <ProtectedRoutes />
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}