import 'dotenv/config';

export default {
  expo: {
    name: 'MalloAI',
    slug: 'malloai',
    version: '1.0.0',
    scheme: 'malloai',
    icon: './assets/malloai-icon.png',
    ios: {
      bundleIdentifier: 'com.aidenhyun.malloai',
    },
    android: {
      package: 'com.aidenhyun.malloai',
    },
    plugins: [
      'expo-secure-store'
    ],
    extra: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      edgeFunctionBaseUrl: process.env.EDGE_FUNCTION_BASE_URL,
    },
    // Change the root directory to source/presentation/app
    root: './source/presentation/app',
  },
};