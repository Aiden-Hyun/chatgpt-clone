import { extractPublishedDateFromHtml } from "../utils/html-utils.ts";
import { chunkByTokens, sha1 } from "../utils/text-utils.ts";
import { eTLDplus1 } from "../utils/url-utils.ts";
import type { AgentState } from "./AgentState.ts";

export type PlannedAction = { type: "SEARCH" | "FETCH" | "RERANK" | "STOP"; query?: string; k?: number; url?: string; top_n?: number; timeRange?: 'd'|'w'|'m'|'y' };

export class ActionExecutor {
  constructor(private deps: {
    search: (q: string, k: number, timeRange?: 'd'|'w'|'m'|'y') => Promise<any[]>;
    filterAndScore: (results: any[]) => any[];
    retainDiverse: (filtered: any[], existing: any[]) => any[];
    fetchUrl: (url: string) => Promise<{ url: string; text?: string; status?: number; title?: string }>;
    rerank: (question: string, passages: any[], topN: number) => Promise<{ reranked_passages: any[] } | any>;
    debugLog: (...args: any[]) => void;
  }) {}

  async execute(state: AgentState, action: PlannedAction): Promise<void> {
    if (action.type === 'SEARCH' && state.budget.searches > 0 && action.query) {
      this.deps.debugLog(`[Action] SEARCH: ${action.query}`);
      state.metrics.searches++;
      state.budget.searches--;
      state.searchHistory.push(action.query);
      if (state.searchHistory.length > 10) state.searchHistory.shift();
      const results = await this.deps.search(action.query, action.k ?? 12, action.timeRange);
      const filtered = this.deps.filterAndScore(results);
      const processed = this.deps.retainDiverse(filtered, state.passages as any);
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
      state.metrics.fetches++;
      state.budget.fetches--;
      this.deps.debugLog(`[Action] FETCH: ${action.url}`);
      const ob = await this.deps.fetchUrl(action.url);
      if (ob?.text && ob.status && ob.status >= 200 && ob.status < 400) {
        const pub = extractPublishedDateFromHtml(ob.text, ob.url);
        const domain = eTLDplus1(ob.url);
        const chunks = chunkByTokens(ob.text, 900, 120).slice(0, 8);
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
      }
      return;
    }

    if (action.type === 'RERANK') {
      state.metrics.reranks++;
      const reranked = await this.deps.rerank(state.question, state.passages as any, action.top_n ?? 8);
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
      return;
    }
  }
}


