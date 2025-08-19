import type { FacetManager } from "../components/FacetManager.ts";
import type { AIProviderManager } from "../services/AIProviderManager.ts";
import type { AgentState, Budget, QuestionAnalysis, QuestionType } from "../types/AgentTypes.ts";
import type { APICallTracker } from "../utils/APICallTracker.ts";
import { nowISO } from "../utils/time-utils.ts";

export interface StateInitializerConfig {
  debug?: boolean;
  apiCallTracker?: APICallTracker;
}

export interface ModelInfo {
  reasoningModel: string;
  synthesisModel: string;
  reasoningProvider: string;
  synthesisProvider: string;
  openai: any | null; // Add OpenAI client
  modelConfig: any; // Add model configuration
  aiProviderManager: AIProviderManager; // NEW: AI Provider Manager
}

/**
 * StateInitializer - Handles initialization of agent state
 * 
 * This class is responsible for:
 * - Creating the initial search state
 * - Analyzing question type (direct answer vs search needed)
 * - Extracting question facets (sub-questions) for complex questions
 * - Setting up model configuration
 * - Initializing metrics and tracking
 */
export class StateInitializer {
  private cfg: StateInitializerConfig;
  private currentDateTime: string;
  private apiCallTracker?: APICallTracker;

  constructor(cfg: StateInitializerConfig) {
    this.cfg = cfg;
    this.currentDateTime = nowISO();
    this.apiCallTracker = cfg.apiCallTracker;
  }

  /**
   * Debug logging helper - only outputs when debug mode is enabled
   */
  private debugLog(...args: any[]): void {
    if (this.cfg?.debug) console.log(...args);
  }

  /**
   * Analyze question type to determine the appropriate processing path
   * 
   * @param question - The user's question to analyze
   * @param modelInfo - Model configuration information
   * @returns Question analysis with type and reasoning
   */
  private async analyzeQuestion(question: string, modelInfo: ModelInfo): Promise<QuestionAnalysis> {
    this.debugLog(`[StateInitializer] Analyzing question type: "${question.substring(0, 50)}${question.length > 50 ? '...' : ''}"`);
    
    const system = `Current time: ${this.currentDateTime}

Analyze this question and respond appropriately:

1. If the question can be answered using your knowledge (dates, math, definitions, basic facts, logical reasoning):
   - Return: {"type":"DIRECT_ANSWER","reasoning":"...","answer":"[provide a complete, well-formatted answer in Markdown format]"}

2. If the question needs current/real-time data (weather, prices, scores, latest info):
   - Return: {"type":"MINIMAL_SEARCH","reasoning":"...","facets":[{"name":"Current status","required":true}]}

3. If the question requires research, comparison, analysis, or multiple sources:
   - Return: {"type":"FULL_RESEARCH","reasoning":"...","facets":[{"name":"Current status","required":true},{"name":"Historical context","required":true}]}

For DIRECT_ANSWER questions:
- Provide a complete, well-formatted answer in the "answer" field
- Use Markdown formatting (bullet points, bold text, etc.) where appropriate
- Include any relevant calculations or explanations
- Make the answer comprehensive and helpful

For MINIMAL_SEARCH and FULL_RESEARCH questions, provide 2-5 required facets (sub-questions) in the "facets" field.
Each facet should have: {"name":"descriptive name","required":true}`;

    const messages = [
      { role: "system", content: system },
      { role: "user", content: `Please analyze this question and respond in JSON format: ${question}` }
    ];

    console.log(` [StateInitializer] API Call #1 - Question Analysis:`);
    console.log(` [StateInitializer] System prompt: ${system}`);
    console.log(` [StateInitializer] User message: "${question}"`);
    console.log(` [StateInitializer] Model: ${modelInfo.reasoningModel} (${modelInfo.reasoningProvider})`);

    const startTime = Date.now();
    
    // Use AI Provider Manager instead of direct provider calls
    const response = await modelInfo.aiProviderManager.call(
      modelInfo.reasoningProvider as 'openai' | 'anthropic',
      modelInfo.reasoningModel,
      messages,
      {
        ...modelInfo.modelConfig,
        // force structured output so content isn't empty
        response_format: { type: 'json_object' },
        // give enough budget for JSON; OpenAIProvider will map this to the right param name
        max_tokens: Math.max(256, modelInfo.modelConfig?.max_tokens ?? 0),
      }
    );
    
    const apiTime = Date.now() - startTime;
    console.log(` [StateInitializer] API response received in ${apiTime}ms`);
    console.log(` [StateInitializer] Raw response: ${JSON.stringify(response.choices[0]?.message?.content || '{}')}`);
    
    // Track API call
    if (this.apiCallTracker) {
      this.apiCallTracker.trackCall({
        purpose: "Question Analysis + Answer Generation",
        model: modelInfo.reasoningModel,
        provider: modelInfo.reasoningProvider,
        responseTimeMs: apiTime,
        success: true,
        metadata: {
          questionLength: question.length,
          systemPromptLength: system.length,
          userPromptLength: question.length
        }
      });
    }

    try {
      const rawResponse = response.choices[0]?.message?.content ?? "{}";
      console.log(` [StateInitializer] Raw response content: "${rawResponse}"`);
      console.log(` [StateInitializer] Raw response length: ${rawResponse.length}`);
      console.log(` [StateInitializer] Raw response type: ${typeof rawResponse}`);
      
      // Check if response is empty
      if (!rawResponse || rawResponse.trim() === '') {
        console.log(`⚠️ [StateInitializer] Empty response from AI - this is the root cause!`);
        throw new Error('Empty response from AI model');
      }
      
      const obj = JSON.parse(rawResponse);
      console.log(` [StateInitializer] Successfully parsed JSON: ${JSON.stringify(obj)}`);
      
      const analysis: QuestionAnalysis = {
        type: obj.type as QuestionType || 'FULL_RESEARCH',
        reasoning: obj.reasoning || 'Default reasoning',
        directAnswer: obj.answer || obj.directAnswer, // Support both "answer" and "directAnswer" fields
        facets: obj.facets?.map((f: any) => ({
          name: String(f.name || "").slice(0, 120),
          required: !!(f.required ?? true),
          sources: new Set<string>(),
          covered: false
        })) || []
      };
      
      console.log(` [StateInitializer] Question classified as: ${analysis.type}`);
      console.log(` [StateInitializer] Reasoning: ${analysis.reasoning}`);
      if (analysis.directAnswer) {
        console.log(` [StateInitializer] Direct answer generated: ${analysis.directAnswer.substring(0, 100)}...`);
      }
      if (analysis.facets && analysis.facets.length > 0) {
        console.log(` [StateInitializer] Facets extracted: ${analysis.facets.map(f => f.name).join(', ')}`);
      }
      
      return analysis;
    } catch (error) {
      console.log(`⚠️ [StateInitializer] Failed to parse question analysis, defaulting to FULL_RESEARCH: ${error}`);
      console.log(`⚠️ [StateInitializer] Raw response that failed to parse: "${response.choices[0]?.message?.content}"`);
      return { type: 'FULL_RESEARCH', reasoning: 'Failed to parse analysis, defaulting to full research' };
    }
  }

  /**
   * Initialize state for the search session
   * 
   * This method creates the complete initial state for a search session, including:
   * - Question and budget information
   * - Model configuration
   * - Metrics tracking
   * - Question type analysis and appropriate processing path
   * 
   * @param question - The user's question to answer
   * @param budget - Budget constraints for this search session
   * @param startMs - Start time in milliseconds
   * @param facetManager - Facet manager to extract question facets (if needed)
   * @param modelInfo - Model configuration information
   * @returns Complete agent state ready for search execution
   */
  async initializeState(
    question: string,
    budget: Budget,
    startMs: number,
    facetManager: FacetManager,
    modelInfo: ModelInfo
  ): Promise<AgentState> {
    this.debugLog(`[StateInitializer] Initializing state for question: "${question.substring(0, 50)}${question.length > 50 ? '...' : ''}"`);

    // Initialize basic state for the search session
    const state: AgentState = {
      question,
      passages: [],
      facets: [],
      budget,
      startMs,
      currentDateTime: this.currentDateTime,
      metrics: { searches: 0, fetches: 0, reranks: 0 },
      models: {
        reasoningModel: modelInfo.reasoningModel,
        synthesisModel: modelInfo.synthesisModel,
        reasoningProvider: modelInfo.reasoningProvider as 'openai' | 'anthropic',
        synthesisProvider: modelInfo.synthesisProvider as 'openai' | 'anthropic',
      },
      searchHistory: [],
      decomposedQueriesForSession: [],
      usedDecomposedQueries: new Set(),
      previousPassageCount: 0,
      previousDomainCount: 0,
    };

    // Analyze question type to determine processing path
    this.debugLog(`[StateInitializer] Analyzing question type...`);
    const analysis = await this.analyzeQuestion(question, modelInfo);
    state.questionType = analysis.type;
    state.directAnswer = analysis.directAnswer;

    console.log(`🚀 [StateInitializer] Question classified as: ${analysis.type}`);
    console.log(`🚀 [StateInitializer] Reasoning: ${analysis.reasoning}`);

    // Handle different question types
    if (analysis.type === 'DIRECT_ANSWER') {
      this.debugLog(`[StateInitializer] Direct answer question - no facets needed`);
      console.log(`🚀 [StateInitializer] Direct answer question detected - using pre-generated answer`);
      // No facets needed for direct answers
      state.facets = [];
    } else {
      // Use facets already extracted in the analysis
      this.debugLog(`[StateInitializer] Using facets from analysis for ${analysis.type} question`);
      console.log(`🚀 [StateInitializer] Using ${analysis.facets?.length || 0} facets from analysis`);
      state.facets = analysis.facets || [];
      this.debugLog(`[StateInitializer] Facets: ${state.facets.map(f => f.name).join(', ')}`);
      console.log(`🚀 [StateInitializer] Facets: ${state.facets.map(f => f.name).join(', ')}`);
    }

    return state;
  }

  /**
   * Get current date time
   * 
   * @returns Current date time in ISO format
   */
  getCurrentDateTime(): string {
    return this.currentDateTime;
  }
}
