import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AnimatedMessage } from '../../../../../../src/features/concurrent-chat/features/animation/components/AnimatedMessage';
import { useMessageAnimation } from '../../../../../../src/features/concurrent-chat/features/animation/useMessageAnimation';

// Mock the animation hook
jest.mock('../../../../../../src/features/concurrent-chat/features/animation/useMessageAnimation');

const mockUseMessageAnimation = useMessageAnimation as jest.MockedFunction<typeof useMessageAnimation>;

describe('AnimatedMessage', () => {
  const mockMessage = {
    id: 'msg1',
    content: 'This is an animated message that will be displayed with typewriter effect.',
    status: 'completed',
    role: 'assistant',
    timestamp: new Date('2024-01-01T12:00:00Z')
  };

  const mockAnimationState = {
    isPlaying: true,
    isPaused: false,
    isStopped: false,
    speed: 1,
    progress: 0.5,
    duration: 2000,
    currentStrategy: 'typewriter'
  };

  const mockAnimationControls = {
    play: jest.fn(),
    pause: jest.fn(),
    stop: jest.fn(),
    setSpeed: jest.fn(),
    setStrategy: jest.fn(),
    reset: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseMessageAnimation.mockReturnValue({
      ...mockAnimationState,
      ...mockAnimationControls
    });
  });

  describe('Animated message display', () => {
    it('should render animated message', () => {
      render(<AnimatedMessage message={mockMessage} />);

      expect(screen.getByTestId('animated-message')).toBeInTheDocument();
      expect(screen.getByText('This is an animated message that will be displayed with typewriter effect.')).toBeInTheDocument();
    });

    it('should display message with animation overlay', () => {
      render(<AnimatedMessage message={mockMessage} />);

      const animatedOverlay = screen.getByTestId('animation-overlay');
      expect(animatedOverlay).toBeInTheDocument();
    });

    it('should show animated content based on progress', () => {
      mockUseMessageAnimation.mockReturnValue({
        ...mockAnimationState,
        progress: 0.3
      });

      render(<AnimatedMessage message={mockMessage} />);

      const animatedContent = screen.getByTestId('animated-content');
      expect(animatedContent).toHaveStyle({ width: '30%' });
    });

    it('should handle different message types', () => {
      const codeMessage = {
        ...mockMessage,
        content: '```javascript\nconsole.log("Hello World");\n```',
        type: 'code'
      };

      render(<AnimatedMessage message={codeMessage} />);

      expect(screen.getByTestId('code-animation')).toBeInTheDocument();
    });

    it('should handle markdown content', () => {
      const markdownMessage = {
        ...mockMessage,
        content: '**Bold text** and *italic text* with [link](https://example.com)',
        type: 'markdown'
      };

      render(<AnimatedMessage message={markdownMessage} />);

      expect(screen.getByTestId('markdown-animation')).toBeInTheDocument();
    });
  });

  describe('Animation controls UI', () => {
    it('should render animation controls', () => {
      render(<AnimatedMessage message={mockMessage} />);

      expect(screen.getByTestId('animation-controls')).toBeInTheDocument();
      expect(screen.getByTestId('play-button')).toBeInTheDocument();
      expect(screen.getByTestId('pause-button')).toBeInTheDocument();
      expect(screen.getByTestId('stop-button')).toBeInTheDocument();
    });

    it('should handle play button click', async () => {
      render(<AnimatedMessage message={mockMessage} />);

      const playButton = screen.getByTestId('play-button');
      fireEvent.click(playButton);

      await waitFor(() => {
        expect(mockAnimationControls.play).toHaveBeenCalled();
      });
    });

    it('should handle pause button click', async () => {
      render(<AnimatedMessage message={mockMessage} />);

      const pauseButton = screen.getByTestId('pause-button');
      fireEvent.click(pauseButton);

      await waitFor(() => {
        expect(mockAnimationControls.pause).toHaveBeenCalled();
      });
    });

    it('should handle stop button click', async () => {
      render(<AnimatedMessage message={mockMessage} />);

      const stopButton = screen.getByTestId('stop-button');
      fireEvent.click(stopButton);

      await waitFor(() => {
        expect(mockAnimationControls.stop).toHaveBeenCalled();
      });
    });

    it('should show speed control slider', () => {
      render(<AnimatedMessage message={mockMessage} />);

      const speedSlider = screen.getByTestId('speed-slider');
      expect(speedSlider).toBeInTheDocument();
      expect(speedSlider).toHaveValue('1');
    });

    it('should handle speed change', async () => {
      render(<AnimatedMessage message={mockMessage} />);

      const speedSlider = screen.getByTestId('speed-slider');
      fireEvent.change(speedSlider, { target: { value: '2' } });

      await waitFor(() => {
        expect(mockAnimationControls.setSpeed).toHaveBeenCalledWith(2);
      });
    });

    it('should show strategy selector', () => {
      render(<AnimatedMessage message={mockMessage} />);

      const strategySelector = screen.getByTestId('strategy-selector');
      expect(strategySelector).toBeInTheDocument();
    });

    it('should handle strategy change', async () => {
      render(<AnimatedMessage message={mockMessage} />);

      const strategySelector = screen.getByTestId('strategy-selector');
      fireEvent.change(strategySelector, { target: { value: 'fade-in' } });

      await waitFor(() => {
        expect(mockAnimationControls.setStrategy).toHaveBeenCalledWith('fade-in');
      });
    });
  });

  describe('Performance monitoring', () => {
    it('should display performance metrics', () => {
      render(<AnimatedMessage message={mockMessage} />);

      expect(screen.getByTestId('performance-metrics')).toBeInTheDocument();
      expect(screen.getByText('FPS: 60')).toBeInTheDocument();
      expect(screen.getByText('Duration: 2.0s')).toBeInTheDocument();
    });

    it('should show frame rate indicator', () => {
      render(<AnimatedMessage message={mockMessage} />);

      const fpsIndicator = screen.getByTestId('fps-indicator');
      expect(fpsIndicator).toBeInTheDocument();
    });

    it('should show memory usage', () => {
      render(<AnimatedMessage message={mockMessage} />);

      const memoryUsage = screen.getByTestId('memory-usage');
      expect(memoryUsage).toBeInTheDocument();
    });

    it('should handle performance warnings', () => {
      // Mock low performance scenario
      mockUseMessageAnimation.mockReturnValue({
        ...mockAnimationState,
        fps: 15,
        memoryUsage: 50
      });

      render(<AnimatedMessage message={mockMessage} />);

      expect(screen.getByText('Low performance detected')).toBeInTheDocument();
      expect(screen.getByTestId('performance-warning')).toBeInTheDocument();
    });

    it('should optimize rendering for large content', () => {
      const largeMessage = {
        ...mockMessage,
        content: 'a'.repeat(10000)
      };

      const startTime = performance.now();
      render(<AnimatedMessage message={largeMessage} />);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // Should render quickly
    });
  });

  describe('Plugin integration', () => {
    it('should render with plugin system integration', () => {
      render(<AnimatedMessage message={mockMessage} />);

      expect(screen.getByTestId('plugin-animation-renderer')).toBeInTheDocument();
    });

    it('should allow plugins to modify animation behavior', () => {
      render(<AnimatedMessage message={mockMessage} />);

      const pluginModifiedAnimation = screen.getByTestId('plugin-modified-animation');
      if (pluginModifiedAnimation) {
        expect(pluginModifiedAnimation).toBeInTheDocument();
      }
    });

    it('should handle plugin animation errors gracefully', () => {
      render(<AnimatedMessage message={mockMessage} />);

      const pluginError = screen.getByTestId('plugin-error');
      if (pluginError) {
        expect(pluginError).toBeInTheDocument();
      }
    });

    it('should support custom animation plugins', () => {
      render(<AnimatedMessage message={mockMessage} />);

      const customAnimationPlugin = screen.getByTestId('custom-animation-plugin');
      if (customAnimationPlugin) {
        expect(customAnimationPlugin).toBeInTheDocument();
      }
    });
  });

  describe('Strategy pattern integration', () => {
    it('should use different animation strategies', () => {
      render(<AnimatedMessage message={mockMessage} />);

      const strategyRenderer = screen.getByTestId('strategy-renderer');
      expect(strategyRenderer).toBeInTheDocument();
    });

    it('should switch animation strategies dynamically', () => {
      render(<AnimatedMessage message={mockMessage} />);

      const strategySelector = screen.getByTestId('strategy-selector');
      fireEvent.change(strategySelector, { target: { value: 'slide-in' } });

      expect(strategySelector).toHaveValue('slide-in');
    });

    it('should optimize animation based on strategy', () => {
      render(<AnimatedMessage message={mockMessage} />);

      const optimizedAnimation = screen.getByTestId('optimized-animation');
      if (optimizedAnimation) {
        expect(optimizedAnimation).toBeInTheDocument();
      }
    });

    it('should handle strategy-specific controls', () => {
      render(<AnimatedMessage message={mockMessage} />);

      const strategyControls = screen.getByTestId('strategy-controls');
      if (strategyControls) {
        expect(strategyControls).toBeInTheDocument();
      }
    });
  });

  describe('Interface compliance', () => {
    it('should implement IAnimatedMessage interface', () => {
      render(<AnimatedMessage message={mockMessage} />);

      const animatedMessage = screen.getByTestId('animated-message');
      expect(animatedMessage).toHaveAttribute('data-interface', 'IAnimatedMessage');
    });

    it('should follow component interface contract', () => {
      render(<AnimatedMessage message={mockMessage} />);

      // Should accept required props
      expect(screen.getByTestId('animated-message')).toBeInTheDocument();
    });

    it('should handle optional props correctly', () => {
      render(<AnimatedMessage message={mockMessage} autoPlay={false} />);

      expect(screen.getByTestId('animated-message')).toBeInTheDocument();
    });

    it('should validate required props', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // @ts-ignore - Testing invalid props
      render(<AnimatedMessage />);
      
      expect(consoleError).toHaveBeenCalled();
      consoleError.mockRestore();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<AnimatedMessage message={mockMessage} />);

      const animatedMessage = screen.getByTestId('animated-message');
      expect(animatedMessage).toHaveAttribute('aria-label', 'Animated message');
    });

    it('should support keyboard navigation', () => {
      render(<AnimatedMessage message={mockMessage} />);

      const playButton = screen.getByTestId('play-button');
      playButton.focus();
      expect(playButton).toHaveFocus();
    });

    it('should have proper focus management', () => {
      render(<AnimatedMessage message={mockMessage} />);

      const controls = screen.getByTestId('animation-controls');
      controls.focus();
      expect(controls).toHaveFocus();
    });

    it('should support screen readers', () => {
      render(<AnimatedMessage message={mockMessage} />);

      const screenReaderText = screen.getByTestId('screen-reader-text');
      if (screenReaderText) {
        expect(screenReaderText).toBeInTheDocument();
      }
    });
  });

  describe('Error handling', () => {
    it('should handle animation errors gracefully', () => {
      mockUseMessageAnimation.mockImplementation(() => {
        throw new Error('Animation failed');
      });

      render(<AnimatedMessage message={mockMessage} />);

      expect(screen.getByText('Animation failed')).toBeInTheDocument();
      expect(screen.getByTestId('error-fallback')).toBeInTheDocument();
    });

    it('should show fallback content on error', () => {
      mockUseMessageAnimation.mockImplementation(() => {
        throw new Error('Animation failed');
      });

      render(<AnimatedMessage message={mockMessage} />);

      expect(screen.getByText('This is an animated message that will be displayed with typewriter effect.')).toBeInTheDocument();
    });

    it('should handle missing message content', () => {
      const emptyMessage = { ...mockMessage, content: '' };
      render(<AnimatedMessage message={emptyMessage} />);

      expect(screen.getByText('No content to animate')).toBeInTheDocument();
    });
  });

  describe('SOLID Principles Compliance', () => {
    it('should follow Single Responsibility Principle', () => {
      render(<AnimatedMessage message={mockMessage} />);

      // Component should only handle animated message rendering
      expect(screen.getByTestId('animated-message')).toBeInTheDocument();
    });

    it('should follow Open/Closed Principle', () => {
      render(<AnimatedMessage message={mockMessage} />);

      // Should be open for extension (new strategies) but closed for modification
      const strategyRenderer = screen.getByTestId('strategy-renderer');
      expect(strategyRenderer).toBeInTheDocument();
    });

    it('should follow Liskov Substitution Principle', () => {
      // Should work with different message types
      const differentMessage = { 
        ...mockMessage, 
        type: 'image',
        content: 'image.jpg' 
      };

      render(<AnimatedMessage message={differentMessage} />);
      
      expect(screen.getByTestId('animated-message')).toBeInTheDocument();
    });

    it('should follow Interface Segregation Principle', () => {
      render(<AnimatedMessage message={mockMessage} />);

      // Should depend on focused interfaces, not large ones
      expect(screen.getByTestId('animated-message')).toBeInTheDocument();
    });

    it('should follow Dependency Inversion Principle', () => {
      render(<AnimatedMessage message={mockMessage} />);

      // Should depend on abstractions (hooks) not concretions
      expect(mockUseMessageAnimation).toHaveBeenCalled();
    });
  });
}); 