import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra;

export const ENV = {
  // Ambiente
  APP_ENV: extra?.APP_ENV as string,
  IS_DEV: extra?.EXPO_PUBLIC_IS_DEV === "true",
  ENVIRONMENT: extra?.EXPO_PUBLIC_ENVIRONMENT as string,

  // API
  API_URL: extra?.EXPO_PUBLIC_API_URL as string,

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
