import { Checkbox, CheckboxIcon, CheckboxIndicator, CheckboxLabel } from "@/components/ui/checkbox";
import { CheckIcon } from "@/components/ui/icon";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { LinearGradient } from "expo-linear-gradient";
import { X } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { StravaBrandBridge } from "./StravaBrandBridge";

type StravaHomePromptModalProps = {
  visible: boolean;
  isConnecting?: boolean;
  dontShowAgain: boolean;
  onConnect: () => void;
  onClose: () => void;
  onDontShowAgainChange: (value: boolean) => void;
};

const BENEFITS = [
  "Os treinos do Foltz serão carregados no Strava",
  "Os treinos do Strava são sincronizados com o Foltz para rastrear seu ritmo e ajustar o plano",
  "Acesse suas rotas do Strava no aplicativo Foltz",
];

export function StravaHomePromptModal({
  visible,
  isConnecting = false,
  dontShowAgain,
  onConnect,
  onClose,
  onDontShowAgainChange,
}: StravaHomePromptModalProps) {
  const { height } = useWindowDimensions();
  const modalMaxHeight = Math.max(420, height - 64);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/80">
        <Pressable className="absolute inset-0" onPress={onClose} />

        <View className="flex-1 justify-end px-5 py-8">
          <View
            className="overflow-hidden rounded-[28px] bg-[#0B0F17]"
            style={{ maxHeight: modalMaxHeight }}
          >
            <ScrollView
              bounces={false}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingTop: 20,
                paddingBottom: 24,
              }}
            >
              <View className="flex-row justify-end">
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onClose}
              className="h-9 w-9 items-center justify-center rounded-full bg-[#151B27]"
            >
              <X color="#FFFFFF" size={20} strokeWidth={2.3} />
            </TouchableOpacity>
          </View>

          <Text
            allowFontScaling={false}
            className="mt-2 text-center text-[24px] font-extrabold leading-[32px] text-white"
          >
            Conecte o Strava ao seu programa de corrida
          </Text>

          <Text
            allowFontScaling={false}
            className="mt-3 text-center text-[15px] leading-[22px] text-[#B8BECC]"
          >
            Sincronize suas atividades para importar dados com mais facilidade e manter sua evolução atualizada.
          </Text>

          <View className="mt-8 items-center">
            <StravaBrandBridge />
          </View>

          <View className="mt-8 gap-5">
            {BENEFITS.map((benefit) => (
              <View key={benefit} className="flex-row items-start gap-3">
                <View className="mt-[2px] h-6 w-6 items-center justify-center rounded-full bg-[#151B27]">
                  <CheckIcon className="h-[14px] w-[14px] text-white" />
                </View>

                <Text
                  allowFontScaling={false}
                  className="flex-1 text-[14px] leading-[21px] text-[#C8CFDB]"
                >
                  {benefit}
                </Text>
              </View>
            ))}
          </View>

          <View className="mt-8">
            <Checkbox
              size="sm"
              value={dontShowAgain ? "true" : "false"}
              isChecked={dontShowAgain}
              onChange={onDontShowAgainChange}
            >
              <CheckboxIndicator className="border-[#576077] data-[checked=true]:border-[#FC5200] data-[checked=true]:bg-[#FC5200]">
                <CheckboxIcon as={CheckIcon} className="text-white" />
              </CheckboxIndicator>
              <CheckboxLabel className="text-[13px] text-[#C4C9D4]">
                Não quero ver mais
              </CheckboxLabel>
            </Checkbox>
          </View>

          <View className="mt-7 gap-3">
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
                  minHeight: 58,
                  borderRadius: 999,
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "row",
                  paddingHorizontal: 18,
                }}
              >
                {isConnecting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <FontAwesome5 name="strava" size={17} color="#FFFFFF" />
                    <Text
                      allowFontScaling={false}
                      className="ml-3 text-[16px] font-extrabold text-white"
                    >
                      Conectar com STRAVA
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onClose}
              className="h-[46px] items-center justify-center rounded-full border border-[#252B38] bg-[#11151E]"
            >
              <Text
                allowFontScaling={false}
                className="text-[14px] font-semibold text-[#E5E7EB]"
              >
                Agora não
              </Text>
            </TouchableOpacity>
          </View>
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
}
