import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'foundation.verumomnis.app',
  appName: 'Verum Omnis',
  webDir: '../web/dist',
  bundledWebRuntime: false,
  server: { androidScheme: 'https' }
};
export default config;
