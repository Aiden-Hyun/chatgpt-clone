import { act, renderHook } from '@testing-library/react-hooks';
import { useErrorState } from '../../../../src/shared/hooks/error/useErrorState';

describe('Debug useErrorState', () => {
  it('should debug the clearing issue', () => {
    const { result } = renderHook(() => useErrorState());

    // Add first error
    act(() => {
      result.current.setError({
        message: 'First error',
        type: 'general',
      });
    });

    console.log('After first error:', {
      errors: result.current.errors.map(e => ({ id: e.id, message: e.message })),
      currentError: result.current.currentError ? { id: result.current.currentError.id, message: result.current.currentError.message } : null,
    });

    // Add second error
    act(() => {
      result.current.setError({
        message: 'Second error',
        type: 'network',
      });
    });

    console.log('After second error:', {
      errors: result.current.errors.map(e => ({ id: e.id, message: e.message })),
      currentError: result.current.currentError ? { id: result.current.currentError.id, message: result.current.currentError.message } : null,
    });

    const firstErrorId = result.current.errors[0].id;
    const secondErrorId = result.current.errors[1].id;

    console.log('Error IDs:', { firstErrorId, secondErrorId });
    console.log('Are IDs the same?', firstErrorId === secondErrorId);

    // Clear first error
    act(() => {
      result.current.clearError(firstErrorId);
    });

    console.log('After clearing first error:', {
      errors: result.current.errors.map(e => ({ id: e.id, message: e.message })),
      currentError: result.current.currentError ? { id: result.current.currentError.id, message: result.current.currentError.message } : null,
    });

    // The test should pass if the logic is correct
    expect(result.current.errors).toHaveLength(1);
    expect(result.current.errors[0].id).toBe(secondErrorId);
    expect(result.current.currentError?.id).toBe(secondErrorId);
  });
}); 