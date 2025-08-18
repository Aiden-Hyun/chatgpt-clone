
// agent.ts
import OpenAI from "jsr:@openai/openai";
import { callAnthropic } from "../ai-chat/providers/anthropic.ts";
import { config as appConfig } from "../shared/config.ts";
import { CacheManager } from "./cache.ts";
import { FetchService } from "./services/fetch.ts";
import { RerankService } from "./services/rerank.ts";
import { SearchService } from "./services/search.ts";
// We're only using callAnthropic directly, OpenAI is used via the client

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

  private reasoningModel: string;
  private synthesisModel: string;
  private reasoningModelProvider: ModelProvider;
  private synthesisModelProvider: ModelProvider;
  
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
    const MAX_ITERATIONS = 20; // Hard limit on iterations to prevent infinite loops
    let iterations = 0;
    
    while (!this.isBudgetDepleted(budget) && 
           Date.now() - start < budget.timeMs && 
           iterations < MAX_ITERATIONS) {
      
      iterations++;
      console.log(`[Agent] Loop iteration ${iterations}: Deciding next action`);
      const action = await this.decideActionJSON(question, passages, facets, budget);
      console.log(`[Agent] Decided action: ${action.type}${action.query ? ` - Query: "${action.query.substring(0, 30)}..."` : ''}${action.url ? ` - URL: ${action.url}` : ''}`);
      if (this.cfg.debug) this.trace.push({ loop: iterations, action });

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
        console.log(`[Agent] Executing SEARCH action with query: "${action.query}"`);
        metrics.searches++;
        budget.searches--;
        console.log(`[Agent] Search budget remaining: ${budget.searches}`);
        console.log(`[Agent] Performing multi-query search with base query: "${action.query}"`);
        const results = await this.multiQuerySearch(action.query, action.k ?? 12, action.timeRange);
        console.log(`[Agent] Search returned ${results.length} raw results`);
        const filtered = this.filterAndScoreResults(results);
        console.log(`[Agent] After filtering: ${filtered.length} results`);
        // Convert to passages using snippets; FETCH later refines content
        for (const r of filtered) {
          passages.push({
            id: `search_${sha1(r.url)}`,
            text: r.snippet || r.title || r.url,
            url: r.url,
            title: r.title,
            source_domain: eTLDplus1(r.url),
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

      // Freshness gate for time-sensitive queries
      if (isTimeSensitive(question)) {
        const newest = newestDate(passages);
        const staleCutoff = new Date(Date.now() - 30 * 24 * 3600 * 1000);
        if (!newest || newest < staleCutoff) {
          // Force an extra SEARCH if budget allows
          if (budget.searches > 0) {
            const q = `${question} ${new Date().getFullYear()} latest`;
            const results = await this.multiQuerySearch(q, 8, "w");
            const filtered = this.filterAndScoreResults(results);
            for (const r of filtered) {
              passages.push({
                id: `search_${sha1(r.url)}`,
                text: r.snippet || r.title || r.url,
                url: r.url,
                title: r.title,
                source_domain: eTLDplus1(r.url),
              });
            }
            budget.searches--;
            if (this.cfg.debug) this.trace.push({ event: "freshness_boost", added: filtered.length });
          }
        }
      }

      // Exit if all required facets covered & have ≥2 independent domains overall
      if (this.allRequiredFacetsCovered(facets) && this.hasDomainDiversity(passages, 2)) break;

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

  private async decideActionJSON(
    question: string,
    passages: Passage[],
    facets: Facet[],
    budget: Budget
  ): Promise<{ type: "SEARCH" | "FETCH" | "RERANK" | "STOP"; query?: string; k?: number; url?: string; top_n?: number; timeRange?: TimeRange; }> {
    console.log(`[Agent:decideAction] Deciding next action with ${passages.length} passages`);

    const topSources = distinct(passages.map(p => p.url)).slice(0, 3).join(", ");
    const system = `Reply ONLY with minified JSON. Do not include markdown.
{"thought":"...","action":{"type":"SEARCH|FETCH|RERANK|STOP","query":"...","k":12,"url":"https://...","top_n":6,"timeRange":"d|w|m|y"}}`;

    const needFacets = facets.filter(f => f.required && !f.covered).map(f => f.name);
    const user = `
Current time: ${this.currentDateTime}
Question: ${question}

Budget left: {timeMs:${budget.timeMs - (Date.now() - budget.startedMs)}, searches:${budget.searches}, fetches:${budget.fetches}}
Passages: ${passages.length}
Top sources: ${topSources || "none"}
Uncovered required facets: ${needFacets.join(", ") || "none"}

Rules:
- If < 3 quality passages or uncovered facets remain: SEARCH with 2-3 complementary queries (you pick ONE best here; agent will expand).
- If you have promising URLs from search snippets: FETCH one high-authority URL we haven't fetched yet.
- Periodically RERANK to keep top 8–10 diverse, recent passages.
- STOP when all required facets have ≥1 independent source and overall domain diversity ≥ 2.

Respond in JSON only.`;

    const messages = [
      { role: "system", content: system },
      { role: "user", content: user }
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
      const modelConfig = this.getModelConfig(true); // true for reasoning model
      response = await this.openai.chat.completions.create({
        model: this.reasoningModel,
        messages,
        temperature: modelConfig.defaultTemperature,
        [modelConfig.tokenParameter]: modelConfig.max_tokens
      });
    }

    const raw = response.choices[0]?.message?.content?.trim() || "{}";
    console.log(`[Agent:decideAction] Raw AI response: ${raw.substring(0, 100)}${raw.length > 100 ? '...' : ''}`);
    let parsed: any;
    try { parsed = JSON.parse(raw); }
    catch {
      console.log(`[Agent:decideAction] Failed to parse JSON response`);
      // Fallback: if not JSON, do a conservative RERANK → SEARCH approach
      if (this.cfg.debug) this.trace.push({ warn: "non_json_action", raw });
      return passages.length < 6
        ? { type: "SEARCH", query: `${question} latest`, k: 10, timeRange: isTimeSensitive(question) ? "w" : undefined }
        : { type: "RERANK", top_n: 10 };
    }

    const act = parsed?.action || {};
    // Sanitize and add proper type checking
    if (act.type === "SEARCH") {
      // Ensure query is a string, fallback to original question if missing
      const query = typeof act.query === 'string' && act.query.trim() ? act.query : question;
      // Ensure k is a positive number
      const k = typeof act.k === 'number' && act.k > 0 ? act.k : 12;
      // Validate timeRange is one of the allowed values
      const validTimeRanges: TimeRange[] = ['d', 'w', 'm', 'y'];
      const timeRange = act.timeRange && validTimeRanges.includes(act.timeRange) ? act.timeRange : undefined;
      
      return { type: "SEARCH", query: String(query), k: Number(k), timeRange };
    }
    if (act.type === "FETCH" && typeof act.url === "string" && /^https?:\/\//.test(act.url)) {
      return { type: "FETCH", url: act.url };
    }
    if (act.type === "RERANK") {
      // Ensure top_n is a positive number
      const top_n = typeof act.top_n === 'number' && act.top_n > 0 ? act.top_n : 10;
      return { type: "RERANK", top_n: Number(top_n) };
    }
    return { type: "STOP" };
  }

  // --- Retrieval -------------------------------------------------------------

  private async multiQuerySearch(seedQuery: string, k: number, timeRange?: TimeRange) {
    console.log(`[Agent:multiQuerySearch] Expanding query: "${seedQuery}"`);
    // Expand into complementary queries
    const year = new Date().getFullYear();
    const qs = distinct([
      seedQuery,
      `${seedQuery} ${isTimeSensitive(seedQuery) ? year : ""}`.trim(),
      `${seedQuery} latest`,
      `${seedQuery} site:gov`,
      `${seedQuery} site:edu`,
    ]).slice(0, 5);
    console.log(`[Agent:multiQuerySearch] Expanded to ${qs.length} queries: ${qs.join(' | ')}`);

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
    console.log(`[Agent:filterAndScore] Filtering and scoring ${results.length} results`);
    const blocked = [
      /\/tag\//, /\/category\//, /\/author\//, /\/page\//, /\/feed\//,
      /\.docx?$/i, /facebook\.com/, /twitter\.com/, /x\.com/, /instagram\.com/, /youtube\.com\/watch/
    ];
    const cleaned = results.filter(r => !blocked.some(re => re.test((r.url || "").toLowerCase())));
    // Lightweight scoring: authority + snippet length
    console.log(`[Agent:filterAndScore] After filtering: ${cleaned.length} results`);
    return cleaned
      .map(r => {
        const domain = eTLDplus1(r.url);
        const auth = domainAuthorityScore(domain);
        const len = Math.min(1, (r.snippet?.length || 0) / 300);
        const score = 0.75 * auth + 0.25 * len;
        return { ...r, score, domain };
      })
      // Promote diversity: sort by score, then stable
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);
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
    console.log(`[Agent:synthesize] Starting synthesis with ${passages.length} passages`);
    // Keep top 10 passages with domain diversity
    const top = this.selectTopDiverse(passages, 10);
    console.log(`[Agent:synthesize] Selected ${top.length} diverse passages for synthesis`);

    const ctx = top.map(p =>
      `ID:${p.id}
URL:${p.url}
TITLE:${p.title || "Unknown"}
PUBLISHED:${p.published_date || "Unknown"}
CONTENT:
${p.text}
---`
    ).join("\n");

    const system = `You are a precise synthesis agent.
- Current time: ${this.currentDateTime}
- Every non-trivial claim (numbers, names, dates) must be supported by a passage ID and inline citation [Title (Date)](URL).
- Prefer consensus from ≥2 independent domains; if only one source, say "single-source".
- If sources conflict or are stale (>30d old for time-sensitive queries), say so explicitly.
- Keep answer concise, structured, and factual; use bullet points where helpful.`;

    const user = `Question: ${question}

Passages (use IDs for citation mapping):
${ctx}

Write the answer in Markdown. Include inline citations immediately after the sentences they support.`;

    const messages = [
      { role: "system", content: system },
      { role: "user", content: user }
    ];
    
    let response;
    
    if (this.synthesisModelProvider === 'anthropic') {
      // Use Anthropic API
      const modelConfig = this.getModelConfig(false); // false for synthesis model
      response = await callAnthropic(this.synthesisModel, messages, modelConfig);
    } else {
      // Use OpenAI API
      if (!this.openai) {
        throw new Error('OpenAI client not initialized but trying to use OpenAI model');
      }
      const modelConfig = this.getModelConfig(false); // false for synthesis model
      response = await this.openai.chat.completions.create({
        model: this.synthesisModel,
        messages,
        temperature: modelConfig.defaultTemperature,
        [modelConfig.tokenParameter]: modelConfig.max_tokens
      });
    }
    
    let draft = response.choices[0]?.message?.content || "Unable to synthesize.";
    console.log(`[Agent:synthesize] Raw synthesis response length: ${draft.length} chars`);

    // Simple post-pass: ensure any sentence with a number/date/name has at least one '(' → assume citation present; otherwise append a soft uncertainty.
    const needsCite = /(?:\b\d{4}\b|\b\d+(?:\.\d+)?%|\b[A-Z][a-z]+ [A-Z][a-z]+)/;
    draft = draft.split(/\n/).map((line: string) => {
      if (needsCite.test(line) && !/\]\(https?:\/\//.test(line)) {
        return line + " *(source uncertain; verify)*";
      }
      return line;
    }).join("\n");

    return draft;
  }

  private selectTopDiverse(passages: Passage[], n: number): Passage[] {
    // Basic composite scoring: prefer rerank score, recency, authority, and facet coverage assumed via rerank
    const withScore = passages.map(p => {
      const auth = domainAuthorityScore(p.source_domain);
      const recency = p.published_date ? 1 / (1 + Math.max(0, (Date.now() - new Date(p.published_date).getTime()) / (1000*3600*24*30))) : 0.4;
      const base = (p as any).score ?? 0.5;
      return { p, s: 0.55*base + 0.30*auth + 0.15*recency };
    }).sort((a, b) => b.s - a.s).map(x => x.p);

    const pick: Passage[] = [];
    const perDomainCap = 3;
    for (const cand of withScore) {
      const dom = cand.source_domain || eTLDplus1(cand.url) || "unknown";
      const cnt = pick.filter(x => x.source_domain === dom).length;
      if (cnt >= perDomainCap) continue;
      pick.push(cand);
      if (pick.length >= n) break;
    }
    return pick;
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
    return facets.map(f => {
      // Heuristic: a passage "covers" a facet if facet words appear in text/title
      const kw = f.name.toLowerCase().split(/\s+/).filter(x => x.length > 2);
      const hits = passages.filter(p => {
        const blob = `${p.title || ""} ${p.text}`.toLowerCase();
        return kw.every(k => blob.includes(k));
      });
      const domains = distinct(hits.map(h => h.source_domain || eTLDplus1(h.url) || "unknown"));
      return {
        ...f,
        sources: new Set(domains),
        covered: domains.length >= 1 // one source minimum; synthesis will pursue consensus
      };
    });
  }

  private allRequiredFacetsCovered(facets: Facet[]): boolean {
    const requiredTotal = facets.filter(f => f.required).length;
    const requiredCovered = facets.filter(f => f.required && f.covered).length;
    console.log(`[Agent:facetsCovered] Required facets covered: ${requiredCovered}/${requiredTotal}`);
    return facets.every(f => !f.required || f.covered);
  }

  private hasDomainDiversity(passages: Passage[], minDomains: number): boolean {
    console.log(`[Agent:domainDiversity] Checking for minimum ${minDomains} domains`);
    const doms = distinct(passages.map(p => p.source_domain || eTLDplus1(p.url) || "unknown"));
    console.log(`[Agent:domainDiversity] Found ${doms.length} unique domains: ${doms.join(', ').substring(0, 100)}${doms.join(', ').length > 100 ? '...' : ''}`);
    return doms.length >= minDomains;
  }

  // --- Budget & Guardrails ---------------------------------------------------

  private initBudget(): Budget {
    const b = this.cfg.budget ?? {};
    const timeMs   = b.timeMs   ?? 25000;
    const searches = b.searches ?? 4;
    const fetches  = b.fetches  ?? 12;
    const tokens   = b.tokens   ?? 24000;
    return { timeMs, searches, fetches, tokens, startedMs: Date.now() };
  }

  private isBudgetDepleted(b: Budget): boolean {
    if (Date.now() - b.startedMs >= b.timeMs) return true;
    if (b.searches <= 0 && b.fetches <= 0) return true;
    return false;
  }
}

// === Local types used in class ===============================================

type Facet = {
  name: string;
  required: boolean;
  sources: Set<string>;
  covered: boolean;
};

type Budget = {
  timeMs: number;
  searches: number;
  fetches: number;
  tokens: number;
  startedMs: number;
};