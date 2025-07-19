// app/_layout.tsx
import { Slot, usePathname, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../src/AuthContext';

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
