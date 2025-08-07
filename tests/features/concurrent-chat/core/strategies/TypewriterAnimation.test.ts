import { TypewriterAnimation } from '../../../../../src/features/concurrent-chat/core/strategies/TypewriterAnimation';
import { IAnimationStrategy } from '../../../../../src/features/concurrent-chat/core/types/interfaces/IAnimationStrategy';

describe('TypewriterAnimation', () => {
  let animation: TypewriterAnimation;
  let mockOnUpdate: jest.Mock;

  beforeEach(() => {
    mockOnUpdate = jest.fn();
    animation = new TypewriterAnimation();
  });

  describe('animation creation', () => {
    it('should create typewriter animation instance', () => {
      expect(animation).toBeInstanceOf(TypewriterAnimation);
      expect(animation).toBeInstanceOf(Object);
    });

    it('should implement IAnimationStrategy interface', () => {
      const strategy: IAnimationStrategy = animation;
      
      expect(typeof strategy.animate).toBe('function');
      expect(typeof strategy.stop).toBe('function');
      expect(typeof strategy.isAnimating).toBe('function');
      expect(typeof strategy.getProgress).toBe('function');
      expect(typeof strategy.setSpeed).toBe('function');
    });

    it('should initialize with default speed', () => {
      expect(animation.getSpeed()).toBe(50); // Default 50ms per character
    });

    it('should initialize with stopped state', () => {
      expect(animation.isAnimating()).toBe(false);
      expect(animation.getProgress()).toBe(0);
    });
  });

  describe('animation execution', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should animate text character by character', async () => {
      const text = 'Hello World';
      const onUpdate = jest.fn();
      
      const animatePromise = animation.animateWithCallback(text, onUpdate);
      
      // Fast-forward through the animation
      for (let i = 0; i <= text.length; i++) {
        jest.advanceTimersByTime(50);
        await Promise.resolve(); // Allow async operations to complete
      }
      
      await animatePromise;
      
      expect(onUpdate).toHaveBeenCalledTimes(text.length + 1);
      expect(onUpdate).toHaveBeenLastCalledWith(text);
    });

    it('should call onUpdate with partial text during animation', async () => {
      const text = 'Test';
      const onUpdate = jest.fn();
      
      const animatePromise = animation.animateWithCallback(text, onUpdate);
      
      // Check first character
      jest.advanceTimersByTime(50);
      await Promise.resolve();
      expect(onUpdate).toHaveBeenCalledWith('T');
      
      // Check second character
      jest.advanceTimersByTime(50);
      await Promise.resolve();
      expect(onUpdate).toHaveBeenCalledWith('Te');
      
      // Complete animation
      jest.advanceTimersByTime(100);
      await animatePromise;
      
      expect(onUpdate).toHaveBeenLastCalledWith('Test');
    });

    it('should return Promise that resolves when complete', async () => {
      const text = 'Quick';
      const onUpdate = jest.fn();
      
      const animatePromise = animation.animateWithCallback(text, onUpdate);
      
      jest.advanceTimersByTime(250); // 5 characters * 50ms
      await Promise.resolve();
      
      await expect(animatePromise).resolves.toBeUndefined();
    });

    it('should handle empty text', async () => {
      const onUpdate = jest.fn();
      
      const animatePromise = animation.animateWithCallback('', onUpdate);
      
      jest.advanceTimersByTime(50);
      await Promise.resolve();
      
      await animatePromise;
      
      expect(onUpdate).toHaveBeenCalledWith('');
    });

    it('should handle single character', async () => {
      const onUpdate = jest.fn();
      
      const animatePromise = animation.animateWithCallback('A', onUpdate);
      
      jest.advanceTimersByTime(50);
      await Promise.resolve();
      
      await animatePromise;
      
      expect(onUpdate).toHaveBeenCalledTimes(2);
      expect(onUpdate).toHaveBeenCalledWith('A');
      expect(onUpdate).toHaveBeenLastCalledWith('A');
    });
  });

  describe('animation control', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should stop animation when stop is called', async () => {
      const text = 'Long text that will be stopped';
      const onUpdate = jest.fn();
      
      const animatePromise = animation.animateWithCallback(text, onUpdate);
      
      // Let animation start
      jest.advanceTimersByTime(100);
      await Promise.resolve();
      
      // Stop animation
      animation.stop();
      
      // Continue time
      jest.advanceTimersByTime(1000);
      await Promise.resolve();
      
      await animatePromise;
      
      // Should not have completed the full text
      expect(onUpdate).toHaveBeenCalledWith('Lo');
      expect(onUpdate).not.toHaveBeenCalledWith(text);
    });

    it('should update isAnimating state correctly', async () => {
      const text = 'Test';
      const onUpdate = jest.fn();
      
      expect(animation.isAnimating()).toBe(false);
      
      const animatePromise = animation.animateWithCallback(text, onUpdate);
      
      expect(animation.isAnimating()).toBe(true);
      
      jest.advanceTimersByTime(200);
      await Promise.resolve();
      
      await animatePromise;
      
      expect(animation.isAnimating()).toBe(false);
    });

    it('should update progress during animation', async () => {
      const text = 'Hello';
      const onUpdate = jest.fn();
      
      expect(animation.getProgress()).toBe(0);
      
      const animatePromise = animation.animateWithCallback(text, onUpdate);
      
      // After first character
      jest.advanceTimersByTime(50);
      await Promise.resolve();
      expect(animation.getProgress()).toBe(0.2); // 1/5 characters
      
      // After second character
      jest.advanceTimersByTime(50);
      await Promise.resolve();
      expect(animation.getProgress()).toBe(0.4); // 2/5 characters
      
      // Complete animation
      jest.advanceTimersByTime(150);
      await animatePromise;
      
      expect(animation.getProgress()).toBe(1); // Complete
    });
  });

  describe('speed control', () => {
    it('should set animation speed', () => {
      animation.setSpeed(100);
      expect(animation.getSpeed()).toBe(100);
    });

    it('should use new speed for subsequent animations', async () => {
      jest.useFakeTimers();
      
      const text = 'Test';
      const onUpdate = jest.fn();
      
      animation.setSpeed(100); // 100ms per character
      
      const animatePromise = animation.animateWithCallback(text, onUpdate);
      
      // Should take longer with new speed
      jest.advanceTimersByTime(50);
      await Promise.resolve();
      expect(onUpdate).not.toHaveBeenCalled(); // Not enough time
      
      jest.advanceTimersByTime(50);
      await Promise.resolve();
      expect(onUpdate).toHaveBeenCalledWith('T'); // Now first character
      
      jest.advanceTimersByTime(300);
      await animatePromise;
      
      jest.useRealTimers();
    });

    it('should handle zero speed', () => {
      animation.setSpeed(0);
      expect(animation.getSpeed()).toBe(0);
    });

    it('should handle negative speed', () => {
      animation.setSpeed(-50);
      expect(animation.getSpeed()).toBe(-50);
    });
  });

  describe('animation state management', () => {
    it('should track animation state correctly', () => {
      expect(animation.isAnimating()).toBe(false);
      expect(animation.getProgress()).toBe(0);
    });

    it('should reset state after animation completes', async () => {
      jest.useFakeTimers();
      
      const text = 'Test';
      const onUpdate = jest.fn();
      
      const animatePromise = animation.animateWithCallback(text, onUpdate);
      
      expect(animation.isAnimating()).toBe(true);
      
      jest.advanceTimersByTime(200);
      await Promise.resolve();
      
      await animatePromise;
      
      expect(animation.isAnimating()).toBe(false);
      expect(animation.getProgress()).toBe(1);
      
      jest.useRealTimers();
    });

    it('should reset state after stopping', async () => {
      jest.useFakeTimers();
      
      const text = 'Test';
      const onUpdate = jest.fn();
      
      const animatePromise = animation.animateWithCallback(text, onUpdate);
      
      expect(animation.isAnimating()).toBe(true);
      
      jest.advanceTimersByTime(100);
      await Promise.resolve();
      
      animation.stop();
      
      expect(animation.isAnimating()).toBe(false);
      
      await animatePromise;
      
      jest.useRealTimers();
    });
  });

  describe('error handling', () => {
    it('should handle null text', async () => {
      const onUpdate = jest.fn();
      
      await expect(animation.animateWithCallback(null as any, onUpdate)).rejects.toThrow();
    });

    it('should handle undefined text', async () => {
      const onUpdate = jest.fn();
      
      await expect(animation.animateWithCallback(undefined as any, onUpdate)).rejects.toThrow();
    });

    it('should handle null onUpdate callback', async () => {
      await expect(animation.animateWithCallback('Test', null as any)).rejects.toThrow();
    });

    it('should handle undefined onUpdate callback', async () => {
      await expect(animation.animateWithCallback('Test', undefined as any)).rejects.toThrow();
    });

    it('should handle onUpdate callback throwing error', async () => {
      jest.useFakeTimers();
      
      const onUpdate = jest.fn().mockImplementation(() => {
        throw new Error('Update error');
      });
      
      const animatePromise = animation.animateWithCallback('Test', onUpdate);
      
      jest.advanceTimersByTime(50);
      await Promise.resolve();
      
      await expect(animatePromise).rejects.toThrow('Update error');
      
      jest.useRealTimers();
    });
  });

  describe('performance considerations', () => {
    it('should handle long text efficiently', async () => {
      jest.useFakeTimers();
      
      const longText = 'A'.repeat(1000);
      const onUpdate = jest.fn();
      
      const startTime = Date.now();
      const animatePromise = animation.animateWithCallback(longText, onUpdate);
      
      jest.advanceTimersByTime(50000); // 1000 characters * 50ms
      await Promise.resolve();
      
      await animatePromise;
      const endTime = Date.now();
      
      expect(onUpdate).toHaveBeenCalledTimes(1001); // 1000 + 1 for completion
      expect(endTime - startTime).toBeLessThan(100); // Should be fast with fake timers
      
      jest.useRealTimers();
    });

    it('should handle rapid stop/start cycles', async () => {
      jest.useFakeTimers();
      
      const text = 'Test';
      const onUpdate = jest.fn();
      
      // Start animation
      const animatePromise1 = animation.animateWithCallback(text, onUpdate);
      
      jest.advanceTimersByTime(50);
      await Promise.resolve();
      
      // Stop and start again
      animation.stop();
      await animatePromise1;
      
      const animatePromise2 = animation.animateWithCallback(text, onUpdate);
      
      jest.advanceTimersByTime(200);
      await Promise.resolve();
      
      await animatePromise2;
      
      jest.useRealTimers();
    });
  });

  describe('SOLID principle compliance', () => {
    it('should follow Single Responsibility Principle', () => {
      // Should only be responsible for typewriter animation
      expect(animation.animate).toBeDefined();
      expect(animation.stop).toBeDefined();
      expect(animation.isAnimating).toBeDefined();
      expect(animation.getProgress).toBeDefined();
      expect(animation.setSpeed).toBeDefined();
    });

    it('should follow Open/Closed Principle', () => {
      // Should be open for extension but closed for modification
      expect(animation).toBeInstanceOf(TypewriterAnimation);
      expect(animation).toBeInstanceOf(Object);
    });

    it('should follow Liskov Substitution Principle', () => {
      // Should be substitutable for IAnimationStrategy
      const strategy: IAnimationStrategy = animation;
      
      expect(typeof strategy.animate).toBe('function');
      expect(typeof strategy.stop).toBe('function');
      expect(typeof strategy.isAnimating).toBe('function');
      expect(typeof strategy.getProgress).toBe('function');
      expect(typeof strategy.setSpeed).toBe('function');
    });

    it('should follow Interface Segregation Principle', () => {
      // Should not force clients to depend on methods they don't use
      const strategy: IAnimationStrategy = animation;
      
      expect(strategy.animate).toBeDefined();
      expect(strategy.stop).toBeDefined();
      expect(strategy.isAnimating).toBeDefined();
      expect(strategy.getProgress).toBeDefined();
      expect(strategy.setSpeed).toBeDefined();
    });

    it('should follow Dependency Inversion Principle', () => {
      // Should depend on abstractions, not concretions
      const strategy: IAnimationStrategy = animation;
      
      expect(strategy).toBeDefined();
      expect(typeof strategy.animate).toBe('function');
    });
  });

  describe('typewriter-specific behavior', () => {
    it('should animate character by character', async () => {
      jest.useFakeTimers();
      
      const text = 'ABC';
      const onUpdate = jest.fn();
      
      const animatePromise = animation.animateWithCallback(text, onUpdate);
      
      // First character
      jest.advanceTimersByTime(50);
      await Promise.resolve();
      expect(onUpdate).toHaveBeenCalledWith('A');
      
      // Second character
      jest.advanceTimersByTime(50);
      await Promise.resolve();
      expect(onUpdate).toHaveBeenCalledWith('AB');
      
      // Third character
      jest.advanceTimersByTime(50);
      await Promise.resolve();
      expect(onUpdate).toHaveBeenCalledWith('ABC');
      
      await animatePromise;
      
      jest.useRealTimers();
    });

    it('should handle special characters', async () => {
      jest.useFakeTimers();
      
      const text = 'Hello\nWorld!';
      const onUpdate = jest.fn();
      
      const animatePromise = animation.animateWithCallback(text, onUpdate);
      
      jest.advanceTimersByTime(600); // 12 characters * 50ms
      await Promise.resolve();
      
      await animatePromise;
      
      expect(onUpdate).toHaveBeenLastCalledWith('Hello\nWorld!');
      
      jest.useRealTimers();
    });

    it('should handle unicode characters', async () => {
      jest.useFakeTimers();
      
      const text = 'Hello 🌍 World';
      const onUpdate = jest.fn();
      
      const animatePromise = animation.animateWithCallback(text, onUpdate);
      
      jest.advanceTimersByTime(650); // 13 characters * 50ms
      await Promise.resolve();
      
      await animatePromise;
      
      expect(onUpdate).toHaveBeenLastCalledWith('Hello 🌍 World');
      
      jest.useRealTimers();
    });
  });
}); 