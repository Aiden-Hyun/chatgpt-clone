import { act, renderHook } from '@testing-library/react';
import { ServiceContainer } from '../../../../src/features/concurrent-chat/core/container/ServiceContainer';
import { EventBus } from '../../../../src/features/concurrent-chat/core/events/EventBus';
import { AnimationService } from '../../../../src/features/concurrent-chat/features/animation/AnimationService';
import { useMessageAnimation } from '../../../../src/features/concurrent-chat/features/animation/useMessageAnimation';
import { EditingService } from '../../../../src/features/concurrent-chat/features/editing/EditingService';
import { useMessageEditing } from '../../../../src/features/concurrent-chat/features/editing/useMessageEditing';
import { RegenerationService } from '../../../../src/features/concurrent-chat/features/regeneration/RegenerationService';
import { useMessageRegeneration } from '../../../../src/features/concurrent-chat/features/regeneration/useMessageRegeneration';
import { StreamingService } from '../../../../src/features/concurrent-chat/features/streaming/StreamingService';
import { useMessageStreaming } from '../../../../src/features/concurrent-chat/features/streaming/useMessageStreaming';

describe('Hook-Component Integration Tests', () => {
  let eventBus: EventBus;
  let serviceContainer: ServiceContainer;

  beforeEach(() => {
    eventBus = new EventBus();
    serviceContainer = new ServiceContainer();
    
    // Register all required services
    const animationService = new AnimationService(eventBus, serviceContainer);
    const regenerationService = new RegenerationService(eventBus, serviceContainer);
    const editingService = new EditingService(eventBus, serviceContainer);
    const streamingService = new StreamingService(eventBus, serviceContainer);
    
    // Mock AI service for regeneration
    const mockAIService = {
      sendMessage: jest.fn().mockResolvedValue({
        content: 'Mock AI response',
        role: 'assistant',
        id: 'mock-response-id'
      })
    };
    
    serviceContainer.register('animationService', animationService);
    serviceContainer.register('regenerationService', regenerationService);
    serviceContainer.register('editingService', editingService);
    serviceContainer.register('streamingService', streamingService);
    serviceContainer.register('aiService', mockAIService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('useMessageRegeneration + RegenerateButton Integration', () => {
    it('should provide all functions expected by RegenerateButton component', async () => {
      const { result } = renderHook(() => useMessageRegeneration(eventBus, serviceContainer));
      
      // Wait for initialization
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // Check all expected functions exist
      expect(typeof result.current.regenerateMessage).toBe('function');
      expect(typeof result.current.canRegenerate).toBe('function');
      expect(typeof result.current.getRegenerationHistory).toBe('function');
      expect(typeof result.current.clearRegenerationHistory).toBe('function');
      expect(typeof result.current.isRegenerating).toBe('function');
      expect(typeof result.current.cancelRegeneration).toBe('function');
      expect(typeof result.current.cancelAllRegenerations).toBe('function');
      expect(typeof result.current.getRegenerationStats).toBe('function');
      expect(typeof result.current.getMaxRetries).toBe('function');
      expect(typeof result.current.getRetryDelay).toBe('function');
      expect(typeof result.current.getPendingRegenerationCount).toBe('function');
    });

    it('should have correct regenerateMessage signature for RegenerateButton', async () => {
      const { result } = renderHook(() => useMessageRegeneration(eventBus, serviceContainer));
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // Test the function signature that RegenerateButton expects
      expect(() => {
        result.current.regenerateMessage('msg1', 'original content');
      }).not.toThrow();
    });

    it('should have correct canRegenerate signature', async () => {
      const { result } = renderHook(() => useMessageRegeneration(eventBus, serviceContainer));
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // Test canRegenerate function
      expect(typeof result.current.canRegenerate('msg1')).toBe('boolean');
    });

    it('should have correct getRegenerationHistory signature', async () => {
      const { result } = renderHook(() => useMessageRegeneration(eventBus, serviceContainer));
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // Test getRegenerationHistory function
      const history = result.current.getRegenerationHistory('msg1');
      expect(Array.isArray(history)).toBe(true);
    });
  });

  describe('useMessageEditing + EditableMessage Integration', () => {
    it('should provide all functions expected by EditableMessage component', async () => {
      const { result } = renderHook(() => useMessageEditing(eventBus, serviceContainer));
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // Check all expected functions exist
      expect(typeof result.current.canEdit).toBe('function');
      expect(typeof result.current.validateEdit).toBe('function');
      expect(typeof result.current.getEditHistory).toBe('function');
      expect(typeof result.current.clearEditHistory).toBe('function');
      expect(typeof result.current.startEditing).toBe('function');
      expect(typeof result.current.updateEditedContent).toBe('function');
      expect(typeof result.current.saveEditedMessage).toBe('function');
      expect(typeof result.current.cancelEditing).toBe('function');
      expect(typeof result.current.isEditing).toBe('function');
      expect(typeof result.current.getEditingSession).toBe('function');
      expect(typeof result.current.getEditingStats).toBe('function');
    });

    it('should have correct canEdit signature', async () => {
      const { result } = renderHook(() => useMessageEditing(eventBus, serviceContainer));
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // Test canEdit function
      expect(typeof result.current.canEdit('msg1')).toBe('boolean');
    });

    it('should have correct validateEdit signature', async () => {
      const { result } = renderHook(() => useMessageEditing(eventBus, serviceContainer));
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // Test validateEdit function
      const validation = result.current.validateEdit('msg1', 'test content');
      expect(typeof validation.isValid).toBe('boolean');
      expect(validation.error).toBeDefined(); // error should be defined (even if undefined)
      
      // Test with invalid content
      const invalidValidation = result.current.validateEdit('msg1', '');
      expect(invalidValidation.isValid).toBe(false);
      expect(typeof invalidValidation.error).toBe('string');
    });

    it('should have correct getEditHistory signature', async () => {
      const { result } = renderHook(() => useMessageEditing(eventBus, serviceContainer));
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // Test getEditHistory function
      const history = result.current.getEditHistory('msg1');
      expect(Array.isArray(history)).toBe(true);
    });
  });

  describe('useMessageAnimation + AnimatedMessage Integration', () => {
    it('should provide all functions expected by AnimatedMessage component', async () => {
      const { result } = renderHook(() => useMessageAnimation(eventBus, serviceContainer));
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // Check all expected functions exist
      expect(typeof result.current.registerAnimationElement).toBe('function');
      expect(typeof result.current.unregisterAnimationElement).toBe('function');
      expect(typeof result.current.animateMessage).toBe('function');
      expect(typeof result.current.cancelAnimation).toBe('function');
      expect(typeof result.current.cancelAllAnimations).toBe('function');
      expect(typeof result.current.registerStrategy).toBe('function');
      expect(typeof result.current.setDefaultAnimationStrategy).toBe('function');
      expect(typeof result.current.isAnimating).toBe('function');
      expect(typeof result.current.getAnimationStats).toBe('function');
      expect(typeof result.current.getStrategy).toBe('function');
      expect(typeof result.current.getActiveAnimationCount).toBe('function');
    });

    it('should have correct setDefaultAnimationStrategy signature', async () => {
      const { result } = renderHook(() => useMessageAnimation(eventBus, serviceContainer));
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // Test setDefaultAnimationStrategy function
      expect(() => {
        result.current.setDefaultAnimationStrategy('typewriter');
      }).not.toThrow();
    });
  });

  describe('useMessageStreaming + StreamingIndicator Integration', () => {
    it('should provide all functions expected by StreamingIndicator component', async () => {
      const { result } = renderHook(() => useMessageStreaming(eventBus, serviceContainer));
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // Check all expected functions exist
      expect(typeof result.current.isStreaming).toBe('function');
      expect(typeof result.current.getStreamingProgress).toBe('function');
      expect(typeof result.current.getStreamingText).toBe('function');
      expect(typeof result.current.startStreaming).toBe('function');
      expect(typeof result.current.stopStreaming).toBe('function');
      expect(typeof result.current.pauseStreaming).toBe('function');
      expect(typeof result.current.resumeStreaming).toBe('function');
      expect(typeof result.current.getStreamingStats).toBe('function');
      expect(typeof result.current.getActiveStreamingCount).toBe('function');
    });

    it('should have correct isStreaming signature', async () => {
      const { result } = renderHook(() => useMessageStreaming(eventBus, serviceContainer));
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // Test isStreaming function
      expect(typeof result.current.isStreaming('msg1')).toBe('boolean');
    });
  });

  describe('Function Signature Validation', () => {
    it('should validate regenerateMessage signature matches component expectations', async () => {
      const { result } = renderHook(() => useMessageRegeneration(eventBus, serviceContainer));
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // RegenerateButton expects: regenerateMessage(messageId: string, originalContent: string)
      const regenerateMessage = result.current.regenerateMessage;
      expect(regenerateMessage.length).toBe(2); // Should accept 2 parameters
    });

    it('should validate editMessage signature matches component expectations', async () => {
      const { result } = renderHook(() => useMessageEditing(eventBus, serviceContainer));
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // EditableMessage expects: editMessage(messageId: string, content: string)
      const editMessage = result.current.saveEditedMessage;
      expect(editMessage.length).toBe(2); // Should accept 2 parameters
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle errors gracefully in regeneration', async () => {
      const { result } = renderHook(() => useMessageRegeneration(eventBus, serviceContainer));
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // Test error handling
      expect(result.current.error).toBeDefined();
    });

    it('should handle errors gracefully in editing', async () => {
      const { result } = renderHook(() => useMessageEditing(eventBus, serviceContainer));
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // Test error handling
      expect(result.current.error).toBeDefined();
    });
  });
}); 