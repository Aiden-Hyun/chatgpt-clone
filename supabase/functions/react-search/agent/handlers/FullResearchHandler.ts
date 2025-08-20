import type { QuestionHandler, HandleResult, HandlerDeps } from "../core/QuestionRouter.ts";
import type { AgentState } from "../types/AgentTypes.ts";

export class FullResearchHandler implements QuestionHandler {
  async handle(state: AgentState, deps: HandlerDeps): Promise<HandleResult> {
    console.log(`🚀 [Agent] ${state.questionType === 'FULL_RESEARCH' ? 'Full research question detected - using full search pipeline' : `Unknown question type: ${state.questionType}, defaulting to full research`}`);
    console.log(`🚀 [Agent] Starting ReAct loop...`);
    await deps.reactLoop.execute(state, deps.stateInitializer.getCurrentDateTime());
    console.log(`🚀 [Agent] ReAct loop completed. Final state - Passages: ${state.passages.length}, Facets covered: ${state.facets.filter(f => f.covered).length}/${state.facets.length}`);
    return { completed: false };
  }
}


