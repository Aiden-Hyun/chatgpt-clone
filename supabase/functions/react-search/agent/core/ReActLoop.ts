import { BudgetManager } from "../components/BudgetManager.ts";
import type { FacetManager } from "../components/FacetManager.ts";
import type { Planner } from "../components/Planner.ts";
import type { ProgressTracker } from "../components/ProgressTracker.ts";
import type { SearchProviderManager } from "../services/SearchProviderManager.ts";
import type { AgentState } from "../types/AgentTypes.ts";
import { LoopController } from "./LoopController.ts";

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
  private budgetManager: BudgetManager;
  private loopController: LoopController;

  constructor(deps: ReActLoopDependencies) {
    this.deps = deps;
    this.budgetManager = new BudgetManager();
    this.loopController = new LoopController(deps);
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
    const budget = state.budget;
    
    console.log(`🔄 [ReActLoop] Starting execution for question: "${state.question}"`);
    console.log(`🔄 [ReActLoop] Initial state - Passages: ${state.passages.length}, Facets: ${state.facets.length}, Budget: ${budget.searches} searches, ${budget.fetches} fetches`);
    
    // Log MINIMAL_SEARCH optimization
    if (state.questionType === 'MINIMAL_SEARCH') {
      console.log(`🔄 [ReActLoop] MINIMAL_SEARCH detected - will enforce 1 SEARCH then STOP rule`);
    }
    
    // Delegate to LoopController for the main loop logic
    await this.loopController.executeLoop(state, currentDateTime);
  }

  /**
   * Get trace for debugging
   * 
   * @returns Debug trace array
   */
  getTrace(): any[] {
    return this.loopController.getTrace();
  }
}
