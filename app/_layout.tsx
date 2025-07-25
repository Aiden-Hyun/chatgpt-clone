// app/_layout.tsx
import { Slot, usePathname, useRouter } from 'expo-router';
import { useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { AuthProvider, useAuth } from '../src/features/auth';

WebBrowser.maybeCompleteAuthSession();

function ProtectedRoutes() {
  const { session, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !session && pathname !== '/login') {
      router.replace('/login');
    }
  }, [isLoading, session, pathname]);

  if (isLoading) return null;

  return <Slot />;
}

export default function Layout() {
  return (
    <AuthProvider>
      <ProtectedRoutes />
    </AuthProvider>
  );
}
