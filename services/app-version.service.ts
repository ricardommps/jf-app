import axios from 'axios';
import * as Application from 'expo-application';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { ENV } from '@/config/env';

export type AppVersionPlatform = 'ios' | 'android';

export interface AppVersionStatus {
  platform: AppVersionPlatform;
  currentVersion: string | null;
  currentBuild: string | null;
  minimumVersion: string | null;
  minimumBuild: string | null;
  latestVersion: string | null;
  storeUrl: string | null;
  forceUpdate: boolean;
  title: string;
  message: string;
  checkedAt: string;
}

function normalizeValue(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  const normalizedValue = `${value}`.trim();
  return normalizedValue.length ? normalizedValue : null;
}

function getExpoConfigBuild(): string | null {
  if (Platform.OS === 'ios') {
    return normalizeValue(Constants.expoConfig?.ios?.buildNumber);
  }

  if (Platform.OS === 'android') {
    return normalizeValue(Constants.expoConfig?.android?.versionCode);
  }

  return null;
}

function isExpoGoRuntime() {
  return ["host.exp.exponent", "dev.expo.go"].includes(
    Application.applicationId || "",
  );
}

function getCurrentVersion() {
  if (isExpoGoRuntime()) {
    return (
      normalizeValue(Constants.expoConfig?.version) ||
      normalizeValue(Application.nativeApplicationVersion)
    );
  }

  return (
    normalizeValue(Application.nativeApplicationVersion) ||
    normalizeValue(Constants.expoConfig?.version)
  );
}

function getCurrentBuild() {
  if (isExpoGoRuntime()) {
    return getExpoConfigBuild() || normalizeValue(Application.nativeBuildVersion);
  }

  return (
    normalizeValue(Application.nativeBuildVersion) || getExpoConfigBuild()
  );
}

export async function fetchAppVersionStatus(): Promise<AppVersionStatus | null> {
  if (!ENV.API_URL || (Platform.OS !== 'ios' && Platform.OS !== 'android')) {
    return null;
  }

  const version = getCurrentVersion();
  const build = getCurrentBuild();
  const platform: AppVersionPlatform = Platform.OS;

  const { data } = await axios.get<AppVersionStatus>(
    `${ENV.API_URL}/api/v2/app-version/status`,
    {
      params: {
        platform,
        ...(version ? { version } : {}),
        ...(build ? { build } : {}),
      },
      timeout: 10000,
    },
  );

  return data;
}
