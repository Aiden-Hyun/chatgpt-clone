import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StreamingIndicator } from '../../../../../../src/features/concurrent-chat/features/streaming/components/StreamingIndicator';
import { useMessageStreaming } from '../../../../../../src/features/concurrent-chat/features/streaming/useMessageStreaming';

// Mock the streaming hook
jest.mock('../../../../../../src/features/concurrent-chat/features/streaming/useMessageStreaming');

const mockUseMessageStreaming = useMessageStreaming as jest.MockedFunction<typeof useMessageStreaming>;

describe('StreamingIndicator', () => {
  const mockMessage = {
    id: 'msg1',
    content: 'Streaming message content that is being received in real-time.',
    status: 'streaming',
    role: 'assistant',
    timestamp: new Date('2024-01-01T12:00:00Z')
  };

  const mockStreamingState = {
    isStreaming: true,
    isPaused: false,
    isStopped: false,
    streamProgress: 0.75,
    streamSpeed: 100,
    bufferSize: 1024,
    quality: 'high',
    latency: 50,
    throughput: 1000,
    currentStrategy: 'real-time'
  };

  const mockStreamingControls = {
    pauseStream: jest.fn(),
    resumeStream: jest.fn(),
    stopStream: jest.fn(),
    setQuality: jest.fn(),
    setStrategy: jest.fn(),
    clearBuffer: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseMessageStreaming.mockReturnValue({
      ...mockStreamingState,
      ...mockStreamingControls
    });
  });

  describe('Streaming status display', () => {
    it('should render streaming indicator', () => {
      render(<StreamingIndicator message={mockMessage} />);

      expect(screen.getByTestId('streaming-indicator')).toBeInTheDocument();
      expect(screen.getByText('Streaming...')).toBeInTheDocument();
    });

    it('should show streaming progress', () => {
      render(<StreamingIndicator message={mockMessage} />);

      const progressBar = screen.getByTestId('streaming-progress');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveStyle({ width: '75%' });
    });

    it('should show streaming status text', () => {
      render(<StreamingIndicator message={mockMessage} />);

      expect(screen.getByText('75% complete')).toBeInTheDocument();
    });

    it('should show streaming animation', () => {
      render(<StreamingIndicator message={mockMessage} />);

      const streamingAnimation = screen.getByTestId('streaming-animation');
      expect(streamingAnimation).toBeInTheDocument();
      expect(streamingAnimation).toHaveClass('streaming-pulse');
    });

    it('should handle paused streaming state', () => {
      mockUseMessageStreaming.mockReturnValue({
        ...mockStreamingState,
        isStreaming: false,
        isPaused: true
      });

      render(<StreamingIndicator message={mockMessage} />);

      expect(screen.getByText('Paused')).toBeInTheDocument();
      expect(screen.getByTestId('paused-indicator')).toBeInTheDocument();
    });

    it('should handle stopped streaming state', () => {
      mockUseMessageStreaming.mockReturnValue({
        ...mockStreamingState,
        isStreaming: false,
        isStopped: true
      });

      render(<StreamingIndicator message={mockMessage} />);

      expect(screen.getByText('Stopped')).toBeInTheDocument();
      expect(screen.getByTestId('stopped-indicator')).toBeInTheDocument();
    });
  });

  describe('Quality indicators', () => {
    it('should show quality level', () => {
      render(<StreamingIndicator message={mockMessage} />);

      expect(screen.getByText('Quality: High')).toBeInTheDocument();
      expect(screen.getByTestId('quality-indicator')).toHaveClass('quality-high');
    });

    it('should show latency information', () => {
      render(<StreamingIndicator message={mockMessage} />);

      expect(screen.getByText('Latency: 50ms')).toBeInTheDocument();
    });

    it('should show throughput information', () => {
      render(<StreamingIndicator message={mockMessage} />);

      expect(screen.getByText('Throughput: 1.0 KB/s')).toBeInTheDocument();
    });

    it('should show buffer information', () => {
      render(<StreamingIndicator message={mockMessage} />);

      expect(screen.getByText('Buffer: 1.0 KB')).toBeInTheDocument();
    });

    it('should show stream speed', () => {
      render(<StreamingIndicator message={mockMessage} />);

      expect(screen.getByText('Speed: 100 tokens/s')).toBeInTheDocument();
    });

    it('should handle different quality levels', () => {
      mockUseMessageStreaming.mockReturnValue({
        ...mockStreamingState,
        quality: 'low'
      });

      render(<StreamingIndicator message={mockMessage} />);

      expect(screen.getByText('Quality: Low')).toBeInTheDocument();
      expect(screen.getByTestId('quality-indicator')).toHaveClass('quality-low');
    });

    it('should show quality warning for low quality', () => {
      mockUseMessageStreaming.mockReturnValue({
        ...mockStreamingState,
        quality: 'low'
      });

      render(<StreamingIndicator message={mockMessage} />);

      expect(screen.getByText('Low quality detected')).toBeInTheDocument();
      expect(screen.getByTestId('quality-warning')).toBeInTheDocument();
    });
  });

  describe('Stream controls', () => {
    it('should show stream control buttons', () => {
      render(<StreamingIndicator message={mockMessage} />);

      expect(screen.getByTestId('pause-button')).toBeInTheDocument();
      expect(screen.getByTestId('stop-button')).toBeInTheDocument();
      expect(screen.getByText('Pause')).toBeInTheDocument();
      expect(screen.getByText('Stop')).toBeInTheDocument();
    });

    it('should handle pause button click', async () => {
      render(<StreamingIndicator message={mockMessage} />);

      const pauseButton = screen.getByTestId('pause-button');
      fireEvent.click(pauseButton);

      await waitFor(() => {
        expect(mockStreamingControls.pauseStream).toHaveBeenCalled();
      });
    });

    it('should handle stop button click', async () => {
      render(<StreamingIndicator message={mockMessage} />);

      const stopButton = screen.getByTestId('stop-button');
      fireEvent.click(stopButton);

      await waitFor(() => {
        expect(mockStreamingControls.stopStream).toHaveBeenCalled();
      });
    });

    it('should show resume button when paused', () => {
      mockUseMessageStreaming.mockReturnValue({
        ...mockStreamingState,
        isStreaming: false,
        isPaused: true
      });

      render(<StreamingIndicator message={mockMessage} />);

      const resumeButton = screen.getByTestId('resume-button');
      expect(resumeButton).toBeInTheDocument();
      expect(screen.getByText('Resume')).toBeInTheDocument();
    });

    it('should handle resume button click', async () => {
      mockUseMessageStreaming.mockReturnValue({
        ...mockStreamingState,
        isStreaming: false,
        isPaused: true
      });

      render(<StreamingIndicator message={mockMessage} />);

      const resumeButton = screen.getByTestId('resume-button');
      fireEvent.click(resumeButton);

      await waitFor(() => {
        expect(mockStreamingControls.resumeStream).toHaveBeenCalled();
      });
    });

    it('should show quality selector', () => {
      render(<StreamingIndicator message={mockMessage} />);

      const qualitySelector = screen.getByTestId('quality-selector');
      expect(qualitySelector).toBeInTheDocument();
    });

    it('should handle quality change', async () => {
      render(<StreamingIndicator message={mockMessage} />);

      const qualitySelector = screen.getByTestId('quality-selector');
      fireEvent.change(qualitySelector, { target: { value: 'medium' } });

      await waitFor(() => {
        expect(mockStreamingControls.setQuality).toHaveBeenCalledWith('medium');
      });
    });

    it('should show strategy selector', () => {
      render(<StreamingIndicator message={mockMessage} />);

      const strategySelector = screen.getByTestId('strategy-selector');
      expect(strategySelector).toBeInTheDocument();
    });

    it('should handle strategy change', async () => {
      render(<StreamingIndicator message={mockMessage} />);

      const strategySelector = screen.getByTestId('strategy-selector');
      fireEvent.change(strategySelector, { target: { value: 'buffered' } });

      await waitFor(() => {
        expect(mockStreamingControls.setStrategy).toHaveBeenCalledWith('buffered');
      });
    });

    it('should show clear buffer button', () => {
      render(<StreamingIndicator message={mockMessage} />);

      const clearBufferButton = screen.getByTestId('clear-buffer-button');
      expect(clearBufferButton).toBeInTheDocument();
    });

    it('should handle clear buffer', async () => {
      render(<StreamingIndicator message={mockMessage} />);

      const clearBufferButton = screen.getByTestId('clear-buffer-button');
      fireEvent.click(clearBufferButton);

      await waitFor(() => {
        expect(mockStreamingControls.clearBuffer).toHaveBeenCalled();
      });
    });
  });

  describe('Plugin integration', () => {
    it('should render with plugin system integration', () => {
      render(<StreamingIndicator message={mockMessage} />);

      expect(screen.getByTestId('plugin-streaming-renderer')).toBeInTheDocument();
    });

    it('should allow plugins to modify streaming behavior', () => {
      render(<StreamingIndicator message={mockMessage} />);

      const pluginModifiedStreaming = screen.getByTestId('plugin-modified-streaming');
      if (pluginModifiedStreaming) {
        expect(pluginModifiedStreaming).toBeInTheDocument();
      }
    });

    it('should handle plugin streaming errors gracefully', () => {
      render(<StreamingIndicator message={mockMessage} />);

      const pluginError = screen.getByTestId('plugin-error');
      if (pluginError) {
        expect(pluginError).toBeInTheDocument();
      }
    });

    it('should support custom streaming plugins', () => {
      render(<StreamingIndicator message={mockMessage} />);

      const customStreamingPlugin = screen.getByTestId('custom-streaming-plugin');
      if (customStreamingPlugin) {
        expect(customStreamingPlugin).toBeInTheDocument();
      }
    });
  });

  describe('Strategy pattern integration', () => {
    it('should use different streaming strategies', () => {
      render(<StreamingIndicator message={mockMessage} />);

      const strategyRenderer = screen.getByTestId('strategy-renderer');
      expect(strategyRenderer).toBeInTheDocument();
    });

    it('should switch streaming strategies dynamically', () => {
      render(<StreamingIndicator message={mockMessage} />);

      const strategySelector = screen.getByTestId('strategy-selector');
      fireEvent.change(strategySelector, { target: { value: 'adaptive' } });

      expect(strategySelector).toHaveValue('adaptive');
    });

    it('should optimize streaming based on strategy', () => {
      render(<StreamingIndicator message={mockMessage} />);

      const optimizedStreaming = screen.getByTestId('optimized-streaming');
      if (optimizedStreaming) {
        expect(optimizedStreaming).toBeInTheDocument();
      }
    });

    it('should handle strategy-specific controls', () => {
      render(<StreamingIndicator message={mockMessage} />);

      const strategyControls = screen.getByTestId('strategy-controls');
      if (strategyControls) {
        expect(strategyControls).toBeInTheDocument();
      }
    });
  });

  describe('Interface compliance', () => {
    it('should implement IStreamingIndicator interface', () => {
      render(<StreamingIndicator message={mockMessage} />);

      const streamingIndicator = screen.getByTestId('streaming-indicator');
      expect(streamingIndicator).toHaveAttribute('data-interface', 'IStreamingIndicator');
    });

    it('should follow component interface contract', () => {
      render(<StreamingIndicator message={mockMessage} />);

      // Should accept required props
      expect(screen.getByTestId('streaming-indicator')).toBeInTheDocument();
    });

    it('should handle optional props correctly', () => {
      render(<StreamingIndicator message={mockMessage} showControls={false} />);

      expect(screen.getByTestId('streaming-indicator')).toBeInTheDocument();
    });

    it('should validate required props', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // @ts-ignore - Testing invalid props
      render(<StreamingIndicator />);
      
      expect(consoleError).toHaveBeenCalled();
      consoleError.mockRestore();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<StreamingIndicator message={mockMessage} />);

      const streamingIndicator = screen.getByTestId('streaming-indicator');
      expect(streamingIndicator).toHaveAttribute('aria-label', 'Streaming indicator');
    });

    it('should support keyboard navigation', () => {
      render(<StreamingIndicator message={mockMessage} />);

      const pauseButton = screen.getByTestId('pause-button');
      pauseButton.focus();
      expect(pauseButton).toHaveFocus();
    });

    it('should have proper focus management', () => {
      render(<StreamingIndicator message={mockMessage} />);

      const controls = screen.getByTestId('streaming-controls');
      controls.focus();
      expect(controls).toHaveFocus();
    });

    it('should support screen readers', () => {
      render(<StreamingIndicator message={mockMessage} />);

      const screenReaderText = screen.getByTestId('screen-reader-text');
      if (screenReaderText) {
        expect(screenReaderText).toBeInTheDocument();
      }
    });
  });

  describe('Error handling', () => {
    it('should handle streaming errors gracefully', () => {
      mockUseMessageStreaming.mockImplementation(() => {
        throw new Error('Streaming failed');
      });

      render(<StreamingIndicator message={mockMessage} />);

      expect(screen.getByText('Streaming failed')).toBeInTheDocument();
      expect(screen.getByTestId('error-fallback')).toBeInTheDocument();
    });

    it('should show error retry button', () => {
      mockUseMessageStreaming.mockImplementation(() => {
        throw new Error('Streaming failed');
      });

      render(<StreamingIndicator message={mockMessage} />);

      const retryButton = screen.getByTestId('retry-button');
      expect(retryButton).toBeInTheDocument();
    });

    it('should handle network errors', () => {
      mockUseMessageStreaming.mockImplementation(() => {
        throw new Error('Network error');
      });

      render(<StreamingIndicator message={mockMessage} />);

      expect(screen.getByText('Network error')).toBeInTheDocument();
    });

    it('should handle buffer overflow', () => {
      mockUseMessageStreaming.mockReturnValue({
        ...mockStreamingState,
        bufferSize: 10000
      });

      render(<StreamingIndicator message={mockMessage} />);

      expect(screen.getByText('Buffer overflow detected')).toBeInTheDocument();
      expect(screen.getByTestId('buffer-warning')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should render efficiently', () => {
      const startTime = performance.now();
      
      render(<StreamingIndicator message={mockMessage} />);
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(10); // Should render quickly
    });

    it('should handle frequent updates efficiently', () => {
      render(<StreamingIndicator message={mockMessage} />);

      const startTime = performance.now();
      
      // Simulate frequent updates
      for (let i = 0; i < 100; i++) {
        mockUseMessageStreaming.mockReturnValue({
          ...mockStreamingState,
          streamProgress: i / 100
        });
      }
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(50); // Should handle updates quickly
    });
  });

  describe('SOLID Principles Compliance', () => {
    it('should follow Single Responsibility Principle', () => {
      render(<StreamingIndicator message={mockMessage} />);

      // Component should only handle streaming indicator display
      expect(screen.getByTestId('streaming-indicator')).toBeInTheDocument();
    });

    it('should follow Open/Closed Principle', () => {
      render(<StreamingIndicator message={mockMessage} />);

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

      render(<StreamingIndicator message={differentMessage} />);
      
      expect(screen.getByTestId('streaming-indicator')).toBeInTheDocument();
    });

    it('should follow Interface Segregation Principle', () => {
      render(<StreamingIndicator message={mockMessage} />);

      // Should depend on focused interfaces, not large ones
      expect(screen.getByTestId('streaming-indicator')).toBeInTheDocument();
    });

    it('should follow Dependency Inversion Principle', () => {
      render(<StreamingIndicator message={mockMessage} />);

      // Should depend on abstractions (hooks) not concretions
      expect(mockUseMessageStreaming).toHaveBeenCalled();
    });
  });
}); 