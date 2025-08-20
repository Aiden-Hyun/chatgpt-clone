import type { Budget } from "../types/AgentTypes.ts";

export class BudgetManager {
  initBudget(overrides?: Partial<Pick<Budget, 'timeMs' | 'searches' | 'fetches' | 'tokens'>>): Budget {
    const timeMs   = overrides?.timeMs   ?? 25000;
    const searches = overrides?.searches ?? 4;
    const fetches  = overrides?.fetches  ?? 12;
    const tokens   = overrides?.tokens   ?? 24000;
    const budget = { timeMs, searches, fetches, tokens, startedMs: Date.now() };
    console.log(`💰 [BudgetManager] Initialized budget: ${searches} searches, ${fetches} fetches, ${Math.round(timeMs/1000)}s time limit`);
    return budget;
  }

  isBudgetDepleted(b: Budget): boolean {
    const timeDepleted = Date.now() - b.startedMs >= b.timeMs;
    const resourcesDepleted = b.searches <= 0 && b.fetches <= 0;
    
    if (timeDepleted) {
      console.log(`⏰ [BudgetManager] Budget depleted: time limit exceeded`);
    } else if (resourcesDepleted) {
      console.log(`💸 [BudgetManager] Budget depleted: no searches/fetches remaining`);
    }
    
    return timeDepleted || resourcesDepleted;
  }
}


