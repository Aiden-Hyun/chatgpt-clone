import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AnimatedMessage } from '../../../../../../src/features/concurrent-chat/features/animation/components/AnimatedMessage';
import { useMessageAnimation } from '../../../../../../src/features/concurrent-chat/features/animation/useMessageAnimation';
import { EventBus } from '../../../../../../src/features/concurrent-chat/core/events/EventBus';
import { ServiceContainer } from '../../../../../../src/features/concurrent-chat/core/container/ServiceContainer';

// Mock the animation hook
jest.mock('../../../../../../src/features/concurrent-chat/features/animation/useMessageAnimation');

const mockUseMessageAnimation = useMessageAnimation as jest.MockedFunction<typeof useMessageAnimation>;

describe('AnimatedMessage', () => {
  const mockEventBus = new EventBus();
  const mockServiceContainer = new ServiceContainer();

  const mockAnimationHookReturn = {
    isInitialized: true,
    isLoading: false,
    error: null,
    animateMessage: jest.fn(),
    registerAnimationElement: jest.fn(),
    unregisterAnimationElement: jest.fn(),
    availableStrategies: ['typewriter', 'fadeIn'],
    defaultStrategy: 'typewriter',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMessageAnimation.mockReturnValue(mockAnimationHookReturn);
  });

  describe('Basic rendering', () => {
    it('should render animated message with user role', () => {
      render(
        <AnimatedMessage
          messageId="msg1"
          content="Hello, this is a user message"
          role="user"
          status="completed"
          eventBus={mockEventBus}
          serviceContainer={mockServiceContainer}
        />
      );

      expect(screen.getByText('Hello, this is a user message')).toBeInTheDocument();
    });

    it('should render animated message with assistant role', () => {
      render(
        <AnimatedMessage
          messageId="msg2"
          content="This is an assistant response"
          role="assistant"
          status="completed"
          eventBus={mockEventBus}
          serviceContainer={mockServiceContainer}
        />
      );

      expect(screen.getByText('This is an assistant response')).toBeInTheDocument();
    });

    it('should display pending status correctly', () => {
      render(
        <AnimatedMessage
          messageId="msg3"
          content="Pending message"
          role="user"
          status="pending"
          eventBus={mockEventBus}
          serviceContainer={mockServiceContainer}
        />
      );

      expect(screen.getByText('⏳ Preparing...')).toBeInTheDocument();
    });

    it('should display processing status correctly', () => {
      render(
        <AnimatedMessage
          messageId="msg4"
          content="Processing message"
          role="assistant"
          status="processing"
          eventBus={mockEventBus}
          serviceContainer={mockServiceContainer}
        />
      );

      expect(screen.getByText('🤖 Thinking...')).toBeInTheDocument();
    });

    it('should display failed status correctly', () => {
      render(
        <AnimatedMessage
          messageId="msg5"
          content="Failed message"
          role="user"
          status="failed"
          eventBus={mockEventBus}
          serviceContainer={mockServiceContainer}
        />
      );

      expect(screen.getByText('❌ Failed to send message')).toBeInTheDocument();
    });
  });

  describe('Animation integration', () => {
    it('should register animation element on mount', () => {
      render(
        <AnimatedMessage
          messageId="msg6"
          content="Test message"
          role="assistant"
          status="completed"
          eventBus={mockEventBus}
          serviceContainer={mockServiceContainer}
        />
      );

      expect(mockAnimationHookReturn.registerAnimationElement).toHaveBeenCalledWith('msg6', expect.anything());
    });

    it('should unregister animation element on unmount', () => {
      const { unmount } = render(
        <AnimatedMessage
          messageId="msg7"
          content="Test message"
          role="assistant"
          status="completed"
          eventBus={mockEventBus}
          serviceContainer={mockServiceContainer}
        />
      );

      unmount();

      expect(mockAnimationHookReturn.unregisterAnimationElement).toHaveBeenCalledWith('msg7');
    });

    it('should start animation when status becomes completed', async () => {
      render(
        <AnimatedMessage
          messageId="msg8"
          content="Test message"
          role="assistant"
          status="completed"
          eventBus={mockEventBus}
          serviceContainer={mockServiceContainer}
        />
      );

      await waitFor(() => {
        expect(mockAnimationHookReturn.animateMessage).toHaveBeenCalledWith('msg8', 'Test message', 'typewriter');
      });
    });

    it('should use fadeIn strategy for user messages', async () => {
      render(
        <AnimatedMessage
          messageId="msg9"
          content="User message"
          role="user"
          status="completed"
          eventBus={mockEventBus}
          serviceContainer={mockServiceContainer}
        />
      );

      await waitFor(() => {
        expect(mockAnimationHookReturn.animateMessage).toHaveBeenCalledWith('msg9', 'User message', 'fadeIn');
      });
    });
  });

  describe('Animation callbacks', () => {
    it('should call onAnimationStart when animation begins', async () => {
      const onAnimationStart = jest.fn();
      
      render(
        <AnimatedMessage
          messageId="msg10"
          content="Test message"
          role="assistant"
          status="completed"
          eventBus={mockEventBus}
          serviceContainer={mockServiceContainer}
          onAnimationStart={onAnimationStart}
        />
      );

      await waitFor(() => {
        expect(onAnimationStart).toHaveBeenCalled();
      });
    });

    it('should call onAnimationComplete when animation finishes', async () => {
      const onAnimationComplete = jest.fn();
      
      render(
        <AnimatedMessage
          messageId="msg11"
          content="Test message"
          role="assistant"
          status="completed"
          eventBus={mockEventBus}
          serviceContainer={mockServiceContainer}
          onAnimationComplete={onAnimationComplete}
        />
      );

      await waitFor(() => {
        expect(onAnimationComplete).toHaveBeenCalled();
      });
    });
  });

  describe('Error handling', () => {
    it('should display animation error when present', () => {
      mockUseMessageAnimation.mockReturnValue({
        ...mockAnimationHookReturn,
        error: 'Animation service failed to initialize'
      });

      render(
        <AnimatedMessage
          messageId="msg12"
          content="Test message"
          role="assistant"
          status="completed"
          eventBus={mockEventBus}
          serviceContainer={mockServiceContainer}
        />
      );

      expect(screen.getByText('Animation Error: Animation service failed to initialize')).toBeInTheDocument();
    });

    it('should handle animation failures gracefully', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      mockAnimationHookReturn.animateMessage.mockRejectedValue(new Error('Animation failed'));

      render(
        <AnimatedMessage
          messageId="msg13"
          content="Test message"
          role="assistant"
          status="completed"
          eventBus={mockEventBus}
          serviceContainer={mockServiceContainer}
        />
      );

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith('Animation failed:', expect.any(Error));
      });

      consoleError.mockRestore();
    });
  });

  describe('Loading states', () => {
    it('should show loading indicator when animation is loading', () => {
      mockUseMessageAnimation.mockReturnValue({
        ...mockAnimationHookReturn,
        isLoading: true
      });

      render(
        <AnimatedMessage
          messageId="msg14"
          content="Test message"
          role="assistant"
          status="completed"
          eventBus={mockEventBus}
          serviceContainer={mockServiceContainer}
        />
      );

      expect(screen.getByText('Animating...')).toBeInTheDocument();
    });
  });

  describe('Debug information', () => {
    it('should show debug info in development mode', () => {
      const originalDev = global.__DEV__;
      global.__DEV__ = true;

      render(
        <AnimatedMessage
          messageId="msg15"
          content="Test message"
          role="assistant"
          status="completed"
          eventBus={mockEventBus}
          serviceContainer={mockServiceContainer}
        />
      );

      expect(screen.getByText(/ID: msg15/)).toBeInTheDocument();
      expect(screen.getByText(/Role: assistant/)).toBeInTheDocument();
      expect(screen.getByText(/Status: completed/)).toBeInTheDocument();
      expect(screen.getByText(/Strategies: 2/)).toBeInTheDocument();
      expect(screen.getByText(/Default: typewriter/)).toBeInTheDocument();

      global.__DEV__ = originalDev;
    });

    it('should not show debug info in production mode', () => {
      const originalDev = global.__DEV__;
      global.__DEV__ = false;

      render(
        <AnimatedMessage
          messageId="msg16"
          content="Test message"
          role="assistant"
          status="completed"
          eventBus={mockEventBus}
          serviceContainer={mockServiceContainer}
        />
      );

      expect(screen.queryByText(/ID: msg16/)).not.toBeInTheDocument();

      global.__DEV__ = originalDev;
    });
  });

  describe('SOLID Principles Compliance', () => {
    it('should follow Single Responsibility Principle', () => {
      render(
        <AnimatedMessage
          messageId="msg17"
          content="Test message"
          role="assistant"
          status="completed"
          eventBus={mockEventBus}
          serviceContainer={mockServiceContainer}
        />
      );

      // Component should only handle animated message rendering
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    it('should follow Dependency Inversion Principle', () => {
      render(
        <AnimatedMessage
          messageId="msg18"
          content="Test message"
          role="assistant"
          status="completed"
          eventBus={mockEventBus}
          serviceContainer={mockServiceContainer}
        />
      );

      // Should depend on abstractions (hooks) not concretions
      expect(mockUseMessageAnimation).toHaveBeenCalledWith(mockEventBus, mockServiceContainer);
    });
  });
}); 