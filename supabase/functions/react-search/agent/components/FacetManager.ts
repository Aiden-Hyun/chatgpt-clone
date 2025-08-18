import type { Facet, Passage } from "../types/AgentTypes.ts";
import { eTLDplus1 } from "../utils/url-utils.ts";

function distinct<T>(arr: T[]): T[] { return [...new Set(arr)]; }

export class FacetManager {
  updateFacetCoverage(facets: Facet[], passages: Passage[]): Facet[] {
    return facets.map(f => {
      const kw = f.name.toLowerCase().split(/\s+/).filter(x => x.length > 2);
      const hits = passages.filter(p => {
        const blob = `${p.title || ""} ${p.text}`.toLowerCase();
        return kw.every(k => blob.includes(k));
      });
      const domains = distinct(hits.map(h => h.source_domain || eTLDplus1(h.url) || "unknown"));
      const isCovered = domains.length >= 1;
      const hasMultipleSources = domains.length >= 2;
      return { ...f, sources: new Set(domains), covered: isCovered, multipleSources: hasMultipleSources };
    });
  }

  allRequiredFacetsCovered(facets: Facet[]): boolean {
    const requiredTotal = facets.filter(f => f.required).length;
    const requiredCovered = facets.filter(f => f.required && f.covered).length;
    const coverageRatio = requiredCovered / requiredTotal;
    if (coverageRatio < 0.6) return false;
    return facets.every(f => !f.required || f.covered);
  }

  hasDomainDiversity(passages: Passage[], minDomains: number): boolean {
    const doms = distinct(passages.map(p => p.source_domain || eTLDplus1(p.url) || "unknown"));
    return doms.length >= minDomains;
  }
}


