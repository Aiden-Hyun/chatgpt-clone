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
        'expo-build-properties',
        {
          android: {
            // Force the entire build to use Kotlin 2.1.20, required by RN 0.81+
            kotlinVersion: '2.1.20',
            // Pin other SDK versions for consistency
            compileSdkVersion: 36,
            targetSdkVersion: 36,
            buildToolsVersion: '36.0.0',
            minSdkVersion: 24,
            gradlePluginVersion: '8.4.0',
            newArchEnabled: true,
          },
        },
      ],
      [
        '@react-native-google-signin/google-signin/app.plugin.js',
        {
          androidClientId: '817884024065-8kuomphhggmd46vhfgb0br0b0o90f0lm.apps.googleusercontent.com',
          iosClientId: '817884024065-5rhvlscksui31p2if3vi5nj92ds26u3h.apps.googleusercontent.com',
          iosUrlScheme: 'com.googleusercontent.apps.817884024065-5rhvlscksui31p2if3vi5nj92ds26u3h',
        },
      ],
      'expo-font',
      'expo-router',
      'expo-web-browser',
    ],
    extra: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      edgeFunctionBaseUrl: process.env.EDGE_FUNCTION_BASE_URL,
    },
    // Use the Expo Router app directory
    root: './app',
  },
};