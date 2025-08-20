import { extractPublishedDateFromHtml } from "../utils/html-utils.ts";
import { chunkByTokens, sha1 } from "../utils/text-utils.ts";
import { eTLDplus1 } from "../utils/url-utils.ts";
import type { AgentState } from "./AgentState.ts";

export type PlannedAction = { type: "SEARCH" | "FETCH" | "RERANK" | "STOP"; query?: string; k?: number; url?: string; top_n?: number; timeRange?: 'd'|'w'|'m'|'y' };

export class ActionExecutor {
  private apiCallTracker?: any;

  constructor(private deps: {
    search: (q: string, k: number, timeRange?: 'd'|'w'|'m'|'y') => Promise<any[]>;
    filterAndScore: (results: any[]) => any[];
    retainDiverse: (filtered: any[], existing: any[]) => any[];
    fetchUrl: (url: string) => Promise<{ url: string; text?: string; status?: number; title?: string }>;
    rerank: (question: string, passages: any[], topN: number) => Promise<{ reranked_passages: any[] } | any>;
    debugLog: (...args: any[]) => void;
    apiCallTracker?: any;
  }) {
    this.apiCallTracker = deps.apiCallTracker;
  }

  async execute(state: AgentState, action: PlannedAction): Promise<void> {
    console.log(`⚡ [ActionExecutor] Executing action: ${action.type}${action.query ? ` - "${action.query}"` : ''}${action.url ? ` - ${action.url}` : ''}`);
    
    if (action.type === 'SEARCH' && state.budget.searches > 0 && action.query) {
      console.log(`⚡ [ActionExecutor] Starting SEARCH with query: "${action.query}"`);
      this.deps.debugLog(`[Action] SEARCH: ${action.query}`);
      state.metrics.searches++;
      state.budget.searches--;
      state.searchHistory.push(action.query);
      if (state.searchHistory.length > 10) state.searchHistory.shift();
      const results = await this.deps.search(action.query, action.k ?? 12, action.timeRange);
      console.log(`⚡ [ActionExecutor] SEARCH completed - found ${results.length} results`);
      const filtered = this.deps.filterAndScore(results);
      const processed = this.deps.retainDiverse(filtered, state.passages as any);
      console.log(`⚡ [ActionExecutor] SEARCH processed - ${processed.length} unique results added`);
      for (const r of processed) {
        state.passages.push({
          id: `search_${sha1(String(r.url))}`,
          text: r.snippet || r.title || r.url,
          url: String(r.url),
          title: r.title,
          source_domain: eTLDplus1(String(r.url)),
        } as any);
      }
      return;
    }

    if (action.type === 'FETCH' && state.budget.fetches > 0 && action.url) {
      console.log(`⚡ [ActionExecutor] Starting FETCH for URL: ${action.url}`);
      state.metrics.fetches++;
      state.budget.fetches--;
      this.deps.debugLog(`[Action] FETCH: ${action.url}`);
      
      const startTime = Date.now();
      const ob = await this.deps.fetchUrl(action.url);
      const responseTime = Date.now() - startTime;
      
      // Track the fetch call
      if (this.apiCallTracker) {
        this.apiCallTracker.trackCall({
          purpose: 'Fetch URL',
          model: 'fetch-api',
          provider: 'fetch',
          responseTimeMs: responseTime,
          success: !!(ob?.text && ob?.status && ob.status >= 200 && ob.status < 400),
          error: ob?.status && ob.status >= 400 ? `HTTP ${ob.status}` : undefined,
          metadata: {
            url: action.url,
            status: ob?.status,
            hasText: !!ob?.text
          }
        });
      }
      if (ob?.text && ob.status && ob.status >= 200 && ob.status < 400) {
        const pub = extractPublishedDateFromHtml(ob.text, ob.url);
        const domain = eTLDplus1(ob.url);
        const chunks = chunkByTokens(ob.text, 900, 120).slice(0, 8);
        console.log(`⚡ [ActionExecutor] FETCH completed - extracted ${chunks.length} chunks from ${domain}`);
        chunks.forEach((chunk, i) => {
          state.passages.push({
            id: `fetch_${sha1(ob.url)}_${i}`,
            text: chunk,
            url: ob.url,
            title: ob.title,
            published_date: pub,
            source_domain: domain
          } as any);
        });
      } else {
        console.log(`⚠️ [ActionExecutor] FETCH failed - status: ${ob?.status}, has text: ${!!ob?.text}`);
      }
      return;
    }

    if (action.type === 'RERANK') {
      console.log(`⚡ [ActionExecutor] Starting RERANK with ${state.passages.length} passages`);
      
      const startTime = Date.now();
      const reranked = await this.deps.rerank(state.question, state.passages as any, action.top_n ?? 8);
      const responseTime = Date.now() - startTime;
      
      // Track the rerank call
      if (this.apiCallTracker) {
        this.apiCallTracker.trackCall({
          purpose: 'Rerank Passages',
          model: 'rerank-api',
          provider: 'rerank',
          responseTimeMs: responseTime,
          success: true,
          metadata: {
            inputPassages: state.passages.length,
            topN: action.top_n ?? 8,
            outputPassages: reranked.reranked_passages?.length || state.passages.length
          }
        });
      }
      const chosen: any[] = [];
      const domainCounts = new Map<string, number>();
      for (const p of (reranked.reranked_passages || state.passages)) {
        const dom = (p.source_domain || eTLDplus1(p.url) || 'unknown') as string;
        const cnt = domainCounts.get(dom) || 0;
        if (cnt < 3) {
          domainCounts.set(dom, cnt + 1);
          chosen.push(p);
        }
        if (chosen.length >= (action.top_n ?? 8)) break;
      }
      state.passages.splice(0, state.passages.length, ...chosen as any[]);
      console.log(`⚡ [ActionExecutor] RERANK completed - selected ${chosen.length} passages from ${Object.keys(domainCounts).length} domains`);
      state.metrics.reranks++;
      return;
    }

    console.log(`⚠️ [ActionExecutor] Unknown action type: ${action.type}`);
  }
}