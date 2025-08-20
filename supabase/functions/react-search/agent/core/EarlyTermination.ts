import { isTimeSensitive, newestDate } from "../utils/time-utils.ts";
import { eTLDplus1 } from "../utils/url-utils.ts";
import type { AgentState } from "./AgentState.ts";
import { BudgetManager } from "../components/BudgetManager.ts";
import { LOOP_CONSTANTS, SEARCH_CONSTANTS } from "./constants.ts";

export class EarlyTermination {
  static hasDomainDiversity(state: AgentState, minDomains: number): boolean {
    const doms = Array.from(new Set(state.passages.map(p => p.source_domain || eTLDplus1(p.url) || "unknown")));
    return doms.length >= minDomains;
  }

  static shouldStopLoop(state: AgentState, requiredFacetsCovered: boolean, facetCoverageRatio: number): boolean {
    // Use BudgetManager to check budget depletion instead of duplicating logic
    const budgetManager = new BudgetManager();
    if (budgetManager.isBudgetDepleted(state.budget)) return true;
    
    // Check time thresholds
    const timeExceeded = Date.now() - state.startMs > state.budget.timeMs * LOOP_CONSTANTS.TIME_THRESHOLD_TERMINATE;
    if (timeExceeded) return true;
    
    // Check completion conditions
    if (requiredFacetsCovered && this.hasDomainDiversity(state, LOOP_CONSTANTS.MIN_DOMAIN_DIVERSITY)) return true;
    if (state.passages.length >= LOOP_CONSTANTS.MIN_PASSAGES_FOR_EMPTY_FACETS && state.facets.filter(f => f.covered).length === 0) return true;
    if (Date.now() - state.startMs > state.budget.timeMs * LOOP_CONSTANTS.TIME_THRESHOLD_EARLY && facetCoverageRatio >= LOOP_CONSTANTS.FACET_COVERAGE_THRESHOLD) return true;
    return false;
  }

  static async maybeFreshnessBoost(state: AgentState, runSearch: (q: string, k: number, timeRange?: 'd'|'w'|'m'|'y') => Promise<void>): Promise<void> {
    if (!isTimeSensitive(state.question)) return;
    const newest = newestDate(state.passages);
    const staleCutoff = new Date(Date.now() - SEARCH_CONSTANTS.FRESHNESS_BOOST_DAYS * 24 * 3600 * 1000);
    if (!newest || newest < staleCutoff) {
      if (state.budget.searches > 0) {
        const q = `${state.question} ${new Date().getFullYear()} latest`;
        await runSearch(q, SEARCH_CONSTANTS.FRESHNESS_BOOST_SEARCH_RESULTS, 'w');
        state.budget.searches--;
      }
    }
  }
}


