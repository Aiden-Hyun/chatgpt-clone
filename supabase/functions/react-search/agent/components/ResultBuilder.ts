import type { Passage, ReActResult } from "../types/AgentTypes.ts";
import { distinct } from "../utils/text-utils.ts";
import { isTimeSensitive, newestDate } from "../utils/time-utils.ts";

export class ResultBuilder {
  static build(args: {
    question: string;
    passages: Passage[];
    finalAnswer: string;
    debugTrace?: any;
    metrics?: { searches: number; fetches: number; reranks: number };
  }): ReActResult {
    const citations: ReActResult["citations"] = [];
    const uniqueUrls = distinct(args.passages.map(p => p.url)).slice(0, 6);
    for (const url of uniqueUrls) {
      const p = args.passages.find(x => x.url === url);
      if (p) citations.push({ url: p.url, title: p.title, published_date: p.published_date });
    }

    let time_warning: string | undefined;
    if (isTimeSensitive(args.question)) {
      const newest = newestDate(args.passages);
      const staleCutoff = new Date(Date.now() - 30 * 24 * 3600 * 1000);
      if (!newest || newest < staleCutoff) {
        time_warning = "⚠️ No confirmation within the last 30 days; info may be outdated.";
      }
    }

    return {
      final_answer_md: args.finalAnswer,
      citations: citations.slice(0, 4),
      trace: args.debugTrace ? { steps: args.debugTrace, metrics: args.metrics } : undefined,
      time_warning,
    };
  }
}


