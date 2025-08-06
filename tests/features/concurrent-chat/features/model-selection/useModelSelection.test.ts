import { renderHook, act } from '@testing-library/react';
import { EventBus } from '../../../../src/features/concurrent-chat/core/events/EventBus';
import { ServiceContainer } from '../../../../src/features/concurrent-chat/core/container/ServiceContainer';
import { ModelSelectionService } from '../../../../src/features/concurrent-chat/features/model-selection/ModelSelectionService';
import { useModelSelection } from '../../../../src/features/concurrent-chat/features/model-selection/useModelSelection';
import { IModelSelector } from '../../../../src/features/concurrent-chat/core/types/interfaces/IModelSelector';

// Mock model selector
class MockModelSelector implements IModelSelector {
  private currentModel = 'gpt-3.5-turbo';
  private availableModels = ['gpt-3.5-turbo', 'gpt-4'];

  async getAvailableModels(): Promise<string[]> {
    return this.availableModels;
  }

  async getCurrentModel(): Promise<string> {
    return this.currentModel;
  }

  async setModel(model: string): Promise<void> {
    if (this.availableModels.includes(model)) {
      this.currentModel = model;
    } else {
      throw new Error(`Model ${model} not available`);
    }
  }

  async getModelForRoom(roomId: string): Promise<string> {
    return this.currentModel;
  }
}

// Mock Supabase service
class MockSupabaseService {
  async getModelForRoom(roomId: string): Promise<string> {
    return 'gpt-3.5-turbo';
  }

  async setModelForRoom(roomId: string, model: string): Promise<void> {
    // Mock implementation
  }

  async getAvailableModels(): Promise<string[]> {
    return ['gpt-3.5-turbo', 'gpt-4'];
  }
}

describe('useModelSelection', () => {
  let eventBus: EventBus;
  let serviceContainer: ServiceContainer;
  let modelSelectionService: ModelSelectionService;
  let mockModelSelector: MockModelSelector;
  let mockSupabaseService: MockSupabaseService;

  beforeEach(() => {
    eventBus = new EventBus();
    serviceContainer = new ServiceContainer();
    mockModelSelector = new MockModelSelector();
    mockSupabaseService = new MockSupabaseService();
    
    modelSelectionService = new ModelSelectionService(
      eventBus,
      serviceContainer,
      mockModelSelector,
      mockSupabaseService
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Model Selection State Management', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useModelSelection(modelSelectionService));

      expect(result.current.currentModel).toBe('gpt-3.5-turbo');
      expect(result.current.availableModels).toEqual(['gpt-3.5-turbo', 'gpt-4']);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should update model selection state when model changes', async () => {
      const { result } = renderHook(() => useModelSelection(modelSelectionService));

      await act(async () => {
        await result.current.setModel('gpt-4');
      });

      expect(result.current.currentModel).toBe('gpt-4');
    });

    it('should handle loading state during model changes', async () => {
      const { result } = renderHook(() => useModelSelection(modelSelectionService));

      const setModelPromise = act(async () => {
        return result.current.setModel('gpt-4');
      });

      expect(result.current.isLoading).toBe(true);

      await setModelPromise;

      expect(result.current.isLoading).toBe(false);
    });

    it('should handle error state', async () => {
      const { result } = renderHook(() => useModelSelection(modelSelectionService));

      await expect(act(async () => {
        await result.current.setModel('invalid-model');
      })).rejects.toThrow('Model invalid-model not available');

      expect(result.current.error).toBeDefined();
    });
  });

  describe('Model Change Triggers', () => {
    it('should trigger model change with valid model', async () => {
      const { result } = renderHook(() => useModelSelection(modelSelectionService));

      await act(async () => {
        await result.current.setModel('gpt-4');
      });

      expect(result.current.currentModel).toBe('gpt-4');
      expect(result.current.modelHistory).toHaveLength(1);
    });

    it('should trigger model change with room context', async () => {
      const { result } = renderHook(() => useModelSelection(modelSelectionService));

      const roomId = 'room_123';

      await act(async () => {
        await result.current.setModelForRoom(roomId, 'gpt-4');
      });

      expect(result.current.currentModel).toBe('gpt-4');
      expect(result.current.currentRoomId).toBe(roomId);
    });

    it('should handle multiple model changes', async () => {
      const { result } = renderHook(() => useModelSelection(modelSelectionService));

      await act(async () => {
        await result.current.setModel('gpt-4');
        await result.current.setModel('gpt-3.5-turbo');
        await result.current.setModel('gpt-4');
      });

      expect(result.current.currentModel).toBe('gpt-4');
      expect(result.current.modelHistory).toHaveLength(3);
    });

    it('should handle model change errors', async () => {
      const { result } = renderHook(() => useModelSelection(modelSelectionService));

      await expect(act(async () => {
        await result.current.setModel('invalid-model');
      })).rejects.toThrow('Model invalid-model not available');

      expect(result.current.error).toBeDefined();
      expect(result.current.currentModel).toBe('gpt-3.5-turbo'); // Should remain unchanged
    });
  });

  describe('Model Persistence', () => {
    it('should persist model selection', async () => {
      const { result } = renderHook(() => useModelSelection(modelSelectionService));

      const roomId = 'room_123';
      const model = 'gpt-4';

      await act(async () => {
        await result.current.setModelForRoom(roomId, model);
      });

      expect(result.current.currentModel).toBe(model);
      expect(result.current.currentRoomId).toBe(roomId);
    });

    it('should load model for room', async () => {
      const { result } = renderHook(() => useModelSelection(modelSelectionService));

      const roomId = 'room_123';

      await act(async () => {
        await result.current.loadModelForRoom(roomId);
      });

      expect(result.current.currentModel).toBe('gpt-3.5-turbo');
      expect(result.current.currentRoomId).toBe(roomId);
    });

    it('should handle persistence errors', async () => {
      const errorSupabaseService = {
        async setModelForRoom() {
          throw new Error('Persistence error');
        },
        async getModelForRoom() {
          throw new Error('Load error');
        },
        async getAvailableModels() {
          return ['gpt-3.5-turbo', 'gpt-4'];
        }
      };

      const errorModelSelectionService = new ModelSelectionService(
        eventBus,
        serviceContainer,
        mockModelSelector,
        errorSupabaseService
      );

      const { result } = renderHook(() => useModelSelection(errorModelSelectionService));

      await expect(act(async () => {
        await result.current.setModelForRoom('room_123', 'gpt-4');
      })).rejects.toThrow('Persistence error');

      expect(result.current.error).toBeDefined();
    });
  });

  describe('Plugin Lifecycle Integration', () => {
    it('should integrate with plugin lifecycle', () => {
      const plugin = {
        name: 'test-plugin',
        onModelChange: jest.fn(),
        onModelError: jest.fn()
      };

      modelSelectionService.registerPlugin(plugin);
      const { result } = renderHook(() => useModelSelection(modelSelectionService));

      expect(result.current.plugins).toContain(plugin);
    });

    it('should notify plugins of model changes', async () => {
      const plugin = {
        name: 'test-plugin',
        onModelChange: jest.fn(),
        onModelError: jest.fn()
      };

      modelSelectionService.registerPlugin(plugin);
      const { result } = renderHook(() => useModelSelection(modelSelectionService));

      await act(async () => {
        await result.current.setModel('gpt-4');
      });

      expect(plugin.onModelChange).toHaveBeenCalledWith({
        previousModel: 'gpt-3.5-turbo',
        newModel: 'gpt-4'
      });
    });

    it('should handle plugin lifecycle events', () => {
      const plugin = {
        name: 'test-plugin',
        onMount: jest.fn(),
        onUnmount: jest.fn()
      };

      const { result, unmount } = renderHook(() => useModelSelection(modelSelectionService));
      
      modelSelectionService.registerPlugin(plugin);

      expect(plugin.onMount).toHaveBeenCalled();

      unmount();

      expect(plugin.onUnmount).toHaveBeenCalled();
    });
  });

  describe('Command Integration', () => {
    it('should integrate with command pattern', async () => {
      const { result } = renderHook(() => useModelSelection(modelSelectionService));

      const command = {
        execute: jest.fn().mockResolvedValue('Command result'),
        canUndo: () => true,
        undo: jest.fn()
      };

      act(() => {
        result.current.registerCommand('test-command', command);
      });

      const commandResult = await act(async () => {
        return result.current.executeCommand('test-command', 'Test data');
      });

      expect(command.execute).toHaveBeenCalledWith('Test data');
      expect(commandResult).toBe('Command result');
    });

    it('should support command history', async () => {
      const { result } = renderHook(() => useModelSelection(modelSelectionService));

      const command = {
        execute: jest.fn().mockResolvedValue('Command result'),
        canUndo: () => true,
        undo: jest.fn()
      };

      act(() => {
        result.current.registerCommand('test-command', command);
      });

      await act(async () => {
        await result.current.executeCommand('test-command', 'Test data');
      });

      const commandHistory = result.current.getCommandHistory();
      expect(commandHistory).toHaveLength(1);
      expect(commandHistory[0].commandName).toBe('test-command');
    });

    it('should support command undo', async () => {
      const { result } = renderHook(() => useModelSelection(modelSelectionService));

      const command = {
        execute: jest.fn().mockResolvedValue('Command result'),
        canUndo: () => true,
        undo: jest.fn()
      };

      act(() => {
        result.current.registerCommand('test-command', command);
      });

      await act(async () => {
        await result.current.executeCommand('test-command', 'Test data');
        await result.current.undoLastCommand();
      });

      expect(command.undo).toHaveBeenCalled();
    });
  });

  describe('Supabase Integration', () => {
    it('should sync with Supabase', async () => {
      const { result } = renderHook(() => useModelSelection(modelSelectionService));

      const roomId = 'room_123';

      await act(async () => {
        await result.current.syncWithSupabase(roomId);
      });

      expect(result.current.currentRoomId).toBe(roomId);
    });

    it('should handle sync errors', async () => {
      const errorSupabaseService = {
        async getModelForRoom() {
          throw new Error('Sync error');
        },
        async setModelForRoom() {
          throw new Error('Sync error');
        },
        async getAvailableModels() {
          return ['gpt-3.5-turbo', 'gpt-4'];
        }
      };

      const errorModelSelectionService = new ModelSelectionService(
        eventBus,
        serviceContainer,
        mockModelSelector,
        errorSupabaseService
      );

      const { result } = renderHook(() => useModelSelection(errorModelSelectionService));

      await expect(act(async () => {
        await result.current.syncWithSupabase('room_123');
      })).rejects.toThrow('Sync error');

      expect(result.current.error).toBeDefined();
    });

    it('should handle offline mode', async () => {
      const { result } = renderHook(() => useModelSelection(modelSelectionService));

      await act(async () => {
        await result.current.setOfflineMode(true);
      });

      expect(result.current.isOffline).toBe(true);
      expect(result.current.currentModel).toBe('gpt-3.5-turbo'); // Default model
    });
  });

  describe('Model Validation', () => {
    it('should validate model before setting', async () => {
      const { result } = renderHook(() => useModelSelection(modelSelectionService));

      const validation = await act(async () => {
        return result.current.validateModel('gpt-4');
      });

      expect(validation.isValid).toBe(true);
      expect(validation.model).toBe('gpt-4');
    });

    it('should reject invalid models', async () => {
      const { result } = renderHook(() => useModelSelection(modelSelectionService));

      const validation = await act(async () => {
        return result.current.validateModel('invalid-model');
      });

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Model not available');
    });

    it('should check model compatibility', async () => {
      const { result } = renderHook(() => useModelSelection(modelSelectionService));

      const compatibility = await act(async () => {
        return result.current.checkModelCompatibility('gpt-4');
      });

      expect(compatibility.isCompatible).toBe(true);
    });
  });

  describe('Model Analytics', () => {
    it('should track model usage analytics', async () => {
      const { result } = renderHook(() => useModelSelection(modelSelectionService));

      await act(async () => {
        await result.current.setModel('gpt-4');
        await result.current.setModel('gpt-3.5-turbo');
        await result.current.setModel('gpt-4');
      });

      expect(result.current.analytics).toBeDefined();
      expect(result.current.analytics.totalChanges).toBe(3);
      expect(result.current.analytics.mostUsedModel).toBe('gpt-4');
    });

    it('should generate model reports', async () => {
      const { result } = renderHook(() => useModelSelection(modelSelectionService));

      await act(async () => {
        await result.current.setModel('gpt-4');
      });

      const report = result.current.generateReport();
      expect(report).toBeDefined();
      expect(report.summary).toBeDefined();
      expect(report.metrics).toBeDefined();
    });

    it('should track model performance', async () => {
      const { result } = renderHook(() => useModelSelection(modelSelectionService));

      const performance = await act(async () => {
        return result.current.trackModelPerformance('gpt-4');
      });

      expect(performance).toBeDefined();
      expect(performance.responseTime).toBeGreaterThan(0);
    });
  });

  describe('Default Model Fallback', () => {
    it('should fallback to default model', async () => {
      const { result } = renderHook(() => useModelSelection(modelSelectionService));

      const defaultModel = result.current.getDefaultModel();
      expect(defaultModel).toBe('gpt-3.5-turbo');
    });

    it('should handle model unavailability', async () => {
      const { result } = renderHook(() => useModelSelection(modelSelectionService));

      const fallbackModel = await act(async () => {
        return result.current.getFallbackModel('unavailable-model');
      });

      expect(fallbackModel).toBe('gpt-3.5-turbo');
    });

    it('should validate default model', async () => {
      const { result } = renderHook(() => useModelSelection(modelSelectionService));

      const isValid = await act(async () => {
        return result.current.isDefaultModelValid();
      });

      expect(isValid).toBe(true);
    });
  });

  describe('SOLID Principles Compliance', () => {
    it('should follow Single Responsibility Principle', () => {
      const { result } = renderHook(() => useModelSelection(modelSelectionService));

      // Hook should only handle model selection state and controls
      expect(typeof result.current.setModel).toBe('function');
      expect(typeof result.current.getCurrentModel).toBe('function');
      expect(typeof result.current.getAvailableModels).toBe('function');
    });

    it('should follow Open/Closed Principle', () => {
      const { result } = renderHook(() => useModelSelection(modelSelectionService));

      // Should be open for extension (new plugins) but closed for modification
      const newPlugin = {
        name: 'new-plugin',
        onModelChange: jest.fn(),
        onModelError: jest.fn()
      };

      modelSelectionService.registerPlugin(newPlugin);

      expect(result.current.plugins).toContain(newPlugin);
    });

    it('should follow Liskov Substitution Principle', () => {
      // Any model selection service should be substitutable
      const alternativeService = new ModelSelectionService(
        eventBus,
        serviceContainer,
        mockModelSelector,
        mockSupabaseService
      );

      const { result } = renderHook(() => useModelSelection(alternativeService));

      expect(typeof result.current.setModel).toBe('function');
    });

    it('should follow Interface Segregation Principle', () => {
      const { result } = renderHook(() => useModelSelection(modelSelectionService));

      // Should depend on focused interfaces, not large ones
      expect(result.current).toHaveProperty('setModel');
      expect(result.current).toHaveProperty('getCurrentModel');
      expect(result.current).toHaveProperty('getAvailableModels');
    });

    it('should follow Dependency Inversion Principle', () => {
      // Should depend on abstractions (ModelSelectionService) not concretions
      const { result } = renderHook(() => useModelSelection(modelSelectionService));

      expect(result.current.modelSelectionService).toBe(modelSelectionService);
      expect(typeof result.current.modelSelectionService.setModel).toBe('function');
    });
  });
}); 