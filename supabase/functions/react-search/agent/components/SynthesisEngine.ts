import type { AIProviderManager } from "../services/AIProviderManager.ts";
import type { ModelProvider, Passage } from "../types/AgentTypes.ts";
import type { APICallTracker } from "../utils/APICallTracker.ts";
import { domainAuthorityScore } from "../utils/scoring-utils.ts";
import { eTLDplus1 } from "../utils/url-utils.ts";

export class SynthesisEngine {
  selectTopDiverse(passages: Passage[], n: number): Passage[] {
    const withScore = passages.map(p => {
      const auth = domainAuthorityScore(p.source_domain);
      const recency = p.published_date
        ? 1 / (1 + Math.max(0, (Date.now() - new Date(p.published_date).getTime()) / (1000*3600*24*30)))
        : 0.4;
      const base = (p as any).score ?? 0.5;
      return { p, s: 0.55*base + 0.30*auth + 0.15*recency };
    }).sort((a, b) => b.s - a.s).map(x => x.p);

    const pick: Passage[] = [];
    const perDomainCap = 3;
    for (const cand of withScore) {
      const dom = cand.source_domain || eTLDplus1(cand.url) || "unknown";
      const cnt = pick.filter(x => x.source_domain === dom).length;
      if (cnt >= perDomainCap) continue;
      pick.push(cand);
      if (pick.length >= n) break;
    }
    return pick;
  }

  async synthesize(args: {
    currentDateTime: string;
    question: string;
    passages: Passage[];
    provider: ModelProvider;
    model: string;
    openai: any | null;
    modelConfig: any;
    aiProviderManager?: AIProviderManager; // NEW: AI Provider Manager
    apiCallTracker?: APICallTracker; // NEW: API Call Tracker
  }): Promise<string> {
    const { currentDateTime, question, passages, provider, model, openai, modelConfig, aiProviderManager, apiCallTracker } = args;
    console.log(`[Synth] Starting synthesis with ${passages.length} passages`);

    const top = this.selectTopDiverse(passages, 10);
    console.log(`[Synth] Selected ${top.length} diverse passages for synthesis`);

    const ctx = top.map(p =>
      `URL:${p.url}\nTITLE:${p.title || "Unknown"}\nPUBLISHED:${p.published_date || "Unknown"}\nCONTENT:\n${p.text}\n---`
    ).join("\n");

    const system = `You are a precise synthesis agent.
- Current time: ${currentDateTime}
- Every non-trivial claim (numbers, names, dates) must be supported by inline citations [Title (Date)](URL).
- Prefer consensus from ≥2 independent domains; if only one source, say "single-source".
- If sources conflict or are stale (>30d old for time-sensitive queries), say so explicitly.
- Keep answer concise, structured, and factual; use bullet points where helpful.`;
    
    const user = `Question: ${question}

Passages:
${ctx}

Write the answer in Markdown. Include inline citations immediately after the sentences they support.`;

    const messages = [
      { role: "system", content: system },
      { role: "user", content: user }
    ];

    console.log(`🤖 [SynthesisEngine] API Call #3 - Synthesis:`);
    console.log(`🤖 [SynthesisEngine] Model: ${model} (${provider})`);
    console.log(`🤖 [SynthesisEngine] System prompt length: ${system.length} chars`);
    console.log(`🤖 [SynthesisEngine] User prompt length: ${user.length} chars`);
    console.log(`🤖 [SynthesisEngine] Total context length: ${system.length + user.length} chars`);
    console.log(`🤖 [SynthesisEngine] Number of passages: ${top.length}`);
    console.log(`🤖 [SynthesisEngine] Model config: ${JSON.stringify(modelConfig)}`);

    const startTime = Date.now();
    
    let response: any;
    
    // Use AI Provider Manager if available, otherwise fall back to direct calls
    if (aiProviderManager) {
      console.log(`🤖 [SynthesisEngine] Using AI Provider Manager for ${provider}`);
      response = await aiProviderManager.call(provider, model, messages, modelConfig);
    } else {
      // Fallback to direct provider calls (for backward compatibility)
      console.log(`🤖 [SynthesisEngine] Using direct provider calls (fallback)`);
      
      if (provider === 'anthropic') {
        const { callAnthropic } = await import("../../../ai-chat/providers/anthropic.ts");
        console.log(`🤖 [SynthesisEngine] Calling Anthropic API...`);
        response = await callAnthropic(model, messages, modelConfig);
      } else {
        if (!openai) throw new Error('OpenAI client not initialized but trying to use OpenAI model');
        console.log(`🤖 [SynthesisEngine] Calling OpenAI API...`);
        response = await openai.chat.completions.create({
          model,
          messages,
          temperature: modelConfig.defaultTemperature,
          [modelConfig.tokenParameter]: modelConfig.max_tokens
        });
      }
    }
    
    const apiTime = Date.now() - startTime;
    console.log(`🤖 [SynthesisEngine] API response received in ${apiTime}ms`);

    // Track API call
    if (apiCallTracker) {
      apiCallTracker.trackCall({
        purpose: "Synthesis",
        model: model,
        provider: provider,
        responseTimeMs: apiTime,
        success: true,
        metadata: {
          passagesCount: passages.length,
          selectedPassagesCount: top.length,
          systemPromptLength: system.length,
          userPromptLength: user.length
        }
      });
    }

    let draft = response.choices[0]?.message?.content || "Unable to synthesize.";
    console.log(`[Synth] Raw synthesis response length: ${draft.length} chars`);
    console.log(`🤖 [SynthesisEngine] Full API response: ${JSON.stringify(response.choices[0]?.message || {})}`);

    return draft;
  }

  /**
   * Synthesize a direct answer for simple questions that don't need web search
   * 
   * @param args - Synthesis arguments
   * @returns Direct answer without citations
   */
  async synthesizeDirectAnswer(args: {
    currentDateTime: string;
    question: string;
    provider: ModelProvider;
    model: string;
    openai: any | null;
    modelConfig: any;
    aiProviderManager?: AIProviderManager; // NEW: AI Provider Manager
    apiCallTracker?: APICallTracker; // NEW: API Call Tracker
  }): Promise<string> {
    const { currentDateTime, question, provider, model, openai, modelConfig, aiProviderManager, apiCallTracker } = args;
    console.log(`[Synth] Starting direct answer synthesis for: "${question}"`);

    const system = `You are a helpful AI assistant. Answer the user's question directly using your knowledge.
- Current time: ${currentDateTime}
- Provide a clear, accurate, and helpful answer
- No citations needed since this is based on your knowledge
- Keep the answer concise but informative
- If the question involves calculations (like dates), show your work briefly`;

    const user = `Question: ${question}

Please provide a direct answer to this question.`;

    const messages = [
      { role: "system", content: system },
      { role: "user", content: user }
    ];

    console.log(`🤖 [SynthesisEngine] API Call #2 - Direct Answer Synthesis:`);
    console.log(`🤖 [SynthesisEngine] Model: ${model} (${provider})`);
    console.log(`🤖 [SynthesisEngine] System prompt length: ${system.length} chars`);
    console.log(`🤖 [SynthesisEngine] User prompt length: ${user.length} chars`);
    console.log(`🤖 [SynthesisEngine] Total context length: ${system.length + user.length} chars`);
    console.log(`🤖 [SynthesisEngine] Model config: ${JSON.stringify(modelConfig)}`);

    const startTime = Date.now();
    
    let response: any;
    
    // Use AI Provider Manager if available, otherwise fall back to direct calls
    if (aiProviderManager) {
      console.log(`🤖 [SynthesisEngine] Using AI Provider Manager for ${provider}`);
      response = await aiProviderManager.call(provider, model, messages, modelConfig);
    } else {
      // Fallback to direct provider calls (for backward compatibility)
      console.log(`🤖 [SynthesisEngine] Using direct provider calls (fallback)`);
      
      if (provider === 'anthropic') {
        const { callAnthropic } = await import("../../../ai-chat/providers/anthropic.ts");
        console.log(`🤖 [SynthesisEngine] Calling Anthropic API...`);
        response = await callAnthropic(model, messages, modelConfig);
      } else {
        if (!openai) throw new Error('OpenAI client not initialized but trying to use OpenAI model');
        console.log(`🤖 [SynthesisEngine] Calling OpenAI API...`);
        response = await openai.chat.completions.create({
          model,
          messages,
          temperature: modelConfig.defaultTemperature,
          [modelConfig.tokenParameter]: modelConfig.max_tokens
        });
      }
    }
    
    const apiTime = Date.now() - startTime;
    console.log(`🤖 [SynthesisEngine] API response received in ${apiTime}ms`);

    // Track API call
    if (apiCallTracker) {
      apiCallTracker.trackCall({
        purpose: "Direct Answer Synthesis",
        model: model,
        provider: provider,
        responseTimeMs: apiTime,
        success: true,
        metadata: {
          questionLength: question.length,
          systemPromptLength: system.length,
          userPromptLength: user.length
        }
      });
    }

    const answer = response.choices[0]?.message?.content || "Unable to provide direct answer.";
    console.log(`[Synth] Direct answer response length: ${answer.length} chars`);
    console.log(`🤖 [SynthesisEngine] Full API response: ${JSON.stringify(response.choices[0]?.message || {})}`);

    return answer;
  }
}


