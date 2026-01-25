import Slider from "@react-native-community/slider";
import { Dimensions, View } from "react-native";

const { height } = Dimensions.get("window");

export function ScaleSlider({
  scale,
  onChange,
}: {
  scale: number;
  onChange: (v: number) => void;
}) {
  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        left: 0, // 🔥 canto esquerdo REAL
        top: height / 2 - 90, // centralização real
        width: 40,
        height: 180,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
      }}
    >
      <Slider
        style={{
          width: 180,
          height: 40,
          transform: [{ rotate: "-90deg" }],
        }}
        minimumValue={0.6}
        maximumValue={1.5}
        value={scale}
        onValueChange={onChange}
        minimumTrackTintColor="white"
        maximumTrackTintColor="rgba(255,255,255,0.3)"
        thumbTintColor="white"
      />
    </View>
  );
}
