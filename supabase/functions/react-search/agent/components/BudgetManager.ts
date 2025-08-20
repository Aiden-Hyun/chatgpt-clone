import type { Budget } from "../types/AgentTypes.ts";
import { BUDGET_CONSTANTS } from "../core/constants.ts";

export class BudgetManager {
  initBudget(overrides?: Partial<Pick<Budget, 'timeMs' | 'searches' | 'fetches' | 'tokens'>>): Budget {
    const timeMs   = overrides?.timeMs   ?? BUDGET_CONSTANTS.DEFAULT_TIME_MS;
    const searches = overrides?.searches ?? BUDGET_CONSTANTS.DEFAULT_SEARCHES;
    const fetches  = overrides?.fetches  ?? BUDGET_CONSTANTS.DEFAULT_FETCHES;
    const tokens   = overrides?.tokens   ?? BUDGET_CONSTANTS.DEFAULT_TOKENS;
    return { timeMs, searches, fetches, tokens, startedMs: Date.now() };
  }

  isBudgetDepleted(b: Budget): boolean {
    if (Date.now() - b.startedMs >= b.timeMs) return true;
    if (b.searches <= 0 && b.fetches <= 0) return true;
    return false;
  }
}


