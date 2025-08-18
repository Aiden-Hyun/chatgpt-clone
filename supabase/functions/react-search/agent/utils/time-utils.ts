import type { Passage } from "../types/AgentTypes.ts";

export function nowISO(): string {
  return new Date().toISOString();
}

export function isTimeSensitive(q: string): boolean {
  const k = ['current', 'today', 'now', 'as of', 'latest', 'recent', 'update', 'price', 'release', 'outage', 'who is', 'who’s', 'breaking', '2025', '2024', 'this week', 'this month', 'this year'];
  const s = q.toLowerCase();
  return k.some(x => s.includes(x));
}

export function timeBucketDay(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

export function newestDate(passages: Passage[]): Date | undefined {
  const dates = passages
    .map(p => p.published_date)
    .filter(Boolean)
    .map(d => new Date(d as string))
    .filter(d => !isNaN(d.getTime()));
  if (!dates.length) return undefined;
  return new Date(Math.max(...dates.map(d => d.getTime())));
}


