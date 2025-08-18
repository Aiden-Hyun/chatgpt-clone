export function domainAuthorityScore(domain?: string): number {
  if (!domain) return 0;
  if (domain.endsWith(".gov") || domain.endsWith(".govt") || domain.endsWith(".gouv")) return 0.98;
  if (domain.endsWith(".edu") || domain.endsWith(".ac") || domain.endsWith(".edu.cn")) return 0.95;
  const high = [
    "nature.com","sciencedirect.com","nejm.org","thelancet.com","who.int","oecd.org","imf.org","worldbank.org","un.org",
    "reuters.com","apnews.com","bbc.co.uk","nytimes.com","washingtonpost.com","ft.com","bloomberg.com"
  ];
  if (high.some(h => domain.endsWith(h))) return 0.9;
  const low = [
    "medium.com","quora.com","reddit.com","stackexchange.com","blogspot.","wordpress.","substack.com","contentfarm","clickbait"
  ];
  if (low.some(l => domain.includes(l))) return 0.2;
  return 0.6;
}

export function getTechnicalSourceBonus(domain: string | undefined, title: string, snippet: string): number {
  let bonus = 0;
  const technicalDomains = [
    'nature.com', 'sciencedirect.com', 'ieee.org', 'arxiv.org', 'researchgate.net',
    'springer.com', 'wiley.com', 'tandfonline.com', 'sage.com', 'academia.edu',
    'mit.edu', 'stanford.edu', 'harvard.edu', 'berkeley.edu', 'cmu.edu'
  ];
  if (domain && technicalDomains.some(d => domain.includes(d))) {
    bonus += 0.3;
  }
  const technicalKeywords = [
    'research', 'study', 'analysis', 'report', 'paper', 'journal', 'conference',
    'technical', 'scientific', 'academic', 'peer-reviewed', 'data', 'statistics',
    'methodology', 'findings', 'conclusions', 'abstract', 'doi'
  ];
  const text = `${title} ${snippet}`.toLowerCase();
  const keywordMatches = technicalKeywords.filter(keyword => text.includes(keyword));
  bonus += (keywordMatches.length * 0.05);
  return Math.min(bonus, 0.5);
}

export function getRecencyBonus(url: string, title: string): number {
  let bonus = 0;
  const currentYear = new Date().getFullYear();
  const recentYears = [currentYear, currentYear - 1, currentYear - 2];
  const text = `${url} ${title}`.toLowerCase();
  for (const year of recentYears) {
    if (text.includes(year.toString())) {
      bonus += 0.2;
      break;
    }
  }
  const recencyKeywords = ['latest', 'recent', 'new', 'updated', 'current', '2024', '2025'];
  const keywordMatches = recencyKeywords.filter(keyword => text.includes(keyword));
  bonus += (keywordMatches.length * 0.05);
  return Math.min(bonus, 0.3);
}


