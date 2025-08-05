// app/_layout.tsx
import { Slot, Stack, usePathname, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider, useAuth } from '../src/features/auth';
import { LanguageProvider } from '../src/features/language';
import { ThemeProvider } from '../src/features/theme';
import { ToastProvider, ToastContainer } from '../src/features/alert';
import { configureServices } from '../src/features/chat/services/config/ServiceConfiguration';

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
        <Stack.Screen name="settings" />
        <Stack.Screen name="chat" />
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