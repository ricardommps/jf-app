// visibility-scroll-view.tsx
import { useVisibility } from "@/contexts/visibility-context";
import React, {
  forwardRef,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  ScrollViewProps,
  View,
  ViewStyle,
} from "react-native";

interface VisibleItemData {
  id: string;
  y: number;
  height: number;
}

interface VisibilityScrollViewProps extends ScrollViewProps {
  children: ReactNode;
  onVisibleItemsChange?: (visibleItems: string[]) => void;
  debug?: boolean;
}

export const VisibilityScrollView = forwardRef<
  ScrollView,
  VisibilityScrollViewProps
>(({ children, onVisibleItemsChange, debug = false, ...props }, ref) => {
  const { trackItem, untrackItem } = useVisibility();
  const scrollViewRef = useRef<ScrollView>(null);

  const itemsRef = useRef<Map<string, VisibleItemData>>(new Map());
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());
  const lastScrollYRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);

  // Registro e remoção de items
  const registerItem = useCallback(
    (itemId: string, layout: LayoutChangeEvent) => {
      const { y, height } = layout.nativeEvent.layout;
      itemsRef.current.set(itemId, { id: itemId, y, height });
    },
    [debug]
  );

  // Atualiza visibilidade
  const updateVisibleItems = useCallback(
    (scrollY: number, viewHeight: number) => {
      const newVisibleItems = new Set<string>();
      const threshold = 100;

      itemsRef.current.forEach((item) => {
        const itemTop = item.y - threshold;
        const itemBottom = item.y + item.height + threshold;
        const scrollBottom = scrollY + viewHeight;

        const isVisible = itemBottom > scrollY && itemTop < scrollBottom;

        if (isVisible) {
          newVisibleItems.add(item.id);
          trackItem(item.id);
        } else {
          untrackItem(item.id);
        }
      });

      setVisibleItems(newVisibleItems);

      onVisibleItemsChange?.(Array.from(newVisibleItems));
    },
    [trackItem, untrackItem, onVisibleItemsChange, debug]
  );

  // Scroll listener usando requestAnimationFrame
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, layoutMeasurement } = event.nativeEvent;
      const scrollY = contentOffset.y;
      const viewHeight = layoutMeasurement.height;

      lastScrollYRef.current = scrollY;

      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }

      rafIdRef.current = requestAnimationFrame(() => {
        updateVisibleItems(scrollY, viewHeight);
      });
    },
    [updateVisibleItems]
  );

  // Layout inicial
  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { height } = event.nativeEvent.layout;
      updateVisibleItems(0, height);
    },
    [updateVisibleItems]
  );

  // Cleanup
  useEffect(() => {
    return () => {
      visibleItems.forEach((itemId) => untrackItem(itemId));

      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [visibleItems, untrackItem]);

  const finalRef = ref || scrollViewRef;

  return (
    <ScrollView
      ref={finalRef}
      onScroll={handleScroll}
      scrollEventThrottle={16} // mantém alta frequência, mas RAF faz o throttling real
      onLayout={handleLayout}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;

        const element = child as React.ReactElement<{
          onLayout?: (event: LayoutChangeEvent) => void;
          "data-item-id"?: string;
          [key: string]: any;
        }>;

        return React.cloneElement(element, {
          onLayout: (event: LayoutChangeEvent) => {
            element.props.onLayout?.(event);

            if (element.props["data-item-id"]) {
              registerItem(element.props["data-item-id"], event);
            }
          },
        });
      })}
    </ScrollView>
  );
});

VisibilityScrollView.displayName = "VisibilityScrollView";

// Hook para usar dentro de items
export const useVisibilityTracking = (itemId: string) => {
  const { isVisible } = useVisibility();

  return {
    isVisible: isVisible(itemId),
    itemId,
  };
};

// Componente wrapper para items rastreados
interface VisibleItemProps {
  itemId: string;
  children: ReactNode;
  style?: ViewStyle;
  debug?: boolean;
  [key: string]: any;
}

export const VisibleItem = forwardRef<View, VisibleItemProps>(
  ({ itemId, children, debug = false, ...props }, ref) => {
    const { isVisible } = useVisibility();
    const itemVisible = isVisible(itemId);

    return (
      <View ref={ref} data-item-id={itemId} {...props}>
        {children}
      </View>
    );
  }
);

VisibleItem.displayName = "VisibleItem";
