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
import { QueryDecomposer } from "./agent/components/QueryDecomposer.ts";
import { SearchOrchestrator } from "./agent/components/SearchOrchestrator.ts";
import { SynthesisEngine } from "./agent/components/SynthesisEngine.ts";

// Core utilities for state management and execution
import { CacheManager } from "./agent/core/CacheManager.ts";
import { EarlyTermination } from "./agent/core/EarlyTermination.ts";
import { ModelManager } from "./agent/core/ModelManager.ts";
import { ReActLoop } from "./agent/core/ReActLoop.ts";
import { ResultOrchestrator } from "./agent/core/ResultOrchestrator.ts";
import { StateInitializer } from "./agent/core/StateInitializer.ts";

// Type definitions
import type { ReActAgentConfig, ReActResult } from "./agent/types/AgentTypes.ts";

/**
 * ReActAgent - Main class that orchestrates the search and synthesis workflow
 * 
 * This class coordinates all the specialized components to implement the ReAct pattern.
 * It's designed to be the main entry point for the search system.
 */
export class ReActAgent {
  private cfg: ReActAgentConfig;
  private trace: any[] = [];

  // Modular components - handle specific responsibilities
  private modelManager: ModelManager;        // Manages AI model configuration and providers
  private cacheManager: CacheManager;        // Handles caching of results
  private stateInitializer: StateInitializer; // Initializes search state
  private resultOrchestrator: ResultOrchestrator; // Builds final results
  private reactLoop: ReActLoop;              // Executes the main ReAct loop
  
  // Specialized components - handle specific aspects of the workflow
  private budgetManager: BudgetManager;      // Manages resource constraints
  private queryDecomposer: QueryDecomposer;  // Breaks complex queries into simpler ones
  private searchOrchestrator: SearchOrchestrator; // Orchestrates search operations
  private synthesisEngine: SynthesisEngine;  // Synthesizes final answers
  private facetManager: FacetManager;        // Manages question facets (sub-questions)
  private planner: Planner;                  // Plans next actions
  private progressTracker: ProgressTracker;  // Tracks search progress
  private earlyTermination: EarlyTermination; // Handles early termination logic
  
  /**
   * Debug logging helper - only outputs when debug mode is enabled
   */
  private debugLog(...args: any[]): void {
    if (this.cfg?.debug) console.log(...args);
  }

  constructor(cfg: ReActAgentConfig) {
    this.cfg = cfg;
    
    // Initialize modular components that handle high-level responsibilities
    this.modelManager = new ModelManager(cfg);
    this.cacheManager = new CacheManager({ 
      cacheManager: cfg.cacheManager, 
      debug: cfg.debug 
    });
    this.stateInitializer = new StateInitializer({ debug: cfg.debug });
    this.resultOrchestrator = new ResultOrchestrator({ debug: cfg.debug });
    
    // Initialize specialized components that handle specific workflow aspects
    this.budgetManager = new BudgetManager();
    this.queryDecomposer = new QueryDecomposer();
    this.searchOrchestrator = new SearchOrchestrator(cfg.searchService);
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
    });
    
    // Initialize ReAct loop with all dependencies
    this.reactLoop = new ReActLoop({
      planner: this.planner,
      facetManager: this.facetManager,
      progressTracker: this.progressTracker,
      earlyTermination: this.earlyTermination,
      searchOrchestrator: this.searchOrchestrator,
      fetchService: cfg.fetchService,
      rerankService: cfg.rerankService,
      queryDecomposer: this.queryDecomposer,
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
    const start = Date.now();
    this.trace = [];
    
    // Initialize budget constraints for this search session
    const budget = this.budgetManager.initBudget(this.cfg.budget as any) as any;
    this.debugLog(`[Agent] Budget initialized: ${JSON.stringify(budget)}`);

    // Get model configuration for cache and state initialization
    const modelInfo = this.modelManager.getModelInfo();

    // Check cache first - return cached result if available
    const { cached, cacheKey } = await this.cacheManager.checkCache(question, {
      reasoningModel: modelInfo.reasoningModel,
      synthesisModel: modelInfo.synthesisModel,
    }, budget);
    
    if (cached) {
      this.debugLog(`[Agent] Cache hit! Returning cached result`);
      if (this.cfg.debug) this.trace.push({ event: "cache_hit", cacheKey });
      return cached;
    }
    this.debugLog(`[Agent] No cache hit, proceeding with search`);

    // Initialize search state including question facets
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
      }
    );

    // Execute the main ReAct loop until sufficient information is gathered
    await this.reactLoop.execute(state, this.stateInitializer.getCurrentDateTime());

    // Build final result with citations and metadata
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
      },
      this.cfg.debug ? this.reactLoop.getTrace() : undefined,
      state.metrics,
    );

    // Cache the result for future use
    await this.cacheManager.setCache(cacheKey, result);
    this.debugLog(`[Agent] Search complete in ${(Date.now() - start)/1000}s`);
    return result;
  }
}