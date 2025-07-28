import { act, renderHook } from '@testing-library/react-hooks';
import { useErrorState } from '../../../../src/shared/hooks/error/useErrorState';
import { createMockError } from '../../../utils/test-utils';

describe('useErrorState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with empty state', () => {
      const { result } = renderHook(() => useErrorState());

      expect(result.current.errors).toEqual([]);
      expect(result.current.currentError).toBeNull();
      expect(result.current.hasErrors).toBe(false);
      expect(result.current.errorCount).toBe(0);
    });

    it('should have all required methods', () => {
      const { result } = renderHook(() => useErrorState());

      expect(typeof result.current.setError).toBe('function');
      expect(typeof result.current.clearError).toBe('function');
      expect(typeof result.current.clearAllErrors).toBe('function');
      expect(typeof result.current.setCurrentError).toBe('function');
    });
  });

  describe('Setting Errors', () => {
    it('should add a single error', () => {
      const { result } = renderHook(() => useErrorState());

      act(() => {
        result.current.setError({
          message: 'Test error',
          type: 'general',
        });
      });

      expect(result.current.errors).toHaveLength(1);
      expect(result.current.currentError).toEqual(
        expect.objectContaining({
          message: 'Test error',
          type: 'general',
        })
      );
      expect(result.current.hasErrors).toBe(true);
      expect(result.current.errorCount).toBe(1);
    });

    it('should add multiple errors', () => {
      const { result } = renderHook(() => useErrorState());

      act(() => {
        result.current.setError({
          message: 'First error',
          type: 'general',
        });
        result.current.setError({
          message: 'Second error',
          type: 'network',
        });
      });

      expect(result.current.errors).toHaveLength(2);
      expect(result.current.currentError).toEqual(
        expect.objectContaining({
          message: 'Second error',
          type: 'network',
        })
      );
      expect(result.current.hasErrors).toBe(true);
      expect(result.current.errorCount).toBe(2);
    });

    it('should generate unique IDs for errors', () => {
      const { result } = renderHook(() => useErrorState());

      act(() => {
        result.current.setError({
          message: 'First error',
          type: 'general',
        });
      });

      // Add a small delay to ensure different timestamps
      act(() => {
        // Force a small delay
        const start = Date.now();
        while (Date.now() - start < 1) {
          // Wait for at least 1ms
        }
        
        result.current.setError({
          message: 'Second error',
          type: 'network',
        });
      });

      const [firstError, secondError] = result.current.errors;
      expect(firstError.id).toBeDefined();
      expect(secondError.id).toBeDefined();
      expect(firstError.id).not.toBe(secondError.id);
    });

    it('should add timestamp to errors', () => {
      const { result } = renderHook(() => useErrorState());
      const beforeTime = Date.now();

      act(() => {
        result.current.setError({
          message: 'Test error',
          type: 'general',
        });
      });

      const afterTime = Date.now();
      const error = result.current.currentError;
      
      expect(error?.timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(error?.timestamp).toBeLessThanOrEqual(afterTime);
    });

    it('should handle errors with details', () => {
      const { result } = renderHook(() => useErrorState());
      const details = { code: 500, stack: 'Error stack' };

      act(() => {
        result.current.setError({
          message: 'Test error',
          type: 'api',
          details,
        });
      });

      expect(result.current.currentError).toEqual(
        expect.objectContaining({
          message: 'Test error',
          type: 'api',
          details,
        })
      );
    });
  });

  describe('Clearing Errors', () => {
    it('should clear a specific error by ID', () => {
      const { result } = renderHook(() => useErrorState());

      // Set errors in separate act calls to ensure different timestamps
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

      // Clear the first error (not the current one)
      act(() => {
        result.current.clearError(firstErrorId);
      });

      console.log('After clearing first error:', {
        errors: result.current.errors.map(e => ({ id: e.id, message: e.message })),
        currentError: result.current.currentError ? { id: result.current.currentError.id, message: result.current.currentError.message } : null,
      });

      expect(result.current.errors).toHaveLength(1);
      expect(result.current.errors[0].id).toBe(secondErrorId);
      // Current error should remain the same (second error)
      expect(result.current.currentError?.id).toBe(secondErrorId);
      expect(result.current.hasErrors).toBe(true);
      expect(result.current.errorCount).toBe(1);
    });

    it('should clear current error when it is cleared', () => {
      const { result } = renderHook(() => useErrorState());

      act(() => {
        result.current.setError({
          message: 'Test error',
          type: 'general',
        });
      });

      const errorId = result.current.currentError?.id;
      expect(errorId).toBeDefined();

      act(() => {
        result.current.clearError(errorId!);
      });

      expect(result.current.currentError).toBeNull();
      expect(result.current.errors).toHaveLength(0);
      expect(result.current.hasErrors).toBe(false);
    });

    it('should not affect other errors when clearing non-existent error', () => {
      const { result } = renderHook(() => useErrorState());

      act(() => {
        result.current.setError({
          message: 'Test error',
          type: 'general',
        });
      });

      const originalErrorCount = result.current.errorCount;
      const originalCurrentError = result.current.currentError;

      act(() => {
        result.current.clearError('non-existent-id');
      });

      expect(result.current.errorCount).toBe(originalErrorCount);
      expect(result.current.currentError).toBe(originalCurrentError);
    });

    it('should clear all errors', () => {
      const { result } = renderHook(() => useErrorState());

      act(() => {
        result.current.setError({
          message: 'First error',
          type: 'general',
        });
        result.current.setError({
          message: 'Second error',
          type: 'network',
        });
        result.current.setError({
          message: 'Third error',
          type: 'api',
        });
      });

      expect(result.current.errors).toHaveLength(3);

      act(() => {
        result.current.clearAllErrors();
      });

      expect(result.current.errors).toHaveLength(0);
      expect(result.current.currentError).toBeNull();
      expect(result.current.hasErrors).toBe(false);
      expect(result.current.errorCount).toBe(0);
    });
  });

  describe('Setting Current Error Directly', () => {
    it('should set current error directly', () => {
      const { result } = renderHook(() => useErrorState());
      const mockError = createMockError({ message: 'Direct error' });

      act(() => {
        result.current.setCurrentError(mockError);
      });

      expect(result.current.currentError).toBe(mockError);
      expect(result.current.errors).toHaveLength(0); // Should not add to errors array
    });

    it('should clear current error when set to null', () => {
      const { result } = renderHook(() => useErrorState());

      act(() => {
        result.current.setError({
          message: 'Test error',
          type: 'general',
        });
      });

      expect(result.current.currentError).not.toBeNull();

      act(() => {
        result.current.setCurrentError(null);
      });

      expect(result.current.currentError).toBeNull();
    });
  });

  describe('Error Types', () => {
    it('should handle all error types', () => {
      const { result } = renderHook(() => useErrorState());
      const errorTypes = ['general', 'network', 'auth', 'validation', 'api'] as const;

      errorTypes.forEach((type, index) => {
        act(() => {
          result.current.setError({
            message: `${type} error`,
            type,
          });
        });

        expect(result.current.currentError?.type).toBe(type);
        expect(result.current.currentError?.message).toBe(`${type} error`);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty message', () => {
      const { result } = renderHook(() => useErrorState());

      act(() => {
        result.current.setError({
          message: '',
          type: 'general',
        });
      });

      expect(result.current.currentError?.message).toBe('');
      expect(result.current.hasErrors).toBe(true);
    });

    it('should handle very long messages', () => {
      const { result } = renderHook(() => useErrorState());
      const longMessage = 'a'.repeat(1000);

      act(() => {
        result.current.setError({
          message: longMessage,
          type: 'general',
        });
      });

      expect(result.current.currentError?.message).toBe(longMessage);
    });

    it('should handle rapid error additions', () => {
      const { result } = renderHook(() => useErrorState());

      act(() => {
        // Add 10 errors rapidly
        for (let i = 0; i < 10; i++) {
          result.current.setError({
            message: `Error ${i}`,
            type: 'general',
          });
        }
      });

      expect(result.current.errors).toHaveLength(10);
      expect(result.current.errorCount).toBe(10);
      expect(result.current.hasErrors).toBe(true);
    });

    it('should maintain error order (FIFO)', () => {
      const { result } = renderHook(() => useErrorState());

      act(() => {
        result.current.setError({
          message: 'First error',
          type: 'general',
        });
        result.current.setError({
          message: 'Second error',
          type: 'network',
        });
        result.current.setError({
          message: 'Third error',
          type: 'api',
        });
      });

      expect(result.current.errors[0].message).toBe('First error');
      expect(result.current.errors[1].message).toBe('Second error');
      expect(result.current.errors[2].message).toBe('Third error');
    });
  });

  describe('State Consistency', () => {
    it('should keep hasErrors and errorCount in sync', () => {
      const { result } = renderHook(() => useErrorState());

      // Initially no errors
      expect(result.current.hasErrors).toBe(false);
      expect(result.current.errorCount).toBe(0);

      // Add error
      act(() => {
        result.current.setError({
          message: 'Test error',
          type: 'general',
        });
      });

      expect(result.current.hasErrors).toBe(true);
      expect(result.current.errorCount).toBe(1);

      // Clear error
      act(() => {
        result.current.clearAllErrors();
      });

      expect(result.current.hasErrors).toBe(false);
      expect(result.current.errorCount).toBe(0);
    });

    it('should update currentError when errors array changes', () => {
      const { result } = renderHook(() => useErrorState());

      act(() => {
        result.current.setError({
          message: 'First error',
          type: 'general',
        });
      });

      const firstError = result.current.currentError;

      act(() => {
        result.current.setError({
          message: 'Second error',
          type: 'network',
        });
      });

      const secondError = result.current.currentError;

      expect(firstError).not.toBe(secondError);
      expect(secondError?.message).toBe('Second error');
    });
  });
}); 