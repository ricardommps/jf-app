import { Image } from "@/components/ui/image";
import { useSession } from "@/contexts/Authentication";
import { useNotificationV2UnreadCount } from "@/hooks/useNotificationV2";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { ArrowLeft, Bell, LogOutIcon } from "lucide-react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface HeaderProps {
  title?: string;
  showNotifications?: boolean;
  showProfileShortcut?: boolean;
  profileShortcutSize?: number;
  showLogout?: boolean;
  backRoute?: string;
}

const Header = ({
  title,
  showNotifications = false,
  showProfileShortcut = false,
  profileShortcutSize = 48,
  showLogout = false,
  backRoute,
}: HeaderProps) => {
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams<{ fromMenu?: string }>();
  const { getProfile, signOut } = useSession();
  const { unreadCount } = useNotificationV2UnreadCount({
    enabled: showNotifications,
  });
  const profile = getProfile();

  const initials = (profile?.name || profile?.email || "U")
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleBack = () => {
    if (params.fromMenu === "1") {
      router.replace("/(tabs)/(menu)" as any);
      return;
    }

    if (backRoute) {
      router.replace(backRoute as any);
      return;
    }

    if (navigation.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/(home)");
    }
  };

  const handleNotifications = () => {
    router.push("/notifications-v2" as any);
  };

  const handleProfileShortcut = () => {
    navigation.navigate("(menu)" as never);
  };

  return (
    <View className="bg-black border-b border-gray-800 px-4 pt-4">
      <View className={`${title ? "h-[68px]" : "h-14"} justify-center`}>
        {title ? (
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={handleBack}
              className="w-10 h-10 items-center justify-center"
            >
              <ArrowLeft color="white" size={24} />
            </TouchableOpacity>

            <View className="flex-row items-center gap-3">
              <Image
                source={require("@/assets/images/jf_icone_v1.png")}
                alt="logo"
                className="h-12 w-12"
                resizeMode="contain"
              />
              <Text className="text-white text-lg font-semibold">{title}</Text>
            </View>

            <View className="w-10 h-10" />
          </View>
        ) : (
          <>
            {showProfileShortcut ? (
              <View className="absolute left-0 top-0 bottom-0 z-10 flex-row items-center justify-center">
                <TouchableOpacity
                  onPress={handleProfileShortcut}
                  style={[
                    styles.profileShortcut,
                    {
                      width: profileShortcutSize,
                      height: profileShortcutSize,
                      borderRadius: profileShortcutSize / 2,
                    },
                  ]}
                  className="overflow-hidden items-center justify-center"
                >
                  {profile?.avatar ? (
                    <Image
                      source={{ uri: profile.avatar }}
                      alt="avatar"
                      className="h-full w-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <Text className="text-sm font-semibold text-white">
                      {initials}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : null}

            <View
              pointerEvents="box-none"
              className="absolute left-0 right-0 top-0 bottom-0 items-center justify-center"
            >
              <Image
                source={require("@/assets/images/jf_reducao_bc.png")}
                alt="image"
                className="h-9 w-33"
                resizeMode="contain"
              />
            </View>

            <View className="absolute right-0 top-0 bottom-0 flex-row items-center justify-center gap-5">
              {showNotifications ? (
                <TouchableOpacity
                  onPress={handleNotifications}
                  className="h-10 w-10 items-center justify-center"
                >
                  <Bell color="white" size={24} />
                  {unreadCount > 0 ? (
                    <View className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-[#2D64FF] px-1.5 py-[1px] items-center justify-center">
                      <Text className="text-[10px] font-semibold text-white">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </Text>
                    </View>
                  ) : null}
                </TouchableOpacity>
              ) : null}

              {showLogout ? (
                <TouchableOpacity onPress={() => signOut()}>
                  <LogOutIcon color="white" size={26} />
                </TouchableOpacity>
              ) : null}
            </View>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  profileShortcut: {
    borderWidth: 1.5,
    borderColor: "#9CA3AF",
    backgroundColor: "#122130",
  },
});

export default Header;
