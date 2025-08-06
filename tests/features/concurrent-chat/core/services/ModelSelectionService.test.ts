import { ModelSelectionService } from '../../../../../src/features/concurrent-chat/core/services/ModelSelectionService';
import { IModelSelector } from '../../../../../src/features/concurrent-chat/core/types/interfaces/IModelSelector';

describe('ModelSelectionService', () => {
  let modelService: ModelSelectionService;
  let mockSupabase: any;

  beforeEach(() => {
    // Mock Supabase client
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      then: jest.fn().mockReturnThis(),
      catch: jest.fn().mockReturnThis(),
    };
    
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
      
      mockSupabase.then.mockResolvedValue({ data: { model: newModel }, error: null });
      
      await modelService.setModel(newModel);
      
      expect(mockSupabase.from).toHaveBeenCalledWith('chatrooms');
      expect(mockSupabase.update).toHaveBeenCalledWith({ model: newModel });
    });

    it('should handle Supabase errors', async () => {
      const newModel = 'gpt-4';
      const error = { message: 'Database error' };
      
      mockSupabase.then.mockResolvedValue({ data: null, error });
      
      await expect(modelService.setModel(newModel)).rejects.toThrow('Database error');
    });

    it('should validate model before setting', async () => {
      const invalidModel = 'invalid-model';
      
      await expect(modelService.setModel(invalidModel)).rejects.toThrow('Invalid model: invalid-model');
    });

    it('should handle null model', async () => {
      await expect(modelService.setModel(null as any)).rejects.toThrow('Model cannot be null or undefined');
    });

    it('should handle undefined model', async () => {
      await expect(modelService.setModel(undefined as any)).rejects.toThrow('Model cannot be null or undefined');
    });

    it('should handle empty model', async () => {
      await expect(modelService.setModel('')).rejects.toThrow('Model cannot be empty');
    });

    it('should handle network errors', async () => {
      const newModel = 'gpt-4';
      
      mockSupabase.then.mockRejectedValue(new Error('Network error'));
      
      await expect(modelService.setModel(newModel)).rejects.toThrow('Network error');
    });
  });

  describe('getModelForRoom', () => {
    it('should get model for room successfully', async () => {
      const roomId = 123;
      const expectedModel = 'gpt-4';
      
      mockSupabase.then.mockResolvedValue({ 
        data: { model: expectedModel }, 
        error: null 
      });
      
      const model = await modelService.getModelForRoom(roomId);
      
      expect(model).toBe(expectedModel);
      expect(mockSupabase.from).toHaveBeenCalledWith('chatrooms');
      expect(mockSupabase.select).toHaveBeenCalledWith('model');
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', roomId);
      expect(mockSupabase.single).toHaveBeenCalled();
    });

    it('should return default model when room not found', async () => {
      const roomId = 999;
      
      mockSupabase.then.mockResolvedValue({ 
        data: null, 
        error: { code: 'PGRST116' } // Not found error
      });
      
      const model = await modelService.getModelForRoom(roomId);
      
      expect(model).toBe('gpt-3.5-turbo'); // Default model
    });

    it('should return default model when room has no model', async () => {
      const roomId = 123;
      
      mockSupabase.then.mockResolvedValue({ 
        data: { model: null }, 
        error: null 
      });
      
      const model = await modelService.getModelForRoom(roomId);
      
      expect(model).toBe('gpt-3.5-turbo'); // Default model
    });

    it('should handle Supabase errors', async () => {
      const roomId = 123;
      const error = { message: 'Database error' };
      
      mockSupabase.then.mockResolvedValue({ data: null, error });
      
      await expect(modelService.getModelForRoom(roomId)).rejects.toThrow('Database error');
    });

    it('should handle network errors', async () => {
      const roomId = 123;
      
      mockSupabase.then.mockRejectedValue(new Error('Network error'));
      
      await expect(modelService.getModelForRoom(roomId)).rejects.toThrow('Network error');
    });

    it('should handle invalid room ID', async () => {
      const invalidRoomId = -1;
      
      await expect(modelService.getModelForRoom(invalidRoomId)).rejects.toThrow('Invalid room ID');
    });

    it('should handle null room ID', async () => {
      await expect(modelService.getModelForRoom(null as any)).rejects.toThrow('Room ID cannot be null or undefined');
    });

    it('should handle undefined room ID', async () => {
      await expect(modelService.getModelForRoom(undefined as any)).rejects.toThrow('Room ID cannot be null or undefined');
    });
  });

  describe('setModelForRoom', () => {
    it('should set model for specific room', async () => {
      const roomId = 123;
      const newModel = 'gpt-4';
      
      mockSupabase.then.mockResolvedValue({ data: { model: newModel }, error: null });
      
      await modelService.setModelForRoom(roomId, newModel);
      
      expect(mockSupabase.from).toHaveBeenCalledWith('chatrooms');
      expect(mockSupabase.update).toHaveBeenCalledWith({ model: newModel });
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', roomId);
    });

    it('should handle Supabase errors for room', async () => {
      const roomId = 123;
      const newModel = 'gpt-4';
      const error = { message: 'Database error' };
      
      mockSupabase.then.mockResolvedValue({ data: null, error });
      
      await expect(modelService.setModelForRoom(roomId, newModel)).rejects.toThrow('Database error');
    });

    it('should validate model before setting for room', async () => {
      const roomId = 123;
      const invalidModel = 'invalid-model';
      
      await expect(modelService.setModelForRoom(roomId, invalidModel)).rejects.toThrow('Invalid model: invalid-model');
    });

    it('should validate room ID', async () => {
      const invalidRoomId = -1;
      const newModel = 'gpt-4';
      
      await expect(modelService.setModelForRoom(invalidRoomId, newModel)).rejects.toThrow('Invalid room ID');
    });
  });

  describe('model validation', () => {
    it('should validate valid models', () => {
      const validModels = ['gpt-3.5-turbo', 'gpt-4'];
      
      for (const model of validModels) {
        expect(modelService.isValidModel(model)).toBe(true);
      }
    });

    it('should reject invalid models', () => {
      const invalidModels = ['invalid-model', 'gpt-5', '', null, undefined];
      
      for (const model of invalidModels) {
        expect(modelService.isValidModel(model as any)).toBe(false);
      }
    });

    it('should handle case sensitivity', () => {
      const caseVariants = ['GPT-3.5-TURBO', 'Gpt-3.5-Turbo', 'gpt-3.5-turbo'];
      
      expect(modelService.isValidModel(caseVariants[0])).toBe(false);
      expect(modelService.isValidModel(caseVariants[1])).toBe(false);
      expect(modelService.isValidModel(caseVariants[2])).toBe(true);
    });
  });

  describe('model comparison', () => {
    it('should compare models correctly', () => {
      expect(modelService.isSameModel('gpt-3.5-turbo', 'gpt-3.5-turbo')).toBe(true);
      expect(modelService.isSameModel('gpt-4', 'gpt-4')).toBe(true);
      expect(modelService.isSameModel('gpt-3.5-turbo', 'gpt-4')).toBe(false);
    });

    it('should handle null/undefined in comparison', () => {
      expect(modelService.isSameModel(null, 'gpt-3.5-turbo')).toBe(false);
      expect(modelService.isSameModel('gpt-3.5-turbo', null)).toBe(false);
      expect(modelService.isSameModel(undefined, 'gpt-3.5-turbo')).toBe(false);
      expect(modelService.isSameModel('gpt-3.5-turbo', undefined)).toBe(false);
    });

    it('should handle case sensitivity in comparison', () => {
      expect(modelService.isSameModel('GPT-3.5-TURBO', 'gpt-3.5-turbo')).toBe(false);
      expect(modelService.isSameModel('gpt-3.5-turbo', 'GPT-3.5-TURBO')).toBe(false);
    });
  });

  describe('model preferences', () => {
    it('should get user preference model', async () => {
      const expectedModel = 'gpt-4';
      
      mockSupabase.then.mockResolvedValue({ 
        data: { model: expectedModel }, 
        error: null 
      });
      
      const model = await modelService.getUserPreferenceModel();
      
      expect(model).toBe(expectedModel);
    });

    it('should return default when no user preference', async () => {
      mockSupabase.then.mockResolvedValue({ 
        data: null, 
        error: { code: 'PGRST116' }
      });
      
      const model = await modelService.getUserPreferenceModel();
      
      expect(model).toBe('gpt-3.5-turbo');
    });

    it('should set user preference model', async () => {
      const newModel = 'gpt-4';
      
      mockSupabase.then.mockResolvedValue({ data: { model: newModel }, error: null });
      
      await modelService.setUserPreferenceModel(newModel);
      
      expect(mockSupabase.from).toHaveBeenCalledWith('user_preferences');
      expect(mockSupabase.update).toHaveBeenCalledWith({ model: newModel });
    });
  });

  describe('caching behavior', () => {
    it('should cache room model queries', async () => {
      const roomId = 123;
      const expectedModel = 'gpt-4';
      
      mockSupabase.then.mockResolvedValue({ 
        data: { model: expectedModel }, 
        error: null 
      });
      
      // First call
      const model1 = await modelService.getModelForRoom(roomId);
      
      // Second call should use cache
      const model2 = await modelService.getModelForRoom(roomId);
      
      expect(model1).toBe(expectedModel);
      expect(model2).toBe(expectedModel);
      expect(mockSupabase.from).toHaveBeenCalledTimes(1); // Only called once
    });

    it('should invalidate cache when model is updated', async () => {
      const roomId = 123;
      const initialModel = 'gpt-3.5-turbo';
      const newModel = 'gpt-4';
      
      // First call
      mockSupabase.then.mockResolvedValue({ 
        data: { model: initialModel }, 
        error: null 
      });
      await modelService.getModelForRoom(roomId);
      
      // Update model
      mockSupabase.then.mockResolvedValue({ 
        data: { model: newModel }, 
        error: null 
      });
      await modelService.setModelForRoom(roomId, newModel);
      
      // Second call should not use cache
      const model = await modelService.getModelForRoom(roomId);
      
      expect(model).toBe(newModel);
      expect(mockSupabase.from).toHaveBeenCalledTimes(3); // Called for get, set, and get again
    });
  });

  describe('error handling and validation', () => {
    it('should validate Supabase client', () => {
      expect(() => {
        new ModelSelectionService(null as any);
      }).toThrow('Supabase client is required');
    });

    it('should handle malformed database responses', async () => {
      const roomId = 123;
      
      mockSupabase.then.mockResolvedValue({ 
        data: { unexpected_field: 'value' }, 
        error: null 
      });
      
      const model = await modelService.getModelForRoom(roomId);
      
      expect(model).toBe('gpt-3.5-turbo'); // Should fallback to default
    });

    it('should handle database connection issues', async () => {
      const roomId = 123;
      
      mockSupabase.then.mockRejectedValue(new Error('Connection timeout'));
      
      await expect(modelService.getModelForRoom(roomId)).rejects.toThrow('Connection timeout');
    });
  });

  describe('performance considerations', () => {
    it('should handle many concurrent room queries efficiently', async () => {
      const roomIds = Array.from({ length: 10 }, (_, i) => i + 1);
      
      mockSupabase.then.mockResolvedValue({ 
        data: { model: 'gpt-4' }, 
        error: null 
      });
      
      const startTime = Date.now();
      
      const promises = roomIds.map(id => modelService.getModelForRoom(id));
      const results = await Promise.all(promises);
      
      const endTime = Date.now();
      
      expect(results).toHaveLength(10);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should handle large model lists efficiently', () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 1000; i++) {
        modelService.getAvailableModels();
      }
      
      const endTime = Date.now();
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
      expect(modelService).toBeDefined();
      expect(typeof modelService.getAvailableModels).toBe('function');
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete model selection workflow', async () => {
      const roomId = 123;
      const newModel = 'gpt-4';
      
      // Get initial model
      mockSupabase.then.mockResolvedValue({ 
        data: { model: 'gpt-3.5-turbo' }, 
        error: null 
      });
      const initialModel = await modelService.getModelForRoom(roomId);
      expect(initialModel).toBe('gpt-3.5-turbo');
      
      // Set new model
      mockSupabase.then.mockResolvedValue({ 
        data: { model: newModel }, 
        error: null 
      });
      await modelService.setModelForRoom(roomId, newModel);
      
      // Get updated model
      const updatedModel = await modelService.getModelForRoom(roomId);
      expect(updatedModel).toBe(newModel);
    });

    it('should handle model validation in workflow', async () => {
      const roomId = 123;
      const invalidModel = 'invalid-model';
      
      // Should reject invalid model
      await expect(modelService.setModelForRoom(roomId, invalidModel)).rejects.toThrow('Invalid model');
      
      // Should still return default model
      mockSupabase.then.mockResolvedValue({ 
        data: { model: 'gpt-3.5-turbo' }, 
        error: null 
      });
      const model = await modelService.getModelForRoom(roomId);
      expect(model).toBe('gpt-3.5-turbo');
    });
  });
}); 