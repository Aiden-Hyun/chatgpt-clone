
// agent.ts
import OpenAI from "jsr:@openai/openai";
import { callAnthropic } from "../ai-chat/providers/anthropic.ts";
import { config as appConfig } from "../shared/config.ts";
import { CacheManager } from "./cache.ts";
import { FetchService } from "./services/fetch.ts";
import { RerankService } from "./services/rerank.ts";
import { SearchService } from "./services/search.ts";
// We're only using callAnthropic directly, OpenAI is used via the client
import { BudgetManager } from "./agent/components/BudgetManager.ts";
import { FacetManager } from "./agent/components/FacetManager.ts";
import { Planner } from "./agent/components/Planner.ts";
import { QueryDecomposer } from "./agent/components/QueryDecomposer.ts";
import { SearchOrchestrator } from "./agent/components/SearchOrchestrator.ts";
import { SynthesisEngine } from "./agent/components/SynthesisEngine.ts";

// === Models ==================================================================

const DEFAULT_REASONING_MODEL = Deno.env.get("OPENAI_REASONING_MODEL") ?? "gpt-4o-mini";
const DEFAULT_SYNTH_MODEL     = Deno.env.get("OPENAI_SYNTH_MODEL")     ?? "gpt-4o";

// Model provider types
type ModelProvider = 'openai' | 'anthropic';

// Helper function to determine model provider
function getModelProvider(model: string): ModelProvider {
  if (model.startsWith('claude')) {
    return 'anthropic';
  }
  return 'openai';
}

// === Types ===================================================================

export interface ReActResult {
  final_answer_md: string;
  citations: { url: string; title?: string; published_date?: string }[];
  trace?: any;
  time_warning?: string;
}

type TimeRange = 'd' | 'w' | 'm' | 'y';

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

// === Utility =================================================================

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

function eTLDplus1(url: string): string | undefined {
  try {
    const u = new URL(url);
    const parts = u.hostname.split('.');
    if (parts.length <= 2) return u.hostname;
    return parts.slice(-2).join('.');
  } catch { return undefined; }
}

function approxTokenLen(s: string): number {
  // ~4 chars/token heuristic; avoid heavy tokenizers
  return Math.ceil(s.length / 4);
}

function chunkByTokens(text: string, maxTokens = 900, overlapTokens = 120): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let buf: string[] = [];
  let t = 0;

  for (const w of words) {
    const wt = approxTokenLen(w) + 1;
    if (t + wt > maxTokens) {
      chunks.push(buf.join(' '));
      // overlap
      let overlap = overlapTokens;
      const back: string[] = [];
      for (let i = buf.length - 1; i >= 0 && overlap > 0; i--) {
        const tok = approxTokenLen(buf[i]) + 1;
        overlap -= tok;
        back.unshift(buf[i]);
      }
      buf = [...back, w];
      t = approxTokenLen(buf.join(' '));
    } else {
      buf.push(w);
      t += wt;
    }
  }
  if (buf.length) chunks.push(buf.join(' '));
  return chunks;
}

function sha1(str: string): string {
  // Fast non-crypto hash just for cache keys (not security):
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString(36);
}

function nowISO(): string {
  return new Date().toISOString();
}

function isTimeSensitive(q: string): boolean {
  const k = ['current', 'today', 'now', 'as of', 'latest', 'recent', 'update', 'price', 'release', 'outage', 'who is', 'who’s', 'breaking', '2025', '2024', 'this week', 'this month', 'this year'];
  const s = q.toLowerCase();
  return k.some(x => s.includes(x));
}

function timeBucketDay(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

function distinct<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

function domainAuthorityScore(domain?: string): number {
  if (!domain) return 0;
  if (domain.endsWith(".gov") || domain.endsWith(".govt") || domain.endsWith(".gouv")) return 0.98;
  if (domain.endsWith(".edu") || domain.endsWith(".ac") || domain.endsWith(".edu.cn")) return 0.95;
  const high = ["nature.com","sciencedirect.com","nejm.org","thelancet.com","who.int","oecd.org","imf.org","worldbank.org","un.org","reuters.com","apnews.com","bbc.co.uk","nytimes.com","washingtonpost.com","ft.com","bloomberg.com"];
  if (high.some(h => domain.endsWith(h))) return 0.9;
  const low = ["medium.com","quora.com","reddit.com","stackexchange.com","blogspot.","wordpress.","substack.com","contentfarm","clickbait"];
  if (low.some(l => domain.includes(l))) return 0.2;
  return 0.6;
}

// Extract ISO date from HTML via meta tags; fallback regex
function extractPublishedDateFromHtml(html: string, url: string): string | undefined {
  // JSON-LD datePublished
  const jsonLdMatches = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi) || [];
  for (const block of jsonLdMatches) {
    try {
      const jsonText = block.replace(/<script[^>]*>|<\/script>/gi, "");
      const data = JSON.parse(jsonText.trim());
      const candidates = Array.isArray(data) ? data : [data];
      for (const c of candidates) {
        const d = c?.datePublished || c?.dateCreated || c?.dateModified;
        if (d) return new Date(d).toISOString();
      }
    } catch {/* ignore */}
  }
  // Meta tags
  const metas = [
    /property=["']article:published_time["'][^>]*content=["']([^"']+)["']/i,
    /itemprop=["']datePublished["'][^>]*content=["']([^"']+)["']/i,
    /name=["']pubdate["'][^>]*content=["']([^"']+)["']/i,
    /datetime=["']([^"']+)["'][^>]*>\s*<\/time>/i,
  ];
  for (const re of metas) {
    const m = html.match(re);
    if (m?.[1]) {
      const d = new Date(m[1]);
      if (!isNaN(d.getTime())) return d.toISOString();
    }
  }
  // URL patterns
  const urlRe = /\/(20\d{2})[\/\-](0[1-9]|1[0-2])[\/\-](0[1-9]|[12]\d|3[01])\//;
  const um = url.match(urlRe);
  if (um) return new Date(`${um[1]}-${um[2]}-${um[3]}`).toISOString();

  // Body regex fallback (avoid false positives)
  const bodyDate = html.match(/\b(20\d{2})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])\b/);
  if (bodyDate) return new Date(bodyDate[0]).toISOString();
  return undefined;
}

function newestDate(passages: Passage[]): Date | undefined {
  const dates = passages
    .map(p => p.published_date)
    .filter(Boolean)
    .map(d => new Date(d!))
    .filter(d => !isNaN(d.getTime()));
  if (!dates.length) return undefined;
  return new Date(Math.max(...dates.map(d => d.getTime())));
}

// === Agent ===================================================================

export class ReActAgent {
  private openai: OpenAI | null = null;
  private cfg: ReActAgentConfig;
  private currentDateTime: string;
  private trace: any[] = [];
  private previousFacetCoverage: number = 0;
  private iterationsWithoutProgress: number = 0;
  private searchHistory: string[] = [];
  private previousPassageCount: number = 0;
  private previousDomainCount: number = 0;
  private decomposedQueriesForSession: string[] = [];
  private usedDecomposedQueries: Set<string> = new Set();
  private currentDecomposedQueryIndex: number = 0;
  private currentQuestion: string = '';

  private reasoningModel: string;
  private synthesisModel: string;
  private reasoningModelProvider: ModelProvider;
  private synthesisModelProvider: ModelProvider;
  private budgetManager: BudgetManager;
  private queryDecomposer: QueryDecomposer;
  private searchOrchestrator: SearchOrchestrator;
  private synthesisEngine: SynthesisEngine;
  private facetManager: FacetManager;
  private planner: Planner;
  
  // Helper method to get standardized model configuration
  private getModelConfig(isReasoning: boolean): any {
    const baseConfig = this.cfg.modelConfig || {};
    const defaultTemp = isReasoning ? 0.1 : 0.2;
    const defaultTokens = isReasoning ? 300 : 1200;
    
    return {
      tokenParameter: baseConfig.tokenParameter || 'max_tokens',
      supportsCustomTemperature: baseConfig.supportsCustomTemperature !== false,
      defaultTemperature: baseConfig.defaultTemperature || defaultTemp,
      max_tokens: baseConfig.max_tokens || defaultTokens
    };
  }

  constructor(cfg: ReActAgentConfig) {
    this.cfg = cfg;
    this.currentDateTime = nowISO();
    this.budgetManager = new BudgetManager();
    this.queryDecomposer = new QueryDecomposer();
    this.searchOrchestrator = new SearchOrchestrator(cfg.searchService);
    this.synthesisEngine = new SynthesisEngine();
    this.facetManager = new FacetManager();
    this.planner = new Planner({
      getModelConfig: (isReasoning: boolean) => this.getModelConfig(isReasoning),
      reasoningModel: this.reasoningModel,
      reasoningModelProvider: this.reasoningModelProvider,
      openai: this.openai,
    });
    
    // If a single model is provided, use it for both reasoning and synthesis
    if (cfg.model) {
      this.reasoningModel = cfg.model;
      this.synthesisModel = cfg.model;
    } else {
      this.reasoningModel = cfg.reasoningModel ?? DEFAULT_REASONING_MODEL;
      this.synthesisModel = cfg.synthesisModel ?? DEFAULT_SYNTH_MODEL;
    }
    
    // Determine providers based on model names or explicit config
    this.reasoningModelProvider = cfg.reasoningModelProvider ?? getModelProvider(this.reasoningModel);
    this.synthesisModelProvider = cfg.synthesisModelProvider ?? getModelProvider(this.synthesisModel);
    
    // Only initialize OpenAI client if needed
    if (this.reasoningModelProvider === 'openai' || this.synthesisModelProvider === 'openai') {
      this.openai = new OpenAI({ apiKey: appConfig.secrets.openai.apiKey() });
    }
    
    console.log(`[Agent] Init: reasoning=${this.reasoningModel} (${this.reasoningModelProvider}), synthesis=${this.synthesisModel} (${this.synthesisModelProvider})`);
  }

  // --- Core ------------------------------------------------------------------

  async run(question: string): Promise<ReActResult> {
    console.log(`[Agent] Starting search for question: "${question.substring(0, 50)}${question.length > 50 ? '...' : ''}"`);
    const start = Date.now();
    this.trace = [];
    this.currentQuestion = question; // Store the original question for validation
    const budget = this.initBudget();
    console.log(`[Agent] Budget initialized: ${JSON.stringify(budget)}`);

    // Parametric cache key
    const cacheKey = sha1(JSON.stringify({
      q: question,
      day: isTimeSensitive(question) ? timeBucketDay() : "evergreen",
      models: { r: this.reasoningModel, s: this.synthesisModel },
      budget: { searches: budget.searches, fetches: budget.fetches },
    }));

    console.log(`[Agent] Checking cache with key: ${cacheKey}`);
    const cached = await this.cfg.cacheManager.getAnswerCache(cacheKey);
    if (cached) {
      console.log(`[Agent] Cache hit! Returning cached result`);
      if (this.cfg.debug) this.trace.push({ event: "cache_hit", cacheKey });
      return cached;
    }
    console.log(`[Agent] No cache hit, proceeding with search`);

    const passages: Passage[] = [];
    const citations: ReActResult["citations"] = [];
    const metrics = { searches: 0, fetches: 0, reranks: 0 };

    // Facet planner (very light)
    console.log(`[Agent] Extracting facets from question`);
    let facets = await this.extractFacets(question);
    console.log(`[Agent] Extracted ${facets.length} facets: ${facets.map(f => f.name).join(', ')}`);

    // Main loop with safety limits
    const MAX_ITERATIONS = 10; // Reduced from 20 to prevent excessive iterations
    let iterations = 0;
    
    while (!this.isBudgetDepleted(budget) && 
           Date.now() - start < budget.timeMs && 
           iterations < MAX_ITERATIONS &&
           this.iterationsWithoutProgress < 3) {
      
      iterations++;
      console.log(`[Agent] Loop iteration ${iterations}: Deciding next action`);
      
      // Debug logging for loop analysis
      const currentPassageCount = passages.length;
      const currentDomainCount = distinct(passages.map(p => p.source_domain || eTLDplus1(p.url) || "unknown")).length;
      const currentFacetCoverage = facets.filter(f => f.covered).length;
      
      console.log(`[Agent:Debug] State - Passages: ${currentPassageCount} (${currentPassageCount - this.previousPassageCount > 0 ? '+' : ''}${currentPassageCount - this.previousPassageCount}), Domains: ${currentDomainCount} (${currentDomainCount - this.previousDomainCount > 0 ? '+' : ''}${currentDomainCount - this.previousDomainCount}), Facets: ${currentFacetCoverage}/${facets.length}`);
      console.log(`[Agent:Debug] Budget - Time: ${Math.round((Date.now() - budget.startedMs) / 1000)}s/${Math.round(budget.timeMs / 1000)}s, Searches: ${budget.searches}, Fetches: ${budget.fetches}`);
      console.log(`[Agent:Debug] Search History: ${this.searchHistory.slice(-3).join(' | ')}`);
      
      const action = await this.planner.decideActionJSON({
        question,
        passages,
        facets,
        budget,
        currentDateTime: this.currentDateTime,
        decomposeComplexQuery: (q: string, f: any) => this.decomposeComplexQuery(q, f),
        createFocusedQuery: (q: string, f: string) => this.createFocusedQuery(q, f),
        isTimeSensitive,
        iterationsWithoutProgress: this.iterationsWithoutProgress,
        tracePush: (obj: any) => { if (this.cfg.debug) this.trace.push(obj); },
        debug: !!this.cfg.debug,
        searchHistory: this.searchHistory,
        getUsedDecomposedQueries: () => this.usedDecomposedQueries,
        getDecomposedSession: () => this.decomposedQueriesForSession,
        setDecomposedSession: (qs: string[]) => { this.decomposedQueriesForSession = qs; },
      });
      console.log(`[Agent] Decided action: ${action.type}${action.query ? ` - Query: "${action.query.substring(0, 30)}..."` : ''}${action.url ? ` - URL: ${action.url}` : ''}`);
      if (this.cfg.debug) this.trace.push({ loop: iterations, action });
      
      // Update state tracking
      this.previousPassageCount = currentPassageCount;
      this.previousDomainCount = currentDomainCount;

      if (action.type === "STOP") break;
      
      // Force stop after too many iterations with the same action type
      const actionTypeCounts = this.trace
        .filter(t => t.action?.type)
        .reduce((acc, t) => {
          const type = t.action.type;
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
      // If we've done the same action type too many times, force a STOP
      if (actionTypeCounts[action.type] > 8) {
        if (this.cfg.debug) this.trace.push({ 
          warning: `Forced STOP after ${actionTypeCounts[action.type]} iterations of ${action.type}` 
        });
        break;
      }

      if (action.type === "SEARCH" && budget.searches > 0) {
        // Check if we've already searched this exact query to prevent duplicates
        const previousSearches = this.trace
          .filter(t => t.action?.type === "SEARCH" && t.action?.query === action.query)
          .length;
        
        if (previousSearches > 0) {
          console.log(`[Agent] Skipping duplicate search for: "${action.query}" (already searched ${previousSearches} times)`);
          if (this.cfg.debug) this.trace.push({ 
            warning: `Skipped duplicate search: ${action.query}`,
            previousCount: previousSearches
          });
          continue; // Skip to next iteration
        }
        
        console.log(`[Agent] Executing SEARCH action with query: "${action.query}"`);
        metrics.searches++;
        budget.searches--;
        console.log(`[Agent] Search budget remaining: ${budget.searches}`);
        
        // Track search history and decomposed query usage
        if (action.query) {
          this.searchHistory.push(action.query);
          if (this.searchHistory.length > 10) {
            this.searchHistory.shift(); // Keep only last 10 searches
          }
          
          // Track if this was a decomposed query
          if (this.decomposedQueriesForSession.includes(action.query)) {
            this.usedDecomposedQueries.add(action.query);
            console.log(`[Agent:searchTracking] Marked decomposed query as used: "${action.query}"`);
            console.log(`[Agent:searchTracking] Used decomposed queries: ${this.usedDecomposedQueries.size}/${this.decomposedQueriesForSession.length}`);
          }
        }
        
        console.log(`[Agent] Performing multi-query search with base query: "${action.query}"`);
        const results = await this.searchOrchestrator.multiQuerySearch(action.query, action.k ?? 12, action.timeRange);
        console.log(`[Agent] Search returned ${results.length} raw results`);
        const filtered = this.searchOrchestrator.filterAndScoreResults(results);
        console.log(`[Agent] After filtering: ${filtered.length} results`);
        
        // Retain more diverse sources by processing more results
        const processedResults = this.searchOrchestrator.retainDiverseSources(filtered, passages);
        console.log(`[Agent] After diversity filtering: ${processedResults.length} results`);
        
        // Convert to passages using snippets; FETCH later refines content
        for (const r of processedResults) {
          passages.push({
            id: `search_${sha1(String(r.url))}`,
            text: r.snippet || r.title || r.url,
            url: String(r.url),
            title: r.title,
            source_domain: eTLDplus1(String(r.url)),
          });
        }
        if (this.cfg.debug) this.trace.push({ event: "search", added: filtered.length });
      }

      if (action.type === "FETCH" && budget.fetches > 0) {
        console.log(`[Agent] Executing FETCH action for URL: ${action.url}`);
        metrics.fetches++;
        budget.fetches--;
        console.log(`[Agent] Fetch budget remaining: ${budget.fetches}`);
        const ob = await this.safeFetchWithRetries(action.url);
        if (ob?.text) {
          // Use only ob.text since rawHtml is not available in FetchResult interface
          const pub = extractPublishedDateFromHtml(ob.text, ob.url);
          const domain = eTLDplus1(ob.url);
          const chunks = chunkByTokens(ob.text, 900, 120);
          chunks.forEach((chunk, i) => {
            passages.push({
              id: `fetch_${sha1(ob.url)}_${i}`,
              text: chunk,
              url: ob.url,
              title: ob.title,
              published_date: pub,
              source_domain: domain
            });
          });
          if (this.cfg.debug) this.trace.push({ event: "fetch", url: ob.url, chunks: chunks.length, pub });
        }
      }

      if (action.type === "RERANK") {
        console.log(`[Agent] Executing RERANK action on ${passages.length} passages`);
        metrics.reranks++;
        const reranked = await this.cfg.rerankService.rerank(question, passages, action.top_n ?? 8);
        // Keep only the top-N reranked passages but also ensure domain diversity
        const chosen: Passage[] = [];
        const seenDomains = new Set<string>();
        for (const p of (reranked.reranked_passages || passages)) {
          const dom = p.source_domain || eTLDplus1(p.url) || "unknown";
          const countDomain = chosen.filter(x => x.source_domain === dom).length;
          if (countDomain < 3) chosen.push(p);
          if (chosen.length >= (action.top_n ?? 8)) break;
          seenDomains.add(dom);
        }
        passages.splice(0, passages.length, ...chosen);
        console.log(`[Agent] Reranking complete. Kept ${chosen.length} passages from ${seenDomains.size} domains`);
        if (this.cfg.debug) this.trace.push({ event: "rerank", kept: chosen.length });
      }

      // Update facet coverage after each step
      facets = this.updateFacetCoverage(facets, passages);
      const coveredCount = facets.filter(f => f.covered).length;
      console.log(`[Agent] Facet coverage updated: ${coveredCount}/${facets.length} facets covered`);
      
      // Progress tracking: detect when agent is stuck
      if (coveredCount <= this.previousFacetCoverage) {
        this.iterationsWithoutProgress++;
        console.log(`[Agent] No progress detected. Iterations without improvement: ${this.iterationsWithoutProgress}/3`);
        if (this.iterationsWithoutProgress >= 3) {
          console.log(`[Agent] Forcing STOP after 3 iterations without progress`);
          if (this.cfg.debug) this.trace.push({ 
            warning: `Forced STOP due to no progress for ${this.iterationsWithoutProgress} iterations` 
          });
          break;
        }
      } else {
        this.iterationsWithoutProgress = 0;
        console.log(`[Agent] Progress detected! Facet coverage improved from ${this.previousFacetCoverage} to ${coveredCount}`);
      }
      this.previousFacetCoverage = coveredCount;

      // Freshness gate for time-sensitive queries
      if (isTimeSensitive(question)) {
        const newest = newestDate(passages);
        const staleCutoff = new Date(Date.now() - 30 * 24 * 3600 * 1000);
        if (!newest || newest < staleCutoff) {
          // Force an extra SEARCH if budget allows
          if (budget.searches > 0) {
            const q = `${question} ${new Date().getFullYear()} latest`;
            const results = await this.searchOrchestrator.multiQuerySearch(q, 8, "w");
            const filtered = this.searchOrchestrator.filterAndScoreResults(results);
            for (const r of filtered) {
              passages.push({
                id: `search_${sha1(String(r.url))}`,
                text: r.snippet || r.title || r.url,
                url: String(r.url),
                title: r.title,
                source_domain: eTLDplus1(String(r.url)),
              });
            }
            budget.searches--;
            if (this.cfg.debug) this.trace.push({ event: "freshness_boost", added: filtered.length });
          }
        }
      }

      // Early termination conditions
      // Exit if all required facets covered & have ≥2 independent domains overall
      if (this.allRequiredFacetsCovered(facets) && this.hasDomainDiversity(passages, 2)) {
        console.log(`[Agent] All required facets covered with domain diversity, stopping`);
        break;
      }
      
      // Check minimum facet coverage requirement before allowing early termination
      const facetCoverageRatio = facets.filter(f => f.required && f.covered).length / facets.filter(f => f.required).length;
      const meetsMinimumCoverage = facetCoverageRatio >= 0.6;
      
      // Stop if we have sufficient passages but poor facet coverage (indicating facet extraction issue)
      if (passages.length >= 15 && coveredCount === 0) {
        console.log(`[Agent] Early termination: 15+ passages but 0 facets covered (likely facet extraction issue)`);
        if (this.cfg.debug) this.trace.push({ 
          warning: `Early termination due to facet extraction issue` 
        });
        break;
      }
      
      // Stop if we've been searching too long (80% of time budget) AND have minimum coverage
      if (Date.now() - start > budget.timeMs * 0.8 && meetsMinimumCoverage) {
        console.log(`[Agent] Early termination: 80% of time budget reached with ${Math.round(facetCoverageRatio * 100)}% facet coverage`);
        if (this.cfg.debug) this.trace.push({ 
          warning: `Early termination due to time budget (80%) with adequate coverage` 
        });
        break;
      }
      
      // If we're at 80% time budget but don't have minimum coverage, force one more search
      if (Date.now() - start > budget.timeMs * 0.8 && !meetsMinimumCoverage && budget.searches > 0) {
        console.log(`[Agent] At 80% time budget but only ${Math.round(facetCoverageRatio * 100)}% facet coverage - forcing one more search`);
        if (this.cfg.debug) this.trace.push({ 
          warning: `Forcing additional search due to poor facet coverage` 
        });
      }

      // If time is running out, do one last RERANK and exit to synth
      if (Date.now() - start > budget.timeMs * 0.85 || this.isBudgetDepleted(budget)) {
        const reranked = await this.cfg.rerankService.rerank(question, passages, 10);
        passages.splice(0, passages.length, ...(reranked.reranked_passages || passages).slice(0, 10));
        if (this.cfg.debug) this.trace.push({ event: "final_consolidate" });
        break;
      }
    }

    // Synthesis (with claim→source emphasis)
    console.log(`[Agent] Beginning synthesis with ${passages.length} passages`);
    const finalAnswer = await this.synthesize(question, passages);
    console.log(`[Agent] Synthesis complete. Answer length: ${finalAnswer.length} characters`);

    // Citations: take top unique URLs from kept passages
    const uniqueUrls = distinct(passages.map(p => p.url)).slice(0, 6);
    for (const url of uniqueUrls) {
      const p = passages.find(x => x.url === url);
      if (p) citations.push({ url: p.url, title: p.title, published_date: p.published_date });
    }

    // Time warning if time-sensitive & newest is stale
    let time_warning: string | undefined;
    if (isTimeSensitive(question)) {
      const newest = newestDate(passages);
      const staleCutoff = new Date(Date.now() - 30 * 24 * 3600 * 1000);
      if (!newest || newest < staleCutoff) {
        time_warning = "⚠️ No confirmation within the last 30 days; info may be outdated.";
      }
    }

    const result: ReActResult = {
      final_answer_md: finalAnswer,
      citations: citations.slice(0, 4),
      trace: this.cfg.debug ? { steps: this.trace, metrics } : undefined,
      time_warning
    };

    console.log(`[Agent] Caching result with key: ${cacheKey}`);
    await this.cfg.cacheManager.setAnswerCache(cacheKey, result, 24 * 60 * 60);
    console.log(`[Agent] Search complete in ${(Date.now() - start)/1000}s`);
    return result;
  }

  // --- Planning --------------------------------------------------------------

  // Planning extracted to Planner component

  // --- Retrieval -------------------------------------------------------------

  private async multiQuerySearch(seedQuery: string, k: number, timeRange?: TimeRange) {
    console.log(`[Agent:multiQuerySearch] Expanding query: "${seedQuery}"`);
    
    // Smart query expansion with iteration-based variation
    const year = new Date().getFullYear();
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    
    // Base variations
    let qs = [
      seedQuery,
      `${seedQuery} ${isTimeSensitive(seedQuery) ? year : ""}`.trim(),
      `${seedQuery} latest`,
      `${seedQuery} site:gov`,
      `${seedQuery} site:edu`,
    ];
    
    // Add more diverse variations based on query type
    if (seedQuery.toLowerCase().includes('festival') || seedQuery.toLowerCase().includes('event')) {
      qs.push(
        `${seedQuery} schedule`,
        `${seedQuery} lineup`,
        `${seedQuery} tickets`,
        `${seedQuery} ${currentYear}`,
        `${seedQuery} ${nextYear}`
      );
    } else if (seedQuery.toLowerCase().includes('price') || seedQuery.toLowerCase().includes('cost')) {
      qs.push(
        `${seedQuery} current`,
        `${seedQuery} today`,
        `${seedQuery} 2024`,
        `${seedQuery} 2025`
      );
    } else {
      // Generic variations for other queries
      qs.push(
        `${seedQuery} information`,
        `${seedQuery} details`,
        `${seedQuery} guide`,
        `${seedQuery} overview`
      );
    }
    
    // Remove duplicates and limit to 8 queries max
    qs = distinct(qs).slice(0, 8);
    console.log(`[Agent:multiQuerySearch] Expanded to ${qs.length} diverse queries: ${qs.join(' | ')}`);

    const all: any[] = [];
    for (const q of qs) {
      const res = await this.cfg.searchService.search(q, Math.ceil(k / qs.length) * 2, timeRange);
      all.push(...(res.results || []));
      // Gentle pacing to avoid rate limits
      await sleep(60);
    }
    // Deduplicate by URL
    const seen = new Set<string>();
    const uniq = [];
    for (const r of all) {
      if (!seen.has(r.url)) {
        seen.add(r.url);
        uniq.push(r);
      }
    }
    console.log(`[Agent:multiQuerySearch] After deduplication: ${uniq.length} unique results`);
    return uniq;
  }

  private filterAndScoreResults(results: { url: string; title: string; snippet: string }[]) {
    // Deprecated: now handled by SearchOrchestrator
    return this.searchOrchestrator.filterAndScoreResults(results);
  }

  private async safeFetchWithRetries(url: string, attempts = 3) {
    console.log(`[Agent:safeFetch] Attempting to fetch URL: ${url}`);
    for (let i = 0; i < attempts; i++) {
      try {
        console.log(`[Agent:safeFetch] Attempt ${i+1}/${attempts} for ${url}`);
        const res = await this.cfg.fetchService.fetch(url);
        if (res?.status >= 200 && res.status < 400) {
          console.log(`[Agent:safeFetch] Success! Status: ${res.status}, content length: ${res.text?.length || 0}`);
          return res;
        }
        if (res?.status >= 500 || res?.status === 429) {
          await sleep((i + 1) * 200 + Math.random() * 120);
          continue;
        }
        return res; // 4xx hard fail
      } catch (e) {
        console.error(`Fetch attempt ${i+1}/${attempts} failed for ${url}:`, e);
        await sleep((i + 1) * 200 + Math.random() * 120);
      }
    }
    // Return a minimal valid FetchResult object instead of undefined
    console.warn(`[Agent:safeFetch] All ${attempts} fetch attempts failed for ${url}, returning empty result`);
    console.log(`[Agent:safeFetch] Returning fallback content for ${url}`);
    return {
      url,
      text: `Failed to fetch content from ${url} after ${attempts} attempts.`,
      status: 0,
      title: `Failed fetch: ${url}`
    };
  }

  // --- Synthesis -------------------------------------------------------------

  private async synthesize(question: string, passages: Passage[]): Promise<string> {
    const modelConfig = this.getModelConfig(false);
    return this.synthesisEngine.synthesize({
      currentDateTime: this.currentDateTime,
      question,
      passages,
      provider: this.synthesisModelProvider,
      model: this.synthesisModel,
      openai: this.openai,
      modelConfig
    });
  }

  private selectTopDiverse(passages: Passage[], n: number): Passage[] {
    // Delegate to SynthesisEngine for consistency
    return this.synthesisEngine.selectTopDiverse(passages, n);
  }

  // --- Query Decomposition --------------------------------------------------

  private async decomposeComplexQuery(question: string, facets: Facet[]): Promise<string[]> {
    const queries = await this.queryDecomposer.decomposeComplexQuery(question, facets as any);
    return queries;
  }

  private createFocusedQuery(question: string, facetName: string): string {
    return this.queryDecomposer.createFocusedQuery(question, facetName);
  }

  private extractKeyTerms(question: string): string[] {
    return this.queryDecomposer.extractKeyTerms(question);
  }

  private isStopWord(word: string): boolean {
    const stopWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'about', 'that', 'this', 'these', 'those', 'are', 'is', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'must', 'shall'];
    return stopWords.includes(word);
  }

  private createGeneralSubQueries(question: string): string[] {
    return this.queryDecomposer.createGeneralSubQueries(question);
  }

  private getTechnicalSourceBonus(domain: string | undefined, title: string, snippet: string): number {
    // Deprecated: now handled by SearchOrchestrator.scoring-utils
    return 0;
  }

  private getRecencyBonus(url: string, title: string): number {
    // Deprecated: now handled by SearchOrchestrator.scoring-utils
    return 0;
  }

  private passageMatchesFacet(passage: Passage, facet: Facet): boolean {
    const text = `${passage.title || ""} ${passage.text}`.toLowerCase();
    const facetName = facet.name.toLowerCase();
    
    // Get flexible keywords for the facet
    const keywords = this.getFlexibleKeywords(facetName);
    
    // Calculate match score based on keyword presence
    const matchScore = this.calculateFacetMatchScore(text, keywords);
    
    // Log detailed matching information for debugging
    if (this.cfg.debug) {
      console.log(`[Agent:facetMatch] Facet "${facet.name}" vs passage: score=${matchScore.toFixed(2)}, keywords=${keywords.join(', ')}`);
    }
    
    // Require at least 30% match score for coverage
    return matchScore >= 0.3;
  }

  private getFlexibleKeywords(facetName: string): string[] {
    const keywords: string[] = [];
    
    // Split facet name into words and filter out stop words
    const words = facetName.split(/\s+/).filter(word => word.length > 2 && !this.isStopWord(word));
    
    // Add original words
    keywords.push(...words);
    
    // Add stemmed versions
    words.forEach(word => {
      const stemmed = this.stemWord(word);
      if (stemmed !== word) {
        keywords.push(stemmed);
      }
    });
    
    // Add synonyms for common terms
    const synonyms = this.getSynonyms(words);
    keywords.push(...synonyms);
    
    // Add company name variations
    const companyVariations = this.getCompanyVariations(words);
    keywords.push(...companyVariations);
    
    // Remove duplicates and return
    return [...new Set(keywords)];
  }

  private calculateFacetMatchScore(text: string, keywords: string[]): number {
    if (keywords.length === 0) return 0;
    
    let matchedKeywords = 0;
    let totalScore = 0;
    
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        matchedKeywords++;
        // Give higher score for longer/more specific keywords
        totalScore += Math.min(1, keyword.length / 5);
      }
    }
    
    // Calculate percentage of keywords matched
    const keywordMatchRatio = matchedKeywords / keywords.length;
    
    // Calculate weighted score (favor more keyword matches)
    const weightedScore = (keywordMatchRatio * 0.7) + (totalScore / keywords.length * 0.3);
    
    return weightedScore;
  }

  private stemWord(word: string): string {
    // Simple stemming - remove common suffixes
    const suffixes = ['ing', 'ed', 'er', 'est', 'ly', 's', 'es'];
    
    for (const suffix of suffixes) {
      if (word.endsWith(suffix) && word.length > suffix.length + 2) {
        return word.slice(0, -suffix.length);
      }
    }
    
    return word;
  }

  private getSynonyms(words: string[]): string[] {
    const synonyms: string[] = [];
    
    // Common synonym mappings
    const synonymMap: Record<string, string[]> = {
      'trends': ['trend', 'development', 'advancement', 'progress'],
      'manufacturing': ['manufacture', 'production', 'fabrication', 'assembly'],
      'market': ['markets', 'industry', 'sector', 'business'],
      'position': ['share', 'standing', 'rank', 'status', 'dominance'],
      'development': ['advancement', 'progress', 'innovation', 'breakthrough'],
      'impact': ['effect', 'influence', 'consequence', 'result'],
      'restriction': ['ban', 'limitation', 'sanction', 'embargo'],
      'benchmark': ['performance', 'metric', 'measure', 'standard'],
      'data': ['information', 'statistics', 'figures', 'metrics'],
      'chip': ['processor', 'semiconductor', 'silicon', 'hardware'],
      'ai': ['artificial', 'intelligence', 'machine', 'learning'],
      'custom': ['specialized', 'dedicated', 'tailored', 'specific']
    };
    
    words.forEach(word => {
      const wordSynonyms = synonymMap[word] || [];
      synonyms.push(...wordSynonyms);
    });
    
    return synonyms;
  }

  private getCompanyVariations(words: string[]): string[] {
    const variations: string[] = [];
    
    // Company name variations
    const companyMap: Record<string, string[]> = {
      'nvidia': ['nvidia corp', 'nvidia corporation', 'nvda', 'nvidia inc'],
      'intel': ['intel corp', 'intel corporation', 'intc', 'intel inc'],
      'amd': ['advanced micro devices', 'amd inc', 'amd corp'],
      'tsmc': ['taiwan semiconductor', 'tsmc corp', 'tsmc inc'],
      'samsung': ['samsung electronics', 'samsung corp', 'samsung inc']
    };
    
    words.forEach(word => {
      const companyVariations = companyMap[word] || [];
      variations.push(...companyVariations);
    });
    
    return variations;
  }

  private retainDiverseSources(filteredResults: any[], existingPassages: Passage[]): any[] {
    // Deprecated: now handled by SearchOrchestrator
    return this.searchOrchestrator.retainDiverseSources(filteredResults, existingPassages);
  }

  // --- Facets ----------------------------------------------------------------

  typeFacet = undefined; // for TS playground quirks

  private async extractFacets(question: string): Promise<Facet[]> {
    console.log(`[Agent:extractFacets] Extracting facets for question: "${question.substring(0, 50)}${question.length > 50 ? '...' : ''}"`);
    // Lightweight, cheap: use reasoning model to list 2–5 facets
    const sys = `List 2–5 required factual facets (sub-questions) to fully answer the user's query.
Return ONLY minified JSON: {"facets":[{"name":"...","required":true}...]}`;
    
    const messages = [
      { role: "system", content: sys },
      { role: "user", content: question }
    ];
    
    let response;
    
    if (this.reasoningModelProvider === 'anthropic') {
      // Use Anthropic API
      const modelConfig = this.getModelConfig(true); // true for reasoning model
      response = await callAnthropic(this.reasoningModel, messages, modelConfig);
    } else {
      // Use OpenAI API
      if (!this.openai) {
        throw new Error('OpenAI client not initialized but trying to use OpenAI model');
      }
      const openaiConfig = this.cfg.modelConfig || {};
      response = await this.openai.chat.completions.create({
        model: this.reasoningModel,
        messages,
        temperature: openaiConfig.defaultTemperature || 0.1,
        [openaiConfig.tokenParameter || 'max_tokens']: openaiConfig.max_tokens || 200
      });
    }
    
    try {
      const rawResponse = response.choices[0]?.message?.content ?? "{}";
      console.log(`[Agent:extractFacets] Raw facet response: ${rawResponse.substring(0, 100)}${rawResponse.length > 100 ? '...' : ''}`);
      const obj = JSON.parse(rawResponse);
      const facets: Facet[] = (obj.facets || []).slice(0, 5).map((f: any) => ({
        name: String(f.name || "").slice(0, 120),
        required: !!(f.required ?? true),
        sources: new Set<string>(),
        covered: false
      }));
      console.log(`[Agent:extractFacets] Successfully extracted ${facets.length} facets`);
      return facets;
    } catch (error) {
      console.log(`[Agent:extractFacets] Error parsing facets: ${error}. Using fallback.`);
      // Fallback: one generic facet
      return [{ name: "Core answer", required: true, sources: new Set<string>(), covered: false }];
    }
  }

  private updateFacetCoverage(facets: Facet[], passages: Passage[]): Facet[] {
    console.log(`[Agent:updateFacetCoverage] Updating coverage for ${facets.length} facets with ${passages.length} passages`);
    return this.facetManager.updateFacetCoverage(facets as any, passages as any) as any;
  }

  private allRequiredFacetsCovered(facets: Facet[]): boolean {
    return this.facetManager.allRequiredFacetsCovered(facets as any);
  }

  private hasDomainDiversity(passages: Passage[], minDomains: number): boolean {
    console.log(`[Agent:domainDiversity] Checking for minimum ${minDomains} domains`);
    const ok = this.facetManager.hasDomainDiversity(passages as any, minDomains);
    return ok;
  }

  // --- Budget & Guardrails ---------------------------------------------------

  private initBudget(): Budget {
    return this.budgetManager.initBudget(this.cfg.budget as any) as any;
  }

  private isBudgetDepleted(b: Budget): boolean {
    return this.budgetManager.isBudgetDepleted(b as any);
  }
}

// === Local types used in class ===============================================

type Facet = {
  name: string;
  required: boolean;
  sources: Set<string>;
  covered: boolean;
  multipleSources?: boolean;
};

type Budget = {
  timeMs: number;
  searches: number;
  fetches: number;
  tokens: number;
  startedMs: number;
};