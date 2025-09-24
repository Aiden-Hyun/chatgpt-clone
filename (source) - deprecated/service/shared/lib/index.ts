// source/service/shared/lib/index.ts
// Service layer utilities barrel export

// Config
export { ConfigService, appConfig } from './config';
export type { IConfigService } from './config';

// Constants
export { APP, NETWORK, OPENAI } from './constants';

// Fetch utilities
export { fetchJson } from './fetch';

// Supabase
export { createSupabaseClient, supabase } from './supabase';
export { getSession } from './supabase/getSession';

