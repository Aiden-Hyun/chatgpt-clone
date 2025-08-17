import OpenAI from "jsr:@openai/openai";
import { config as appConfig } from "../shared/config.ts";
import { CacheManager } from "./cache.ts";
import { FetchService } from "./services/fetch.ts";
import { RerankService } from "./services/rerank.ts";
import { SearchService } from "./services/search.ts";

// Model configurability with env overrides
const REASONING_MODEL = Deno.env.get("OPENAI_REASONING_MODEL") ?? "gpt-4o-mini";
const SYNTH_MODEL = Deno.env.get("OPENAI_SYNTH_MODEL") ?? "gpt-4o";

export interface ReActResult {
  final_answer_md: string;
  citations: { url: string; title?: string; published_date?: string }[];
  trace?: any;
  time_warning?: string;
}

export interface TimeAwareSearchParams {
  query: string;
  time_range?: 'd' | 'w' | 'm' | 'y';
  k?: number;
}

export interface ReActAgentConfig {
  cacheManager: CacheManager;
  searchService: SearchService;
  fetchService: FetchService;
  rerankService: RerankService;
  debug?: boolean;
  model?: string; // Add model parameter
}

export class ReActAgent {
  private openai: OpenAI;
  private cfg: ReActAgentConfig;
  private trace: any[] = [];
  private currentDateTime: string;
  private selectedModel: string; // Store the selected model

  constructor(cfg: ReActAgentConfig) {
    this.cfg = cfg;
    this.openai = new OpenAI({
      apiKey: appConfig.secrets.openai.apiKey(),
    });
    this.currentDateTime = new Date().toISOString();
    
    // Use provided model or fall back to defaults
    this.selectedModel = cfg.model || 'gpt-4o';
    console.log(`[ReActAgent] Initialized with model: ${this.selectedModel}`);
  }

  // Helper method to determine which API to use based on model
  private isAnthropicModel(model: string): boolean {
    return model.startsWith('claude-');
  }

  // Helper method to make API calls with proper routing
  private async makeApiCall(messages: any[], model?: string): Promise<any> {
    const targetModel = model || this.selectedModel;
    
    if (this.isAnthropicModel(targetModel)) {
      console.log(`[ReActAgent] Using Anthropic API with model: ${targetModel}`);
      
      // Filter out system messages and prepare for Anthropic
      const userMessages = messages
        .filter(m => m.role !== 'system')
        .map(({ role, content }) => ({ role, content }));
      
      const systemPrompt = messages.find(m => m.role === 'system')?.content || "You are a helpful assistant.";
      
      const requestBody = {
        model: targetModel,
        max_tokens: 2000,
        system: systemPrompt,
        messages: userMessages,
      };

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": appConfig.secrets.anthropic.apiKey(),
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data?.error?.message || data?.error?.type || 'Anthropic API error');
      }

      // Standardize the response to look like OpenAI's
      return {
        choices: [{
          message: {
            role: 'assistant',
            content: data.content[0].text
          }
        }]
      };
    } else {
      console.log(`[ReActAgent] Using OpenAI API with model: ${targetModel}`);
      const response = await this.openai.chat.completions.create({
        model: targetModel,
        messages: messages,
        temperature: 0.1,
        max_tokens: 2000,
      });
      return response;
    }
  }

  async run(question: string): Promise<ReActResult> {
    this.trace = [];
    const startTime = Date.now();

    console.log("=== New ReAct Query ===", question);
    console.log(`[ReAct] Starting ReAct loop for: ${question}`);
    console.log(`[ReAct] Current system time: ${this.currentDateTime}`);

    // Check cache first
    const cached = await this.cfg.cacheManager.getAnswerCache(question);
    if (cached) {
      console.log(`[ReAct] Found cached result - returning from cache`);
      return cached;
    }

    // Time awareness: Check if query is time-sensitive
    const isTimeSensitive = this.isTimeSensitiveQuery(question);
    console.log(`[ReAct] Time sensitivity check: ${isTimeSensitive ? 'TIME-SENSITIVE' : 'NOT time-sensitive'}`);

    const passages: { id: string; text: string; url: string; title?: string; published_date?: string }[] = [];
    const citations: { url: string; title?: string; published_date?: string }[] = [];
    let loopCount = 0;
    const maxLoops = 4;

    while (loopCount < maxLoops) {
      loopCount++;
      console.log(`[ReAct] === Loop ${loopCount}/${maxLoops} ===`);

      const loopStart = Date.now();
      
      // Step 1: Reason about what to do next
      console.log(`[ReAct] Step 1: Reasoning about next action...`);
      const reasoning = await this.reason(question, passages, loopCount);
      console.log(`[ReAct] Model decided on action: ${reasoning.action.type}`);
      console.log(`[ReAct] Action input:`, reasoning.action);
      console.log(`[ReAct] Reasoning: ${reasoning.reasoning}`);
      this.trace.push({ loop: loopCount, reasoning, timestamp: new Date().toISOString() });

      // Step 2: Execute the action
      const action = reasoning.action;
      let observation: any;

      console.log(`[ReAct] Step 2: Executing action: ${action.type}`);
      switch (action.type) {
        case 'SEARCH':
          console.log(`[ReAct] Executing SEARCH with query: "${action.query}" (k=${action.k})`);
          observation = await this.executeSearch(action.query, action.k);
          console.log(`[ReAct] Search results returned: ${observation.results?.length || 0} results`);
          if (observation.results && observation.results.length > 0) {
            console.log(`[ReAct] Raw search results (titles + URLs):`);
            observation.results.slice(0, 3).forEach((result: any, index: number) => {
              console.log(`[ReAct]   ${index + 1}. ${result.title} - ${result.url}`);
            });
            if (observation.results.length > 3) {
              console.log(`[ReAct]   ... and ${observation.results.length - 3} more results`);
            }
          }
          break;
        case 'FETCH':
          console.log(`[ReAct] Executing FETCH for URL: ${action.url}`);
          observation = await this.executeFetch(action.url);
          if (observation.text) {
            console.log(`[ReAct] Retrieved content (first 200 chars): ${observation.text.substring(0, 200)}...`);
          } else {
            console.log(`[ReAct] No content retrieved from URL`);
          }
          break;
        case 'RERANK':
          console.log(`[ReAct] Executing RERANK with ${passages.length} passages (top_n=${action.top_n})`);
          observation = await this.executeRerank(question, passages, action.top_n);
          console.log(`[ReAct] Reranking completed, top passages selected`);
          break;
        case 'STOP':
          console.log(`[ReAct] Executing STOP - ending ReAct loop`);
          observation = { message: 'Stopping ReAct loop' };
          break;
        default:
          throw new Error(`Unknown action type: ${action.type}`);
      }

      this.trace.push({ 
        loop: loopCount, 
        action, 
        observation: this.summarizeObservation(observation),
        duration: Date.now() - loopStart 
      });

      // Step 3: Process results
      console.log(`[ReAct] Step 3: Processing results from ${action.type} action`);
      if (action.type === 'SEARCH') {
        // Add search results to passages (with domain hygiene)
        const filteredResults = this.filterSearchResults(observation.results || []);
        console.log(`[ReAct] Filtered search results: ${filteredResults.length} results after domain hygiene`);
        for (const result of filteredResults) {
          passages.push({
            id: `search_${this.hashString(result.url)}`,
            text: result.snippet,
            url: result.url,
            title: result.title,
          });
        }
        console.log(`[ReAct] Added ${filteredResults.length} search snippets to passages. Total passages: ${passages.length}`);
      } else if (action.type === 'FETCH') {
        // Add fetched content to passages
        if (observation.text) {
          const chunks = this.chunkText(observation.text, 1000);
          console.log(`[ReAct] Chunked fetched content into ${chunks.length} chunks`);
          
          // Extract published date from the content
          const publishedDate = this.extractPublishedDate(observation.text, observation.url);
          console.log(`[ReAct] Extracted published date: ${publishedDate || 'Not found'}`);
          
          chunks.forEach((chunk, index) => {
            passages.push({
              id: `fetch_${this.hashString(observation.url)}_${index}`,
              text: chunk,
              url: observation.url,
              title: observation.title,
              published_date: publishedDate,
            });
          });
          console.log(`[ReAct] Added ${chunks.length} content chunks to passages. Total passages: ${passages.length}`);
        } else {
          console.log(`[ReAct] No text content to add from FETCH`);
        }
      } else if (action.type === 'RERANK') {
        // Update passage order based on reranking
        const rerankedPassages = observation.reranked_passages || [];
        console.log(`[ReAct] Reranking returned ${rerankedPassages.length} passages`);
        // Keep only the top passages
        passages.splice(0, passages.length, ...rerankedPassages);
        console.log(`[ReAct] Updated passages with reranked results. Total passages: ${passages.length}`);
      } else if (action.type === 'STOP') {
        console.log(`[ReAct] STOP action - breaking out of loop`);
        break;
      }

      // Step 4: Check if we have sufficient evidence
      console.log(`[ReAct] Step 4: Checking if sufficient evidence (${passages.length} passages)`);
      if (this.hasSufficientEvidence(question, passages)) {
        console.log(`[ReAct] Sufficient evidence found, stopping loop`);
        break;
      } else {
        console.log(`[ReAct] Insufficient evidence, continuing to next loop`);
      }
    }

    // Final synthesis
    console.log(`[ReAct] === Starting Final Synthesis ===`);
    console.log(`[ReAct] Synthesizing answer from ${passages.length} passages`);
    const finalAnswer = await this.synthesize(question, passages);
    
    // Extract citations from top passages (grouped by URL)
    console.log(`[ReAct] Extracting citations from top ${Math.min(6, passages.length)} passages`);
    const topPassages = passages.slice(0, 6);
    const uniqueUrls = new Set<string>();
    for (const passage of topPassages) {
      if (passage.url && !uniqueUrls.has(passage.url)) {
        uniqueUrls.add(passage.url);
        citations.push({
          url: passage.url,
          title: passage.title,
          published_date: passage.published_date,
        });
      }
    }
    console.log(`[ReAct] Found ${citations.length} unique citations`);

    // Check content freshness for time-sensitive queries
    const timeWarning = this.checkContentFreshness(passages);
    if (timeWarning) {
      console.log(`[ReAct] Time warning: ${timeWarning}`);
    }

    const result: ReActResult = {
      final_answer_md: finalAnswer,
      citations: citations.slice(0, 4), // Limit to top 4 citations
      trace: this.cfg.debug ? this.trace : undefined,
      time_warning: timeWarning,
    };

    // Cache the result
    console.log(`[ReAct] Caching result for future queries`);
    await this.cfg.cacheManager.setAnswerCache(question, result, 24 * 60 * 60); // 24 hours

    console.log("=== Final Answer ===", finalAnswer);
    console.log(`[ReAct] Completed in ${Date.now() - startTime}ms`);
    console.log(`[ReAct] Final result: ${result.citations.length} citations, ${finalAnswer.length} chars`);
    return result;
  }

  private async reason(
    question: string, 
    passages: { id: string; text: string; url: string; title?: string; published_date?: string }[], 
    loopCount: number
  ): Promise<{ action: any; reasoning: string }> {
    const systemPrompt = `You are a ReAct agent that helps answer questions by searching the web and analyzing information.

TIME AWARENESS: You always know the current system time: ${this.currentDateTime}
- If the user asks for "current," "today," "now," or "as of," use the system date
- For time-sensitive queries, expand search queries with freshness indicators like "2025," "latest," or "current"
- Never add outdated years/months unless the user explicitly requests them

Available actions:
- SEARCH(query: string, k?: number): Search for information
- FETCH(url: string): Fetch content from a URL
- RERANK(query: string, passages: Array<{id,text,meta}>, top_n?: number): Rerank passages by relevance
- STOP(): Stop the loop and synthesize final answer

Current state:
- Question: ${question}
- Current time: ${this.currentDateTime}
- Loop: ${loopCount}/4
- Passages collected: ${passages.length}
- Top passages: ${passages.slice(0, 3).map(p => p.id).join(', ')}

Rules:
1. If you have insufficient evidence (< 3 relevant passages), SEARCH with a reformulated query
2. For top 8-12 URLs, FETCH their content
3. RERANK passages to find the most relevant ones
4. STOP when you have 2+ independent sources that answer the question
5. Keep queries focused and specific
6. For time-sensitive queries, include current year and freshness keywords
7. Use exact format: "Thought: <reasoning>\nAction: <ACTION_TYPE>(<arguments>)"`;

    const userPrompt = `What should I do next to answer: "${question}"?

Current passages: ${passages.length}
Top passage sources: ${passages.slice(0, 3).map(p => p.url).join(', ')}

Respond with:
Thought: <your reasoning>
Action: <ACTION_TYPE>(<arguments>)`;

    const response = await this.makeApiCall([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ], this.selectedModel);

    const content = response.choices[0]?.message?.content || '';
    const action = this.parseAction(content);
    const reasoning = this.extractThought(content);

    return { action, reasoning };
  }

  private async executeSearch(query: string, k: number = 12, timeRange?: 'd' | 'w' | 'm' | 'y'): Promise<any> {
    console.log(`[ReAct] executeSearch: Query="${query}", k=${k}, timeRange=${timeRange}`);
    
    // Enhance query with time context if needed
    const enhancedParams = this.enhanceQueryWithTimeContext(query);
    const searchQuery = enhancedParams.query;
    const searchTimeRange = timeRange || enhancedParams.time_range;
    
    console.log(`[ReAct] executeSearch: Enhanced query="${searchQuery}", timeRange=${searchTimeRange}`);
    
    const result = await this.cfg.searchService.search(searchQuery, k, searchTimeRange);
    console.log(`[ReAct] executeSearch: Returned ${result.results?.length || 0} results`);
    return result;
  }

  private async executeFetch(url: string): Promise<any> {
    console.log(`[ReAct] executeFetch: URL="${url}"`);
    const result = await this.cfg.fetchService.fetch(url);
    console.log(`[ReAct] executeFetch: Status=${result.status}, Title="${result.title}", Text length=${result.text?.length || 0}`);
    return result;
  }

  private async executeRerank(
    query: string, 
    passages: { id: string; text: string; url: string; title?: string; published_date?: string }[], 
    top_n: number = 6
  ): Promise<any> {
    console.log(`[ReAct] executeRerank: Query="${query}", ${passages.length} passages, top_n=${top_n}`);
    const result = await this.cfg.rerankService.rerank(query, passages, top_n);
    console.log(`[ReAct] executeRerank: Returned ${result.reranked_passages?.length || 0} reranked passages`);
    return result;
  }

  private async synthesize(
    question: string, 
    passages: { id: string; text: string; url: string; title?: string; published_date?: string }[]
  ): Promise<string> {
    const topPassages = passages.slice(0, 6);
    const context = topPassages.map(p => 
      `Source: ${p.url}\nTitle: ${p.title || 'Unknown'}\nPublished: ${p.published_date || 'Unknown'}\nContent: ${p.text}\n---`
    ).join('\n');

    const systemPrompt = `You are a helpful assistant that synthesizes information from multiple sources to answer questions.

TIME AWARENESS: Current system time is ${this.currentDateTime}

Guidelines:
- Provide a concise, one-screen summary
- Use bullet points or short paragraphs
- Cite sources inline at the end of relevant sentences using [Source Name](URL) format
- Include published dates in citations when available: [Source Name (Date)](URL)
- If information is conflicting, present both views with sources
- If creating a table, use GitHub-flavored Markdown
- Be factual and avoid speculation
- Keep the answer focused and well-structured
- For time-sensitive queries, emphasize the freshness of information
- If sources are outdated, mention this in the answer

Format citations as: [Source Name (Date)](URL)`;

    const userPrompt = `Question: ${question}
Current time: ${this.currentDateTime}

Sources:
${context}

Please provide a comprehensive answer with inline citations. Include published dates when available.`;

    const response = await this.makeApiCall([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ], this.selectedModel);

    return response.choices[0]?.message?.content || 'Unable to synthesize answer.';
  }

  private hasSufficientEvidence(question: string, passages: { id: string; text: string; url: string; title?: string; published_date?: string }[]): boolean {
    if (passages.length < 3) {
      console.log(`[ReAct] Evidence check: Insufficient passages (${passages.length} < 3)`);
      return false;
    }
    
    // Check if we have at least 2 different sources
    const uniqueUrls = new Set(passages.map(p => p.url));
    const hasMultipleSources = uniqueUrls.size >= 2;
    
    // Check if we have enough content (at least 3 passages with substantial text)
    const substantialPassages = passages.filter(p => p.text.length > 100);
    const hasEnoughContent = substantialPassages.length >= 3;
    
    console.log(`[ReAct] Evidence check: ${passages.length} passages, ${uniqueUrls.size} sources, ${substantialPassages.length} substantial passages`);
    console.log(`[ReAct] Evidence check: Multiple sources = ${hasMultipleSources}, Enough content = ${hasEnoughContent}`);
    
    return hasMultipleSources && hasEnoughContent;
  }

  private chunkText(text: string, maxChars: number): string[] {
    console.log(`[ReAct] chunkText: Input text length=${text.length}, maxChars=${maxChars}`);
    const words = text.split(' ');
    const chunks: string[] = [];
    let currentChunk: string[] = [];
    let currentLength = 0;

    for (const word of words) {
      const wordLength = word.length + 1; // +1 for space
      if (currentLength + wordLength > maxChars) {
        if (currentChunk.length > 0) {
          chunks.push(currentChunk.join(' '));
          currentChunk = [word];
          currentLength = wordLength;
        }
      } else {
        currentChunk.push(word);
        currentLength += wordLength;
      }
    }

    if (currentChunk.length > 0) {
      chunks.push(currentChunk.join(' '));
    }

    console.log(`[ReAct] chunkText: Created ${chunks.length} chunks`);
    return chunks;
  }

  private parseAction(content: string): any {
    console.log(`[ReAct] parseAction: Parsing content: "${content.substring(0, 200)}..."`);
    const actionMatch = content.match(/Action:\s*(\w+)\(([^)]*)\)/);
    if (!actionMatch) {
      console.warn(`[ReAct] Could not parse action from: ${content}, using fallback`);
      return { type: 'SEARCH', query: 'site:gov latest ' + Date.now(), k: 8 };
    }

    const actionType = actionMatch[1];
    const args = actionMatch[2];

    try {
      let result: any;
      switch (actionType) {
        case 'SEARCH':
          const searchMatch = args.match(/"([^"]+)"/);
          const kMatch = args.match(/k\s*:\s*(\d+)/);
          result = {
            type: 'SEARCH',
            query: searchMatch ? searchMatch[1] : args.trim(),
            k: kMatch ? parseInt(kMatch[1]) : 12,
          };
          break;
        case 'FETCH':
          const urlMatch = args.match(/"([^"]+)"/);
          const url = urlMatch ? urlMatch[1] : args.trim();
          if (!url.startsWith('http')) {
            throw new Error(`Invalid URL: ${url}`);
          }
          result = {
            type: 'FETCH',
            url: url,
          };
          break;
        case 'RERANK':
          const rerankMatch = args.match(/top_n\s*:\s*(\d+)/);
          result = {
            type: 'RERANK',
            top_n: rerankMatch ? parseInt(rerankMatch[1]) : 6,
          };
          break;
        case 'STOP':
          result = { type: 'STOP' };
          break;
        default:
          console.warn(`[ReAct] Unknown action type: ${actionType}, using SEARCH fallback`);
          result = { type: 'SEARCH', query: 'site:gov latest ' + Date.now(), k: 8 };
      }
      
      console.log(`[ReAct] parseAction: Successfully parsed action: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      console.warn(`[ReAct] Error parsing action: ${error.message}, using SEARCH fallback`);
      return { type: 'SEARCH', query: 'site:gov latest ' + Date.now(), k: 8 };
    }
  }

  private extractThought(content: string): string {
    const thoughtMatch = content.match(/Thought:\s*(.+?)(?=\n|$)/);
    return thoughtMatch ? thoughtMatch[1].trim() : 'No reasoning provided';
  }

  private summarizeObservation(observation: any): any {
    if (typeof observation === 'string') return observation;
    if (observation.results) {
      return { 
        results_count: observation.results.length,
        first_result: observation.results[0]?.title || 'No title'
      };
    }
    if (observation.text) {
      return { 
        text_length: observation.text.length,
        title: observation.title,
        url: observation.url
      };
    }
    return observation;
  }

  private filterSearchResults(results: { url: string; title: string; snippet: string }[]): { url: string; title: string; snippet: string }[] {
    console.log(`[ReAct] filterSearchResults: Input ${results.length} results`);
    const blockedPatterns = [
      /\/tag\//,
      /\/category\//,
      /\/author\//,
      /\/page\//,
      /\/feed\//,
      /\.doc$/,
      /\.docx$/,
      /youtube\.com\/watch/,
      /facebook\.com/,
      /twitter\.com/,
      /instagram\.com/,
    ];

    const filtered = results.filter(result => {
      const url = result.url.toLowerCase();
      const isBlocked = blockedPatterns.some(pattern => pattern.test(url));
      if (isBlocked) {
        console.log(`[ReAct] filterSearchResults: Blocked URL "${url}"`);
      }
      return !isBlocked;
    });
    
    console.log(`[ReAct] filterSearchResults: Output ${filtered.length} results (filtered out ${results.length - filtered.length})`);
    return filtered;
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  // Time Awareness Helper Methods
  private isTimeSensitiveQuery(question: string): boolean {
    const timeKeywords = [
      'current', 'today', 'now', 'as of', 'latest', 'recent', 'new', 'updated',
      'this week', 'this month', 'this year', '2025', '2024'
    ];
    const lowerQuestion = question.toLowerCase();
    return timeKeywords.some(keyword => lowerQuestion.includes(keyword));
  }

  private enhanceQueryWithTimeContext(question: string): TimeAwareSearchParams {
    const isTimeSensitive = this.isTimeSensitiveQuery(question);
    const currentYear = new Date().getFullYear();
    
    let enhancedQuery = question;
    let timeRange: 'd' | 'w' | 'm' | 'y' | undefined = undefined;

    if (isTimeSensitive) {
      // Add current year if not present
      if (!question.includes(currentYear.toString())) {
        enhancedQuery += ` ${currentYear}`;
      }
      
      // Add freshness indicators
      if (question.toLowerCase().includes('current') || question.toLowerCase().includes('today')) {
        enhancedQuery += ' latest';
        timeRange = 'd'; // daily
      } else if (question.toLowerCase().includes('this week') || question.toLowerCase().includes('recent')) {
        timeRange = 'w'; // weekly
      } else if (question.toLowerCase().includes('this month')) {
        timeRange = 'm'; // monthly
      } else {
        timeRange = 'w'; // default to weekly for time-sensitive queries
      }
    }

    console.log(`[ReAct] Time awareness: Query="${question}" -> Enhanced="${enhancedQuery}", timeRange=${timeRange}`);
    
    return {
      query: enhancedQuery,
      time_range: timeRange,
      k: 12
    };
  }

  private extractPublishedDate(content: string, url: string): string | undefined {
    // Try to extract date from content using common patterns
    const datePatterns = [
      /(\d{1,2}\/\d{1,2}\/\d{4})/g, // MM/DD/YYYY
      /(\d{4}-\d{2}-\d{2})/g, // YYYY-MM-DD
      /(\w+ \d{1,2},? \d{4})/g, // Month DD, YYYY
      /(\d{1,2} \w+ \d{4})/g, // DD Month YYYY
    ];

    for (const pattern of datePatterns) {
      const matches = content.match(pattern);
      if (matches && matches.length > 0) {
        console.log(`[ReAct] Extracted published date: ${matches[0]} from ${url}`);
        return matches[0];
      }
    }

    // Try to extract from URL if it contains date patterns
    const urlDatePatterns = [
      /\/(\d{4})\/(\d{2})\/(\d{2})\//, // /YYYY/MM/DD/
      /\/(\d{4})-(\d{2})-(\d{2})\//, // /YYYY-MM-DD/
    ];

    for (const pattern of urlDatePatterns) {
      const match = url.match(pattern);
      if (match) {
        const date = `${match[1]}-${match[2]}-${match[3]}`;
        console.log(`[ReAct] Extracted published date from URL: ${date}`);
        return date;
      }
    }

    return undefined;
  }

  private checkContentFreshness(passages: { id: string; text: string; url: string; title?: string; published_date?: string }[]): string | undefined {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    let oldestDate: Date | null = null;
    let hasRecentContent = false;

    for (const passage of passages) {
      if (passage.published_date) {
        try {
          const passageDate = new Date(passage.published_date);
          if (!oldestDate || passageDate < oldestDate) {
            oldestDate = passageDate;
          }
          if (passageDate >= thirtyDaysAgo) {
            hasRecentContent = true;
          }
        } catch (e) {
          // Invalid date format, skip
        }
      }
    }

    if (!hasRecentContent && oldestDate) {
      const daysOld = Math.floor((Date.now() - oldestDate.getTime()) / (1000 * 60 * 60 * 24));
      return `⚠️ No confirmation from the last 30 days; information may be outdated (oldest source: ${daysOld} days old).`;
    }

    return undefined;
  }
}