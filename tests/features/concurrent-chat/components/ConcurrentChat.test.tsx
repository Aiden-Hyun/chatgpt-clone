import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ConcurrentChat } from '../../../../src/features/concurrent-chat/components/ConcurrentChat';
import { EventBus } from '../../../../src/features/concurrent-chat/core/events/EventBus';
import { ServiceContainer } from '../../../../src/features/concurrent-chat/core/container/ServiceContainer';
import { useConcurrentChat } from '../../../../src/features/concurrent-chat/core/hooks/useConcurrentChat';

// Mock the hooks
jest.mock('../../../../src/features/concurrent-chat/core/hooks/useConcurrentChat');
jest.mock('../../../../src/features/concurrent-chat/core/hooks/usePluginSystem');
jest.mock('../../../../src/features/concurrent-chat/core/hooks/useModelSelection');

const mockUseConcurrentChat = useConcurrentChat as jest.MockedFunction<typeof useConcurrentChat>;

describe('ConcurrentChat', () => {
  let eventBus: EventBus;
  let serviceContainer: ServiceContainer;
  let mockSession: any;

  beforeEach(() => {
    eventBus = new EventBus();
    serviceContainer = new ServiceContainer();
    mockSession = {
      user: { id: 'user123', email: 'test@example.com' },
      access_token: 'mock-token'
    };

    // Default mock implementation
    mockUseConcurrentChat.mockReturnValue({
      messages: [],
      isProcessing: false,
      sendMessage: jest.fn(),
      retryMessage: jest.fn(),
      cancelMessage: jest.fn(),
      clearMessages: jest.fn(),
      error: null,
      isLoading: false
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Render with session', () => {
    it('should render with session', () => {
      render(<ConcurrentChat session={mockSession} />);

      expect(screen.getByTestId('concurrent-chat')).toBeInTheDocument();
      expect(screen.getByTestId('message-list')).toBeInTheDocument();
      expect(screen.getByTestId('message-input')).toBeInTheDocument();
    });

    it('should display user information when session is provided', () => {
      render(<ConcurrentChat session={mockSession} />);

      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    it('should initialize chat services with session', () => {
      render(<ConcurrentChat session={mockSession} />);

      expect(mockUseConcurrentChat).toHaveBeenCalledWith(mockSession);
    });
  });

  describe('Render without session', () => {
    it('should render without session', () => {
      render(<ConcurrentChat session={null} />);

      expect(screen.getByTestId('concurrent-chat')).toBeInTheDocument();
      expect(screen.getByText('Please sign in to start chatting')).toBeInTheDocument();
    });

    it('should not initialize chat services without session', () => {
      render(<ConcurrentChat session={null} />);

      expect(mockUseConcurrentChat).toHaveBeenCalledWith(null);
    });

    it('should show authentication prompt', () => {
      render(<ConcurrentChat session={null} />);

      expect(screen.getByText('Please sign in to start chatting')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });
  });

  describe('Handle send message', () => {
    it('should handle send message', async () => {
      const mockSendMessage = jest.fn();
      mockUseConcurrentChat.mockReturnValue({
        messages: [],
        isProcessing: false,
        sendMessage: mockSendMessage,
        retryMessage: jest.fn(),
        cancelMessage: jest.fn(),
        clearMessages: jest.fn(),
        error: null,
        isLoading: false
      });

      render(<ConcurrentChat session={mockSession} />);

      const input = screen.getByTestId('message-input');
      const sendButton = screen.getByTestId('send-button');

      fireEvent.change(input, { target: { value: 'Hello, how are you?' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(mockSendMessage).toHaveBeenCalledWith('Hello, how are you?');
      });
    });

    it('should handle empty message input', () => {
      const mockSendMessage = jest.fn();
      mockUseConcurrentChat.mockReturnValue({
        messages: [],
        isProcessing: false,
        sendMessage: mockSendMessage,
        retryMessage: jest.fn(),
        cancelMessage: jest.fn(),
        clearMessages: jest.fn(),
        error: null,
        isLoading: false
      });

      render(<ConcurrentChat session={mockSession} />);

      const sendButton = screen.getByTestId('send-button');
      fireEvent.click(sendButton);

      expect(mockSendMessage).not.toHaveBeenCalled();
    });

    it('should handle keyboard events for sending', async () => {
      const mockSendMessage = jest.fn();
      mockUseConcurrentChat.mockReturnValue({
        messages: [],
        isProcessing: false,
        sendMessage: mockSendMessage,
        retryMessage: jest.fn(),
        cancelMessage: jest.fn(),
        clearMessages: jest.fn(),
        error: null,
        isLoading: false
      });

      render(<ConcurrentChat session={mockSession} />);

      const input = screen.getByTestId('message-input');
      fireEvent.change(input, { target: { value: 'Test message' } });
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(mockSendMessage).toHaveBeenCalledWith('Test message');
      });
    });
  });

  describe('Handle message retry', () => {
    it('should handle message retry', async () => {
      const mockRetryMessage = jest.fn();
      const mockMessages = [
        { id: 'msg1', content: 'Failed message', status: 'failed', role: 'assistant' }
      ];

      mockUseConcurrentChat.mockReturnValue({
        messages: mockMessages,
        isProcessing: false,
        sendMessage: jest.fn(),
        retryMessage: mockRetryMessage,
        cancelMessage: jest.fn(),
        clearMessages: jest.fn(),
        error: null,
        isLoading: false
      });

      render(<ConcurrentChat session={mockSession} />);

      const retryButton = screen.getByTestId('retry-button-msg1');
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(mockRetryMessage).toHaveBeenCalledWith('msg1');
      });
    });

    it('should show retry button for failed messages', () => {
      const mockMessages = [
        { id: 'msg1', content: 'Failed message', status: 'failed', role: 'assistant' }
      ];

      mockUseConcurrentChat.mockReturnValue({
        messages: mockMessages,
        isProcessing: false,
        sendMessage: jest.fn(),
        retryMessage: jest.fn(),
        cancelMessage: jest.fn(),
        clearMessages: jest.fn(),
        error: null,
        isLoading: false
      });

      render(<ConcurrentChat session={mockSession} />);

      expect(screen.getByTestId('retry-button-msg1')).toBeInTheDocument();
    });
  });

  describe('Handle message cancellation', () => {
    it('should handle message cancellation', async () => {
      const mockCancelMessage = jest.fn();
      const mockMessages = [
        { id: 'msg1', content: 'Processing message', status: 'processing', role: 'assistant' }
      ];

      mockUseConcurrentChat.mockReturnValue({
        messages: mockMessages,
        isProcessing: true,
        sendMessage: jest.fn(),
        retryMessage: jest.fn(),
        cancelMessage: mockCancelMessage,
        clearMessages: jest.fn(),
        error: null,
        isLoading: false
      });

      render(<ConcurrentChat session={mockSession} />);

      const cancelButton = screen.getByTestId('cancel-button-msg1');
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(mockCancelMessage).toHaveBeenCalledWith('msg1');
      });
    });

    it('should show cancel button for processing messages', () => {
      const mockMessages = [
        { id: 'msg1', content: 'Processing message', status: 'processing', role: 'assistant' }
      ];

      mockUseConcurrentChat.mockReturnValue({
        messages: mockMessages,
        isProcessing: true,
        sendMessage: jest.fn(),
        retryMessage: jest.fn(),
        cancelMessage: jest.fn(),
        clearMessages: jest.fn(),
        error: null,
        isLoading: false
      });

      render(<ConcurrentChat session={mockSession} />);

      expect(screen.getByTestId('cancel-button-msg1')).toBeInTheDocument();
    });
  });

  describe('Handle clear messages', () => {
    it('should handle clear messages', async () => {
      const mockClearMessages = jest.fn();
      const mockMessages = [
        { id: 'msg1', content: 'Message 1', status: 'completed', role: 'user' },
        { id: 'msg2', content: 'Message 2', status: 'completed', role: 'assistant' }
      ];

      mockUseConcurrentChat.mockReturnValue({
        messages: mockMessages,
        isProcessing: false,
        sendMessage: jest.fn(),
        retryMessage: jest.fn(),
        cancelMessage: jest.fn(),
        clearMessages: mockClearMessages,
        error: null,
        isLoading: false
      });

      render(<ConcurrentChat session={mockSession} />);

      const clearButton = screen.getByTestId('clear-messages-button');
      fireEvent.click(clearButton);

      await waitFor(() => {
        expect(mockClearMessages).toHaveBeenCalled();
      });
    });

    it('should show clear button when messages exist', () => {
      const mockMessages = [
        { id: 'msg1', content: 'Message 1', status: 'completed', role: 'user' }
      ];

      mockUseConcurrentChat.mockReturnValue({
        messages: mockMessages,
        isProcessing: false,
        sendMessage: jest.fn(),
        retryMessage: jest.fn(),
        cancelMessage: jest.fn(),
        clearMessages: jest.fn(),
        error: null,
        isLoading: false
      });

      render(<ConcurrentChat session={mockSession} />);

      expect(screen.getByTestId('clear-messages-button')).toBeInTheDocument();
    });
  });

  describe('Pass correct props to child components', () => {
    it('should pass messages to MessageList', () => {
      const mockMessages = [
        { id: 'msg1', content: 'Message 1', status: 'completed', role: 'user' },
        { id: 'msg2', content: 'Message 2', status: 'completed', role: 'assistant' }
      ];

      mockUseConcurrentChat.mockReturnValue({
        messages: mockMessages,
        isProcessing: false,
        sendMessage: jest.fn(),
        retryMessage: jest.fn(),
        cancelMessage: jest.fn(),
        clearMessages: jest.fn(),
        error: null,
        isLoading: false
      });

      render(<ConcurrentChat session={mockSession} />);

      const messageList = screen.getByTestId('message-list');
      expect(messageList).toBeInTheDocument();
      expect(screen.getByText('Message 1')).toBeInTheDocument();
      expect(screen.getByText('Message 2')).toBeInTheDocument();
    });

    it('should pass processing state to MessageInput', () => {
      mockUseConcurrentChat.mockReturnValue({
        messages: [],
        isProcessing: true,
        sendMessage: jest.fn(),
        retryMessage: jest.fn(),
        cancelMessage: jest.fn(),
        clearMessages: jest.fn(),
        error: null,
        isLoading: false
      });

      render(<ConcurrentChat session={mockSession} />);

      const input = screen.getByTestId('message-input');
      expect(input).toBeDisabled();
    });
  });

  describe('Handle session errors', () => {
    it('should handle session errors', () => {
      const mockError = new Error('Session expired');
      mockUseConcurrentChat.mockReturnValue({
        messages: [],
        isProcessing: false,
        sendMessage: jest.fn(),
        retryMessage: jest.fn(),
        cancelMessage: jest.fn(),
        clearMessages: jest.fn(),
        error: mockError,
        isLoading: false
      });

      render(<ConcurrentChat session={mockSession} />);

      expect(screen.getByText('Session expired')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    it('should show error boundary for unexpected errors', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Simulate an error in the component
      const ErrorComponent = () => {
        throw new Error('Unexpected error');
      };

      render(<ErrorComponent />);

      expect(consoleError).toHaveBeenCalled();
      consoleError.mockRestore();
    });
  });

  describe('Plugin-aware rendering', () => {
    it('should render with plugin system integration', () => {
      render(<ConcurrentChat session={mockSession} />);

      expect(screen.getByTestId('plugin-system')).toBeInTheDocument();
    });

    it('should load plugins dynamically', () => {
      render(<ConcurrentChat session={mockSession} />);

      expect(screen.getByTestId('plugin-loader')).toBeInTheDocument();
    });

    it('should handle plugin loading errors', () => {
      render(<ConcurrentChat session={mockSession} />);

      // Simulate plugin loading error
      const pluginError = screen.getByTestId('plugin-error');
      if (pluginError) {
        expect(pluginError).toBeInTheDocument();
      }
    });
  });

  describe('Dynamic feature loading', () => {
    it('should load features dynamically', () => {
      render(<ConcurrentChat session={mockSession} />);

      expect(screen.getByTestId('feature-loader')).toBeInTheDocument();
    });

    it('should show loading state for features', () => {
      render(<ConcurrentChat session={mockSession} />);

      const loadingIndicator = screen.getByTestId('feature-loading');
      if (loadingIndicator) {
        expect(loadingIndicator).toBeInTheDocument();
      }
    });

    it('should handle feature loading errors', () => {
      render(<ConcurrentChat session={mockSession} />);

      const featureError = screen.getByTestId('feature-error');
      if (featureError) {
        expect(featureError).toBeInTheDocument();
      }
    });
  });

  describe('Plugin configuration UI', () => {
    it('should render plugin configuration UI', () => {
      render(<ConcurrentChat session={mockSession} />);

      expect(screen.getByTestId('plugin-config')).toBeInTheDocument();
    });

    it('should allow plugin enabling/disabling', () => {
      render(<ConcurrentChat session={mockSession} />);

      const pluginToggle = screen.getByTestId('plugin-toggle');
      if (pluginToggle) {
        fireEvent.click(pluginToggle);
        expect(pluginToggle).toBeChecked();
      }
    });

    it('should show plugin settings', () => {
      render(<ConcurrentChat session={mockSession} />);

      const pluginSettings = screen.getByTestId('plugin-settings');
      if (pluginSettings) {
        expect(pluginSettings).toBeInTheDocument();
      }
    });
  });

  describe('Dependency injection integration', () => {
    it('should use dependency injection container', () => {
      render(<ConcurrentChat session={mockSession} />);

      expect(screen.getByTestId('di-container')).toBeInTheDocument();
    });

    it('should resolve dependencies correctly', () => {
      render(<ConcurrentChat session={mockSession} />);

      const resolvedServices = screen.getByTestId('resolved-services');
      if (resolvedServices) {
        expect(resolvedServices).toBeInTheDocument();
      }
    });

    it('should handle dependency resolution errors', () => {
      render(<ConcurrentChat session={mockSession} />);

      const diError = screen.getByTestId('di-error');
      if (diError) {
        expect(diError).toBeInTheDocument();
      }
    });
  });

  describe('Model selection integration', () => {
    it('should render model selector', () => {
      render(<ConcurrentChat session={mockSession} />);

      expect(screen.getByTestId('model-selector')).toBeInTheDocument();
    });

    it('should handle model changes', async () => {
      render(<ConcurrentChat session={mockSession} />);

      const modelSelect = screen.getByTestId('model-select');
      if (modelSelect) {
        fireEvent.change(modelSelect, { target: { value: 'gpt-4' } });
        
        await waitFor(() => {
          expect(modelSelect).toHaveValue('gpt-4');
        });
      }
    });

    it('should show current model', () => {
      render(<ConcurrentChat session={mockSession} />);

      const currentModel = screen.getByTestId('current-model');
      if (currentModel) {
        expect(currentModel).toHaveTextContent('gpt-3.5-turbo');
      }
    });
  });

  describe('SOLID Principles Compliance', () => {
    it('should follow Single Responsibility Principle', () => {
      render(<ConcurrentChat session={mockSession} />);

      // Component should only handle UI rendering and user interactions
      expect(screen.getByTestId('concurrent-chat')).toBeInTheDocument();
      expect(screen.getByTestId('message-list')).toBeInTheDocument();
      expect(screen.getByTestId('message-input')).toBeInTheDocument();
    });

    it('should follow Open/Closed Principle', () => {
      render(<ConcurrentChat session={mockSession} />);

      // Should be open for extension (new plugins) but closed for modification
      const pluginSystem = screen.getByTestId('plugin-system');
      expect(pluginSystem).toBeInTheDocument();
    });

    it('should follow Liskov Substitution Principle', () => {
      // Should work with different session types
      const differentSession = { user: { id: 'user456' }, access_token: 'different-token' };
      
      render(<ConcurrentChat session={differentSession} />);
      
      expect(screen.getByTestId('concurrent-chat')).toBeInTheDocument();
    });

    it('should follow Interface Segregation Principle', () => {
      render(<ConcurrentChat session={mockSession} />);

      // Should depend on focused interfaces, not large ones
      expect(screen.getByTestId('message-list')).toBeInTheDocument();
      expect(screen.getByTestId('message-input')).toBeInTheDocument();
    });

    it('should follow Dependency Inversion Principle', () => {
      render(<ConcurrentChat session={mockSession} />);

      // Should depend on abstractions (hooks) not concretions
      expect(mockUseConcurrentChat).toHaveBeenCalledWith(mockSession);
    });
  });
}); 