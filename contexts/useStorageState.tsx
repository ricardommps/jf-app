import { deleteItemAsync, getItemAsync, setItemAsync } from "expo-secure-store";
import { useCallback, useEffect, useRef, useState } from "react";

// Função segura para set/get/delete no SecureStore
export async function setStorageItemAsync(key: string, value: string | null) {
  if (value == null) {
    await deleteItemAsync(key);
  } else {
    await setItemAsync(key, value);
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
        const value = await getItemAsync(key);
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
