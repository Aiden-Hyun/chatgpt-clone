import type { QuestionHandler, HandleResult, HandlerDeps } from "../core/QuestionRouter.ts";
import type { AgentState } from "../types/AgentTypes.ts";

export class FullResearchHandler implements QuestionHandler {
  async handle(state: AgentState, deps: HandlerDeps): Promise<HandleResult> {
    console.log(`🔬 [FullResearchHandler] Processing full research question`);
    console.log(`🚀 [FullResearchHandler] Starting comprehensive ReAct loop`);
    await deps.reactLoop.execute(state, deps.stateInitializer.getCurrentDateTime());
    console.log(`✅ [FullResearchHandler] ReAct loop completed. Final state - Passages: ${state.passages.length}, Facets covered: ${state.facets.filter(f => f.covered).length}/${state.facets.length}`);
    return { completed: false };
  }
}


