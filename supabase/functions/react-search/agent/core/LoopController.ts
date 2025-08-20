import type { BudgetManager } from "../components/BudgetManager.ts";
import type { AgentState } from "../types/AgentTypes.ts";
import { EarlyTermination } from "./EarlyTermination.ts";
import { IterationExecutor, IterationExecutorDeps } from "./IterationExecutor.ts";
import { LOOP_CONSTANTS } from "./constants.ts";

export interface LoopControllerDeps extends IterationExecutorDeps {
  budgetManager: BudgetManager;
}

export class LoopController {
  private deps: LoopControllerDeps;
  private iterationExecutor: IterationExecutor;
  private trace: any[] = [];

  constructor(deps: LoopControllerDeps) {
    this.deps = deps;
    this.iterationExecutor = new IterationExecutor(deps);
  }

  async executeLoop(state: AgentState, currentDateTime: string): Promise<void> {
    // Initialize loop state
    let iterations = 0;
    let searchCount = 0;
    this.deps.progressTracker.reset();

    // Main loop
    while (this.shouldContinueLoop(state, iterations)) {
      iterations++;
      await this.iterationExecutor.executeIteration(state, currentDateTime, iterations, searchCount);

      // Handle termination conditions
      if (await this.shouldTerminate(state)) {
        break;
      }

      // Track search count
      if (state.budget.searches < this.deps.budgetManager.initBudget().searches) {
        searchCount++;
      }
    }

    // Final consolidation if needed
    if (this.shouldConsolidate(state)) {
      await this.consolidateResults(state);
    }
  }

  private shouldContinueLoop(state: AgentState, iterations: number): boolean {
    return !this.deps.budgetManager.isBudgetDepleted(state.budget) && 
           Date.now() - state.startMs < state.budget.timeMs && 
           iterations < LOOP_CONSTANTS.MAX_ITERATIONS;
  }

  private async shouldTerminate(state: AgentState): Promise<boolean> {
    // Check facet coverage
    const facetCoverageRatio = state.facets.filter(f => f.required && f.covered).length / 
                              Math.max(state.facets.filter(f => f.required).length, 1);
    const requiredCovered = this.deps.facetManager.allRequiredFacetsCovered(state.facets);

    return EarlyTermination.shouldStopLoop(state, requiredCovered, facetCoverageRatio);
  }

  private shouldConsolidate(state: AgentState): boolean {
    return Date.now() - state.startMs > state.budget.timeMs * LOOP_CONSTANTS.TIME_THRESHOLD_TERMINATE || 
           this.deps.budgetManager.isBudgetDepleted(state.budget);
  }

  private async consolidateResults(state: AgentState): Promise<void> {
    const reranked = await this.deps.rerankService.rerank(state.question, state.passages as any, LOOP_CONSTANTS.RERANK_RESULTS_LIMIT);
    state.passages.splice(0, state.passages.length, ...(reranked.reranked_passages || state.passages).slice(0, LOOP_CONSTANTS.RERANK_RESULTS_LIMIT) as any);
  }

  getTrace(): any[] {
    return this.trace;
  }
}