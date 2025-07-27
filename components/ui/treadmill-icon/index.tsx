import React from "react";
import Svg, { Path, Circle } from "react-native-svg";

const TreadmillIcon = ({
  size = 24,
  color = "#000000",
  strokeWidth = 2,
  ...props
}) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* Cabeça */}
      <Circle cx="11" cy="3" r="1" />

      {/* Corpo e pernas em movimento */}
      <Path d="M3 14l4 1l.5-.5" />
      <Path d="M12 18v-3l-3-2.923L9.75 7" />

      {/* Braços e tronco */}
      <Path d="M6 10V8l4-1l2.5 2.5l2.5.5" />

      {/* Base da esteira */}
      <Path d="M21 21a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1" />

      {/* Console da esteira */}
      <Path d="M18 20l1-11l2-1" />
    </Svg>
  );
};

export default TreadmillIcon;
