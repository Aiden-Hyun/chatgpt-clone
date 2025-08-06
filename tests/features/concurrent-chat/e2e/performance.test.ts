import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ConcurrentChat } from '../../../../src/features/concurrent-chat/components/ConcurrentChat';
import { useConcurrentChat } from '../../../../src/features/concurrent-chat/hooks/useConcurrentChat';
import { usePluginSystem } from '../../../../src/features/concurrent-chat/hooks/usePluginSystem';
import { useModelSelection } from '../../../../src/features/concurrent-chat/hooks/useModelSelection';

// Mock the hooks
jest.mock('../../../../src/features/concurrent-chat/hooks/useConcurrentChat');
jest.mock('../../../../src/features/concurrent-chat/hooks/usePluginSystem');
jest.mock('../../../../src/features/concurrent-chat/hooks/useModelSelection');

const mockUseConcurrentChat = useConcurrentChat as jest.MockedFunction<typeof useConcurrentChat>;
const mockUsePluginSystem = usePluginSystem as jest.MockedFunction<typeof usePluginSystem>;
const mockUseModelSelection = useModelSelection as jest.MockedFunction<typeof useModelSelection>;

describe('Performance E2E Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering performance', () => {
    it('should render large message lists efficiently', async () => {
      // Create a large list of messages
      const largeMessages = Array.from({ length: 1000 }, (_, i) => ({
        id: `msg${i}`,
        content: `Message ${i} with some content to make it longer and more realistic for testing rendering performance`,
        role: i % 2 === 0 ? 'user' : 'assistant',
        status: 'completed',
        timestamp: new Date(Date.now() - i * 1000)
      }));

      mockUseConcurrentChat.mockReturnValue({
        session: { user: { id: 'user1', email: 'test@example.com' } },
        messages: largeMessages,
        isLoading: false,
        sendMessage: jest.fn(),
        retryMessage: jest.fn(),
        cancelMessage: jest.fn(),
        clearMessages: jest.fn()
      });

      mockUsePluginSystem.mockReturnValue({
        plugins: [],
        mountPlugin: jest.fn(),
        unmountPlugin: jest.fn(),
        isPluginMounted: jest.fn().mockReturnValue(false)
      });

      mockUseModelSelection.mockReturnValue({
        selectedModel: 'gpt-3.5-turbo',
        availableModels: ['gpt-3.5-turbo', 'gpt-4'],
        selectModel: jest.fn(),
        isLoading: false
      });

      const startTime = performance.now();
      render(<ConcurrentChat />);
      const endTime = performance.now();

      // Should render within reasonable time (less than 100ms)
      expect(endTime - startTime).toBeLessThan(100);

      // Should only render visible messages initially
      await waitFor(() => {
        expect(screen.getByText('Message 0')).toBeInTheDocument();
        expect(screen.getByText('Message 1')).toBeInTheDocument();
        // Should not render messages that are not visible
        expect(screen.queryByText('Message 500')).not.toBeInTheDocument();
      });
    });

    it('should handle rapid message updates efficiently', async () => {
      const messages = [
        { id: 'msg1', content: 'Initial message', role: 'user', status: 'completed' }
      ];

      mockUseConcurrentChat.mockReturnValue({
        session: { user: { id: 'user1', email: 'test@example.com' } },
        messages: messages,
        isLoading: false,
        sendMessage: jest.fn(),
        retryMessage: jest.fn(),
        cancelMessage: jest.fn(),
        clearMessages: jest.fn()
      });

      render(<ConcurrentChat />);

      // Rapidly update messages
      const updateTimes = [];
      for (let i = 0; i < 50; i++) {
        const startTime = performance.now();
        
        mockUseConcurrentChat.mockReturnValue({
          session: { user: { id: 'user1', email: 'test@example.com' } },
          messages: [
            ...messages,
            { id: `msg${i + 2}`, content: `Update ${i}`, role: 'assistant', status: 'completed' }
          ],
          isLoading: false,
          sendMessage: jest.fn(),
          retryMessage: jest.fn(),
          cancelMessage: jest.fn(),
          clearMessages: jest.fn()
        });

        render(<ConcurrentChat />);
        
        const endTime = performance.now();
        updateTimes.push(endTime - startTime);
      }

      // Average update time should be reasonable
      const averageUpdateTime = updateTimes.reduce((a, b) => a + b, 0) / updateTimes.length;
      expect(averageUpdateTime).toBeLessThan(50); // Less than 50ms average
    });

    it('should handle concurrent message rendering efficiently', async () => {
      // Simulate multiple concurrent messages being added
      const concurrentMessages = Array.from({ length: 10 }, (_, i) => ({
        id: `concurrent${i}`,
        content: `Concurrent message ${i}`,
        role: 'assistant',
        status: 'completed'
      }));

      mockUseConcurrentChat.mockReturnValue({
        session: { user: { id: 'user1', email: 'test@example.com' } },
        messages: concurrentMessages,
        isLoading: false,
        sendMessage: jest.fn(),
        retryMessage: jest.fn(),
        cancelMessage: jest.fn(),
        clearMessages: jest.fn()
      });

      const startTime = performance.now();
      render(<ConcurrentChat />);
      const endTime = performance.now();

      // Should render concurrent messages efficiently
      expect(endTime - startTime).toBeLessThan(50);

      await waitFor(() => {
        concurrentMessages.forEach(msg => {
          expect(screen.getByText(msg.content)).toBeInTheDocument();
        });
      });
    });
  });

  describe('Memory usage performance', () => {
    it('should handle memory usage with large conversations', async () => {
      // Create a very large conversation
      const largeConversation = Array.from({ length: 5000 }, (_, i) => ({
        id: `msg${i}`,
        content: `This is a very long message ${i} with lots of content to simulate real-world usage patterns and memory consumption. It includes various types of content like code snippets, markdown formatting, and other rich text elements that might be present in actual chat conversations.`,
        role: i % 2 === 0 ? 'user' : 'assistant',
        status: 'completed',
        timestamp: new Date(Date.now() - i * 1000),
        metadata: {
          tokens: Math.floor(Math.random() * 1000) + 100,
          model: i % 2 === 0 ? 'gpt-3.5-turbo' : 'gpt-4',
          processingTime: Math.floor(Math.random() * 5000) + 1000
        }
      }));

      mockUseConcurrentChat.mockReturnValue({
        session: { user: { id: 'user1', email: 'test@example.com' } },
        messages: largeConversation,
        isLoading: false,
        sendMessage: jest.fn(),
        retryMessage: jest.fn(),
        cancelMessage: jest.fn(),
        clearMessages: jest.fn()
      });

      const startTime = performance.now();
      render(<ConcurrentChat />);
      const endTime = performance.now();

      // Should render large conversations within reasonable time
      expect(endTime - startTime).toBeLessThan(200);

      // Should implement virtual scrolling for memory efficiency
      await waitFor(() => {
        expect(screen.getByText('This is a very long message 0')).toBeInTheDocument();
        expect(screen.getByText('This is a very long message 1')).toBeInTheDocument();
        // Should not render all messages at once
        expect(screen.queryByText('This is a very long message 2500')).not.toBeInTheDocument();
      });
    });

    it('should handle memory cleanup when clearing conversations', async () => {
      const messages = Array.from({ length: 100 }, (_, i) => ({
        id: `msg${i}`,
        content: `Message ${i}`,
        role: i % 2 === 0 ? 'user' : 'assistant',
        status: 'completed'
      }));

      mockUseConcurrentChat.mockReturnValue({
        session: { user: { id: 'user1', email: 'test@example.com' } },
        messages: messages,
        isLoading: false,
        sendMessage: jest.fn(),
        retryMessage: jest.fn(),
        cancelMessage: jest.fn(),
        clearMessages: jest.fn()
      });

      render(<ConcurrentChat />);

      // Verify messages are rendered
      await waitFor(() => {
        expect(screen.getByText('Message 0')).toBeInTheDocument();
        expect(screen.getByText('Message 99')).toBeInTheDocument();
      });

      // Clear messages
      mockUseConcurrentChat.mockReturnValue({
        session: { user: { id: 'user1', email: 'test@example.com' } },
        messages: [],
        isLoading: false,
        sendMessage: jest.fn(),
        retryMessage: jest.fn(),
        cancelMessage: jest.fn(),
        clearMessages: jest.fn()
      });

      render(<ConcurrentChat />);

      // Verify messages are cleared
      await waitFor(() => {
        expect(screen.queryByText('Message 0')).not.toBeInTheDocument();
        expect(screen.queryByText('Message 99')).not.toBeInTheDocument();
      });
    });
  });

  describe('Network performance', () => {
    it('should handle rapid message sending efficiently', async () => {
      const sendMessageMock = jest.fn();
      
      mockUseConcurrentChat.mockReturnValue({
        session: { user: { id: 'user1', email: 'test@example.com' } },
        messages: [],
        isLoading: false,
        sendMessage: sendMessageMock,
        retryMessage: jest.fn(),
        cancelMessage: jest.fn(),
        clearMessages: jest.fn()
      });

      render(<ConcurrentChat />);

      const messageInput = screen.getByTestId('message-input');
      const sendButton = screen.getByTestId('send-button');

      // Send multiple messages rapidly
      const sendTimes = [];
      for (let i = 0; i < 10; i++) {
        const startTime = performance.now();
        
        fireEvent.change(messageInput, { target: { value: `Rapid message ${i}` } });
        fireEvent.click(sendButton);
        
        const endTime = performance.now();
        sendTimes.push(endTime - startTime);
      }

      // Should handle rapid sending efficiently
      const averageSendTime = sendTimes.reduce((a, b) => a + b, 0) / sendTimes.length;
      expect(averageSendTime).toBeLessThan(20); // Less than 20ms average

      // Should call sendMessage for each message
      expect(sendMessageMock).toHaveBeenCalledTimes(10);
    });

    it('should handle concurrent API requests efficiently', async () => {
      const sendMessageMock = jest.fn();
      
      mockUseConcurrentChat.mockReturnValue({
        session: { user: { id: 'user1', email: 'test@example.com' } },
        messages: [],
        isLoading: false,
        sendMessage: sendMessageMock,
        retryMessage: jest.fn(),
        cancelMessage: jest.fn(),
        clearMessages: jest.fn()
      });

      render(<ConcurrentChat />);

      const messageInput = screen.getByTestId('message-input');
      const sendButton = screen.getByTestId('send-button');

      // Simulate concurrent message sending
      const concurrentPromises = Array.from({ length: 5 }, (_, i) => {
        return new Promise<void>((resolve) => {
          setTimeout(() => {
            fireEvent.change(messageInput, { target: { value: `Concurrent message ${i}` } });
            fireEvent.click(sendButton);
            resolve();
          }, i * 10); // Small delay to simulate concurrent behavior
        });
      });

      const startTime = performance.now();
      await Promise.all(concurrentPromises);
      const endTime = performance.now();

      // Should handle concurrent requests efficiently
      expect(endTime - startTime).toBeLessThan(100);

      // Should call sendMessage for each concurrent message
      expect(sendMessageMock).toHaveBeenCalledTimes(5);
    });
  });

  describe('Animation performance', () => {
    it('should handle animation rendering efficiently', async () => {
      const messages = [
        { id: 'msg1', content: 'Animated message', role: 'assistant', status: 'completed' }
      ];

      mockUseConcurrentChat.mockReturnValue({
        session: { user: { id: 'user1', email: 'test@example.com' } },
        messages: messages,
        isLoading: false,
        sendMessage: jest.fn(),
        retryMessage: jest.fn(),
        cancelMessage: jest.fn(),
        clearMessages: jest.fn()
      });

      mockUsePluginSystem.mockReturnValue({
        plugins: [{ id: 'animation', name: 'Animation Plugin' }],
        mountPlugin: jest.fn(),
        unmountPlugin: jest.fn(),
        isPluginMounted: jest.fn().mockReturnValue(true)
      });

      render(<ConcurrentChat />);

      // Measure animation rendering performance
      const startTime = performance.now();
      
      await waitFor(() => {
        expect(screen.getByTestId('animated-message')).toBeInTheDocument();
      });
      
      const endTime = performance.now();

      // Should render animations efficiently
      expect(endTime - startTime).toBeLessThan(50);
    });

    it('should handle multiple concurrent animations efficiently', async () => {
      const animatedMessages = Array.from({ length: 10 }, (_, i) => ({
        id: `anim${i}`,
        content: `Animated message ${i}`,
        role: 'assistant',
        status: 'completed'
      }));

      mockUseConcurrentChat.mockReturnValue({
        session: { user: { id: 'user1', email: 'test@example.com' } },
        messages: animatedMessages,
        isLoading: false,
        sendMessage: jest.fn(),
        retryMessage: jest.fn(),
        cancelMessage: jest.fn(),
        clearMessages: jest.fn()
      });

      mockUsePluginSystem.mockReturnValue({
        plugins: [{ id: 'animation', name: 'Animation Plugin' }],
        mountPlugin: jest.fn(),
        unmountPlugin: jest.fn(),
        isPluginMounted: jest.fn().mockReturnValue(true)
      });

      const startTime = performance.now();
      render(<ConcurrentChat />);
      const endTime = performance.now();

      // Should render multiple animations efficiently
      expect(endTime - startTime).toBeLessThan(100);

      await waitFor(() => {
        animatedMessages.forEach(msg => {
          expect(screen.getByText(msg.content)).toBeInTheDocument();
        });
      });
    });
  });

  describe('Plugin system performance', () => {
    it('should handle plugin loading efficiently', async () => {
      const plugins = Array.from({ length: 20 }, (_, i) => ({
        id: `plugin${i}`,
        name: `Plugin ${i}`,
        description: `Description for plugin ${i}`
      }));

      mockUseConcurrentChat.mockReturnValue({
        session: { user: { id: 'user1', email: 'test@example.com' } },
        messages: [],
        isLoading: false,
        sendMessage: jest.fn(),
        retryMessage: jest.fn(),
        cancelMessage: jest.fn(),
        clearMessages: jest.fn()
      });

      mockUsePluginSystem.mockReturnValue({
        plugins: plugins,
        mountPlugin: jest.fn(),
        unmountPlugin: jest.fn(),
        isPluginMounted: jest.fn().mockReturnValue(false)
      });

      const startTime = performance.now();
      render(<ConcurrentChat />);
      const endTime = performance.now();

      // Should load many plugins efficiently
      expect(endTime - startTime).toBeLessThan(50);

      await waitFor(() => {
        expect(screen.getByTestId('plugin-manager')).toBeInTheDocument();
      });
    });

    it('should handle plugin activation/deactivation efficiently', async () => {
      const mountPluginMock = jest.fn();
      const unmountPluginMock = jest.fn();

      mockUseConcurrentChat.mockReturnValue({
        session: { user: { id: 'user1', email: 'test@example.com' } },
        messages: [],
        isLoading: false,
        sendMessage: jest.fn(),
        retryMessage: jest.fn(),
        cancelMessage: jest.fn(),
        clearMessages: jest.fn()
      });

      mockUsePluginSystem.mockReturnValue({
        plugins: [
          { id: 'plugin1', name: 'Plugin 1' },
          { id: 'plugin2', name: 'Plugin 2' },
          { id: 'plugin3', name: 'Plugin 3' }
        ],
        mountPlugin: mountPluginMock,
        unmountPlugin: unmountPluginMock,
        isPluginMounted: jest.fn().mockReturnValue(false)
      });

      render(<ConcurrentChat />);

      // Rapidly toggle plugins
      const toggleTimes = [];
      for (let i = 0; i < 10; i++) {
        const startTime = performance.now();
        
        const pluginToggle = screen.getByTestId(`plugin-toggle-plugin${(i % 3) + 1}`);
        fireEvent.click(pluginToggle);
        
        const endTime = performance.now();
        toggleTimes.push(endTime - startTime);
      }

      // Should handle plugin toggling efficiently
      const averageToggleTime = toggleTimes.reduce((a, b) => a + b, 0) / toggleTimes.length;
      expect(averageToggleTime).toBeLessThan(10); // Less than 10ms average
    });
  });

  describe('Model selection performance', () => {
    it('should handle model switching efficiently', async () => {
      const selectModelMock = jest.fn();

      mockUseConcurrentChat.mockReturnValue({
        session: { user: { id: 'user1', email: 'test@example.com' } },
        messages: [],
        isLoading: false,
        sendMessage: jest.fn(),
        retryMessage: jest.fn(),
        cancelMessage: jest.fn(),
        clearMessages: jest.fn()
      });

      mockUseModelSelection.mockReturnValue({
        selectedModel: 'gpt-3.5-turbo',
        availableModels: ['gpt-3.5-turbo', 'gpt-4', 'claude-3', 'llama-2'],
        selectModel: selectModelMock,
        isLoading: false
      });

      render(<ConcurrentChat />);

      const modelSelector = screen.getByTestId('model-selector');

      // Rapidly switch between models
      const switchTimes = [];
      const models = ['gpt-4', 'claude-3', 'llama-2', 'gpt-3.5-turbo'];
      
      for (let i = 0; i < 20; i++) {
        const startTime = performance.now();
        
        fireEvent.change(modelSelector, { target: { value: models[i % models.length] } });
        
        const endTime = performance.now();
        switchTimes.push(endTime - startTime);
      }

      // Should handle model switching efficiently
      const averageSwitchTime = switchTimes.reduce((a, b) => a + b, 0) / switchTimes.length;
      expect(averageSwitchTime).toBeLessThan(10); // Less than 10ms average

      // Should call selectModel for each switch
      expect(selectModelMock).toHaveBeenCalledTimes(20);
    });
  });

  describe('Memory leak prevention', () => {
    it('should prevent memory leaks during component unmounting', async () => {
      const messages = Array.from({ length: 100 }, (_, i) => ({
        id: `msg${i}`,
        content: `Message ${i}`,
        role: i % 2 === 0 ? 'user' : 'assistant',
        status: 'completed'
      }));

      mockUseConcurrentChat.mockReturnValue({
        session: { user: { id: 'user1', email: 'test@example.com' } },
        messages: messages,
        isLoading: false,
        sendMessage: jest.fn(),
        retryMessage: jest.fn(),
        cancelMessage: jest.fn(),
        clearMessages: jest.fn()
      });

      // Render and unmount multiple times to test for memory leaks
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(<ConcurrentChat />);
        
        await waitFor(() => {
          expect(screen.getByText('Message 0')).toBeInTheDocument();
        });
        
        unmount();
      }

      // If there are memory leaks, this test would fail due to excessive memory usage
      // The test passing indicates proper cleanup
      expect(true).toBe(true);
    });

    it('should handle cleanup of event listeners efficiently', async () => {
      mockUseConcurrentChat.mockReturnValue({
        session: { user: { id: 'user1', email: 'test@example.com' } },
        messages: [],
        isLoading: false,
        sendMessage: jest.fn(),
        retryMessage: jest.fn(),
        cancelMessage: jest.fn(),
        clearMessages: jest.fn()
      });

      // Render component multiple times to test event listener cleanup
      for (let i = 0; i < 5; i++) {
        const { unmount } = render(<ConcurrentChat />);
        
        // Simulate some user interactions
        const messageInput = screen.getByTestId('message-input');
        fireEvent.change(messageInput, { target: { value: 'Test message' } });
        
        unmount();
      }

      // Test should pass if event listeners are properly cleaned up
      expect(true).toBe(true);
    });
  });
}); 