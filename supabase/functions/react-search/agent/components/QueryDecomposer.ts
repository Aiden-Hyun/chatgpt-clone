import type { Facet } from "../types/AgentTypes.ts";

export class QueryDecomposer {
  async decomposeComplexQuery(question: string, facets: Facet[]): Promise<string[]> {
    const isComplex = question.length > 150 || question.includes('vs') || question.includes('compare') || question.includes('and');
    if (!isComplex) {
      return [question];
    }

    const subQueries: string[] = [];
    for (const facet of facets) {
      if (!facet.covered) {
        const facetQuery = this.createFocusedQuery(question, facet.name);
        if (facetQuery && !subQueries.includes(facetQuery)) {
          subQueries.push(facetQuery);
        }
      }
    }
    if (subQueries.length === 0) {
      subQueries.push(...this.createGeneralSubQueries(question));
    }
    return subQueries.slice(0, 5);
  }

  createFocusedQuery(question: string, facetName: string): string {
    const keyTerms = this.extractKeyTerms(question);
    const focusedQuery = `${facetName} ${keyTerms.join(' ')}`;
    return focusedQuery
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s]/g, '')
      .trim()
      .substring(0, 100);
  }

  extractKeyTerms(question: string): string[] {
    const terms = question.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !this.isStopWord(word));
    return [...new Set(terms)].slice(0, 5);
  }

  private isStopWord(word: string): boolean {
    const stopWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'about', 'that', 'this', 'these', 'those', 'are', 'is', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'must', 'shall'];
    return stopWords.includes(word);
  }

  createGeneralSubQueries(question: string): string[] {
    const queries: string[] = [];
    const q = question.toLowerCase();
    if (q.includes('electric') && q.includes('hydrogen')) {
      queries.push('electric vehicle environmental impact');
      queries.push('hydrogen fuel cell economic benefits');
      queries.push('electric vs hydrogen vehicle comparison');
    }
    if (q.includes('policy') && (q.includes('eu') || q.includes('us'))) {
      queries.push('EU electric vehicle policy 2024');
      queries.push('US hydrogen fuel cell incentives');
    }
    if (q.includes('manufacturing')) {
      queries.push('electric vehicle manufacturing process');
      queries.push('hydrogen fuel cell production');
    }
    if (queries.length === 0) {
      const keyTerms = this.extractKeyTerms(question);
      if (keyTerms.length > 0) {
        queries.push(keyTerms.slice(0, 3).join(' '));
      }
    }
    return queries;
  }
}


