import type { QuestionType, ReActResult } from "../types/AgentTypes.ts";
import type { ReActLoop } from "./ReActLoop.ts";
import type { StateInitializer } from "./StateInitializer.ts";
import type { FacetManager } from "../components/FacetManager.ts";
import type { CacheManager } from "./CacheManager.ts";
import type { AgentState } from "../types/AgentTypes.ts";

export interface HandlerDeps {
  reactLoop: ReActLoop;
  stateInitializer: StateInitializer;
  facetManager: FacetManager;
  cacheManager: CacheManager;
}

export interface HandleResult {
  completed: boolean;
  directResult?: ReActResult;
}

export interface QuestionHandler {
  handle(state: AgentState, deps: HandlerDeps, opts?: { cacheKey?: string }): Promise<HandleResult>;
}

export class QuestionRouter {
  private handlers: Partial<Record<QuestionType, QuestionHandler>>;

  constructor(handlers: Partial<Record<QuestionType, QuestionHandler>>) {
    this.handlers = handlers;
  }

  async route(type: QuestionType | undefined, state: AgentState, deps: HandlerDeps, opts?: { cacheKey?: string }): Promise<HandleResult> {
    const effectiveType: QuestionType = type || 'FULL_RESEARCH';
    const handler = this.handlers[effectiveType];
    if (!handler) {
      // Default to full research if unhandled
      const defaultHandler = this.handlers['FULL_RESEARCH'];
      if (!defaultHandler) return { completed: false };
      return defaultHandler.handle(state, deps, opts);
    }
    return handler.handle(state, deps, opts);
  }
}


