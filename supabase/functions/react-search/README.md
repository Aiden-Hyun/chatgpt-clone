# ReAct Search Agent

A web-search ReAct agent that runs in Supabase Edge Functions. The agent iteratively reasons, searches, fetches, reranks, and synthesizes answers with citations.

## Features

- **ReAct Loop**: Iterative reasoning → search → fetch → rerank → answer
- **Multiple Search Providers**: Tavily (primary), Bing, SerpAPI (fallbacks)
- **Content Extraction**: Microlink (primary), Readability fallback
- **Smart Reranking**: Cohere Rerank v3 (primary), Jina, keyword fallback
- **Caching**: URL and search result caching with TTL
- **Citations**: Automatic source attribution with URLs and titles

## API Usage

```typescript
// POST /react-search
{
  "question": "Which U.S. airports added nonstop routes to Incheon in 2024?"
}

// Response
{
  "final_answer_md": "Based on recent announcements...",
  "citations": [
    { "url": "https://example.com/article", "title": "Article Title" }
  ],
  "trace": { /* optional debug info */ }
}
```

## Environment Variables

### Required
- `OPENAI_API_KEY` - For reasoning and synthesis
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

### Optional (with fallbacks)
- `TAVILY_API_KEY` - Primary search provider
- `BING_API_KEY` - Search fallback
- `SERPAPI_API_KEY` - Search fallback
- `MICROLINK_API_KEY` - Content extraction
- `COHERE_API_KEY` - Reranking
- `JINA_API_KEY` - Reranking fallback

### Model Configuration
- `OPENAI_REASONING_MODEL` - Model for reasoning steps (default: gpt-4o-mini)
- `OPENAI_SYNTH_MODEL` - Model for final synthesis (default: gpt-4o)

### Debug & Testing
- `DEBUG_LOGS` - Enable detailed tracing (default: false)
- `ALLOWED_ORIGIN` - CORS origin (default: "*")

## Architecture

### ReAct Loop (max 4 iterations)
1. **Reason**: GPT-4o-mini decides next action
2. **Search**: Query reformulation and web search
3. **Fetch**: Content extraction from URLs
4. **Rerank**: Relevance scoring of passages
5. **Check**: Sufficient evidence evaluation
6. **Synthesize**: Final answer with GPT-4o

### Caching Strategy
- **Search Cache**: 24-72 hours TTL
- **URL Cache**: 7 days TTL
- **Automatic cleanup**: Expired entries removed opportunistically

### Safety Features
- HTTP/HTTPS only
- Content truncation (15k chars)
- Rate limiting via caching
- Error handling with fallbacks
- Timeout protection (15s per request)

## Deployment

1. Deploy the Edge Function:
```bash
supabase functions deploy react-search
```

2. Set environment variables:
```bash
supabase secrets set OPENAI_API_KEY=your_key
supabase secrets set TAVILY_API_KEY=your_key
supabase secrets set MICROLINK_API_KEY=your_key  # optional but recommended
supabase secrets set COHERE_API_KEY=your_key      # optional
supabase secrets set BING_API_KEY=your_key        # optional fallback
supabase secrets set SERPAPI_API_KEY=your_key     # optional fallback
supabase secrets set JINA_API_KEY=your_key        # optional fallback
```

3. Run the migration:
```bash
supabase db push
```

## Testing

### Example curl command:
```bash
curl -X POST https://your-project.supabase.co/functions/v1/react-search \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"question": "What is Rust'\''s borrow checker?"}'
```

### Test Questions:
1. **Evergreen**: "What is Rust's borrow checker?"
2. **Recent News**: "Latest news about OpenAI in 2024"
3. **Multi-hop**: "Which U.S. airports added nonstop routes to Incheon in 2024?"
4. **Comparative**: "Compare React vs Vue performance benchmarks"
5. **PDF Sources**: "Latest research on quantum computing"

## Example Queries

- **Factual**: "What is the current population of Tokyo?"
- **Multi-hop**: "Which companies acquired AI startups in 2024?"
- **Recent**: "Latest news about SpaceX Starship launches"
- **Comparative**: "Compare React vs Vue performance benchmarks"

## Limitations

- Maximum 4 search iterations
- Content truncated to 15k characters
- Requires at least 2 independent sources
- Rate limited by API providers
- PDF support via Microlink only

## Performance

- **Caching**: Reduces API calls and improves response times
- **Timeouts**: Prevents hanging on slow endpoints
- **Fallbacks**: Ensures reliability with multiple providers
- **Chunking**: Efficient text processing for large documents

## Debugging

Enable debug mode by setting `DEBUG_LOGS=true` in your environment variables. This will include the full ReAct trace in the response.

## Error Handling

The agent gracefully handles:
- API failures with automatic fallbacks
- Invalid URLs and content types
- Rate limiting and timeouts
- Insufficient search results
- Malformed responses

## Security

- Authentication required for all requests
- Row-level security on cache tables
- No PII exfiltration
- Safe content extraction
- Input validation and sanitization
