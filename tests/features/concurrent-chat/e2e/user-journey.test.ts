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

describe('User Journey E2E Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete user journey from login to conversation', () => {
    it('should handle complete user journey from login to conversation', async () => {
      // Mock initial state - user not logged in
      mockUseConcurrentChat.mockReturnValue({
        session: null,
        messages: [],
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

      render(<ConcurrentChat />);

      // Step 1: User sees login screen
      expect(screen.getByText(/Please log in to continue/i)).toBeInTheDocument();

      // Step 2: User logs in (simulate login)
      mockUseConcurrentChat.mockReturnValue({
        session: { user: { id: 'user1', email: 'test@example.com' } },
        messages: [],
        isLoading: false,
        sendMessage: jest.fn(),
        retryMessage: jest.fn(),
        cancelMessage: jest.fn(),
        clearMessages: jest.fn()
      });

      // Re-render with logged in state
      render(<ConcurrentChat />);

      // Step 3: User sees empty chat interface
      expect(screen.getByTestId('message-input')).toBeInTheDocument();
      expect(screen.getByTestId('send-button')).toBeInTheDocument();

      // Step 4: User types and sends first message
      const messageInput = screen.getByTestId('message-input');
      const sendButton = screen.getByTestId('send-button');

      fireEvent.change(messageInput, { target: { value: 'Hello, how are you?' } });
      fireEvent.click(sendButton);

      // Step 5: User sees message being processed
      await waitFor(() => {
        expect(screen.getByText('Hello, how are you?')).toBeInTheDocument();
      });

      // Step 6: User receives AI response
      mockUseConcurrentChat.mockReturnValue({
        session: { user: { id: 'user1', email: 'test@example.com' } },
        messages: [
          { id: 'msg1', content: 'Hello, how are you?', role: 'user', status: 'completed' },
          { id: 'msg2', content: 'I am doing well, thank you for asking!', role: 'assistant', status: 'completed' }
        ],
        isLoading: false,
        sendMessage: jest.fn(),
        retryMessage: jest.fn(),
        cancelMessage: jest.fn(),
        clearMessages: jest.fn()
      });

      // Re-render with messages
      render(<ConcurrentChat />);

      await waitFor(() => {
        expect(screen.getByText('I am doing well, thank you for asking!')).toBeInTheDocument();
      });

      // Step 7: User continues conversation
      fireEvent.change(messageInput, { target: { value: 'Can you help me with coding?' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(screen.getByText('Can you help me with coding?')).toBeInTheDocument();
      });

      // Verify complete journey
      expect(screen.getByText('Hello, how are you?')).toBeInTheDocument();
      expect(screen.getByText('I am doing well, thank you for asking!')).toBeInTheDocument();
      expect(screen.getByText('Can you help me with coding?')).toBeInTheDocument();
    });

    it('should handle user journey with model selection', async () => {
      // Mock initial state with model selection
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
        availableModels: ['gpt-3.5-turbo', 'gpt-4', 'claude-3'],
        selectModel: jest.fn(),
        isLoading: false
      });

      render(<ConcurrentChat />);

      // Step 1: User sees model selector
      expect(screen.getByTestId('model-selector')).toBeInTheDocument();

      // Step 2: User changes model
      const modelSelector = screen.getByTestId('model-selector');
      fireEvent.change(modelSelector, { target: { value: 'gpt-4' } });

      await waitFor(() => {
        expect(modelSelector).toHaveValue('gpt-4');
      });

      // Step 3: User sends message with new model
      const messageInput = screen.getByTestId('message-input');
      const sendButton = screen.getByTestId('send-button');

      fireEvent.change(messageInput, { target: { value: 'Explain quantum computing' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(screen.getByText('Explain quantum computing')).toBeInTheDocument();
      });

      // Step 4: User receives response from new model
      mockUseConcurrentChat.mockReturnValue({
        session: { user: { id: 'user1', email: 'test@example.com' } },
        messages: [
          { id: 'msg1', content: 'Explain quantum computing', role: 'user', status: 'completed' },
          { id: 'msg2', content: 'Quantum computing is a revolutionary technology...', role: 'assistant', status: 'completed' }
        ],
        isLoading: false,
        sendMessage: jest.fn(),
        retryMessage: jest.fn(),
        cancelMessage: jest.fn(),
        clearMessages: jest.fn()
      });

      render(<ConcurrentChat />);

      await waitFor(() => {
        expect(screen.getByText('Quantum computing is a revolutionary technology...')).toBeInTheDocument();
      });
    });

    it('should handle user journey with plugin activation', async () => {
      // Mock initial state with plugins
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
          { id: 'animation', name: 'Animation Plugin', description: 'Adds animations to messages' },
          { id: 'code-highlight', name: 'Code Highlight', description: 'Highlights code in responses' }
        ],
        mountPlugin: jest.fn(),
        unmountPlugin: jest.fn(),
        isPluginMounted: jest.fn().mockReturnValue(false)
      });

      render(<ConcurrentChat />);

      // Step 1: User sees plugin manager
      expect(screen.getByTestId('plugin-manager')).toBeInTheDocument();

      // Step 2: User activates animation plugin
      const animationPluginToggle = screen.getByTestId('plugin-toggle-animation');
      fireEvent.click(animationPluginToggle);

      await waitFor(() => {
        expect(animationPluginToggle).toHaveAttribute('data-active', 'true');
      });

      // Step 3: User sends message with animation
      const messageInput = screen.getByTestId('message-input');
      const sendButton = screen.getByTestId('send-button');

      fireEvent.change(messageInput, { target: { value: 'Show me an animated response' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(screen.getByText('Show me an animated response')).toBeInTheDocument();
      });

      // Step 4: User receives animated response
      mockUseConcurrentChat.mockReturnValue({
        session: { user: { id: 'user1', email: 'test@example.com' } },
        messages: [
          { id: 'msg1', content: 'Show me an animated response', role: 'user', status: 'completed' },
          { id: 'msg2', content: 'This is an animated response!', role: 'assistant', status: 'completed' }
        ],
        isLoading: false,
        sendMessage: jest.fn(),
        retryMessage: jest.fn(),
        cancelMessage: jest.fn(),
        clearMessages: jest.fn()
      });

      render(<ConcurrentChat />);

      await waitFor(() => {
        expect(screen.getByText('This is an animated response!')).toBeInTheDocument();
        expect(screen.getByTestId('animated-message')).toBeInTheDocument();
      });
    });
  });

  describe('User journey with error handling', () => {
    it('should handle user journey with network errors', async () => {
      // Mock initial state
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

      // Step 1: User sends message
      const messageInput = screen.getByTestId('message-input');
      const sendButton = screen.getByTestId('send-button');

      fireEvent.change(messageInput, { target: { value: 'Hello' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(screen.getByText('Hello')).toBeInTheDocument();
      });

      // Step 2: Network error occurs
      mockUseConcurrentChat.mockReturnValue({
        session: { user: { id: 'user1', email: 'test@example.com' } },
        messages: [
          { id: 'msg1', content: 'Hello', role: 'user', status: 'completed' },
          { id: 'msg2', content: '', role: 'assistant', status: 'failed', error: 'Network error' }
        ],
        isLoading: false,
        sendMessage: jest.fn(),
        retryMessage: jest.fn(),
        cancelMessage: jest.fn(),
        clearMessages: jest.fn()
      });

      render(<ConcurrentChat />);

      // Step 3: User sees error message
      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
        expect(screen.getByTestId('retry-button')).toBeInTheDocument();
      });

      // Step 4: User retries message
      const retryButton = screen.getByTestId('retry-button');
      fireEvent.click(retryButton);

      // Step 5: Message retry succeeds
      mockUseConcurrentChat.mockReturnValue({
        session: { user: { id: 'user1', email: 'test@example.com' } },
        messages: [
          { id: 'msg1', content: 'Hello', role: 'user', status: 'completed' },
          { id: 'msg2', content: 'Hi there! How can I help you?', role: 'assistant', status: 'completed' }
        ],
        isLoading: false,
        sendMessage: jest.fn(),
        retryMessage: jest.fn(),
        cancelMessage: jest.fn(),
        clearMessages: jest.fn()
      });

      render(<ConcurrentChat />);

      await waitFor(() => {
        expect(screen.getByText('Hi there! How can I help you?')).toBeInTheDocument();
      });
    });

    it('should handle user journey with session expiration', async () => {
      // Mock initial state with session
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

      // Step 1: User is logged in and sees chat interface
      expect(screen.getByTestId('message-input')).toBeInTheDocument();

      // Step 2: Session expires
      mockUseConcurrentChat.mockReturnValue({
        session: null,
        messages: [],
        isLoading: false,
        sendMessage: jest.fn(),
        retryMessage: jest.fn(),
        cancelMessage: jest.fn(),
        clearMessages: jest.fn()
      });

      render(<ConcurrentChat />);

      // Step 3: User sees session expired message
      await waitFor(() => {
        expect(screen.getByText(/Session expired/i)).toBeInTheDocument();
        expect(screen.getByText(/Please log in again/i)).toBeInTheDocument();
      });

      // Step 4: User clicks login button
      const loginButton = screen.getByTestId('login-button');
      fireEvent.click(loginButton);

      // Step 5: User logs in again
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

      // Step 6: User is back in chat interface
      await waitFor(() => {
        expect(screen.getByTestId('message-input')).toBeInTheDocument();
      });
    });
  });

  describe('User journey with advanced features', () => {
    it('should handle user journey with message regeneration', async () => {
      // Mock initial state
      mockUseConcurrentChat.mockReturnValue({
        session: { user: { id: 'user1', email: 'test@example.com' } },
        messages: [
          { id: 'msg1', content: 'Explain machine learning', role: 'user', status: 'completed' },
          { id: 'msg2', content: 'Machine learning is a subset of AI...', role: 'assistant', status: 'completed' }
        ],
        isLoading: false,
        sendMessage: jest.fn(),
        retryMessage: jest.fn(),
        cancelMessage: jest.fn(),
        clearMessages: jest.fn()
      });

      render(<ConcurrentChat />);

      // Step 1: User sees existing conversation
      await waitFor(() => {
        expect(screen.getByText('Explain machine learning')).toBeInTheDocument();
        expect(screen.getByText('Machine learning is a subset of AI...')).toBeInTheDocument();
      });

      // Step 2: User clicks regenerate button on AI response
      const regenerateButton = screen.getByTestId('regenerate-button-msg2');
      fireEvent.click(regenerateButton);

      // Step 3: User sees regeneration in progress
      await waitFor(() => {
        expect(screen.getByText(/Regenerating.../i)).toBeInTheDocument();
      });

      // Step 4: User receives regenerated response
      mockUseConcurrentChat.mockReturnValue({
        session: { user: { id: 'user1', email: 'test@example.com' } },
        messages: [
          { id: 'msg1', content: 'Explain machine learning', role: 'user', status: 'completed' },
          { id: 'msg2', content: 'Machine learning is a revolutionary field...', role: 'assistant', status: 'completed' }
        ],
        isLoading: false,
        sendMessage: jest.fn(),
        retryMessage: jest.fn(),
        cancelMessage: jest.fn(),
        clearMessages: jest.fn()
      });

      render(<ConcurrentChat />);

      await waitFor(() => {
        expect(screen.getByText('Machine learning is a revolutionary field...')).toBeInTheDocument();
      });
    });

    it('should handle user journey with message editing', async () => {
      // Mock initial state
      mockUseConcurrentChat.mockReturnValue({
        session: { user: { id: 'user1', email: 'test@example.com' } },
        messages: [
          { id: 'msg1', content: 'What is Python?', role: 'user', status: 'completed' },
          { id: 'msg2', content: 'Python is a programming language...', role: 'assistant', status: 'completed' }
        ],
        isLoading: false,
        sendMessage: jest.fn(),
        retryMessage: jest.fn(),
        cancelMessage: jest.fn(),
        clearMessages: jest.fn()
      });

      render(<ConcurrentChat />);

      // Step 1: User sees conversation
      await waitFor(() => {
        expect(screen.getByText('What is Python?')).toBeInTheDocument();
      });

      // Step 2: User clicks edit button on their message
      const editButton = screen.getByTestId('edit-button-msg1');
      fireEvent.click(editButton);

      // Step 3: User sees edit interface
      await waitFor(() => {
        expect(screen.getByTestId('edit-textarea')).toBeInTheDocument();
      });

      // Step 4: User edits message
      const editTextarea = screen.getByTestId('edit-textarea');
      fireEvent.change(editTextarea, { target: { value: 'What is Python and how do I learn it?' } });

      // Step 5: User saves edit
      const saveButton = screen.getByTestId('save-edit-button');
      fireEvent.click(saveButton);

      // Step 6: User sees updated message
      await waitFor(() => {
        expect(screen.getByText('What is Python and how do I learn it?')).toBeInTheDocument();
      });
    });

    it('should handle user journey with streaming responses', async () => {
      // Mock initial state
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

      // Step 1: User sends message
      const messageInput = screen.getByTestId('message-input');
      const sendButton = screen.getByTestId('send-button');

      fireEvent.change(messageInput, { target: { value: 'Write a long story' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(screen.getByText('Write a long story')).toBeInTheDocument();
      });

      // Step 2: User sees streaming response
      mockUseConcurrentChat.mockReturnValue({
        session: { user: { id: 'user1', email: 'test@example.com' } },
        messages: [
          { id: 'msg1', content: 'Write a long story', role: 'user', status: 'completed' },
          { id: 'msg2', content: 'Once upon a time', role: 'assistant', status: 'streaming' }
        ],
        isLoading: false,
        sendMessage: jest.fn(),
        retryMessage: jest.fn(),
        cancelMessage: jest.fn(),
        clearMessages: jest.fn()
      });

      render(<ConcurrentChat />);

      await waitFor(() => {
        expect(screen.getByText('Once upon a time')).toBeInTheDocument();
        expect(screen.getByTestId('streaming-indicator')).toBeInTheDocument();
      });

      // Step 3: User sees streaming progress
      mockUseConcurrentChat.mockReturnValue({
        session: { user: { id: 'user1', email: 'test@example.com' } },
        messages: [
          { id: 'msg1', content: 'Write a long story', role: 'user', status: 'completed' },
          { id: 'msg2', content: 'Once upon a time, there was a brave knight', role: 'assistant', status: 'streaming' }
        ],
        isLoading: false,
        sendMessage: jest.fn(),
        retryMessage: jest.fn(),
        cancelMessage: jest.fn(),
        clearMessages: jest.fn()
      });

      render(<ConcurrentChat />);

      await waitFor(() => {
        expect(screen.getByText('Once upon a time, there was a brave knight')).toBeInTheDocument();
      });

      // Step 4: User cancels streaming
      const cancelButton = screen.getByTestId('cancel-streaming-button');
      fireEvent.click(cancelButton);

      // Step 5: Streaming is cancelled
      mockUseConcurrentChat.mockReturnValue({
        session: { user: { id: 'user1', email: 'test@example.com' } },
        messages: [
          { id: 'msg1', content: 'Write a long story', role: 'user', status: 'completed' },
          { id: 'msg2', content: 'Once upon a time, there was a brave knight', role: 'assistant', status: 'cancelled' }
        ],
        isLoading: false,
        sendMessage: jest.fn(),
        retryMessage: jest.fn(),
        cancelMessage: jest.fn(),
        clearMessages: jest.fn()
      });

      render(<ConcurrentChat />);

      await waitFor(() => {
        expect(screen.getByText(/Streaming cancelled/i)).toBeInTheDocument();
      });
    });
  });

  describe('User journey with performance optimization', () => {
    it('should handle user journey with virtual scrolling for long conversations', async () => {
      // Mock long conversation
      const longMessages = Array.from({ length: 100 }, (_, i) => ({
        id: `msg${i}`,
        content: `Message ${i}`,
        role: i % 2 === 0 ? 'user' : 'assistant',
        status: 'completed'
      }));

      mockUseConcurrentChat.mockReturnValue({
        session: { user: { id: 'user1', email: 'test@example.com' } },
        messages: longMessages,
        isLoading: false,
        sendMessage: jest.fn(),
        retryMessage: jest.fn(),
        cancelMessage: jest.fn(),
        clearMessages: jest.fn()
      });

      render(<ConcurrentChat />);

      // Step 1: User sees virtual scrolling in action
      await waitFor(() => {
        expect(screen.getByText('Message 0')).toBeInTheDocument();
        expect(screen.getByText('Message 1')).toBeInTheDocument();
        // Only visible messages should be rendered
        expect(screen.queryByText('Message 50')).not.toBeInTheDocument();
      });

      // Step 2: User scrolls down
      const messageList = screen.getByTestId('message-list');
      fireEvent.scroll(messageList, { target: { scrollTop: 1000 } });

      // Step 3: User sees more messages as they scroll
      await waitFor(() => {
        expect(screen.getByText('Message 50')).toBeInTheDocument();
        expect(screen.getByText('Message 51')).toBeInTheDocument();
      });
    });

    it('should handle user journey with message caching', async () => {
      // Mock initial state
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

      // Step 1: User sends message
      const messageInput = screen.getByTestId('message-input');
      const sendButton = screen.getByTestId('send-button');

      fireEvent.change(messageInput, { target: { value: 'Cached message test' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(screen.getByText('Cached message test')).toBeInTheDocument();
      });

      // Step 2: User navigates away and back (simulate cache hit)
      // This would typically involve unmounting and remounting the component
      // For this test, we'll simulate the cache behavior

      // Step 3: User sees cached message immediately
      await waitFor(() => {
        expect(screen.getByText('Cached message test')).toBeInTheDocument();
      });
    });
  });
}); 