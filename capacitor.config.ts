import { CapacitorConfig } from '@capacitor/cli';
import { NativeBiometric } from 'capacitor-native-biometric';

const config: CapacitorConfig = {
  appId: 'com.supertrack.controlautorizacion',
  appName: 'Autorizaciones | Supertrack',
  webDir: 'www',
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      launchFadeOutDuration: 3000,
      backgroundColor: "#0039F3",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#999999",
      splashFullScreen: true,
      splashImmersive: true,
      // layoutName: "launch_screen",
      // useDialog: true
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    NativeBiometric:{
      enabled: true
    } 
  },
  server: {
    androidScheme: 'https'
  },
};

export default config;
