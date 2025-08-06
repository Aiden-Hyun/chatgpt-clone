import { renderHook, act } from '@testing-library/react';
import { EventBus } from '../../../../src/features/concurrent-chat/core/events/EventBus';
import { ServiceContainer } from '../../../../src/features/concurrent-chat/core/container/ServiceContainer';
import { AnimationService } from '../../../../src/features/concurrent-chat/features/animation/AnimationService';
import { useMessageAnimation } from '../../../../src/features/concurrent-chat/features/animation/useMessageAnimation';

// Mock DOM element
const createMockElement = () => {
  const element = document.createElement('div');
  element.textContent = '';
  return element;
};

describe('useMessageAnimation', () => {
  let eventBus: EventBus;
  let serviceContainer: ServiceContainer;
  let animationService: AnimationService;
  let mockElement: HTMLElement;

  beforeEach(() => {
    eventBus = new EventBus();
    serviceContainer = new ServiceContainer();
    animationService = new AnimationService(eventBus, serviceContainer);
    mockElement = createMockElement();
    document.body.appendChild(mockElement);
  });

  afterEach(() => {
    document.body.removeChild(mockElement);
    jest.clearAllMocks();
  });

  describe('Animation State Management', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useMessageAnimation(animationService));

      expect(result.current.isAnimating).toBe(false);
      expect(result.current.progress).toBe(0);
      expect(result.current.currentStrategy).toBe('typewriter');
      expect(result.current.speed).toBe(1.0);
    });

    it('should update animation state when animation starts', async () => {
      const { result } = renderHook(() => useMessageAnimation(animationService));

      await act(async () => {
        await result.current.animate(mockElement, 'Test content');
      });

      expect(result.current.isAnimating).toBe(false); // Animation completed
      expect(result.current.progress).toBe(1.0);
    });

    it('should track animation progress', async () => {
      const { result } = renderHook(() => useMessageAnimation(animationService));

      // Subscribe to progress events
      eventBus.subscribe('animation:progress', (data) => {
        act(() => {
          result.current.updateProgress(data.progress);
        });
      });

      await act(async () => {
        await result.current.animate(mockElement, 'Test content');
      });

      expect(result.current.progress).toBe(1.0);
    });

    it('should handle animation state transitions', async () => {
      const { result } = renderHook(() => useMessageAnimation(animationService));

      expect(result.current.isAnimating).toBe(false);

      const animationPromise = act(async () => {
        return result.current.animate(mockElement, 'Test content');
      });

      // Animation should be in progress
      expect(result.current.isAnimating).toBe(true);

      await animationPromise;

      // Animation should be complete
      expect(result.current.isAnimating).toBe(false);
    });
  });

  describe('Animation Controls', () => {
    it('should play animation', async () => {
      const { result } = renderHook(() => useMessageAnimation(animationService));

      await act(async () => {
        await result.current.play(mockElement, 'Test content');
      });

      expect(mockElement.textContent).toBe('Test content');
      expect(result.current.isAnimating).toBe(false);
    });

    it('should pause animation', async () => {
      const { result } = renderHook(() => useMessageAnimation(animationService));

      const animationPromise = act(async () => {
        return result.current.animate(mockElement, 'Long content');
      });

      act(() => {
        result.current.pause();
      });

      expect(result.current.isPaused).toBe(true);

      act(() => {
        result.current.resume();
      });

      await animationPromise;
      expect(result.current.isPaused).toBe(false);
    });

    it('should stop animation', async () => {
      const { result } = renderHook(() => useMessageAnimation(animationService));

      const animationPromise = act(async () => {
        return result.current.animate(mockElement, 'Long content');
      });

      act(() => {
        result.current.stop();
      });

      await expect(animationPromise).rejects.toThrow();
      expect(result.current.isAnimating).toBe(false);
    });

    it('should set animation speed', () => {
      const { result } = renderHook(() => useMessageAnimation(animationService));

      act(() => {
        result.current.setSpeed(2.0);
      });

      expect(result.current.speed).toBe(2.0);
    });

    it('should change animation strategy', () => {
      const { result } = renderHook(() => useMessageAnimation(animationService));

      act(() => {
        result.current.setStrategy('fade-in');
      });

      expect(result.current.currentStrategy).toBe('fade-in');
    });
  });

  describe('Animation Events and Callbacks', () => {
    it('should call onStart callback', async () => {
      const onStart = jest.fn();
      const { result } = renderHook(() => 
        useMessageAnimation(animationService, { onStart })
      );

      await act(async () => {
        await result.current.animate(mockElement, 'Test content');
      });

      expect(onStart).toHaveBeenCalledWith({
        element: mockElement,
        content: 'Test content',
        strategy: 'typewriter'
      });
    });

    it('should call onComplete callback', async () => {
      const onComplete = jest.fn();
      const { result } = renderHook(() => 
        useMessageAnimation(animationService, { onComplete })
      );

      await act(async () => {
        await result.current.animate(mockElement, 'Test content');
      });

      expect(onComplete).toHaveBeenCalledWith({
        element: mockElement,
        content: 'Test content',
        strategy: 'typewriter'
      });
    });

    it('should call onProgress callback', async () => {
      const onProgress = jest.fn();
      const { result } = renderHook(() => 
        useMessageAnimation(animationService, { onProgress })
      );

      // Subscribe to progress events
      eventBus.subscribe('animation:progress', (data) => {
        act(() => {
          result.current.updateProgress(data.progress);
        });
      });

      await act(async () => {
        await result.current.animate(mockElement, 'Test content');
      });

      expect(onProgress).toHaveBeenCalledWith(1.0);
    });

    it('should call onError callback', async () => {
      const onError = jest.fn();
      const { result } = renderHook(() => 
        useMessageAnimation(animationService, { onError })
      );

      // Create an error by stopping animation immediately
      const animationPromise = act(async () => {
        return result.current.animate(mockElement, 'Test content');
      });

      act(() => {
        result.current.stop();
      });

      await expect(animationPromise).rejects.toThrow();
      expect(onError).toHaveBeenCalled();
    });
  });

  describe('Performance Monitoring', () => {
    it('should track animation duration', async () => {
      const { result } = renderHook(() => useMessageAnimation(animationService));

      const startTime = Date.now();

      await act(async () => {
        await result.current.animate(mockElement, 'Test content');
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeGreaterThan(0);
      expect(result.current.lastAnimationDuration).toBeGreaterThan(0);
    });

    it('should track animation performance metrics', async () => {
      const { result } = renderHook(() => useMessageAnimation(animationService));

      await act(async () => {
        await result.current.animate(mockElement, 'Test content');
      });

      expect(result.current.performanceMetrics).toBeDefined();
      expect(result.current.performanceMetrics.duration).toBeGreaterThan(0);
      expect(result.current.performanceMetrics.frames).toBeGreaterThan(0);
    });

    it('should optimize performance for repeated animations', async () => {
      const { result } = renderHook(() => useMessageAnimation(animationService));

      // First animation
      const startTime1 = Date.now();
      await act(async () => {
        await result.current.animate(mockElement, 'Content 1');
      });
      const duration1 = Date.now() - startTime1;

      // Second animation
      const startTime2 = Date.now();
      await act(async () => {
        await result.current.animate(mockElement, 'Content 2');
      });
      const duration2 = Date.now() - startTime2;

      // Second animation should be faster due to optimization
      expect(duration2).toBeLessThanOrEqual(duration1);
    });
  });

  describe('Plugin Lifecycle Integration', () => {
    it('should integrate with plugin lifecycle', () => {
      const plugin = {
        name: 'test-plugin',
        onAnimationStart: jest.fn(),
        onAnimationComplete: jest.fn()
      };

      animationService.registerPlugin(plugin);
      const { result } = renderHook(() => useMessageAnimation(animationService));

      expect(result.current.plugins).toContain(plugin);
    });

    it('should notify plugins of animation events', async () => {
      const plugin = {
        name: 'test-plugin',
        onAnimationStart: jest.fn(),
        onAnimationComplete: jest.fn()
      };

      animationService.registerPlugin(plugin);
      const { result } = renderHook(() => useMessageAnimation(animationService));

      await act(async () => {
        await result.current.animate(mockElement, 'Test content');
      });

      expect(plugin.onAnimationStart).toHaveBeenCalled();
      expect(plugin.onAnimationComplete).toHaveBeenCalled();
    });

    it('should handle plugin lifecycle events', () => {
      const plugin = {
        name: 'test-plugin',
        onMount: jest.fn(),
        onUnmount: jest.fn()
      };

      const { result, unmount } = renderHook(() => useMessageAnimation(animationService));
      
      animationService.registerPlugin(plugin);

      expect(plugin.onMount).toHaveBeenCalled();

      unmount();

      expect(plugin.onUnmount).toHaveBeenCalled();
    });
  });

  describe('Strategy Integration', () => {
    it('should use different strategies', async () => {
      const { result } = renderHook(() => useMessageAnimation(animationService));

      // Test typewriter strategy
      act(() => {
        result.current.setStrategy('typewriter');
      });

      await act(async () => {
        await result.current.animate(mockElement, 'Typewriter content');
      });

      expect(mockElement.textContent).toBe('Typewriter content');

      // Test fade-in strategy
      act(() => {
        result.current.setStrategy('fade-in');
      });

      await act(async () => {
        await result.current.animate(mockElement, 'Fade content');
      });

      expect(mockElement.textContent).toBe('Fade content');
    });

    it('should handle strategy errors gracefully', async () => {
      const { result } = renderHook(() => useMessageAnimation(animationService));

      // Register an error strategy
      const errorStrategy = {
        name: 'error',
        isExecuting: false,
        async execute() {
          throw new Error('Strategy error');
        },
        async delay() {}
      };

      animationService.registerStrategy('error', errorStrategy);

      act(() => {
        result.current.setStrategy('error');
      });

      await expect(act(async () => {
        await result.current.animate(mockElement, 'Test content');
      })).rejects.toThrow('Strategy error');
    });

    it('should fallback to default strategy on error', async () => {
      const { result } = renderHook(() => useMessageAnimation(animationService));

      // Try to use non-existent strategy
      act(() => {
        result.current.setStrategy('nonexistent');
      });

      await act(async () => {
        await result.current.animate(mockElement, 'Test content');
      });

      // Should fallback to typewriter
      expect(result.current.currentStrategy).toBe('typewriter');
      expect(mockElement.textContent).toBe('Test content');
    });
  });

  describe('SOLID Principles Compliance', () => {
    it('should follow Single Responsibility Principle', () => {
      const { result } = renderHook(() => useMessageAnimation(animationService));

      // Hook should only handle animation state and controls
      expect(typeof result.current.animate).toBe('function');
      expect(typeof result.current.play).toBe('function');
      expect(typeof result.current.pause).toBe('function');
      expect(typeof result.current.stop).toBe('function');
    });

    it('should follow Open/Closed Principle', () => {
      const { result } = renderHook(() => useMessageAnimation(animationService));

      // Should be open for extension (new strategies) but closed for modification
      const newStrategy = {
        name: 'new',
        isExecuting: false,
        async execute() {},
        async delay() {}
      };

      animationService.registerStrategy('new', newStrategy);

      act(() => {
        result.current.setStrategy('new');
      });

      expect(result.current.currentStrategy).toBe('new');
    });

    it('should follow Liskov Substitution Principle', () => {
      // Any animation strategy should be substitutable
      const strategies = ['typewriter', 'fade-in'];
      const { result } = renderHook(() => useMessageAnimation(animationService));

      strategies.forEach(strategy => {
        act(() => {
          result.current.setStrategy(strategy);
        });
        expect(result.current.currentStrategy).toBe(strategy);
      });
    });

    it('should follow Interface Segregation Principle', () => {
      const { result } = renderHook(() => useMessageAnimation(animationService));

      // Should depend on focused interfaces, not large ones
      expect(result.current).toHaveProperty('animate');
      expect(result.current).toHaveProperty('play');
      expect(result.current).toHaveProperty('pause');
      expect(result.current).toHaveProperty('stop');
    });

    it('should follow Dependency Inversion Principle', () => {
      // Should depend on abstractions (AnimationService) not concretions
      const { result } = renderHook(() => useMessageAnimation(animationService));

      expect(result.current.animationService).toBe(animationService);
      expect(typeof result.current.animationService.animate).toBe('function');
    });
  });
}); 