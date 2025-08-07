import { ConcurrentAIService } from '../../../../../src/features/concurrent-chat/core/services/ConcurrentAIService';
import { IAIService } from '../../../../../src/features/concurrent-chat/core/types/interfaces/IAIService';

// Polyfill TextEncoder for Jest environment
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = class TextEncoder {
    encode(input: string): Uint8Array {
      return new Uint8Array(Buffer.from(input, 'utf8'));
    }
  };
}

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = class TextDecoder {
    decode(input: Uint8Array, options?: { stream?: boolean }): string {
      return Buffer.from(input).toString('utf8');
    }
  };
}

describe('ConcurrentAIService', () => {
  let aiService: ConcurrentAIService;
  let mockFetch: jest.Mock;

  beforeEach(() => {
    // Mock global fetch
    mockFetch = jest.fn();
    global.fetch = mockFetch;
    
    aiService = new ConcurrentAIService();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('service creation', () => {
    it('should create AI service instance', () => {
      expect(aiService).toBeInstanceOf(ConcurrentAIService);
      expect(aiService).toBeInstanceOf(Object);
    });

    it('should implement IAIService interface', () => {
      const service: IAIService = aiService;
      
      expect(typeof service.sendMessage).toBe('function');
      expect(typeof service.sendMessageWithStreaming).toBe('function');
    });

    it('should initialize with correct base URL', () => {
      const baseUrl = (aiService as any).EDGE_FUNCTION_BASE_URL;
      expect(baseUrl).toBe('https://twzumsgzuwguketxbdet.functions.supabase.co');
    });
  });

  describe('sendMessage', () => {
    it('should send message successfully', async () => {
      const request = {
        roomId: 123,
        messages: [
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'Hi there!' }
        ],
        model: 'gpt-3.5-turbo'
      };
      
      const session = {
        access_token: 'test-token'
      };
      
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          choices: [{
            message: {
              content: 'Hello! How can I help you today?',
              role: 'assistant'
            }
          }],
          model: 'gpt-3.5-turbo'
        })
      };
      
      mockFetch.mockResolvedValue(mockResponse);
      
      const result = await aiService.sendMessage(request, session);
      
      expect(result).toEqual({
        choices: [{
          message: {
            content: 'Hello! How can I help you today?',
            role: 'assistant'
          }
        }],
        model: 'gpt-3.5-turbo'
      });
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://twzumsgzuwguketxbdet.functions.supabase.co/openai-chat',
        {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            roomId: 123,
            messages: [
              { role: 'user', content: 'Hello' },
              { role: 'assistant', content: 'Hi there!' }
            ],
            model: 'gpt-3.5-turbo'
          }),
        }
      );
    });

    it('should handle missing access token', async () => {
      const request = {
        roomId: 123,
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'gpt-3.5-turbo'
      };
      
      const session = {
        access_token: null
      };
      
      await expect(aiService.sendMessage(request, session)).rejects.toThrow('No access token available');
    });

    it('should handle API errors', async () => {
      const request = {
        roomId: 123,
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'gpt-3.5-turbo'
      };
      
      const session = {
        access_token: 'test-token'
      };
      
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      };
      
      mockFetch.mockResolvedValue(mockResponse);
      
      await expect(aiService.sendMessage(request, session)).rejects.toThrow('AI API error: 500 - Internal Server Error');
    });

    it('should handle network errors', async () => {
      const request = {
        roomId: 123,
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'gpt-3.5-turbo'
      };
      
      const session = {
        access_token: 'test-token'
      };
      
      mockFetch.mockRejectedValue(new Error('Network error'));
      
      await expect(aiService.sendMessage(request, session)).rejects.toThrow('Failed to send message: Network error');
    });

    it('should handle JSON parsing errors', async () => {
      const request = {
        roomId: 123,
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'gpt-3.5-turbo'
      };
      
      const session = {
        access_token: 'test-token'
      };
      
      const mockResponse = {
        ok: true,
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON'))
      };
      
      mockFetch.mockResolvedValue(mockResponse);
      
      await expect(aiService.sendMessage(request, session)).rejects.toThrow('Failed to send message: Invalid JSON');
    });

    it('should handle empty response', async () => {
      const request = {
        roomId: 123,
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'gpt-3.5-turbo'
      };
      
      const session = {
        access_token: 'test-token'
      };
      
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(null)
      };
      
      mockFetch.mockResolvedValue(mockResponse);
      
      const result = await aiService.sendMessage(request, session);
      expect(result).toBeNull();
    });
  });

  describe('sendMessageWithStreaming', () => {
    it('should handle streaming response successfully', async () => {
      const request = {
        roomId: 123,
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'gpt-3.5-turbo'
      };
      
      const session = {
        access_token: 'test-token'
      };
      
      const onUpdate = jest.fn();
      
      // Mock response with streaming body
      const mockReader = {
        read: jest.fn()
          .mockResolvedValueOnce({ done: false, value: new global.TextEncoder().encode('data: {"choices":[{"delta":{"content":"Hello"}}]}\n') })
          .mockResolvedValueOnce({ done: false, value: new global.TextEncoder().encode('data: {"choices":[{"delta":{"content":" world"}}]}\n') })
          .mockResolvedValueOnce({ done: false, value: new global.TextEncoder().encode('data: [DONE]\n') })
          .mockResolvedValueOnce({ done: true, value: undefined }),
        releaseLock: jest.fn()
      };
      
      const mockResponse = {
        ok: true,
        body: {
          getReader: jest.fn().mockReturnValue(mockReader)
        }
      };
      
      mockFetch.mockResolvedValue(mockResponse);
      
      const result = await aiService.sendMessageWithStreaming(request, session, onUpdate);
      
      expect(onUpdate).toHaveBeenCalledWith('Hello');
      expect(onUpdate).toHaveBeenCalledWith(' world');
      expect(result.content).toBe('Hello world');
      expect(result.streamed).toBe(true);
    });

    it('should handle non-streaming response format', async () => {
      const request = {
        roomId: 123,
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'gpt-3.5-turbo'
      };
      
      const session = {
        access_token: 'test-token'
      };
      
      const onUpdate = jest.fn();
      
      const mockReader = {
        read: jest.fn()
          .mockResolvedValueOnce({ 
            done: false, 
            value: new global.TextEncoder().encode('data: {"choices":[{"message":{"content":"Hello world"}}]}\n') 
          })
          .mockResolvedValueOnce({ done: true, value: undefined }),
        releaseLock: jest.fn()
      };
      
      const mockResponse = {
        ok: true,
        body: {
          getReader: jest.fn().mockReturnValue(mockReader)
        }
      };
      
      mockFetch.mockResolvedValue(mockResponse);
      
      const result = await aiService.sendMessageWithStreaming(request, session, onUpdate);
      
      expect(result.content).toBe('');
      expect(result.streamed).toBe(true);
    });

    it('should handle direct content format', async () => {
      const request = {
        roomId: 123,
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'gpt-3.5-turbo'
      };
      
      const session = {
        access_token: 'test-token'
      };
      
      const onUpdate = jest.fn();
      
      const mockReader = {
        read: jest.fn()
          .mockResolvedValueOnce({ 
            done: false, 
            value: new global.TextEncoder().encode('data: {"content":"Hello world"}\n') 
          })
          .mockResolvedValueOnce({ done: true, value: undefined }),
        releaseLock: jest.fn()
      };
      
      const mockResponse = {
        ok: true,
        body: {
          getReader: jest.fn().mockReturnValue(mockReader)
        }
      };
      
      mockFetch.mockResolvedValue(mockResponse);
      
      const result = await aiService.sendMessageWithStreaming(request, session, onUpdate);
      
      expect(result.content).toBe('');
      expect(result.streamed).toBe(true);
    });

    it('should handle streaming errors', async () => {
      const request = {
        roomId: 123,
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'gpt-3.5-turbo'
      };
      
      const session = {
        access_token: 'test-token'
      };
      
      const onUpdate = jest.fn();
      
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      };
      
      mockFetch.mockResolvedValue(mockResponse);
      
      await expect(aiService.sendMessageWithStreaming(request, session, onUpdate)).rejects.toThrow('AI API error: 500 - Internal Server Error');
    });

    it('should handle JSON parsing errors in streaming', async () => {
      const request = {
        roomId: 123,
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'gpt-3.5-turbo'
      };
      
      const session = {
        access_token: 'test-token'
      };
      
      const onUpdate = jest.fn();
      
      const mockReader = {
        read: jest.fn()
          .mockResolvedValueOnce({ 
            done: false, 
            value: new global.TextEncoder().encode('data: invalid json\n') 
          })
          .mockResolvedValueOnce({ done: true, value: undefined }),
        releaseLock: jest.fn()
      };
      
      const mockResponse = {
        ok: true,
        body: {
          getReader: jest.fn().mockReturnValue(mockReader)
        }
      };
      
      mockFetch.mockResolvedValue(mockResponse);
      
      const result = await aiService.sendMessageWithStreaming(request, session, onUpdate);
      
      // Should handle invalid JSON gracefully
      expect(result.content).toBe('');
      expect(result.streamed).toBe(true);
    });

    it('should handle abort signal', async () => {
      const request = {
        roomId: 123,
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'gpt-3.5-turbo'
      };
      
      const session = {
        access_token: 'test-token'
      };
      
      const onUpdate = jest.fn();
      
      mockFetch.mockRejectedValue(new Error('AbortError'));
      
      await expect(aiService.sendMessageWithStreaming(request, session, onUpdate)).rejects.toThrow('Failed to send streaming message: AbortError');
    });
  });

  describe('error handling and validation', () => {
    it('should validate request object', async () => {
      const invalidRequest = null;
      const session = { access_token: 'test-token' };
      
      await expect(aiService.sendMessage(invalidRequest, session)).rejects.toThrow('Invalid request object');
    });

    it('should validate session object', async () => {
      const request = {
        roomId: 123,
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'gpt-3.5-turbo'
      };
      const invalidSession = null;
      
      await expect(aiService.sendMessage(request, invalidSession)).rejects.toThrow('Invalid session object');
    });

    it('should validate messages array', async () => {
      const request = {
        roomId: 123,
        messages: null,
        model: 'gpt-3.5-turbo'
      };
      const session = { access_token: 'test-token' };
      
      await expect(aiService.sendMessage(request, session)).rejects.toThrow('Messages array is required');
    });

    it('should validate model', async () => {
      const request = {
        roomId: 123,
        messages: [{ role: 'user', content: 'Hello' }],
        model: null
      };
      const session = { access_token: 'test-token' };
      
      await expect(aiService.sendMessage(request, session)).rejects.toThrow('Model is required');
    });
  });

  describe('performance considerations', () => {
    it('should handle large messages efficiently', async () => {
      const largeMessage = 'A'.repeat(10000);
      const request = {
        roomId: 123,
        messages: [{ role: 'user', content: largeMessage }],
        model: 'gpt-3.5-turbo'
      };
      
      const session = {
        access_token: 'test-token'
      };
      
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          choices: [{ message: { content: 'Response' } }]
        })
      };
      
      mockFetch.mockResolvedValue(mockResponse);
      
      const startTime = Date.now();
      await aiService.sendMessage(request, session);
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle many concurrent requests', async () => {
      const request = {
        roomId: 123,
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'gpt-3.5-turbo'
      };
      
      const session = {
        access_token: 'test-token'
      };
      
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          choices: [{ message: { content: 'Response' } }]
        })
      };
      
      mockFetch.mockResolvedValue(mockResponse);
      
      const promises = Array.from({ length: 5 }, () => aiService.sendMessage(request, session));
      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(5);
      expect(mockFetch).toHaveBeenCalledTimes(5);
    });
  });

  describe('SOLID principle compliance', () => {
    it('should follow Single Responsibility Principle', () => {
      // Should only be responsible for AI service communication
      expect(aiService.sendMessage).toBeDefined();
      expect(aiService.sendMessageWithStreaming).toBeDefined();
    });

    it('should follow Open/Closed Principle', () => {
      // Should be open for extension but closed for modification
      expect(aiService).toBeInstanceOf(ConcurrentAIService);
      expect(aiService).toBeInstanceOf(Object);
    });

    it('should follow Liskov Substitution Principle', () => {
      // Should be substitutable for IAIService
      const service: IAIService = aiService;
      
      expect(typeof service.sendMessage).toBe('function');
      expect(typeof service.sendMessageWithStreaming).toBe('function');
    });

    it('should follow Interface Segregation Principle', () => {
      // Should not force clients to depend on methods they don't use
      const service: IAIService = aiService;
      
      expect(service.sendMessage).toBeDefined();
      expect(service.sendMessageWithStreaming).toBeDefined();
    });

    it('should follow Dependency Inversion Principle', () => {
      // Should depend on abstractions, not concretions
      const service: IAIService = aiService;
      
      expect(service).toBeDefined();
      expect(typeof service.sendMessage).toBe('function');
    });
  });

  describe('API integration scenarios', () => {
    it('should handle different model types', async () => {
      const models = ['gpt-3.5-turbo', 'gpt-4'];
      
      for (const model of models) {
        const request = {
          roomId: 123,
          messages: [{ role: 'user', content: 'Hello' }],
          model
        };
        
        const session = {
          access_token: 'test-token'
        };
        
        const mockResponse = {
          ok: true,
          json: jest.fn().mockResolvedValue({
            choices: [{ message: { content: 'Response' } }],
            model
          })
        };
        
        mockFetch.mockResolvedValue(mockResponse);
        
        const result = await aiService.sendMessage(request, session);
        expect(result.model).toBe(model);
      }
    });

    it('should handle different message roles', async () => {
      const request = {
        roomId: 123,
        messages: [
          { role: 'system', content: 'You are a helpful assistant' },
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'Hi there!' }
        ],
        model: 'gpt-3.5-turbo'
      };
      
      const session = {
        access_token: 'test-token'
      };
      
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          choices: [{ message: { content: 'Response', role: 'assistant' } }]
        })
      };
      
      mockFetch.mockResolvedValue(mockResponse);
      
      const result = await aiService.sendMessage(request, session);
      expect(result.choices[0].message.role).toBe('assistant');
    });
  });
}); 