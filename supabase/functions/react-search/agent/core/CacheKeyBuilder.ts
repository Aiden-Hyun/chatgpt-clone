import { sha1 } from "../utils/text-utils.ts";

export class CacheKeyBuilder {
  static build(args: {
    question: string;
    dayBucket: string;
    reasoningModel: string;
    synthesisModel: string;
    searches: number;
    fetches: number;
  }): string {
    const keyPayload = {
      q: args.question,
      day: args.dayBucket,
      models: { r: args.reasoningModel, s: args.synthesisModel },
      budget: { searches: args.searches, fetches: args.fetches },
    };
    return sha1(JSON.stringify(keyPayload));
  }
}


