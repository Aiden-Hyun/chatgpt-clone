// Core shared types for the ReAct agent
import type { CacheManager } from "../../cache.ts";
import type { FetchService } from "../../services/fetch.ts";
import type { RerankService } from "../../services/rerank.ts";
import type { SearchService } from "../../services/search.ts";

export type ModelProvider = 'openai' | 'anthropic';

export type TimeRange = 'd' | 'w' | 'm' | 'y';

export type QuestionType = 'DIRECT_ANSWER' | 'MINIMAL_SEARCH' | 'FULL_RESEARCH';

export interface QuestionAnalysis {
  type: QuestionType;
  reasoning: string;
  directAnswer?: string; // For DIRECT_ANSWER type
  facets?: Facet[]; // For MINIMAL_SEARCH and FULL_RESEARCH types
}

export interface ReActResult {
  final_answer_md: string;
  citations: { url: string; title?: string; published_date?: string }[];
  trace?: any;
  time_warning?: string;
}

export interface ReActAgentConfig {
  cacheManager: CacheManager;
  searchService: SearchService;
  fetchService: FetchService;
  rerankService: RerankService;
  debug?: boolean;

  // Optional explicit model overrides:
  reasoningModel?: string; // default cheap model
  synthesisModel?: string; // default strong model
  reasoningModelProvider?: ModelProvider; // provider for reasoning model
  synthesisModelProvider?: ModelProvider; // provider for synthesis model
  model?: string; // model passed from index.ts
  modelConfig?: any; // model configuration passed from index.ts

  // Budgets (sane defaults)
  budget?: {
    timeMs?: number;       // total time budget
    searches?: number;     // max SEARCH calls
    fetches?: number;      // max FETCH calls
    tokens?: number;       // rough output token budget per call
  };
}

// Minimal passage payload used across services
export interface Passage {
  id: string;
  text: string;
  url: string;
  title?: string;
  published_date?: string; // ISO
  source_domain?: string;  // eTLD+1
  score?: number;          // composite score post-rerank
}

export type Facet = {
  name: string;
  required: boolean;
  sources: Set<string>;
  covered: boolean;
  multipleSources?: boolean;
};

export type Budget = {
  timeMs: number;
  searches: number;
  fetches: number;
  tokens: number;
  startedMs: number;
};

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
  questionType?: QuestionType; // NEW: Type of question
  directAnswer?: string; // NEW: Direct answer for simple questions
}

export interface AgentMetrics {
  searches: number;
  fetches: number;
  reranks: number;
}

export interface AgentModelsInfo {
  reasoningModel: string;
  synthesisModel: string;
  reasoningProvider: 'openai' | 'anthropic';
  synthesisProvider: 'openai' | 'anthropic';
}


