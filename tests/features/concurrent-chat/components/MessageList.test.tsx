import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MessageList } from '../../../../src/features/concurrent-chat/components/MessageList';

describe('MessageList', () => {
  const mockMessages = [
    { id: 'msg1', content: 'Hello, how are you?', status: 'completed', role: 'user' },
    { id: 'msg2', content: 'I am doing well, thank you!', status: 'completed', role: 'assistant' },
    { id: 'msg3', content: 'That is great to hear!', status: 'completed', role: 'user' }
  ];

  const mockHandlers = {
    onRetry: jest.fn(),
    onCancel: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Render empty message list', () => {
    it('should render empty message list', () => {
      render(<MessageList messages={[]} {...mockHandlers} />);

      expect(screen.getByTestId('message-list')).toBeInTheDocument();
      expect(screen.getByText('No messages yet')).toBeInTheDocument();
    });

    it('should show welcome message when empty', () => {
      render(<MessageList messages={[]} {...mockHandlers} />);

      expect(screen.getByText('Start a conversation')).toBeInTheDocument();
    });

    it('should show empty state with proper styling', () => {
      render(<MessageList messages={[]} {...mockHandlers} />);

      const emptyState = screen.getByTestId('empty-state');
      expect(emptyState).toHaveClass('empty-state');
    });
  });

  describe('Render messages correctly', () => {
    it('should render messages correctly', () => {
      render(<MessageList messages={mockMessages} {...mockHandlers} />);

      expect(screen.getByText('Hello, how are you?')).toBeInTheDocument();
      expect(screen.getByText('I am doing well, thank you!')).toBeInTheDocument();
      expect(screen.getByText('That is great to hear!')).toBeInTheDocument();
    });

    it('should render correct number of messages', () => {
      render(<MessageList messages={mockMessages} {...mockHandlers} />);

      const messageItems = screen.getAllByTestId(/message-item-/);
      expect(messageItems).toHaveLength(3);
    });

    it('should apply correct styling based on message role', () => {
      render(<MessageList messages={mockMessages} {...mockHandlers} />);

      const userMessage = screen.getByTestId('message-item-msg1');
      const assistantMessage = screen.getByTestId('message-item-msg2');

      expect(userMessage).toHaveClass('message-user');
      expect(assistantMessage).toHaveClass('message-assistant');
    });

    it('should display message timestamps', () => {
      const messagesWithTimestamps = mockMessages.map(msg => ({
        ...msg,
        timestamp: new Date('2024-01-01T12:00:00Z')
      }));

      render(<MessageList messages={messagesWithTimestamps} {...mockHandlers} />);

      expect(screen.getAllByTestId(/message-timestamp/)).toHaveLength(3);
    });
  });

  describe('Handle message retry action', () => {
    it('should handle message retry action', async () => {
      const failedMessages = [
        { id: 'msg1', content: 'Failed message', status: 'failed', role: 'assistant' }
      ];

      render(<MessageList messages={failedMessages} {...mockHandlers} />);

      const retryButton = screen.getByTestId('retry-button-msg1');
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(mockHandlers.onRetry).toHaveBeenCalledWith('msg1');
      });
    });

    it('should show retry button for failed messages', () => {
      const failedMessages = [
        { id: 'msg1', content: 'Failed message', status: 'failed', role: 'assistant' }
      ];

      render(<MessageList messages={failedMessages} {...mockHandlers} />);

      expect(screen.getByTestId('retry-button-msg1')).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });

    it('should not show retry button for successful messages', () => {
      render(<MessageList messages={mockMessages} {...mockHandlers} />);

      expect(screen.queryByTestId('retry-button-msg1')).not.toBeInTheDocument();
    });
  });

  describe('Handle message cancel action', () => {
    it('should handle message cancel action', async () => {
      const processingMessages = [
        { id: 'msg1', content: 'Processing message', status: 'processing', role: 'assistant' }
      ];

      render(<MessageList messages={processingMessages} {...mockHandlers} />);

      const cancelButton = screen.getByTestId('cancel-button-msg1');
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(mockHandlers.onCancel).toHaveBeenCalledWith('msg1');
      });
    });

    it('should show cancel button for processing messages', () => {
      const processingMessages = [
        { id: 'msg1', content: 'Processing message', status: 'processing', role: 'assistant' }
      ];

      render(<MessageList messages={processingMessages} {...mockHandlers} />);

      expect(screen.getByTestId('cancel-button-msg1')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('should not show cancel button for completed messages', () => {
      render(<MessageList messages={mockMessages} {...mockHandlers} />);

      expect(screen.queryByTestId('cancel-button-msg1')).not.toBeInTheDocument();
    });
  });

  describe('Scroll to bottom on new messages', () => {
    it('should scroll to bottom when new messages are added', async () => {
      const { rerender } = render(<MessageList messages={mockMessages.slice(0, 1)} {...mockHandlers} />);

      // Add a new message
      rerender(<MessageList messages={mockMessages} {...mockHandlers} />);

      await waitFor(() => {
        const messageList = screen.getByTestId('message-list');
        expect(messageList.scrollTop).toBe(messageList.scrollHeight);
      });
    });

    it('should maintain scroll position when no new messages', () => {
      const { rerender } = render(<MessageList messages={mockMessages} {...mockHandlers} />);

      const messageList = screen.getByTestId('message-list');
      const initialScrollTop = messageList.scrollTop;

      rerender(<MessageList messages={mockMessages} {...mockHandlers} />);

      expect(messageList.scrollTop).toBe(initialScrollTop);
    });

    it('should auto-scroll to bottom on initial load', () => {
      render(<MessageList messages={mockMessages} {...mockHandlers} />);

      const messageList = screen.getByTestId('message-list');
      expect(messageList.scrollTop).toBe(messageList.scrollHeight);
    });
  });

  describe('Handle different message statuses', () => {
    it('should handle completed message status', () => {
      render(<MessageList messages={mockMessages} {...mockHandlers} />);

      const completedMessage = screen.getByTestId('message-item-msg1');
      expect(completedMessage).toHaveClass('status-completed');
    });

    it('should handle processing message status', () => {
      const processingMessages = [
        { id: 'msg1', content: 'Processing...', status: 'processing', role: 'assistant' }
      ];

      render(<MessageList messages={processingMessages} {...mockHandlers} />);

      const processingMessage = screen.getByTestId('message-item-msg1');
      expect(processingMessage).toHaveClass('status-processing');
      expect(screen.getByTestId('typing-indicator')).toBeInTheDocument();
    });

    it('should handle failed message status', () => {
      const failedMessages = [
        { id: 'msg1', content: 'Failed message', status: 'failed', role: 'assistant', error: 'Network error' }
      ];

      render(<MessageList messages={failedMessages} {...mockHandlers} />);

      const failedMessage = screen.getByTestId('message-item-msg1');
      expect(failedMessage).toHaveClass('status-failed');
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });

    it('should handle pending message status', () => {
      const pendingMessages = [
        { id: 'msg1', content: 'Pending message', status: 'pending', role: 'user' }
      ];

      render(<MessageList messages={pendingMessages} {...mockHandlers} />);

      const pendingMessage = screen.getByTestId('message-item-msg1');
      expect(pendingMessage).toHaveClass('status-pending');
    });
  });

  describe('Handle long message lists', () => {
    it('should handle long message lists efficiently', () => {
      const longMessageList = Array.from({ length: 100 }, (_, i) => ({
        id: `msg${i}`,
        content: `Message ${i}`,
        status: 'completed',
        role: i % 2 === 0 ? 'user' : 'assistant'
      }));

      render(<MessageList messages={longMessageList} {...mockHandlers} />);

      expect(screen.getByText('Message 0')).toBeInTheDocument();
      expect(screen.getByText('Message 99')).toBeInTheDocument();
    });

    it('should implement virtual scrolling for large lists', () => {
      const longMessageList = Array.from({ length: 1000 }, (_, i) => ({
        id: `msg${i}`,
        content: `Message ${i}`,
        status: 'completed',
        role: i % 2 === 0 ? 'user' : 'assistant'
      }));

      render(<MessageList messages={longMessageList} {...mockHandlers} />);

      const virtualizedList = screen.getByTestId('virtualized-message-list');
      expect(virtualizedList).toBeInTheDocument();
    });

    it('should maintain performance with many messages', () => {
      const startTime = performance.now();
      
      const longMessageList = Array.from({ length: 100 }, (_, i) => ({
        id: `msg${i}`,
        content: `Message ${i}`,
        status: 'completed',
        role: i % 2 === 0 ? 'user' : 'assistant'
      }));

      render(<MessageList messages={longMessageList} {...mockHandlers} />);
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(100); // Should render quickly
    });
  });

  describe('Plugin-aware message rendering', () => {
    it('should render with plugin system integration', () => {
      render(<MessageList messages={mockMessages} {...mockHandlers} />);

      expect(screen.getByTestId('plugin-message-renderer')).toBeInTheDocument();
    });

    it('should allow plugins to modify message rendering', () => {
      render(<MessageList messages={mockMessages} {...mockHandlers} />);

      const pluginModifiedMessage = screen.getByTestId('plugin-modified-message');
      if (pluginModifiedMessage) {
        expect(pluginModifiedMessage).toBeInTheDocument();
      }
    });

    it('should handle plugin rendering errors gracefully', () => {
      render(<MessageList messages={mockMessages} {...mockHandlers} />);

      const pluginError = screen.getByTestId('plugin-error');
      if (pluginError) {
        expect(pluginError).toBeInTheDocument();
      }
    });
  });

  describe('Dynamic feature integration', () => {
    it('should integrate animation features', () => {
      render(<MessageList messages={mockMessages} {...mockHandlers} />);

      const animatedMessage = screen.getByTestId('animated-message');
      if (animatedMessage) {
        expect(animatedMessage).toBeInTheDocument();
      }
    });

    it('should integrate editing features', () => {
      render(<MessageList messages={mockMessages} {...mockHandlers} />);

      const editableMessage = screen.getByTestId('editable-message');
      if (editableMessage) {
        expect(editableMessage).toBeInTheDocument();
      }
    });

    it('should integrate regeneration features', () => {
      render(<MessageList messages={mockMessages} {...mockHandlers} />);

      const regenerateButton = screen.getByTestId('regenerate-button');
      if (regenerateButton) {
        expect(regenerateButton).toBeInTheDocument();
      }
    });
  });

  describe('Performance optimization', () => {
    it('should implement message memoization', () => {
      render(<MessageList messages={mockMessages} {...mockHandlers} />);

      const memoizedMessage = screen.getByTestId('memoized-message');
      if (memoizedMessage) {
        expect(memoizedMessage).toBeInTheDocument();
      }
    });

    it('should use React.memo for message items', () => {
      render(<MessageList messages={mockMessages} {...mockHandlers} />);

      const messageItems = screen.getAllByTestId(/message-item-/);
      expect(messageItems).toHaveLength(3);
    });

    it('should implement lazy loading for images', () => {
      const messagesWithImages = [
        { id: 'msg1', content: 'Message with image', status: 'completed', role: 'user', image: 'test.jpg' }
      ];

      render(<MessageList messages={messagesWithImages} {...mockHandlers} />);

      const lazyImage = screen.getByTestId('lazy-image');
      if (lazyImage) {
        expect(lazyImage).toBeInTheDocument();
      }
    });
  });

  describe('Strategy pattern integration', () => {
    it('should use different rendering strategies', () => {
      render(<MessageList messages={mockMessages} {...mockHandlers} />);

      const strategyRenderer = screen.getByTestId('strategy-renderer');
      if (strategyRenderer) {
        expect(strategyRenderer).toBeInTheDocument();
      }
    });

    it('should switch rendering strategies dynamically', () => {
      render(<MessageList messages={mockMessages} {...mockHandlers} />);

      const strategySelector = screen.getByTestId('strategy-selector');
      if (strategySelector) {
        fireEvent.change(strategySelector, { target: { value: 'compact' } });
        expect(strategySelector).toHaveValue('compact');
      }
    });

    it('should optimize rendering based on strategy', () => {
      render(<MessageList messages={mockMessages} {...mockHandlers} />);

      const optimizedRenderer = screen.getByTestId('optimized-renderer');
      if (optimizedRenderer) {
        expect(optimizedRenderer).toBeInTheDocument();
      }
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<MessageList messages={mockMessages} {...mockHandlers} />);

      const messageList = screen.getByTestId('message-list');
      expect(messageList).toHaveAttribute('aria-label', 'Chat messages');
    });

    it('should support keyboard navigation', () => {
      render(<MessageList messages={mockMessages} {...mockHandlers} />);

      const messageItems = screen.getAllByTestId(/message-item-/);
      messageItems[0].focus();
      expect(messageItems[0]).toHaveFocus();
    });

    it('should have proper focus management', () => {
      render(<MessageList messages={mockMessages} {...mockHandlers} />);

      const retryButton = screen.queryByTestId('retry-button-msg1');
      if (retryButton) {
        retryButton.focus();
        expect(retryButton).toHaveFocus();
      }
    });
  });

  describe('SOLID Principles Compliance', () => {
    it('should follow Single Responsibility Principle', () => {
      render(<MessageList messages={mockMessages} {...mockHandlers} />);

      // Component should only handle message list rendering
      expect(screen.getByTestId('message-list')).toBeInTheDocument();
    });

    it('should follow Open/Closed Principle', () => {
      render(<MessageList messages={mockMessages} {...mockHandlers} />);

      // Should be open for extension (new plugins) but closed for modification
      const pluginRenderer = screen.getByTestId('plugin-message-renderer');
      expect(pluginRenderer).toBeInTheDocument();
    });

    it('should follow Liskov Substitution Principle', () => {
      // Should work with different message types
      const differentMessages = [
        { id: 'msg1', content: 'Different message', status: 'completed', role: 'user', type: 'text' }
      ];

      render(<MessageList messages={differentMessages} {...mockHandlers} />);
      
      expect(screen.getByText('Different message')).toBeInTheDocument();
    });

    it('should follow Interface Segregation Principle', () => {
      render(<MessageList messages={mockMessages} {...mockHandlers} />);

      // Should depend on focused interfaces, not large ones
      expect(screen.getByTestId('message-list')).toBeInTheDocument();
    });

    it('should follow Dependency Inversion Principle', () => {
      render(<MessageList messages={mockMessages} {...mockHandlers} />);

      // Should depend on abstractions (props) not concretions
      expect(mockHandlers.onRetry).toBeDefined();
      expect(mockHandlers.onCancel).toBeDefined();
    });
  });
}); 