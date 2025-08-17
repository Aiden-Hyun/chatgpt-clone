import { CacheManager } from "../cache.ts";

export interface FetchResult {
  url: string;
  title?: string;
  text: string;
  status: number;
  contentType?: string; // Include content-type for debugging
}

export class FetchService {
  private microlinkApiKey?: string;
  private cacheManager: CacheManager;

  constructor(cacheManager: CacheManager) {
    this.microlinkApiKey = Deno.env.get("MICROLINK_API_KEY");
    this.cacheManager = cacheManager;
  }

  async fetch(url: string): Promise<FetchResult> {
    console.log(`[FETCH] Fetching: ${url}`);

    // Check cache first
    const cached = await this.cacheManager.getUrlCache(url);
    if (cached) {
      console.log(`[FETCH] Cache hit for: ${url}`);
      return cached;
    }

    // Always try Microlink first for all URLs (including PDFs)
    try {
      const result = await this.fetchWithMicrolink(url);
      await this.cacheManager.setUrlCache(url, result, 7 * 24 * 60 * 60); // 7 days
      return result;
    } catch (error) {
      console.error(`[FETCH] Microlink failed for ${url}:`, error);
    }

    // Fallback to direct fetch + Readability
    try {
      const result = await this.fetchWithReadability(url);
      await this.cacheManager.setUrlCache(url, result, 7 * 24 * 60 * 60); // 7 days
      return result;
    } catch (error) {
      console.error(`[FETCH] Readability failed for ${url}:`, error);
      throw error;
    }
  }

  private async fetchWithMicrolink(url: string): Promise<FetchResult> {
    const endpoint = this.microlinkApiKey
      ? `https://pro.microlink.io?url=${encodeURIComponent(url)}&meta=true&text=true`
      : `https://api.microlink.io?url=${encodeURIComponent(url)}&meta=true&text=true`;
    
    const headers: Record<string, string> = {};
    if (this.microlinkApiKey) {
      headers["x-api-key"] = this.microlinkApiKey;
    }

    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    try {
      const response = await fetch(endpoint, { 
        headers,
        signal: controller.signal 
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Microlink API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.status !== "success") {
        throw new Error(`Microlink failed: ${data.message}`);
      }

      const result: FetchResult = {
        url,
        title: data.data.title,
        text: this.truncateText(data.data.text || "", 15000),
        status: response.status,
        contentType: data.data.contentType,
      };

      // Fall through to readability if Microlink returns empty text for HTML
      if (!result.text && data.data.contentType?.includes('text/html')) {
        throw new Error("Microlink returned empty text for HTML, falling through to readability");
      }

      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private async fetchWithReadability(url: string): Promise<FetchResult> {
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; ReActBot/1.0; +https://github.com/your-repo)",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
      }

      // Check content type before processing
      const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
      if (contentType.includes("application/pdf")) {
        throw new Error("PDF content not supported by readability fallback - use Microlink for PDFs");
      }

      // Guard against very large responses
      const contentLength = Number(response.headers.get("content-length") ?? 0);
      if (contentLength && contentLength > 8_000_000) {
        throw new Error("Response too large for readability fallback");
      }

      const html = await response.text();
      
      // Simple text extraction (in production, you'd use a proper Readability library)
      const text = this.extractTextFromHTML(html);
      
      const title = this.extractTitleFromHTML(html);

      return {
        url,
        title,
        text: this.truncateText(text, 15000),
        status: response.status,
        contentType,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private extractTextFromHTML(html: string): string {
    // Remove script and style tags
    let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
    text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
    
    // Remove HTML tags
    text = text.replace(/<[^>]*>/g, "");
    
    // Decode HTML entities
    text = text.replace(/&amp;/g, "&");
    text = text.replace(/&lt;/g, "<");
    text = text.replace(/&gt;/g, ">");
    text = text.replace(/&quot;/g, '"');
    text = text.replace(/&#39;/g, "'");
    text = text.replace(/&nbsp;/g, " ");
    
    // Clean up whitespace
    text = text.replace(/\s+/g, " ").trim();
    
    return text;
  }

  private extractTitleFromHTML(html: string): string | undefined {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    return titleMatch ? titleMatch[1].trim() : undefined;
  }

  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  }
}
