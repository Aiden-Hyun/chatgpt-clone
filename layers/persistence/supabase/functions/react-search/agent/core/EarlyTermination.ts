import { isTimeSensitive, newestDate } from "../utils/time-utils.ts";
import { eTLDplus1 } from "../utils/url-utils.ts";
import type { AgentState } from "./AgentState.ts";

export class EarlyTermination {
  static hasDomainDiversity(state: AgentState, minDomains: number): boolean {
    const doms = Array.from(new Set(state.passages.map(p => p.source_domain || eTLDplus1(p.url) || "unknown")));
    return doms.length >= minDomains;
  }

  static shouldStopLoop(state: AgentState, requiredFacetsCovered: boolean, facetCoverageRatio: number): boolean {
    const timeExceeded = Date.now() - state.startMs > state.budget.timeMs * 0.85;
    if (timeExceeded) return true;
    if (requiredFacetsCovered && this.hasDomainDiversity(state, 2)) return true;
    if (state.passages.length >= 15 && state.facets.filter(f => f.covered).length === 0) return true;
    if (Date.now() - state.startMs > state.budget.timeMs * 0.8 && facetCoverageRatio >= 0.6) return true;
    return false;
  }

  static async maybeFreshnessBoost(state: AgentState, runSearch: (q: string, k: number, timeRange?: 'd'|'w'|'m'|'y') => Promise<void>): Promise<void> {
    if (!isTimeSensitive(state.question)) return;
    const newest = newestDate(state.passages);
    const staleCutoff = new Date(Date.now() - 30 * 24 * 3600 * 1000);
    if (!newest || newest < staleCutoff) {
      if (state.budget.searches > 0) {
        const q = `${state.question} ${new Date().getFullYear()} latest`;
        await runSearch(q, 8, 'w');
        state.budget.searches--;
      }
    }
  }
}


