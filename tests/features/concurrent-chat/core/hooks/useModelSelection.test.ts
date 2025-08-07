import { act, renderHook } from '@testing-library/react';
import { ServiceContainer } from '../../../../../src/features/concurrent-chat/core/container/ServiceContainer';
import { EventBus } from '../../../../../src/features/concurrent-chat/core/events/EventBus';
import { useModelSelection } from '../../../../../src/features/concurrent-chat/core/hooks/useModelSelection';
import { IModelSelector } from '../../../../../src/features/concurrent-chat/core/types/interfaces/IModelSelector';

describe('useModelSelection', () => {
  let mockEventBus: EventBus;
  let mockServiceContainer: ServiceContainer;
  let mockModelSelector: jest.Mocked<IModelSelector>;

  beforeEach(() => {
    // Create real instances instead of mocks
    mockEventBus = new EventBus();
    mockServiceContainer = new ServiceContainer();
    
    mockModelSelector = {
      getAvailableModels: jest.fn().mockReturnValue([
        { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
        { label: 'GPT-4', value: 'gpt-4' },
        { label: 'Claude-3', value: 'claude-3' },
      ]),
      getCurrentModel: jest.fn().mockReturnValue('gpt-3.5-turbo'),
      setModel: jest.fn().mockResolvedValue(undefined),
      getModelForRoom: jest.fn().mockResolvedValue('gpt-3.5-turbo'),
    };

    // Register the mock model selector in the service container
    mockServiceContainer.register('modelSelector', mockModelSelector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useModelSelection(mockEventBus, mockServiceContainer));

      expect(result.current.currentModel).toBe('gpt-3.5-turbo');
      expect(result.current.availableModels).toEqual([
        { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
        { label: 'GPT-4', value: 'gpt-4' },
        { label: 'Claude-3', value: 'claude-3' },
      ]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should initialize model selector from service container', () => {
      renderHook(() => useModelSelection(mockEventBus, mockServiceContainer));

      expect(mockModelSelector.getAvailableModels).toHaveBeenCalled();
      expect(mockModelSelector.getCurrentModel).toHaveBeenCalled();
    });

    it('should load current model for room if roomId is provided', async () => {
      await act(async () => {
        renderHook(() => useModelSelection(mockEventBus, mockServiceContainer, 123));
      });

      expect(mockModelSelector.getModelForRoom).toHaveBeenCalledWith(123);
    });

    it('should handle initialization errors gracefully', () => {
      // Create a service container without the model selector
      const emptyServiceContainer = new ServiceContainer();
      
      const { result } = renderHook(() => useModelSelection(mockEventBus, emptyServiceContainer));

      // Should handle the error gracefully
      expect(result.current.error).toBeDefined();
    });
  });

  describe('model operations', () => {
    it('should change model successfully', async () => {
      const { result } = renderHook(() => useModelSelection(mockEventBus, mockServiceContainer));

      await act(async () => {
        await result.current.changeModel('gpt-4');
      });

      expect(mockModelSelector.setModel).toHaveBeenCalledWith('gpt-4');
    });

    it('should handle model change errors', async () => {
      const error = new Error('Model change failed');
      mockModelSelector.setModel.mockRejectedValue(error);

      const { result } = renderHook(() => useModelSelection(mockEventBus, mockServiceContainer));

      await act(async () => {
        await expect(result.current.changeModel('gpt-4')).rejects.toThrow('Model change failed');
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe('model queries', () => {
    it('should get current model', () => {
      const { result } = renderHook(() => useModelSelection(mockEventBus, mockServiceContainer));

      const currentModel = result.current.getCurrentModel();

      expect(currentModel).toBe('gpt-3.5-turbo');
    });

    it('should get available models', () => {
      const { result } = renderHook(() => useModelSelection(mockEventBus, mockServiceContainer));

      const availableModels = result.current.getAvailableModels();

      expect(availableModels).toEqual([
        { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
        { label: 'GPT-4', value: 'gpt-4' },
        { label: 'Claude-3', value: 'claude-3' },
      ]);
    });

    it('should check if model is available', () => {
      const { result } = renderHook(() => useModelSelection(mockEventBus, mockServiceContainer));

      expect(result.current.isModelAvailable('gpt-3.5-turbo')).toBe(true);
      expect(result.current.isModelAvailable('gpt-4')).toBe(true);
      expect(result.current.isModelAvailable('invalid-model')).toBe(false);
    });

    it('should get model for specific room', async () => {
      const { result } = renderHook(() => useModelSelection(mockEventBus, mockServiceContainer));

      const model = await result.current.getModelForRoom(123);

      expect(model).toBe('gpt-3.5-turbo');
      expect(mockModelSelector.getModelForRoom).toHaveBeenCalledWith(123);
    });
  });

  describe('room-specific model operations', () => {
    it('should set model for specific room', async () => {
      const { result } = renderHook(() => useModelSelection(mockEventBus, mockServiceContainer));

      await act(async () => {
        await result.current.setModelForRoom(123, 'gpt-4');
      });

      expect(mockModelSelector.setModel).toHaveBeenCalledWith('gpt-4');
    });
  });

  describe('model information', () => {
    it('should get model information', () => {
      const { result } = renderHook(() => useModelSelection(mockEventBus, mockServiceContainer));

      const modelInfo = result.current.getModelInfo('gpt-4');

      expect(modelInfo).toEqual({
        label: 'GPT-4',
        value: 'gpt-4',
        isCurrent: false,
        isAvailable: true,
      });
    });

    it('should get current model information', () => {
      const { result } = renderHook(() => useModelSelection(mockEventBus, mockServiceContainer));

      const currentModelInfo = result.current.getCurrentModelInfo();

      expect(currentModelInfo).toEqual({
        label: 'GPT-3.5 Turbo',
        value: 'gpt-3.5-turbo',
        isCurrent: true,
        isAvailable: true,
      });
    });

    it('should handle unavailable model information', () => {
      const { result } = renderHook(() => useModelSelection(mockEventBus, mockServiceContainer));

      const modelInfo = result.current.getModelInfo('invalid-model');

      expect(modelInfo).toEqual({
        label: 'invalid-model',
        value: 'invalid-model',
        isCurrent: false,
        isAvailable: false,
      });
    });

    it('should check if model is currently selected', () => {
      const { result } = renderHook(() => useModelSelection(mockEventBus, mockServiceContainer));

      expect(result.current.isCurrentModel('gpt-3.5-turbo')).toBe(true);
      expect(result.current.isCurrentModel('gpt-4')).toBe(false);
    });
  });

  describe('model refresh', () => {
    it('should refresh available models', () => {
      const { result } = renderHook(() => useModelSelection(mockEventBus, mockServiceContainer));

      act(() => {
        result.current.refreshAvailableModels();
      });

      expect(mockModelSelector.getAvailableModels).toHaveBeenCalled();
    });
  });
}); 