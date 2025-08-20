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
import { BudgetManager } from "./components/BudgetManager.ts";
import { FacetManager } from "./components/FacetManager.ts";
import { Planner } from "./components/Planner.ts";
import { ProgressTracker } from "./components/ProgressTracker.ts";

import { config as appConfig } from "../../shared/config.ts";
import { SynthesisEngine } from "./components/SynthesisEngine.ts";
import { CacheManager } from "./core/CacheManager.ts";
import { ModelManager } from "./core/ModelManager.ts";
import { ReActLoop } from "./core/ReActLoop.ts";
import { ResultOrchestrator } from "./core/ResultOrchestrator.ts";
import { StateInitializer } from "./core/StateInitializer.ts";
import { BingProvider } from "./providers/BingProvider.ts";
import { SerpAPIProvider } from "./providers/SerpAPIProvider.ts";
import { TavilyProvider } from "./providers/TavilyProvider.ts";
import { SearchProviderManager } from "./services/SearchProviderManager.ts";
import type { ReActResult } from "./types/AgentTypes.ts";
import { APICallTracker } from "./utils/APICallTracker.ts";
import { WorkflowOrchestrator } from "./core/WorkflowOrchestrator.ts";

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
  
  // API Call Tracking
  private apiCallTracker: APICallTracker;    // Tracks all API calls for performance analysis
  private workflowOrchestrator?: WorkflowOrchestrator;

  /**
   * Debug logging helper - only outputs when debug mode is enabled
   */
  private debugLog(...args: any[]): void {
    if (this.cfg?.debug) console.log(...args);
  }

  constructor(cfg: any) { // ReActAgentConfig) { // This type was removed, so we'll use 'any' for now
    this.cfg = cfg;
    
    console.log("🚀 [ReActAgent] Initializing ReActAgent with config:", { debug: cfg.debug, cacheEnabled: !!cfg.cacheManager });
    
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
    const getEnv = (key: string): string => {
      try {
        const env = (globalThis as any)?.Deno?.env?.get?.(key);
        return typeof env === 'string' ? env : "";
      } catch {
        return "";
      }
    };
    const tavilyApiKey = appConfig.secrets.tavily?.apiKey?.() || getEnv("TAVILY_API_KEY") || "";
    if (tavilyApiKey) {
      this.searchProviderManager.registerProvider(new TavilyProvider(tavilyApiKey));
      console.log("🔍 [ReActAgent] Registered Tavily search provider");
    }
    
    const bingApiKey = getEnv("BING_API_KEY") || "";
    if (bingApiKey) {
      this.searchProviderManager.registerProvider(new BingProvider(bingApiKey));
      console.log("🔍 [ReActAgent] Registered Bing search provider");
    }
    
    const serpApiKey = getEnv("SERPAPI_API_KEY") || "";
    if (serpApiKey) {
      this.searchProviderManager.registerProvider(new SerpAPIProvider(serpApiKey));
      console.log("🔍 [ReActAgent] Registered SerpAPI search provider");
    }
    
    this.synthesisEngine = new SynthesisEngine();
    this.facetManager = new FacetManager();
    this.progressTracker = new ProgressTracker();
    
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
      searchProviderManager: this.searchProviderManager,
      fetchService: cfg.fetchService,
      rerankService: cfg.rerankService,
      debug: !!cfg.debug,
    });

    // Initialize workflow orchestrator (extracted from run)
    this.workflowOrchestrator = new WorkflowOrchestrator({
      cfg: this.cfg,
      budgetManager: this.budgetManager,
      modelManager: this.modelManager,
      cacheManager: this.cacheManager,
      stateInitializer: this.stateInitializer,
      facetManager: this.facetManager,
      reactLoop: this.reactLoop,
      resultOrchestrator: this.resultOrchestrator,
      synthesisEngine: this.synthesisEngine,
      apiCallTracker: this.apiCallTracker,
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
    console.log("🎯 [ReActAgent] Starting workflow for question:", question.substring(0, 50) + "...");
    
    if (!this.workflowOrchestrator) {
      throw new Error('WorkflowOrchestrator not initialized');
    }
    
    const result = await this.workflowOrchestrator.run(question);
    console.log("✅ [ReActAgent] Workflow completed successfully");
    
    return result;
  }
}


