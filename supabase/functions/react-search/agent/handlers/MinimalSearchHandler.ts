import type { QuestionHandler, HandleResult, HandlerDeps } from "../core/QuestionRouter.ts";
import type { AgentState } from "../types/AgentTypes.ts";

export class MinimalSearchHandler implements QuestionHandler {
  async handle(state: AgentState, deps: HandlerDeps): Promise<HandleResult> {
    console.log(`🚀 [Agent] Minimal search question detected - limiting search resources`);
    state.budget.searches = Math.min(state.budget.searches, 2);
    state.budget.fetches = Math.min(state.budget.fetches, 1);
    console.log(`🚀 [Agent] Limited budget: ${state.budget.searches} searches, ${state.budget.fetches} fetches`);

    console.log(`🚀 [Agent] Starting limited ReAct loop...`);
    await deps.reactLoop.execute(state, deps.stateInitializer.getCurrentDateTime());
    console.log(`🚀 [Agent] Limited ReAct loop completed. Final state - Passages: ${state.passages.length}, Facets covered: ${state.facets.filter(f => f.covered).length}/${state.facets.length}`);

    return { completed: false };
  }
}


