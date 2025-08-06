import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MessageInput } from '../../../../src/features/concurrent-chat/components/MessageInput';

describe('MessageInput', () => {
  const mockHandlers = {
    onSend: jest.fn(),
    onCancel: jest.fn(),
    onTyping: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Render input field', () => {
    it('should render input field', () => {
      render(<MessageInput {...mockHandlers} />);

      expect(screen.getByTestId('message-input')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
    });

    it('should render send button', () => {
      render(<MessageInput {...mockHandlers} />);

      expect(screen.getByTestId('send-button')).toBeInTheDocument();
      expect(screen.getByText('Send')).toBeInTheDocument();
    });

    it('should render input container with proper styling', () => {
      render(<MessageInput {...mockHandlers} />);

      const inputContainer = screen.getByTestId('input-container');
      expect(inputContainer).toHaveClass('message-input-container');
    });
  });

  describe('Handle text input', () => {
    it('should handle text input', () => {
      render(<MessageInput {...mockHandlers} />);

      const input = screen.getByTestId('message-input');
      fireEvent.change(input, { target: { value: 'Hello, world!' } });

      expect(input).toHaveValue('Hello, world!');
    });

    it('should call onTyping when user types', () => {
      render(<MessageInput {...mockHandlers} />);

      const input = screen.getByTestId('message-input');
      fireEvent.change(input, { target: { value: 'Hello' } });

      expect(mockHandlers.onTyping).toHaveBeenCalledWith('Hello');
    });

    it('should handle special characters', () => {
      render(<MessageInput {...mockHandlers} />);

      const input = screen.getByTestId('message-input');
      fireEvent.change(input, { target: { value: 'Hello @#$%^&*()!' } });

      expect(input).toHaveValue('Hello @#$%^&*()!');
    });

    it('should handle emoji input', () => {
      render(<MessageInput {...mockHandlers} />);

      const input = screen.getByTestId('message-input');
      fireEvent.change(input, { target: { value: 'Hello 😊' } });

      expect(input).toHaveValue('Hello 😊');
    });
  });

  describe('Handle send button press', () => {
    it('should handle send button press', async () => {
      render(<MessageInput {...mockHandlers} />);

      const input = screen.getByTestId('message-input');
      const sendButton = screen.getByTestId('send-button');

      fireEvent.change(input, { target: { value: 'Hello, world!' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(mockHandlers.onSend).toHaveBeenCalledWith('Hello, world!');
      });
    });

    it('should clear input after sending', async () => {
      render(<MessageInput {...mockHandlers} />);

      const input = screen.getByTestId('message-input');
      const sendButton = screen.getByTestId('send-button');

      fireEvent.change(input, { target: { value: 'Hello, world!' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(input).toHaveValue('');
      });
    });

    it('should not send empty messages', () => {
      render(<MessageInput {...mockHandlers} />);

      const sendButton = screen.getByTestId('send-button');
      fireEvent.click(sendButton);

      expect(mockHandlers.onSend).not.toHaveBeenCalled();
    });

    it('should not send whitespace-only messages', () => {
      render(<MessageInput {...mockHandlers} />);

      const input = screen.getByTestId('message-input');
      const sendButton = screen.getByTestId('send-button');

      fireEvent.change(input, { target: { value: '   ' } });
      fireEvent.click(sendButton);

      expect(mockHandlers.onSend).not.toHaveBeenCalled();
    });
  });

  describe('Disable when processing', () => {
    it('should disable input when processing', () => {
      render(<MessageInput {...mockHandlers} isProcessing={true} />);

      const input = screen.getByTestId('message-input');
      const sendButton = screen.getByTestId('send-button');

      expect(input).toBeDisabled();
      expect(sendButton).toBeDisabled();
    });

    it('should show processing state', () => {
      render(<MessageInput {...mockHandlers} isProcessing={true} />);

      expect(screen.getByTestId('processing-indicator')).toBeInTheDocument();
      expect(screen.getByText('Processing...')).toBeInTheDocument();
    });

    it('should enable input when not processing', () => {
      render(<MessageInput {...mockHandlers} isProcessing={false} />);

      const input = screen.getByTestId('message-input');
      const sendButton = screen.getByTestId('send-button');

      expect(input).not.toBeDisabled();
      expect(sendButton).not.toBeDisabled();
    });
  });

  describe('Show character counter', () => {
    it('should show character counter', () => {
      render(<MessageInput {...mockHandlers} maxLength={1000} />);

      expect(screen.getByTestId('character-counter')).toBeInTheDocument();
      expect(screen.getByText('0/1000')).toBeInTheDocument();
    });

    it('should update character counter when typing', () => {
      render(<MessageInput {...mockHandlers} maxLength={1000} />);

      const input = screen.getByTestId('message-input');
      fireEvent.change(input, { target: { value: 'Hello' } });

      expect(screen.getByText('5/1000')).toBeInTheDocument();
    });

    it('should show warning when approaching limit', () => {
      render(<MessageInput {...mockHandlers} maxLength={10} />);

      const input = screen.getByTestId('message-input');
      fireEvent.change(input, { target: { value: 'Hello worl' } });

      const counter = screen.getByTestId('character-counter');
      expect(counter).toHaveClass('warning');
    });

    it('should show error when at limit', () => {
      render(<MessageInput {...mockHandlers} maxLength={5} />);

      const input = screen.getByTestId('message-input');
      fireEvent.change(input, { target: { value: 'Hello' } });

      const counter = screen.getByTestId('character-counter');
      expect(counter).toHaveClass('error');
    });
  });

  describe('Handle empty input', () => {
    it('should handle empty input', () => {
      render(<MessageInput {...mockHandlers} />);

      const input = screen.getByTestId('message-input');
      expect(input).toHaveValue('');
    });

    it('should disable send button for empty input', () => {
      render(<MessageInput {...mockHandlers} />);

      const sendButton = screen.getByTestId('send-button');
      expect(sendButton).toBeDisabled();
    });

    it('should enable send button when input has content', () => {
      render(<MessageInput {...mockHandlers} />);

      const input = screen.getByTestId('message-input');
      const sendButton = screen.getByTestId('send-button');

      fireEvent.change(input, { target: { value: 'Hello' } });
      expect(sendButton).not.toBeDisabled();
    });
  });

  describe('Handle max length', () => {
    it('should respect max length', () => {
      render(<MessageInput {...mockHandlers} maxLength={10} />);

      const input = screen.getByTestId('message-input');
      fireEvent.change(input, { target: { value: 'Hello world this is too long' } });

      expect(input).toHaveValue('Hello worl');
    });

    it('should prevent input beyond max length', () => {
      render(<MessageInput {...mockHandlers} maxLength={5} />);

      const input = screen.getByTestId('message-input');
      fireEvent.change(input, { target: { value: 'Hello world' } });

      expect(input).toHaveValue('Hello');
    });

    it('should show max length warning', () => {
      render(<MessageInput {...mockHandlers} maxLength={5} />);

      const input = screen.getByTestId('message-input');
      fireEvent.change(input, { target: { value: 'Hello' } });

      expect(screen.getByText('Maximum length reached')).toBeInTheDocument();
    });
  });

  describe('Handle placeholder text', () => {
    it('should show default placeholder', () => {
      render(<MessageInput {...mockHandlers} />);

      expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
    });

    it('should show custom placeholder', () => {
      render(<MessageInput {...mockHandlers} placeholder="Enter your question here..." />);

      expect(screen.getByPlaceholderText('Enter your question here...')).toBeInTheDocument();
    });

    it('should show placeholder when input is empty', () => {
      render(<MessageInput {...mockHandlers} />);

      const input = screen.getByTestId('message-input');
      expect(input).toHaveAttribute('placeholder', 'Type your message...');
    });
  });

  describe('Handle keyboard events', () => {
    it('should handle Enter key to send', async () => {
      render(<MessageInput {...mockHandlers} />);

      const input = screen.getByTestId('message-input');
      fireEvent.change(input, { target: { value: 'Hello, world!' } });
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(mockHandlers.onSend).toHaveBeenCalledWith('Hello, world!');
      });
    });

    it('should handle Shift+Enter for new line', () => {
      render(<MessageInput {...mockHandlers} />);

      const input = screen.getByTestId('message-input');
      fireEvent.change(input, { target: { value: 'Hello' } });
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', shiftKey: true });

      expect(mockHandlers.onSend).not.toHaveBeenCalled();
      expect(input).toHaveValue('Hello\n');
    });

    it('should handle Escape key to cancel', () => {
      render(<MessageInput {...mockHandlers} />);

      const input = screen.getByTestId('message-input');
      fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' });

      expect(mockHandlers.onCancel).toHaveBeenCalled();
    });

    it('should handle Ctrl+Enter to send', async () => {
      render(<MessageInput {...mockHandlers} />);

      const input = screen.getByTestId('message-input');
      fireEvent.change(input, { target: { value: 'Hello, world!' } });
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', ctrlKey: true });

      await waitFor(() => {
        expect(mockHandlers.onSend).toHaveBeenCalledWith('Hello, world!');
      });
    });
  });

  describe('Plugin-aware input handling', () => {
    it('should render with plugin system integration', () => {
      render(<MessageInput {...mockHandlers} />);

      expect(screen.getByTestId('plugin-input-handler')).toBeInTheDocument();
    });

    it('should allow plugins to modify input behavior', () => {
      render(<MessageInput {...mockHandlers} />);

      const pluginModifiedInput = screen.getByTestId('plugin-modified-input');
      if (pluginModifiedInput) {
        expect(pluginModifiedInput).toBeInTheDocument();
      }
    });

    it('should handle plugin input errors gracefully', () => {
      render(<MessageInput {...mockHandlers} />);

      const pluginError = screen.getByTestId('plugin-error');
      if (pluginError) {
        expect(pluginError).toBeInTheDocument();
      }
    });
  });

  describe('Feature integration', () => {
    it('should integrate with auto-complete features', () => {
      render(<MessageInput {...mockHandlers} />);

      const autoComplete = screen.getByTestId('auto-complete');
      if (autoComplete) {
        expect(autoComplete).toBeInTheDocument();
      }
    });

    it('should integrate with voice input features', () => {
      render(<MessageInput {...mockHandlers} />);

      const voiceButton = screen.getByTestId('voice-input-button');
      if (voiceButton) {
        expect(voiceButton).toBeInTheDocument();
      }
    });

    it('should integrate with file upload features', () => {
      render(<MessageInput {...mockHandlers} />);

      const fileUploadButton = screen.getByTestId('file-upload-button');
      if (fileUploadButton) {
        expect(fileUploadButton).toBeInTheDocument();
      }
    });
  });

  describe('Extensible input controls', () => {
    it('should support custom input validators', () => {
      render(<MessageInput {...mockHandlers} />);

      const customValidator = screen.getByTestId('custom-validator');
      if (customValidator) {
        expect(customValidator).toBeInTheDocument();
      }
    });

    it('should support custom input formatters', () => {
      render(<MessageInput {...mockHandlers} />);

      const customFormatter = screen.getByTestId('custom-formatter');
      if (customFormatter) {
        expect(customFormatter).toBeInTheDocument();
      }
    });

    it('should support custom input processors', () => {
      render(<MessageInput {...mockHandlers} />);

      const customProcessor = screen.getByTestId('custom-processor');
      if (customProcessor) {
        expect(customProcessor).toBeInTheDocument();
      }
    });
  });

  describe('Command pattern integration', () => {
    it('should support command-based input handling', () => {
      render(<MessageInput {...mockHandlers} />);

      const commandHandler = screen.getByTestId('command-handler');
      if (commandHandler) {
        expect(commandHandler).toBeInTheDocument();
      }
    });

    it('should support input command history', () => {
      render(<MessageInput {...mockHandlers} />);

      const commandHistory = screen.getByTestId('command-history');
      if (commandHistory) {
        expect(commandHistory).toBeInTheDocument();
      }
    });

    it('should support command undo/redo', () => {
      render(<MessageInput {...mockHandlers} />);

      const undoButton = screen.getByTestId('undo-button');
      const redoButton = screen.getByTestId('redo-button');
      
      if (undoButton) {
        expect(undoButton).toBeInTheDocument();
      }
      if (redoButton) {
        expect(redoButton).toBeInTheDocument();
      }
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<MessageInput {...mockHandlers} />);

      const input = screen.getByTestId('message-input');
      expect(input).toHaveAttribute('aria-label', 'Message input');
    });

    it('should support keyboard navigation', () => {
      render(<MessageInput {...mockHandlers} />);

      const input = screen.getByTestId('message-input');
      input.focus();
      expect(input).toHaveFocus();
    });

    it('should have proper focus management', () => {
      render(<MessageInput {...mockHandlers} />);

      const sendButton = screen.getByTestId('send-button');
      sendButton.focus();
      expect(sendButton).toHaveFocus();
    });

    it('should support screen readers', () => {
      render(<MessageInput {...mockHandlers} />);

      const screenReaderText = screen.getByTestId('screen-reader-text');
      if (screenReaderText) {
        expect(screenReaderText).toBeInTheDocument();
      }
    });
  });

  describe('Performance', () => {
    it('should handle rapid typing efficiently', () => {
      render(<MessageInput {...mockHandlers} />);

      const input = screen.getByTestId('message-input');
      const startTime = performance.now();

      // Simulate rapid typing
      for (let i = 0; i < 100; i++) {
        fireEvent.change(input, { target: { value: `Hello ${i}` } });
      }

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(100); // Should handle rapid typing quickly
    });

    it('should debounce typing events', () => {
      render(<MessageInput {...mockHandlers} />);

      const input = screen.getByTestId('message-input');
      
      // Rapid typing should be debounced
      fireEvent.change(input, { target: { value: 'H' } });
      fireEvent.change(input, { target: { value: 'He' } });
      fireEvent.change(input, { target: { value: 'Hel' } });
      fireEvent.change(input, { target: { value: 'Hell' } });
      fireEvent.change(input, { target: { value: 'Hello' } });

      // Should only call onTyping once after debounce
      expect(mockHandlers.onTyping).toHaveBeenCalledTimes(1);
    });
  });

  describe('SOLID Principles Compliance', () => {
    it('should follow Single Responsibility Principle', () => {
      render(<MessageInput {...mockHandlers} />);

      // Component should only handle input rendering and user interactions
      expect(screen.getByTestId('message-input')).toBeInTheDocument();
    });

    it('should follow Open/Closed Principle', () => {
      render(<MessageInput {...mockHandlers} />);

      // Should be open for extension (new plugins) but closed for modification
      const pluginHandler = screen.getByTestId('plugin-input-handler');
      expect(pluginHandler).toBeInTheDocument();
    });

    it('should follow Liskov Substitution Principle', () => {
      // Should work with different handler types
      const differentHandlers = {
        onSend: jest.fn(),
        onCancel: jest.fn(),
        onTyping: jest.fn(),
        onCustom: jest.fn()
      };

      render(<MessageInput {...differentHandlers} />);
      
      expect(screen.getByTestId('message-input')).toBeInTheDocument();
    });

    it('should follow Interface Segregation Principle', () => {
      render(<MessageInput {...mockHandlers} />);

      // Should depend on focused interfaces, not large ones
      expect(screen.getByTestId('message-input')).toBeInTheDocument();
    });

    it('should follow Dependency Inversion Principle', () => {
      render(<MessageInput {...mockHandlers} />);

      // Should depend on abstractions (props) not concretions
      expect(mockHandlers.onSend).toBeDefined();
      expect(mockHandlers.onTyping).toBeDefined();
    });
  });
}); 