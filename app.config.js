export default {
  expo: {
    name: 'PAEC',
    slug: 'paec',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'paec',
    userInterfaceStyle: 'automatic',
    splash: {
      image: './assets/images/icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.gustavoarias.paec'
    },
    android: {
      package: 'com.gustavoarias.paec',
      adaptiveIcon: {
        foregroundImage: './assets/images/icon.png',
        backgroundColor: '#ffffff'
      }
    },
    web: {
      bundler: 'metro',
      favicon: './assets/images/favicon.png',
      output: 'server'
    },
    plugins: [
      'expo-router',
      'expo-font',
      'expo-web-browser',
      '@react-native-community/datetimepicker'
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      eas: {
        projectId: "503f6271-f2fd-445f-a519-8225df8bf6a8"
      }
    }
  }
};