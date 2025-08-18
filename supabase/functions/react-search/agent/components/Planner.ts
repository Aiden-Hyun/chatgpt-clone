import { callAnthropic } from "../../../ai-chat/providers/anthropic.ts";
import type { Budget, Facet, ModelProvider, Passage, TimeRange } from "../types/AgentTypes.ts";

type PlannerAction = { type: "SEARCH" | "FETCH" | "RERANK" | "STOP"; query?: string; k?: number; url?: string; top_n?: number; timeRange?: TimeRange; };

export class Planner {
  private getModelConfig: (isReasoning: boolean) => any;
  private reasoningModel: string;
  private reasoningModelProvider: ModelProvider;
  private openai: any | null;

  constructor(args: {
    getModelConfig: (isReasoning: boolean) => any;
    reasoningModel: string;
    reasoningModelProvider: ModelProvider;
    openai: any | null;
  }) {
    this.getModelConfig = args.getModelConfig;
    this.reasoningModel = args.reasoningModel;
    this.reasoningModelProvider = args.reasoningModelProvider;
    this.openai = args.openai;
  }

  async decideActionJSON(ctx: {
    question: string;
    passages: Passage[];
    facets: Facet[];
    budget: Budget;
    currentDateTime: string;
    decomposeComplexQuery: (question: string, facets: Facet[]) => Promise<string[]>;
    createFocusedQuery: (question: string, facetName: string) => string;
    isTimeSensitive: (q: string) => boolean;
    iterationsWithoutProgress: number;
    tracePush: (obj: any) => void;
    debug: boolean;
    searchHistory: string[];
    getUsedDecomposedQueries: () => Set<string>;
    getDecomposedSession: () => string[];
    setDecomposedSession: (qs: string[]) => void;
  }): Promise<PlannerAction> {
    const { question, passages, facets, budget, currentDateTime, decomposeComplexQuery, createFocusedQuery, isTimeSensitive, iterationsWithoutProgress, tracePush, debug, searchHistory, getUsedDecomposedQueries, getDecomposedSession, setDecomposedSession } = ctx;

    // Decompose complex query if needed
    const decomposedQueries = await decomposeComplexQuery(question, facets);

    // Store decomposed queries for the session if this is the first iteration
    if (getDecomposedSession().length === 0) {
      setDecomposedSession([...decomposedQueries]);
    }

    const topSources = [...new Set(passages.map(p => p.url))].slice(0, 3).join(", ");

    const recentActions = []; // Agent will record actions in its own trace after this returns

    const repeatedSearches = searchHistory.filter((q, i) => searchHistory.indexOf(q) !== i);
    const searchPatterns = searchHistory.slice(-5).map(q => q.toLowerCase());

    const system = `Reply ONLY with minified JSON. Do not include markdown.

CRITICAL: For complex questions, you MUST use the provided decomposed queries instead of the full question.

{"thought":"...","action":{"type":"SEARCH|FETCH|RERANK|STOP","query":"...","k":12,"url":"https://...","top_n":6,"timeRange":"d|w|m|y"}}`;

    const needFacets = facets.filter(f => f.required && !f.covered).map(f => f.name);
    const coveredFacets = facets.filter(f => f.required && f.covered).map(f => f.name);
    const facetCoverageRatio = (facets.filter(f => f.required && f.covered).length) / Math.max(facets.filter(f => f.required).length, 1);

    const uncoveredFacetGuidance = needFacets.map(facet => {
      const facetQuery = createFocusedQuery(question, facet);
      return `${facet}: ${facetQuery}`;
    }).join(" | ");

    const usedSet = getUsedDecomposedQueries();
    const user = `
Current time: ${currentDateTime}
Question: ${question}

*** DECOMPOSED QUERIES (MANDATORY TO USE): ***
${decomposedQueries.map((q, i) => `${i + 1}. "${q}"`).join('\n')}

*** DECOMPOSED QUERY STATUS: ***
Used: ${usedSet.size}/${decomposedQueries.length}
Available: ${decomposedQueries.filter(q => !usedSet.has(q)).map(q => `"${q}"`).join(', ') || 'none'}

Budget left: {timeMs:${budget.timeMs - (Date.now() - budget.startedMs)}, searches:${budget.searches}, fetches:${budget.fetches}}
Passages: ${passages.length}
Top sources: ${topSources || "none"}
Facet coverage: ${coveredFacets.length}/${facets.filter(f => f.required).length} (${Math.round(facetCoverageRatio * 100)}%)
Covered facets: ${coveredFacets.join(", ") || "none"}
Uncovered required facets: ${needFacets.join(", ") || "none"}
Specific queries for uncovered facets: ${uncoveredFacetGuidance || "none"}
Recent actions: ${recentActions.join(", ") || "none"}
Repeated searches detected: ${repeatedSearches.length > 0 ? repeatedSearches.join(", ") : "none"}
Search patterns to avoid: ${searchPatterns.join(", ") || "none"}
Iterations without progress: ${iterationsWithoutProgress}/3

Rules:
- MANDATORY: For SEARCH actions, you MUST use decomposed queries when available. NEVER use the full complex question.
- PRIORITY: Facet coverage is the most important factor. If coverage < 60%, SEARCH is mandatory.
- If facet coverage < 60%: SEARCH using specific queries for uncovered facets (see above).
- If < 3 quality passages: SEARCH with focused sub-queries from the decomposed list.
- If you have promising URLs from search snippets: FETCH one high-authority URL we haven't fetched yet.
- Periodically RERANK to keep top 8–10 diverse, recent passages.
- STOP only when facet coverage ≥ 60% AND all required facets have ≥1 independent source AND domain diversity ≥ 2.
- CRITICAL: Avoid repeating the same search query. If a query was already searched, try a different approach.
- If repeated searches detected or no progress for 2+ iterations, prefer RERANK or STOP over SEARCH.
- Avoid search patterns that have been used recently (see "Search patterns to avoid").
- REQUIRED: Choose from the decomposed queries list above, do NOT create new queries.

Respond in JSON only.`;

    const messages = [
      { role: "system", content: system },
      { role: "user", content: user }
    ];

    let response: any;
    if (this.reasoningModelProvider === 'anthropic') {
      const modelConfig = this.getModelConfig(true);
      response = await callAnthropic(this.reasoningModel, messages, modelConfig);
    } else {
      if (!this.openai) throw new Error('OpenAI client not initialized but trying to use OpenAI model');
      const modelConfig = this.getModelConfig(true);
      response = await this.openai.chat.completions.create({
        model: this.reasoningModel,
        messages,
        temperature: modelConfig.defaultTemperature,
        [modelConfig.tokenParameter]: modelConfig.max_tokens
      });
    }

    const raw = response.choices[0]?.message?.content?.trim() || "{}";
    let parsed: any;
    try { parsed = JSON.parse(raw); }
    catch {
      if (debug) tracePush({ warn: "non_json_action", raw });
      return passages.length < 6
        ? { type: "SEARCH", query: `${question} latest`, k: 10, timeRange: isTimeSensitive(question) ? "w" : undefined }
        : { type: "RERANK", top_n: 10 };
    }

    const act = parsed?.action || {};
    if (act.type === "SEARCH") {
      let query = typeof act.query === 'string' && act.query.trim() ? act.query : '';
      const originalQuery = query;
      query = this.validateAndReplaceQuery(query, question, decomposedQueries, {
        searchHistory,
        getUsedDecomposedQueries,
        shouldUseDecomposedQuery: (q: string) => this.shouldUseDecomposedQuery(q, decomposedQueries, { searchHistory, getUsedDecomposedQueries }),
        getNextUnusedDecomposedQuery: () => this.getNextUnusedDecomposedQuery(decomposedQueries, { searchHistory, getUsedDecomposedQueries, getDecomposedSession, setDecomposedSession })
      });
      const k = typeof act.k === 'number' && act.k > 0 ? act.k : 12;
      const validTimeRanges: TimeRange[] = ['d', 'w', 'm', 'y'];
      const timeRange = act.timeRange && validTimeRanges.includes(act.timeRange) ? act.timeRange : undefined;
      return { type: "SEARCH", query: String(query), k: Number(k), timeRange };
    }
    if (act.type === "FETCH" && typeof act.url === "string" && /^https?:\/\//.test(act.url)) {
      return { type: "FETCH", url: act.url };
    }
    if (act.type === "RERANK") {
      const top_n = typeof act.top_n === 'number' && act.top_n > 0 ? act.top_n : 10;
      return { type: "RERANK", top_n: Number(top_n) };
    }
    return { type: "STOP" };
  }

  private validateAndReplaceQuery(query: string, originalQuestion: string, decomposedQueries: string[], deps: {
    searchHistory: string[];
    getUsedDecomposedQueries: () => Set<string>;
    shouldUseDecomposedQuery: (query: string) => boolean;
    getNextUnusedDecomposedQuery: () => string | null;
  }): string {
    if (!query && decomposedQueries.length > 0) {
      const unusedQuery = deps.getNextUnusedDecomposedQuery();
      if (unusedQuery) return unusedQuery;
    }
    if (deps.shouldUseDecomposedQuery(query)) {
      const replacementQuery = deps.getNextUnusedDecomposedQuery();
      if (replacementQuery) return replacementQuery;
    }
    if (this.isQueryTooComplex(query, originalQuestion)) {
      const replacementQuery = deps.getNextUnusedDecomposedQuery();
      if (replacementQuery) return replacementQuery;
    }
    if (!query) return originalQuestion;
    return query;
  }

  private isQueryTooComplex(query: string, originalQuestion: string): boolean {
    if (query.length > 100) return true;
    const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const originalWords = originalQuestion.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const commonWords = queryWords.filter(word => originalWords.includes(word));
    const similarityRatio = commonWords.length / Math.max(queryWords.length, 1);
    if (similarityRatio > 0.7) return true;
    if (query.toLowerCase().includes(originalQuestion.toLowerCase().substring(0, 50))) return true;
    const clauseCount = (query.match(/and|or|including|also|additionally|furthermore/gi) || []).length;
    if (clauseCount > 2) return true;
    if (query.includes('?')) return true;
    return false;
  }

  private getNextUnusedDecomposedQuery(decomposedQueries: string[], deps: {
    searchHistory: string[];
    getUsedDecomposedQueries: () => Set<string>;
    getDecomposedSession: () => string[];
    setDecomposedSession: (qs: string[]) => void;
  }): string | null {
    const queriesToUse = deps.getDecomposedSession().length > 0 ? deps.getDecomposedSession() : decomposedQueries;
    const usedSet = deps.getUsedDecomposedQueries();
    const searchPatterns = deps.searchHistory.slice(-5).map(q => q.toLowerCase());
    const unusedQueries = queriesToUse.filter(q => !deps.searchHistory.includes(q) && !usedSet.has(q) && !searchPatterns.some(pattern => q.toLowerCase().includes(pattern)));
    if (unusedQueries.length > 0) return unusedQueries[0];
    if (queriesToUse.length > 0) {
      // Cycle
      return queriesToUse[0];
    }
    return null;
  }

  private shouldUseDecomposedQuery(query: string, decomposedQueries: string[], deps: {
    searchHistory: string[];
    getUsedDecomposedQueries: () => Set<string>;
  }): boolean {
    if (decomposedQueries.length === 0) return false;
    if (!query || query.trim().length === 0) return true;
    const usedSet = deps.getUsedDecomposedQueries();
    // If the query equals a long original question pattern, we should use decomposed
    if (decomposedQueries.length > 0 && !decomposedQueries.includes(query)) {
      const available = decomposedQueries.filter(q => !usedSet.has(q));
      if (available.length > 0) return true;
    }
    const commaCount = (query.match(/,/g) || []).length;
    if (commaCount > 1) return true;
    return false;
  }
}


