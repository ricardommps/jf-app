import { deleteItemAsync, getItemAsync, setItemAsync } from "expo-secure-store";
import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

async function getWebStorage() {
  if (typeof globalThis === "undefined" || !("localStorage" in globalThis)) {
    return null;
  }

  return globalThis.localStorage;
}

function normalizeStorageKey(key: string) {
  const trimmedKey = key?.trim() ?? "";

  if (!trimmedKey) {
    console.warn("Storage key inválida: valor vazio recebido.");
    return null;
  }

  const normalizedKey = trimmedKey.replace(/[^A-Za-z0-9._-]/g, "_");

  if (normalizedKey !== trimmedKey) {
    console.warn(
      `Storage key normalizada de "${trimmedKey}" para "${normalizedKey}".`,
    );
  }

  return normalizedKey;
}

export async function getStorageItemAsync(key: string) {
  const storageKey = normalizeStorageKey(key);

  if (!storageKey) {
    return null;
  }

  if (Platform.OS === "web") {
    const storage = await getWebStorage();
    return storage?.getItem(storageKey) ?? null;
  }

  return getItemAsync(storageKey);
}

// Função segura para set/get/delete em storage local
export async function setStorageItemAsync(key: string, value: string | null) {
  const storageKey = normalizeStorageKey(key);

  if (!storageKey) {
    return;
  }

  if (Platform.OS === "web") {
    const storage = await getWebStorage();

    if (!storage) return;

    if (value == null) {
      storage.removeItem(storageKey);
    } else {
      storage.setItem(storageKey, value);
    }

    return;
  }

  if (value == null) {
    await deleteItemAsync(storageKey);
  } else {
    await setItemAsync(storageKey, value);
  }
}

// Hook melhorado
export function useStorageState(
  key: string
): [[boolean, string | null], (value: string | null) => void] {
  const [state, setState] = useState<[boolean, string | null]>([true, null]);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    (async () => {
      try {
        const value = await getStorageItemAsync(key);
        if (isMounted.current) {
          setState([false, value]);
        }
      } catch (error) {
        if (isMounted.current) {
          setState([false, null]); // Pode definir erro aqui se quiser
          console.error("Failed to get item:", error);
        }
      }
    })();

    return () => {
      isMounted.current = false;
    };
  }, [key]);

  const setValue = useCallback(
    (value: string | null) => {
      setState(([_, current]) => [false, value]); // Atualiza imediatamente o estado
      setStorageItemAsync(key, value).catch((error) => {
        console.error("Failed to set item:", error);
      });
    },
    [key]
  );

  return [state, setValue];
}
