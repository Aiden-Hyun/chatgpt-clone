import { act, renderHook } from '@testing-library/react-hooks';
import { EventBus } from '../../../../../src/features/concurrent-chat/core/events/EventBus';
import { useModelSelection } from '../../../../../src/features/concurrent-chat/core/hooks/useModelSelection';
import { IModelSelector } from '../../../../../src/features/concurrent-chat/core/types/interfaces/IModelSelector';

describe('useModelSelection', () => {
  let mockModelSelector: jest.Mocked<IModelSelector>;
  let mockEventBus: jest.Mocked<EventBus>;

  beforeEach(() => {
    mockEventBus = {
      subscribe: jest.fn(),
      publish: jest.fn(),
      unsubscribe: jest.fn(),
      unsubscribeById: jest.fn(),
      hasSubscribers: jest.fn(),
      getEventHistory: jest.fn(),
    } as any;

    mockModelSelector = {
      getAvailableModels: jest.fn().mockReturnValue([
        { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
        { label: 'GPT-4', value: 'gpt-4' },
        { label: 'GPT-4 Turbo', value: 'gpt-4-turbo' }
      ]),
      getCurrentModel: jest.fn().mockReturnValue('gpt-3.5-turbo'),
      setModel: jest.fn().mockResolvedValue(undefined),
      getModelForRoom: jest.fn().mockResolvedValue('gpt-3.5-turbo'),
      setModelForRoom: jest.fn().mockResolvedValue(undefined),
      isValidModel: jest.fn().mockReturnValue(true),
      isSameModel: jest.fn().mockReturnValue(false),
      getModelPreference: jest.fn().mockResolvedValue('gpt-3.5-turbo'),
    } as any;
  });

  describe('hook initialization', () => {
    it('should initialize with default model state', () => {
      const { result } = renderHook(() => useModelSelection({
        modelSelector: mockModelSelector,
        eventBus: mockEventBus
      }));

      expect(result.current.currentModel).toBe('gpt-3.5-turbo');
      expect(result.current.availableModels).toEqual([
        { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
        { label: 'GPT-4', value: 'gpt-4' },
        { label: 'GPT-4 Turbo', value: 'gpt-4-turbo' }
      ]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should initialize with provided dependencies', () => {
      const { result } = renderHook(() => useModelSelection({
        modelSelector: mockModelSelector,
        eventBus: mockEventBus
      }));

      expect(result.current.modelSelector).toBe(mockModelSelector);
      expect(result.current.eventBus).toBe(mockEventBus);
    });

    it('should subscribe to model events', () => {
      renderHook(() => useModelSelection({
        modelSelector: mockModelSelector,
        eventBus: mockEventBus
      }));

      expect(mockEventBus.subscribe).toHaveBeenCalled();
    });

    it('should load initial model data', () => {
      renderHook(() => useModelSelection({
        modelSelector: mockModelSelector,
        eventBus: mockEventBus
      }));

      expect(mockModelSelector.getAvailableModels).toHaveBeenCalled();
      expect(mockModelSelector.getCurrentModel).toHaveBeenCalled();
    });
  });

  describe('model retrieval', () => {
    it('should get available models', () => {
      const { result } = renderHook(() => useModelSelection({
        modelSelector: mockModelSelector,
        eventBus: mockEventBus
      }));

      const models = result.current.getAvailableModels();
      expect(models).toEqual([
        { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
        { label: 'GPT-4', value: 'gpt-4' },
        { label: 'GPT-4 Turbo', value: 'gpt-4-turbo' }
      ]);
    });

    it('should get current model', () => {
      const { result } = renderHook(() => useModelSelection({
        modelSelector: mockModelSelector,
        eventBus: mockEventBus
      }));

      const currentModel = result.current.getCurrentModel();
      expect(currentModel).toBe('gpt-3.5-turbo');
    });

    it('should get model for specific room', async () => {
      const { result } = renderHook(() => useModelSelection({
        modelSelector: mockModelSelector,
        eventBus: mockEventBus
      }));

      await act(async () => {
        const roomModel = await result.current.getModelForRoom(123);
        expect(roomModel).toBe('gpt-3.5-turbo');
      });

      expect(mockModelSelector.getModelForRoom).toHaveBeenCalledWith(123);
    });

    it('should handle room model retrieval errors', async () => {
      mockModelSelector.getModelForRoom.mockRejectedValue(new Error('Room not found'));
      
      const { result } = renderHook(() => useModelSelection({
        modelSelector: mockModelSelector,
        eventBus: mockEventBus
      }));

      await act(async () => {
        const roomModel = await result.current.getModelForRoom(999);
        expect(roomModel).toBe('gpt-3.5-turbo'); // Should fallback to default
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe('model selection', () => {
    it('should change model successfully', async () => {
      const { result } = renderHook(() => useModelSelection({
        modelSelector: mockModelSelector,
        eventBus: mockEventBus
      }));

      await act(async () => {
        const success = await result.current.changeModel('gpt-4');
        expect(success).toBe(true);
      });

      expect(result.current.currentModel).toBe('gpt-4');
      expect(mockModelSelector.setModel).toHaveBeenCalledWith('gpt-4');
    });

    it('should handle model change errors', async () => {
      mockModelSelector.setModel.mockRejectedValue(new Error('Model change failed'));
      
      const { result } = renderHook(() => useModelSelection({
        modelSelector: mockModelSelector,
        eventBus: mockEventBus
      }));

      await act(async () => {
        const success = await result.current.changeModel('gpt-4');
        expect(success).toBe(false);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.currentModel).toBe('gpt-3.5-turbo'); // Should remain unchanged
    });

    it('should validate model before changing', async () => {
      mockModelSelector.isValidModel.mockReturnValue(false);
      
      const { result } = renderHook(() => useModelSelection({
        modelSelector: mockModelSelector,
        eventBus: mockEventBus
      }));

      await act(async () => {
        const success = await result.current.changeModel('invalid-model');
        expect(success).toBe(false);
      });

      expect(result.current.error).toBeDefined();
      expect(mockModelSelector.setModel).not.toHaveBeenCalled();
    });

    it('should handle null model selection', async () => {
      const { result } = renderHook(() => useModelSelection({
        modelSelector: mockModelSelector,
        eventBus: mockEventBus
      }));

      await act(async () => {
        const success = await result.current.changeModel(null as any);
        expect(success).toBe(false);
      });

      expect(result.current.error).toBeDefined();
    });

    it('should handle empty model selection', async () => {
      const { result } = renderHook(() => useModelSelection({
        modelSelector: mockModelSelector,
        eventBus: mockEventBus
      }));

      await act(async () => {
        const success = await result.current.changeModel('');
        expect(success).toBe(false);
      });

      expect(result.current.error).toBeDefined();
    });

    it('should publish model change event', async () => {
      const { result } = renderHook(() => useModelSelection({
        modelSelector: mockModelSelector,
        eventBus: mockEventBus
      }));

      await act(async () => {
        await result.current.changeModel('gpt-4');
      });

      expect(mockEventBus.publish).toHaveBeenCalledWith('model.changed', {
        previousModel: 'gpt-3.5-turbo',
        newModel: 'gpt-4'
      });
    });
  });

  describe('room-specific model selection', () => {
    it('should set model for specific room', async () => {
      const { result } = renderHook(() => useModelSelection({
        modelSelector: mockModelSelector,
        eventBus: mockEventBus
      }));

      await act(async () => {
        const success = await result.current.setModelForRoom(123, 'gpt-4');
        expect(success).toBe(true);
      });

      expect(mockModelSelector.setModelForRoom).toHaveBeenCalledWith(123, 'gpt-4');
    });

    it('should handle room model setting errors', async () => {
      mockModelSelector.setModelForRoom.mockRejectedValue(new Error('Room not found'));
      
      const { result } = renderHook(() => useModelSelection({
        modelSelector: mockModelSelector,
        eventBus: mockEventBus
      }));

      await act(async () => {
        const success = await result.current.setModelForRoom(999, 'gpt-4');
        expect(success).toBe(false);
      });

      expect(result.current.error).toBeDefined();
    });

    it('should publish room model change event', async () => {
      const { result } = renderHook(() => useModelSelection({
        modelSelector: mockModelSelector,
        eventBus: mockEventBus
      }));

      await act(async () => {
        await result.current.setModelForRoom(123, 'gpt-4');
      });

      expect(mockEventBus.publish).toHaveBeenCalledWith('room.model.changed', {
        roomId: 123,
        model: 'gpt-4'
      });
    });
  });

  describe('model validation', () => {
    it('should validate model correctly', () => {
      const { result } = renderHook(() => useModelSelection({
        modelSelector: mockModelSelector,
        eventBus: mockEventBus
      }));

      act(() => {
        const isValid = result.current.isValidModel('gpt-4');
        expect(isValid).toBe(true);
      });

      expect(mockModelSelector.isValidModel).toHaveBeenCalledWith('gpt-4');
    });

    it('should check if models are the same', () => {
      const { result } = renderHook(() => useModelSelection({
        modelSelector: mockModelSelector,
        eventBus: mockEventBus
      }));

      act(() => {
        const isSame = result.current.isSameModel('gpt-3.5-turbo', 'gpt-4');
        expect(isSame).toBe(false);
      });

      expect(mockModelSelector.isSameModel).toHaveBeenCalledWith('gpt-3.5-turbo', 'gpt-4');
    });

    it('should handle validation errors', () => {
      mockModelSelector.isValidModel.mockImplementation(() => {
        throw new Error('Validation error');
      });

      const { result } = renderHook(() => useModelSelection({
        modelSelector: mockModelSelector,
        eventBus: mockEventBus
      }));

      act(() => {
        const isValid = result.current.isValidModel('gpt-4');
        expect(isValid).toBe(false);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe('model preferences', () => {
    it('should get user model preference', async () => {
      const { result } = renderHook(() => useModelSelection({
        modelSelector: mockModelSelector,
        eventBus: mockEventBus
      }));

      await act(async () => {
        const preference = await result.current.getModelPreference();
        expect(preference).toBe('gpt-3.5-turbo');
      });

      expect(mockModelSelector.getModelPreference).toHaveBeenCalled();
    });

    it('should handle preference retrieval errors', async () => {
      mockModelSelector.getModelPreference.mockRejectedValue(new Error('Preference not found'));
      
      const { result } = renderHook(() => useModelSelection({
        modelSelector: mockModelSelector,
        eventBus: mockEventBus
      }));

      await act(async () => {
        const preference = await result.current.getModelPreference();
        expect(preference).toBe('gpt-3.5-turbo'); // Should fallback to default
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe('model comparison and filtering', () => {
    it('should filter models by capability', () => {
      const { result } = renderHook(() => useModelSelection({
        modelSelector: mockModelSelector,
        eventBus: mockEventBus
      }));

      act(() => {
        const gpt4Models = result.current.filterModelsByCapability('gpt-4');
        expect(gpt4Models).toEqual([
          { label: 'GPT-4', value: 'gpt-4' },
          { label: 'GPT-4 Turbo', value: 'gpt-4-turbo' }
        ]);
      });
    });

    it('should compare model capabilities', () => {
      const { result } = renderHook(() => useModelSelection({
        modelSelector: mockModelSelector,
        eventBus: mockEventBus
      }));

      act(() => {
        const comparison = result.current.compareModelCapabilities('gpt-3.5-turbo', 'gpt-4');
        expect(comparison).toBeDefined();
      });
    });

    it('should get model metadata', () => {
      const { result } = renderHook(() => useModelSelection({
        modelSelector: mockModelSelector,
        eventBus: mockEventBus
      }));

      act(() => {
        const metadata = result.current.getModelMetadata('gpt-4');
        expect(metadata).toBeDefined();
      });
    });
  });

  describe('model caching', () => {
    it('should cache model data', () => {
      const { result } = renderHook(() => useModelSelection({
        modelSelector: mockModelSelector,
        eventBus: mockEventBus
      }));

      act(() => {
        result.current.cacheModelData('gpt-4', { maxTokens: 8192 });
      });

      const cachedData = result.current.getCachedModelData('gpt-4');
      expect(cachedData).toEqual({ maxTokens: 8192 });
    });

    it('should clear model cache', () => {
      const { result } = renderHook(() => useModelSelection({
        modelSelector: mockModelSelector,
        eventBus: mockEventBus
      }));

      act(() => {
        result.current.cacheModelData('gpt-4', { maxTokens: 8192 });
        result.current.clearModelCache();
      });

      const cachedData = result.current.getCachedModelData('gpt-4');
      expect(cachedData).toBeUndefined();
    });

    it('should handle cache expiration', () => {
      const { result } = renderHook(() => useModelSelection({
        modelSelector: mockModelSelector,
        eventBus: mockEventBus
      }));

      act(() => {
        result.current.cacheModelData('gpt-4', { maxTokens: 8192 }, 1000); // 1 second TTL
      });

      // Simulate time passing
      setTimeout(() => {
        const cachedData = result.current.getCachedModelData('gpt-4');
        expect(cachedData).toBeUndefined();
      }, 1100);
    });
  });

  describe('model synchronization', () => {
    it('should sync model across rooms', async () => {
      const { result } = renderHook(() => useModelSelection({
        modelSelector: mockModelSelector,
        eventBus: mockEventBus
      }));

      await act(async () => {
        await result.current.syncModelAcrossRooms('gpt-4', [123, 456, 789]);
      });

      expect(mockModelSelector.setModelForRoom).toHaveBeenCalledTimes(3);
      expect(mockEventBus.publish).toHaveBeenCalledWith('model.synced', {
        model: 'gpt-4',
        roomIds: [123, 456, 789]
      });
    });

    it('should handle sync errors', async () => {
      mockModelSelector.setModelForRoom.mockRejectedValue(new Error('Sync failed'));
      
      const { result } = renderHook(() => useModelSelection({
        modelSelector: mockModelSelector,
        eventBus: mockEventBus
      }));

      await act(async () => {
        await result.current.syncModelAcrossRooms('gpt-4', [123, 456, 789]);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe('performance considerations', () => {
    it('should handle many model changes efficiently', async () => {
      const { result } = renderHook(() => useModelSelection({
        modelSelector: mockModelSelector,
        eventBus: mockEventBus
      }));

      const startTime = Date.now();

      await act(async () => {
        const promises = Array.from({ length: 100 }, (_, i) => 
          result.current.changeModel(`gpt-${i}`)
        );
        await Promise.all(promises);
      });

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should handle many room model operations efficiently', async () => {
      const { result } = renderHook(() => useModelSelection({
        modelSelector: mockModelSelector,
        eventBus: mockEventBus
      }));

      const startTime = Date.now();

      await act(async () => {
        const promises = Array.from({ length: 100 }, (_, i) => 
          result.current.setModelForRoom(i, 'gpt-4')
        );
        await Promise.all(promises);
      });

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });

  describe('error handling', () => {
    it('should handle initialization errors', () => {
      mockModelSelector.getAvailableModels.mockImplementation(() => {
        throw new Error('Initialization failed');
      });

      const { result } = renderHook(() => useModelSelection({
        modelSelector: mockModelSelector,
        eventBus: mockEventBus
      }));

      expect(result.current.error).toBeDefined();
    });

    it('should handle event subscription errors', () => {
      mockEventBus.subscribe.mockImplementation(() => {
        throw new Error('Subscription failed');
      });

      const { result } = renderHook(() => useModelSelection({
        modelSelector: mockModelSelector,
        eventBus: mockEventBus
      }));

      expect(result.current.error).toBeDefined();
    });

    it('should clear errors when appropriate', () => {
      const { result } = renderHook(() => useModelSelection({
        modelSelector: mockModelSelector,
        eventBus: mockEventBus
      }));

      act(() => {
        result.current.error = new Error('Test error');
      });

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('cleanup and unmounting', () => {
    it('should cleanup on unmount', () => {
      const { result, unmount } = renderHook(() => useModelSelection({
        modelSelector: mockModelSelector,
        eventBus: mockEventBus
      }));

      unmount();

      expect(mockEventBus.unsubscribe).toHaveBeenCalled();
    });

    it('should handle cleanup errors gracefully', () => {
      mockEventBus.unsubscribe.mockImplementation(() => {
        throw new Error('Cleanup failed');
      });

      const { unmount } = renderHook(() => useModelSelection({
        modelSelector: mockModelSelector,
        eventBus: mockEventBus
      }));

      // Should not throw
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete model selection workflow', async () => {
      const { result } = renderHook(() => useModelSelection({
        modelSelector: mockModelSelector,
        eventBus: mockEventBus
      }));

      // Get available models
      const models = result.current.getAvailableModels();
      expect(models.length).toBeGreaterThan(0);

      // Change model
      await act(async () => {
        const success = await result.current.changeModel('gpt-4');
        expect(success).toBe(true);
      });

      expect(result.current.currentModel).toBe('gpt-4');

      // Set model for room
      await act(async () => {
        const success = await result.current.setModelForRoom(123, 'gpt-4');
        expect(success).toBe(true);
      });

      // Get model for room
      await act(async () => {
        const roomModel = await result.current.getModelForRoom(123);
        expect(roomModel).toBe('gpt-3.5-turbo');
      });
    });

    it('should handle model synchronization workflow', async () => {
      const { result } = renderHook(() => useModelSelection({
        modelSelector: mockModelSelector,
        eventBus: mockEventBus
      }));

      // Sync model across multiple rooms
      await act(async () => {
        await result.current.syncModelAcrossRooms('gpt-4', [1, 2, 3, 4, 5]);
      });

      // Verify all rooms have the same model
      for (const roomId of [1, 2, 3, 4, 5]) {
        expect(mockModelSelector.setModelForRoom).toHaveBeenCalledWith(roomId, 'gpt-4');
      }
    });
  });
}); 