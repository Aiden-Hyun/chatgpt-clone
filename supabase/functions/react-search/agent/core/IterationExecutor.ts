import type { AgentState } from "../types/AgentTypes.ts";
import type { Planner } from "../components/Planner.ts";
import type { FacetManager } from "../components/FacetManager.ts";
import type { ProgressTracker } from "../components/ProgressTracker.ts";
import { ActionExecutor } from "./ActionExecutor.ts";
import { StateLogger } from "./StateLogger.ts";
import { EarlyTermination } from "./EarlyTermination.ts";
import { SearchResultProcessor } from "./SearchResultProcessor.ts";

export interface IterationExecutorDeps {
  planner: Planner;
  facetManager: FacetManager;
  progressTracker: ProgressTracker;
  searchProviderManager: any;
  fetchService: any;
  rerankService: any;
  debug: boolean;
}

export class IterationExecutor {
  private deps: IterationExecutorDeps;
  private logger: StateLogger;
  private actionExecutor: ActionExecutor;

  constructor(deps: IterationExecutorDeps) {
    this.deps = deps;
    this.logger = new StateLogger(deps.debug);
    this.actionExecutor = new ActionExecutor({
      search: async (q, k, tr) => {
        const response = await deps.searchProviderManager.search(q, k, tr);
        return response.results;
      },
      filterAndScore: SearchResultProcessor.filterAndScore,
      retainDiverse: SearchResultProcessor.retainDiverse,
      fetchUrl: (u) => deps.fetchService.fetch(u) as any,
      rerank: (q, p, n) => deps.rerankService.rerank(q, p as any, n),
      debugLog: (...args) => { if (deps.debug) console.log(...args); },
    });
  }

  async executeIteration(state: AgentState, currentDateTime: string, iteration: number, searchCount: number): Promise<void> {
    // Log iteration start
    this.logger.logIterationStart(state, iteration);

    // Decide next action
    const action = await this.decideNextAction(state, currentDateTime, searchCount);
    this.logger.logActionDecision(action);

    // Execute action
    await this.executeAction(state, action);
    this.logger.logActionExecution(state);

    // Update state and check progress
    await this.updateStateAndProgress(state, action);
  }

  private async decideNextAction(state: AgentState, currentDateTime: string, searchCount: number): Promise<any> {
    return await this.deps.planner.decideActionJSON({
      question: state.question,
      language: state.language,
      passages: state.passages,
      facets: state.facets,
      budget: state.budget,
      currentDateTime,
      isTimeSensitive: () => false,
      iterationsWithoutProgress: 0,
      debug: this.deps.debug,
      searchHistory: state.searchHistory,
      questionType: state.questionType,
      searchCount,
    });
  }

  private async executeAction(state: AgentState, action: any): Promise<void> {
    if (action.type === "SEARCH" && state.budget.searches > 0) {
      await this.actionExecutor.execute(state, action as any);
    }
    if (action.type === "FETCH" && state.budget.fetches > 0) {
      await this.actionExecutor.execute(state, action as any);
    }
    if (action.type === "RERANK") {
      await this.actionExecutor.execute(state, action as any);
    }
  }

  private async updateStateAndProgress(state: AgentState, action: any): Promise<void> {
    // Update facet coverage
    state.facets = this.deps.facetManager.updateFacetCoverage(state.facets, state.passages);
    const coveredCount = state.facets.filter(f => f.covered).length;

    // Check progress
    const prog = this.deps.progressTracker.update(coveredCount);
    this.logger.logProgressUpdate(coveredCount, state.facets.length, prog.iterationsWithoutProgress, prog.progressed);

    // Handle time-sensitive queries
    await EarlyTermination.maybeFreshnessBoost(state, async (q, k, timeRange) => {
      await this.actionExecutor.execute(state, { type: 'SEARCH', query: q, k, timeRange } as any);
    });
  }
}
