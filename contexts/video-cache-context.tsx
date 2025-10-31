import React, { createContext, useRef, ReactNode, useContext } from "react";

interface CachedVideo {
  videoId: string;
  timestamp: number;
}

interface VideoCacheContextType {
  cachedVideos: Map<string, CachedVideo>;
  addToCache: (videoId: string) => void;
  isInCache: (videoId: string) => boolean;
  clearOldCache: () => void;
}

const VideoCacheContext = createContext<VideoCacheContextType | undefined>(
  undefined
);

const CACHE_EXPIRY_TIME = 30 * 60 * 1000; // 30 minutos
const MAX_CACHE_SIZE = 20; // máximo de vídeos em cache

export const VideoCacheProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const cacheRef = useRef<Map<string, CachedVideo>>(new Map());

  const addToCache = (videoId: string | null | undefined) => {
    if (!videoId) return;

    // Remove video antigo se já existe
    cacheRef.current.delete(videoId);

    // Limpa cache se exceder tamanho máximo
    if (cacheRef.current.size >= MAX_CACHE_SIZE) {
      const firstKey = cacheRef.current.keys().next().value;
      if (firstKey) cacheRef.current.delete(firstKey);
    }

    cacheRef.current.set(videoId, {
      videoId,
      timestamp: Date.now(),
    });
  };

  const isInCache = (videoId: string | null | undefined): boolean => {
    if (!videoId) return false;

    const cached = cacheRef.current.get(videoId);
    if (!cached) return false;

    // Verifica se o cache expirou
    const isExpired = Date.now() - cached.timestamp > CACHE_EXPIRY_TIME;
    if (isExpired) {
      cacheRef.current.delete(videoId);
      return false;
    }

    return true;
  };

  const clearOldCache = () => {
    const now = Date.now();
    const toDelete: (string | undefined)[] = [];

    cacheRef.current.forEach((cached, videoId) => {
      if (now - cached.timestamp > CACHE_EXPIRY_TIME) {
        toDelete.push(videoId);
      }
    });

    toDelete.forEach((videoId) => {
      if (videoId) cacheRef.current.delete(videoId);
    });
  };

  return (
    <VideoCacheContext.Provider
      value={{
        cachedVideos: cacheRef.current,
        addToCache,
        isInCache,
        clearOldCache,
      }}
    >
      {children}
    </VideoCacheContext.Provider>
  );
};

export const useVideoCache = () => {
  const context = useContext(VideoCacheContext);
  if (!context) {
    throw new Error(
      "useVideoCache deve ser usado dentro de VideoCacheProvider"
    );
  }
  return context;
};
