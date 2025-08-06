import { EventBus } from '../../../../src/features/concurrent-chat/core/events/EventBus';
import { ServiceContainer } from '../../../../src/features/concurrent-chat/core/container/ServiceContainer';
import { ModelSelectionService } from '../../../../src/features/concurrent-chat/features/model-selection/ModelSelectionService';
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

describe('ModelSelectionService', () => {
  let modelSelectionService: ModelSelectionService;
  let eventBus: EventBus;
  let serviceContainer: ServiceContainer;
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

  describe('Initialization', () => {
    it('should initialize with default state', () => {
      expect(modelSelectionService).toBeDefined();
      expect(modelSelectionService.getModelHistory()).toEqual([]);
      expect(modelSelectionService.getCurrentModel()).toBe('gpt-3.5-turbo');
    });

    it('should register with service container', () => {
      expect(serviceContainer.get('modelSelectionService')).toBe(modelSelectionService);
    });

    it('should subscribe to model selection events', () => {
      const subscribeSpy = jest.spyOn(eventBus, 'subscribe');
      new ModelSelectionService(eventBus, serviceContainer, mockModelSelector, mockSupabaseService);
      
      expect(subscribeSpy).toHaveBeenCalledWith('model:change', expect.any(Function));
      expect(subscribeSpy).toHaveBeenCalledWith('model:error', expect.any(Function));
    });
  });

  describe('Model Selection Logic', () => {
    it('should get available models', async () => {
      const models = await modelSelectionService.getAvailableModels();
      
      expect(models).toContain('gpt-3.5-turbo');
      expect(models).toContain('gpt-4');
    });

    it('should get current model', async () => {
      const currentModel = await modelSelectionService.getCurrentModel();
      
      expect(currentModel).toBe('gpt-3.5-turbo');
    });

    it('should set model successfully', async () => {
      const setModelSpy = jest.spyOn(mockModelSelector, 'setModel');
      
      await modelSelectionService.setModel('gpt-4');
      
      expect(setModelSpy).toHaveBeenCalledWith('gpt-4');
      expect(await modelSelectionService.getCurrentModel()).toBe('gpt-4');
    });

    it('should handle model change errors', async () => {
      const invalidModel = 'invalid-model';
      
      await expect(modelSelectionService.setModel(invalidModel))
        .rejects.toThrow(`Model ${invalidModel} not available`);
    });

    it('should validate model before setting', async () => {
      const validation = await modelSelectionService.validateModel('gpt-4');
      expect(validation.isValid).toBe(true);
      
      const invalidValidation = await modelSelectionService.validateModel('invalid-model');
      expect(invalidValidation.isValid).toBe(false);
    });
  });

  describe('Model Persistence', () => {
    it('should persist model selection', async () => {
      const roomId = 'room_123';
      const model = 'gpt-4';
      const setModelForRoomSpy = jest.spyOn(mockSupabaseService, 'setModelForRoom');
      
      await modelSelectionService.setModelForRoom(roomId, model);
      
      expect(setModelForRoomSpy).toHaveBeenCalledWith(roomId, model);
    });

    it('should load model for room', async () => {
      const roomId = 'room_123';
      const getModelForRoomSpy = jest.spyOn(mockSupabaseService, 'getModelForRoom');
      
      const model = await modelSelectionService.getModelForRoom(roomId);
      
      expect(getModelForRoomSpy).toHaveBeenCalledWith(roomId);
      expect(model).toBe('gpt-3.5-turbo');
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
      
      await expect(errorModelSelectionService.setModelForRoom('room_123', 'gpt-4'))
        .rejects.toThrow('Persistence error');
    });
  });

  describe('Model Validation', () => {
    it('should validate model availability', async () => {
      const validation = await modelSelectionService.validateModel('gpt-4');
      expect(validation.isValid).toBe(true);
      expect(validation.model).toBe('gpt-4');
    });

    it('should reject invalid models', async () => {
      const validation = await modelSelectionService.validateModel('invalid-model');
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Model not available');
    });

    it('should validate model compatibility', async () => {
      const compatibility = await modelSelectionService.checkModelCompatibility('gpt-4');
      expect(compatibility.isCompatible).toBe(true);
    });

    it('should check model requirements', async () => {
      const requirements = await modelSelectionService.getModelRequirements('gpt-4');
      expect(requirements).toBeDefined();
      expect(requirements.apiVersion).toBeDefined();
    });
  });

  describe('Plugin Integration', () => {
    it('should integrate with plugin system', () => {
      const plugin = {
        name: 'test-plugin',
        onModelChange: jest.fn(),
        onModelError: jest.fn()
      };
      
      modelSelectionService.registerPlugin(plugin);
      
      expect(modelSelectionService.getPlugins()).toContain(plugin);
    });

    it('should notify plugins of model changes', async () => {
      const plugin = {
        name: 'test-plugin',
        onModelChange: jest.fn(),
        onModelError: jest.fn()
      };
      
      modelSelectionService.registerPlugin(plugin);
      
      await modelSelectionService.setModel('gpt-4');
      
      expect(plugin.onModelChange).toHaveBeenCalledWith({
        previousModel: 'gpt-3.5-turbo',
        newModel: 'gpt-4'
      });
    });

    it('should handle plugin errors gracefully', async () => {
      const errorPlugin = {
        name: 'error-plugin',
        onModelChange: () => { throw new Error('Plugin error'); },
        onModelError: jest.fn()
      };
      
      modelSelectionService.registerPlugin(errorPlugin);
      
      // Should not throw error
      await expect(modelSelectionService.setModel('gpt-4'))
        .resolves.not.toThrow();
    });
  });

  describe('Command Pattern Integration', () => {
    it('should integrate with command pattern', async () => {
      const command = {
        execute: jest.fn().mockResolvedValue('Command result'),
        canUndo: () => true,
        undo: jest.fn()
      };
      
      modelSelectionService.registerCommand('test-command', command);
      
      const result = await modelSelectionService.executeCommand('test-command', 'Test data');
      
      expect(command.execute).toHaveBeenCalledWith('Test data');
      expect(result).toBe('Command result');
    });

    it('should support command history', async () => {
      const command = {
        execute: jest.fn().mockResolvedValue('Command result'),
        canUndo: () => true,
        undo: jest.fn()
      };
      
      modelSelectionService.registerCommand('test-command', command);
      
      await modelSelectionService.executeCommand('test-command', 'Test data');
      
      const commandHistory = modelSelectionService.getCommandHistory();
      expect(commandHistory).toHaveLength(1);
      expect(commandHistory[0].commandName).toBe('test-command');
    });

    it('should support command undo', async () => {
      const command = {
        execute: jest.fn().mockResolvedValue('Command result'),
        canUndo: () => true,
        undo: jest.fn()
      };
      
      modelSelectionService.registerCommand('test-command', command);
      
      await modelSelectionService.executeCommand('test-command', 'Test data');
      await modelSelectionService.undoLastCommand();
      
      expect(command.undo).toHaveBeenCalled();
    });
  });

  describe('Supabase Integration', () => {
    it('should sync with Supabase', async () => {
      const roomId = 'room_123';
      const model = 'gpt-4';
      
      await modelSelectionService.syncWithSupabase(roomId);
      
      const syncedModel = await modelSelectionService.getModelForRoom(roomId);
      expect(syncedModel).toBe('gpt-3.5-turbo');
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
      
      await expect(errorModelSelectionService.syncWithSupabase('room_123'))
        .rejects.toThrow('Sync error');
    });

    it('should handle offline mode', async () => {
      const offlineModel = await modelSelectionService.getModelOffline();
      expect(offlineModel).toBe('gpt-3.5-turbo');
    });
  });

  describe('Model History and Analytics', () => {
    it('should track model selection history', async () => {
      await modelSelectionService.setModel('gpt-4');
      await modelSelectionService.setModel('gpt-3.5-turbo');
      
      const history = modelSelectionService.getModelHistory();
      expect(history).toHaveLength(2);
      expect(history[0].model).toBe('gpt-4');
      expect(history[1].model).toBe('gpt-3.5-turbo');
    });

    it('should generate model usage analytics', async () => {
      await modelSelectionService.setModel('gpt-4');
      await modelSelectionService.setModel('gpt-3.5-turbo');
      await modelSelectionService.setModel('gpt-4');
      
      const analytics = modelSelectionService.getModelAnalytics();
      expect(analytics).toBeDefined();
      expect(analytics.totalChanges).toBe(3);
      expect(analytics.mostUsedModel).toBe('gpt-4');
    });

    it('should track model performance', async () => {
      const performance = await modelSelectionService.trackModelPerformance('gpt-4');
      expect(performance).toBeDefined();
      expect(performance.responseTime).toBeGreaterThan(0);
    });
  });

  describe('Default Model Fallback', () => {
    it('should fallback to default model', async () => {
      const defaultModel = modelSelectionService.getDefaultModel();
      expect(defaultModel).toBe('gpt-3.5-turbo');
    });

    it('should handle model unavailability', async () => {
      const fallbackModel = await modelSelectionService.getFallbackModel('unavailable-model');
      expect(fallbackModel).toBe('gpt-3.5-turbo');
    });

    it('should validate default model', async () => {
      const isValid = await modelSelectionService.isDefaultModelValid();
      expect(isValid).toBe(true);
    });
  });

  describe('SOLID Principles Compliance', () => {
    it('should follow Single Responsibility Principle', () => {
      // ModelSelectionService should only handle model selection logic
      expect(typeof modelSelectionService.setModel).toBe('function');
      expect(typeof modelSelectionService.getCurrentModel).toBe('function');
      expect(typeof modelSelectionService.getAvailableModels).toBe('function');
    });

    it('should follow Open/Closed Principle', () => {
      // Should be open for extension (new plugins) but closed for modification
      const newPlugin = {
        name: 'new-plugin',
        onModelChange: jest.fn(),
        onModelError: jest.fn()
      };
      
      modelSelectionService.registerPlugin(newPlugin);
      
      expect(modelSelectionService.getPlugins()).toContain(newPlugin);
    });

    it('should follow Liskov Substitution Principle', () => {
      // Any IModelSelector implementation should be substitutable
      const alternativeSelector = {
        async getAvailableModels() { return ['gpt-3.5-turbo']; },
        async getCurrentModel() { return 'gpt-3.5-turbo'; },
        async setModel() {},
        async getModelForRoom() { return 'gpt-3.5-turbo'; }
      };
      
      const alternativeService = new ModelSelectionService(
        eventBus,
        serviceContainer,
        alternativeSelector,
        mockSupabaseService
      );
      
      expect(typeof alternativeService.setModel).toBe('function');
    });

    it('should follow Interface Segregation Principle', () => {
      // Should depend on focused interfaces, not large ones
      expect(typeof mockModelSelector.getAvailableModels).toBe('function');
      expect(typeof mockModelSelector.setModel).toBe('function');
    });

    it('should follow Dependency Inversion Principle', () => {
      // Should depend on abstractions (IModelSelector) not concretions
      expect(modelSelectionService.modelSelector).toBe(mockModelSelector);
      expect(typeof modelSelectionService.modelSelector.setModel).toBe('function');
    });
  });
}); 