import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aftermonsoon.kalukumara',
  appName: 'Kalu Kumara',
  webDir: 'dist',
  backgroundColor: '#090807',
  server: {
    androidScheme: 'https',
  },
  android: {
    backgroundColor: '#090807',
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1400,
      launchAutoHide: true,
      backgroundColor: '#090807',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#090807',
      overlaysWebView: true,
    },
  },
};

export default config;
