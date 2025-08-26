import type { Budget, Facet, Passage, QuestionType } from "../types/AgentTypes.ts";

export type AgentMetrics = { searches: number; fetches: number; reranks: number };

export interface AgentModelsInfo {
  reasoningModel: string;
  synthesisModel: string;
  reasoningProvider: 'openai' | 'anthropic';
  synthesisProvider: 'openai' | 'anthropic';
}

export interface AgentState {
  question: string;
  language: string; // NEW: Add language field for detected language
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
  questionType?: QuestionType; // NEW: Type of question
  directAnswer?: string; // NEW: Direct answer for simple questions
}


