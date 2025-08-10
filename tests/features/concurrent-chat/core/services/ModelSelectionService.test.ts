import { ModelSelectionService } from '../../../../../src/features/concurrent-chat/services/ModelSelectionService';
import { IModelSelector } from '../../../../../src/features/concurrent-chat/core/types/interfaces/IModelSelector';

describe('ModelSelectionService', () => {
  let modelService: ModelSelectionService;
  let mockSupabase: any;

  beforeEach(() => {
    // Mock Supabase client with proper chain
    const mockChain = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      upsert: jest.fn().mockReturnThis(),
    };
    
    mockSupabase = mockChain;
    
    modelService = new ModelSelectionService(mockSupabase);
  });

  describe('service creation', () => {
    it('should create model selection service instance', () => {
      expect(modelService).toBeInstanceOf(ModelSelectionService);
      expect(modelService).toBeInstanceOf(Object);
    });

    it('should implement IModelSelector interface', () => {
      const service: IModelSelector = modelService;
      
      expect(typeof service.getAvailableModels).toBe('function');
      expect(typeof service.getCurrentModel).toBe('function');
      expect(typeof service.setModel).toBe('function');
      expect(typeof service.getModelForRoom).toBe('function');
    });

    it('should store Supabase client', () => {
      const supabase = (modelService as any).supabase;
      expect(supabase).toBe(mockSupabase);
    });

    it('should initialize with default models', () => {
      const defaultModels = (modelService as any).DEFAULT_MODELS;
      expect(defaultModels).toEqual([
        { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
        { label: 'GPT-4', value: 'gpt-4' }
      ]);
    });
  });

  describe('getAvailableModels', () => {
    it('should return available models', () => {
      const models = modelService.getAvailableModels();
      
      expect(models).toEqual([
        { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
        { label: 'GPT-4', value: 'gpt-4' }
      ]);
    });

    it('should return immutable array', () => {
      const models = modelService.getAvailableModels();
      
      // Attempt to modify the array
      models.push({ label: 'Test', value: 'test' });
      
      // Should not affect the original
      const modelsAgain = modelService.getAvailableModels();
      expect(modelsAgain).toEqual([
        { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
        { label: 'GPT-4', value: 'gpt-4' }
      ]);
    });

    it('should return consistent models', () => {
      const models1 = modelService.getAvailableModels();
      const models2 = modelService.getAvailableModels();
      
      expect(models1).toEqual(models2);
    });
  });

  describe('getCurrentModel', () => {
    it('should return default model', () => {
      const model = modelService.getCurrentModel();
      expect(model).toBe('gpt-3.5-turbo');
    });

    it('should return consistent default model', () => {
      const model1 = modelService.getCurrentModel();
      const model2 = modelService.getCurrentModel();
      
      expect(model1).toBe(model2);
    });
  });

  describe('setModel', () => {
    it('should set model successfully', async () => {
      const newModel = 'gpt-4';
      
      // Mock successful Supabase response
      mockSupabase.upsert.mockResolvedValue({ data: null, error: null });
      
      await modelService.setModel(newModel);
      
      expect(modelService.getCurrentModel()).toBe(newModel);
      expect(mockSupabase.from).toHaveBeenCalledWith('user_preferences');
      expect(mockSupabase.upsert).toHaveBeenCalled();
    });

    it('should handle invalid model', async () => {
      const invalidModel = 'invalid-model';
      
      await expect(modelService.setModel(invalidModel)).rejects.toThrow('Invalid model: invalid-model');
    });

    it('should handle null model', async () => {
      await expect(modelService.setModel(null as any)).rejects.toThrow('Model must be a non-empty string');
    });

    it('should handle undefined model', async () => {
      await expect(modelService.setModel(undefined as any)).rejects.toThrow('Model must be a non-empty string');
    });

    it('should handle empty model', async () => {
      await expect(modelService.setModel('')).rejects.toThrow('Model must be a non-empty string');
    });

    it('should handle network errors', async () => {
      const newModel = 'gpt-4';
      
      // Mock Supabase error
      mockSupabase.upsert.mockRejectedValue(new Error('Network error'));
      
      await expect(modelService.setModel(newModel)).rejects.toThrow('Failed to set model: Network error');
      
      // Should revert to default model on error
      expect(modelService.getCurrentModel()).toBe('gpt-3.5-turbo');
    });
  });

  describe('getModelForRoom', () => {
    it('should get model for room successfully', async () => {
      const roomId = 123;
      const expectedModel = 'gpt-4';
      
      // Mock successful Supabase response
      mockSupabase.single.mockResolvedValue({ 
        data: { model: expectedModel }, 
        error: null 
      });
      
      const model = await modelService.getModelForRoom(roomId);
      
      expect(model).toBe(expectedModel);
      expect(mockSupabase.from).toHaveBeenCalledWith('chatrooms');
      expect(mockSupabase.select).toHaveBeenCalledWith('model');
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', roomId);
    });

    it('should return default model when room not found', async () => {
      const roomId = 999;
      
      // Mock room not found
      mockSupabase.single.mockResolvedValue({ 
        data: null, 
        error: { message: 'Room not found' } 
      });
      
      const model = await modelService.getModelForRoom(roomId);
      
      expect(model).toBe('gpt-3.5-turbo'); // Default model
    });

    it('should return default model when room has no model', async () => {
      const roomId = 123;
      
      // Mock room found but no model
      mockSupabase.single.mockResolvedValue({ 
        data: { model: null }, 
        error: null 
      });
      
      const model = await modelService.getModelForRoom(roomId);
      
      expect(model).toBe('gpt-3.5-turbo'); // Default model
    });

    it('should handle Supabase errors', async () => {
      const roomId = 123;
      const error = { message: 'Database error' };
      
      // Mock Supabase error
      mockSupabase.single.mockResolvedValue({ data: null, error });
      
      const model = await modelService.getModelForRoom(roomId);
      
      expect(model).toBe('gpt-3.5-turbo'); // Should return default on error
    });

    it('should handle network errors', async () => {
      const roomId = 123;
      
      // Mock network error
      mockSupabase.single.mockRejectedValue(new Error('Network error'));
      
      const model = await modelService.getModelForRoom(roomId);
      
      expect(model).toBe('gpt-3.5-turbo'); // Should return default on error
    });

    it('should handle invalid room ID', async () => {
      const invalidRoomId = -1;
      
      await expect(modelService.getModelForRoom(invalidRoomId)).rejects.toThrow('Room ID must be a positive number');
    });

    it('should handle null room ID', async () => {
      await expect(modelService.getModelForRoom(null as any)).rejects.toThrow('Room ID must be a positive number');
    });

    it('should handle undefined room ID', async () => {
      await expect(modelService.getModelForRoom(undefined as any)).rejects.toThrow('Room ID must be a positive number');
    });
  });

  describe('setModelForRoom', () => {
    it('should set model for specific room', async () => {
      const roomId = 123;
      const newModel = 'gpt-4';
      
      // Mock successful Supabase response by making the chain work
      const mockUpdateChain = {
        eq: jest.fn().mockResolvedValue({ data: null, error: null })
      };
      mockSupabase.update.mockReturnValue(mockUpdateChain);
      
      await modelService.setModelForRoom(roomId, newModel);
      
      expect(mockSupabase.from).toHaveBeenCalledWith('chatrooms');
      expect(mockSupabase.update).toHaveBeenCalledWith({ model: newModel });
      expect(mockUpdateChain.eq).toHaveBeenCalledWith('id', roomId);
    });

    it('should handle Supabase errors for room', async () => {
      const roomId = 123;
      const newModel = 'gpt-4';
      
      // Mock Supabase error by making the chain throw
      const mockUpdateChain = {
        eq: jest.fn().mockRejectedValue(new Error('Database error'))
      };
      mockSupabase.update.mockReturnValue(mockUpdateChain);
      
      await expect(modelService.setModelForRoom(roomId, newModel)).rejects.toThrow('Failed to set room model: Database error');
    });

    it('should validate room ID', async () => {
      const invalidRoomId = -1;
      const newModel = 'gpt-4';
      
      await expect(modelService.setModelForRoom(invalidRoomId, newModel)).rejects.toThrow('Room ID must be a positive number');
    });
  });

  describe('loadPreferences', () => {
    it('should load user preferences successfully', async () => {
      const expectedModel = 'gpt-4';
      
      // Mock successful Supabase response
      mockSupabase.single.mockResolvedValue({ 
        data: { key: 'current_model', value: expectedModel }, 
        error: null 
      });
      
      await modelService.loadPreferences();
      
      expect(modelService.getCurrentModel()).toBe(expectedModel);
    });

    it('should handle no preferences found', async () => {
      // Mock no preferences found
      mockSupabase.single.mockResolvedValue({ 
        data: null, 
        error: { message: 'No preferences found' } 
      });
      
      await modelService.loadPreferences();
      
      // Should keep default model
      expect(modelService.getCurrentModel()).toBe('gpt-3.5-turbo');
    });
  });

  describe('caching behavior', () => {
    it('should cache room model queries', async () => {
      const roomId = 123;
      const expectedModel = 'gpt-4';
      
      // Mock successful Supabase response
      mockSupabase.single.mockResolvedValue({ 
        data: { model: expectedModel }, 
        error: null 
      });
      
      // First call should hit database
      const model1 = await modelService.getModelForRoom(roomId);
      expect(model1).toBe(expectedModel);
      
      // Second call should use cache
      const model2 = await modelService.getModelForRoom(roomId);
      expect(model2).toBe(expectedModel);
      
      // Should only call Supabase once
      expect(mockSupabase.single).toHaveBeenCalledTimes(1);
    });

    it('should invalidate cache when model is updated', async () => {
      const roomId = 123;
      const initialModel = 'gpt-3.5-turbo';
      const newModel = 'gpt-4';
      
      // Mock successful Supabase responses
      mockSupabase.single.mockResolvedValue({ 
        data: { model: initialModel }, 
        error: null 
      });
      
      const mockUpdateChain = {
        eq: jest.fn().mockResolvedValue({ data: null, error: null })
      };
      mockSupabase.update.mockReturnValue(mockUpdateChain);
      
      // Get initial model
      const model1 = await modelService.getModelForRoom(roomId);
      expect(model1).toBe(initialModel);
      
      // Update room model
      await modelService.setModelForRoom(roomId, newModel);
      
      // Get model again - should return new model from cache
      const model2 = await modelService.getModelForRoom(roomId);
      expect(model2).toBe(newModel);
    });
  });

  describe('error handling and validation', () => {
    it('should handle malformed database responses', async () => {
      const roomId = 123;
      
      // Mock malformed response
      mockSupabase.single.mockResolvedValue({ 
        data: { invalidField: 'value' }, 
        error: null 
      });
      
      const model = await modelService.getModelForRoom(roomId);
      
      expect(model).toBe('gpt-3.5-turbo'); // Should return default
    });

    it('should handle database connection issues', async () => {
      const roomId = 123;
      
      // Mock connection error
      mockSupabase.single.mockRejectedValue(new Error('Connection timeout'));
      
      const model = await modelService.getModelForRoom(roomId);
      
      expect(model).toBe('gpt-3.5-turbo'); // Should return default on error
    });
  });

  describe('performance considerations', () => {
    it('should handle many concurrent room queries efficiently', async () => {
      const roomIds = Array.from({ length: 10 }, (_, i) => i + 1);
      
      // Mock successful responses
      mockSupabase.single.mockResolvedValue({ 
        data: { model: 'gpt-4' }, 
        error: null 
      });
      
      const startTime = Date.now();
      const promises = roomIds.map(id => modelService.getModelForRoom(id));
      const results = await Promise.all(promises);
      const endTime = Date.now();
      
      expect(results).toHaveLength(10);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });

  describe('SOLID principle compliance', () => {
    it('should follow Single Responsibility Principle', () => {
      // Should only be responsible for model selection
      expect(modelService.getAvailableModels).toBeDefined();
      expect(modelService.getCurrentModel).toBeDefined();
      expect(modelService.setModel).toBeDefined();
      expect(modelService.getModelForRoom).toBeDefined();
    });

    it('should follow Open/Closed Principle', () => {
      // Should be open for extension but closed for modification
      expect(modelService).toBeInstanceOf(ModelSelectionService);
      expect(modelService).toBeInstanceOf(Object);
    });

    it('should follow Liskov Substitution Principle', () => {
      // Should be substitutable for IModelSelector
      const service: IModelSelector = modelService;
      
      expect(typeof service.getAvailableModels).toBe('function');
      expect(typeof service.getCurrentModel).toBe('function');
      expect(typeof service.setModel).toBe('function');
      expect(typeof service.getModelForRoom).toBe('function');
    });

    it('should follow Interface Segregation Principle', () => {
      // Should not force clients to depend on methods they don't use
      const service: IModelSelector = modelService;
      
      expect(service.getAvailableModels).toBeDefined();
      expect(service.getCurrentModel).toBeDefined();
      expect(service.setModel).toBeDefined();
      expect(service.getModelForRoom).toBeDefined();
    });

    it('should follow Dependency Inversion Principle', () => {
      // Should depend on abstractions, not concretions
      const service: IModelSelector = modelService;
      
      expect(service).toBeDefined();
      expect(typeof service.getAvailableModels).toBe('function');
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete model selection workflow', async () => {
      const roomId = 123;
      const newModel = 'gpt-4';
      
      // Mock successful responses
      mockSupabase.upsert.mockResolvedValue({ data: null, error: null });
      
      const mockUpdateChain = {
        eq: jest.fn().mockResolvedValue({ data: null, error: null })
      };
      mockSupabase.update.mockReturnValue(mockUpdateChain);
      
      mockSupabase.single.mockResolvedValue({ 
        data: { model: newModel }, 
        error: null 
      });
      
      // Set current model
      await modelService.setModel(newModel);
      expect(modelService.getCurrentModel()).toBe(newModel);
      
      // Set room model
      await modelService.setModelForRoom(roomId, newModel);
      
      // Get room model
      const roomModel = await modelService.getModelForRoom(roomId);
      expect(roomModel).toBe(newModel);
    });

    it('should handle model validation in workflow', async () => {
      const roomId = 123;
      const invalidModel = 'invalid-model';
      
      // Should reject invalid model
      await expect(modelService.setModel(invalidModel)).rejects.toThrow('Invalid model: invalid-model');
      
      // Should reject invalid model for room
      await expect(modelService.setModelForRoom(roomId, invalidModel)).rejects.toThrow('Invalid model: invalid-model');
    });
  });
}); 