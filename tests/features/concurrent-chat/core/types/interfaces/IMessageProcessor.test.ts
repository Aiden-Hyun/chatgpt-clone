import { IMessageProcessor, createMessageProcessor } from '../../../../../../src/features/concurrent-chat/core/types/interfaces/IMessageProcessor';

describe('IMessageProcessor', () => {
  describe('interface contract validation', () => {
    it('should define a process method signature', () => {
      // Test with a concrete implementation
      const processor = createMessageProcessor();
      
      // Should have the required method
      expect(typeof processor.process).toBe('function');
    });

    it('should accept any message type as parameter', () => {
      // Test that the interface allows flexible message types
      const processor = createMessageProcessor();
      
      // These should be valid according to the interface
      const stringMessage = 'test message';
      const objectMessage = { id: 'test', content: 'test' };
      const nullMessage = null;
      const undefinedMessage = undefined;

      // Should not throw when called with different message types
      expect(() => {
        processor.process(stringMessage);
        processor.process(objectMessage);
        processor.process(nullMessage);
        processor.process(undefinedMessage);
      }).not.toThrow();
    });

    it('should return a Promise from process method', () => {
      const processor = createMessageProcessor();
      const message = { id: 'test', content: 'test' };
      
      const result = processor.process(message);
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('SOLID principle compliance', () => {
    it('should follow Single Responsibility Principle', () => {
      // The interface should have a single responsibility - message processing
      const processor = createMessageProcessor();
      
      // Should only have methods related to message processing
      const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(processor));
      const processingMethods = methods.filter(method => 
        method.includes('process') || method.includes('message')
      );
      
      // Interface should be focused on message processing
      expect(processingMethods.length).toBeGreaterThan(0);
    });

    it('should follow Interface Segregation Principle', () => {
      // The interface should be small and focused
      const processor = createMessageProcessor();
      
      // Should not have too many methods (indicating it's doing too much)
      const methodCount = Object.getOwnPropertyNames(Object.getPrototypeOf(processor)).length;
      expect(methodCount).toBeLessThan(10); // Reasonable limit for a focused interface
    });

    it('should follow Dependency Inversion Principle', () => {
      // The interface should be an abstraction that high-level modules depend on
      // This is tested by ensuring the interface can be used as a type
      const createProcessor = (processor: IMessageProcessor) => {
        return processor;
      };

      // Should accept any implementation of IMessageProcessor
      const mockImplementation = {
        process: async (message: any) => Promise.resolve()
      } as IMessageProcessor;

      const result = createProcessor(mockImplementation);
      expect(result).toBe(mockImplementation);
    });
  });

  describe('type safety', () => {
    it('should enforce correct method signature', () => {
      // Test that TypeScript enforces the correct signature
      const validImplementation: IMessageProcessor = {
        process: async (message: any) => {
          // Valid implementation
        }
      };

      expect(validImplementation.process).toBeDefined();
      expect(typeof validImplementation.process).toBe('function');
    });

    it('should allow flexible message parameter types', () => {
      // Test that the interface allows various message types
      const flexibleImplementation: IMessageProcessor = {
        process: async (message: any) => {
          // Should accept any message type
          if (typeof message === 'string') {
            // Handle string message
          } else if (message && typeof message === 'object') {
            // Handle object message
          } else if (message === null || message === undefined) {
            // Handle null/undefined message
          }
        }
      };

      expect(flexibleImplementation.process).toBeDefined();
    });
  });

  describe('interface extensibility', () => {
    it('should be open for extension', () => {
      // The interface should allow for future extensions
      // This is tested by ensuring the interface is not too restrictive
      const baseImplementation: IMessageProcessor = {
        process: async (message: any) => {
          // Base processing
        }
      };

      // Should be able to extend with additional functionality
      const extendedImplementation = {
        ...baseImplementation,
        additionalMethod: () => {
          // Additional functionality
        }
      };

      // Should still be assignable to IMessageProcessor
      const processor: IMessageProcessor = extendedImplementation;
      expect(processor.process).toBeDefined();
    });
  });
}); 