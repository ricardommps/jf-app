"use client";
import { tva } from "@gluestack-ui/utils/nativewind-utils";
import React from "react";
import { ImageBackground as RNImageBackground } from "react-native";

const imageBackgroundStyle = tva({});

export const ImageBackground = React.forwardRef<
  React.ComponentRef<typeof RNImageBackground>, // ✅ substituído
  React.ComponentProps<typeof RNImageBackground>
>(({ className, ...props }, ref) => {
  return (
    <RNImageBackground
      className={imageBackgroundStyle({
        class: className,
      })}
      {...props}
      ref={ref}
    />
  );
});

ImageBackground.displayName = "ImageBackground";
