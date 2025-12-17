import { Avatar, AvatarImage as Image } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { Pressable } from "@/components/ui/pressable";
import {
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
} from "@/components/ui/toast";
import { uploadFile } from "@/services/upload.service";
import { ProfileType, UserType } from "@/types/ProfileType";
import * as ImagePicker from "expo-image-picker";
import { CameraIcon } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface AvatarImageProps {
  profile: ProfileType | null;
  updateProfile: (updatedUser: Partial<UserType>) => Promise<void>;
}

export default function AvatarImage({
  profile,
  updateProfile,
}: AvatarImageProps) {
  const isDark = true;
  const [modalVisible, setModalVisible] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const toast = useToast();

  const handleAvatarUpload = () => {
    setModalVisible(true);
  };

  const showNewToast = (
    message: string,
    type: "success" | "error" = "error"
  ) => {
    const newId = Math.random().toString();
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

  const uploadAvatar = async (imageAsset: ImagePicker.ImagePickerAsset) => {
    try {
      setIsUploading(true);
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
      showNewToast(
        `Não foi possível atualizar a foto do perfil. ${error}`,
        "error"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const pickImageFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        allowsMultipleSelection: false,
        selectionLimit: 1,
      });

      if (!result.canceled && result.assets?.[0]) {
        // ✅ fecha o modal imediatamente
        setModalVisible(false);

        // pequena espera para evitar flicker visual
        requestAnimationFrame(async () => {
          await uploadAvatar(result.assets[0]);
        });
      } else {
        setModalVisible(false);
      }
    } catch (error) {
      setModalVisible(false);
      showNewToast("Não foi possível selecionar a imagem.", "error");
    }
  };

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
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        // ✅ fecha o modal imediatamente
        setModalVisible(false);

        requestAnimationFrame(async () => {
          await uploadAvatar(result.assets[0]);
        });
      } else {
        setModalVisible(false);
      }
    } catch (error) {
      setModalVisible(false);
      showNewToast("Não foi possível tirar a foto.", "error");
    }
  };

  return (
    <>
      <View
        className={`w-28 h-28 rounded-full ${
          isDark ? "bg-gray-700" : "bg-gray-200"
        } items-center justify-center mb-4 border-4 ${
          isDark ? "border-gray-600" : "border-gray-300"
        }`}
      >
        <Avatar
          size="2xl"
          className="bg-[#2b2b2b9d] items-center justify-center"
        >
          {profile?.avatar ? (
            <Image
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
          className="absolute -bottom-2 -right-2 bg-primary-800 rounded-full p-2 border-2 border-white"
        >
          {isUploading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Icon as={CameraIcon} className="text-black" size="sm" />
          )}
        </Pressable>
      </View>
      <Modal
        transparent
        animationType="fade"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Escolha uma opção</Text>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={pickImageFromGallery}
            >
              <Text style={styles.optionText}>📸 Galeria</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.optionButton}
              onPress={pickImageFromCamera}
            >
              <Text style={styles.optionText}>📷 Câmera</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={[styles.optionButton, styles.cancelButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[styles.optionText, styles.cancelText]}>
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: 320,
    paddingVertical: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  optionButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  optionText: {
    fontSize: 18,
    color: "#007AFF",
    fontWeight: "500",
  },

  divider: {
    height: 1,
    backgroundColor: "#E5E5E5",
    marginHorizontal: 16,
  },
  cancelButton: {
    marginTop: 4,
  },
  cancelText: {
    color: "#FF3B30",
    fontWeight: "600",
  },
});
