
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.7b9e3276633946babd089d9a37eb0326',
  appName: 'szalty-fuel-stories',
  webDir: 'dist',
  server: {
    url: 'https://7b9e3276-6339-46ba-bd08-9d9a37eb0326.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
  }
};

export default config;
