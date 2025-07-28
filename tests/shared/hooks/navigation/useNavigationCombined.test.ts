import { act, renderHook } from '@testing-library/react-hooks';
import { usePathname } from 'expo-router';
import { useNavigationCombined } from '../../../../src/shared/hooks/navigation/useNavigationCombined';

// Mock expo-router
jest.mock('expo-router', () => ({
  usePathname: jest.fn(),
  router: {
    push: jest.fn().mockResolvedValue(undefined),
    replace: jest.fn().mockResolvedValue(undefined),
    back: jest.fn().mockResolvedValue(undefined),
  },
}));

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

describe('useNavigationCombined', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue('/');
  });

  describe('Initialization', () => {
    it('should initialize with default options', () => {
      const { result } = renderHook(() => useNavigationCombined());

      expect(result.current.currentRoute).toBe('/');
      expect(result.current.canGoBack).toBe(false);
      expect(result.current.isNavigating).toBe(false);
      expect(result.current.navigationHistory).toEqual(['/']);
    });

    it('should accept custom options', () => {
      const { result } = renderHook(() => useNavigationCombined({
        preventNavigationDuringLoading: false,
      }));

      expect(result.current).toBeDefined();
    });

    it('should have all required properties', () => {
      const { result } = renderHook(() => useNavigationCombined());

      // State properties
      expect(typeof result.current.currentRoute).toBe('string');
      expect(typeof result.current.canGoBack).toBe('boolean');
      expect(typeof result.current.isNavigating).toBe('boolean');
      expect(Array.isArray(result.current.navigationHistory)).toBe(true);

      // Navigation methods
      expect(typeof result.current.navigateToHome).toBe('function');
      expect(typeof result.current.navigateToLogin).toBe('function');
      expect(typeof result.current.navigateToChat).toBe('function');
      expect(typeof result.current.navigateToExplore).toBe('function');
      expect(typeof result.current.goBack).toBe('function');
      expect(typeof result.current.navigateTo).toBe('function');

      // Utilities
      expect(typeof result.current.canNavigate).toBe('function');
    });
  });

  describe('Backward Compatibility', () => {
    it('should provide the same interface as the original useNavigation', () => {
      const { result } = renderHook(() => useNavigationCombined());

      // Check that all original properties exist
      expect(result.current).toHaveProperty('currentRoute');
      expect(result.current).toHaveProperty('canGoBack');
      expect(result.current).toHaveProperty('isNavigating');
      expect(result.current).toHaveProperty('navigationHistory');
      expect(result.current).toHaveProperty('navigateToHome');
      expect(result.current).toHaveProperty('navigateToLogin');
      expect(result.current).toHaveProperty('navigateToChat');
      expect(result.current).toHaveProperty('navigateToExplore');
      expect(result.current).toHaveProperty('goBack');
      expect(result.current).toHaveProperty('navigateTo');
      expect(result.current).toHaveProperty('canNavigate');
    });

    it('should work with default options like the original', () => {
      const { result } = renderHook(() => useNavigationCombined());

      expect(result.current.currentRoute).toBe('/');
      expect(result.current.canGoBack).toBe(false);
      expect(result.current.isNavigating).toBe(false);
    });
  });

  describe('Route Navigation', () => {
    it('should navigate to home', async () => {
      const { result } = renderHook(() => useNavigationCombined());

      await act(async () => {
        await result.current.navigateToHome();
      });

      // The navigation should be attempted (actual router calls are mocked)
      expect(result.current.isNavigating).toBe(false); // Should be reset after navigation
    });

    it('should navigate to login', async () => {
      const { result } = renderHook(() => useNavigationCombined());

      await act(async () => {
        await result.current.navigateToLogin();
      });

      expect(result.current.isNavigating).toBe(false);
    });

    it('should navigate to chat with room ID', async () => {
      const { result } = renderHook(() => useNavigationCombined());

      await act(async () => {
        await result.current.navigateToChat('room-123');
      });

      expect(result.current.isNavigating).toBe(false);
    });

    it('should navigate to explore', async () => {
      const { result } = renderHook(() => useNavigationCombined());

      await act(async () => {
        await result.current.navigateToExplore();
      });

      expect(result.current.isNavigating).toBe(false);
    });
  });

  describe('Generic Navigation', () => {
    it('should navigate to custom route', async () => {
      const { result } = renderHook(() => useNavigationCombined());

      await act(async () => {
        await result.current.navigateTo('/custom-route');
      });

      expect(result.current.isNavigating).toBe(false);
    });

    it('should navigate to custom route with replace', async () => {
      const { result } = renderHook(() => useNavigationCombined());

      await act(async () => {
        await result.current.navigateTo('/custom-route', true);
      });

      expect(result.current.isNavigating).toBe(false);
    });
  });

  describe('Back Navigation', () => {
    it('should handle go back when possible', async () => {
      // Set up navigation history
      const { result, rerender } = renderHook(() => useNavigationCombined());
      
      mockUsePathname.mockReturnValue('/home');
      rerender();
      
      mockUsePathname.mockReturnValue('/chat');
      rerender();

      expect(result.current.canGoBack).toBe(true);

      await act(async () => {
        await result.current.goBack();
      });

      expect(result.current.isNavigating).toBe(false);
    });

    it('should not go back when not possible', async () => {
      const { result } = renderHook(() => useNavigationCombined());

      expect(result.current.canGoBack).toBe(false);

      await act(async () => {
        await result.current.goBack();
      });

      expect(result.current.isNavigating).toBe(false);
    });
  });

  describe('Navigation Guards', () => {
    it('should check if navigation is allowed', () => {
      const { result } = renderHook(() => useNavigationCombined());

      expect(result.current.canNavigate()).toBe(true);
      expect(result.current.canNavigate(false)).toBe(true);
    });

    it('should prevent navigation during loading when enabled', () => {
      const { result } = renderHook(() => useNavigationCombined({
        preventNavigationDuringLoading: true,
      }));

      expect(result.current.canNavigate(true)).toBe(false);
    });

    it('should allow navigation during loading when disabled', () => {
      const { result } = renderHook(() => useNavigationCombined({
        preventNavigationDuringLoading: false,
      }));

      expect(result.current.canNavigate(true)).toBe(true);
    });
  });

  describe('State Management', () => {
    it('should track navigation history', () => {
      const { result, rerender } = renderHook(() => useNavigationCombined());
      
      mockUsePathname.mockReturnValue('/home');
      rerender();
      
      mockUsePathname.mockReturnValue('/chat');
      rerender();

      expect(result.current.navigationHistory).toEqual(['/', '/home', '/chat']);
      expect(result.current.currentRoute).toBe('/chat');
      expect(result.current.canGoBack).toBe(true);
    });
  });




}); 