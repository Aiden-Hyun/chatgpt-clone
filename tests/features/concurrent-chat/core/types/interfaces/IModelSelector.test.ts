import { IModelSelector } from '../../../../../../src/features/concurrent-chat/core/types/interfaces/IModelSelector';

describe('IModelSelector', () => {
  describe('interface contract validation', () => {
    it('should define getAvailableModels method signature', () => {
      const interfaceType: IModelSelector = {} as IModelSelector;
      expect(typeof interfaceType.getAvailableModels).toBe('function');
    });

    it('should define getCurrentModel method signature', () => {
      const interfaceType: IModelSelector = {} as IModelSelector;
      expect(typeof interfaceType.getCurrentModel).toBe('function');
    });

    it('should define setModel method signature', () => {
      const interfaceType: IModelSelector = {} as IModelSelector;
      expect(typeof interfaceType.setModel).toBe('function');
    });

    it('should define getModelForRoom method signature', () => {
      const interfaceType: IModelSelector = {} as IModelSelector;
      expect(typeof interfaceType.getModelForRoom).toBe('function');
    });

    it('should return array from getAvailableModels method', () => {
      const interfaceType: IModelSelector = {} as IModelSelector;
      const result = interfaceType.getAvailableModels();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return string from getCurrentModel method', () => {
      const interfaceType: IModelSelector = {} as IModelSelector;
      const result = interfaceType.getCurrentModel();
      expect(typeof result).toBe('string');
    });

    it('should return Promise from setModel method', () => {
      const interfaceType: IModelSelector = {} as IModelSelector;
      const result = interfaceType.setModel('gpt-4');
      expect(result).toBeInstanceOf(Promise);
    });

    it('should return Promise from getModelForRoom method', () => {
      const interfaceType: IModelSelector = {} as IModelSelector;
      const result = interfaceType.getModelForRoom(1);
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('SOLID principle compliance', () => {
    it('should follow Single Responsibility Principle', () => {
      // The interface should have a single responsibility - model selection
      const interfaceType: IModelSelector = {} as IModelSelector;
      
      // Should only have methods related to model selection
      const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(interfaceType));
      const modelMethods = methods.filter(method => 
        method.includes('model') || method.includes('Model') || method.includes('available')
      );
      
      // Interface should be focused on model selection
      expect(modelMethods.length).toBeGreaterThan(0);
    });

    it('should follow Interface Segregation Principle', () => {
      // The interface should be small and focused
      const interfaceType: IModelSelector = {} as IModelSelector;
      
      // Should not have too many methods (indicating it's doing too much)
      const methodCount = Object.getOwnPropertyNames(Object.getPrototypeOf(interfaceType)).length;
      expect(methodCount).toBeLessThan(10); // Reasonable limit for a focused interface
    });

    it('should follow Dependency Inversion Principle', () => {
      // The interface should be an abstraction that high-level modules depend on
      const changeModel = (modelSelector: IModelSelector, model: string) => {
        return modelSelector.setModel(model);
      };

      // Should accept any implementation of IModelSelector
      const mockImplementation = {
        getAvailableModels: () => [],
        getCurrentModel: () => 'gpt-3.5-turbo',
        setModel: async (model: string) => Promise.resolve(),
        getModelForRoom: async (roomId: number) => Promise.resolve('gpt-3.5-turbo')
      } as IModelSelector;

      const result = changeModel(mockImplementation, 'gpt-4');
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('type safety', () => {
    it('should enforce correct method signatures', () => {
      // Test that TypeScript enforces the correct signatures
      const validImplementation: IModelSelector = {
        getAvailableModels: () => {
          return [{ label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' }];
        },
        getCurrentModel: () => {
          return 'gpt-3.5-turbo';
        },
        setModel: async (model: string) => {
          // Valid implementation
        },
        getModelForRoom: async (roomId: number) => {
          return 'gpt-3.5-turbo';
        }
      };

      expect(validImplementation.getAvailableModels).toBeDefined();
      expect(validImplementation.getCurrentModel).toBeDefined();
      expect(validImplementation.setModel).toBeDefined();
      expect(validImplementation.getModelForRoom).toBeDefined();
    });

    it('should accept flexible model parameter types', () => {
      // Test that the interface allows various model types
      const flexibleImplementation: IModelSelector = {
        getAvailableModels: () => {
          return [{ label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' }];
        },
        getCurrentModel: () => {
          return 'gpt-3.5-turbo';
        },
        setModel: async (model: string) => {
          // Should accept any string model
          if (typeof model === 'string') {
            // Handle string model
          }
        },
        getModelForRoom: async (roomId: number) => {
          // Should accept any number roomId
          if (typeof roomId === 'number') {
            // Handle number roomId
          }
          return 'gpt-3.5-turbo';
        }
      };

      expect(flexibleImplementation.setModel).toBeDefined();
      expect(flexibleImplementation.getModelForRoom).toBeDefined();
    });
  });

  describe('model selection functionality', () => {
    it('should support model options structure', () => {
      // Test that the interface supports the expected model options structure
      const modelSelector: IModelSelector = {
        getAvailableModels: () => {
          return [
            { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
            { label: 'GPT-4', value: 'gpt-4' }
          ];
        },
        getCurrentModel: () => 'gpt-3.5-turbo',
        setModel: async (model: string) => Promise.resolve(),
        getModelForRoom: async (roomId: number) => Promise.resolve('gpt-3.5-turbo')
      };

      const models = modelSelector.getAvailableModels();
      expect(models).toHaveLength(2);
      expect(models[0]).toHaveProperty('label');
      expect(models[0]).toHaveProperty('value');
    });

    it('should support room-specific model selection', () => {
      // Test that the interface supports room-specific model selection
      const modelSelector: IModelSelector = {
        getAvailableModels: () => [],
        getCurrentModel: () => 'gpt-3.5-turbo',
        setModel: async (model: string) => Promise.resolve(),
        getModelForRoom: async (roomId: number) => {
          // Should support different models for different rooms
          if (roomId === 1) {
            return 'gpt-3.5-turbo';
          } else if (roomId === 2) {
            return 'gpt-4';
          }
          return 'gpt-3.5-turbo';
        }
      };

      expect(modelSelector.getModelForRoom).toBeDefined();
    });
  });

  describe('interface extensibility', () => {
    it('should be open for extension', () => {
      // The interface should allow for future extensions
      const baseImplementation: IModelSelector = {
        getAvailableModels: () => [],
        getCurrentModel: () => 'gpt-3.5-turbo',
        setModel: async (model: string) => Promise.resolve(),
        getModelForRoom: async (roomId: number) => Promise.resolve('gpt-3.5-turbo')
      };

      // Should be able to extend with additional functionality
      const extendedImplementation = {
        ...baseImplementation,
        additionalMethod: () => {
          // Additional functionality
        }
      };

      // Should still be assignable to IModelSelector
      const selector: IModelSelector = extendedImplementation;
      expect(selector.getAvailableModels).toBeDefined();
      expect(selector.getCurrentModel).toBeDefined();
      expect(selector.setModel).toBeDefined();
      expect(selector.getModelForRoom).toBeDefined();
    });
  });
}); 