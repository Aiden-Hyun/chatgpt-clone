import type { AIProviderManager } from "../services/AIProviderManager.ts";
import type { Budget, Facet, ModelProvider, Passage, QuestionType, TimeRange } from "../types/AgentTypes.ts";
import type { APICallTracker } from "../utils/APICallTracker.ts";

type PlannerAction = { type: "SEARCH" | "FETCH" | "RERANK" | "STOP"; query?: string; k?: number; url?: string; top_n?: number; timeRange?: TimeRange; };

export class Planner {
  private getModelConfig: (isReasoning: boolean) => any;
  private reasoningModel: string;
  private reasoningModelProvider: ModelProvider;
  private openai: any | null;
  private aiProviderManager?: AIProviderManager; // NEW: AI Provider Manager
  private apiCallTracker?: APICallTracker; // NEW: API Call Tracker

  constructor(args: {
    getModelConfig: (isReasoning: boolean) => any;
    reasoningModel: string;
    reasoningModelProvider: ModelProvider;
    openai: any | null;
    aiProviderManager?: AIProviderManager; // NEW: AI Provider Manager
    apiCallTracker?: APICallTracker; // NEW: API Call Tracker
  }) {
    this.getModelConfig = args.getModelConfig;
    this.reasoningModel = args.reasoningModel;
    this.reasoningModelProvider = args.reasoningModelProvider;
    this.openai = args.openai;
    this.aiProviderManager = args.aiProviderManager;
    this.apiCallTracker = args.apiCallTracker;
  }

  async decideActionJSON(ctx: {
    question: string;
    passages: Passage[];
    facets: Facet[];
    budget: Budget;
    currentDateTime: string;
    isTimeSensitive: (q: string) => boolean;
    iterationsWithoutProgress: number;
    tracePush: (obj: any) => void;
    debug: boolean;
    searchHistory: string[];
    questionType?: QuestionType; // NEW: Question type for smart rules
    searchCount?: number; // NEW: Track number of searches performed
  }): Promise<PlannerAction> {
    const { question, passages, facets, budget, currentDateTime, isTimeSensitive, iterationsWithoutProgress, tracePush, debug, searchHistory, questionType, searchCount = 0 } = ctx;

    console.log(`🔍 [Planner] Starting decision process for question: "${question}"`);
    console.log(`🔍 [Planner] Question type: ${questionType || 'UNKNOWN'}`);
    console.log(`🔍 [Planner] Search count: ${searchCount}`);
    console.log(`🔍 [Planner] Current state - Passages: ${passages.length}, Facets: ${facets.length}, Budget: ${budget.searches} searches left`);

    const topSources = [...new Set(passages.map(p => p.url))].slice(0, 3).join(", ");

    const recentActions = []; // Agent will record actions in its own trace after this returns

    const repeatedSearches = searchHistory.filter((q, i) => searchHistory.indexOf(q) !== i);
    const searchPatterns = searchHistory.slice(-5).map(q => q.toLowerCase());

    const system = `Reply ONLY with minified JSON. Do not include markdown.

{"thought":"...","action":{"type":"SEARCH|FETCH|RERANK|STOP","query":"...","k":12,"url":"https://...","top_n":6,"timeRange":"d|w|m|y"}}

Special Rules for MINIMAL_SEARCH questions:
- Do exactly 1 SEARCH, then STOP
- Don't do multiple searches or fetches
- Focus on getting current/real-time data quickly
- After 1 search, STOP regardless of facet coverage`;

    const needFacets = facets.filter(f => f.required && !f.covered).map(f => f.name);
    const coveredFacets = facets.filter(f => f.required && f.covered).map(f => f.name);
    const facetCoverageRatio = (facets.filter(f => f.required && f.covered).length) / Math.max(facets.filter(f => f.required).length, 1);

    console.log(`🔍 [Planner] Facet analysis - Covered: ${coveredFacets.join(', ') || 'none'}, Uncovered: ${needFacets.join(', ') || 'none'}, Coverage: ${Math.round(facetCoverageRatio * 100)}%`);

    const user = `
Current time: ${currentDateTime}
Question: ${question}
Question type: ${questionType || 'UNKNOWN'}

Budget left: {timeMs:${budget.timeMs - (Date.now() - budget.startedMs)}, searches:${budget.searches}, fetches:${budget.fetches}}
Passages: ${passages.length}
Top sources: ${topSources || "none"}
Facet coverage: ${coveredFacets.length}/${facets.filter(f => f.required).length} (${Math.round(facetCoverageRatio * 100)}%)
Covered facets: ${coveredFacets.join(", ") || "none"}
Uncovered required facets: ${needFacets.join(", ") || "none"}
Recent actions: ${recentActions.join(", ") || "none"}
Repeated searches detected: ${repeatedSearches.length > 0 ? repeatedSearches.join(", ") : "none"}
Search patterns to avoid: ${searchPatterns.join(", ") || "none"}
Iterations without progress: ${iterationsWithoutProgress}/3

Rules:
- FIRST: If the question can be answered using your knowledge without web search (like dates, math, definitions, etc.), choose STOP immediately.
- SECOND: If the question is about a specific person, place, or thing, and you have a good answer from your knowledge base, choose STOP immediately.
- PRIORITY: Facet coverage is the most important factor. If coverage < 60%, SEARCH is mandatory.
- If facet coverage < 60%: SEARCH using the original question or specific terms from uncovered facets.
- If < 3 quality passages: SEARCH with the original question.
- If you have promising URLs from search snippets: FETCH one high-authority URL we haven't fetched yet.
- Periodically RERANK to keep top 8–10 diverse, recent passages.
- STOP only when facet coverage ≥ 60% AND all required facets have ≥1 independent source AND domain diversity ≥ 2.
- CRITICAL: Avoid repeating the same search query. If a query was already searched, try a different approach.
- If repeated searches detected or no progress for 2+ iterations, prefer RERANK or STOP over SEARCH.
- Avoid search patterns that have been used recently (see "Search patterns to avoid").

Respond in JSON only.`;

    const messages = [
      { role: "system", content: system },
      { role: "user", content: user }
    ];

    console.log(`🔍 [Planner] Sending decision request to AI model...`);

    const startTime = Date.now();
    
    let response: any;
    
    // Use AI Provider Manager if available, otherwise fall back to direct calls
    if (this.aiProviderManager) {
      console.log(`🤖 [Planner] API Call #2 - Planner Decision (AI Provider Manager):`);
      console.log(`🤖 [Planner] Model: ${this.reasoningModel}`);
      console.log(`🤖 [Planner] System prompt length: ${system.length} chars`);
      console.log(`🤖 [Planner] User prompt length: ${user.length} chars`);
      console.log(`🤖 [Planner] Total context length: ${system.length + user.length} chars`);
      
      const modelConfig = this.getModelConfig(true);
      console.log(`🤖 [Planner] Model config: ${JSON.stringify(modelConfig)}`);
      
      response = await this.aiProviderManager.call(
        this.reasoningModelProvider,
        this.reasoningModel,
        messages,
        modelConfig
      );
    } else {
      // Fallback to direct provider calls (for backward compatibility)
      console.log(`🤖 [Planner] Using direct provider calls (fallback)`);
      
      if (this.reasoningModelProvider === 'anthropic') {
        console.log(`🤖 [Planner] API Call #2 - Planner Decision (Anthropic):`);
        console.log(`🤖 [Planner] Model: ${this.reasoningModel}`);
        console.log(`🤖 [Planner] System prompt length: ${system.length} chars`);
        console.log(`🤖 [Planner] User prompt length: ${user.length} chars`);
        console.log(`🤖 [Planner] Total context length: ${system.length + user.length} chars`);
        
        const modelConfig = this.getModelConfig(true);
        console.log(`🤖 [Planner] Model config: ${JSON.stringify(modelConfig)}`);
        
        const { callAnthropic } = await import("../../../ai-chat/providers/anthropic.ts");
        response = await callAnthropic(this.reasoningModel, messages, modelConfig);
      } else {
        if (!this.openai) throw new Error('OpenAI client not initialized but trying to use OpenAI model');
        console.log(`🤖 [Planner] API Call #2 - Planner Decision (OpenAI):`);
        console.log(`🤖 [Planner] Model: ${this.reasoningModel}`);
        console.log(`🤖 [Planner] System prompt length: ${system.length} chars`);
        console.log(`🤖 [Planner] User prompt length: ${user.length} chars`);
        console.log(`🤖 [Planner] Total context length: ${system.length + user.length} chars`);
        
        const modelConfig = this.getModelConfig(true);
        console.log(`🤖 [Planner] Model config: ${JSON.stringify(modelConfig)}`);
        
        response = await this.openai.chat.completions.create({
          model: this.reasoningModel,
          messages,
          temperature: modelConfig.defaultTemperature,
          [modelConfig.tokenParameter]: modelConfig.max_tokens
        });
      }
    }
    
    const apiTime = Date.now() - startTime;
    console.log(`🤖 [Planner] API response received in ${apiTime}ms`);

    // Track API call
    if (this.apiCallTracker) {
      this.apiCallTracker.trackCall({
        purpose: "Planner Decision",
        model: this.reasoningModel,
        provider: this.reasoningModelProvider,
        responseTimeMs: apiTime,
        success: true,
        metadata: {
          questionType: questionType || 'UNKNOWN',
          searchCount: searchCount,
          passagesCount: passages.length,
          facetsCount: facets.length,
          systemPromptLength: system.length,
          userPromptLength: user.length
        }
      });
    }

    const raw = response.choices[0]?.message?.content?.trim() || "{}";
    console.log(`🔍 [Planner] AI response: ${raw.substring(0, 200)}...`);
    console.log(`🤖 [Planner] Full API response: ${JSON.stringify(response.choices[0]?.message || {})}`);
    
    let parsed: any;
    try { parsed = JSON.parse(raw); }
    catch {
      console.log(`⚠️ [Planner] Failed to parse JSON response, using fallback STOP action`);
      return { type: "STOP" };
    }

    const act = parsed.action || {};
    console.log(`🔍 [Planner] AI decided action: ${act.type}`);
    if (questionType === 'MINIMAL_SEARCH') {
      console.log(`🔍 [Planner] MINIMAL_SEARCH detected - enforcing 1 SEARCH then STOP rule`);
    }

    if (act.type === "SEARCH") {
      // MINIMAL_SEARCH rule: If we've already done a search, force STOP
      if (questionType === 'MINIMAL_SEARCH' && searchCount > 0) {
        console.log(`🔍 [Planner] MINIMAL_SEARCH rule: Already did ${searchCount} search(es), forcing STOP`);
        return { type: "STOP" };
      }
      
      let query = typeof act.query === 'string' && act.query.trim() ? act.query : question;
      console.log(`🔍 [Planner] Search query: "${query}"`);
      
      const k = typeof act.k === 'number' && act.k > 0 ? act.k : 12;
      const validTimeRanges: TimeRange[] = ['d', 'w', 'm', 'y'];
      const timeRange = act.timeRange && validTimeRanges.includes(act.timeRange) ? act.timeRange : undefined;
      
      const finalAction = { type: "SEARCH" as const, query: String(query), k: Number(k), timeRange };
      console.log(`🔍 [Planner] Final SEARCH action: ${JSON.stringify(finalAction)}`);
      return finalAction;
    }
    
    if (act.type === "FETCH" && typeof act.url === "string" && /^https?:\/\//.test(act.url)) {
      console.log(`🔍 [Planner] FETCH action for URL: ${act.url}`);
      return { type: "FETCH", url: act.url };
    }
    
    if (act.type === "RERANK") {
      const top_n = typeof act.top_n === 'number' && act.top_n > 0 ? act.top_n : 10;
      console.log(`🔍 [Planner] RERANK action with top_n: ${top_n}`);
      return { type: "RERANK", top_n: Number(top_n) };
    }
    
    console.log(`🔍 [Planner] STOP action - ending search process`);
    return { type: "STOP" };
  }
}


