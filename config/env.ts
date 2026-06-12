import Constants from "expo-constants";
import * as Device from "expo-device";
import { Platform } from "react-native";

const extra = Constants.expoConfig?.extra;
const rawApiUrl = extra?.EXPO_PUBLIC_API_URL as string | undefined;

const LOCALHOST_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0"]);

function getExpoDevHost() {
  const hostUri = Constants.expoConfig?.hostUri;

  if (!hostUri) return null;

  return hostUri.split(":")[0] || null;
}

function resolveApiUrl(apiUrl?: string) {
  if (!apiUrl) return "";

  if (Platform.OS === "web") {
    return apiUrl;
  }

  try {
    const parsedUrl = new URL(apiUrl);

    if (!LOCALHOST_HOSTS.has(parsedUrl.hostname)) {
      return apiUrl;
    }

    const expoDevHost = getExpoDevHost();

    if (expoDevHost) {
      parsedUrl.hostname = expoDevHost;
      return parsedUrl.toString().replace(/\/$/, "");
    }

    if (Platform.OS === "android" && !Device.isDevice) {
      parsedUrl.hostname = "10.0.2.2";
      return parsedUrl.toString().replace(/\/$/, "");
    }

    return apiUrl;
  } catch {
    return apiUrl;
  }
}

const resolvedApiUrl = resolveApiUrl(rawApiUrl);

export const ENV = {
  // Ambiente
  APP_ENV: extra?.APP_ENV as string,
  IS_DEV: extra?.EXPO_PUBLIC_IS_DEV === "true",
  ENVIRONMENT: extra?.EXPO_PUBLIC_ENVIRONMENT as string,

  // API
  API_URL: resolvedApiUrl,

  // Features
  ENABLE_LINKING: extra?.EXPO_PUBLIC_ENABLE_LINKING === "true",

  // App Info
  PHONE_NUMBER: extra?.PHONENUMBER as string,
  URL_APP: extra?.URLAPP as string,

  // Sentry
  SENTRY_DSN: extra?.EXPO_PUBLIC_SENTRY_DSN as string,

  // Helpers
  get isProd() {
    return this.APP_ENV === "prod" && !this.IS_DEV;
  },

  get isStaging() {
    return this.APP_ENV === "staging";
  },

  get isDevelopment() {
    return this.APP_ENV === "dev" || this.IS_DEV;
  },
} as const;

// Validação (opcional, mas útil)
if (!ENV.API_URL) {
  console.warn("⚠️ EXPO_PUBLIC_API_URL não está configurada!");
}

if (rawApiUrl && rawApiUrl !== resolvedApiUrl) {
  console.log(`🔁 API local resolvida: ${rawApiUrl} -> ${resolvedApiUrl}`);
}

if (
  rawApiUrl &&
  rawApiUrl === resolvedApiUrl &&
  Platform.OS !== "web" &&
  (() => {
    try {
      return LOCALHOST_HOSTS.has(new URL(rawApiUrl).hostname);
    } catch {
      return false;
    }
  })()
) {
  console.warn(
    "⚠️ A API está configurada com localhost. Em dispositivo físico, localhost aponta para o próprio aparelho.",
  );
}
