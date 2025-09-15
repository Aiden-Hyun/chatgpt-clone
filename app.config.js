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
      'expo-secure-store',
      [
        '@react-native-google-signin/google-signin',
        {
          androidClientId: '817884024065-8kuomphhggmd46vhfgb0br0b0o90f0lm.apps.googleusercontent.com',
          iosClientId: '817884024065-5rhvlscksui31p2if3vi5nj92ds26u3h.apps.googleusercontent.com',
          iosUrlScheme: 'com.googleusercontent.apps.817884024065-5rhvlscksui31p2if3vi5nj92ds26u3h',
        },
      ],
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