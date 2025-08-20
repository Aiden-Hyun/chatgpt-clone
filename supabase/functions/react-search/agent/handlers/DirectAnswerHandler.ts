import type { QuestionHandler, HandleResult, HandlerDeps } from "../core/QuestionRouter.ts";
import type { AgentState, ReActResult } from "../types/AgentTypes.ts";

export class DirectAnswerHandler implements QuestionHandler {
  async handle(state: AgentState, deps: HandlerDeps, opts?: { cacheKey?: string }): Promise<HandleResult> {
    console.log(`🚀 [Agent] Direct answer question detected - using pre-generated answer`);
    console.log(`🚀 [Agent] Pre-generated answer: ${state.directAnswer ? state.directAnswer.substring(0, 100) + '...' : 'None'}`);

    const directResult: ReActResult = {
      final_answer_md: state.directAnswer || "Unable to provide direct answer.",
      citations: [],
      trace: [{ event: "direct_answer", questionType: 'DIRECT_ANSWER' }],
      time_warning: undefined
    };

    if (opts?.cacheKey) {
      console.log(`🚀 [Agent] Caching direct answer result...`);
      await deps.cacheManager.setCache(opts.cacheKey, directResult);
    }

    return { completed: true, directResult };
  }
}


