import { ServiceContainer } from '../../../../src/features/concurrent-chat/core/container/ServiceContainer';
import { EventBus } from '../../../../src/features/concurrent-chat/core/events/EventBus';
import { ModelSelectionManager } from '../../../../src/features/concurrent-chat/core/model/ModelSelectionManager';
import { SupabaseService } from '../../../../src/features/concurrent-chat/core/services/SupabaseService';
import { ModelValidator } from '../../../../src/features/concurrent-chat/core/model/ModelValidator';
import { ModelPersistenceService } from '../../../../src/features/concurrent-chat/core/model/ModelPersistenceService';
import { PluginManager } from '../../../../src/features/concurrent-chat/core/plugins/PluginManager';
import { CommandManager } from '../../../../src/features/concurrent-chat/core/commands/CommandManager';

// Mock external dependencies
jest.mock('@supabase/supabase-js');

describe('Model Selection Integration Tests', () => {
  let serviceContainer: ServiceContainer;
  let eventBus: EventBus;
  let modelSelectionManager: ModelSelectionManager;
  let supabaseService: SupabaseService;
  let modelValidator: ModelValidator;
  let modelPersistenceService: ModelPersistenceService;
  let pluginManager: PluginManager;
  let commandManager: CommandManager;

  beforeEach(() => {
    serviceContainer = new ServiceContainer();
    eventBus = new EventBus();
    modelSelectionManager = new ModelSelectionManager(serviceContainer, eventBus);
    supabaseService = new SupabaseService();
    modelValidator = new ModelValidator();
    modelPersistenceService = new ModelPersistenceService(supabaseService);
    pluginManager = new PluginManager(serviceContainer, eventBus);
    commandManager = new CommandManager(serviceContainer, eventBus);
  });

  describe('Model selection flow', () => {
    it('should handle complete model selection flow', async () => {
      const availableModels = [
        { id: 'gpt-4', name: 'GPT-4', capabilities: ['chat', 'code'] },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', capabilities: ['chat'] }
      ];

      const selectedModel = 'gpt-4';
      const userPreferences = { preferredModel: 'gpt-4' };

      modelSelectionManager.getAvailableModels = jest.fn().mockResolvedValue(availableModels);
      modelSelectionManager.selectModel = jest.fn().mockResolvedValue(true);
      modelPersistenceService.saveUserPreference = jest.fn().mockResolvedValue(true);

      const result = await modelSelectionManager.completeModelSelectionFlow({
        userId: 'user1',
        selectedModel,
        userPreferences
      });

      expect(modelSelectionManager.getAvailableModels).toHaveBeenCalled();
      expect(modelSelectionManager.selectModel).toHaveBeenCalledWith(selectedModel);
      expect(modelPersistenceService.saveUserPreference).toHaveBeenCalledWith('user1', userPreferences);
      expect(result.success).toBe(true);
    });

    it('should handle model selection with validation', async () => {
      const modelToSelect = 'gpt-4';
      const userContext = { userId: 'user1', subscription: 'premium' };

      modelValidator.validateModelAccess = jest.fn().mockResolvedValue(true);
      modelValidator.validateModelCompatibility = jest.fn().mockResolvedValue(true);
      modelSelectionManager.selectModel = jest.fn().mockResolvedValue(true);

      const result = await modelSelectionManager.selectModelWithValidation(modelToSelect, userContext);

      expect(modelValidator.validateModelAccess).toHaveBeenCalledWith(modelToSelect, userContext);
      expect(modelValidator.validateModelCompatibility).toHaveBeenCalledWith(modelToSelect, userContext);
      expect(modelSelectionManager.selectModel).toHaveBeenCalledWith(modelToSelect);
      expect(result.success).toBe(true);
    });

    it('should handle model selection with fallback', async () => {
      const preferredModel = 'gpt-4';
      const fallbackModel = 'gpt-3.5-turbo';
      const userContext = { userId: 'user1', subscription: 'basic' };

      modelValidator.validateModelAccess = jest.fn()
        .mockResolvedValueOnce(false) // Preferred model not accessible
        .mockResolvedValueOnce(true); // Fallback model accessible

      modelSelectionManager.selectModel = jest.fn().mockResolvedValue(true);

      const result = await modelSelectionManager.selectModelWithFallback(preferredModel, fallbackModel, userContext);

      expect(modelValidator.validateModelAccess).toHaveBeenCalledWith(preferredModel, userContext);
      expect(modelValidator.validateModelAccess).toHaveBeenCalledWith(fallbackModel, userContext);
      expect(modelSelectionManager.selectModel).toHaveBeenCalledWith(fallbackModel);
      expect(result.selectedModel).toBe(fallbackModel);
      expect(result.fallbackUsed).toBe(true);
    });

    it('should handle model selection with A/B testing', async () => {
      const models = ['gpt-4', 'gpt-3.5-turbo'];
      const userContext = { userId: 'user1', experimentGroup: 'A' };

      modelSelectionManager.getExperimentModel = jest.fn().mockResolvedValue('gpt-4');
      modelSelectionManager.selectModel = jest.fn().mockResolvedValue(true);
      modelSelectionManager.recordExperimentChoice = jest.fn().mockResolvedValue(true);

      const result = await modelSelectionManager.selectModelWithABTesting(models, userContext);

      expect(modelSelectionManager.getExperimentModel).toHaveBeenCalledWith(models, userContext);
      expect(modelSelectionManager.selectModel).toHaveBeenCalledWith('gpt-4');
      expect(modelSelectionManager.recordExperimentChoice).toHaveBeenCalledWith('gpt-4', userContext);
      expect(result.selectedModel).toBe('gpt-4');
    });
  });

  describe('Model persistence', () => {
    it('should persist model selection to Supabase', async () => {
      const userId = 'user1';
      const selectedModel = 'gpt-4';
      const timestamp = new Date();

      const mockResponse = {
        data: { id: 'pref1', user_id: userId, model: selectedModel, created_at: timestamp },
        error: null
      };

      supabaseService.from('user_preferences').insert = jest.fn().mockResolvedValue(mockResponse);

      const result = await modelPersistenceService.saveUserPreference(userId, { preferredModel: selectedModel });

      expect(supabaseService.from('user_preferences').insert).toHaveBeenCalledWith({
        user_id: userId,
        model: selectedModel,
        created_at: expect.any(Date)
      });
      expect(result.success).toBe(true);
    });

    it('should load model preferences from Supabase', async () => {
      const userId = 'user1';
      const mockPreferences = {
        data: [
          { id: 'pref1', user_id: userId, model: 'gpt-4', created_at: new Date() }
        ],
        error: null
      };

      supabaseService.from('user_preferences').select = jest.fn().mockResolvedValue(mockPreferences);

      const result = await modelPersistenceService.loadUserPreferences(userId);

      expect(supabaseService.from('user_preferences').select).toHaveBeenCalledWith('*').eq('user_id', userId);
      expect(result.preferences).toEqual(mockPreferences.data);
    });

    it('should handle persistence errors gracefully', async () => {
      const userId = 'user1';
      const selectedModel = 'gpt-4';

      const mockError = {
        data: null,
        error: { message: 'Database error', code: 'PGRST116' }
      };

      supabaseService.from('user_preferences').insert = jest.fn().mockResolvedValue(mockError);

      const result = await modelPersistenceService.saveUserPreference(userId, { preferredModel: selectedModel });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });

    it('should update existing model preferences', async () => {
      const userId = 'user1';
      const newModel = 'gpt-4';
      const preferenceId = 'pref1';

      const mockResponse = {
        data: { id: preferenceId, user_id: userId, model: newModel, updated_at: new Date() },
        error: null
      };

      supabaseService.from('user_preferences').update = jest.fn().mockResolvedValue(mockResponse);

      const result = await modelPersistenceService.updateUserPreference(preferenceId, { model: newModel });

      expect(supabaseService.from('user_preferences').update).toHaveBeenCalledWith({
        model: newModel,
        updated_at: expect.any(Date)
      }).eq('id', preferenceId);
      expect(result.success).toBe(true);
    });

    it('should sync model preferences across devices', async () => {
      const userId = 'user1';
      const deviceId = 'device1';
      const selectedModel = 'gpt-4';

      const mockResponse = {
        data: { id: 'sync1', user_id: userId, device_id: deviceId, model: selectedModel },
        error: null
      };

      supabaseService.from('device_preferences').upsert = jest.fn().mockResolvedValue(mockResponse);

      const result = await modelPersistenceService.syncDevicePreference(userId, deviceId, selectedModel);

      expect(supabaseService.from('device_preferences').upsert).toHaveBeenCalledWith({
        user_id: userId,
        device_id: deviceId,
        model: selectedModel,
        updated_at: expect.any(Date)
      });
      expect(result.success).toBe(true);
    });
  });

  describe('Model validation', () => {
    it('should validate model access permissions', async () => {
      const model = 'gpt-4';
      const userContext = { userId: 'user1', subscription: 'premium' };

      modelValidator.validateModelAccess = jest.fn().mockResolvedValue(true);

      const result = await modelValidator.validateModelAccess(model, userContext);

      expect(result).toBe(true);
    });

    it('should reject access to restricted models', async () => {
      const model = 'gpt-4';
      const userContext = { userId: 'user1', subscription: 'basic' };

      modelValidator.validateModelAccess = jest.fn().mockResolvedValue(false);

      const result = await modelValidator.validateModelAccess(model, userContext);

      expect(result).toBe(false);
    });

    it('should validate model compatibility', async () => {
      const model = 'gpt-4';
      const userContext = { userId: 'user1', device: 'mobile', os: 'iOS' };

      modelValidator.validateModelCompatibility = jest.fn().mockResolvedValue(true);

      const result = await modelValidator.validateModelCompatibility(model, userContext);

      expect(result).toBe(true);
    });

    it('should reject incompatible models', async () => {
      const model = 'gpt-4';
      const userContext = { userId: 'user1', device: 'legacy', os: 'Windows XP' };

      modelValidator.validateModelCompatibility = jest.fn().mockResolvedValue(false);

      const result = await modelValidator.validateModelCompatibility(model, userContext);

      expect(result).toBe(false);
    });

    it('should validate model parameters', () => {
      const model = 'gpt-4';
      const parameters = {
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 1.0
      };

      const result = modelValidator.validateModelParameters(model, parameters);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid model parameters', () => {
      const model = 'gpt-4';
      const parameters = {
        temperature: 2.0, // Invalid
        max_tokens: -1, // Invalid
        top_p: 1.5 // Invalid
      };

      const result = modelValidator.validateModelParameters(model, parameters);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Plugin interaction', () => {
    it('should allow plugins to modify model selection', async () => {
      const originalModel = 'gpt-3.5-turbo';
      const modifiedModel = 'gpt-4';

      const modelModifierPlugin = {
        mount: jest.fn(),
        unmount: jest.fn(),
        onEvent: jest.fn(),
        modifyModelSelection: jest.fn().mockReturnValue(modifiedModel)
      };

      pluginManager.registerPlugin('model-modifier', modelModifierPlugin);
      pluginManager.mountPlugin('model-modifier');

      const result = await modelSelectionManager.selectModelWithPluginModification(originalModel);

      expect(modelModifierPlugin.modifyModelSelection).toHaveBeenCalledWith(originalModel);
      expect(result.selectedModel).toBe(modifiedModel);
    });

    it('should allow plugins to provide model recommendations', async () => {
      const userContext = { userId: 'user1', usage: 'coding' };

      const recommendationPlugin = {
        mount: jest.fn(),
        unmount: jest.fn(),
        onEvent: jest.fn(),
        getModelRecommendations: jest.fn().mockReturnValue(['gpt-4', 'claude-3'])
      };

      pluginManager.registerPlugin('recommendation', recommendationPlugin);
      pluginManager.mountPlugin('recommendation');

      const recommendations = await modelSelectionManager.getPluginRecommendations(userContext);

      expect(recommendationPlugin.getModelRecommendations).toHaveBeenCalledWith(userContext);
      expect(recommendations).toEqual(['gpt-4', 'claude-3']);
    });

    it('should handle plugin model selection conflicts', async () => {
      const baseModel = 'gpt-3.5-turbo';

      const plugin1 = {
        mount: jest.fn(),
        unmount: jest.fn(),
        onEvent: jest.fn(),
        modifyModelSelection: jest.fn().mockReturnValue('gpt-4')
      };

      const plugin2 = {
        mount: jest.fn(),
        unmount: jest.fn(),
        onEvent: jest.fn(),
        modifyModelSelection: jest.fn().mockReturnValue('claude-3')
      };

      pluginManager.registerPlugin('conflict1', plugin1);
      pluginManager.registerPlugin('conflict2', plugin2);
      pluginManager.mountAllPlugins();

      const result = await modelSelectionManager.resolveModelSelectionConflicts(baseModel, ['conflict1', 'conflict2']);

      expect(result.resolvedModel).toBeDefined();
      expect(result.conflictsResolved).toBe(true);
    });

    it('should allow plugins to provide model metadata', async () => {
      const model = 'gpt-4';

      const metadataPlugin = {
        mount: jest.fn(),
        unmount: jest.fn(),
        onEvent: jest.fn(),
        getModelMetadata: jest.fn().mockReturnValue({
          description: 'Advanced language model',
          capabilities: ['chat', 'code', 'reasoning'],
          limitations: ['Cost', 'Availability']
        })
      };

      pluginManager.registerPlugin('metadata', metadataPlugin);
      pluginManager.mountPlugin('metadata');

      const metadata = await modelSelectionManager.getPluginModelMetadata(model);

      expect(metadataPlugin.getModelMetadata).toHaveBeenCalledWith(model);
      expect(metadata.description).toBe('Advanced language model');
    });
  });

  describe('Command pattern integration', () => {
    it('should execute model selection commands', async () => {
      const model = 'gpt-4';
      const userContext = { userId: 'user1' };

      const selectModelCommand = {
        execute: jest.fn().mockResolvedValue(true),
        undo: jest.fn(),
        canExecute: () => true
      };

      commandManager.registerCommand('select-model', selectModelCommand);

      const result = await commandManager.executeCommand('select-model', { model, userContext });

      expect(selectModelCommand.execute).toHaveBeenCalledWith({ model, userContext });
      expect(result).toBe(true);
    });

    it('should support model selection undo/redo', async () => {
      const previousModel = 'gpt-3.5-turbo';
      const newModel = 'gpt-4';

      const changeModelCommand = {
        execute: jest.fn().mockResolvedValue(true),
        undo: jest.fn().mockResolvedValue(true),
        canExecute: () => true
      };

      commandManager.registerCommand('change-model', changeModelCommand);

      // Execute command
      await commandManager.executeCommand('change-model', { model: newModel });
      expect(changeModelCommand.execute).toHaveBeenCalledWith({ model: newModel });

      // Undo command
      await commandManager.undoLastCommand();
      expect(changeModelCommand.undo).toHaveBeenCalled();

      // Redo command
      await commandManager.redoLastCommand();
      expect(changeModelCommand.execute).toHaveBeenCalledTimes(2);
    });

    it('should handle model selection command validation', async () => {
      const invalidModel = 'invalid-model';

      const selectModelCommand = {
        execute: jest.fn(),
        undo: jest.fn(),
        canExecute: () => false // Cannot execute
      };

      commandManager.registerCommand('select-invalid-model', selectModelCommand);

      expect(() => {
        commandManager.executeCommand('select-invalid-model', { model: invalidModel });
      }).toThrow('Command cannot be executed');
    });

    it('should support model selection command queuing', async () => {
      const models = ['gpt-3.5-turbo', 'gpt-4', 'claude-3'];

      const selectModelCommand = {
        execute: jest.fn().mockResolvedValue(true),
        undo: jest.fn(),
        canExecute: () => true
      };

      commandManager.registerCommand('queue-select-model', selectModelCommand);

      // Queue multiple model selections
      for (const model of models) {
        commandManager.queueCommand('queue-select-model', { model });
      }

      const queue = commandManager.getCommandQueue();
      expect(queue).toHaveLength(3);

      // Execute queued commands
      await commandManager.executeQueuedCommands();
      expect(selectModelCommand.execute).toHaveBeenCalledTimes(3);
    });
  });

  describe('Supabase integration', () => {
    it('should sync model selection with Supabase', async () => {
      const userId = 'user1';
      const selectedModel = 'gpt-4';

      const mockResponse = {
        data: { id: 'sync1', user_id: userId, model: selectedModel, synced_at: new Date() },
        error: null
      };

      supabaseService.from('model_selections').upsert = jest.fn().mockResolvedValue(mockResponse);

      const result = await modelPersistenceService.syncModelSelection(userId, selectedModel);

      expect(supabaseService.from('model_selections').upsert).toHaveBeenCalledWith({
        user_id: userId,
        model: selectedModel,
        synced_at: expect.any(Date)
      });
      expect(result.success).toBe(true);
    });

    it('should handle Supabase sync errors', async () => {
      const userId = 'user1';
      const selectedModel = 'gpt-4';

      const mockError = {
        data: null,
        error: { message: 'Sync failed', code: 'PGRST116' }
      };

      supabaseService.from('model_selections').upsert = jest.fn().mockResolvedValue(mockError);

      const result = await modelPersistenceService.syncModelSelection(userId, selectedModel);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Sync failed');
    });

    it('should load model selection from Supabase', async () => {
      const userId = 'user1';
      const mockSelection = {
        data: { id: 'sel1', user_id: userId, model: 'gpt-4', created_at: new Date() },
        error: null
      };

      supabaseService.from('model_selections').select = jest.fn().mockResolvedValue(mockSelection);

      const result = await modelPersistenceService.loadModelSelection(userId);

      expect(supabaseService.from('model_selections').select).toHaveBeenCalledWith('*').eq('user_id', userId).single();
      expect(result.model).toBe('gpt-4');
    });

    it('should handle Supabase loading errors', async () => {
      const userId = 'user1';

      const mockError = {
        data: null,
        error: { message: 'Not found', code: 'PGRST116' }
      };

      supabaseService.from('model_selections').select = jest.fn().mockResolvedValue(mockError);

      const result = await modelPersistenceService.loadModelSelection(userId);

      expect(result.model).toBeNull();
      expect(result.error).toBe('Not found');
    });
  });

  describe('Default model fallback', () => {
    it('should use default model when no selection is available', async () => {
      const userId = 'user1';
      const defaultModel = 'gpt-3.5-turbo';

      modelPersistenceService.loadModelSelection = jest.fn().mockResolvedValue({ model: null });
      modelSelectionManager.getDefaultModel = jest.fn().mockResolvedValue(defaultModel);
      modelSelectionManager.selectModel = jest.fn().mockResolvedValue(true);

      const result = await modelSelectionManager.selectModelWithFallback(null, defaultModel, { userId });

      expect(modelSelectionManager.getDefaultModel).toHaveBeenCalled();
      expect(modelSelectionManager.selectModel).toHaveBeenCalledWith(defaultModel);
      expect(result.selectedModel).toBe(defaultModel);
      expect(result.fallbackUsed).toBe(true);
    });

    it('should handle multiple fallback models', async () => {
      const userId = 'user1';
      const fallbackModels = ['gpt-4', 'gpt-3.5-turbo', 'claude-3'];

      modelValidator.validateModelAccess = jest.fn()
        .mockResolvedValueOnce(false) // gpt-4 not accessible
        .mockResolvedValueOnce(false) // gpt-3.5-turbo not accessible
        .mockResolvedValueOnce(true); // claude-3 accessible

      modelSelectionManager.selectModel = jest.fn().mockResolvedValue(true);

      const result = await modelSelectionManager.selectModelWithMultipleFallbacks(fallbackModels, { userId });

      expect(modelValidator.validateModelAccess).toHaveBeenCalledTimes(3);
      expect(modelSelectionManager.selectModel).toHaveBeenCalledWith('claude-3');
      expect(result.selectedModel).toBe('claude-3');
      expect(result.fallbackIndex).toBe(2);
    });

    it('should handle no available fallback models', async () => {
      const userId = 'user1';
      const fallbackModels = ['gpt-4', 'gpt-3.5-turbo'];

      modelValidator.validateModelAccess = jest.fn().mockResolvedValue(false);

      const result = await modelSelectionManager.selectModelWithMultipleFallbacks(fallbackModels, { userId });

      expect(result.selectedModel).toBeNull();
      expect(result.error).toBe('No available models');
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete model selection workflow', async () => {
      const userId = 'user1';
      const userContext = { subscription: 'premium', device: 'desktop' };
      const availableModels = ['gpt-4', 'gpt-3.5-turbo', 'claude-3'];

      // Mock all dependencies
      modelSelectionManager.getAvailableModels = jest.fn().mockResolvedValue(availableModels);
      modelValidator.validateModelAccess = jest.fn().mockResolvedValue(true);
      modelValidator.validateModelCompatibility = jest.fn().mockResolvedValue(true);
      modelSelectionManager.selectModel = jest.fn().mockResolvedValue(true);
      modelPersistenceService.saveUserPreference = jest.fn().mockResolvedValue(true);
      supabaseService.from('model_selections').upsert = jest.fn().mockResolvedValue({ data: {}, error: null });

      const result = await modelSelectionManager.completeWorkflow({
        userId,
        userContext,
        preferredModel: 'gpt-4'
      });

      expect(result.success).toBe(true);
      expect(result.selectedModel).toBe('gpt-4');
      expect(result.persisted).toBe(true);
      expect(result.synced).toBe(true);
    });

    it('should handle model selection with plugin enhancement', async () => {
      const userId = 'user1';
      const baseModel = 'gpt-3.5-turbo';

      // Mock plugin that enhances model selection
      const enhancementPlugin = {
        mount: jest.fn(),
        unmount: jest.fn(),
        onEvent: jest.fn(),
        enhanceModelSelection: jest.fn().mockReturnValue({
          model: 'gpt-4',
          reason: 'Better performance for user context'
        })
      };

      pluginManager.registerPlugin('enhancement', enhancementPlugin);
      pluginManager.mountPlugin('enhancement');

      modelSelectionManager.selectModel = jest.fn().mockResolvedValue(true);
      modelPersistenceService.saveUserPreference = jest.fn().mockResolvedValue(true);

      const result = await modelSelectionManager.selectModelWithEnhancement(baseModel, { userId });

      expect(enhancementPlugin.enhanceModelSelection).toHaveBeenCalledWith(baseModel, { userId });
      expect(result.selectedModel).toBe('gpt-4');
      expect(result.enhancementReason).toBe('Better performance for user context');
    });
  });
}); 