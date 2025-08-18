import type { Budget } from "../types/AgentTypes.ts";

export class BudgetManager {
  initBudget(overrides?: Partial<Pick<Budget, 'timeMs' | 'searches' | 'fetches' | 'tokens'>>): Budget {
    const timeMs   = overrides?.timeMs   ?? 25000;
    const searches = overrides?.searches ?? 4;
    const fetches  = overrides?.fetches  ?? 12;
    const tokens   = overrides?.tokens   ?? 24000;
    return { timeMs, searches, fetches, tokens, startedMs: Date.now() };
  }

  isBudgetDepleted(b: Budget): boolean {
    if (Date.now() - b.startedMs >= b.timeMs) return true;
    if (b.searches <= 0 && b.fetches <= 0) return true;
    return false;
  }
}


