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
import { forwardRef, useImperativeHandle, useState } from "react";
import {
  ActivityIndicator,
  Image as RNImage,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export interface AvatarImageHandle {
  openPicker: () => void;
}

interface AvatarImageProps {
  profile: ProfileType | null;
  updateProfile: (updatedUser: Partial<UserType>) => Promise<void>;
  size?: number;
  showTrigger?: boolean;
  borderColor?: string;
}

const getInitials = (profile: ProfileType | null) =>
  (profile?.name || profile?.email || "User")
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .substring(0, 2)
    .toUpperCase();

const AvatarImage = forwardRef<AvatarImageHandle, AvatarImageProps>(
  (
    {
      profile,
      updateProfile,
      size = 112,
      showTrigger = true,
      borderColor,
    },
    ref,
  ) => {
    const isDark = true;
    const [modalVisible, setModalVisible] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const toast = useToast();

    useImperativeHandle(ref, () => ({
      openPicker: () => setModalVisible(true),
    }));

    const handleAvatarUpload = () => {
      setModalVisible(true);
    };

    const showNewToast = (
      message: string,
      type: "success" | "error" = "error",
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
          "error",
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
          setModalVisible(false);

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
            "error",
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
          style={[
            styles.avatarFrame,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: borderColor ? 3 : 0,
              borderColor: borderColor ?? "transparent",
              backgroundColor: isDark ? "#122130" : "#E5E7EB",
            },
          ]}
        >
          {profile?.avatar ? (
            <RNImage
              source={{ uri: profile.avatar }}
              resizeMode="cover"
              style={{
                width: "100%",
                height: "100%",
                borderRadius: size / 2,
              }}
            />
          ) : (
            <Text className="text-white font-bold text-3xl">
              {getInitials(profile)}
            </Text>
          )}

          {showTrigger ? (
            <Pressable
              onPress={handleAvatarUpload}
              style={styles.triggerButton}
              className="border-2 border-white"
            >
              {isUploading ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <Icon as={CameraIcon} className="text-black" size="sm" />
              )}
            </Pressable>
          ) : null}
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
                <Text style={styles.optionText}>Galeria</Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity
                style={styles.optionButton}
                onPress={pickImageFromCamera}
              >
                <Text style={styles.optionText}>Câmera</Text>
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
  },
);

AvatarImage.displayName = "AvatarImage";

export default AvatarImage;

const styles = StyleSheet.create({
  avatarFrame: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    overflow: "hidden",
  },
  triggerButton: {
    position: "absolute",
    right: -4,
    bottom: -4,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#37DEBC",
    alignItems: "center",
    justifyContent: "center",
  },
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
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginVertical: 16,
    color: "#111827",
  },
  optionButton: {
    paddingVertical: 16,
    alignItems: "center",
  },
  optionText: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginHorizontal: 16,
  },
  cancelButton: {
    marginTop: 4,
  },
  cancelText: {
    color: "#ef4444",
  },
});
