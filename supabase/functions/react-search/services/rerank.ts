export interface Passage {
  id: string;
  text: string;
  url: string;
  title?: string;
}

export interface RerankResult {
  reranked_passages: Passage[];
  scores: Array<{ id: string; score: number }>;
}

export class RerankService {
  private cohereApiKey?: string;
  private jinaApiKey?: string;

  constructor() {
    this.cohereApiKey = Deno.env.get("COHERE_API_KEY");
    this.jinaApiKey = Deno.env.get("JINA_API_KEY");
  }

  async rerank(
    query: string, 
    passages: Passage[], 
    topN: number = 6
  ): Promise<RerankResult> {
    console.log(`[RERANK] Reranking ${passages.length} passages for top ${topN}`);

    if (passages.length === 0) {
      return { reranked_passages: [], scores: [] };
    }

    // Try Cohere first
    if (this.cohereApiKey) {
      try {
        return await this.rerankWithCohere(query, passages, topN);
      } catch (error) {
        console.error(`[RERANK] Cohere failed:`, error);
      }
    }

    // Fallback to Jina (TODO: verify endpoint and response format)
    if (this.jinaApiKey) {
      try {
        return await this.rerankWithJina(query, passages, topN);
      } catch (error) {
        console.error(`[RERANK] Jina failed:`, error);
      }
    }

    // Fallback to simple keyword matching
    console.log(`[RERANK] Using fallback keyword matching`);
    return this.rerankWithKeywords(query, passages, topN);
  }

  private async rerankWithCohere(
    query: string, 
    passages: Passage[], 
    topN: number
  ): Promise<RerankResult> {
    const response = await fetch("https://api.cohere.ai/v1/rerank", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.cohereApiKey}`,
      },
      body: JSON.stringify({
        query,
        documents: passages.map(p => p.text),
        top_n: topN,
        model: "rerank-english-v3.0",
      }),
    });

    if (!response.ok) {
      throw new Error(`Cohere API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    const rerankedPassages: Passage[] = [];
    const scores: Array<{ id: string; score: number }> = [];

    for (const result of data.results || []) {
      const passage = passages[result.index];
      if (passage) {
        rerankedPassages.push(passage);
        scores.push({
          id: passage.id,
          score: result.relevance_score,
        });
      }
    }

    return { reranked_passages: rerankedPassages, scores };
  }

  // TODO: Verify Jina endpoint and response format
  private async rerankWithJina(
    query: string, 
    passages: Passage[], 
    topN: number
  ): Promise<RerankResult> {
    const response = await fetch("https://api.jina.ai/v1/rerank", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.jinaApiKey}`,
      },
      body: JSON.stringify({
        query,
        documents: passages.map(p => p.text),
        top_k: topN,
      }),
    });

    if (!response.ok) {
      throw new Error(`Jina API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    const rerankedPassages: Passage[] = [];
    const scores: Array<{ id: string; score: number }> = [];

    for (const result of data.results || []) {
      const passage = passages[result.index];
      if (passage) {
        rerankedPassages.push(passage);
        scores.push({
          id: passage.id,
          score: result.score,
        });
      }
    }

    return { reranked_passages: rerankedPassages, scores };
  }

  private rerankWithKeywords(
    query: string, 
    passages: Passage[], 
    topN: number
  ): RerankResult {
    const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 2);
    
    const scoredPassages = passages.map(passage => {
      const text = passage.text.toLowerCase();
      let score = 0;
      
      for (const word of queryWords) {
        const matches = (text.match(new RegExp(word, 'g')) || []).length;
        score += matches;
      }
      
      return { passage, score };
    });

    // Sort by score (descending)
    scoredPassages.sort((a, b) => b.score - a.score);

    const rerankedPassages = scoredPassages.slice(0, topN).map(item => item.passage);
    const scores = scoredPassages.slice(0, topN).map(item => ({
      id: item.passage.id,
      score: item.score,
    }));

    return { reranked_passages: rerankedPassages, scores };
  }
}
