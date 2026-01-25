import "dotenv/config";

export default {
  expo: {
    name: "FOLTZ",
    slug: "jfapp",
    owner: "jftreinos",

    // 🔒 Só muda quando for nova build na store
    version: "1.3.1",

    orientation: "portrait",
    icon: "./assets/images/jf_icone_app.png",
    scheme: "jfapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    assetBundlePatterns: ["**/*"],

    // ✅ OTA FUNCIONA AQUI
    runtimeVersion: {
      policy: "sdkVersion",
    },

    updates: {
      enabled: true,
      checkAutomatically: "ON_LOAD",
      fallbackToCacheTimeout: 0,
      url: "https://u.expo.dev/6ddb8b5c-3423-408e-b94b-f7dd9b7b14f7",
    },

    linking: {
      prefixes: [
        "jfapp://",
        "https://connect.garmin.com",
        "https://www.strava.com",
      ],
    },

    ios: {
      bundleIdentifier: "com.jftreinos.jfapp",
      buildNumber: "42",
      supportsTablet: false,
      deploymentTarget: "15.1",

      infoPlist: {
        NSCameraUsageDescription:
          "Para você tirar uma foto de perfil com a câmera.",
        UIBackgroundModes: ["remote-notification"],
        CFBundleURLTypes: [
          {
            CFBundleURLName: "jfapp",
            CFBundleURLSchemes: ["jfapp"],
          },
        ],
        ITSAppUsesNonExemptEncryption: false,
        UIViewControllerBasedStatusBarAppearance: false,
        UIStatusBarStyle: "UIStatusBarStyleLightContent",
      },

      associatedDomains: [
        "applinks:connect.garmin.com",
        "applinks:www.strava.com",
      ],
    },

    android: {
      package: "com.jftreinos.jfapp",
      versionCode: 42,
      compileSdkVersion: 35,
      targetSdkVersion: 35,
      minSdkVersion: 21,
      buildToolsVersion: "35.0.0",

      adaptiveIcon: {
        foregroundImage: "./assets/images/jf_icone_app.png",
        backgroundColor: "#000000",
      },

      softwareKeyboardLayoutMode: "pan",

      intentFilters: [
        {
          action: "android.intent.action.VIEW",
          category: [
            "android.intent.category.DEFAULT",
            "android.intent.category.BROWSABLE",
          ],
          data: { scheme: "jfapp" },
        },
        {
          action: "android.intent.action.VIEW",
          category: [
            "android.intent.category.DEFAULT",
            "android.intent.category.BROWSABLE",
          ],
          data: {
            scheme: "https",
            host: "connect.garmin.com",
            pathPrefix: "/modern/activity",
          },
        },
        {
          action: "android.intent.action.VIEW",
          category: [
            "android.intent.category.DEFAULT",
            "android.intent.category.BROWSABLE",
          ],
          data: {
            scheme: "https",
            host: "www.strava.com",
            pathPrefix: "/activities",
          },
        },
      ],

      permissions: [
        "android.permission.CAMERA",
        "android.permission.RECORD_AUDIO",
      ],
      blockedPermissions: [
        "android.permission.READ_MEDIA_IMAGES",
        "android.permission.READ_MEDIA_VIDEO",
      ],

      googleServicesFile: "./google-services.json",
    },

    plugins: [
      [
        "expo-build-properties",
        {
          android: {
            compileSdkVersion: 35,
            targetSdkVersion: 35,
            buildToolsVersion: "35.0.0",
          },
          ios: {
            useFrameworks: "static",
            deploymentTarget: "15.1",
          },
        },
      ],
      [
        "expo-splash-screen",
        {
          image: "./assets/images/jf_icone_app.png",
          imageWidth: 300,
          resizeMode: "contain",
          backgroundColor: "#000000",
        },
      ],
      [
        "expo-notifications",
        {
          icon: "./assets/images/jf_logo_icone_push.png",
          color: "#ffffff",
          defaultChannel: "default",
          enableBackgroundRemoteNotifications: true,
          sounds: [],
        },
      ],
      [
        "expo-image-picker",
        {
          cameraPermission: "Para você tirar uma foto de perfil com a câmera.",
        },
      ],
      "./plugins/receive-sharing-intent.js",
      "./plugins/fix-firebase-pods.js",
      "expo-font",
      "expo-secure-store",
    ],

    experiments: {
      typedRoutes: true,
    },

    extra: {
      eas: {
        projectId: "6ddb8b5c-3423-408e-b94b-f7dd9b7b14f7",
      },
    },

    notification: {
      icon: "./assets/images/jf_logo_icone_push.png",
      color: "#ffffff",
    },
  },
};
