import { eTLDplus1 } from "../utils/url-utils.ts";

export class SearchResultProcessor {
  /**
   * Simple filtering and scoring - replaces complex SearchOrchestrator logic
   */
  static filterAndScore(results: any[]): any[] {
    console.log(`[SearchResultProcessor] Simple filtering ${results.length} results`);
    
    // Basic filtering - remove obvious spam/low-quality results
    const blocked = [
      /\/tag\//, /\/category\//, /\/author\//, /\/page\/\d+/, /\/feed\//,
      /\.docx?$/i, /\.pdf$/i, /facebook\.com/, /twitter\.com/, /x\.com/, /instagram\.com/, /youtube\.com\/watch/
    ];
    
    const filtered = results.filter(r => !blocked.some(re => re.test((r.url || "").toLowerCase())));
    
    console.log(`[SearchResultProcessor] After filtering: ${filtered.length} results`);
    return filtered.slice(0, 25); // Limit to 25 results
  }

  /**
   * Simple diversity management - replaces complex SearchOrchestrator logic
   */
  static retainDiverse(filteredResults: any[], existingPassages: any[]): any[] {
    console.log(`[SearchResultProcessor] Simple diversity management for ${filteredResults.length} results`);
    
    const diverseResults: any[] = [];
    const domainCounts: Record<string, number> = {};

    for (const result of filteredResults) {
      const domain = eTLDplus1(result.url) || 'unknown';
      const currentCount = domainCounts[domain] || 0;
      
      if (currentCount < 3) { // Max 3 results per domain
        diverseResults.push(result);
        domainCounts[domain] = currentCount + 1;
      }
      
      if (diverseResults.length >= 20) break; // Limit to 20 diverse results
    }

    console.log(`[SearchResultProcessor] Selected ${diverseResults.length} results from ${Object.keys(domainCounts).length} domains`);
    return diverseResults;
  }
}
