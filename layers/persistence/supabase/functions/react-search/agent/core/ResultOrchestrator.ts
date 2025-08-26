import { ResultBuilder } from "../components/ResultBuilder.ts";
import type { SynthesisEngine } from "../components/SynthesisEngine.ts";
import type { Passage, ReActResult } from "../types/AgentTypes.ts";
import type { APICallTracker } from "../utils/APICallTracker.ts";

export interface ResultOrchestratorConfig {
  debug?: boolean;
}

export interface SynthesisConfig {
  currentDateTime: string;
  provider: string;
  model: string;
  openai: any;
  modelConfig: any;
  aiProviderManager?: any; // NEW: AI Provider Manager
  apiCallTracker?: APICallTracker; // NEW: API Call Tracker
}

/**
 * ResultOrchestrator - Handles result building and synthesis
 * 
 * This class manages:
 * - Final answer synthesis from gathered passages
 * - Result building with citations and metadata
 * - Integration with the synthesis engine
 */
export class ResultOrchestrator {
  private cfg: ResultOrchestratorConfig;

  constructor(cfg: ResultOrchestratorConfig) {
    this.cfg = cfg;
  }

  /**
   * Debug logging helper - only outputs when debug mode is enabled
   */
  private debugLog(...args: any[]): void {
    if (this.cfg?.debug) console.log(...args);
  }

  /**
   * Build final result with citations and metadata
   * 
   * This method:
   * 1. Synthesizes a final answer from the gathered passages
   * 2. Builds the complete result object with citations and metadata
   * 3. Returns the final ReActResult ready for caching and return
   * 
   * @param question - The original user question
   * @param language - The language of the question
   * @param passages - Gathered passages from search and fetch operations
   * @param synthesisEngine - Engine to synthesize the final answer
   * @param synthesisConfig - Configuration for synthesis (model, provider, etc.)
   * @param debugTrace - Debug trace information (optional)
   * @param metrics - Search metrics (searches, fetches, reranks)
   * @returns Complete ReActResult with answer, citations, and metadata
   */
  async buildFinalResult(
    question: string,
    language: string, // NEW: Add language parameter
    passages: Passage[],
    synthesisEngine: SynthesisEngine,
    synthesisConfig: SynthesisConfig,
    debugTrace?: any[],
    metrics?: any
  ): Promise<ReActResult> {
    console.log(`🎨 [ResultOrchestrator] Beginning synthesis with ${passages.length} passages in language: ${language}`);
    // Synthesize final answer from gathered passages
    this.debugLog(`[ResultOrchestrator] Beginning synthesis with ${passages.length} passages in language: ${language}`);
    const finalAnswer = await this.synthesize(question, language, passages, synthesisEngine, synthesisConfig);
    console.log(`📝 [ResultOrchestrator] Synthesis complete. Answer length: ${finalAnswer.length} characters`);
    this.debugLog(`[ResultOrchestrator] Synthesis complete. Answer length: ${finalAnswer.length} characters`);
    
    // Build final result with citations and metadata
    const result: ReActResult = ResultBuilder.build({
      question,
      passages,
      finalAnswer,
      debugTrace,
      metrics,
    });

    console.log(`🏆 [ResultOrchestrator] Final result built with ${result.citations?.length || 0} citations`);
    return result;
  }

  /**
   * Build direct answer result for simple questions that don't need web search
   * 
   * This method:
   * 1. Synthesizes a direct answer using AI knowledge
   * 2. Builds a result object without citations
   * 3. Returns the final ReActResult for direct answers
   * 
   * @param question - The original user question
   * @param language - The language of the question
   * @param synthesisEngine - Engine to synthesize the direct answer
   * @param synthesisConfig - Configuration for synthesis (model, provider, etc.)
   * @param debugTrace - Debug trace information (optional)
   * @param metrics - Search metrics (searches, fetches, reranks)
   * @returns Complete ReActResult with direct answer and no citations
   */
  async buildDirectAnswerResult(
    question: string,
    language: string, // NEW: Add language parameter
    synthesisEngine: SynthesisEngine,
    synthesisConfig: SynthesisConfig,
    debugTrace?: any[],
    metrics?: any
  ): Promise<ReActResult> {
    // Synthesize direct answer using AI knowledge
    this.debugLog(`[ResultOrchestrator] Beginning direct answer synthesis in language: ${language}`);
    const finalAnswer = await this.synthesizeDirectAnswer(question, language, synthesisEngine, synthesisConfig);
    this.debugLog(`[ResultOrchestrator] Direct answer synthesis complete. Answer length: ${finalAnswer.length} characters`);
    
    // Build result without citations
    const result: ReActResult = {
      final_answer_md: finalAnswer,
      citations: [], // No citations for direct answers
      trace: debugTrace || [{ event: "direct_answer" }],
      time_warning: undefined
    };

    return result;
  }

  /**
   * Synthesize final answer from gathered passages using AI
   * 
   * @param question - The original user question
   * @param language - The language of the question
   * @param passages - Gathered passages from search and fetch operations
   * @param synthesisEngine - Engine to synthesize the final answer
   * @param synthesisConfig - Configuration for synthesis
   * @returns Synthesized final answer as a string
   */
  private async synthesize(
    question: string, 
    language: string, 
    passages: Passage[], 
    synthesisEngine: SynthesisEngine,
    synthesisConfig: SynthesisConfig
  ): Promise<string> {
    return synthesisEngine.synthesize({
      currentDateTime: synthesisConfig.currentDateTime,
      question,
      language, // Pass language to synthesis engine
      passages,
      provider: synthesisConfig.provider as any, // Cast to ModelProvider
      model: synthesisConfig.model,
      openai: synthesisConfig.openai,
      modelConfig: synthesisConfig.modelConfig,
      aiProviderManager: synthesisConfig.aiProviderManager, // NEW: Pass AI Provider Manager
      apiCallTracker: synthesisConfig.apiCallTracker // NEW: Pass API Call Tracker
    });
  }

  /**
   * Synthesize direct answer using AI knowledge (no passages needed)
   * 
   * @param question - The original user question
   * @param language - The language of the question
   * @param synthesisEngine - Engine to synthesize the direct answer
   * @param synthesisConfig - Configuration for synthesis
   * @returns Direct answer as a string
   */
  private async synthesizeDirectAnswer(
    question: string, 
    language: string, 
    synthesisEngine: SynthesisEngine,
    synthesisConfig: SynthesisConfig
  ): Promise<string> {
    return synthesisEngine.synthesizeDirectAnswer({
      currentDateTime: synthesisConfig.currentDateTime,
      question,
      language, // Pass language to synthesis engine
      provider: synthesisConfig.provider as any, // Cast to ModelProvider
      model: synthesisConfig.model,
      openai: synthesisConfig.openai,
      modelConfig: synthesisConfig.modelConfig,
      aiProviderManager: synthesisConfig.aiProviderManager, // NEW: Pass AI Provider Manager
      apiCallTracker: synthesisConfig.apiCallTracker // NEW: Pass API Call Tracker
    });
  }
}
