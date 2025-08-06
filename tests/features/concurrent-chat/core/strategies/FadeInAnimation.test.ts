import { FadeInAnimation } from '../../../../../src/features/concurrent-chat/core/strategies/FadeInAnimation';
import { IAnimationStrategy } from '../../../../../src/features/concurrent-chat/core/types/interfaces/IAnimationStrategy';

describe('FadeInAnimation', () => {
  let animation: FadeInAnimation;
  let mockOnUpdate: jest.Mock;

  beforeEach(() => {
    mockOnUpdate = jest.fn();
    animation = new FadeInAnimation();
  });

  describe('animation creation', () => {
    it('should create fade-in animation instance', () => {
      expect(animation).toBeInstanceOf(FadeInAnimation);
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

    it('should initialize with default duration', () => {
      expect(animation.getDuration()).toBe(500); // Default 500ms
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

    it('should animate opacity from 0 to 1', async () => {
      const text = 'Hello World';
      const onUpdate = jest.fn();
      
      const animatePromise = animation.animate(text, onUpdate);
      
      // Start of animation
      expect(onUpdate).toHaveBeenCalledWith(text, 0);
      
      // Middle of animation
      jest.advanceTimersByTime(250);
      await Promise.resolve();
      expect(onUpdate).toHaveBeenCalledWith(text, 0.5);
      
      // End of animation
      jest.advanceTimersByTime(250);
      await Promise.resolve();
      expect(onUpdate).toHaveBeenCalledWith(text, 1);
      
      await animatePromise;
    });

    it('should call onUpdate with text and opacity values', async () => {
      const text = 'Test';
      const onUpdate = jest.fn();
      
      const animatePromise = animation.animate(text, onUpdate);
      
      // Check initial call
      expect(onUpdate).toHaveBeenCalledWith(text, 0);
      
      // Check intermediate calls
      jest.advanceTimersByTime(100);
      await Promise.resolve();
      expect(onUpdate).toHaveBeenCalledWith(text, 0.2);
      
      jest.advanceTimersByTime(100);
      await Promise.resolve();
      expect(onUpdate).toHaveBeenCalledWith(text, 0.4);
      
      // Complete animation
      jest.advanceTimersByTime(300);
      await animatePromise;
      
      expect(onUpdate).toHaveBeenLastCalledWith(text, 1);
    });

    it('should return Promise that resolves when complete', async () => {
      const text = 'Quick';
      const onUpdate = jest.fn();
      
      const animatePromise = animation.animate(text, onUpdate);
      
      jest.advanceTimersByTime(500);
      await Promise.resolve();
      
      await expect(animatePromise).resolves.toBeUndefined();
    });

    it('should handle empty text', async () => {
      const onUpdate = jest.fn();
      
      const animatePromise = animation.animate('', onUpdate);
      
      expect(onUpdate).toHaveBeenCalledWith('', 0);
      
      jest.advanceTimersByTime(500);
      await Promise.resolve();
      
      await animatePromise;
      
      expect(onUpdate).toHaveBeenLastCalledWith('', 1);
    });

    it('should handle single character', async () => {
      const onUpdate = jest.fn();
      
      const animatePromise = animation.animate('A', onUpdate);
      
      expect(onUpdate).toHaveBeenCalledWith('A', 0);
      
      jest.advanceTimersByTime(500);
      await Promise.resolve();
      
      await animatePromise;
      
      expect(onUpdate).toHaveBeenLastCalledWith('A', 1);
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
      
      const animatePromise = animation.animate(text, onUpdate);
      
      // Let animation start
      expect(onUpdate).toHaveBeenCalledWith(text, 0);
      
      jest.advanceTimersByTime(200);
      await Promise.resolve();
      expect(onUpdate).toHaveBeenCalledWith(text, 0.4);
      
      // Stop animation
      animation.stop();
      
      // Continue time
      jest.advanceTimersByTime(1000);
      await Promise.resolve();
      
      await animatePromise;
      
      // Should not have completed the full animation
      expect(onUpdate).toHaveBeenCalledWith(text, 0.4);
      expect(onUpdate).not.toHaveBeenCalledWith(text, 1);
    });

    it('should update isAnimating state correctly', async () => {
      const text = 'Test';
      const onUpdate = jest.fn();
      
      expect(animation.isAnimating()).toBe(false);
      
      const animatePromise = animation.animate(text, onUpdate);
      
      expect(animation.isAnimating()).toBe(true);
      
      jest.advanceTimersByTime(500);
      await Promise.resolve();
      
      await animatePromise;
      
      expect(animation.isAnimating()).toBe(false);
    });

    it('should update progress during animation', async () => {
      const text = 'Hello';
      const onUpdate = jest.fn();
      
      expect(animation.getProgress()).toBe(0);
      
      const animatePromise = animation.animate(text, onUpdate);
      
      // After 25% of duration
      jest.advanceTimersByTime(125);
      await Promise.resolve();
      expect(animation.getProgress()).toBe(0.25);
      
      // After 50% of duration
      jest.advanceTimersByTime(125);
      await Promise.resolve();
      expect(animation.getProgress()).toBe(0.5);
      
      // Complete animation
      jest.advanceTimersByTime(250);
      await animatePromise;
      
      expect(animation.getProgress()).toBe(1);
    });
  });

  describe('speed control', () => {
    it('should set animation duration', () => {
      animation.setSpeed(1000);
      expect(animation.getDuration()).toBe(1000);
    });

    it('should use new duration for subsequent animations', async () => {
      jest.useFakeTimers();
      
      const text = 'Test';
      const onUpdate = jest.fn();
      
      animation.setSpeed(1000); // 1000ms duration
      
      const animatePromise = animation.animate(text, onUpdate);
      
      // Should take longer with new duration
      jest.advanceTimersByTime(250);
      await Promise.resolve();
      expect(onUpdate).toHaveBeenCalledWith(text, 0.25);
      
      jest.advanceTimersByTime(750);
      await Promise.resolve();
      expect(onUpdate).toHaveBeenCalledWith(text, 1);
      
      await animatePromise;
      
      jest.useRealTimers();
    });

    it('should handle zero duration', () => {
      animation.setSpeed(0);
      expect(animation.getDuration()).toBe(0);
    });

    it('should handle negative duration', () => {
      animation.setSpeed(-500);
      expect(animation.getDuration()).toBe(-500);
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
      
      const animatePromise = animation.animate(text, onUpdate);
      
      expect(animation.isAnimating()).toBe(true);
      
      jest.advanceTimersByTime(500);
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
      
      const animatePromise = animation.animate(text, onUpdate);
      
      expect(animation.isAnimating()).toBe(true);
      
      jest.advanceTimersByTime(250);
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
      
      await expect(animation.animate(null as any, onUpdate)).rejects.toThrow();
    });

    it('should handle undefined text', async () => {
      const onUpdate = jest.fn();
      
      await expect(animation.animate(undefined as any, onUpdate)).rejects.toThrow();
    });

    it('should handle null onUpdate callback', async () => {
      await expect(animation.animate('Test', null as any)).rejects.toThrow();
    });

    it('should handle undefined onUpdate callback', async () => {
      await expect(animation.animate('Test', undefined as any)).rejects.toThrow();
    });

    it('should handle onUpdate callback throwing error', async () => {
      jest.useFakeTimers();
      
      const onUpdate = jest.fn().mockImplementation(() => {
        throw new Error('Update error');
      });
      
      const animatePromise = animation.animate('Test', onUpdate);
      
      jest.advanceTimersByTime(100);
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
      const animatePromise = animation.animate(longText, onUpdate);
      
      jest.advanceTimersByTime(500);
      await Promise.resolve();
      
      await animatePromise;
      const endTime = Date.now();
      
      expect(onUpdate).toHaveBeenCalledWith(longText, 0);
      expect(onUpdate).toHaveBeenLastCalledWith(longText, 1);
      expect(endTime - startTime).toBeLessThan(100); // Should be fast with fake timers
      
      jest.useRealTimers();
    });

    it('should handle rapid stop/start cycles', async () => {
      jest.useFakeTimers();
      
      const text = 'Test';
      const onUpdate = jest.fn();
      
      // Start animation
      const animatePromise1 = animation.animate(text, onUpdate);
      
      jest.advanceTimersByTime(200);
      await Promise.resolve();
      
      // Stop and start again
      animation.stop();
      await animatePromise1;
      
      const animatePromise2 = animation.animate(text, onUpdate);
      
      jest.advanceTimersByTime(500);
      await Promise.resolve();
      
      await animatePromise2;
      
      jest.useRealTimers();
    });
  });

  describe('SOLID principle compliance', () => {
    it('should follow Single Responsibility Principle', () => {
      // Should only be responsible for fade-in animation
      expect(animation.animate).toBeDefined();
      expect(animation.stop).toBeDefined();
      expect(animation.isAnimating).toBeDefined();
      expect(animation.getProgress).toBeDefined();
      expect(animation.setSpeed).toBeDefined();
    });

    it('should follow Open/Closed Principle', () => {
      // Should be open for extension but closed for modification
      expect(animation).toBeInstanceOf(FadeInAnimation);
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

  describe('fade-in-specific behavior', () => {
    it('should animate opacity from 0 to 1', async () => {
      jest.useFakeTimers();
      
      const text = 'Fade In';
      const onUpdate = jest.fn();
      
      const animatePromise = animation.animate(text, onUpdate);
      
      // Initial opacity
      expect(onUpdate).toHaveBeenCalledWith(text, 0);
      
      // 25% opacity
      jest.advanceTimersByTime(125);
      await Promise.resolve();
      expect(onUpdate).toHaveBeenCalledWith(text, 0.25);
      
      // 50% opacity
      jest.advanceTimersByTime(125);
      await Promise.resolve();
      expect(onUpdate).toHaveBeenCalledWith(text, 0.5);
      
      // 75% opacity
      jest.advanceTimersByTime(125);
      await Promise.resolve();
      expect(onUpdate).toHaveBeenCalledWith(text, 0.75);
      
      // 100% opacity
      jest.advanceTimersByTime(125);
      await Promise.resolve();
      expect(onUpdate).toHaveBeenCalledWith(text, 1);
      
      await animatePromise;
      
      jest.useRealTimers();
    });

    it('should provide smooth opacity transitions', async () => {
      jest.useFakeTimers();
      
      const text = 'Smooth';
      const onUpdate = jest.fn();
      
      const animatePromise = animation.animate(text, onUpdate);
      
      const opacityValues: number[] = [];
      
      // Capture opacity values during animation
      onUpdate.mockImplementation((text, opacity) => {
        opacityValues.push(opacity);
      });
      
      // Advance through animation
      for (let i = 0; i <= 10; i++) {
        jest.advanceTimersByTime(50);
        await Promise.resolve();
      }
      
      await animatePromise;
      
      // Should have smooth progression
      expect(opacityValues[0]).toBe(0);
      expect(opacityValues[opacityValues.length - 1]).toBe(1);
      
      // Should be monotonically increasing
      for (let i = 1; i < opacityValues.length; i++) {
        expect(opacityValues[i]).toBeGreaterThanOrEqual(opacityValues[i - 1]);
      }
      
      jest.useRealTimers();
    });

    it('should handle different text lengths consistently', async () => {
      jest.useFakeTimers();
      
      const shortText = 'Hi';
      const longText = 'This is a much longer text that should fade in at the same rate';
      const onUpdate = jest.fn();
      
      // Animate short text
      const shortPromise = animation.animate(shortText, onUpdate);
      jest.advanceTimersByTime(500);
      await shortPromise;
      
      onUpdate.mockClear();
      
      // Animate long text
      const longPromise = animation.animate(longText, onUpdate);
      jest.advanceTimersByTime(500);
      await longPromise;
      
      // Both should complete in the same time
      expect(onUpdate).toHaveBeenCalledWith(longText, 0);
      expect(onUpdate).toHaveBeenLastCalledWith(longText, 1);
      
      jest.useRealTimers();
    });

    it('should support easing functions', async () => {
      jest.useFakeTimers();
      
      const text = 'Eased';
      const onUpdate = jest.fn();
      
      // Set custom easing (linear for testing)
      animation.setEasing((t: number) => t);
      
      const animatePromise = animation.animate(text, onUpdate);
      
      jest.advanceTimersByTime(250);
      await Promise.resolve();
      expect(onUpdate).toHaveBeenCalledWith(text, 0.5);
      
      jest.advanceTimersByTime(250);
      await animatePromise;
      
      jest.useRealTimers();
    });
  });

  describe('easing functions', () => {
    it('should support linear easing', async () => {
      jest.useFakeTimers();
      
      const text = 'Linear';
      const onUpdate = jest.fn();
      
      animation.setEasing((t: number) => t);
      
      const animatePromise = animation.animate(text, onUpdate);
      
      jest.advanceTimersByTime(250);
      await Promise.resolve();
      expect(onUpdate).toHaveBeenCalledWith(text, 0.5);
      
      await animatePromise;
      
      jest.useRealTimers();
    });

    it('should support ease-in easing', async () => {
      jest.useFakeTimers();
      
      const text = 'Ease In';
      const onUpdate = jest.fn();
      
      animation.setEasing((t: number) => t * t);
      
      const animatePromise = animation.animate(text, onUpdate);
      
      jest.advanceTimersByTime(250);
      await Promise.resolve();
      expect(onUpdate).toHaveBeenCalledWith(text, 0.25); // 0.5^2
      
      await animatePromise;
      
      jest.useRealTimers();
    });

    it('should support ease-out easing', async () => {
      jest.useFakeTimers();
      
      const text = 'Ease Out';
      const onUpdate = jest.fn();
      
      animation.setEasing((t: number) => 1 - (1 - t) * (1 - t));
      
      const animatePromise = animation.animate(text, onUpdate);
      
      jest.advanceTimersByTime(250);
      await Promise.resolve();
      expect(onUpdate).toHaveBeenCalledWith(text, 0.75); // 1 - (1-0.5)^2
      
      await animatePromise;
      
      jest.useRealTimers();
    });
  });
}); 