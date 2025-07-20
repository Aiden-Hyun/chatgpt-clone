import 'dotenv/config';

export default {
  expo: {
    name: 'chatgpt-clone',
    slug: 'chatgpt-clone',
    version: '1.0.0',
    extra: {
      openaiApiKey: process.env.OPENAI_API_KEY,
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    },
  },
};
