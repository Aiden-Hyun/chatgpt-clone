/**
 * ReAct Agent - Main orchestrator for the search and synthesis system
 * 
 * This agent implements the ReAct (Reasoning + Acting) pattern to answer questions
 * by searching the web, fetching content, and synthesizing answers from multiple sources.
 * 
 * The ReAct pattern works as follows:
 * 1. REASONING: Analyze the question and plan next actions
 * 2. ACTING: Execute actions (search, fetch, rerank)
 * 3. Repeat until sufficient information is gathered
 * 4. SYNTHESIZE: Create final answer from gathered information
 */

// Core components that handle specific aspects of the agent's workflow
import { BudgetManager } from "./agent/components/BudgetManager.ts";
import { FacetManager } from "./agent/components/FacetManager.ts";
import { Planner } from "./agent/components/Planner.ts";
import { ProgressTracker } from "./agent/components/ProgressTracker.ts";

import { config as appConfig } from "../shared/config.ts";
import { SynthesisEngine } from "./agent/components/SynthesisEngine.ts";
import { CacheManager } from "./agent/core/CacheManager.ts";
import { EarlyTermination } from "./agent/core/EarlyTermination.ts";
import { ModelManager } from "./agent/core/ModelManager.ts";
import { ReActLoop } from "./agent/core/ReActLoop.ts";
import { ResultOrchestrator } from "./agent/core/ResultOrchestrator.ts";
import { StateInitializer } from "./agent/core/StateInitializer.ts";
import { BingProvider } from "./agent/providers/BingProvider.ts";
import { SerpAPIProvider } from "./agent/providers/SerpAPIProvider.ts";
import { TavilyProvider } from "./agent/providers/TavilyProvider.ts";
import { SearchProviderManager } from "./agent/services/SearchProviderManager.ts";
import type { ReActResult } from "./agent/types/AgentTypes.ts";
import { APICallTracker } from "./agent/utils/APICallTracker.ts";

/**
 * ReActAgent - Main class that orchestrates the search and synthesis workflow
 * 
 * This class coordinates all the specialized components to implement the ReAct pattern.
 * It's designed to be the main entry point for the search system.
 */
export class ReActAgent {
  private cfg: any; // ReActAgentConfig; // This type was removed, so we'll use 'any' for now
  private trace: any[] = [];

  // Modular components - handle specific responsibilities
  private modelManager: ModelManager;        // Manages AI model configuration and providers
  private cacheManager: CacheManager;        // Handles caching of results
  private stateInitializer: StateInitializer; // Initializes search state
  private resultOrchestrator: ResultOrchestrator; // Builds final results
  private reactLoop: ReActLoop;              // Executes the main ReAct loop
  
  // Specialized components - handle specific aspects of the workflow
  private budgetManager: BudgetManager;      // Manages resource constraints
  private searchProviderManager: SearchProviderManager; // Manages search providers
  private synthesisEngine: SynthesisEngine;  // Synthesizes final answers
  private facetManager: FacetManager;        // Manages question facets (sub-questions)
  private planner: Planner;                  // Plans next actions
  private progressTracker: ProgressTracker;  // Tracks search progress
  private earlyTermination: EarlyTermination; // Handles early termination logic
  
  // API Call Tracking
  private apiCallTracker: APICallTracker;    // Tracks all API calls for performance analysis
  
  /**
   * Debug logging helper - only outputs when debug mode is enabled
   */
  private debugLog(...args: any[]): void {
    if (this.cfg?.debug) console.log(...args);
  }

  constructor(cfg: any) { // ReActAgentConfig) { // This type was removed, so we'll use 'any' for now
    this.cfg = cfg;
    
    // Initialize API Call Tracker
    this.apiCallTracker = new APICallTracker();
    
    // Initialize modular components that handle high-level responsibilities
    this.modelManager = new ModelManager(cfg);
    this.cacheManager = new CacheManager({ 
      cacheManager: cfg.cacheManager, 
      debug: cfg.debug 
    });
    this.stateInitializer = new StateInitializer({ debug: cfg.debug, apiCallTracker: this.apiCallTracker });
    this.resultOrchestrator = new ResultOrchestrator({ debug: cfg.debug });
    
    // Initialize specialized components that handle specific workflow aspects
    this.budgetManager = new BudgetManager();
    
    // Initialize Search Provider Manager
    this.searchProviderManager = new SearchProviderManager(!!cfg.debug, cfg.cacheManager);
    
    // Register search providers
    const tavilyApiKey = appConfig.secrets.tavily?.apiKey?.() || Deno.env.get("TAVILY_API_KEY") || "";
    if (tavilyApiKey) {
      this.searchProviderManager.registerProvider(new TavilyProvider(tavilyApiKey));
    }
    
    const bingApiKey = Deno.env.get("BING_API_KEY") || "";
    if (bingApiKey) {
      this.searchProviderManager.registerProvider(new BingProvider(bingApiKey));
    }
    
    const serpApiKey = Deno.env.get("SERPAPI_API_KEY") || "";
    if (serpApiKey) {
      this.searchProviderManager.registerProvider(new SerpAPIProvider(serpApiKey));
    }
    
    this.synthesisEngine = new SynthesisEngine();
    this.facetManager = new FacetManager();
    this.progressTracker = new ProgressTracker();
    this.earlyTermination = new EarlyTermination();
    
    // Initialize planner with model configuration
    const modelInfo = this.modelManager.getModelInfo();
    this.planner = new Planner({
      getModelConfig: (isReasoning: boolean) => this.modelManager.getModelConfig(isReasoning),
      reasoningModel: modelInfo.reasoningModel,
      reasoningModelProvider: modelInfo.reasoningModelProvider,
      openai: modelInfo.openai,
      aiProviderManager: modelInfo.aiProviderManager, // NEW: Pass AI Provider Manager
      apiCallTracker: this.apiCallTracker, // NEW: Pass API Call Tracker
    });
    
    // Initialize ReAct loop with all dependencies
    this.reactLoop = new ReActLoop({
      planner: this.planner,
      facetManager: this.facetManager,
      progressTracker: this.progressTracker,
      earlyTermination: this.earlyTermination,
      searchProviderManager: this.searchProviderManager,
      fetchService: cfg.fetchService,
      rerankService: cfg.rerankService,
      debug: !!cfg.debug,
    });
  }

  /**
   * Main entry point - orchestrates the entire search and synthesis workflow
   * 
   * This method implements the complete ReAct workflow:
   * 1. Check cache for existing answer (avoid duplicate work)
   * 2. Initialize search state and extract question facets
   * 3. Execute ReAct loop until sufficient information is gathered
   * 4. Synthesize final answer from gathered information
   * 5. Cache result for future use
   * 
   * @param question - The user's question to answer
   * @returns Promise resolving to the final answer with citations
   */
  async run(question: string): Promise<ReActResult> {
    this.debugLog(`[Agent] Starting search for question: "${question.substring(0, 50)}${question.length > 50 ? '...' : ''}"`);
    console.log(`🚀 [Agent] Starting search for question: "${question}"`);
    const start = Date.now();
    this.trace = [];
    
    // Track API calls
    let totalApiCalls = 0;
    let totalTokensUsed = 0;
    
    console.log(`📊 [Agent] Performance tracking enabled - will log all API calls and token usage`);
    
    // Initialize budget constraints for this search session
    const budget = this.budgetManager.initBudget(this.cfg.budget as any) as any;
    this.debugLog(`[Agent] Budget initialized: ${JSON.stringify(budget)}`);
    console.log(`🚀 [Agent] Budget initialized: ${budget.searches} searches, ${budget.fetches} fetches, ${Math.round(budget.timeMs/1000)}s time limit`);

    // Get model configuration for cache and state initialization
    const modelInfo = this.modelManager.getModelInfo();

    // Check cache first - return cached result if available
    console.log(`🚀 [Agent] Checking cache...`);
    const { cached, cacheKey } = await this.cacheManager.checkCache(question, {
      reasoningModel: modelInfo.reasoningModel,
      synthesisModel: modelInfo.synthesisModel,
    }, budget);
    
    if (cached) {
      this.debugLog(`[Agent] Cache hit! Returning cached result`);
      console.log(`✅ [Agent] Cache hit! Returning cached result`);
      if (this.cfg.debug) this.trace.push({ event: "cache_hit", cacheKey });
      return cached;
    }
    this.debugLog(`[Agent] No cache hit, proceeding with search`);
    console.log(`🚀 [Agent] No cache hit, proceeding with search`);

    // Initialize search state including question facets
    console.log(`🚀 [Agent] Initializing search state...`);
    const state = await this.stateInitializer.initializeState(
      question,
      budget,
      start,
      this.facetManager,
      {
        reasoningModel: modelInfo.reasoningModel,
        synthesisModel: modelInfo.synthesisModel,
        reasoningProvider: modelInfo.reasoningModelProvider,
        synthesisProvider: modelInfo.synthesisModelProvider,
        openai: modelInfo.openai, // Add OpenAI client
        modelConfig: this.modelManager.getModelConfig(true), // Add model config for reasoning
        aiProviderManager: modelInfo.aiProviderManager, // NEW: Pass AI Provider Manager
      }
    );
    console.log(`🚀 [Agent] State initialized with ${state.facets.length} facets: ${state.facets.map(f => f.name).join(', ')}`);

    // Handle different question types
    console.log(`🚀 [Agent] Processing question type: ${state.questionType}`);
    
    switch (state.questionType) {
      case 'DIRECT_ANSWER':
        console.log(`🚀 [Agent] Direct answer question detected - using pre-generated answer`);
        console.log(`🚀 [Agent] Pre-generated answer: ${state.directAnswer ? state.directAnswer.substring(0, 100) + '...' : 'None'}`);
        
        // Use the pre-generated answer directly (no second API call)
        console.log(`🚀 [Agent] Building direct answer result from pre-generated answer...`);
        const directResult: ReActResult = {
          final_answer_md: state.directAnswer || "Unable to provide direct answer.",
          citations: [], // No citations for direct answers
          trace: [{ event: "direct_answer", questionType: state.questionType }],
          time_warning: undefined
        };
        console.log(`🚀 [Agent] Direct answer result built. Answer length: ${directResult.final_answer_md.length} chars`);
        
        // Cache the result for future use
        console.log(`🚀 [Agent] Caching direct answer result...`);
        await this.cacheManager.setCache(cacheKey, directResult);
        
        const directTime = ((Date.now() - start)/1000).toFixed(2);
        console.log(`✅ [Agent] Direct answer complete in ${directTime}s`);
        
        // Print API call summary
        this.apiCallTracker.printSummary();
        
        return directResult;
        
      case 'MINIMAL_SEARCH':
        console.log(`🚀 [Agent] Minimal search question detected - limiting search resources`);
        // Limit budget for minimal search
        state.budget.searches = Math.min(state.budget.searches, 2);
        state.budget.fetches = Math.min(state.budget.fetches, 1);
        console.log(`🚀 [Agent] Limited budget: ${state.budget.searches} searches, ${state.budget.fetches} fetches`);
        
        // Execute the main ReAct loop with limited resources
        console.log(`🚀 [Agent] Starting limited ReAct loop...`);
        await this.reactLoop.execute(state, this.stateInitializer.getCurrentDateTime());
        console.log(`🚀 [Agent] Limited ReAct loop completed. Final state - Passages: ${state.passages.length}, Facets covered: ${state.facets.filter(f => f.covered).length}/${state.facets.length}`);
        break;
        
      case 'FULL_RESEARCH':
        console.log(`🚀 [Agent] Full research question detected - using full search pipeline`);
        // Execute the main ReAct loop with full resources
        console.log(`🚀 [Agent] Starting full ReAct loop...`);
        await this.reactLoop.execute(state, this.stateInitializer.getCurrentDateTime());
        console.log(`🚀 [Agent] Full ReAct loop completed. Final state - Passages: ${state.passages.length}, Facets covered: ${state.facets.filter(f => f.covered).length}/${state.facets.length}`);
        break;
        
      default:
        console.log(`🚀 [Agent] Unknown question type: ${state.questionType}, defaulting to full research`);
        // Execute the main ReAct loop until sufficient information is gathered
        console.log(`🚀 [Agent] Starting ReAct loop...`);
        await this.reactLoop.execute(state, this.stateInitializer.getCurrentDateTime());
        console.log(`🚀 [Agent] ReAct loop completed. Final state - Passages: ${state.passages.length}, Facets covered: ${state.facets.filter(f => f.covered).length}/${state.facets.length}`);
        break;
    }

    // Build final result with citations and metadata
    console.log(`🚀 [Agent] Building final result...`);
    const result = await this.resultOrchestrator.buildFinalResult(
      question,
      state.passages,
      this.synthesisEngine,
      {
        currentDateTime: this.stateInitializer.getCurrentDateTime(),
        provider: modelInfo.synthesisModelProvider,
        model: modelInfo.synthesisModel,
        openai: modelInfo.openai,
        modelConfig: this.modelManager.getModelConfig(false),
        aiProviderManager: modelInfo.aiProviderManager, // NEW: Pass AI Provider Manager
        apiCallTracker: this.apiCallTracker, // NEW: Pass API Call Tracker
      },
      this.cfg.debug ? this.reactLoop.getTrace() : undefined,
      state.metrics,
    );
    console.log(`🚀 [Agent] Final result built. Answer length: ${result.final_answer_md.length} chars, Citations: ${result.citations?.length || 0}`);

    // Cache the result for future use
    console.log(`🚀 [Agent] Caching result...`);
    await this.cacheManager.setCache(cacheKey, result);
    this.debugLog(`[Agent] Search complete in ${(Date.now() - start)/1000}s`);
    
    const totalTime = ((Date.now() - start)/1000).toFixed(2);
    console.log(`✅ [Agent] Search complete in ${totalTime}s`);
    
    // Print API call summary
    this.apiCallTracker.printSummary();
    
    return result;
  }
}