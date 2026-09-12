import {
  getStorageItemAsync,
  setStorageItemAsync,
} from "@/contexts/useStorageState";

const WEEKLY_GREETING_KEY_PREFIX = "flechinha-assistant-weekly-greeting";

const pad = (value: number) => String(value).padStart(2, "0");

export const getFlechinhaWeekKey = (date = new Date()) => {
  const localDate = new Date(date);
  localDate.setHours(0, 0, 0, 0);

  const dayOfWeek = localDate.getDay();
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  localDate.setDate(localDate.getDate() - daysSinceMonday);

  return `${localDate.getFullYear()}-${pad(localDate.getMonth() + 1)}-${pad(localDate.getDate())}`;
};

export const isFlechinhaWeekend = (date = new Date()) => {
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6;
};

const isWeeklyGreetingDay = (date = new Date()) => {
  const dayOfWeek = date.getDay();
  return dayOfWeek === 1 || dayOfWeek === 2;
};

const getWeeklyGreetingStorageKey = (userId?: number | null) =>
  `${WEEKLY_GREETING_KEY_PREFIX}-${userId ?? "guest"}`;

export const consumeWeeklyGreeting = async (userId?: number | null) => {
  if (!isWeeklyGreetingDay()) {
    return false;
  }

  const weekKey = getFlechinhaWeekKey();
  const storageKey = getWeeklyGreetingStorageKey(userId);
  const consumedWeek = await getStorageItemAsync(storageKey);

  if (consumedWeek === weekKey) {
    return false;
  }

  await setStorageItemAsync(storageKey, weekKey);
  return true;
};
