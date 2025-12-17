import { Image } from "@/components/ui/image";
import { useSession } from "@/contexts/Authentication";
import { useNavigation, useRouter } from "expo-router";
import { ArrowLeft, LogOutIcon } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";

interface HeaderProps {
  title?: string;
}

const Header = ({ title }: HeaderProps) => {
  const router = useRouter();
  const navigation = useNavigation();
  const { signOut } = useSession();

  const handleBack = () => {
    if (navigation.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/(home)");
    }
  };

  return (
    <View className="bg-black border-b border-gray-800 px-4">
      <View className="h-14 justify-center">
        {title ? (
          <View className="flex-row items-center justify-between">
            {/* Botão voltar */}
            <TouchableOpacity
              onPress={handleBack}
              className="w-10 h-10 items-center justify-center"
            >
              <ArrowLeft color="white" size={24} />
            </TouchableOpacity>

            {/* Logo + Título */}
            <View className="flex-row items-center gap-2">
              <Image
                source={require("@/assets/images/jf_icone_v1.png")}
                alt="logo"
                className="h-7 w-7"
                resizeMode="contain"
              />
              <Text className="text-white text-lg font-semibold">{title}</Text>
            </View>

            {/* Espaçador */}
            <View className="w-10 h-10" />
          </View>
        ) : (
          <>
            {/* Logo CENTRAL */}
            <View className="absolute left-0 right-0 items-center">
              <Image
                source={require("@/assets/images/jf_reducao_bc.png")}
                alt="image"
                className="h-24 w-24"
                resizeMode="contain"
              />
            </View>

            {/* Ícones à direita */}
            <View className="absolute right-0 flex-row items-center gap-5">
              <TouchableOpacity onPress={() => signOut()}>
                <LogOutIcon color="white" size={26} />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

export default Header;
