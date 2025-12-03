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
    newArchEnabled: true,
    plugins: [
      'expo-secure-store',
      [
        'expo-build-properties',
        {
          android: {
            // Force the entire build to use Kotlin 2.1.20, required by RN 0.81+
            kotlinVersion: '2.1.20',
            // Pin other SDK versions for consistency
            compileSdkVersion: 35,
            targetSdkVersion: 35,
            buildToolsVersion: '35.0.0',
            minSdkVersion: 24,
            gradlePluginVersion: '8.3.0',
            // Enable AndroidX
            usesCleartextTraffic: true,
          },
        },
      ],
      [
        '@react-native-google-signin/google-signin',
        {
          iosUrlScheme: 'com.googleusercontent.apps.817884024065-5rhvlscksui31p2if3vi5nj92ds26u3h',
        },
      ],
      'expo-font',
      'expo-router',
      'expo-web-browser',
    ],
    extra: {
      eas: {
        projectId: 'f3fa234f-7fbf-4867-88ec-6cc945a5dcbb',
      },
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      edgeFunctionBaseUrl: process.env.EDGE_FUNCTION_BASE_URL,
      // RevenueCat API keys - set these in EAS secrets or .env
      revenueCatAndroidKey: process.env.REVENUECAT_ANDROID_KEY,
      revenueCatIosKey: process.env.REVENUECAT_IOS_KEY,
    },
    // Use the Expo Router app directory
    root: './app',
  },
};