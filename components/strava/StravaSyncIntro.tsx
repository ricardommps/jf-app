import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { LinearGradient } from "expo-linear-gradient";
import { Check } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { StravaBrandBridge } from "./StravaBrandBridge";

type StravaSyncIntroProps = {
  isConnecting?: boolean;
  onConnect: () => void;
};

const BENEFITS = [
  "Os treinos do Foltz serão carregados no Strava",
  "Os treinos do Strava são sincronizados com o Foltz para rastrear seu ritmo e ajustar o plano",
  "Acesse suas rotas do Strava no aplicativo Foltz",
];

export function StravaSyncIntro({
  isConnecting = false,
  onConnect,
}: StravaSyncIntroProps) {

  return (
    <View className="flex-1 justify-between pb-2 pt-1">
      <View>
        <Text
          allowFontScaling={false}
          className="self-center px-1 text-center text-[24px] font-extrabold leading-[34px] tracking-[-0.3px] text-white"
          style={{ maxWidth: 294 }}
        >
          Sincronize seus treinos{"\n"}e rotas entre nosso app{"\n"}e o Strava
          para ter uma{"\n"}experiência completa
        </Text>

        <View className="mt-[42px] items-center">
          <StravaBrandBridge />
        </View>

        <View className="mt-[56px] gap-[32px] px-2">
          {BENEFITS.map((benefit) => (
            <View key={benefit} className="flex-row items-start gap-[18px]">
              <View className="pt-[2px]">
                <Check color="#E7EAF0" size={28} strokeWidth={1.8} />
              </View>

              <Text
                allowFontScaling={false}
                className="flex-1 text-[16px] leading-[26px] text-[#C4C9D4]"
              >
                {benefit}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View className="mt-10 pb-1">
        <TouchableOpacity
          activeOpacity={0.9}
          disabled={isConnecting}
          onPress={onConnect}
        >
          <LinearGradient
            colors={["#FF8A1F", "#FC5200", "#FF6900"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={{
              minHeight: 70,
              borderRadius: 999,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              paddingHorizontal: 20,
            }}
          >
            {isConnecting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <FontAwesome5 name="strava" size={18} color="#FFFFFF" />
                <Text
                  allowFontScaling={false}
                  className="ml-3 text-[18px] font-extrabold text-white"
                >
                  Sincronizar com STRAVA
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}
