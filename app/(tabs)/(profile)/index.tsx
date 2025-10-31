import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge, BadgeText } from "@/components/ui/badge";
import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import { Divider } from "@/components/ui/divider";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Pressable } from "@/components/ui/pressable";
import { ScrollView } from "@/components/ui/scroll-view";
import { Text } from "@/components/ui/text";
import {
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
} from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { useSession } from "@/contexts/Authentication";
import useANotifications from "@/hooks/useNotification";
import { uploadFile } from "@/services/upload.service";
import { ProfileType } from "@/types/ProfileType";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import {
  CameraIcon,
  ChevronRightIcon,
  CircleDollarSignIcon,
  MailIcon,
  SquareAsteriskIcon,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Modal,
  Text as RNText,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Notifications from "./components/notifications";

const DashboardLayout = (props: any) => {
  return (
    <VStack className="h-full w-full bg-background-0">
      <Box className="md:hidden"></Box>
      <VStack className="h-full w-full">
        <HStack className="h-full w-full">
          <VStack className="w-full flex-1">{props.children}</VStack>
        </HStack>
      </VStack>
    </VStack>
  );
};

interface MainContentProps {
  setShowNotifications: (show: boolean) => void;
  profile: ProfileType | null;
  handleInvoice: () => void;
  handleAvatarUpload: () => void;
  handlePassword: () => void;
}

const MainContent = ({
  setShowNotifications,
  profile,
  handleInvoice,
  handleAvatarUpload,
  handlePassword,
}: MainContentProps) => {
  const { notifications } = useANotifications();
  return (
    <VStack className="h-full w-full mb-16 md:mb-0">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 160,
          flexGrow: 1,
        }}
      >
        <VStack className="h-full w-full pb-8" space="2xl">
          <Box className="relative w-full md:h-[478px] h-[250px] bg-[#2b2b2b3b]" />
          <HStack className="absolute pt-6 px-10 hidden md:flex">
            <Text className="text-typography-900 font-roboto">
              home &gt; {` `}
            </Text>
            <Text className="font-semibold text-typography-900 ">profile</Text>
          </HStack>
          <Center className="absolute md:mt-14 mt-6 w-full md:px-10 md:pt-6 pb-4">
            <VStack space="lg" className="items-center">
              <Box className="relative">
                <Avatar
                  size="2xl"
                  className="bg-[#2b2b2b9d] items-center justify-center"
                >
                  {profile?.avatar ? (
                    <AvatarImage
                      source={{
                        uri: profile.avatar,
                      }}
                    />
                  ) : (
                    <Text className="text-white font-bold text-3xl">
                      {(profile?.name || profile?.email || "User")
                        .split(" ")
                        .map((n) => n.charAt(0))
                        .join("")
                        .substring(0, 2)
                        .toUpperCase()}
                    </Text>
                  )}
                </Avatar>
                <Pressable
                  onPress={handleAvatarUpload}
                  className="absolute -bottom-2 -right-2 bg-primary-500 rounded-full p-2 border-2 border-white"
                >
                  <Icon as={CameraIcon} className="text-white" size="sm" />
                </Pressable>
              </Box>
              <VStack className="gap-1 w-full items-center">
                <Text size="2xl" className="font-roboto text-white">
                  {profile?.name}
                </Text>
                <Text className="font-roboto text-sm text-typograpphy-700 text-white">
                  {profile?.email}
                </Text>
              </VStack>
            </VStack>
          </Center>
          <VStack className="mx-2" space="2xl">
            <VStack className="py-2 px-4 border border-primary-100 rounded-xl border-border-300 justify-between items-center bg-[#2b2b2b9d]">
              <Pressable
                onPress={() => setShowNotifications(true)}
                className="w-full"
              >
                <HStack
                  space="2xl"
                  className="justify-between items-center w-full py-3 px-2"
                >
                  <Box className="relative">
                    {notifications && notifications?.length > 0 && (
                      <Badge
                        variant="solid"
                        className="absolute -top-2 -right-3 bg-red-500 rounded-full z-10 px-[6px] py-[2px]"
                      >
                        <BadgeText className="text-white text-[10px] font-semibold">
                          {notifications?.length}
                        </BadgeText>
                      </Badge>
                    )}
                    <HStack className="items-center" space="md">
                      <Icon as={MailIcon} className="text-typography-700" />
                      <Text size="lg" className="text-typography-700">
                        Notificações
                      </Text>
                    </HStack>
                  </Box>
                  <Icon as={ChevronRightIcon} className="text-typography-700" />
                </HStack>
              </Pressable>
              <Divider orientation="horizontal" />
              <Pressable onPress={handlePassword} className="w-full">
                <HStack
                  space="2xl"
                  className="justify-between items-center w-full flex-1 py-3 px-2"
                >
                  <HStack className="items-center" space="md">
                    <Icon
                      as={SquareAsteriskIcon}
                      className="text-typography-700"
                    />
                    <Text size="lg" className="text-typography-700">
                      Senha
                    </Text>
                  </HStack>
                  <Icon as={ChevronRightIcon} className="text-typography-700" />
                </HStack>
              </Pressable>
              <Divider orientation="horizontal" />
              <Pressable onPress={handleInvoice} className="w-full">
                <HStack
                  space="2xl"
                  className="justify-between items-center w-full flex-1 py-3 px-2"
                >
                  <HStack className="items-center" space="md">
                    <Icon
                      as={CircleDollarSignIcon}
                      className="text-typography-700"
                    />
                    <Text size="lg" className="text-typography-700">
                      Financeiro
                    </Text>
                  </HStack>
                  <Icon as={ChevronRightIcon} className="text-typography-700" />
                </HStack>
              </Pressable>
            </VStack>
          </VStack>
        </VStack>
      </ScrollView>
    </VStack>
  );
};

const Profile = () => {
  const router = useRouter();
  const toast = useToast();
  const [showNotifications, setShowNotifications] = useState(false);
  const [toastId, setToastId] = useState<string>("");
  const { getProfile, updateProfile } = useSession();
  const { onGetNotifications } = useANotifications();
  const profile = getProfile();

  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    onGetNotifications();
    requestPermissions();
  }, []);

  const showNewToast = (
    message: string,
    type: "success" | "error" = "error"
  ) => {
    const newId = Math.random().toString();
    setToastId(newId);
    toast.show({
      id: newId,
      placement: "top",
      duration: 9000,
      render: ({ id }) => {
        const uniqueToastId = "toast-" + id;
        return (
          <Toast nativeID={uniqueToastId} action={type} variant="solid">
            <ToastTitle>{type === "success" ? "Sucesso" : "Erro"}</ToastTitle>
            <ToastDescription>{message}</ToastDescription>
          </Toast>
        );
      },
    });
  };

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      showNewToast(
        "Precisamos de acesso à sua galeria para alterar a foto do perfil.",
        "error"
      );
    }
  };

  // Abrir modal para escolha
  const handleAvatarUpload = () => {
    setModalVisible(true);
  };

  // Escolher galeria
  const pickImageFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images", // <- minúsculo
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        await uploadAvatar(result.assets[0]);
      }
      setModalVisible(false);
    } catch (error) {
      console.error("Erro ao selecionar da galeria:", error);
      showNewToast("Não foi possível selecionar a imagem.", "error");
    }
  };

  // Escolher câmera
  const pickImageFromCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        showNewToast(
          "Precisamos de acesso à câmera para tirar uma foto.",
          "error"
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: "images", // <- minúsculo
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        await uploadAvatar(result.assets[0]);
      }
      setModalVisible(false);
    } catch (error) {
      console.error("Erro ao tirar foto:", error);
      showNewToast("Não foi possível tirar a foto.", "error");
    }
  };

  const uploadAvatar = async (imageAsset: ImagePicker.ImagePickerAsset) => {
    try {
      const formData = new FormData();
      formData.append("file", {
        uri: imageAsset.uri,
        type: imageAsset.mimeType || "image/jpeg",
        name: "avatar.jpg",
      } as any);

      const data = await uploadFile(formData);

      await updateProfile({
        avatar: data.url || data.avatar || data.imageUrl,
      });

      showNewToast("Foto do perfil atualizada com sucesso!", "success");
    } catch (error) {
      console.error("Erro no upload:", error);
      showNewToast(
        `Não foi possível atualizar a foto do perfil. ${error}`,
        "error"
      );
    }
  };

  const handleInvoice = () => {
    router.push(`/invoice` as any);
  };

  const handlePassword = () => {
    router.push("/password" as any);
  };

  return (
    <SafeAreaView className="h-full w-full">
      <DashboardLayout title="Perfil">
        <MainContent
          setShowNotifications={setShowNotifications}
          profile={profile}
          handleInvoice={handleInvoice}
          handleAvatarUpload={handleAvatarUpload}
          handlePassword={handlePassword}
        />
      </DashboardLayout>
      <Notifications
        open={showNotifications}
        onClose={() => setShowNotifications(false)}
        profile={profile}
      />

      {/* Modal customizado para escolher foto */}
      <Modal
        transparent
        animationType="fade"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={pickImageFromGallery}
            >
              <RNText style={styles.optionText}>Galeria</RNText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={pickImageFromCamera}
            >
              <RNText style={styles.optionText}>Câmera</RNText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionButton, styles.cancelButton]}
              onPress={() => setModalVisible(false)}
            >
              <RNText style={[styles.optionText, styles.cancelText]}>
                Cancelar
              </RNText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: 280,
    paddingVertical: 16,
  },
  optionButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  optionText: {
    fontSize: 18,
    color: "#007AFF",
  },
  cancelButton: {
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    marginTop: 8,
  },
  cancelText: {
    color: "#FF3B30",
    fontWeight: "600",
  },
});

export default Profile;
