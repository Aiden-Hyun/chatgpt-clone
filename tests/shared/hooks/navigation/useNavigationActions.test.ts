import { act, renderHook } from '@testing-library/react-hooks';
import { router } from 'expo-router';
import { useNavigationActions } from '../../../../src/shared/hooks/navigation/useNavigationActions';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn().mockResolvedValue(undefined),
    replace: jest.fn().mockResolvedValue(undefined),
    back: jest.fn().mockResolvedValue(undefined),
  },
}));

const mockRouter = router as jest.Mocked<typeof router>;

describe('useNavigationActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockOptions = (overrides = {}) => ({
    preventNavigationDuringLoading: true,
    isNavigating: false,
    canGoBack: true,
    setIsNavigating: jest.fn(),
    ...overrides,
  });

  describe('Initialization', () => {
    it('should initialize with default options', () => {
      const options = createMockOptions();
      const { result } = renderHook(() => useNavigationActions(options));

      expect(typeof result.current.navigateTo).toBe('function');
      expect(typeof result.current.goBack).toBe('function');
      expect(typeof result.current.canNavigate).toBe('function');
    });

    it('should accept custom options', () => {
      const customSetIsNavigating = jest.fn();
      const options = createMockOptions({
        preventNavigationDuringLoading: false,
        isNavigating: true,
        canGoBack: false,
        setIsNavigating: customSetIsNavigating,
      });

      const { result } = renderHook(() => useNavigationActions(options));

      expect(result.current).toBeDefined();
    });
  });

  describe('navigateTo', () => {
    it('should navigate to route using push by default', async () => {
      const options = createMockOptions();
      const { result } = renderHook(() => useNavigationActions(options));

      await act(async () => {
        await result.current.navigateTo('/test-route');
      });

      expect(mockRouter.push).toHaveBeenCalledWith('/test-route');
      expect(mockRouter.replace).not.toHaveBeenCalled();
      expect(options.setIsNavigating).toHaveBeenCalledWith(true);
      expect(options.setIsNavigating).toHaveBeenCalledWith(false);
    });

    it('should navigate to route using replace when specified', async () => {
      const options = createMockOptions();
      const { result } = renderHook(() => useNavigationActions(options));

      await act(async () => {
        await result.current.navigateTo('/test-route', true);
      });

      expect(mockRouter.replace).toHaveBeenCalledWith('/test-route');
      expect(mockRouter.push).not.toHaveBeenCalled();
    });

    it('should not navigate when already navigating', async () => {
      const options = createMockOptions({ isNavigating: true });
      const { result } = renderHook(() => useNavigationActions(options));

      await act(async () => {
        await result.current.navigateTo('/test-route');
      });

      expect(mockRouter.push).not.toHaveBeenCalled();
      expect(mockRouter.replace).not.toHaveBeenCalled();
      expect(options.setIsNavigating).not.toHaveBeenCalled();
    });

    it('should handle navigation errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const options = createMockOptions();
      const { result } = renderHook(() => useNavigationActions(options));

      mockRouter.push.mockRejectedValueOnce(new Error('Navigation failed'));

      await act(async () => {
        await result.current.navigateTo('/test-route');
      });

      expect(consoleSpy).toHaveBeenCalledWith('Navigation error - navigateTo:', expect.any(Error));
      expect(options.setIsNavigating).toHaveBeenCalledWith(true);
      expect(options.setIsNavigating).toHaveBeenCalledWith(false);

      consoleSpy.mockRestore();
    });

    it('should set isNavigating state correctly during navigation', async () => {
      const options = createMockOptions();
      const { result } = renderHook(() => useNavigationActions(options));

      const navigationPromise = act(async () => {
        await result.current.navigateTo('/test-route');
      });

      // Check that isNavigating is set to true immediately
      expect(options.setIsNavigating).toHaveBeenCalledWith(true);

      await navigationPromise;

      // Check that isNavigating is set to false after navigation
      expect(options.setIsNavigating).toHaveBeenCalledWith(false);
    });
  });

  describe('goBack', () => {
    it('should go back when navigation is allowed', async () => {
      const options = createMockOptions({ canGoBack: true });
      const { result } = renderHook(() => useNavigationActions(options));

      await act(async () => {
        await result.current.goBack();
      });

      expect(mockRouter.back).toHaveBeenCalled();
      expect(options.setIsNavigating).toHaveBeenCalledWith(true);
      expect(options.setIsNavigating).toHaveBeenCalledWith(false);
    });

    it('should not go back when already navigating', async () => {
      const options = createMockOptions({ isNavigating: true, canGoBack: true });
      const { result } = renderHook(() => useNavigationActions(options));

      await act(async () => {
        await result.current.goBack();
      });

      expect(mockRouter.back).not.toHaveBeenCalled();
      expect(options.setIsNavigating).not.toHaveBeenCalled();
    });

    it('should not go back when cannot go back', async () => {
      const options = createMockOptions({ canGoBack: false });
      const { result } = renderHook(() => useNavigationActions(options));

      await act(async () => {
        await result.current.goBack();
      });

      expect(mockRouter.back).not.toHaveBeenCalled();
      expect(options.setIsNavigating).not.toHaveBeenCalled();
    });

    it('should handle go back errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const options = createMockOptions({ canGoBack: true });
      const { result } = renderHook(() => useNavigationActions(options));

      mockRouter.back.mockRejectedValueOnce(new Error('Go back failed'));

      await act(async () => {
        await result.current.goBack();
      });

      expect(consoleSpy).toHaveBeenCalledWith('Navigation error - goBack:', expect.any(Error));
      expect(options.setIsNavigating).toHaveBeenCalledWith(true);
      expect(options.setIsNavigating).toHaveBeenCalledWith(false);

      consoleSpy.mockRestore();
    });
  });

  describe('canNavigate', () => {
    it('should allow navigation when conditions are met', () => {
      const options = createMockOptions({
        isNavigating: false,
        preventNavigationDuringLoading: true,
      });
      const { result } = renderHook(() => useNavigationActions(options));

      expect(result.current.canNavigate()).toBe(true);
      expect(result.current.canNavigate(false)).toBe(true);
    });

    it('should prevent navigation when already navigating', () => {
      const options = createMockOptions({ isNavigating: true });
      const { result } = renderHook(() => useNavigationActions(options));

      expect(result.current.canNavigate()).toBe(false);
      expect(result.current.canNavigate(false)).toBe(false);
    });

    it('should prevent navigation during loading when enabled', () => {
      const options = createMockOptions({
        isNavigating: false,
        preventNavigationDuringLoading: true,
      });
      const { result } = renderHook(() => useNavigationActions(options));

      expect(result.current.canNavigate(true)).toBe(false);
    });

    it('should allow navigation during loading when disabled', () => {
      const options = createMockOptions({
        isNavigating: false,
        preventNavigationDuringLoading: false,
      });
      const { result } = renderHook(() => useNavigationActions(options));

      expect(result.current.canNavigate(true)).toBe(true);
    });

    it('should handle undefined loading state', () => {
      const options = createMockOptions({
        isNavigating: false,
        preventNavigationDuringLoading: true,
      });
      const { result } = renderHook(() => useNavigationActions(options));

      expect(result.current.canNavigate(undefined)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty route strings', async () => {
      const options = createMockOptions();
      const { result } = renderHook(() => useNavigationActions(options));

      await act(async () => {
        await result.current.navigateTo('');
      });

      expect(mockRouter.push).toHaveBeenCalledWith('');
    });

    it('should handle special characters in routes', async () => {
      const options = createMockOptions();
      const { result } = renderHook(() => useNavigationActions(options));

      const specialRoute = '/route/with/special/chars/!@#$%^&*()';
      await act(async () => {
        await result.current.navigateTo(specialRoute);
      });

      expect(mockRouter.push).toHaveBeenCalledWith(specialRoute);
    });

    it('should handle very long route strings', async () => {
      const options = createMockOptions();
      const { result } = renderHook(() => useNavigationActions(options));

      const longRoute = '/very/long/route/path/that/goes/on/and/on/and/on/with/many/segments';
      await act(async () => {
        await result.current.navigateTo(longRoute);
      });

      expect(mockRouter.push).toHaveBeenCalledWith(longRoute);
    });

    it('should handle multiple rapid navigation calls', async () => {
      const options = createMockOptions();
      const { result } = renderHook(() => useNavigationActions(options));

      // First navigation
      await act(async () => {
        await result.current.navigateTo('/route1');
      });

      // Second navigation immediately after
      await act(async () => {
        await result.current.navigateTo('/route2');
      });

      expect(mockRouter.push).toHaveBeenCalledWith('/route1');
      expect(mockRouter.push).toHaveBeenCalledWith('/route2');
      expect(options.setIsNavigating).toHaveBeenCalledTimes(4); // true, false, true, false
    });
  });

  describe('State Management', () => {
    it('should properly manage isNavigating state during navigation', async () => {
      const options = createMockOptions();
      const { result } = renderHook(() => useNavigationActions(options));

      const navigationPromise = act(async () => {
        await result.current.navigateTo('/test-route');
      });

      // Should set isNavigating to true immediately
      expect(options.setIsNavigating).toHaveBeenCalledWith(true);

      await navigationPromise;

      // Should set isNavigating to false after navigation completes
      expect(options.setIsNavigating).toHaveBeenCalledWith(false);
    });

    it('should set isNavigating to false even when navigation fails', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const options = createMockOptions();
      const { result } = renderHook(() => useNavigationActions(options));

      mockRouter.push.mockRejectedValueOnce(new Error('Navigation failed'));

      await act(async () => {
        await result.current.navigateTo('/test-route');
      });

      expect(options.setIsNavigating).toHaveBeenCalledWith(true);
      expect(options.setIsNavigating).toHaveBeenCalledWith(false);

      consoleSpy.mockRestore();
    });
  });
}); 