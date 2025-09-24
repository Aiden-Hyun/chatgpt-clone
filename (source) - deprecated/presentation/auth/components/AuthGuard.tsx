/**
 * Auth Guard Component
 * Simple layout-level auth protection
 * Replaces complex ProtectedRoutes logic in _layout.tsx
 */

import { usePathname, useRouter } from 'expo-router';
import React, { useEffect } from 'react';

import { LoadingScreen } from '../../components/LoadingScreen';
import { useAuth } from '../context/AuthContext';
import { AuthGuardProps } from '../types/auth.types';

/**
 * Simple auth guard for layout-level protection
 * Handles route protection and redirects based on auth state
 */
export function AuthGuard({ 
  children, 
  fallback,
  redirectTo = '/auth',
  publicRoutes = ['/auth', '/signup', '/forgot-password']
}: AuthGuardProps) {
  const { session, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Check if current route is public
  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    // Debug logs to trace routing decisions
    console.log('[AuthGuard] effect start', { isLoading, hasSession: !!session, pathname, isPublicRoute, redirectTo });

    if (isLoading) {
      return;
    }

    // Decide target route based on auth state and current route
    let targetRoute: string | null = null;
    if (!session && !isPublicRoute) {
      targetRoute = redirectTo;
    } else if (session && isPublicRoute) {
      targetRoute = '/chat';
    }

    // Only navigate if target is different from current to avoid loops
    if (targetRoute && pathname !== targetRoute) {
      console.log('[AuthGuard] Navigating via replace', { from: pathname, to: targetRoute });
      router.replace(targetRoute);
    } else {
      console.log('[AuthGuard] No navigation needed', { pathname, targetRoute });
    }
  }, [isLoading, !!session, pathname, isPublicRoute, redirectTo]);

  // Show loading screen while checking auth
  if (isLoading) {
    return fallback || <LoadingScreen />;
  }

  // While redirecting away from a protected route without session, don't render children
  if (!session && !isPublicRoute) {
    console.log('[AuthGuard] Blocking protected content while redirecting to auth', { pathname });
    return fallback || null;
  }

  // While redirecting away from a public route with a session, don't render children
  if (session && isPublicRoute) {
    console.log('[AuthGuard] Blocking public content while redirecting to /chat', { pathname });
    return fallback || null;
  }

  // For public routes, render without drawer
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // For protected routes, render with full layout
  return <>{children}</>;
}