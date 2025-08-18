export function approxTokenLen(s: string): number {
  return Math.ceil(s.length / 4);
}

export function chunkByTokens(text: string, maxTokens = 900, overlapTokens = 120): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let buf: string[] = [];
  let t = 0;

  for (const w of words) {
    const wt = approxTokenLen(w) + 1;
    if (t + wt > maxTokens) {
      chunks.push(buf.join(' '));
      // overlap
      let overlap = overlapTokens;
      const back: string[] = [];
      for (let i = buf.length - 1; i >= 0 && overlap > 0; i--) {
        const tok = approxTokenLen(buf[i]) + 1;
        overlap -= tok;
        back.unshift(buf[i]);
      }
      buf = [...back, w];
      t = approxTokenLen(buf.join(' '));
    } else {
      buf.push(w);
      t += wt;
    }
  }
  if (buf.length) chunks.push(buf.join(' '));
  return chunks;
}

export function sha1(str: string): string {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString(36);
}

export function distinct<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}


