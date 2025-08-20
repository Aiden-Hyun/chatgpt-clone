import { BudgetManager } from "../components/BudgetManager.ts";
import { FacetManager } from "../components/FacetManager.ts";
import { SynthesisEngine } from "../components/SynthesisEngine.ts";
import type { ReActResult } from "../types/AgentTypes.ts";
import { APICallTracker } from "../utils/APICallTracker.ts";
import { CacheManager } from "./CacheManager.ts";
import { ModelManager } from "./ModelManager.ts";
import { ReActLoop } from "./ReActLoop.ts";
import { ResultOrchestrator } from "./ResultOrchestrator.ts";
import { StateInitializer } from "./StateInitializer.ts";

export interface WorkflowOrchestratorDeps {
  cfg: any;
  budgetManager: BudgetManager;
  modelManager: ModelManager;
  cacheManager: CacheManager;
  stateInitializer: StateInitializer;
  facetManager: FacetManager;
  reactLoop: ReActLoop;
  resultOrchestrator: ResultOrchestrator;
  synthesisEngine: SynthesisEngine;
  apiCallTracker: APICallTracker;
}

export class WorkflowOrchestrator {
  private deps: WorkflowOrchestratorDeps;

  constructor(deps: WorkflowOrchestratorDeps) {
    this.deps = deps;
  }

  private debugLog(...args: any[]): void {
    if (this.deps.cfg?.debug) console.log(...args);
  }

  async run(question: string): Promise<ReActResult> {
    this.debugLog(`[Agent] Starting search for question: "${question.substring(0, 50)}${question.length > 50 ? '...' : ''}"`);
    console.log(`🚀 [Agent] Starting search for question: "${question}"`);
    const start = Date.now();

    console.log(`📊 [Agent] Performance tracking enabled - will log all API calls and token usage`);

    // Initialize budget constraints for this search session
    const budget = this.deps.budgetManager.initBudget(this.deps.cfg.budget as any) as any;
    this.debugLog(`[Agent] Budget initialized: ${JSON.stringify(budget)}`);
    console.log(`🚀 [Agent] Budget initialized: ${budget.searches} searches, ${budget.fetches} fetches, ${Math.round(budget.timeMs/1000)}s time limit`);

    // Get model configuration for cache and state initialization
    const modelInfo = this.deps.modelManager.getModelInfo();

    // Check cache first - return cached result if available
    console.log(`🚀 [Agent] Checking cache...`);
    const { cached, cacheKey } = await this.deps.cacheManager.checkCache(question, {
      reasoningModel: modelInfo.reasoningModel,
      synthesisModel: modelInfo.synthesisModel,
    }, budget);

    if (cached) {
      this.debugLog(`[Agent] Cache hit! Returning cached result`);
      console.log(`✅ [Agent] Cache hit! Returning cached result`);
      if (this.deps.cfg.debug) this.deps.reactLoop.getTrace?.()?.push?.({ event: "cache_hit", cacheKey });
      return cached;
    }
    this.debugLog(`[Agent] No cache hit, proceeding with search`);
    console.log(`🚀 [Agent] No cache hit, proceeding with search`);

    // Initialize search state including question facets
    console.log(`🚀 [Agent] Initializing search state...`);
    const state = await this.deps.stateInitializer.initializeState(
      question,
      budget,
      start,
      this.deps.facetManager,
      {
        reasoningModel: modelInfo.reasoningModel,
        synthesisModel: modelInfo.synthesisModel,
        reasoningProvider: modelInfo.reasoningModelProvider,
        synthesisProvider: modelInfo.synthesisModelProvider,
        openai: modelInfo.openai,
        modelConfig: this.deps.modelManager.getModelConfig(true),
        aiProviderManager: modelInfo.aiProviderManager,
      }
    );
    console.log(`🚀 [Agent] State initialized with ${state.facets.length} facets: ${state.facets.map(f => f.name).join(', ')}`);

    // Handle different question types
    console.log(`🚀 [Agent] Processing question type: ${state.questionType}`);

    switch (state.questionType) {
      case 'DIRECT_ANSWER': {
        console.log(`🚀 [Agent] Direct answer question detected - using pre-generated answer`);
        console.log(`🚀 [Agent] Pre-generated answer: ${state.directAnswer ? state.directAnswer.substring(0, 100) + '...' : 'None'}`);
        const directResult: ReActResult = {
          final_answer_md: state.directAnswer || "Unable to provide direct answer.",
          citations: [],
          trace: [{ event: "direct_answer", questionType: state.questionType }],
          time_warning: undefined
        };
        console.log(`🚀 [Agent] Direct answer result built. Answer length: ${directResult.final_answer_md.length} chars`);
        console.log(`🚀 [Agent] Caching direct answer result...`);
        await this.deps.cacheManager.setCache(cacheKey, directResult);
        const directTime = ((Date.now() - start)/1000).toFixed(2);
        console.log(`✅ [Agent] Direct answer complete in ${directTime}s`);
        this.deps.apiCallTracker.printSummary();
        return directResult;
      }
      case 'MINIMAL_SEARCH': {
        console.log(`🚀 [Agent] Minimal search question detected - limiting search resources`);
        state.budget.searches = Math.min(state.budget.searches, 2);
        state.budget.fetches = Math.min(state.budget.fetches, 1);
        console.log(`🚀 [Agent] Limited budget: ${state.budget.searches} searches, ${state.budget.fetches} fetches`);
        console.log(`🚀 [Agent] Starting limited ReAct loop...`);
        await this.deps.reactLoop.execute(state, this.deps.stateInitializer.getCurrentDateTime());
        console.log(`🚀 [Agent] Limited ReAct loop completed. Final state - Passages: ${state.passages.length}, Facets covered: ${state.facets.filter(f => f.covered).length}/${state.facets.length}`);
        break;
      }
      case 'FULL_RESEARCH':
      default: {
        if (state.questionType === 'FULL_RESEARCH') {
          console.log(`🚀 [Agent] Full research question detected - using full search pipeline`);
          console.log(`🚀 [Agent] Starting full ReAct loop...`);
        } else {
          console.log(`🚀 [Agent] Unknown question type: ${state.questionType}, defaulting to full research`);
          console.log(`🚀 [Agent] Starting ReAct loop...`);
        }
        await this.deps.reactLoop.execute(state, this.deps.stateInitializer.getCurrentDateTime());
        console.log(`🚀 [Agent] ReAct loop completed. Final state - Passages: ${state.passages.length}, Facets covered: ${state.facets.filter(f => f.covered).length}/${state.facets.length}`);
        break;
      }
    }

    // Build final result with citations and metadata
    console.log(`🚀 [Agent] Building final result...`);
    const modelInfo2 = this.deps.modelManager.getModelInfo();
    const result = await this.deps.resultOrchestrator.buildFinalResult(
      question,
      state.language,
      state.passages,
      this.deps.synthesisEngine,
      {
        currentDateTime: this.deps.stateInitializer.getCurrentDateTime(),
        provider: modelInfo2.synthesisModelProvider,
        model: modelInfo2.synthesisModel,
        openai: modelInfo2.openai,
        modelConfig: this.deps.modelManager.getModelConfig(false),
        aiProviderManager: modelInfo2.aiProviderManager,
        apiCallTracker: this.deps.apiCallTracker,
      },
      this.deps.cfg.debug ? this.deps.reactLoop.getTrace() : undefined,
      state.metrics,
    );
    console.log(`🚀 [Agent] Final result built. Answer length: ${result.final_answer_md.length} chars, Citations: ${result.citations?.length || 0}`);

    console.log(`🚀 [Agent] Caching result...`);
    await this.deps.cacheManager.setCache(cacheKey, result);
    this.debugLog(`[Agent] Search complete in ${(Date.now() - start)/1000}s`);

    const totalTime = ((Date.now() - start)/1000).toFixed(2);
    console.log(`✅ [Agent] Search complete in ${totalTime}s`);
    this.deps.apiCallTracker.printSummary();

    return result;
  }
}


