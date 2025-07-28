import { act, renderHook } from '@testing-library/react-hooks';
import { usePathname } from 'expo-router';
import { useNavigationState } from '../../../../src/shared/hooks/navigation/useNavigationState';

// Mock expo-router
jest.mock('expo-router', () => ({
  usePathname: jest.fn(),
}));

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

describe('useNavigationState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue('/');
  });

  describe('Initialization', () => {
    it('should initialize with default state', () => {
      mockUsePathname.mockReturnValue('/');
      
      const { result } = renderHook(() => useNavigationState());

      expect(result.current.currentRoute).toBe('/');
      expect(result.current.canGoBack).toBe(false);
      expect(result.current.isNavigating).toBe(false);
      expect(result.current.navigationHistory).toEqual(['/']);
    });

    it('should have all required properties', () => {
      mockUsePathname.mockReturnValue('/');
      
      const { result } = renderHook(() => useNavigationState());

      expect(typeof result.current.currentRoute).toBe('string');
      expect(typeof result.current.canGoBack).toBe('boolean');
      expect(typeof result.current.isNavigating).toBe('boolean');
      expect(Array.isArray(result.current.navigationHistory)).toBe(true);
      expect(typeof result.current.setIsNavigating).toBe('function');
    });
  });

  describe('Route Tracking', () => {
    it('should track current route', () => {
      mockUsePathname.mockReturnValue('/home');
      
      const { result } = renderHook(() => useNavigationState());

      expect(result.current.currentRoute).toBe('/home');
    });

    it('should update current route when pathname changes', () => {
      const { result, rerender } = renderHook(() => useNavigationState());
      
      mockUsePathname.mockReturnValue('/home');
      rerender();
      
      expect(result.current.currentRoute).toBe('/home');
      
      mockUsePathname.mockReturnValue('/chat');
      rerender();
      
      expect(result.current.currentRoute).toBe('/chat');
    });
  });

  describe('Navigation History', () => {
    it('should build navigation history', () => {
      const { result, rerender } = renderHook(() => useNavigationState());
      
      // Initial route
      mockUsePathname.mockReturnValue('/');
      rerender();
      
      expect(result.current.navigationHistory).toEqual(['/']);
      
      // Navigate to home
      mockUsePathname.mockReturnValue('/home');
      rerender();
      
      expect(result.current.navigationHistory).toEqual(['/', '/home']);
      
      // Navigate to chat
      mockUsePathname.mockReturnValue('/chat');
      rerender();
      
      expect(result.current.navigationHistory).toEqual(['/', '/home', '/chat']);
    });

    it('should not add duplicate routes to history', () => {
      const { result, rerender } = renderHook(() => useNavigationState());
      
      // Initial route is '/' from beforeEach, now change to '/home'
      mockUsePathname.mockReturnValue('/home');
      rerender();
      
      expect(result.current.navigationHistory).toEqual(['/', '/home']);
      
      // Stay on same route
      mockUsePathname.mockReturnValue('/home');
      rerender();
      
      expect(result.current.navigationHistory).toEqual(['/', '/home']);
    });

    it('should handle empty pathname', () => {
      mockUsePathname.mockReturnValue('');
      
      const { result } = renderHook(() => useNavigationState());

      expect(result.current.currentRoute).toBe('');
      expect(result.current.navigationHistory).toEqual(['']);
    });
  });

  describe('Back Navigation State', () => {
    it('should allow back navigation when history has multiple entries', () => {
      const { result, rerender } = renderHook(() => useNavigationState());
      
      // Initial route
      mockUsePathname.mockReturnValue('/');
      rerender();
      
      expect(result.current.canGoBack).toBe(false);
      
      // Navigate to another route
      mockUsePathname.mockReturnValue('/home');
      rerender();
      
      expect(result.current.canGoBack).toBe(true);
    });

    it('should not allow back navigation on first route', () => {
      mockUsePathname.mockReturnValue('/');
      
      const { result } = renderHook(() => useNavigationState());

      expect(result.current.canGoBack).toBe(false);
    });

    it('should allow back navigation after multiple navigations', () => {
      const { result, rerender } = renderHook(() => useNavigationState());
      
      // Navigate through multiple routes
      mockUsePathname.mockReturnValue('/');
      rerender();
      
      mockUsePathname.mockReturnValue('/home');
      rerender();
      
      mockUsePathname.mockReturnValue('/chat');
      rerender();
      
      mockUsePathname.mockReturnValue('/profile');
      rerender();
      
      expect(result.current.canGoBack).toBe(true);
      expect(result.current.navigationHistory).toEqual(['/', '/home', '/chat', '/profile']);
    });
  });

  describe('Navigation State Management', () => {
    it('should manage isNavigating state', () => {
      mockUsePathname.mockReturnValue('/');
      
      const { result } = renderHook(() => useNavigationState());

      expect(result.current.isNavigating).toBe(false);

      act(() => {
        result.current.setIsNavigating(true);
      });

      expect(result.current.isNavigating).toBe(true);

      act(() => {
        result.current.setIsNavigating(false);
      });

      expect(result.current.isNavigating).toBe(false);
    });

    it('should allow setting isNavigating to true', () => {
      mockUsePathname.mockReturnValue('/');
      
      const { result } = renderHook(() => useNavigationState());

      act(() => {
        result.current.setIsNavigating(true);
      });

      expect(result.current.isNavigating).toBe(true);
    });

    it('should allow setting isNavigating to false', () => {
      mockUsePathname.mockReturnValue('/');
      
      const { result } = renderHook(() => useNavigationState());

      // Set to true first
      act(() => {
        result.current.setIsNavigating(true);
      });

      // Then set to false
      act(() => {
        result.current.setIsNavigating(false);
      });

      expect(result.current.isNavigating).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined pathname', () => {
      mockUsePathname.mockReturnValue(undefined as any);
      
      const { result } = renderHook(() => useNavigationState());

      expect(result.current.currentRoute).toBeUndefined();
      expect(result.current.navigationHistory).toEqual([undefined]);
    });

    it('should handle null pathname', () => {
      mockUsePathname.mockReturnValue(null as any);
      
      const { result } = renderHook(() => useNavigationState());

      expect(result.current.currentRoute).toBeNull();
      expect(result.current.navigationHistory).toEqual([null]);
    });

    it('should handle very long route paths', () => {
      const longRoute = '/very/long/route/path/that/goes/on/and/on/and/on';
      mockUsePathname.mockReturnValue(longRoute);
      
      const { result } = renderHook(() => useNavigationState());

      expect(result.current.currentRoute).toBe(longRoute);
      expect(result.current.navigationHistory).toEqual([longRoute]);
    });

    it('should handle special characters in routes', () => {
      const specialRoute = '/route/with/special/chars/!@#$%^&*()';
      mockUsePathname.mockReturnValue(specialRoute);
      
      const { result } = renderHook(() => useNavigationState());

      expect(result.current.currentRoute).toBe(specialRoute);
      expect(result.current.navigationHistory).toEqual([specialRoute]);
    });
  });

  describe('State Consistency', () => {
    it('should keep currentRoute and navigationHistory in sync', () => {
      const { result, rerender } = renderHook(() => useNavigationState());
      
      mockUsePathname.mockReturnValue('/home');
      rerender();
      
      expect(result.current.currentRoute).toBe('/home');
      expect(result.current.navigationHistory).toContain('/home');
      expect(result.current.navigationHistory[result.current.navigationHistory.length - 1]).toBe('/home');
    });

    it('should maintain history order', () => {
      const { result, rerender } = renderHook(() => useNavigationState());
      
      const routes = ['/', '/home', '/chat', '/profile'];
      
      routes.forEach(route => {
        mockUsePathname.mockReturnValue(route);
        rerender();
      });
      
      expect(result.current.navigationHistory).toEqual(routes);
    });
  });
}); 