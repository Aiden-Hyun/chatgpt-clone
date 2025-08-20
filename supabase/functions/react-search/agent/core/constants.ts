/**
 * Constants for the ReAct agent system
 * Centralized configuration to avoid magic numbers and improve maintainability
 */
export const LOOP_CONSTANTS = {
  MAX_ITERATIONS: 10,
  TIME_THRESHOLD_EARLY: 0.8,
  TIME_THRESHOLD_TERMINATE: 0.85,
  FACET_COVERAGE_THRESHOLD: 0.6,
  MAX_ITERATIONS_WITHOUT_PROGRESS: 3,
  MIN_DOMAIN_DIVERSITY: 2,
  MIN_PASSAGES_FOR_EMPTY_FACETS: 15,
  RERANK_RESULTS_LIMIT: 10,
} as const;

export const BUDGET_CONSTANTS = {
  DEFAULT_TIME_MS: 25000,
  DEFAULT_SEARCHES: 4,
  DEFAULT_FETCHES: 12,
  DEFAULT_TOKENS: 24000,
} as const;

export const SEARCH_CONSTANTS = {
  DEFAULT_SEARCH_RESULTS: 8,
  FRESHNESS_BOOST_SEARCH_RESULTS: 8,
  FRESHNESS_BOOST_DAYS: 30,
} as const;

export const ERROR_MESSAGES = {
  ACTION_EXECUTION_FAILED: 'Action execution failed',
  BUDGET_DEPLETED: 'Budget depleted',
  LOOP_TIMEOUT: 'Loop timeout exceeded',
  INVALID_ACTION_TYPE: 'Invalid action type',
  TRACE_ACCESS_ERROR: 'Trace access error',
} as const;
