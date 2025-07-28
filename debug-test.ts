import { act, renderHook } from '@testing-library/react-hooks';
import { useErrorState } from './src/shared/hooks/error/useErrorState';

// Simple debug test
const { result } = renderHook(() => useErrorState());

console.log('Initial state:', {
  errors: result.current.errors,
  currentError: result.current.currentError,
  hasErrors: result.current.hasErrors,
  errorCount: result.current.errorCount
});

act(() => {
  result.current.setError({
    message: 'First error',
    type: 'general',
  });
});

console.log('After first error:', {
  errors: result.current.errors,
  currentError: result.current.currentError,
  hasErrors: result.current.hasErrors,
  errorCount: result.current.errorCount
});

act(() => {
  result.current.setError({
    message: 'Second error',
    type: 'network',
  });
});

console.log('After second error:', {
  errors: result.current.errors,
  currentError: result.current.currentError,
  hasErrors: result.current.hasErrors,
  errorCount: result.current.errorCount
});

const firstErrorId = result.current.errors[0].id;
console.log('Clearing first error with ID:', firstErrorId);

act(() => {
  result.current.clearError(firstErrorId);
});

console.log('After clearing first error:', {
  errors: result.current.errors,
  currentError: result.current.currentError,
  hasErrors: result.current.hasErrors,
  errorCount: result.current.errorCount
}); 