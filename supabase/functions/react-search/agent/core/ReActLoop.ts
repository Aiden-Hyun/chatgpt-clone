import type { FacetManager } from "../components/FacetManager.ts";
import type { Planner } from "../components/Planner.ts";
import type { ProgressTracker } from "../components/ProgressTracker.ts";
import type { SearchProviderManager } from "../services/SearchProviderManager.ts";
import type { AgentState, Budget } from "../types/AgentTypes.ts";
import { distinct } from "../utils/text-utils.ts";
import { isTimeSensitive } from "../utils/time-utils.ts";
import { eTLDplus1 } from "../utils/url-utils.ts";
import { ActionExecutor } from "./ActionExecutor.ts";
import { EarlyTermination } from "./EarlyTermination.ts";

export interface ReActLoopConfig {
  debug?: boolean;
  searchService: any;
  fetchService: any;
  rerankService: any;
  searchProviderManager: SearchProviderManager;
}

export interface ReActLoopDependencies {
  planner: Planner;
  facetManager: FacetManager;
  progressTracker: ProgressTracker;
  searchProviderManager: SearchProviderManager;
  fetchService: any;
  rerankService: any;
  debug: boolean;
}

/**
 * ReActLoop - Handles the main ReAct loop logic
 * 
 * This class implements the core ReAct (Reasoning + Acting) pattern:
 * 1. REASONING: Analyze current state and decide next action
 * 2. ACTING: Execute the planned action (search, fetch, rerank)
 * 3. Update state and repeat until sufficient information is gathered
 * 
 * The loop continues until:
 * - Budget is exhausted (searches/fetches/time)
 * - Sufficient information is gathered (facet coverage)
 * - No progress is made for several iterations
 * - Early termination conditions are met
 */
export class ReActLoop {
  private deps: ReActLoopDependencies;
  private trace: any[] = [];

  constructor(deps: ReActLoopDependencies) {
    this.deps = deps;
  }

  /**
   * Debug logging helper - only outputs when debug mode is enabled
   */
  private debugLog(...args: any[]): void {
    if (this.deps.debug) console.log(...args);
  }

  /**
   * Execute the main ReAct loop
   * 
   * This method implements the core ReAct pattern:
   * 1. Loop until termination conditions are met
   * 2. For each iteration: reason → act → update → check progress
   * 3. Handle early termination and time constraints
   * 
   * @param state - Current agent state (question, passages, facets, budget)
   * @param currentDateTime - Current date time for time-sensitive queries
   */
  async execute(state: AgentState, currentDateTime: string): Promise<void> {
    const start = state.startMs;
    const budget = state.budget;
    
    console.log(`🔄 [ReActLoop] Starting execution for question: "${state.question}"`);
    console.log(`🔄 [ReActLoop] Initial state - Passages: ${state.passages.length}, Facets: ${state.facets.length}, Budget: ${budget.searches} searches, ${budget.fetches} fetches`);
    
    // Early exit for direct answer questions
    if (state.questionType === 'DIRECT_ANSWER') {
      console.log(`🔄 [ReActLoop] Direct answer question detected - skipping ReAct loop`);
      console.log(`🔄 [ReActLoop] Direct answer: ${state.directAnswer || 'Will be handled in synthesis'}`);
      return;
    }
    
    // Log MINIMAL_SEARCH optimization
    if (state.questionType === 'MINIMAL_SEARCH') {
      console.log(`🔄 [ReActLoop] MINIMAL_SEARCH detected - will enforce 1 SEARCH then STOP rule`);
    }
    
    // Main ReAct loop - continues until budget exhausted or sufficient information gathered
    const MAX_ITERATIONS = 10;
    let iterations = 0;
    let searchCount = 0; // NEW: Track number of searches performed
    this.deps.progressTracker.reset();
    
    while (!this.isBudgetDepleted(budget) && 
           Date.now() - start < budget.timeMs && 
           iterations < MAX_ITERATIONS &&
           this.deps.progressTracker.iterationsWithoutProgress < 3) {
      
      iterations++;
      console.log(`🔄 [ReActLoop] === ITERATION ${iterations} ===`);
      this.debugLog(`[ReActLoop] Loop iteration ${iterations}: Deciding next action`);
      
      // Track progress for debugging
      const currentPassageCount = state.passages.length;
      const currentDomainCount = distinct(state.passages.map(p => p.source_domain || eTLDplus1(p.url) || "unknown")).length;
      const currentFacetCoverage = state.facets.filter(f => f.covered).length;
      
      console.log(`🔄 [ReActLoop] Current state - Passages: ${currentPassageCount}, Domains: ${currentDomainCount}, Facets covered: ${currentFacetCoverage}/${state.facets.length}`);
      this.debugLog(`[ReActLoop:Debug] State - Passages: ${currentPassageCount} (${currentPassageCount - state.previousPassageCount > 0 ? '+' : ''}${currentPassageCount - state.previousPassageCount}), Domains: ${currentDomainCount} (${currentDomainCount - state.previousDomainCount > 0 ? '+' : ''}${currentDomainCount - state.previousDomainCount}), Facets: ${currentFacetCoverage}/${state.facets.length}`);
      this.debugLog(`[ReActLoop:Debug] Budget - Time: ${Math.round((Date.now() - budget.startedMs) / 1000)}s/${Math.round(budget.timeMs / 1000)}s, Searches: ${budget.searches}, Fetches: ${budget.fetches}`);
      this.debugLog(`[ReActLoop:Debug] Search History: ${state.searchHistory.slice(-3).join(' | ')}`);
      
      // REASONING: Decide what action to take next
      console.log(`🔄 [ReActLoop] Asking planner to decide next action...`);
      const action = await this.deps.planner.decideActionJSON({
        question: state.question,
        passages: state.passages,
        facets: state.facets,
        budget: state.budget,
        currentDateTime,
        isTimeSensitive,
        iterationsWithoutProgress: 0,
        tracePush: (obj: any) => { if (this.deps.debug) this.trace.push(obj); },
        debug: !!this.deps.debug,
        searchHistory: state.searchHistory,
        questionType: state.questionType, // NEW: Pass question type to planner
        searchCount: searchCount, // NEW: Pass search count to planner
      });
      
      console.log(`🔄 [ReActLoop] Planner decided: ${action.type}${action.query ? ` - "${action.query}"` : ''}${action.url ? ` - ${action.url}` : ''}`);
      this.debugLog(`[ReActLoop] Decided action: ${action.type}${action.query ? ` - Query: "${action.query.substring(0, 30)}..."` : ''}${action.url ? ` - URL: ${action.url}` : ''}`);
      if (this.deps.debug) this.trace.push({ loop: iterations, action });
      
      // Update state tracking
      state.previousPassageCount = currentPassageCount;
      state.previousDomainCount = currentDomainCount;

      if (action.type === "STOP") {
        console.log(`🔄 [ReActLoop] STOP action received - ending search loop`);
        break;
      }
      
      // Safety check: prevent infinite loops by limiting repeated actions
      const actionTypeCounts = this.trace
        .filter(t => t.action?.type)
        .reduce((acc, t) => {
          const type = t.action.type;
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
      if (actionTypeCounts[action.type] > 8) {
        console.log(`⚠️ [ReActLoop] Forced STOP after ${actionTypeCounts[action.type]} iterations of ${action.type}`);
        if (this.deps.debug) this.trace.push({ 
          warning: `Forced STOP after ${actionTypeCounts[action.type]} iterations of ${action.type}` 
        });
        break;
      }

      // ACTING: Execute the planned action
      console.log(`🔄 [ReActLoop] Executing action: ${action.type}`);
      await this.executeAction(state, action);
      
      // Track search count for MINIMAL_SEARCH optimization
      if (action.type === "SEARCH") {
        searchCount++;
        console.log(`🔄 [ReActLoop] Search count incremented to: ${searchCount}`);
      }
      
      console.log(`🔄 [ReActLoop] Action completed. New state - Passages: ${state.passages.length}, Domains: ${distinct(state.passages.map(p => p.source_domain || eTLDplus1(p.url) || "unknown")).length}`);

      // Update facet coverage after each action
      state.facets = this.deps.facetManager.updateFacetCoverage(state.facets, state.passages);
      const coveredCount = state.facets.filter(f => f.covered).length;
      console.log(`🔄 [ReActLoop] Facet coverage updated: ${coveredCount}/${state.facets.length} facets covered`);
      this.debugLog(`[ReActLoop] Facet coverage updated: ${coveredCount}/${state.facets.length} facets covered`);
      
      // Check for progress and handle stagnation
      const prog = this.deps.progressTracker.update(coveredCount);
      if (!prog.progressed) {
        this.debugLog(`[ReActLoop] No progress detected. Iterations without improvement: ${prog.iterationsWithoutProgress}/3`);
      } else {
        this.debugLog(`[ReActLoop] Progress detected!`);
      }
      if (prog.stop) {
        this.debugLog(`[ReActLoop] Forcing STOP after 3 iterations without progress`);
        if (this.deps.debug) this.trace.push({ warning: `Forced STOP due to no progress for 3 iterations` });
        break;
      }

      // For time-sensitive queries, ensure we have recent information
      await EarlyTermination.maybeFreshnessBoost(state, async (q, k, timeRange) => {
        const exec = this.createActionExecutor();
        await exec.execute(state, { type: 'SEARCH', query: q, k, timeRange } as any);
      });

      // Check early termination conditions
      const facetCoverageRatio = state.facets.filter(f => f.required && f.covered).length / Math.max(state.facets.filter(f => f.required).length, 1);
      const requiredCovered = this.deps.facetManager.allRequiredFacetsCovered(state.facets);
      if (EarlyTermination.shouldStopLoop(state, requiredCovered, facetCoverageRatio)) {
        this.debugLog(`[ReActLoop] Early termination conditions met, stopping`);
        break;
      }

      // If time is running out, do final rerank and exit
      if (Date.now() - start > state.budget.timeMs * 0.85 || this.isBudgetDepleted(state.budget)) {
        const reranked = await this.deps.rerankService.rerank(state.question, state.passages as any, 10);
        state.passages.splice(0, state.passages.length, ...(reranked.reranked_passages || state.passages).slice(0, 10) as any);
        if (this.deps.debug) this.trace.push({ event: "final_consolidate" });
        break;
      }
    }
  }

  /**
   * Execute a specific action
   * 
   * @param state - Current agent state
   * @param action - Action to execute (SEARCH, FETCH, RERANK)
   */
  private async executeAction(state: AgentState, action: any): Promise<void> {
    const exec = this.createActionExecutor();

    if (action.type === "SEARCH" && state.budget.searches > 0) {
      await exec.execute(state, action as any);
      if (this.deps.debug) this.trace.push({ event: "search" });
    }

    if (action.type === "FETCH" && state.budget.fetches > 0) {
      await exec.execute(state, action as any);
    }

    if (action.type === "RERANK") {
      await exec.execute(state, action as any);
      if (this.deps.debug) this.trace.push({ event: "rerank" });
    }
  }

  /**
   * Create ActionExecutor instance
   * 
   * @returns Configured ActionExecutor with all dependencies
   */
  private createActionExecutor(): ActionExecutor {
    return new ActionExecutor({
      search: async (q, k, tr) => {
        const response = await this.deps.searchProviderManager.search(q, k, tr);
        return response.results;
      },
      filterAndScore: (r) => this.simpleFilterAndScore(r),
      retainDiverse: (f, e) => this.simpleRetainDiverse(f, e),
      fetchUrl: (u) => this.deps.fetchService.fetch(u) as any,
      rerank: (q, p, n) => this.deps.rerankService.rerank(q, p as any, n),
      debugLog: this.debugLog.bind(this),
    });
  }

  /**
   * Simple filtering and scoring - replaces complex SearchOrchestrator logic
   */
  private simpleFilterAndScore(results: any[]): any[] {
    console.log(`[ReActLoop] Simple filtering ${results.length} results`);
    
    // Basic filtering - remove obvious spam/low-quality results
    const blocked = [
      /\/tag\//, /\/category\//, /\/author\//, /\/page\/\d+/, /\/feed\//,
      /\.docx?$/i, /\.pdf$/i, /facebook\.com/, /twitter\.com/, /x\.com/, /instagram\.com/, /youtube\.com\/watch/
    ];
    
    const filtered = results.filter(r => !blocked.some(re => re.test((r.url || "").toLowerCase())));
    
    console.log(`[ReActLoop] After filtering: ${filtered.length} results`);
    return filtered.slice(0, 25); // Limit to 25 results
  }

  /**
   * Simple diversity management - replaces complex SearchOrchestrator logic
   */
  private simpleRetainDiverse(filteredResults: any[], existingPassages: any[]): any[] {
    console.log(`[ReActLoop] Simple diversity management for ${filteredResults.length} results`);
    
    const diverseResults: any[] = [];
    const domainCounts: Record<string, number> = {};

    for (const result of filteredResults) {
      const domain = eTLDplus1(result.url) || 'unknown';
      const currentCount = domainCounts[domain] || 0;
      
      if (currentCount < 3) { // Max 3 results per domain
        diverseResults.push(result);
        domainCounts[domain] = currentCount + 1;
      }
      
      if (diverseResults.length >= 20) break; // Limit to 20 diverse results
    }

    console.log(`[ReActLoop] Selected ${diverseResults.length} results from ${Object.keys(domainCounts).length} domains`);
    return diverseResults;
  }

  /**
   * Check if budget has been exhausted
   * 
   * @param b - Budget to check
   * @returns True if budget is depleted (no searches or fetches remaining)
   */
  private isBudgetDepleted(b: Budget): boolean {
    return b.searches <= 0 && b.fetches <= 0;
  }



  /**
   * Get trace for debugging
   * 
   * @returns Debug trace array
   */
  getTrace(): any[] {
    return this.trace;
  }
}
