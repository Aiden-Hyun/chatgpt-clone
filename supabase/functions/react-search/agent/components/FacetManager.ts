import type { Facet, Passage } from "../types/AgentTypes.ts";
import { eTLDplus1 } from "../utils/url-utils.ts";

function distinct<T>(arr: T[]): T[] { return [...new Set(arr)]; }

export class FacetManager {
  updateFacetCoverage(facets: Facet[], passages: Passage[]): Facet[] {
    return facets.map(f => {
      const hits = passages.filter(p => this.passageMatchesFacet(p, f));
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

  passageMatchesFacet(passage: Passage, facet: Facet): boolean {
    const text = `${passage.title || ""} ${passage.text}`.toLowerCase();
    const facetName = facet.name.toLowerCase();
    const keywords = this.getFlexibleKeywords(facetName);
    const matchScore = this.calculateFacetMatchScore(text, keywords);
    return matchScore >= 0.3;
  }

  private getFlexibleKeywords(facetName: string): string[] {
    const keywords: string[] = [];
    const words = facetName.split(/\s+/).filter(word => word.length > 2 && !this.isStopWord(word));
    keywords.push(...words);
    words.forEach(word => {
      const stemmed = this.stemWord(word);
      if (stemmed !== word) keywords.push(stemmed);
    });
    const synonyms = this.getSynonyms(words);
    keywords.push(...synonyms);
    const companyVariations = this.getCompanyVariations(words);
    keywords.push(...companyVariations);
    return [...new Set(keywords)];
  }

  private calculateFacetMatchScore(text: string, keywords: string[]): number {
    if (keywords.length === 0) return 0;
    let matchedKeywords = 0;
    let totalScore = 0;
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        matchedKeywords++;
        totalScore += Math.min(1, keyword.length / 5);
      }
    }
    const keywordMatchRatio = matchedKeywords / keywords.length;
    const weightedScore = (keywordMatchRatio * 0.7) + (totalScore / keywords.length * 0.3);
    return weightedScore;
  }

  private stemWord(word: string): string {
    const suffixes = ['ing', 'ed', 'er', 'est', 'ly', 's', 'es'];
    for (const suffix of suffixes) {
      if (word.endsWith(suffix) && word.length > suffix.length + 2) {
        return word.slice(0, -suffix.length);
      }
    }
    return word;
  }

  private isStopWord(word: string): boolean {
    const stopWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'about', 'that', 'this', 'these', 'those', 'are', 'is', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'must', 'shall'];
    return stopWords.includes(word);
  }

  private getSynonyms(words: string[]): string[] {
    const synonyms: string[] = [];
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
}


