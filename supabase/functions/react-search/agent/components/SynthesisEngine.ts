import { getRecencyBonus, domainAuthorityScore } from "../utils/scoring-utils.ts";
import { eTLDplus1 } from "../utils/url-utils.ts";
import type { Passage, ModelProvider } from "../types/AgentTypes.ts";
import { callAnthropic } from "../../../ai-chat/providers/anthropic.ts";

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
  }): Promise<string> {
    const { currentDateTime, question, passages, provider, model, openai, modelConfig } = args;
    console.log(`[Synth] Starting synthesis with ${passages.length} passages`);

    const top = this.selectTopDiverse(passages, 10);
    console.log(`[Synth] Selected ${top.length} diverse passages for synthesis`);

    const ctx = top.map(p =>
      `ID:${p.id}\nURL:${p.url}\nTITLE:${p.title || "Unknown"}\nPUBLISHED:${p.published_date || "Unknown"}\nCONTENT:\n${p.text}\n---`
    ).join("\n");

    const system = `You are a precise synthesis agent.
- Current time: ${currentDateTime}
- Every non-trivial claim (numbers, names, dates) must be supported by a passage ID and inline citation [Title (Date)](URL).
- Prefer consensus from ≥2 independent domains; if only one source, say "single-source".
- If sources conflict or are stale (>30d old for time-sensitive queries), say so explicitly.
- Keep answer concise, structured, and factual; use bullet points where helpful.`;

    const user = `Question: ${question}

Passages (use IDs for citation mapping):
${ctx}

Write the answer in Markdown. Include inline citations immediately after the sentences they support.`;

    const messages = [
      { role: "system", content: system },
      { role: "user", content: user }
    ];

    let response: any;
    if (provider === 'anthropic') {
      response = await callAnthropic(model, messages, modelConfig);
    } else {
      if (!openai) throw new Error('OpenAI client not initialized but trying to use OpenAI model');
      response = await openai.chat.completions.create({
        model,
        messages,
        temperature: modelConfig.defaultTemperature,
        [modelConfig.tokenParameter]: modelConfig.max_tokens
      });
    }

    let draft = response.choices[0]?.message?.content || "Unable to synthesize.";
    console.log(`[Synth] Raw synthesis response length: ${draft.length} chars`);

    const needsCite = /(?:\b\d{4}\b|\b\d+(?:\.\d+)?%|\b[A-Z][a-z]+ [A-Z][a-z]+)/;
    draft = draft.split(/\n/).map((line: string) => {
      if (needsCite.test(line) && !/\]\(https?:\/\//.test(line)) {
        return line + " *(source uncertain; verify)*";
      }
      return line;
    }).join("\n");

    return draft;
  }
}


