/**
 * ReActLoop Integration Test
 * 
 * This test uses real APIs to verify the ReAct loop works correctly.
 * It tests the core reasoning and acting pattern with actual search services.
 */

import { createClient } from '@supabase/supabase-js';
import { FacetManager } from '../../../supabase/functions/react-search/agent/components/FacetManager';
import { Planner } from '../../../supabase/functions/react-search/agent/components/Planner';
import { ProgressTracker } from '../../../supabase/functions/react-search/agent/components/ProgressTracker';

import { SearchOrchestrator } from '../../../supabase/functions/react-search/agent/components/SearchOrchestrator';
import { EarlyTermination } from '../../../supabase/functions/react-search/agent/core/EarlyTermination';
import { ReActLoop } from '../../../supabase/functions/react-search/agent/core/ReActLoop';
import { CacheManager } from '../../../supabase/functions/react-search/cache';
import { FetchService } from '../../../supabase/functions/react-search/services/fetch';
import { RerankService } from '../../../supabase/functions/react-search/services/rerank';
import { SearchService } from '../../../supabase/functions/react-search/services/search';

// Import the test config with actual API keys
import { testConfig as config } from '../../config';

describe('ReActLoop Integration Test', () => {
  let reactLoop: ReActLoop;
  let searchOrchestrator: SearchOrchestrator;
  let fetchService: FetchService;
  let rerankService: RerankService;
  let cacheManager: CacheManager;

  beforeAll(async () => {
    // Initialize real services with actual API keys from config
    const supabaseClient = createClient(
      config.secrets.supabase.url(),
      config.secrets.supabase.serviceRoleKey()
    );

    // Initialize cache manager
    cacheManager = new CacheManager(supabaseClient, {
      debug: true,
      cacheEnabled: true,
      memCacheEnabled: true,
    });

    // Initialize search service with real API keys from config
    const searchService = new SearchService(cacheManager);
    
    // Override the API keys to use config instead of Deno.env
    if (config.secrets.tavily?.apiKey) {
      searchService.tavilyApiKey = config.secrets.tavily.apiKey();
    }
    if (config.secrets.bing?.apiKey) {
      searchService.bingApiKey = config.secrets.bing.apiKey();
    }
    if (config.secrets.serpapi?.apiKey) {
      searchService.serpApiKey = config.secrets.serpapi.apiKey();
    }
    
    // Initialize other services with API keys from config
    fetchService = new FetchService(cacheManager);
    if (config.secrets.microlink?.apiKey) {
      (fetchService as any).microlinkApiKey = config.secrets.microlink.apiKey();
    }
    
    rerankService = new RerankService();
    if (config.secrets.cohere?.apiKey) {
      (rerankService as any).cohereApiKey = config.secrets.cohere.apiKey();
    }
    if (config.secrets.jina?.apiKey) {
      (rerankService as any).jinaApiKey = config.secrets.jina.apiKey();
    }

    // Initialize search orchestrator
    searchOrchestrator = new SearchOrchestrator(searchService);

    // Initialize ReAct loop dependencies
    const planner = new Planner({
      getModelConfig: (isReasoning: boolean) => ({
        defaultTemperature: isReasoning ? 0.1 : 0.2,
        max_tokens: isReasoning ? 300 : 1200,
        tokenParameter: 'max_tokens',
        supportsCustomTemperature: true,
      }),
      reasoningModel: 'gpt-4o-mini',
      reasoningModelProvider: 'openai',
      openai: null, // Will be initialized by the planner
    });

    const facetManager = new FacetManager();
    const progressTracker = new ProgressTracker();
    const earlyTermination = new EarlyTermination();

    // Initialize ReAct loop
    reactLoop = new ReActLoop({
      planner,
      facetManager,
      progressTracker,
      earlyTermination,
      searchOrchestrator,
      fetchService,
      rerankService,
      debug: true,
    });
  });

  describe('Simple Search Query', () => {
    it('should execute ReAct loop for a simple factual question', async () => {
      // Test with a simple factual question
      const testQuestion = "What is the capital of France?";
      
      // Create initial state
      const initialState = {
        question: testQuestion,
        passages: [],
        facets: [],
        budget: {
          searches: 3,
          fetches: 2,
          timeMs: 60000, // 60 seconds
          startedMs: Date.now(),
        },
        startMs: Date.now(),
        currentDateTime: new Date().toISOString(),
        metrics: { searches: 0, fetches: 0, reranks: 0 },
        models: {
          reasoningModel: 'gpt-4o-mini',
          synthesisModel: 'gpt-4o',
          reasoningProvider: 'openai',
          synthesisProvider: 'openai',
        },
        searchHistory: [],
        decomposedQueriesForSession: [],
        usedDecomposedQueries: new Set(),
        previousPassageCount: 0,
        previousDomainCount: 0,
      };

      // Execute the ReAct loop
      const startTime = Date.now();
      await reactLoop.execute(initialState, new Date().toISOString());
      const endTime = Date.now();

      // Assertions
      expect(initialState.passages.length).toBeGreaterThan(0);
      expect(initialState.metrics.searches).toBeGreaterThan(0);
      expect(initialState.facets.length).toBeGreaterThan(0);
      
      // Check that we got some passages about France/Paris
      const passageTexts = initialState.passages.map(p => p.text.toLowerCase());
      const hasFranceContent = passageTexts.some(text => 
        text.includes('france') || text.includes('paris') || text.includes('capital')
      );
      expect(hasFranceContent).toBe(true);

      // Check performance
      const executionTime = endTime - startTime;
      expect(executionTime).toBeLessThan(30000); // Should complete within 30 seconds

      // Check budget usage
      expect(initialState.budget.searches).toBeGreaterThanOrEqual(0);
      expect(initialState.budget.fetches).toBeGreaterThanOrEqual(0);

      console.log('Test Results:', {
        executionTime: `${executionTime}ms`,
        passagesFound: initialState.passages.length,
        searchesUsed: initialState.metrics.searches,
        fetchesUsed: initialState.metrics.fetches,
        facetsExtracted: initialState.facets.length,
        budgetRemaining: {
          searches: initialState.budget.searches,
          fetches: initialState.budget.fetches,
        }
      });
    }, 60000); // 60 second timeout for real API calls
  });

  afterAll(async () => {
    // Cleanup if needed
    console.log('ReActLoop integration test completed');
  });
});
