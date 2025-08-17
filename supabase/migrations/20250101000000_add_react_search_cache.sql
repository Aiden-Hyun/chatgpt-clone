-- Add cache tables for ReAct search agent

-- URL cache table for storing fetched content
CREATE TABLE IF NOT EXISTS public.url_cache (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Search cache table for storing search results
CREATE TABLE IF NOT EXISTS public.search_cache (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_url_cache_expires ON public.url_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_search_cache_expires ON public.search_cache(expires_at);

-- RLS policies (optional - you can disable RLS if not needed)
ALTER TABLE public.url_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_cache ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read/write cache
CREATE POLICY "Allow authenticated users to access url_cache" ON public.url_cache
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to access search_cache" ON public.search_cache
    FOR ALL USING (auth.role() = 'authenticated');

-- Cleanup function to remove expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM public.url_cache WHERE expires_at < now();
    DELETE FROM public.search_cache WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Note: pg_cron removed as suggested. Use Supabase Scheduled Functions instead
-- or call cleanup_expired_cache() opportunistically in your Edge Functions
