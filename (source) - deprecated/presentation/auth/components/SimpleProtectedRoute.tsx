/**
 * Simple Protected Route Component
 * Lightweight route protection that replaces complex ProtectedRoute
 * Uses simplified auth state checking
 */

import React from 'react';

import { LoadingScreen } from '../../components/LoadingScreen';
import { useAuth } from '../context/AuthContext';
import { SimpleProtectedRouteProps } from '../types/auth.types';

/**
 * Simple protected route component
 * Shows children if authenticated, fallback if not
 */
export function SimpleProtectedRoute({ 
  children, 
  fallback, 
  loadingComponent 
}: SimpleProtectedRouteProps) {
  const { session, isLoading } = useAuth();

  // Show loading component while checking auth
  if (isLoading) {
    return loadingComponent || <LoadingScreen />;
  }

  // Show children if authenticated, fallback if not
  if (session) {
    return <>{children}</>;
  }

  // Not authenticated - show fallback or nothing
  return fallback ? <>{fallback}</> : null;
}
