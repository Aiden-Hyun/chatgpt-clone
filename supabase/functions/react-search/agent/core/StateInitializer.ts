import type { FacetManager } from "../components/FacetManager.ts";
import type { AgentState, Budget } from "../types/AgentTypes.ts";
import { nowISO } from "../utils/time-utils.ts";

export interface StateInitializerConfig {
  debug?: boolean;
}

export interface ModelInfo {
  reasoningModel: string;
  synthesisModel: string;
  reasoningProvider: string;
  synthesisProvider: string;
  openai: any | null; // Add OpenAI client
  modelConfig: any; // Add model configuration
}

/**
 * StateInitializer - Handles initialization of agent state
 * 
 * This class is responsible for:
 * - Creating the initial search state
 * - Extracting question facets (sub-questions)
 * - Setting up model configuration
 * - Initializing metrics and tracking
 */
export class StateInitializer {
  private cfg: StateInitializerConfig;
  private currentDateTime: string;

  constructor(cfg: StateInitializerConfig) {
    this.cfg = cfg;
    this.currentDateTime = nowISO();
  }

  /**
   * Debug logging helper - only outputs when debug mode is enabled
   */
  private debugLog(...args: any[]): void {
    if (this.cfg?.debug) console.log(...args);
  }

  /**
   * Initialize state for the search session
   * 
   * This method creates the complete initial state for a search session, including:
   * - Question and budget information
   * - Model configuration
   * - Metrics tracking
   * - Question facets (sub-questions) extracted by the facet manager
   * 
   * @param question - The user's question to answer
   * @param budget - Budget constraints for this search session
   * @param startMs - Start time in milliseconds
   * @param facetManager - Facet manager to extract question facets
   * @param modelInfo - Model configuration information
   * @returns Complete agent state ready for search execution
   */
  async initializeState(
    question: string,
    budget: Budget,
    startMs: number,
    facetManager: FacetManager,
    modelInfo: ModelInfo
  ): Promise<AgentState> {
    this.debugLog(`[StateInitializer] Initializing state for question: "${question.substring(0, 50)}${question.length > 50 ? '...' : ''}"`);

    // Initialize state for the search session
    const state: AgentState = {
      question,
      passages: [],
      facets: [],
      budget,
      startMs,
      currentDateTime: this.currentDateTime,
      metrics: { searches: 0, fetches: 0, reranks: 0 },
      models: {
        reasoningModel: modelInfo.reasoningModel,
        synthesisModel: modelInfo.synthesisModel,
        reasoningProvider: modelInfo.reasoningProvider,
        synthesisProvider: modelInfo.synthesisProvider,
      },
      searchHistory: [],
      decomposedQueriesForSession: [],
      usedDecomposedQueries: new Set(),
      previousPassageCount: 0,
      previousDomainCount: 0,
    };

    // Extract facets (key aspects) from the question to track coverage
    this.debugLog(`[StateInitializer] Extracting facets from question`);
    state.facets = await facetManager.extractFacets(question, {
      reasoningModelProvider: modelInfo.reasoningProvider as 'openai' | 'anthropic',
      openai: modelInfo.openai,
      reasoningModel: modelInfo.reasoningModel,
      modelConfig: modelInfo.modelConfig,
    });
    this.debugLog(`[StateInitializer] Extracted ${state.facets.length} facets: ${state.facets.map(f => f.name).join(', ')}`);

    return state;
  }

  /**
   * Get current date time
   * 
   * @returns Current date time in ISO format
   */
  getCurrentDateTime(): string {
    return this.currentDateTime;
  }
}
