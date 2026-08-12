import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Divider } from "@/components/ui/divider";
import { HStack } from "@/components/ui/hstack";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import {
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
} from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { useSession } from "@/contexts/Authentication";
import { markCommentsAsRead, sendComment } from "@/services/comment.service";
import { CommentContent, CommentItem } from "@/types/commnets.type";
import { getTimePassedText } from "@/utils/get-time-passed";
import { X } from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface NotificationV2CommentsModalProps {
  open: boolean;
  onClose: () => void;
  content: CommentContent | null;
  finishedId: number | null;
  onCommentSent?: () => void | Promise<void>;
}

const NotificationV2CommentsModal = ({
  open,
  onClose,
  content,
  finishedId,
  onCommentSent,
}: NotificationV2CommentsModalProps) => {
  const toast = useToast();
  const { getProfile } = useSession();
  const profile = getProfile();
  const flatListRef = useRef<FlatList>(null);

  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!open || !content?.comments?.length) {
      return;
    }

    const unreadIds = content.comments
      .filter((item) => item.isAdmin && !item.read)
      .map((item) => item.id);

    if (!unreadIds.length) {
      return;
    }

    const markAsRead = async () => {
      try {
        await markCommentsAsRead(unreadIds);
      } catch (error) {
        console.error("Erro ao marcar comentários como lidos:", error);
      }
    };

    markAsRead();
  }, [open, content]);

  const sortedComments = useMemo(() => {
    return (
      content?.comments
        ?.slice()
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        ) || []
    );
  }, [content]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const timeout = setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: false });
    }, 150);

    return () => clearTimeout(timeout);
  }, [open, sortedComments.length]);

  const showNewToast = (
    messageText: string,
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
            <ToastDescription>{messageText}</ToastDescription>
          </Toast>
        );
      },
    });
  };

  const handleSend = async () => {
    if (!message.trim() || isSending || !finishedId) {
      return;
    }

    setIsSending(true);

    try {
      const lastComment = sortedComments[sortedComments.length - 1];

      await sendComment({
        finishedId,
        content: message.trim(),
        parentId: lastComment ? lastComment.id : null,
      });

      setMessage("");

      if (onCommentSent) {
        await onCommentSent();
      }

      showNewToast("Seu comentário foi publicado com sucesso!", "success");

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 150);
    } catch (error) {
      console.error(error);
      showNewToast("Não foi possível enviar seu comentário.");
    } finally {
      setIsSending(false);
    }
  };

  const renderItem = ({ item }: { item: CommentItem }) => {
    const isAdmin = item.isAdmin;

    return (
      <HStack
        className={`mb-4 w-full ${isAdmin ? "justify-start" : "justify-end"}`}
      >
        {isAdmin ? (
          <Avatar className="mr-2 h-12 w-12">
            <AvatarImage
              source={require("@/assets/images/jf_icone_app.png")}
              className="h-12 w-12 rounded-full"
            />
          </Avatar>
        ) : null}

        <VStack
          className={`max-w-[75%] rounded-2xl px-4 py-3 ${
            isAdmin ? "bg-[#3a3a3a]" : "bg-blue-600"
          }`}
        >
          <Text className="mb-1 text-xs opacity-70">
            {isAdmin ? "Joana Foltz" : item.author?.name}
          </Text>

          <Text className="text-sm">{item.content}</Text>

          <Text className="mt-2 text-[10px] opacity-60">
            {getTimePassedText(item.createdAt)}
          </Text>
        </VStack>

        {!isAdmin ? (
          <Avatar className="ml-2 h-9 w-9">
            {item.author?.avatar ? (
              <AvatarImage source={{ uri: item.author.avatar }} />
            ) : null}
          </Avatar>
        ) : null}
      </HStack>
    );
  };

  return (
    <Modal
      visible={open}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-black">
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View className="flex-1 bg-black">
            <View className="flex-row items-center justify-between border-b border-[#303543] px-5 py-4">
              <TouchableOpacity
                onPress={onClose}
                className="h-10 w-10 items-center justify-center"
                activeOpacity={0.8}
              >
                <X color="#FFFFFF" size={22} strokeWidth={2.3} />
              </TouchableOpacity>

              <Text className="text-lg font-semibold text-white">
                Comentários
              </Text>

              <View className="w-10" />
            </View>

            <FlatList
              ref={flatListRef}
              data={sortedComments}
              keyExtractor={(item) => String(item.id)}
              renderItem={renderItem}
              keyboardShouldPersistTaps="handled"
              className="flex-1"
              contentContainerStyle={{
                flexGrow: 1,
                padding: 12,
                paddingTop: 14,
              }}
              ListEmptyComponent={() => (
                <View className="flex-1 items-center justify-center px-6 py-10">
                  <Text className="text-center text-sm text-[#A1A1AA]">
                    Nenhum comentário disponível.
                  </Text>
                </View>
              )}
            />

            <Divider />

            <View className="bg-black px-4 py-3">
              <HStack className="items-center gap-3">
                <Avatar className="h-12 w-12">
                  {profile?.avatar ? (
                    <AvatarImage
                      source={{ uri: profile.avatar }}
                      className="h-12 w-12"
                    />
                  ) : null}
                </Avatar>

                <TextInput
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Comentário..."
                  placeholderTextColor="#888"
                  style={{
                    flex: 1,
                    backgroundColor: "#111",
                    borderRadius: 25,
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    color: "white",
                  }}
                />

                <Pressable
                  onPress={handleSend}
                  disabled={!message.trim() || isSending}
                >
                  {isSending ? (
                    <ActivityIndicator size="small" color="#3b82f6" />
                  ) : (
                    <Text
                      className={`font-semibold ${
                        message.trim() ? "text-blue-500" : "text-gray-600"
                      }`}
                    >
                      Enviar
                    </Text>
                  )}
                </Pressable>
              </HStack>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

export default NotificationV2CommentsModal;
