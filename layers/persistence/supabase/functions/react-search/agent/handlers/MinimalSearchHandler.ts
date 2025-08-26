import type { HandleResult, HandlerDeps, QuestionHandler } from "../core/QuestionRouter.ts";
import type { AgentState } from "../types/AgentTypes.ts";

export class MinimalSearchHandler implements QuestionHandler {
  async handle(state: AgentState, deps: HandlerDeps): Promise<HandleResult> {
    console.log(`🔍 [MinimalSearchHandler] Processing minimal search question`);
    state.budget.searches = Math.min(state.budget.searches, 2);
    state.budget.fetches = Math.min(state.budget.fetches, 1);
    console.log(`💰 [MinimalSearchHandler] Limited budget: ${state.budget.searches} searches, ${state.budget.fetches} fetches`);

    console.log(`🔄 [MinimalSearchHandler] Starting limited ReAct loop`);
    await deps.reactLoop.execute(state, deps.stateInitializer.getCurrentDateTime());
    console.log(`✅ [MinimalSearchHandler] Limited ReAct loop completed. Final state - Passages: ${state.passages.length}, Facets covered: ${state.facets.filter(f => f.covered).length}/${state.facets.length}`);

    return { completed: false };
  }
}


