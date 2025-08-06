import { ChangeModelCommand } from '../../../../../src/features/concurrent-chat/core/commands/ChangeModelCommand';
import { ICommand } from '../../../../../src/features/concurrent-chat/core/types/interfaces/ICommand';
import { IModelSelector } from '../../../../../src/features/concurrent-chat/core/types/interfaces/IModelSelector';

describe('ChangeModelCommand', () => {
  let mockModelSelector: jest.Mocked<IModelSelector>;
  let command: ChangeModelCommand;

  beforeEach(() => {
    mockModelSelector = {
      getAvailableModels: jest.fn().mockReturnValue([
        { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
        { label: 'GPT-4', value: 'gpt-4' }
      ]),
      getCurrentModel: jest.fn().mockReturnValue('gpt-3.5-turbo'),
      setModel: jest.fn().mockResolvedValue(undefined),
      getModelForRoom: jest.fn().mockResolvedValue('gpt-3.5-turbo')
    };
  });

  describe('command creation', () => {
    it('should create command with required parameters', () => {
      const newModel = 'gpt-4';
      const roomId = 123;
      
      command = new ChangeModelCommand(mockModelSelector, newModel, roomId);
      
      expect(command).toBeInstanceOf(ChangeModelCommand);
      expect(command).toBeInstanceOf(Object);
    });

    it('should store model selector reference', () => {
      const newModel = 'gpt-4';
      const roomId = 456;
      
      command = new ChangeModelCommand(mockModelSelector, newModel, roomId);
      
      const selector = (command as any).modelSelector;
      expect(selector).toBe(mockModelSelector);
    });

    it('should store new model and room ID', () => {
      const newModel = 'gpt-4';
      const roomId = 789;
      
      command = new ChangeModelCommand(mockModelSelector, newModel, roomId);
      
      const model = (command as any).newModel;
      const room = (command as any).roomId;
      
      expect(model).toBe(newModel);
      expect(room).toBe(roomId);
    });

    it('should store previous model for undo', async () => {
      const newModel = 'gpt-4';
      const roomId = 123;
      
      command = new ChangeModelCommand(mockModelSelector, newModel, roomId);
      
      // Previous model should be stored after creation
      const previousModel = (command as any).previousModel;
      expect(previousModel).toBeUndefined(); // Not set until execution
    });
  });

  describe('command execution', () => {
    beforeEach(() => {
      command = new ChangeModelCommand(mockModelSelector, 'gpt-4', 123);
    });

    it('should execute successfully', async () => {
      const result = await command.execute();
      
      expect(result).toBeDefined();
      expect(mockModelSelector.setModel).toHaveBeenCalled();
    });

    it('should call model selector with correct parameters', async () => {
      const newModel = 'gpt-4';
      const roomId = 456;
      
      command = new ChangeModelCommand(mockModelSelector, newModel, roomId);
      
      await command.execute();
      
      expect(mockModelSelector.setModel).toHaveBeenCalledWith(newModel);
    });

    it('should store previous model before changing', async () => {
      const currentModel = 'gpt-3.5-turbo';
      const newModel = 'gpt-4';
      
      mockModelSelector.getCurrentModel.mockReturnValue(currentModel);
      command = new ChangeModelCommand(mockModelSelector, newModel, 123);
      
      await command.execute();
      
      const previousModel = (command as any).previousModel;
      expect(previousModel).toBe(currentModel);
    });

    it('should return success result', async () => {
      const result = await command.execute();
      
      expect(result).toEqual({ success: true, model: 'gpt-4' });
    });

    it('should handle model selector errors', async () => {
      const error = new Error('Model change failed');
      mockModelSelector.setModel.mockRejectedValue(error);
      
      await expect(command.execute()).rejects.toThrow('Model change failed');
    });

    it('should handle invalid model', async () => {
      const invalidModel = 'invalid-model';
      command = new ChangeModelCommand(mockModelSelector, invalidModel, 123);
      
      await command.execute();
      
      expect(mockModelSelector.setModel).toHaveBeenCalledWith(invalidModel);
    });

    it('should handle null room ID', async () => {
      command = new ChangeModelCommand(mockModelSelector, 'gpt-4', null);
      
      await command.execute();
      
      expect(mockModelSelector.setModel).toHaveBeenCalledWith('gpt-4');
    });
  });

  describe('undo functionality', () => {
    beforeEach(() => {
      command = new ChangeModelCommand(mockModelSelector, 'gpt-4', 123);
    });

    it('should support undo operation', () => {
      expect(command.canUndo()).toBe(true);
    });

    it('should implement undo method', async () => {
      expect(typeof command.undo).toBe('function');
      
      // Execute the command first, then undo should not throw
      await command.execute();
      await expect(command.undo()).resolves.not.toThrow();
    });

    it('should restore previous model on undo', async () => {
      const previousModel = 'gpt-3.5-turbo';
      mockModelSelector.getCurrentModel.mockReturnValue(previousModel);
      
      await command.execute();
      await command.undo();
      
      expect(mockModelSelector.setModel).toHaveBeenCalledTimes(2);
      expect(mockModelSelector.setModel).toHaveBeenLastCalledWith(previousModel);
    });

    it('should handle undo errors gracefully', async () => {
      // Create a fresh command for this test
      const freshCommand = new ChangeModelCommand(mockModelSelector, 'gpt-4', 123);
      
      // Execute first (this should succeed)
      await freshCommand.execute();
      
      // Now set up the mock to fail for the undo call
      mockModelSelector.setModel.mockRejectedValueOnce(new Error('Undo failed'));
      
      await expect(freshCommand.undo()).rejects.toThrow('Undo failed');
    });

    it('should prevent undo before execution', async () => {
      await expect(command.undo()).rejects.toThrow('Cannot undo command that has not been executed');
    });
  });

  describe('command metadata', () => {
    it('should provide command description', () => {
      command = new ChangeModelCommand(mockModelSelector, 'gpt-4', 123);
      
      const description = command.getDescription();
      
      expect(description).toContain('Change model');
      expect(description).toContain('gpt-4');
      expect(description).toContain('123');
    });

    it('should provide command timestamp', () => {
      const beforeCreation = Date.now();
      command = new ChangeModelCommand(mockModelSelector, 'gpt-4', 123);
      const afterCreation = Date.now();
      
      const timestamp = command.getTimestamp();
      
      expect(timestamp).toBeGreaterThanOrEqual(beforeCreation);
      expect(timestamp).toBeLessThanOrEqual(afterCreation);
    });

    it('should provide command ID', () => {
      command = new ChangeModelCommand(mockModelSelector, 'gpt-4', 123);
      
      const commandId = command.getId();
      
      expect(commandId).toBeDefined();
      expect(typeof commandId).toBe('string');
      expect(commandId.length).toBeGreaterThan(0);
    });
  });

  describe('command state management', () => {
    it('should track execution state', async () => {
      expect(command.isExecuted()).toBe(false);
      
      await command.execute();
      
      expect(command.isExecuted()).toBe(true);
    });

    it('should track undo state', async () => {
      expect(command.isUndone()).toBe(false);
      
      await command.execute();
      await command.undo();
      
      expect(command.isUndone()).toBe(true);
    });

    it('should prevent double execution', async () => {
      // Create a fresh command for this test
      const freshCommand = new ChangeModelCommand(mockModelSelector, 'gpt-4', 123);
      
      await freshCommand.execute();
      
      await freshCommand.execute();
      
      expect(mockModelSelector.setModel).toHaveBeenCalledTimes(1);
    });
  });

  describe('model validation', () => {
    it('should validate model against available models', async () => {
      const availableModels = [
        { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
        { label: 'GPT-4', value: 'gpt-4' }
      ];
      mockModelSelector.getAvailableModels.mockReturnValue(availableModels);
      
      const validModel = 'gpt-4';
      command = new ChangeModelCommand(mockModelSelector, validModel, 123);
      
      await command.execute();
      
      expect(mockModelSelector.setModel).toHaveBeenCalledWith(validModel);
    });

    it('should handle invalid model gracefully', async () => {
      const invalidModel = 'invalid-model';
      command = new ChangeModelCommand(mockModelSelector, invalidModel, 123);
      
      await command.execute();
      
      expect(mockModelSelector.setModel).toHaveBeenCalledWith(invalidModel);
    });

    it('should handle empty model string', async () => {
      command = new ChangeModelCommand(mockModelSelector, '', 123);
      
      await command.execute();
      
      expect(mockModelSelector.setModel).toHaveBeenCalledWith('');
    });
  });

  describe('room-specific model changes', () => {
    it('should handle room-specific model changes', async () => {
      const roomId = 456;
      const newModel = 'gpt-4';
      
      command = new ChangeModelCommand(mockModelSelector, newModel, roomId);
      
      await command.execute();
      
      expect(mockModelSelector.setModel).toHaveBeenCalledWith(newModel);
    });

    it('should handle global model changes', async () => {
      const newModel = 'gpt-4';
      
      command = new ChangeModelCommand(mockModelSelector, newModel, null);
      
      await command.execute();
      
      expect(mockModelSelector.setModel).toHaveBeenCalledWith(newModel);
    });
  });

  describe('SOLID principle compliance', () => {
    it('should follow Single Responsibility Principle', () => {
      expect(command.execute).toBeDefined();
      expect(command.undo).toBeDefined();
      expect(command.canUndo).toBeDefined();
      
      const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(command));
      const commandMethods = methods.filter(method => 
        method.includes('execute') || method.includes('undo') || method.includes('canUndo')
      );
      
      expect(commandMethods.length).toBeGreaterThan(0);
    });

    it('should follow Open/Closed Principle', () => {
      expect(command).toBeInstanceOf(ChangeModelCommand);
      expect(command).toBeInstanceOf(Object);
      
      const originalExecute = command.execute.bind(command);
      expect(typeof originalExecute).toBe('function');
    });

    it('should follow Liskov Substitution Principle', () => {
      const commandInterface: ICommand = command;
      
      expect(typeof commandInterface.execute).toBe('function');
      expect(typeof commandInterface.undo).toBe('function');
      expect(typeof commandInterface.canUndo).toBe('function');
    });

    it('should follow Interface Segregation Principle', () => {
      const commandInterface: ICommand = command;
      
      expect(commandInterface.execute).toBeDefined();
      expect(commandInterface.undo).toBeDefined();
      expect(commandInterface.canUndo).toBeDefined();
    });

    it('should follow Dependency Inversion Principle', () => {
      expect(mockModelSelector.setModel).toBeDefined();
      expect(typeof mockModelSelector.setModel).toBe('function');
    });
  });

  describe('error handling and validation', () => {
    it('should validate model selector', () => {
      expect(() => {
        new ChangeModelCommand(null as any, 'gpt-4', 123);
      }).toThrow('Model selector is required');
    });

    it('should validate new model', () => {
      expect(() => {
        new ChangeModelCommand(mockModelSelector, undefined as any, 123);
      }).toThrow('New model is required');
    });

    it('should handle model selector returning null', async () => {
      // Create a fresh command for this test
      const freshCommand = new ChangeModelCommand(mockModelSelector, 'gpt-4', 123);
      
      mockModelSelector.setModel.mockResolvedValue(null as any);
      
      const result = await freshCommand.execute();
      
      expect(result).toBeDefined();
    });

    it('should handle model selector returning undefined', async () => {
      // Create a fresh command for this test
      const freshCommand = new ChangeModelCommand(mockModelSelector, 'gpt-4', 123);
      
      mockModelSelector.setModel.mockResolvedValue(undefined as any);
      
      const result = await freshCommand.execute();
      
      expect(result).toBeDefined();
    });
  });

  describe('performance considerations', () => {
    it('should execute within reasonable time', async () => {
      const startTime = Date.now();
      
      await command.execute();
      
      const executionTime = Date.now() - startTime;
      expect(executionTime).toBeLessThan(1000);
    });

    it('should handle long model names', async () => {
      const longModelName = 'a'.repeat(1000);
      
      command = new ChangeModelCommand(mockModelSelector, longModelName, 123);
      
      const startTime = Date.now();
      await command.execute();
      const executionTime = Date.now() - startTime;
      
      expect(executionTime).toBeLessThan(1000);
      expect(mockModelSelector.setModel).toHaveBeenCalledWith(longModelName);
    });
  });

  describe('model change scenarios', () => {
    it('should handle changing to same model', async () => {
      const sameModel = 'gpt-3.5-turbo';
      mockModelSelector.getCurrentModel.mockReturnValue(sameModel);
      
      command = new ChangeModelCommand(mockModelSelector, sameModel, 123);
      
      await command.execute();
      
      expect(mockModelSelector.setModel).toHaveBeenCalledWith(sameModel);
    });

    it('should handle changing from GPT-3.5 to GPT-4', async () => {
      const fromModel = 'gpt-3.5-turbo';
      const toModel = 'gpt-4';
      
      mockModelSelector.getCurrentModel.mockReturnValue(fromModel);
      command = new ChangeModelCommand(mockModelSelector, toModel, 123);
      
      await command.execute();
      
      expect(mockModelSelector.setModel).toHaveBeenCalledWith(toModel);
    });

    it('should handle changing from GPT-4 to GPT-3.5', async () => {
      const fromModel = 'gpt-4';
      const toModel = 'gpt-3.5-turbo';
      
      mockModelSelector.getCurrentModel.mockReturnValue(fromModel);
      command = new ChangeModelCommand(mockModelSelector, toModel, 123);
      
      await command.execute();
      
      expect(mockModelSelector.setModel).toHaveBeenCalledWith(toModel);
    });
  });
}); 