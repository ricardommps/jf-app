import { Image } from "@/components/ui/image";
import { VStack } from "@/components/ui/vstack";
import React, {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";

const { height } = Dimensions.get("window");
const MIN_LOADING_DURATION_MS = 2000;

type LoadingOverlayContextValue = {
  show: (id: string) => void;
  hide: (id: string) => void;
};

const LoadingOverlayContext = createContext<LoadingOverlayContextValue | null>(
  null,
);

function LoadingOverlayContent() {
  const [loadingTextHeight, setLoadingTextHeight] = useState(34);
  const loadingTextBottom = 30;
  const runnerBottom = loadingTextHeight;

  return (
    <View pointerEvents="auto" style={styles.container}>
      <VStack
        className="flex-1 items-center justify-center bg-black px-6"
        style={styles.content}
      >
        {/* <Image
          source={require("@/assets/images/jf_logo_full.png")}
          alt="Foltz"
          resizeMode="contain"
          className="mb-10 w-[400px] h-[210px]"
        /> */}

        <View style={styles.runnerStage}>
          <Text
            onLayout={(event) => {
              const nextHeight = Math.ceil(event.nativeEvent.layout.height);

              if (nextHeight && nextHeight !== loadingTextHeight) {
                setLoadingTextHeight(nextHeight);
              }
            }}
            style={[styles.loadingText, { bottom: loadingTextBottom }]}
          >
            Carregando
          </Text>
          <View style={[styles.runnerImageWrapper, { bottom: runnerBottom }]}>
            <Image
              source={require("@/assets/images/loading-routes-ladybug-v2.gif")}
              alt="loading"
              resizeMode="contain"
              className="w-[150px] h-[150px]"
            />
          </View>
        </View>
      </VStack>
    </View>
  );
}

export function LoadingOverlayProvider({ children }: PropsWithChildren) {
  const timeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );
  const [requests, setRequests] = useState<Record<string, number>>({});

  const clearTimer = useCallback((id: string) => {
    const timeout = timeoutsRef.current.get(id);

    if (timeout) {
      clearTimeout(timeout);
      timeoutsRef.current.delete(id);
    }
  }, []);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
      timeoutsRef.current.clear();
    };
  }, []);

  const show = useCallback(
    (id: string) => {
      clearTimer(id);
      setRequests((prev) => ({
        ...prev,
        [id]: Date.now() + MIN_LOADING_DURATION_MS,
      }));
    },
    [clearTimer],
  );

  const hide = useCallback(
    (id: string) => {
      setRequests((prev) => {
        const visibleUntil = prev[id];

        if (!visibleUntil) {
          clearTimer(id);
          return prev;
        }

        const remaining = visibleUntil - Date.now();

        if (remaining <= 0) {
          clearTimer(id);
          const next = { ...prev };
          delete next[id];
          return next;
        }

        if (!timeoutsRef.current.has(id)) {
          const timeout = setTimeout(() => {
            setRequests((current) => {
              const next = { ...current };
              delete next[id];
              return next;
            });
            timeoutsRef.current.delete(id);
          }, remaining);

          timeoutsRef.current.set(id, timeout);
        }

        return prev;
      });
    },
    [clearTimer],
  );

  const value = useMemo(() => ({ show, hide }), [hide, show]);
  const isVisible = Object.keys(requests).length > 0;

  return (
    <LoadingOverlayContext.Provider value={value}>
      {children}
      {isVisible ? <LoadingOverlayContent /> : null}
    </LoadingOverlayContext.Provider>
  );
}

const Loading = () => {
  const context = useContext(LoadingOverlayContext);
  const loadingIdRef = useRef(`loading-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    if (!context) {
      return;
    }

    context.show(loadingIdRef.current);

    return () => {
      context.hide(loadingIdRef.current);
    };
  }, [context]);

  if (!context) {
    return <LoadingOverlayContent />;
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    height: height,
    width: "100%",
    backgroundColor: "#000",
    zIndex: 9999,
    elevation: 9999,
  },
  content: {
    flex: 1,
    height: "100%",
  },
  runnerStage: {
    width: "100%",
    minHeight: 200,
    alignItems: "center",
    justifyContent: "flex-end",
    position: "relative",
    marginTop: -42,
  },
  loadingText: {
    position: "absolute",
    fontSize: 22,
    lineHeight: 34,
    fontWeight: "700",
    letterSpacing: 1.4,
    color: "#FFFFFF",
    opacity: 1,
    zIndex: 1,
  },
  runnerImageWrapper: {
    position: "absolute",
    zIndex: 2,
  },
});

export default Loading;
