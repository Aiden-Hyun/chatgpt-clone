import { ServiceContainer } from '../../../../../src/features/concurrent-chat/core/container/ServiceContainer';
import { EventBus } from '../../../../../src/features/concurrent-chat/core/events/EventBus';
import { FadeInAnimation } from '../../../../../src/features/concurrent-chat/core/strategies/FadeInAnimation';
import { IAnimationStrategy } from '../../../../../src/features/concurrent-chat/core/strategies/IAnimationStrategy';
import { TypewriterAnimation } from '../../../../../src/features/concurrent-chat/core/strategies/TypewriterAnimation';
import { AnimationService } from '../../../../../src/features/concurrent-chat/features/animation/AnimationService';

// Mock strategies for testing
class MockAnimationStrategy implements IAnimationStrategy {
  private animating = false;
  private progress = 0;
  private speed = 50;
  
  async animate(content: string, element: HTMLElement): Promise<void> {
    this.animating = true;
    element.textContent = content;
    await new Promise(resolve => setTimeout(resolve, 10));
    this.animating = false;
  }
  
  stop(): void {
    this.animating = false;
  }
  
  isAnimating(): boolean {
    return this.animating;
  }
  
  getProgress(): number {
    return this.progress;
  }
  
  setSpeed(speed: number): void {
    this.speed = speed;
  }
}

class SlowAnimationStrategy implements IAnimationStrategy {
  private animating = false;
  private progress = 0;
  private speed = 100;
  
  async animate(content: string, element: HTMLElement): Promise<void> {
    this.animating = true;
    element.textContent = content;
    await new Promise(resolve => setTimeout(resolve, 100));
    this.animating = false;
  }
  
  stop(): void {
    this.animating = false;
  }
  
  isAnimating(): boolean {
    return this.animating;
  }
  
  getProgress(): number {
    return this.progress;
  }
  
  setSpeed(speed: number): void {
    this.speed = speed;
  }
}

describe('AnimationService', () => {
  let animationService: AnimationService;
  let eventBus: EventBus;
  let serviceContainer: ServiceContainer;
  let mockElement: HTMLElement;

  beforeEach(() => {
    eventBus = new EventBus();
    serviceContainer = new ServiceContainer();
    animationService = new AnimationService(eventBus, serviceContainer);
    
    // Create a mock DOM element
    mockElement = document.createElement('div');
    document.body.appendChild(mockElement);
  });

  afterEach(() => {
    document.body.removeChild(mockElement);
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default strategies', () => {
      expect(animationService).toBeDefined();
      expect(animationService.getAvailableStrategies()).toContain('typewriter');
      expect(animationService.getAvailableStrategies()).toContain('fade-in');
    });

    it('should register with service container', () => {
      expect(serviceContainer.get('animationService')).toBe(animationService);
    });

    it('should subscribe to animation events', () => {
      const subscribeSpy = jest.spyOn(eventBus, 'subscribe');
      new AnimationService(eventBus, serviceContainer);
      
      expect(subscribeSpy).toHaveBeenCalledWith('animation:start', expect.any(Function));
      expect(subscribeSpy).toHaveBeenCalledWith('animation:complete', expect.any(Function));
      expect(subscribeSpy).toHaveBeenCalledWith('animation:error', expect.any(Function));
    });
  });

  describe('Strategy Selection', () => {
    it('should register custom animation strategies', () => {
      const mockStrategy = new MockAnimationStrategy();
      animationService.registerStrategy('mock', mockStrategy);
      
      expect(animationService.getAvailableStrategies()).toContain('mock');
    });

    it('should select strategy by name', () => {
      const mockStrategy = new MockAnimationStrategy();
      animationService.registerStrategy('mock', mockStrategy);
      
      const selectedStrategy = animationService.getStrategy('mock');
      expect(selectedStrategy).toBe(mockStrategy);
    });

    it('should return default strategy when strategy not found', () => {
      const defaultStrategy = animationService.getStrategy('nonexistent');
      expect(defaultStrategy).toBeInstanceOf(TypewriterAnimation);
    });

    it('should handle strategy substitution', () => {
      const originalStrategy = new MockAnimationStrategy();
      const newStrategy = new SlowAnimationStrategy();
      
      animationService.registerStrategy('test', originalStrategy);
      animationService.registerStrategy('test', newStrategy);
      
      const selectedStrategy = animationService.getStrategy('test');
      expect(selectedStrategy).toBe(newStrategy);
    });
  });

  describe('Animation Execution', () => {
    it('should execute animation with selected strategy', async () => {
      const mockStrategy = new MockAnimationStrategy();
      const animateSpy = jest.spyOn(mockStrategy, 'animate');
      
      animationService.registerStrategy('mock', mockStrategy);
      
      await animationService.animate(mockElement, 'Test content', 'mock');
      
      expect(animateSpy).toHaveBeenCalledWith('Test content', mockElement);
      expect(mockElement.textContent).toBe('Test content');
    });

    it('should execute with custom options', async () => {
      const mockStrategy = new MockAnimationStrategy();
      const animateSpy = jest.spyOn(mockStrategy, 'animate');
      const options = { speed: 'fast', delay: 100 };
      
      animationService.registerStrategy('mock', mockStrategy);
      
      await animationService.animate(mockElement, 'Test content', 'mock', options);
      
      expect(animateSpy).toHaveBeenCalledWith('Test content', mockElement);
    });

    it('should publish animation events', async () => {
      const publishSpy = jest.spyOn(eventBus, 'publish');
      const mockStrategy = new MockAnimationStrategy();
      
      animationService.registerStrategy('mock', mockStrategy);
      
      await animationService.animate(mockElement, 'Test content', 'mock');
      
      expect(publishSpy).toHaveBeenCalledWith('animation:start', {
        element: mockElement,
        content: 'Test content',
        strategy: 'mock'
      });
      
      expect(publishSpy).toHaveBeenCalledWith('animation:complete', {
        element: mockElement,
        content: 'Test content',
        strategy: 'mock'
      });
    });

    it('should handle animation errors', async () => {
      const errorStrategy = {
        async animate() {
          throw new Error('Animation failed');
        },
        stop() {},
        isAnimating() { return false; },
        getProgress() { return 0; },
        setSpeed() {}
      };
      
      const publishSpy = jest.spyOn(eventBus, 'publish');
      
      animationService.registerStrategy('error', errorStrategy);
      
      await expect(animationService.animate(mockElement, 'Test content', 'error'))
        .rejects.toThrow('Animation failed');
      
      expect(publishSpy).toHaveBeenCalledWith('animation:error', {
        element: mockElement,
        content: 'Test content',
        strategy: 'error',
        error: expect.any(Error)
      });
    });
  });

  describe('Performance Optimization', () => {
    it('should cache strategy instances', () => {
      const mockStrategy = new MockAnimationStrategy();
      animationService.registerStrategy('mock', mockStrategy);
      
      const strategy1 = animationService.getStrategy('mock');
      const strategy2 = animationService.getStrategy('mock');
      
      expect(strategy1).toBe(strategy2);
    });

    it('should handle concurrent animations', async () => {
      const mockStrategy = new MockAnimationStrategy();
      animationService.registerStrategy('mock', mockStrategy);
      
      const element1 = document.createElement('div');
      const element2 = document.createElement('div');
      
      const animation1 = animationService.animate(element1, 'Content 1', 'mock');
      const animation2 = animationService.animate(element2, 'Content 2', 'mock');
      
      await Promise.all([animation1, animation2]);
      
      expect(element1.textContent).toBe('Content 1');
      expect(element2.textContent).toBe('Content 2');
    });

    it('should optimize for repeated animations', async () => {
      const mockStrategy = new MockAnimationStrategy();
      const animateSpy = jest.spyOn(mockStrategy, 'animate');
      
      animationService.registerStrategy('mock', mockStrategy);
      
      // First animation
      await animationService.animate(mockElement, 'Content 1', 'mock');
      
      // Second animation with same strategy
      await animationService.animate(mockElement, 'Content 2', 'mock');
      
      expect(animateSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('Animation Controls', () => {
    it('should pause and resume animations', async () => {
      const slowStrategy = new SlowAnimationStrategy();
      animationService.registerStrategy('slow', slowStrategy);
      
      const animationPromise = animationService.animate(mockElement, 'Long content', 'slow');
      
      // Pause after a short delay
      setTimeout(() => {
        animationService.pause();
      }, 10);
      
      // Resume after another delay
      setTimeout(() => {
        animationService.resume();
      }, 20);
      
      await animationPromise;
      
      expect(mockElement.textContent).toBe('Long content');
    });

    it('should stop animations', async () => {
      const slowStrategy = new SlowAnimationStrategy();
      animationService.registerStrategy('slow', slowStrategy);
      
      const animationPromise = animationService.animate(mockElement, 'Long content', 'slow');
      
      // Stop after a short delay
      setTimeout(() => {
        animationService.stop();
      }, 10);
      
      await expect(animationPromise).rejects.toThrow('Animation stopped');
    });

    it('should set animation speed', () => {
      animationService.setSpeed(2.0);
      expect(animationService.getSpeed()).toBe(2.0);
    });
  });

  describe('Animation Events', () => {
    it('should emit progress events', async () => {
      const publishSpy = jest.spyOn(eventBus, 'publish');
      const mockStrategy = new MockAnimationStrategy();
      
      animationService.registerStrategy('mock', mockStrategy);
      
      await animationService.animate(mockElement, 'Test content', 'mock');
      
      expect(publishSpy).toHaveBeenCalledWith('animation:progress', {
        element: mockElement,
        progress: 1.0,
        strategy: 'mock'
      });
    });

    it('should handle animation lifecycle events', () => {
      const eventHandler = jest.fn();
      eventBus.subscribe('animation:start', eventHandler);
      
      const mockStrategy = new MockAnimationStrategy();
      animationService.registerStrategy('mock', mockStrategy);
      
      animationService.animate(mockElement, 'Test content', 'mock');
      
      expect(eventHandler).toHaveBeenCalled();
    });
  });

  describe('Plugin Integration', () => {
    it('should integrate with plugin system', () => {
      const plugin = {
        name: 'test-plugin',
        onAnimationStart: jest.fn(),
        onAnimationComplete: jest.fn()
      };
      
      animationService.registerPlugin(plugin);
      
      expect(animationService.getPlugins()).toContain(plugin);
    });

    it('should notify plugins of animation events', async () => {
      const plugin = {
        name: 'test-plugin',
        onAnimationStart: jest.fn(),
        onAnimationComplete: jest.fn()
      };
      
      animationService.registerPlugin(plugin);
      
      const mockStrategy = new MockAnimationStrategy();
      animationService.registerStrategy('mock', mockStrategy);
      
      await animationService.animate(mockElement, 'Test content', 'mock');
      
      expect(plugin.onAnimationStart).toHaveBeenCalled();
      expect(plugin.onAnimationComplete).toHaveBeenCalled();
    });

    it('should handle plugin errors gracefully', async () => {
      const errorPlugin = {
        name: 'error-plugin',
        onAnimationStart: () => { throw new Error('Plugin error'); },
        onAnimationComplete: jest.fn()
      };
      
      animationService.registerPlugin(errorPlugin);
      
      const mockStrategy = new MockAnimationStrategy();
      animationService.registerStrategy('mock', mockStrategy);
      
      // Should not throw error
      await expect(animationService.animate(mockElement, 'Test content', 'mock'))
        .resolves.not.toThrow();
    });
  });

  describe('Strategy Substitution', () => {
    it('should allow runtime strategy changes', async () => {
      const strategy1 = new MockAnimationStrategy();
      const strategy2 = new SlowAnimationStrategy();
      
      animationService.registerStrategy('strategy1', strategy1);
      animationService.registerStrategy('strategy2', strategy2);
      
      // Use first strategy
      await animationService.animate(mockElement, 'Content 1', 'strategy1');
      
      // Switch to second strategy
      await animationService.animate(mockElement, 'Content 2', 'strategy2');
      
      expect(mockElement.textContent).toBe('Content 2');
    });

    it('should maintain strategy state during substitution', () => {
      const strategy1 = new MockAnimationStrategy();
      const strategy2 = new SlowAnimationStrategy();
      
      animationService.registerStrategy('strategy1', strategy1);
      animationService.registerStrategy('strategy2', strategy2);
      
      const retrieved1 = animationService.getStrategy('strategy1');
      const retrieved2 = animationService.getStrategy('strategy2');
      
      expect(retrieved1).toBe(strategy1);
      expect(retrieved2).toBe(strategy2);
    });
  });

  describe('SOLID Principles Compliance', () => {
    it('should follow Single Responsibility Principle', () => {
      // AnimationService should only handle animation logic
      expect(typeof animationService.animate).toBe('function');
      expect(typeof animationService.registerStrategy).toBe('function');
      expect(typeof animationService.getStrategy).toBe('function');
    });

    it('should follow Open/Closed Principle', () => {
      // Should be open for extension (new strategies) but closed for modification
      const newStrategy = new MockAnimationStrategy();
      animationService.registerStrategy('new', newStrategy);
      
      expect(animationService.getAvailableStrategies()).toContain('new');
    });

    it('should follow Liskov Substitution Principle', () => {
      // Any IAnimationStrategy implementation should be substitutable
      const strategies = [
        new TypewriterAnimation(),
        new FadeInAnimation(),
        new MockAnimationStrategy()
      ];
      
      strategies.forEach(strategy => {
        expect(strategy).toHaveProperty('animate');
        expect(strategy).toHaveProperty('stop');
        expect(typeof strategy.animate).toBe('function');
      });
    });

    it('should follow Interface Segregation Principle', () => {
      // Should depend on focused interfaces, not large ones
      const mockStrategy = new MockAnimationStrategy();
      expect(mockStrategy).toHaveProperty('animate');
      expect(mockStrategy).toHaveProperty('stop');
      expect(mockStrategy).toHaveProperty('isAnimating');
    });

    it('should follow Dependency Inversion Principle', () => {
      // Should depend on abstractions (IAnimationStrategy) not concretions
      const mockStrategy = new MockAnimationStrategy();
      animationService.registerStrategy('mock', mockStrategy);
      
      const retrievedStrategy = animationService.getStrategy('mock');
      expect(retrievedStrategy).toBeInstanceOf(Object);
      expect(typeof retrievedStrategy.animate).toBe('function');
    });
  });
}); 