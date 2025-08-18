import type { Budget, Facet, Passage } from "../types/AgentTypes.ts";

export type AgentMetrics = { searches: number; fetches: number; reranks: number };

export interface AgentModelsInfo {
  reasoningModel: string;
  synthesisModel: string;
  reasoningProvider: 'openai' | 'anthropic';
  synthesisProvider: 'openai' | 'anthropic';
}

export interface AgentState {
  question: string;
  passages: Passage[];
  facets: Facet[];
  budget: Budget;
  startMs: number;
  currentDateTime: string;
  metrics: AgentMetrics;
  models: AgentModelsInfo;
  searchHistory: string[];
  decomposedQueriesForSession: string[];
  usedDecomposedQueries: Set<string>;
  previousPassageCount: number;
  previousDomainCount: number;
}


