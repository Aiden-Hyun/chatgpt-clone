import { renderHook } from '@testing-library/react-hooks';
import React from 'react';

// Custom render function for hooks with providers
export const renderHookWithProviders = <TResult>(
  hook: () => TResult,
  options?: {
    wrapper?: React.ComponentType<{ children: React.ReactNode }>;
  }
) => {
  return renderHook(hook, options);
};

// Mock data factories
export const createMockError = (overrides = {}) => ({
  id: 'test-id',
  message: 'Test error',
  type: 'general' as const,
  timestamp: Date.now(),
  ...overrides,
});

export const createMockNetworkError = (message = 'Network error') => 
  createMockError({ message, type: 'network' as const });

export const createMockAuthError = (message = 'Auth error') => 
  createMockError({ message, type: 'auth' as const });

export const createMockApiError = (message = 'API error') => 
  createMockError({ message, type: 'api' as const });

export const createMockValidationError = (message = 'Validation error') => 
  createMockError({ message, type: 'validation' as const });

// Helper to wait for async operations
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to advance timers
export const advanceTimersByTime = (ms: number) => {
  jest.advanceTimersByTime(ms);
}; 