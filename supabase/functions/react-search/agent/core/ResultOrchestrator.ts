import { ResultBuilder } from "../components/ResultBuilder.ts";
import type { SynthesisEngine } from "../components/SynthesisEngine.ts";
import type { Passage, ReActResult } from "../types/AgentTypes.ts";

export interface ResultOrchestratorConfig {
  debug?: boolean;
}

export interface SynthesisConfig {
  currentDateTime: string;
  provider: string;
  model: string;
  openai: any;
  modelConfig: any;
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
   * @param passages - Gathered passages from search and fetch operations
   * @param synthesisEngine - Engine to synthesize the final answer
   * @param synthesisConfig - Configuration for synthesis (model, provider, etc.)
   * @param debugTrace - Debug trace information (optional)
   * @param metrics - Search metrics (searches, fetches, reranks)
   * @returns Complete ReActResult with answer, citations, and metadata
   */
  async buildFinalResult(
    question: string,
    passages: Passage[],
    synthesisEngine: SynthesisEngine,
    synthesisConfig: SynthesisConfig,
    debugTrace?: any[],
    metrics?: any
  ): Promise<ReActResult> {
    // Synthesize final answer from gathered passages
    this.debugLog(`[ResultOrchestrator] Beginning synthesis with ${passages.length} passages`);
    const finalAnswer = await this.synthesize(question, passages, synthesisEngine, synthesisConfig);
    this.debugLog(`[ResultOrchestrator] Synthesis complete. Answer length: ${finalAnswer.length} characters`);
    
    // Build final result with citations and metadata
    const result: ReActResult = ResultBuilder.build({
      question,
      passages,
      finalAnswer,
      debugTrace,
      metrics,
    });

    return result;
  }

  /**
   * Synthesize final answer from gathered passages using AI
   * 
   * @param question - The original user question
   * @param passages - Gathered passages from search and fetch operations
   * @param synthesisEngine - Engine to synthesize the final answer
   * @param synthesisConfig - Configuration for synthesis
   * @returns Synthesized final answer as a string
   */
  private async synthesize(
    question: string, 
    passages: Passage[], 
    synthesisEngine: SynthesisEngine,
    synthesisConfig: SynthesisConfig
  ): Promise<string> {
    return synthesisEngine.synthesize({
      currentDateTime: synthesisConfig.currentDateTime,
      question,
      passages,
      provider: synthesisConfig.provider,
      model: synthesisConfig.model,
      openai: synthesisConfig.openai,
      modelConfig: synthesisConfig.modelConfig
    });
  }
}
