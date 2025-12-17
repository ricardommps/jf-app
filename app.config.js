import "dotenv/config";

export default {
  expo: {
    name: "FOLTZ",
    slug: "jfapp",
    owner: "jftreinos",
    version: "1.2.8",
    orientation: "portrait",
    icon: "./assets/images/jf_icone_app.png",
    scheme: "jfapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    assetBundlePatterns: ["**/*"],
    linking: {
      prefixes: [
        "jfapp://",
        "https://connect.garmin.com",
        "https://www.strava.com",
      ],
    },

    ios: {
      bundleIdentifier: "com.jftreinos.jfapp",
      buildNumber: "37",
      supportsTablet: false,
      deploymentTarget: "15.1",
      infoPlist: {
        // ⚠️ APENAS PERMISSÃO DE CÂMERA
        // Photo Picker (iOS 14+) NÃO precisa de NSPhotoLibraryUsageDescription
        NSCameraUsageDescription:
          "Para você tirar uma foto de perfil com a câmera.",

        // ❌ REMOVER estas linhas (não são necessárias com Photo Picker):
        // NSPhotoLibraryUsageDescription: "...",
        // NSPhotoLibraryAddUsageDescription: "...",

        UIBackgroundModes: ["remote-notification"],
        CFBundleURLTypes: [
          {
            CFBundleURLName: "jfapp",
            CFBundleURLSchemes: ["jfapp"],
          },
        ],
        ITSAppUsesNonExemptEncryption: false,
        UIViewControllerBasedStatusBarAppearance: true,
        UIStatusBarStyle: "UIStatusBarStyleLightContent",
      },
      associatedDomains: [
        "applinks:connect.garmin.com",
        "applinks:www.strava.com",
      ],
      runtimeVersion: "1.2.8",
    },

    android: {
      package: "com.jftreinos.jfapp",
      versionCode: 37,
      compileSdkVersion: 35,
      targetSdkVersion: 35,
      minSdkVersion: 21,
      buildToolsVersion: "35.0.0",
      adaptiveIcon: {
        foregroundImage: "./assets/images/jf_icone_app.png",
        backgroundColor: "#000",
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
      // ⚠️ APENAS PERMISSÃO DE CÂMERA E ÁUDIO
      // Photo Picker (Android 13+) NÃO precisa de READ_MEDIA_IMAGES
      permissions: [
        "android.permission.CAMERA",
        "android.permission.RECORD_AUDIO",
      ],
      blockedPermissions: [
        "android.permission.READ_MEDIA_IMAGES",
        "android.permission.READ_MEDIA_VIDEO",
      ],
      googleServicesFile: "./google-services.json",
      runtimeVersion: "1.2.8",
    },

    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
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
          backgroundColor: "#000",
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
          // ✅ Permissão de câmera (necessária em ambas plataformas)
          cameraPermission: "Para você tirar uma foto de perfil com a câmera.",

          // ❌ NÃO definir photosPermission
          // Isso força o uso do Photo Picker moderno:
          // - Android 13+: Photo Picker nativo (sem READ_MEDIA_IMAGES)
          // - Android <13: Jetpack Photo Picker backport (sem READ_EXTERNAL_STORAGE)
          // - iOS 14+: PHPickerViewController (sem NSPhotoLibraryUsageDescription)
          // - iOS <14: UIImagePickerController limitado
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

    updates: {
      enabled: true,
      checkAutomatically: "ON_LOAD",
      fallbackToCacheTimeout: 0,
      url: "https://u.expo.dev/6ddb8b5c-3423-408e-b94b-f7dd9b7b14f7",
    },
  },
};
