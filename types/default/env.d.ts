declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_IS_DEV: string;
      EXPO_PUBLIC_API_URL: string;
    }
  }
}

export {};
