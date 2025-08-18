import type { Passage, TimeRange } from "../types/AgentTypes.ts";
import { eTLDplus1 } from "../utils/url-utils.ts";
import { domainAuthorityScore, getTechnicalSourceBonus, getRecencyBonus } from "../utils/scoring-utils.ts";
import { SearchService } from "../../services/search.ts";

function distinct<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

function isTimeSensitive(q: string): boolean {
  const k = ['current', 'today', 'now', 'as of', 'latest', 'recent', 'update', 'price', 'release', 'outage', 'who is', 'who’s', 'breaking', '2025', '2024', 'this week', 'this month', 'this year'];
  const s = q.toLowerCase();
  return k.some(x => s.includes(x));
}

export class SearchOrchestrator {
  private searchService: SearchService;

  constructor(searchService: SearchService) {
    this.searchService = searchService;
  }

  async multiQuerySearch(seedQuery: string, k: number, timeRange?: TimeRange) {
    console.log(`[Agent:multiQuerySearch] Expanding query: "${seedQuery}"`);

    const year = new Date().getFullYear();
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;

    let qs = [
      seedQuery,
      `${seedQuery} ${isTimeSensitive(seedQuery) ? year : ""}`.trim(),
      `${seedQuery} latest`,
      `${seedQuery} site:gov`,
      `${seedQuery} site:edu`,
    ];

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
      qs.push(
        `${seedQuery} information`,
        `${seedQuery} details`,
        `${seedQuery} guide`,
        `${seedQuery} overview`
      );
    }

    qs = distinct(qs).slice(0, 8);
    console.log(`[Agent:multiQuerySearch] Expanded to ${qs.length} diverse queries: ${qs.join(' | ')}`);

    const all: any[] = [];
    for (const q of qs) {
      const res = await this.searchService.search(q, Math.ceil(k / qs.length) * 2, timeRange);
      all.push(...(res.results || []));
      await sleep(60);
    }

    const seen = new Set<string>();
    const uniq: any[] = [];
    for (const r of all) {
      if (!seen.has(r.url)) {
        seen.add(r.url);
        uniq.push(r);
      }
    }
    console.log(`[Agent:multiQuerySearch] After deduplication: ${uniq.length} unique results`);
    return uniq;
  }

  filterAndScoreResults(results: { url: string; title: string; snippet: string }[]) {
    console.log(`[Agent:filterAndScore] Filtering and scoring ${results.length} results`);

    const blocked = [
      /\/tag\//, /\/category\//, /\/author\//, /\/page\/\d+/, /\/feed\//,
      /\.docx?$/i, /\.pdf$/i, /facebook\.com/, /twitter\.com/, /x\.com/, /instagram\.com/, /youtube\.com\/watch/
    ];
    const cleaned = results.filter(r => !blocked.some(re => re.test((r.url || "").toLowerCase())));

    console.log(`[Agent:filterAndScore] After filtering: ${cleaned.length} results`);

    return cleaned
      .map(r => {
        const domain = eTLDplus1(r.url);
        const auth = domainAuthorityScore(domain);
        const snippetLength = r.snippet?.length || 0;
        const len = Math.min(1, snippetLength / 200);
        const technicalBonus = getTechnicalSourceBonus(domain, r.title, r.snippet);
        const recencyBonus = getRecencyBonus(r.url, r.title);
        const score = 0.5 * auth + 0.2 * len + 0.2 * technicalBonus + 0.1 * recencyBonus;
        return { ...r, score, domain, technicalBonus, recencyBonus };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 35);
  }

  retainDiverseSources(filteredResults: any[], existingPassages: Passage[]): any[] {
    const diverseResults: any[] = [];
    const domainCounts: Record<string, number> = {};

    for (const result of filteredResults) {
      const domain = result.domain || eTLDplus1(result.url) || 'unknown';
      const currentCount = domainCounts[domain] || 0;
      if (currentCount < 3) {
        diverseResults.push(result);
        domainCounts[domain] = currentCount + 1;
      }
      if (diverseResults.length >= 25) break;
    }

    if (diverseResults.length < 20) {
      for (const result of filteredResults) {
        const domain = result.domain || eTLDplus1(result.url) || 'unknown';
        if (!domainCounts[domain] && diverseResults.length < 25) {
          diverseResults.push(result);
          domainCounts[domain] = 1;
        }
      }
    }

    console.log(`[Agent:diversity] Selected ${diverseResults.length} results from ${Object.keys(domainCounts).length} domains`);
    return diverseResults;
  }
}


