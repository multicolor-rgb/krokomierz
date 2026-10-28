import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'top.multidev.krokomierz',
  appName: 'Krokomierz',
  webDir: 'dist',
  android: {
    allowMixedContent: false,
    backgroundColor: '#08090B',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 900,
      launchAutoHide: true,
      backgroundColor: '#08090B',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_steps',
      iconColor: '#C6FF3D',
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#08090B',
    },
  },
};

export default config;
