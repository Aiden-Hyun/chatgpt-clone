// Extract ISO date from HTML via meta tags; fallback regex
export function extractPublishedDateFromHtml(html: string, url: string): string | undefined {
  // JSON-LD datePublished
  const jsonLdMatches = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi) || [];
  for (const block of jsonLdMatches) {
    try {
      const jsonText = block.replace(/<script[^>]*>|<\/script>/gi, "");
      const data = JSON.parse(jsonText.trim());
      const candidates = Array.isArray(data) ? data : [data];
      for (const c of candidates) {
        const d = c?.datePublished || c?.dateCreated || c?.dateModified;
        if (d) return new Date(d).toISOString();
      }
    } catch {/* ignore */}
  }
  // Meta tags
  const metas = [
    /property=["']article:published_time["'][^>]*content=["']([^"']+)["']/i,
    /itemprop=["']datePublished["'][^>]*content=["']([^"']+)["']/i,
    /name=["']pubdate["'][^>]*content=["']([^"']+)["']/i,
    /datetime=["']([^"']+)["'][^>]*>\s*<\/time>/i,
  ];
  for (const re of metas) {
    const m = html.match(re);
    if (m?.[1]) {
      const d = new Date(m[1]);
      if (!isNaN(d.getTime())) return d.toISOString();
    }
  }
  // URL patterns
  const urlRe = /\/(20\d{2})[\/\-](0[1-9]|1[0-2])[\/\-](0[1-9]|[12]\d|3[01])\//;
  const um = url.match(urlRe);
  if (um) return new Date(`${um[1]}-${um[2]}-${um[3]}`).toISOString();

  // Body regex fallback (avoid false positives)
  const bodyDate = html.match(/\b(20\d{2})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])\b/);
  if (bodyDate) return new Date(bodyDate[0]).toISOString();
  return undefined;
}


