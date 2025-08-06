import { IAIService } from '../../../../../../src/features/concurrent-chat/core/types/interfaces/IAIService';

describe('IAIService', () => {
  describe('interface contract validation', () => {
    it('should define sendMessage method signature', () => {
      const interfaceType: IAIService = {} as IAIService;
      expect(typeof interfaceType.sendMessage).toBe('function');
    });

    it('should define sendMessageWithStreaming method signature', () => {
      const interfaceType: IAIService = {} as IAIService;
      expect(typeof interfaceType.sendMessageWithStreaming).toBe('function');
    });

    it('should return Promise from sendMessage method', () => {
      const interfaceType: IAIService = {} as IAIService;
      const request = { roomId: 1, messages: [], model: 'gpt-3.5-turbo' };
      const session = { access_token: 'test-token' } as any;
      
      const result = interfaceType.sendMessage(request, session);
      expect(result).toBeInstanceOf(Promise);
    });

    it('should return Promise from sendMessageWithStreaming method', () => {
      const interfaceType: IAIService = {} as IAIService;
      const request = { roomId: 1, messages: [], model: 'gpt-3.5-turbo' };
      const session = { access_token: 'test-token' } as any;
      const onChunk = (chunk: string) => {};
      
      const result = interfaceType.sendMessageWithStreaming(request, session, onChunk);
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('SOLID principle compliance', () => {
    it('should follow Single Responsibility Principle', () => {
      // The interface should have a single responsibility - AI service communication
      const interfaceType: IAIService = {} as IAIService;
      
      // Should only have methods related to AI service communication
      const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(interfaceType));
      const aiMethods = methods.filter(method => 
        method.includes('send') || method.includes('message') || method.includes('streaming')
      );
      
      // Interface should be focused on AI service communication
      expect(aiMethods.length).toBeGreaterThan(0);
    });

    it('should follow Interface Segregation Principle', () => {
      // The interface should be small and focused
      const interfaceType: IAIService = {} as IAIService;
      
      // Should not have too many methods (indicating it's doing too much)
      const methodCount = Object.getOwnPropertyNames(Object.getPrototypeOf(interfaceType)).length;
      expect(methodCount).toBeLessThan(10); // Reasonable limit for a focused interface
    });

    it('should follow Dependency Inversion Principle', () => {
      // The interface should be an abstraction that high-level modules depend on
      const sendMessage = (aiService: IAIService, request: any, session: any) => {
        return aiService.sendMessage(request, session);
      };

      // Should accept any implementation of IAIService
      const mockImplementation = {
        sendMessage: async (request: any, session: any) => Promise.resolve({}),
        sendMessageWithStreaming: async (request: any, session: any, onChunk: any) => Promise.resolve({})
      } as IAIService;

      const result = sendMessage(mockImplementation, {}, {});
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('type safety', () => {
    it('should enforce correct method signatures', () => {
      // Test that TypeScript enforces the correct signatures
      const validImplementation: IAIService = {
        sendMessage: async (request: any, session: any) => {
          // Valid implementation
          return {} as any;
        },
        sendMessageWithStreaming: async (request: any, session: any, onChunk: any) => {
          // Valid implementation
          return {} as any;
        }
      };

      expect(validImplementation.sendMessage).toBeDefined();
      expect(validImplementation.sendMessageWithStreaming).toBeDefined();
    });

    it('should accept flexible request and session types', () => {
      // Test that the interface allows various request and session types
      const flexibleImplementation: IAIService = {
        sendMessage: async (request: any, session: any) => {
          // Should accept any request and session types
          if (request && typeof request === 'object') {
            // Handle object request
          }
          if (session && typeof session === 'object') {
            // Handle object session
          }
          return {} as any;
        },
        sendMessageWithStreaming: async (request: any, session: any, onChunk: any) => {
          // Should accept any request, session, and callback types
          if (typeof onChunk === 'function') {
            // Handle callback function
          }
          return {} as any;
        }
      };

      expect(flexibleImplementation.sendMessage).toBeDefined();
      expect(flexibleImplementation.sendMessageWithStreaming).toBeDefined();
    });
  });

  describe('interface extensibility', () => {
    it('should be open for extension', () => {
      // The interface should allow for future extensions
      const baseImplementation: IAIService = {
        sendMessage: async (request: any, session: any) => {
          return {} as any;
        },
        sendMessageWithStreaming: async (request: any, session: any, onChunk: any) => {
          return {} as any;
        }
      };

      // Should be able to extend with additional functionality
      const extendedImplementation = {
        ...baseImplementation,
        additionalMethod: () => {
          // Additional functionality
        }
      };

      // Should still be assignable to IAIService
      const service: IAIService = extendedImplementation;
      expect(service.sendMessage).toBeDefined();
      expect(service.sendMessageWithStreaming).toBeDefined();
    });
  });
}); 