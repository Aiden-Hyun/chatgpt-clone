import type { AgentState } from "../types/AgentTypes.ts";
import type { FacetManager } from "../components/FacetManager.ts";
import type { ProgressTracker } from "../components/ProgressTracker.ts";
import type { Planner } from "../components/Planner.ts";
import { distinct } from "../utils/text-utils.ts";
import { eTLDplus1 } from "../utils/url-utils.ts";
import { EarlyTermination } from "./EarlyTermination.ts";
import { ActionExecutor } from "./ActionExecutor.ts";

export interface LoopControllerDeps {
  planner: Planner;
  facetManager: FacetManager;
  progressTracker: ProgressTracker;
  searchProviderManager: any;
  fetchService: any;
  rerankService: any;
  debug: boolean;
}

export interface LoopState {
  iterations: number;
  searchCount: number;
  start: number;
  budget: any;
}

export class LoopController {
  private deps: LoopControllerDeps;
  private trace: any[] = [];

  constructor(deps: LoopControllerDeps) {
    this.deps = deps;
  }

  private debugLog(...args: any[]): void {
    if (this.deps.debug) console.log(...args);
  }

  async executeLoop(state: AgentState, currentDateTime: string): Promise<void> {
    const loopState: LoopState = {
      iterations: 0,
      searchCount: 0,
      start: state.startMs,
      budget: state.budget,
    };

    const MAX_ITERATIONS = 10;
    this.deps.progressTracker.reset();

    while (!this.isBudgetDepleted(loopState.budget) && 
           Date.now() - loopState.start < loopState.budget.timeMs && 
           loopState.iterations < MAX_ITERATIONS) {
      
      loopState.iterations++;
      console.log(`🔄 [LoopController] === ITERATION ${loopState.iterations} ===`);
      this.debugLog(`[LoopController] Loop iteration ${loopState.iterations}: Deciding next action`);
      
      // Track progress for debugging
      const currentPassageCount = state.passages.length;
      const currentDomainCount = distinct(state.passages.map(p => p.source_domain || eTLDplus1(p.url) || "unknown")).length;
      const currentFacetCoverage = state.facets.filter(f => f.covered).length;
      
      console.log(`🔄 [LoopController] Current state - Passages: ${currentPassageCount}, Domains: ${currentDomainCount}, Facets covered: ${currentFacetCoverage}/${state.facets.length}`);
      this.debugLog(`[LoopController:Debug] State - Passages: ${currentPassageCount} (${currentPassageCount - state.previousPassageCount > 0 ? '+' : ''}${currentPassageCount - state.previousPassageCount}), Domains: ${currentDomainCount} (${currentDomainCount - state.previousDomainCount > 0 ? '+' : ''}${currentDomainCount - state.previousDomainCount}), Facets: ${currentFacetCoverage}/${state.facets.length}`);
      this.debugLog(`[LoopController:Debug] Budget - Time: ${Math.round((Date.now() - loopState.budget.startedMs) / 1000)}s/${Math.round(loopState.budget.timeMs / 1000)}s, Searches: ${loopState.budget.searches}, Fetches: ${loopState.budget.fetches}`);
      this.debugLog(`[LoopController:Debug] Search History: ${state.searchHistory.slice(-3).join(' | ')}`);
      
      // REASONING: Decide what action to take next
      console.log(`🔄 [LoopController] Asking planner to decide next action...`);
      const action = await this.deps.planner.decideActionJSON({
        question: state.question,
        language: state.language,
        passages: state.passages,
        facets: state.facets,
        budget: state.budget,
        currentDateTime,
        isTimeSensitive: () => false, // TODO: Pass this properly
        iterationsWithoutProgress: 0,
        tracePush: (obj: any) => { if (this.deps.debug) this.trace.push(obj); },
        debug: !!this.deps.debug,
        searchHistory: state.searchHistory,
        questionType: state.questionType,
        searchCount: loopState.searchCount,
      });
      
      console.log(`🔄 [LoopController] Planner decided: ${action.type}${action.query ? ` - "${action.query}"` : ''}${action.url ? ` - ${action.url}` : ''}`);
      this.debugLog(`[LoopController] Decided action: ${action.type}${action.query ? ` - Query: "${action.query.substring(0, 30)}..."` : ''}${action.url ? ` - URL: ${action.url}` : ''}`);
      if (this.deps.debug) this.trace.push({ loop: loopState.iterations, action });
      
      // Update state tracking
      state.previousPassageCount = currentPassageCount;
      state.previousDomainCount = currentDomainCount;

      if (action.type === "STOP") {
        console.log(`🔄 [LoopController] STOP action received - ending search loop`);
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
        console.log(`⚠️ [LoopController] Forced STOP after ${actionTypeCounts[action.type]} iterations of ${action.type}`);
        if (this.deps.debug) this.trace.push({ 
          warning: `Forced STOP after ${actionTypeCounts[action.type]} iterations of ${action.type}` 
        });
        break;
      }

      // ACTING: Execute the planned action
      console.log(`🔄 [LoopController] Executing action: ${action.type}`);
      await this.executeAction(state, action);
      
      // Track search count for MINIMAL_SEARCH optimization
      if (action.type === "SEARCH") {
        loopState.searchCount++;
        console.log(`🔄 [LoopController] Search count incremented to: ${loopState.searchCount}`);
      }
      
      console.log(`🔄 [LoopController] Action completed. New state - Passages: ${state.passages.length}, Domains: ${distinct(state.passages.map(p => p.source_domain || eTLDplus1(p.url) || "unknown")).length}`);

      // Update facet coverage after each action
      state.facets = this.deps.facetManager.updateFacetCoverage(state.facets, state.passages);
      const coveredCount = state.facets.filter(f => f.covered).length;
      console.log(`🔄 [LoopController] Facet coverage updated: ${coveredCount}/${state.facets.length} facets covered`);
      this.debugLog(`[LoopController] Facet coverage updated: ${coveredCount}/${state.facets.length} facets covered`);
      
      // Check for progress and handle stagnation
      const prog = this.deps.progressTracker.update(coveredCount);
      if (!prog.progressed) {
        this.debugLog(`[LoopController] No progress detected. Iterations without improvement: ${prog.iterationsWithoutProgress}/3`);
      } else {
        this.debugLog(`[LoopController] Progress detected!`);
      }
      if (prog.stop) {
        this.debugLog(`[LoopController] Forcing STOP after 3 iterations without progress`);
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
        this.debugLog(`[LoopController] Early termination conditions met, stopping`);
        break;
      }

      // If time is running out, do final rerank and exit
      if (Date.now() - loopState.start > state.budget.timeMs * 0.85 || this.isBudgetDepleted(state.budget)) {
        const reranked = await this.deps.rerankService.rerank(state.question, state.passages as any, 10);
        state.passages.splice(0, state.passages.length, ...(reranked.reranked_passages || state.passages).slice(0, 10) as any);
        if (this.deps.debug) this.trace.push({ event: "final_consolidate" });
        break;
      }
    }
  }

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

  private simpleFilterAndScore(results: any[]): any[] {
    console.log(`[LoopController] Simple filtering ${results.length} results`);
    
    // Basic filtering - remove obvious spam/low-quality results
    const blocked = [
      /\/tag\//, /\/category\//, /\/author\//, /\/page\/\d+/, /\/feed\//,
      /\.docx?$/i, /\.pdf$/i, /facebook\.com/, /twitter\.com/, /x\.com/, /instagram\.com/, /youtube\.com\/watch/
    ];
    
    const filtered = results.filter(r => !blocked.some(re => re.test((r.url || "").toLowerCase())));
    
    console.log(`[LoopController] After filtering: ${filtered.length} results`);
    return filtered.slice(0, 25); // Limit to 25 results
  }

  private simpleRetainDiverse(filteredResults: any[], existingPassages: any[]): any[] {
    console.log(`[LoopController] Simple diversity management for ${filteredResults.length} results`);
    
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

    console.log(`[LoopController] Selected ${diverseResults.length} results from ${Object.keys(domainCounts).length} domains`);
    return diverseResults;
  }

  private isBudgetDepleted(b: any): boolean {
    return b.searches <= 0 && b.fetches <= 0;
  }

  getTrace(): any[] {
    return this.trace;
  }
}
