import { ServiceContainer } from '../../../../src/features/concurrent-chat/core/container/ServiceContainer';
import { EventBus } from '../../../../src/features/concurrent-chat/core/events/EventBus';
import { SupabaseService } from '../../../../src/features/concurrent-chat/core/services/SupabaseService';
import { OpenAIService } from '../../../../src/features/concurrent-chat/core/services/OpenAIService';
import { APIIntegrationManager } from '../../../../src/features/concurrent-chat/core/integration/APIIntegrationManager';
import { JWTTokenManager } from '../../../../src/features/concurrent-chat/core/auth/JWTTokenManager';
import { RateLimiter } from '../../../../src/features/concurrent-chat/core/network/RateLimiter';
import { NetworkErrorHandler } from '../../../../src/features/concurrent-chat/core/network/NetworkErrorHandler';

// Mock external dependencies
jest.mock('@supabase/supabase-js');
jest.mock('openai');

describe('API Integration Tests', () => {
  let serviceContainer: ServiceContainer;
  let eventBus: EventBus;
  let apiIntegrationManager: APIIntegrationManager;
  let supabaseService: SupabaseService;
  let openAIService: OpenAIService;
  let jwtTokenManager: JWTTokenManager;
  let rateLimiter: RateLimiter;
  let networkErrorHandler: NetworkErrorHandler;

  beforeEach(() => {
    serviceContainer = new ServiceContainer();
    eventBus = new EventBus();
    apiIntegrationManager = new APIIntegrationManager(serviceContainer, eventBus);
    supabaseService = new SupabaseService();
    openAIService = new OpenAIService();
    jwtTokenManager = new JWTTokenManager();
    rateLimiter = new RateLimiter();
    networkErrorHandler = new NetworkErrorHandler();
  });

  describe('Supabase edge function integration', () => {
    it('should call Supabase edge functions correctly', async () => {
      const mockResponse = {
        data: { message: 'Hello from edge function' },
        error: null
      };

      supabaseService.functions.invoke = jest.fn().mockResolvedValue(mockResponse);

      const result = await apiIntegrationManager.callEdgeFunction('test-function', {
        param1: 'value1',
        param2: 'value2'
      });

      expect(supabaseService.functions.invoke).toHaveBeenCalledWith('test-function', {
        body: { param1: 'value1', param2: 'value2' }
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle Supabase edge function errors', async () => {
      const mockError = {
        data: null,
        error: { message: 'Edge function failed', status: 500 }
      };

      supabaseService.functions.invoke = jest.fn().mockResolvedValue(mockError);

      await expect(
        apiIntegrationManager.callEdgeFunction('error-function', {})
      ).rejects.toThrow('Edge function failed');
    });

    it('should handle edge function timeouts', async () => {
      supabaseService.functions.invoke = jest.fn().mockImplementation(() => {
        return new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout')), 10000);
        });
      });

      await expect(
        apiIntegrationManager.callEdgeFunction('timeout-function', {})
      ).rejects.toThrow('Timeout');
    });

    it('should retry failed edge function calls', async () => {
      const mockResponse = {
        data: { message: 'Success after retry' },
        error: null
      };

      supabaseService.functions.invoke = jest.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockResponse);

      const result = await apiIntegrationManager.callEdgeFunctionWithRetry('retry-function', {}, 2);

      expect(supabaseService.functions.invoke).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('OpenAI API integration', () => {
    it('should call OpenAI API correctly', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'Hello from OpenAI',
            role: 'assistant'
          }
        }]
      };

      openAIService.chat.completions.create = jest.fn().mockResolvedValue(mockResponse);

      const result = await apiIntegrationManager.callOpenAI({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello' }],
        temperature: 0.7
      });

      expect(openAIService.chat.completions.create).toHaveBeenCalledWith({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello' }],
        temperature: 0.7
      });
      expect(result).toEqual(mockResponse.choices[0].message.content);
    });

    it('should handle OpenAI API errors', async () => {
      const mockError = new Error('OpenAI API error');
      openAIService.chat.completions.create = jest.fn().mockRejectedValue(mockError);

      await expect(
        apiIntegrationManager.callOpenAI({
          model: 'gpt-4',
          messages: [{ role: 'user', content: 'Hello' }]
        })
      ).rejects.toThrow('OpenAI API error');
    });

    it('should handle OpenAI rate limiting', async () => {
      const rateLimitError = new Error('Rate limit exceeded');
      rateLimitError.name = 'RateLimitError';

      openAIService.chat.completions.create = jest.fn().mockRejectedValue(rateLimitError);

      await expect(
        apiIntegrationManager.callOpenAI({
          model: 'gpt-4',
          messages: [{ role: 'user', content: 'Hello' }]
        })
      ).rejects.toThrow('Rate limit exceeded');
    });

    it('should handle OpenAI model not found errors', async () => {
      const modelError = new Error('Model not found');
      modelError.name = 'ModelNotFoundError';

      openAIService.chat.completions.create = jest.fn().mockRejectedValue(modelError);

      await expect(
        apiIntegrationManager.callOpenAI({
          model: 'invalid-model',
          messages: [{ role: 'user', content: 'Hello' }]
        })
      ).rejects.toThrow('Model not found');
    });

    it('should handle OpenAI streaming responses', async () => {
      const mockStream = {
        [Symbol.asyncIterator]: async function* () {
          yield {
            choices: [{
              delta: { content: 'Hello' },
              finish_reason: null
            }]
          };
          yield {
            choices: [{
              delta: { content: ' World' },
              finish_reason: 'stop'
            }]
          };
        }
      };

      openAIService.chat.completions.create = jest.fn().mockResolvedValue(mockStream);

      const stream = await apiIntegrationManager.callOpenAIStream({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello' }]
      });

      let content = '';
      for await (const chunk of stream) {
        content += chunk.choices[0].delta.content || '';
      }

      expect(content).toBe('Hello World');
    });
  });

  describe('JWT token authentication', () => {
    it('should authenticate with JWT tokens', async () => {
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.signature';
      const mockUser = { id: 'user1', email: 'test@example.com' };

      jwtTokenManager.validateToken = jest.fn().mockResolvedValue(mockUser);
      jwtTokenManager.refreshToken = jest.fn().mockResolvedValue('new-token');

      const user = await apiIntegrationManager.authenticateWithToken(mockToken);

      expect(jwtTokenManager.validateToken).toHaveBeenCalledWith(mockToken);
      expect(user).toEqual(mockUser);
    });

    it('should handle expired JWT tokens', async () => {
      const expiredToken = 'expired.token.here';
      const newToken = 'new.valid.token';

      jwtTokenManager.validateToken = jest.fn().mockRejectedValue(new Error('Token expired'));
      jwtTokenManager.refreshToken = jest.fn().mockResolvedValue(newToken);

      const result = await apiIntegrationManager.handleExpiredToken(expiredToken);

      expect(jwtTokenManager.refreshToken).toHaveBeenCalledWith(expiredToken);
      expect(result).toBe(newToken);
    });

    it('should handle invalid JWT tokens', async () => {
      const invalidToken = 'invalid.token.here';

      jwtTokenManager.validateToken = jest.fn().mockRejectedValue(new Error('Invalid token'));

      await expect(
        apiIntegrationManager.authenticateWithToken(invalidToken)
      ).rejects.toThrow('Invalid token');
    });

    it('should handle JWT token refresh failures', async () => {
      const expiredToken = 'expired.token.here';

      jwtTokenManager.validateToken = jest.fn().mockRejectedValue(new Error('Token expired'));
      jwtTokenManager.refreshToken = jest.fn().mockRejectedValue(new Error('Refresh failed'));

      await expect(
        apiIntegrationManager.handleExpiredToken(expiredToken)
      ).rejects.toThrow('Refresh failed');
    });
  });

  describe('Model parameter handling', () => {
    it('should validate model parameters', () => {
      const validParams = {
        model: 'gpt-4',
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 1.0
      };

      const result = apiIntegrationManager.validateModelParameters(validParams);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid model parameters', () => {
      const invalidParams = {
        model: 'invalid-model',
        temperature: 2.0, // Invalid temperature
        max_tokens: -1, // Invalid max_tokens
        top_p: 1.5 // Invalid top_p
      };

      const result = apiIntegrationManager.validateModelParameters(invalidParams);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle missing required parameters', () => {
      const incompleteParams = {
        model: 'gpt-4'
        // Missing required parameters
      };

      const result = apiIntegrationManager.validateModelParameters(incompleteParams);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing required parameter: messages');
    });

    it('should sanitize model parameters', () => {
      const unsanitizedParams = {
        model: 'gpt-4',
        temperature: 1.5, // Out of range
        max_tokens: 10000, // Too high
        messages: [{ role: 'user', content: 'Hello' }]
      };

      const sanitizedParams = apiIntegrationManager.sanitizeModelParameters(unsanitizedParams);

      expect(sanitizedParams.temperature).toBe(1.0); // Clamped to max
      expect(sanitizedParams.max_tokens).toBe(4000); // Clamped to max
    });
  });

  describe('Response parsing', () => {
    it('should parse OpenAI responses correctly', () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'Hello from AI',
            role: 'assistant'
          },
          finish_reason: 'stop'
        }],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 5,
          total_tokens: 15
        }
      };

      const parsed = apiIntegrationManager.parseOpenAIResponse(mockResponse);

      expect(parsed.content).toBe('Hello from AI');
      expect(parsed.role).toBe('assistant');
      expect(parsed.usage).toEqual(mockResponse.usage);
    });

    it('should handle empty OpenAI responses', () => {
      const emptyResponse = {
        choices: [],
        usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
      };

      const parsed = apiIntegrationManager.parseOpenAIResponse(emptyResponse);

      expect(parsed.content).toBe('');
      expect(parsed.role).toBe('assistant');
    });

    it('should parse streaming responses', async () => {
      const mockStream = [
        { choices: [{ delta: { content: 'Hello' }, finish_reason: null }] },
        { choices: [{ delta: { content: ' World' }, finish_reason: 'stop' }] }
      ];

      const parsed = await apiIntegrationManager.parseStreamingResponse(mockStream);

      expect(parsed.content).toBe('Hello World');
      expect(parsed.isComplete).toBe(true);
    });

    it('should handle malformed responses', () => {
      const malformedResponse = {
        choices: [{
          message: null, // Missing message
          finish_reason: 'stop'
        }]
      };

      expect(() => {
        apiIntegrationManager.parseOpenAIResponse(malformedResponse);
      }).toThrow('Invalid response format');
    });
  });

  describe('Error handling', () => {
    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      networkError.name = 'NetworkError';

      networkErrorHandler.handleError = jest.fn().mockResolvedValue({
        retry: true,
        delay: 1000
      });

      const result = await apiIntegrationManager.handleNetworkError(networkError);

      expect(networkErrorHandler.handleError).toHaveBeenCalledWith(networkError);
      expect(result.retry).toBe(true);
    });

    it('should handle API rate limiting', async () => {
      const rateLimitError = new Error('Rate limit exceeded');
      rateLimitError.name = 'RateLimitError';

      rateLimiter.handleRateLimit = jest.fn().mockResolvedValue({
        retry: true,
        delay: 5000
      });

      const result = await apiIntegrationManager.handleRateLimitError(rateLimitError);

      expect(rateLimiter.handleRateLimit).toHaveBeenCalledWith(rateLimitError);
      expect(result.retry).toBe(true);
    });

    it('should handle authentication errors', async () => {
      const authError = new Error('Authentication failed');
      authError.name = 'AuthenticationError';

      const result = await apiIntegrationManager.handleAuthenticationError(authError);

      expect(result.requiresReauth).toBe(true);
      expect(result.redirectToLogin).toBe(true);
    });

    it('should handle server errors', async () => {
      const serverError = new Error('Internal server error');
      serverError.name = 'ServerError';

      const result = await apiIntegrationManager.handleServerError(serverError);

      expect(result.retry).toBe(true);
      expect(result.maxRetries).toBe(3);
    });

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('Request timeout');
      timeoutError.name = 'TimeoutError';

      const result = await apiIntegrationManager.handleTimeoutError(timeoutError);

      expect(result.retry).toBe(true);
      expect(result.increaseTimeout).toBe(true);
    });
  });

  describe('Rate limiting', () => {
    it('should enforce rate limits', async () => {
      rateLimiter.checkLimit = jest.fn().mockResolvedValue(true);
      rateLimiter.recordRequest = jest.fn();

      const canProceed = await apiIntegrationManager.checkRateLimit('openai');

      expect(rateLimiter.checkLimit).toHaveBeenCalledWith('openai');
      expect(canProceed).toBe(true);
    });

    it('should handle rate limit exceeded', async () => {
      rateLimiter.checkLimit = jest.fn().mockResolvedValue(false);
      rateLimiter.getWaitTime = jest.fn().mockResolvedValue(5000);

      const result = await apiIntegrationManager.handleRateLimitExceeded('openai');

      expect(rateLimiter.getWaitTime).toHaveBeenCalledWith('openai');
      expect(result.waitTime).toBe(5000);
    });

    it('should implement exponential backoff', async () => {
      const backoffTimes = await apiIntegrationManager.calculateBackoffTimes(3);

      expect(backoffTimes).toEqual([1000, 2000, 4000]); // Exponential backoff
    });

    it('should handle concurrent rate limiting', async () => {
      rateLimiter.checkLimit = jest.fn()
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);

      const result1 = await apiIntegrationManager.checkRateLimit('openai');
      const result2 = await apiIntegrationManager.checkRateLimit('openai');

      expect(result1).toBe(true);
      expect(result2).toBe(false);
    });
  });

  describe('Network error handling', () => {
    it('should handle connection errors', async () => {
      const connectionError = new Error('Connection refused');
      connectionError.name = 'ConnectionError';

      networkErrorHandler.handleConnectionError = jest.fn().mockResolvedValue({
        retry: true,
        delay: 2000
      });

      const result = await apiIntegrationManager.handleConnectionError(connectionError);

      expect(networkErrorHandler.handleConnectionError).toHaveBeenCalledWith(connectionError);
      expect(result.retry).toBe(true);
    });

    it('should handle DNS resolution errors', async () => {
      const dnsError = new Error('DNS resolution failed');
      dnsError.name = 'DNSError';

      const result = await apiIntegrationManager.handleDNSError(dnsError);

      expect(result.retry).toBe(true);
      expect(result.useFallbackDNS).toBe(true);
    });

    it('should handle SSL/TLS errors', async () => {
      const sslError = new Error('SSL certificate error');
      sslError.name = 'SSLError';

      const result = await apiIntegrationManager.handleSSLError(sslError);

      expect(result.retry).toBe(false);
      expect(result.requiresCertificateUpdate).toBe(true);
    });

    it('should implement circuit breaker pattern', async () => {
      const circuitBreaker = apiIntegrationManager.getCircuitBreaker('openai');

      // Simulate failures
      for (let i = 0; i < 5; i++) {
        circuitBreaker.recordFailure();
      }

      const isOpen = circuitBreaker.isOpen();
      expect(isOpen).toBe(true);
    });

    it('should handle network timeouts', async () => {
      const timeoutError = new Error('Request timeout');
      timeoutError.name = 'TimeoutError';

      const result = await apiIntegrationManager.handleNetworkTimeout(timeoutError);

      expect(result.retry).toBe(true);
      expect(result.increaseTimeout).toBe(true);
      expect(result.newTimeout).toBeGreaterThan(30000); // Increased timeout
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete API flow', async () => {
      // Mock successful flow
      const mockToken = 'valid.jwt.token';
      const mockUser = { id: 'user1', email: 'test@example.com' };
      const mockAIResponse = {
        choices: [{
          message: { content: 'Hello from AI', role: 'assistant' }
        }]
      };

      jwtTokenManager.validateToken = jest.fn().mockResolvedValue(mockUser);
      openAIService.chat.completions.create = jest.fn().mockResolvedValue(mockAIResponse);
      rateLimiter.checkLimit = jest.fn().mockResolvedValue(true);

      const result = await apiIntegrationManager.completeAPIFlow({
        token: mockToken,
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello' }]
      });

      expect(result.user).toEqual(mockUser);
      expect(result.response).toBe('Hello from AI');
      expect(result.success).toBe(true);
    });

    it('should handle API flow with retries', async () => {
      const mockToken = 'valid.jwt.token';
      const mockUser = { id: 'user1', email: 'test@example.com' };
      const mockAIResponse = {
        choices: [{
          message: { content: 'Hello from AI', role: 'assistant' }
        }]
      };

      jwtTokenManager.validateToken = jest.fn().mockResolvedValue(mockUser);
      openAIService.chat.completions.create = jest.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockAIResponse);
      rateLimiter.checkLimit = jest.fn().mockResolvedValue(true);

      const result = await apiIntegrationManager.completeAPIFlowWithRetry({
        token: mockToken,
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello' }],
        maxRetries: 2
      });

      expect(result.response).toBe('Hello from AI');
      expect(result.retryCount).toBe(1);
    });

    it('should handle API flow with rate limiting', async () => {
      const mockToken = 'valid.jwt.token';
      const mockUser = { id: 'user1', email: 'test@example.com' };

      jwtTokenManager.validateToken = jest.fn().mockResolvedValue(mockUser);
      rateLimiter.checkLimit = jest.fn()
        .mockResolvedValueOnce(false) // Rate limited
        .mockResolvedValueOnce(true); // Allowed

      const result = await apiIntegrationManager.completeAPIFlowWithRateLimit({
        token: mockToken,
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello' }]
      });

      expect(result.rateLimited).toBe(true);
      expect(result.waitTime).toBeGreaterThan(0);
    });
  });
}); 