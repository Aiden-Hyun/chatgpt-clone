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
    it('should animate opacity from 0 to 1', async () => {
      const text = 'Hello World';
      const onUpdate = jest.fn();
      
      const animatePromise = animation.animate(text, onUpdate);
      
      // Start of animation
      expect(onUpdate).toHaveBeenCalledWith(text, 0);
      
      // Wait for animation to complete
      await animatePromise;
      
      // Should have called with opacity 1 at the end
      expect(onUpdate).toHaveBeenLastCalledWith(text, 1);
    });

    it('should call onUpdate with text and opacity values', async () => {
      const text = 'Test';
      const onUpdate = jest.fn();
      
      const animatePromise = animation.animate(text, onUpdate);
      
      // Check initial call
      expect(onUpdate).toHaveBeenCalledWith(text, 0);
      
      // Wait for animation to complete
      await animatePromise;
      
      // Should have called with opacity 1 at the end
      expect(onUpdate).toHaveBeenLastCalledWith(text, 1);
      // Should have called multiple times during animation
      expect(onUpdate).toHaveBeenCalledTimes(expect.any(Number));
    });

    it('should return Promise that resolves when complete', async () => {
      const text = 'Quick';
      const onUpdate = jest.fn();
      
      const animatePromise = animation.animate(text, onUpdate);
      
      await expect(animatePromise).resolves.toBeUndefined();
    });

    it('should handle empty text', async () => {
      const onUpdate = jest.fn();
      
      const animatePromise = animation.animate('', onUpdate);
      
      expect(onUpdate).toHaveBeenCalledWith('', 0);
      
      await animatePromise;
      
      expect(onUpdate).toHaveBeenLastCalledWith('', 1);
    });

    it('should handle single character', async () => {
      const onUpdate = jest.fn();
      
      const animatePromise = animation.animate('A', onUpdate);
      
      expect(onUpdate).toHaveBeenCalledWith('A', 0);
      
      await animatePromise;
      
      expect(onUpdate).toHaveBeenLastCalledWith('A', 1);
    });
  });

  describe('animation control', () => {
    it('should stop animation when stop is called', async () => {
      const text = 'Long text that will be stopped';
      const onUpdate = jest.fn();
      
      const animatePromise = animation.animate(text, onUpdate);
      
      // Let animation start
      expect(onUpdate).toHaveBeenCalledWith(text, 0);
      
      // Wait a bit then stop
      await new Promise(resolve => setTimeout(resolve, 100));
      animation.stop();
      
      await animatePromise;
      
      // Should not have completed the full animation
      expect(onUpdate).not.toHaveBeenCalledWith(text, 1);
    });

    it('should update isAnimating state correctly', async () => {
      const text = 'Test';
      const onUpdate = jest.fn();
      
      expect(animation.isAnimating()).toBe(false);
      
      const animatePromise = animation.animate(text, onUpdate);
      
      expect(animation.isAnimating()).toBe(true);
      
      await animatePromise;
      
      expect(animation.isAnimating()).toBe(false);
    });

    it('should update progress during animation', async () => {
      const text = 'Hello';
      const onUpdate = jest.fn();
      
      expect(animation.getProgress()).toBe(0);
      
      const animatePromise = animation.animate(text, onUpdate);
      
      // Wait for animation to complete
      await animatePromise;
      
      expect(animation.getProgress()).toBe(1); // Complete
    });
  });

  describe('speed control', () => {
    it('should set animation duration', () => {
      animation.setSpeed(1000);
      expect(animation.getDuration()).toBe(1000);
    });

    it('should use new duration for subsequent animations', async () => {
      const text = 'Test';
      const onUpdate = jest.fn();
      
      animation.setSpeed(1000); // 1000ms duration
      
      const startTime = Date.now();
      const animatePromise = animation.animate(text, onUpdate);
      
      await animatePromise;
      const endTime = Date.now();
      
      // Should take approximately the new duration
      expect(endTime - startTime).toBeGreaterThanOrEqual(900); // Allow some tolerance
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
      const text = 'Test';
      const onUpdate = jest.fn();
      
      const animatePromise = animation.animate(text, onUpdate);
      
      expect(animation.isAnimating()).toBe(true);
      
      await animatePromise;
      
      expect(animation.isAnimating()).toBe(false);
      expect(animation.getProgress()).toBe(1);
    });

    it('should reset state after stopping', async () => {
      const text = 'Test';
      const onUpdate = jest.fn();
      
      const animatePromise = animation.animate(text, onUpdate);
      
      expect(animation.isAnimating()).toBe(true);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      animation.stop();
      
      expect(animation.isAnimating()).toBe(false);
      
      await animatePromise;
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
      const onUpdate = jest.fn().mockImplementation(() => {
        throw new Error('Update error');
      });
      
      const animatePromise = animation.animate('Test', onUpdate);
      
      await expect(animatePromise).rejects.toThrow('Update error');
    });
  });

  describe('performance considerations', () => {
    it('should handle long text efficiently', async () => {
      const longText = 'A'.repeat(1000);
      const onUpdate = jest.fn();
      
      const startTime = Date.now();
      const animatePromise = animation.animate(longText, onUpdate);
      
      await animatePromise;
      const endTime = Date.now();
      
      expect(onUpdate).toHaveBeenCalledWith(longText, 0);
      expect(onUpdate).toHaveBeenLastCalledWith(longText, 1);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle rapid stop/start cycles', async () => {
      const text = 'Test';
      const onUpdate = jest.fn();
      
      // Start animation
      const animatePromise1 = animation.animate(text, onUpdate);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Stop and start again
      animation.stop();
      await animatePromise1;
      
      const animatePromise2 = animation.animate(text, onUpdate);
      
      await animatePromise2;
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
      const text = 'Fade In';
      const onUpdate = jest.fn();
      
      const animatePromise = animation.animate(text, onUpdate);
      
      // Initial opacity
      expect(onUpdate).toHaveBeenCalledWith(text, 0);
      
      await animatePromise;
      
      // Final opacity
      expect(onUpdate).toHaveBeenLastCalledWith(text, 1);
    });

    it('should provide smooth opacity transitions', async () => {
      const text = 'Smooth';
      const onUpdate = jest.fn();
      
      const animatePromise = animation.animate(text, onUpdate);
      
      await animatePromise;
      
      // Should have called multiple times during animation
      const calls = onUpdate.mock.calls;
      expect(calls.length).toBeGreaterThan(1);
      
      // First call should be 0
      expect(calls[0][1]).toBe(0);
      // Last call should be 1
      expect(calls[calls.length - 1][1]).toBe(1);
      
      // Should be monotonically increasing
      for (let i = 1; i < calls.length; i++) {
        expect(calls[i][1]).toBeGreaterThanOrEqual(calls[i - 1][1]);
      }
    });

    it('should handle different text lengths consistently', async () => {
      const shortText = 'Hi';
      const longText = 'This is a much longer text that should fade in at the same rate';
      const onUpdate = jest.fn();
      
      // Animate short text
      const shortPromise = animation.animate(shortText, onUpdate);
      await shortPromise;
      
      onUpdate.mockClear();
      
      // Animate long text
      const longPromise = animation.animate(longText, onUpdate);
      await longPromise;
      
      // Both should complete
      expect(onUpdate).toHaveBeenCalledWith(longText, 0);
      expect(onUpdate).toHaveBeenLastCalledWith(longText, 1);
    });

    it('should support easing functions', async () => {
      const text = 'Eased';
      const onUpdate = jest.fn();
      
      // Set custom easing (linear for testing)
      animation.setEasing((t: number) => t);
      
      const animatePromise = animation.animate(text, onUpdate);
      
      await animatePromise;
      
      // Should have completed animation
      expect(onUpdate).toHaveBeenLastCalledWith(text, 1);
    });
  });

  describe('easing functions', () => {
    it('should support linear easing', async () => {
      const text = 'Linear';
      const onUpdate = jest.fn();
      
      animation.setEasing((t: number) => t);
      
      const animatePromise = animation.animate(text, onUpdate);
      
      await animatePromise;
      
      expect(onUpdate).toHaveBeenLastCalledWith(text, 1);
    });

    it('should support ease-in easing', async () => {
      const text = 'Ease In';
      const onUpdate = jest.fn();
      
      animation.setEasing((t: number) => t * t);
      
      const animatePromise = animation.animate(text, onUpdate);
      
      await animatePromise;
      
      expect(onUpdate).toHaveBeenLastCalledWith(text, 1);
    });

    it('should support ease-out easing', async () => {
      const text = 'Ease Out';
      const onUpdate = jest.fn();
      
      animation.setEasing((t: number) => 1 - (1 - t) * (1 - t));
      
      const animatePromise = animation.animate(text, onUpdate);
      
      await animatePromise;
      
      expect(onUpdate).toHaveBeenLastCalledWith(text, 1);
    });
  });
}); 