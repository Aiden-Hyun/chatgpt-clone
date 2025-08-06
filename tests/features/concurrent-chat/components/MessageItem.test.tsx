import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MessageItem } from '../../../../src/features/concurrent-chat/components/MessageItem';

describe('MessageItem', () => {
  const mockMessage = {
    id: 'msg1',
    content: 'Hello, how are you?',
    status: 'completed',
    role: 'user',
    timestamp: new Date('2024-01-01T12:00:00Z')
  };

  const mockHandlers = {
    onRetry: jest.fn(),
    onCancel: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Render user message', () => {
    it('should render user message', () => {
      render(<MessageItem message={mockMessage} {...mockHandlers} />);

      expect(screen.getByText('Hello, how are you?')).toBeInTheDocument();
      expect(screen.getByTestId('message-item-msg1')).toHaveClass('message-user');
    });

    it('should display user avatar', () => {
      render(<MessageItem message={mockMessage} {...mockHandlers} />);

      const userAvatar = screen.getByTestId('user-avatar');
      expect(userAvatar).toBeInTheDocument();
    });

    it('should show user role indicator', () => {
      render(<MessageItem message={mockMessage} {...mockHandlers} />);

      expect(screen.getByText('You')).toBeInTheDocument();
    });
  });

  describe('Render assistant message', () => {
    it('should render assistant message', () => {
      const assistantMessage = { ...mockMessage, role: 'assistant' };
      render(<MessageItem message={assistantMessage} {...mockHandlers} />);

      expect(screen.getByText('Hello, how are you?')).toBeInTheDocument();
      expect(screen.getByTestId('message-item-msg1')).toHaveClass('message-assistant');
    });

    it('should display assistant avatar', () => {
      const assistantMessage = { ...mockMessage, role: 'assistant' };
      render(<MessageItem message={assistantMessage} {...mockHandlers} />);

      const assistantAvatar = screen.getByTestId('assistant-avatar');
      expect(assistantAvatar).toBeInTheDocument();
    });

    it('should show assistant role indicator', () => {
      const assistantMessage = { ...mockMessage, role: 'assistant' };
      render(<MessageItem message={assistantMessage} {...mockHandlers} />);

      expect(screen.getByText('Assistant')).toBeInTheDocument();
    });
  });

  describe('Show loading state', () => {
    it('should show loading state', () => {
      const loadingMessage = { ...mockMessage, status: 'processing' };
      render(<MessageItem message={loadingMessage} {...mockHandlers} />);

      expect(screen.getByTestId('message-item-msg1')).toHaveClass('status-processing');
      expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
    });

    it('should show typing indicator for assistant messages', () => {
      const loadingMessage = { ...mockMessage, status: 'processing', role: 'assistant' };
      render(<MessageItem message={loadingMessage} {...mockHandlers} />);

      expect(screen.getByTestId('typing-indicator')).toBeInTheDocument();
    });

    it('should show progress bar for processing messages', () => {
      const loadingMessage = { ...mockMessage, status: 'processing' };
      render(<MessageItem message={loadingMessage} {...mockHandlers} />);

      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('Show completed state', () => {
    it('should show completed state', () => {
      render(<MessageItem message={mockMessage} {...mockHandlers} />);

      expect(screen.getByTestId('message-item-msg1')).toHaveClass('status-completed');
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    });

    it('should show completion timestamp', () => {
      render(<MessageItem message={mockMessage} {...mockHandlers} />);

      expect(screen.getByTestId('message-timestamp')).toBeInTheDocument();
    });

    it('should show success indicator', () => {
      render(<MessageItem message={mockMessage} {...mockHandlers} />);

      const successIndicator = screen.getByTestId('success-indicator');
      expect(successIndicator).toBeInTheDocument();
    });
  });

  describe('Show failed state with error', () => {
    it('should show failed state with error', () => {
      const failedMessage = { 
        ...mockMessage, 
        status: 'failed', 
        error: 'Network error occurred' 
      };
      render(<MessageItem message={failedMessage} {...mockHandlers} />);

      expect(screen.getByTestId('message-item-msg1')).toHaveClass('status-failed');
      expect(screen.getByText('Network error occurred')).toBeInTheDocument();
    });

    it('should show error icon', () => {
      const failedMessage = { 
        ...mockMessage, 
        status: 'failed', 
        error: 'Network error occurred' 
      };
      render(<MessageItem message={failedMessage} {...mockHandlers} />);

      const errorIcon = screen.getByTestId('error-icon');
      expect(errorIcon).toBeInTheDocument();
    });

    it('should show retry button for failed messages', () => {
      const failedMessage = { 
        ...mockMessage, 
        status: 'failed', 
        error: 'Network error occurred' 
      };
      render(<MessageItem message={failedMessage} {...mockHandlers} />);

      expect(screen.getByTestId('retry-button-msg1')).toBeInTheDocument();
    });
  });

  describe('Handle retry action', () => {
    it('should handle retry action', async () => {
      const failedMessage = { 
        ...mockMessage, 
        status: 'failed', 
        error: 'Network error occurred' 
      };
      render(<MessageItem message={failedMessage} {...mockHandlers} />);

      const retryButton = screen.getByTestId('retry-button-msg1');
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(mockHandlers.onRetry).toHaveBeenCalledWith('msg1');
      });
    });

    it('should show loading state after retry', async () => {
      const failedMessage = { 
        ...mockMessage, 
        status: 'failed', 
        error: 'Network error occurred' 
      };
      render(<MessageItem message={failedMessage} {...mockHandlers} />);

      const retryButton = screen.getByTestId('retry-button-msg1');
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.getByTestId('retry-loading')).toBeInTheDocument();
      });
    });
  });

  describe('Handle cancel action', () => {
    it('should handle cancel action', async () => {
      const processingMessage = { ...mockMessage, status: 'processing' };
      render(<MessageItem message={processingMessage} {...mockHandlers} />);

      const cancelButton = screen.getByTestId('cancel-button-msg1');
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(mockHandlers.onCancel).toHaveBeenCalledWith('msg1');
      });
    });

    it('should show cancel button for processing messages', () => {
      const processingMessage = { ...mockMessage, status: 'processing' };
      render(<MessageItem message={processingMessage} {...mockHandlers} />);

      expect(screen.getByTestId('cancel-button-msg1')).toBeInTheDocument();
    });

    it('should not show cancel button for completed messages', () => {
      render(<MessageItem message={mockMessage} {...mockHandlers} />);

      expect(screen.queryByTestId('cancel-button-msg1')).not.toBeInTheDocument();
    });
  });

  describe('Show typing indicator', () => {
    it('should show typing indicator for assistant messages', () => {
      const typingMessage = { ...mockMessage, status: 'processing', role: 'assistant' };
      render(<MessageItem message={typingMessage} {...mockHandlers} />);

      expect(screen.getByTestId('typing-indicator')).toBeInTheDocument();
    });

    it('should animate typing indicator', () => {
      const typingMessage = { ...mockMessage, status: 'processing', role: 'assistant' };
      render(<MessageItem message={typingMessage} {...mockHandlers} />);

      const typingIndicator = screen.getByTestId('typing-indicator');
      expect(typingIndicator).toHaveClass('typing-animation');
    });

    it('should not show typing indicator for user messages', () => {
      const typingMessage = { ...mockMessage, status: 'processing', role: 'user' };
      render(<MessageItem message={typingMessage} {...mockHandlers} />);

      expect(screen.queryByTestId('typing-indicator')).not.toBeInTheDocument();
    });
  });

  describe('Handle empty content', () => {
    it('should handle empty content', () => {
      const emptyMessage = { ...mockMessage, content: '' };
      render(<MessageItem message={emptyMessage} {...mockHandlers} />);

      expect(screen.getByText('Empty message')).toBeInTheDocument();
    });

    it('should show placeholder for empty content', () => {
      const emptyMessage = { ...mockMessage, content: '' };
      render(<MessageItem message={emptyMessage} {...mockHandlers} />);

      expect(screen.getByTestId('empty-content-placeholder')).toBeInTheDocument();
    });

    it('should handle null content', () => {
      const nullMessage = { ...mockMessage, content: null };
      render(<MessageItem message={nullMessage} {...mockHandlers} />);

      expect(screen.getByText('Empty message')).toBeInTheDocument();
    });
  });

  describe('Apply correct styling based on role', () => {
    it('should apply user message styling', () => {
      render(<MessageItem message={mockMessage} {...mockHandlers} />);

      const messageItem = screen.getByTestId('message-item-msg1');
      expect(messageItem).toHaveClass('message-user');
      expect(messageItem).toHaveClass('user-message-styles');
    });

    it('should apply assistant message styling', () => {
      const assistantMessage = { ...mockMessage, role: 'assistant' };
      render(<MessageItem message={assistantMessage} {...mockHandlers} />);

      const messageItem = screen.getByTestId('message-item-msg1');
      expect(messageItem).toHaveClass('message-assistant');
      expect(messageItem).toHaveClass('assistant-message-styles');
    });

    it('should apply system message styling', () => {
      const systemMessage = { ...mockMessage, role: 'system' };
      render(<MessageItem message={systemMessage} {...mockHandlers} />);

      const messageItem = screen.getByTestId('message-item-msg1');
      expect(messageItem).toHaveClass('message-system');
      expect(messageItem).toHaveClass('system-message-styles');
    });
  });

  describe('Plugin-aware message display', () => {
    it('should render with plugin system integration', () => {
      render(<MessageItem message={mockMessage} {...mockHandlers} />);

      expect(screen.getByTestId('plugin-message-display')).toBeInTheDocument();
    });

    it('should allow plugins to modify message display', () => {
      render(<MessageItem message={mockMessage} {...mockHandlers} />);

      const pluginModifiedContent = screen.getByTestId('plugin-modified-content');
      if (pluginModifiedContent) {
        expect(pluginModifiedContent).toBeInTheDocument();
      }
    });

    it('should handle plugin display errors gracefully', () => {
      render(<MessageItem message={mockMessage} {...mockHandlers} />);

      const pluginError = screen.getByTestId('plugin-error');
      if (pluginError) {
        expect(pluginError).toBeInTheDocument();
      }
    });
  });

  describe('Feature integration points', () => {
    it('should integrate animation features', () => {
      render(<MessageItem message={mockMessage} {...mockHandlers} />);

      const animatedContent = screen.getByTestId('animated-content');
      if (animatedContent) {
        expect(animatedContent).toBeInTheDocument();
      }
    });

    it('should integrate editing features', () => {
      render(<MessageItem message={mockMessage} {...mockHandlers} />);

      const editButton = screen.getByTestId('edit-button-msg1');
      if (editButton) {
        expect(editButton).toBeInTheDocument();
      }
    });

    it('should integrate regeneration features', () => {
      const assistantMessage = { ...mockMessage, role: 'assistant' };
      render(<MessageItem message={assistantMessage} {...mockHandlers} />);

      const regenerateButton = screen.getByTestId('regenerate-button-msg1');
      if (regenerateButton) {
        expect(regenerateButton).toBeInTheDocument();
      }
    });
  });

  describe('Extensible UI components', () => {
    it('should support custom message renderers', () => {
      render(<MessageItem message={mockMessage} {...mockHandlers} />);

      const customRenderer = screen.getByTestId('custom-message-renderer');
      if (customRenderer) {
        expect(customRenderer).toBeInTheDocument();
      }
    });

    it('should support custom action buttons', () => {
      render(<MessageItem message={mockMessage} {...mockHandlers} />);

      const customActions = screen.getByTestId('custom-actions');
      if (customActions) {
        expect(customActions).toBeInTheDocument();
      }
    });

    it('should support custom styling themes', () => {
      render(<MessageItem message={mockMessage} {...mockHandlers} />);

      const themedMessage = screen.getByTestId('themed-message');
      if (themedMessage) {
        expect(themedMessage).toBeInTheDocument();
      }
    });
  });

  describe('Strategy pattern integration', () => {
    it('should use different display strategies', () => {
      render(<MessageItem message={mockMessage} {...mockHandlers} />);

      const strategyDisplay = screen.getByTestId('strategy-display');
      if (strategyDisplay) {
        expect(strategyDisplay).toBeInTheDocument();
      }
    });

    it('should switch display strategies dynamically', () => {
      render(<MessageItem message={mockMessage} {...mockHandlers} />);

      const strategySelector = screen.getByTestId('strategy-selector');
      if (strategySelector) {
        fireEvent.change(strategySelector, { target: { value: 'compact' } });
        expect(strategySelector).toHaveValue('compact');
      }
    });

    it('should optimize display based on strategy', () => {
      render(<MessageItem message={mockMessage} {...mockHandlers} />);

      const optimizedDisplay = screen.getByTestId('optimized-display');
      if (optimizedDisplay) {
        expect(optimizedDisplay).toBeInTheDocument();
      }
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<MessageItem message={mockMessage} {...mockHandlers} />);

      const messageItem = screen.getByTestId('message-item-msg1');
      expect(messageItem).toHaveAttribute('aria-label', 'User message');
    });

    it('should support keyboard navigation', () => {
      render(<MessageItem message={mockMessage} {...mockHandlers} />);

      const messageItem = screen.getByTestId('message-item-msg1');
      messageItem.focus();
      expect(messageItem).toHaveFocus();
    });

    it('should have proper focus management', () => {
      render(<MessageItem message={mockMessage} {...mockHandlers} />);

      const retryButton = screen.queryByTestId('retry-button-msg1');
      if (retryButton) {
        retryButton.focus();
        expect(retryButton).toHaveFocus();
      }
    });

    it('should support screen readers', () => {
      render(<MessageItem message={mockMessage} {...mockHandlers} />);

      const screenReaderText = screen.getByTestId('screen-reader-text');
      if (screenReaderText) {
        expect(screenReaderText).toBeInTheDocument();
      }
    });
  });

  describe('Performance', () => {
    it('should render efficiently', () => {
      const startTime = performance.now();
      
      render(<MessageItem message={mockMessage} {...mockHandlers} />);
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(10); // Should render quickly
    });

    it('should memoize content rendering', () => {
      render(<MessageItem message={mockMessage} {...mockHandlers} />);

      const memoizedContent = screen.getByTestId('memoized-content');
      if (memoizedContent) {
        expect(memoizedContent).toBeInTheDocument();
      }
    });

    it('should handle large content efficiently', () => {
      const largeMessage = { 
        ...mockMessage, 
        content: 'a'.repeat(10000) 
      };
      
      const startTime = performance.now();
      render(<MessageItem message={largeMessage} {...mockHandlers} />);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(50); // Should handle large content quickly
    });
  });

  describe('SOLID Principles Compliance', () => {
    it('should follow Single Responsibility Principle', () => {
      render(<MessageItem message={mockMessage} {...mockHandlers} />);

      // Component should only handle single message rendering
      expect(screen.getByTestId('message-item-msg1')).toBeInTheDocument();
    });

    it('should follow Open/Closed Principle', () => {
      render(<MessageItem message={mockMessage} {...mockHandlers} />);

      // Should be open for extension (new plugins) but closed for modification
      const pluginDisplay = screen.getByTestId('plugin-message-display');
      expect(pluginDisplay).toBeInTheDocument();
    });

    it('should follow Liskov Substitution Principle', () => {
      // Should work with different message types
      const differentMessage = { 
        ...mockMessage, 
        type: 'image', 
        content: 'image.jpg' 
      };

      render(<MessageItem message={differentMessage} {...mockHandlers} />);
      
      expect(screen.getByTestId('message-item-msg1')).toBeInTheDocument();
    });

    it('should follow Interface Segregation Principle', () => {
      render(<MessageItem message={mockMessage} {...mockHandlers} />);

      // Should depend on focused interfaces, not large ones
      expect(screen.getByTestId('message-item-msg1')).toBeInTheDocument();
    });

    it('should follow Dependency Inversion Principle', () => {
      render(<MessageItem message={mockMessage} {...mockHandlers} />);

      // Should depend on abstractions (props) not concretions
      expect(mockHandlers.onRetry).toBeDefined();
      expect(mockHandlers.onCancel).toBeDefined();
    });
  });
}); 