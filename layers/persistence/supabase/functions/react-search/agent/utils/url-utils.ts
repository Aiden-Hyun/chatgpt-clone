export function eTLDplus1(url: string): string | undefined {
  try {
    const u = new URL(url);
    const parts = u.hostname.split('.');
    if (parts.length <= 2) return u.hostname;
    return parts.slice(-2).join('.');
  } catch {
    return undefined;
  }
}


