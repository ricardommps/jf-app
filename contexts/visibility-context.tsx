import React, {
  createContext,
  useContext,
  useRef,
  ReactNode,
  useCallback,
} from "react";

interface VisibilityContextType {
  visibleItems: Set<string>;
  trackItem: (itemId: string) => void;
  untrackItem: (itemId: string) => void;
  isVisible: (itemId: string) => boolean;
}

const VisibilityContext = createContext<VisibilityContextType | undefined>(
  undefined
);

export const VisibilityProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const visibleItemsRef = useRef<Set<string>>(new Set());

  const trackItem = useCallback((itemId: string) => {
    visibleItemsRef.current.add(itemId);
  }, []);

  const untrackItem = useCallback((itemId: string) => {
    visibleItemsRef.current.delete(itemId);
  }, []);

  const isVisible = useCallback((itemId: string): boolean => {
    return visibleItemsRef.current.has(itemId);
  }, []);

  return (
    <VisibilityContext.Provider
      value={{
        visibleItems: visibleItemsRef.current,
        trackItem,
        untrackItem,
        isVisible,
      }}
    >
      {children}
    </VisibilityContext.Provider>
  );
};

export const useVisibility = () => {
  const context = useContext(VisibilityContext);
  if (!context) {
    throw new Error(
      "useVisibility deve ser usado dentro de VisibilityProvider"
    );
  }
  return context;
};
