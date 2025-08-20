import type { AgentState } from "../types/AgentTypes.ts";
import { distinct } from "../utils/text-utils.ts";
import { eTLDplus1 } from "../utils/url-utils.ts";

export class StateLogger {
  private debug: boolean;

  constructor(debug: boolean) {
    this.debug = debug;
  }

  private debugLog(...args: any[]): void {
    if (this.debug) console.log(...args);
  }

  logIterationStart(state: AgentState, iteration: number): void {
    console.log(`🔄 [StateLogger] === ITERATION ${iteration} ===`);
    this.debugLog(`[StateLogger] Loop iteration ${iteration}: Deciding next action`);
    
    const currentPassageCount = state.passages.length;
    const currentDomainCount = distinct(state.passages.map(p => p.source_domain || eTLDplus1(p.url) || "unknown")).length;
    const currentFacetCoverage = state.facets.filter(f => f.covered).length;
    
    console.log(`🔄 [StateLogger] Current state - Passages: ${currentPassageCount}, Domains: ${currentDomainCount}, Facets covered: ${currentFacetCoverage}/${state.facets.length}`);
    this.debugLog(`[StateLogger:Debug] State - Passages: ${currentPassageCount} (${currentPassageCount - state.previousPassageCount > 0 ? '+' : ''}${currentPassageCount - state.previousPassageCount}), Domains: ${currentDomainCount} (${currentDomainCount - state.previousDomainCount > 0 ? '+' : ''}${currentDomainCount - state.previousDomainCount}), Facets: ${currentFacetCoverage}/${state.facets.length}`);
    this.debugLog(`[StateLogger:Debug] Search History: ${state.searchHistory.slice(-3).join(' | ')}`);
  }

  logActionDecision(action: any): void {
    console.log(`🔄 [StateLogger] Action decided: ${action.type}${action.query ? ` - "${action.query}"` : ''}${action.url ? ` - ${action.url}` : ''}`);
    this.debugLog(`[StateLogger] Action details: ${action.type}${action.query ? ` - Query: "${action.query.substring(0, 30)}..."` : ''}${action.url ? ` - URL: ${action.url}` : ''}`);
  }

  logActionExecution(state: AgentState): void {
    console.log(`🔄 [StateLogger] Action completed. New state - Passages: ${state.passages.length}, Domains: ${distinct(state.passages.map(p => p.source_domain || eTLDplus1(p.url) || "unknown")).length}`);
  }

  logProgressUpdate(coveredCount: number, totalCount: number, iterationsWithoutProgress: number, progressed: boolean): void {
    console.log(`🔄 [StateLogger] Facet coverage updated: ${coveredCount}/${totalCount} facets covered`);
    if (!progressed) {
      this.debugLog(`[StateLogger] No progress detected. Iterations without improvement: ${iterationsWithoutProgress}/3`);
    } else {
      this.debugLog(`[StateLogger] Progress detected!`);
    }
  }
}
