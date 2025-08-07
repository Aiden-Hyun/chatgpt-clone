import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RegenerateButton } from '../../../../../../src/features/concurrent-chat/features/regeneration/components/RegenerateButton';
import { useMessageRegeneration } from '../../../../../../src/features/concurrent-chat/features/regeneration/useMessageRegeneration';
import { EventBus } from '../../../../../../src/features/concurrent-chat/core/events/EventBus';
import { ServiceContainer } from '../../../../../../src/features/concurrent-chat/core/container/ServiceContainer';

// Mock the regeneration hook
jest.mock('../../../../../../src/features/concurrent-chat/features/regeneration/useMessageRegeneration');

const mockUseMessageRegeneration = useMessageRegeneration as jest.MockedFunction<typeof useMessageRegeneration>;

describe('RegenerateButton', () => {
  const mockEventBus = new EventBus();
  const mockServiceContainer = new ServiceContainer();

  const mockRegenerationHookReturn = {
    isInitialized: true,
    isLoading: false,
    error: null,
    regenerateMessage: jest.fn(),
    canRegenerate: jest.fn(() => true),
    getRegenerationHistory: jest.fn(() => []),
    clearRegenerationHistory: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMessageRegeneration.mockReturnValue(mockRegenerationHookReturn);
  });

  describe('Basic rendering', () => {
    it('should render regenerate button', () => {
      render(
        <RegenerateButton
          messageId="msg1"
          originalContent="Original message content"
          eventBus={mockEventBus}
          serviceContainer={mockServiceContainer}
        />
      );

      expect(screen.getByText('🔄 Regenerate')).toBeInTheDocument();
    });

    it('should handle regenerate button click', async () => {
      const onRegenerationStart = jest.fn();
      const onRegenerationComplete = jest.fn();
      
      render(
        <RegenerateButton
          messageId="msg1"
          originalContent="Original message content"
          eventBus={mockEventBus}
          serviceContainer={mockServiceContainer}
          onRegenerationStart={onRegenerationStart}
          onRegenerationComplete={onRegenerationComplete}
        />
      );

      const regenerateButton = screen.getByText('🔄 Regenerate');
      fireEvent.press(regenerateButton);

      await waitFor(() => {
        expect(mockRegenerationHookReturn.regenerateMessage).toHaveBeenCalledWith('msg1', 'Original message content');
        expect(onRegenerationStart).toHaveBeenCalled();
      });
    });

    it('should show regenerating state when loading', () => {
      mockUseMessageRegeneration.mockReturnValue({
        ...mockRegenerationHookReturn,
        isLoading: true,
      });

      render(
        <RegenerateButton
          messageId="msg1"
          originalContent="Original message content"
          eventBus={mockEventBus}
          serviceContainer={mockServiceContainer}
        />
      );

      expect(screen.getByText('🔄 Regenerating...')).toBeInTheDocument();
      expect(screen.getByText('Generating new response...')).toBeInTheDocument();
    });

    it('should disable button when loading', () => {
      mockUseMessageRegeneration.mockReturnValue({
        ...mockRegenerationHookReturn,
        isLoading: true,
      });

      render(
        <RegenerateButton
          messageId="msg1"
          originalContent="Original message content"
          eventBus={mockEventBus}
          serviceContainer={mockServiceContainer}
        />
      );

      const regenerateButton = screen.getByText('🔄 Regenerating...');
      expect(regenerateButton).toBeDisabled();
    });

    it('should show retry button when there is an error', () => {
      mockUseMessageRegeneration.mockReturnValue({
        ...mockRegenerationHookReturn,
        error: 'Regeneration failed',
      });

      render(
        <RegenerateButton
          messageId="msg1"
          originalContent="Original message content"
          eventBus={mockEventBus}
          serviceContainer={mockServiceContainer}
        />
      );

      expect(screen.getByText('⚠️ Retry')).toBeInTheDocument();
    });
  });

  describe('Button variants and sizes', () => {
    it('should render with different variants', () => {
      const { rerender } = render(
        <RegenerateButton
          messageId="msg1"
          originalContent="Original message content"
          eventBus={mockEventBus}
          serviceContainer={mockServiceContainer}
          variant="primary"
        />
      );

      expect(screen.getByText('🔄 Regenerate')).toBeInTheDocument();

      rerender(
        <RegenerateButton
          messageId="msg1"
          originalContent="Original message content"
          eventBus={mockEventBus}
          serviceContainer={mockServiceContainer}
          variant="secondary"
        />
      );

      expect(screen.getByText('🔄 Regenerate')).toBeInTheDocument();

      rerender(
        <RegenerateButton
          messageId="msg1"
          originalContent="Original message content"
          eventBus={mockEventBus}
          serviceContainer={mockServiceContainer}
          variant="outline"
        />
      );

      expect(screen.getByText('🔄 Regenerate')).toBeInTheDocument();
    });

    it('should render with different sizes', () => {
      const { rerender } = render(
        <RegenerateButton
          messageId="msg1"
          originalContent="Original message content"
          eventBus={mockEventBus}
          serviceContainer={mockServiceContainer}
          size="small"
        />
      );

      expect(screen.getByText('🔄 Regenerate')).toBeInTheDocument();

      rerender(
        <RegenerateButton
          messageId="msg1"
          originalContent="Original message content"
          eventBus={mockEventBus}
          serviceContainer={mockServiceContainer}
          size="medium"
        />
      );

      expect(screen.getByText('🔄 Regenerate')).toBeInTheDocument();

      rerender(
        <RegenerateButton
          messageId="msg1"
          originalContent="Original message content"
          eventBus={mockEventBus}
          serviceContainer={mockServiceContainer}
          size="large"
        />
      );

      expect(screen.getByText('🔄 Regenerate')).toBeInTheDocument();
    });
  });

  describe('Error handling', () => {
    it('should display regeneration error', () => {
      mockUseMessageRegeneration.mockReturnValue({
        ...mockRegenerationHookReturn,
        error: 'Regeneration service failed',
      });

      render(
        <RegenerateButton
          messageId="msg1"
          originalContent="Original message content"
          eventBus={mockEventBus}
          serviceContainer={mockServiceContainer}
        />
      );

      expect(screen.getByText('Regeneration service failed')).toBeInTheDocument();
    });

    it('should call onRegenerationError when regeneration fails', async () => {
      const onRegenerationError = jest.fn();
      mockRegenerationHookReturn.regenerateMessage.mockRejectedValue(new Error('Regeneration failed'));

      render(
        <RegenerateButton
          messageId="msg1"
          originalContent="Original message content"
          eventBus={mockEventBus}
          serviceContainer={mockServiceContainer}
          onRegenerationError={onRegenerationError}
        />
      );

      const regenerateButton = screen.getByText('🔄 Regenerate');
      fireEvent.press(regenerateButton);

      await waitFor(() => {
        expect(onRegenerationError).toHaveBeenCalledWith('Regeneration failed');
      });
    });
  });

  describe('Callback handling', () => {
    it('should call onRegenerationComplete when regeneration succeeds', async () => {
      const onRegenerationComplete = jest.fn();
      mockRegenerationHookReturn.regenerateMessage.mockResolvedValue('New regenerated content');

      render(
        <RegenerateButton
          messageId="msg1"
          originalContent="Original message content"
          eventBus={mockEventBus}
          serviceContainer={mockServiceContainer}
          onRegenerationComplete={onRegenerationComplete}
        />
      );

      const regenerateButton = screen.getByText('🔄 Regenerate');
      fireEvent.press(regenerateButton);

      await waitFor(() => {
        expect(onRegenerationComplete).toHaveBeenCalledWith('New regenerated content');
      });
    });

    it('should call onRegenerationStart when regeneration begins', async () => {
      const onRegenerationStart = jest.fn();

      render(
        <RegenerateButton
          messageId="msg1"
          originalContent="Original message content"
          eventBus={mockEventBus}
          serviceContainer={mockServiceContainer}
          onRegenerationStart={onRegenerationStart}
        />
      );

      const regenerateButton = screen.getByText('🔄 Regenerate');
      fireEvent.press(regenerateButton);

      await waitFor(() => {
        expect(onRegenerationStart).toHaveBeenCalled();
      });
    });
  });

  describe('Disabled state', () => {
    it('should be disabled when disabled prop is true', () => {
      render(
        <RegenerateButton
          messageId="msg1"
          originalContent="Original message content"
          eventBus={mockEventBus}
          serviceContainer={mockServiceContainer}
          disabled={true}
        />
      );

      const regenerateButton = screen.getByText('🔄 Regenerate');
      expect(regenerateButton).toBeDisabled();
    });

    it('should be disabled when cannot regenerate', () => {
      mockUseMessageRegeneration.mockReturnValue({
        ...mockRegenerationHookReturn,
        canRegenerate: jest.fn(() => false),
      });

      render(
        <RegenerateButton
          messageId="msg1"
          originalContent="Original message content"
          eventBus={mockEventBus}
          serviceContainer={mockServiceContainer}
        />
      );

      const regenerateButton = screen.getByText('🔄 Regenerate');
      expect(regenerateButton).toBeDisabled();
    });

    it('should be disabled when not initialized', () => {
      mockUseMessageRegeneration.mockReturnValue({
        ...mockRegenerationHookReturn,
        isInitialized: false,
      });

      render(
        <RegenerateButton
          messageId="msg1"
          originalContent="Original message content"
          eventBus={mockEventBus}
          serviceContainer={mockServiceContainer}
        />
      );

      const regenerateButton = screen.getByText('🔄 Regenerate');
      expect(regenerateButton).toBeDisabled();
    });
  });

  describe('Debug information', () => {
    it('should show debug info in development mode', () => {
      const originalDev = global.__DEV__;
      global.__DEV__ = true;

      render(
        <RegenerateButton
          messageId="msg1"
          originalContent="Original message content"
          eventBus={mockEventBus}
          serviceContainer={mockServiceContainer}
        />
      );

      expect(screen.getByText(/ID: msg1/)).toBeInTheDocument();
      expect(screen.getByText(/Can Regenerate: true/)).toBeInTheDocument();
      expect(screen.getByText(/History: 0/)).toBeInTheDocument();
      expect(screen.getByText(/Initialized: true/)).toBeInTheDocument();

      global.__DEV__ = originalDev;
    });

    it('should not show debug info in production mode', () => {
      const originalDev = global.__DEV__;
      global.__DEV__ = false;

      render(
        <RegenerateButton
          messageId="msg1"
          originalContent="Original message content"
          eventBus={mockEventBus}
          serviceContainer={mockServiceContainer}
        />
      );

      expect(screen.queryByText(/ID: msg1/)).not.toBeInTheDocument();

      global.__DEV__ = originalDev;
    });
  });

  describe('SOLID Principles Compliance', () => {
    it('should follow Single Responsibility Principle', () => {
      render(
        <RegenerateButton
          messageId="msg1"
          originalContent="Original message content"
          eventBus={mockEventBus}
          serviceContainer={mockServiceContainer}
        />
      );

      // Component should only handle regeneration functionality
      expect(screen.getByText('🔄 Regenerate')).toBeInTheDocument();
    });

    it('should follow Dependency Inversion Principle', () => {
      render(
        <RegenerateButton
          messageId="msg1"
          originalContent="Original message content"
          eventBus={mockEventBus}
          serviceContainer={mockServiceContainer}
        />
      );

      // Should depend on abstractions (hooks) not concretions
      expect(mockUseMessageRegeneration).toHaveBeenCalledWith(mockEventBus, mockServiceContainer);
    });
  });
}); 