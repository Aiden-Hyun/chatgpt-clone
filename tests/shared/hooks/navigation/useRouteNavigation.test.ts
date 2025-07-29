import { act, renderHook } from '@testing-library/react-hooks';
import { useRouteNavigation } from '../../../../src/shared/hooks/navigation/useRouteNavigation';

describe('useRouteNavigation', () => {
  const createMockOptions = (overrides = {}) => ({
    navigateTo: jest.fn().mockResolvedValue(undefined),
    isNavigating: false,
    ...overrides,
  });

  describe('Initialization', () => {
    it('should initialize with all route navigation methods', () => {
      const options = createMockOptions();
      const { result } = renderHook(() => useRouteNavigation(options));

      expect(typeof result.current.navigateToHome).toBe('function');
      expect(typeof result.current.navigateToLogin).toBe('function');
      expect(typeof result.current.navigateToChat).toBe('function');
      expect(typeof result.current.navigateToExplore).toBe('function');
    });

    it('should accept custom options', () => {
      const customNavigateTo = jest.fn();
      const options = createMockOptions({
        navigateTo: customNavigateTo,
        isNavigating: true,
      });

      const { result } = renderHook(() => useRouteNavigation(options));

      expect(result.current).toBeDefined();
    });
  });

  describe('navigateToHome', () => {
    it('should navigate to home route', async () => {
      const options = createMockOptions();
      const { result } = renderHook(() => useRouteNavigation(options));

      await act(async () => {
        await result.current.navigateToHome();
      });

      expect(options.navigateTo).toHaveBeenCalledWith('/(tabs)/(home)', true);
    });

    it('should not navigate when already navigating', async () => {
      const options = createMockOptions({ isNavigating: true });
      const { result } = renderHook(() => useRouteNavigation(options));

      await act(async () => {
        await result.current.navigateToHome();
      });

      expect(options.navigateTo).not.toHaveBeenCalled();
    });


  });

  describe('navigateToLogin', () => {
    it('should navigate to login route', async () => {
      const options = createMockOptions();
      const { result } = renderHook(() => useRouteNavigation(options));

      await act(async () => {
        await result.current.navigateToLogin();
      });

      expect(options.navigateTo).toHaveBeenCalledWith('/login', true);
    });

    it('should not navigate when already navigating', async () => {
      const options = createMockOptions({ isNavigating: true });
      const { result } = renderHook(() => useRouteNavigation(options));

      await act(async () => {
        await result.current.navigateToLogin();
      });

      expect(options.navigateTo).not.toHaveBeenCalled();
    });
  });

  describe('navigateToChat', () => {
    it('should navigate to chat route with room ID', async () => {
      const options = createMockOptions();
      const { result } = renderHook(() => useRouteNavigation(options));

      await act(async () => {
        await result.current.navigateToChat('room-123');
      });

      expect(options.navigateTo).toHaveBeenCalledWith('/(tabs)/(chat)/room-123');
    });

    it('should handle different room IDs', async () => {
      const options = createMockOptions();
      const { result } = renderHook(() => useRouteNavigation(options));

      await act(async () => {
        await result.current.navigateToChat('room-456');
      });

      expect(options.navigateTo).toHaveBeenCalledWith('/(tabs)/(chat)/room-456');
    });

    it('should not navigate when already navigating', async () => {
      const options = createMockOptions({ isNavigating: true });
      const { result } = renderHook(() => useRouteNavigation(options));

      await act(async () => {
        await result.current.navigateToChat('room-123');
      });

      expect(options.navigateTo).not.toHaveBeenCalled();
    });

    it('should handle empty room ID', async () => {
      const options = createMockOptions();
      const { result } = renderHook(() => useRouteNavigation(options));

      await act(async () => {
        await result.current.navigateToChat('');
      });

      expect(options.navigateTo).toHaveBeenCalledWith('/(tabs)/(chat)/');
    });

    it('should handle special characters in room ID', async () => {
      const options = createMockOptions();
      const { result } = renderHook(() => useRouteNavigation(options));

      const specialRoomId = 'room-123!@#$%^&*()';
      await act(async () => {
        await result.current.navigateToChat(specialRoomId);
      });

      expect(options.navigateTo).toHaveBeenCalledWith(`/(tabs)/(chat)/${specialRoomId}`);
    });
  });

  describe('navigateToExplore', () => {
    it('should navigate to explore route', async () => {
      const options = createMockOptions();
      const { result } = renderHook(() => useRouteNavigation(options));

      await act(async () => {
        await result.current.navigateToExplore();
      });

      expect(options.navigateTo).toHaveBeenCalledWith('/(tabs)/(explore)');
    });

    it('should not navigate when already navigating', async () => {
      const options = createMockOptions({ isNavigating: true });
      const { result } = renderHook(() => useRouteNavigation(options));

      await act(async () => {
        await result.current.navigateToExplore();
      });

      expect(options.navigateTo).not.toHaveBeenCalled();
    });
  });

  describe('Navigation Guards', () => {
    it('should prevent all navigation when isNavigating is true', async () => {
      const options = createMockOptions({ isNavigating: true });
      const { result } = renderHook(() => useRouteNavigation(options));

      await act(async () => {
        await result.current.navigateToHome();
        await result.current.navigateToLogin();
        await result.current.navigateToChat('room-123');
        await result.current.navigateToExplore();
      });

      expect(options.navigateTo).not.toHaveBeenCalled();
    });

    it('should allow all navigation when isNavigating is false', async () => {
      const options = createMockOptions({ isNavigating: false });
      const { result } = renderHook(() => useRouteNavigation(options));

      await act(async () => {
        await result.current.navigateToHome();
        await result.current.navigateToLogin();
        await result.current.navigateToChat('room-123');
        await result.current.navigateToExplore();
      });

      expect(options.navigateTo).toHaveBeenCalledTimes(4);
      expect(options.navigateTo).toHaveBeenCalledWith('/(tabs)/(home)', true);
      expect(options.navigateTo).toHaveBeenCalledWith('/login', true);
      expect(options.navigateTo).toHaveBeenCalledWith('/(tabs)/(chat)/room-123');
      expect(options.navigateTo).toHaveBeenCalledWith('/(tabs)/(explore)');
    });
  });

  describe('Route Construction', () => {
    it('should construct correct route paths', async () => {
      const options = createMockOptions();
      const { result } = renderHook(() => useRouteNavigation(options));

      await act(async () => {
        await result.current.navigateToHome();
      });
      expect(options.navigateTo).toHaveBeenCalledWith('/(tabs)/(home)', true);

      await act(async () => {
        await result.current.navigateToLogin();
      });
      expect(options.navigateTo).toHaveBeenCalledWith('/login', true);

      await act(async () => {
        await result.current.navigateToChat('test-room');
      });
      expect(options.navigateTo).toHaveBeenCalledWith('/(tabs)/(chat)/test-room');

      await act(async () => {
        await result.current.navigateToExplore();
      });
      expect(options.navigateTo).toHaveBeenCalledWith('/(tabs)/(explore)');
    });

    it('should use replace for home and login routes', async () => {
      const options = createMockOptions();
      const { result } = renderHook(() => useRouteNavigation(options));

      await act(async () => {
        await result.current.navigateToHome();
      });
      expect(options.navigateTo).toHaveBeenCalledWith('/(tabs)/(home)', true);

      await act(async () => {
        await result.current.navigateToLogin();
      });
      expect(options.navigateTo).toHaveBeenCalledWith('/login', true);
    });

    it('should use push for chat and explore routes', async () => {
      const options = createMockOptions();
      const { result } = renderHook(() => useRouteNavigation(options));

      await act(async () => {
        await result.current.navigateToChat('room-123');
      });
      expect(options.navigateTo).toHaveBeenCalledWith('/(tabs)/(chat)/room-123');

      await act(async () => {
        await result.current.navigateToExplore();
      });
      expect(options.navigateTo).toHaveBeenCalledWith('/(tabs)/(explore)');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long room IDs', async () => {
      const options = createMockOptions();
      const { result } = renderHook(() => useRouteNavigation(options));

      const longRoomId = 'room-' + 'a'.repeat(1000);
      await act(async () => {
        await result.current.navigateToChat(longRoomId);
      });

      expect(options.navigateTo).toHaveBeenCalledWith(`/(tabs)/(chat)/${longRoomId}`);
    });

    it('should handle numeric room IDs', async () => {
      const options = createMockOptions();
      const { result } = renderHook(() => useRouteNavigation(options));

      await act(async () => {
        await result.current.navigateToChat('123');
      });

      expect(options.navigateTo).toHaveBeenCalledWith('/(tabs)/(chat)/123');
    });

    it('should handle room IDs with spaces', async () => {
      const options = createMockOptions();
      const { result } = renderHook(() => useRouteNavigation(options));

      await act(async () => {
        await result.current.navigateToChat('room with spaces');
      });

      expect(options.navigateTo).toHaveBeenCalledWith('/(tabs)/(chat)/room with spaces');
    });
  });
}); 