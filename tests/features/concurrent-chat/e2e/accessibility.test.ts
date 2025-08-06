import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
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

expect.extend(toHaveNoViolations);

describe('Accessibility E2E Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('WCAG 2.1 AA compliance', () => {
    it('should meet WCAG 2.1 AA standards for main chat interface', async () => {
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

      const { container } = render(<ConcurrentChat />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should meet WCAG 2.1 AA standards with messages present', async () => {
      const messages = [
        { id: 'msg1', content: 'Hello, how are you?', role: 'user', status: 'completed' },
        { id: 'msg2', content: 'I am doing well, thank you!', role: 'assistant', status: 'completed' }
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

      const { container } = render(<ConcurrentChat />);

      await waitFor(() => {
        expect(screen.getByText('Hello, how are you?')).toBeInTheDocument();
        expect(screen.getByText('I am doing well, thank you!')).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should meet WCAG 2.1 AA standards with error states', async () => {
      const messages = [
        { id: 'msg1', content: 'Hello', role: 'user', status: 'completed' },
        { id: 'msg2', content: '', role: 'assistant', status: 'failed', error: 'Network error' }
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

      const { container } = render(<ConcurrentChat />);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Keyboard navigation', () => {
    it('should support full keyboard navigation', async () => {
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

      // Test Tab navigation
      const messageInput = screen.getByTestId('message-input');
      const sendButton = screen.getByTestId('send-button');
      const modelSelector = screen.getByTestId('model-selector');

      messageInput.focus();
      expect(messageInput).toHaveFocus();

      // Tab to send button
      fireEvent.keyDown(messageInput, { key: 'Tab' });
      expect(sendButton).toHaveFocus();

      // Tab to model selector
      fireEvent.keyDown(sendButton, { key: 'Tab' });
      expect(modelSelector).toHaveFocus();

      // Shift+Tab back to send button
      fireEvent.keyDown(modelSelector, { key: 'Tab', shiftKey: true });
      expect(sendButton).toHaveFocus();
    });

    it('should support keyboard shortcuts', async () => {
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

      const messageInput = screen.getByTestId('message-input');

      // Test Enter to send message
      fireEvent.change(messageInput, { target: { value: 'Test message' } });
      fireEvent.keyDown(messageInput, { key: 'Enter' });

      expect(sendMessageMock).toHaveBeenCalledWith('Test message');

      // Test Ctrl+Enter for new line
      fireEvent.change(messageInput, { target: { value: 'Line 1\nLine 2' } });
      fireEvent.keyDown(messageInput, { key: 'Enter', ctrlKey: true });

      // Should not send message with Ctrl+Enter
      expect(sendMessageMock).toHaveBeenCalledTimes(1);
    });

    it('should support keyboard navigation in message list', async () => {
      const messages = [
        { id: 'msg1', content: 'Message 1', role: 'user', status: 'completed' },
        { id: 'msg2', content: 'Message 2', role: 'assistant', status: 'completed' },
        { id: 'msg3', content: 'Message 3', role: 'user', status: 'completed' }
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

      const messageList = screen.getByTestId('message-list');
      const firstMessage = screen.getByTestId('message-msg1');
      const secondMessage = screen.getByTestId('message-msg2');

      // Focus first message
      firstMessage.focus();
      expect(firstMessage).toHaveFocus();

      // Arrow down to next message
      fireEvent.keyDown(firstMessage, { key: 'ArrowDown' });
      expect(secondMessage).toHaveFocus();

      // Arrow up back to first message
      fireEvent.keyDown(secondMessage, { key: 'ArrowUp' });
      expect(firstMessage).toHaveFocus();
    });
  });

  describe('Screen reader support', () => {
    it('should provide proper ARIA labels and descriptions', async () => {
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

      // Check ARIA labels
      const messageInput = screen.getByTestId('message-input');
      expect(messageInput).toHaveAttribute('aria-label', 'Type your message');

      const sendButton = screen.getByTestId('send-button');
      expect(sendButton).toHaveAttribute('aria-label', 'Send message');

      const modelSelector = screen.getByTestId('model-selector');
      expect(modelSelector).toHaveAttribute('aria-label', 'Select AI model');
    });

    it('should announce message status changes', async () => {
      const messages = [
        { id: 'msg1', content: 'Hello', role: 'user', status: 'completed' },
        { id: 'msg2', content: '', role: 'assistant', status: 'processing' }
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

      // Check for status announcements
      const processingMessage = screen.getByTestId('message-msg2');
      expect(processingMessage).toHaveAttribute('aria-live', 'polite');
      expect(processingMessage).toHaveAttribute('aria-label', 'Assistant is typing...');
    });

    it('should provide proper heading structure', async () => {
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

      // Check heading structure
      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent('AI Chat Assistant');

      const sectionHeading = screen.getByRole('heading', { level: 2 });
      expect(sectionHeading).toHaveTextContent('Conversation');
    });
  });

  describe('Color contrast and visual accessibility', () => {
    it('should maintain proper color contrast ratios', async () => {
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

      const { container } = render(<ConcurrentChat />);

      // Test color contrast with axe
      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true }
        }
      });

      expect(results).toHaveNoViolations();
    });

    it('should support high contrast mode', async () => {
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

      // Simulate high contrast mode
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-contrast: high)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      const { container } = render(<ConcurrentChat />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Focus management', () => {
    it('should manage focus properly during message sending', async () => {
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

      const messageInput = screen.getByTestId('message-input');
      const sendButton = screen.getByTestId('send-button');

      // Focus input and send message
      messageInput.focus();
      fireEvent.change(messageInput, { target: { value: 'Test message' } });
      fireEvent.click(sendButton);

      // Focus should return to input after sending
      await waitFor(() => {
        expect(messageInput).toHaveFocus();
      });
    });

    it('should manage focus during error states', async () => {
      const messages = [
        { id: 'msg1', content: 'Hello', role: 'user', status: 'completed' },
        { id: 'msg2', content: '', role: 'assistant', status: 'failed', error: 'Network error' }
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

      const retryButton = screen.getByTestId('retry-button');

      // Focus should be on retry button when error occurs
      await waitFor(() => {
        expect(retryButton).toHaveFocus();
      });
    });

    it('should manage focus during loading states', async () => {
      const messages = [
        { id: 'msg1', content: 'Hello', role: 'user', status: 'completed' },
        { id: 'msg2', content: '', role: 'assistant', status: 'processing' }
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

      const cancelButton = screen.getByTestId('cancel-button');

      // Focus should be on cancel button during processing
      await waitFor(() => {
        expect(cancelButton).toHaveFocus();
      });
    });
  });

  describe('Alternative text and descriptions', () => {
    it('should provide alternative text for images and icons', async () => {
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

      // Check for alt text on images and icons
      const sendIcon = screen.getByTestId('send-icon');
      expect(sendIcon).toHaveAttribute('alt', 'Send message');

      const modelIcon = screen.getByTestId('model-icon');
      expect(modelIcon).toHaveAttribute('alt', 'AI model selection');

      const settingsIcon = screen.getByTestId('settings-icon');
      expect(settingsIcon).toHaveAttribute('alt', 'Settings');
    });

    it('should provide descriptions for complex UI elements', async () => {
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

      // Check for descriptions
      const messageInput = screen.getByTestId('message-input');
      expect(messageInput).toHaveAttribute('aria-describedby', 'message-input-help');

      const helpText = screen.getByTestId('message-input-help');
      expect(helpText).toHaveTextContent('Type your message and press Enter to send, or Ctrl+Enter for a new line');
    });
  });

  describe('Reduced motion support', () => {
    it('should respect reduced motion preferences', async () => {
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

      // Simulate reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      const { container } = render(<ConcurrentChat />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
}); 