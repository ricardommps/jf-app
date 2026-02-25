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
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  TextInput,
  View,
} from "react-native";
import ActionSheet, { ActionSheetRef } from "react-native-actions-sheet";

interface Props {
  open: boolean;
  onClose: () => void;
  content: CommentContent | null;
  finishedId: number | null;
  onCommentSent?: () => void; // 👈 adicionar
}

const Comments = ({
  open,
  onClose,
  content,
  finishedId,
  onCommentSent,
}: Props) => {
  const toast = useToast();
  const actionSheetRef = useRef<ActionSheetRef>(null);
  const { getProfile } = useSession();
  const profile = getProfile();
  const queryClient = useQueryClient();

  const flatListRef = useRef<FlatList>(null);

  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [toastId, setToastId] = useState<string>("");

  useEffect(() => {
    if (open) {
      actionSheetRef.current?.setModalVisible(true);
    } else {
      actionSheetRef.current?.setModalVisible(false);
    }
  }, [open]);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(50);
    });

    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (!open || !content?.comments?.length) return;
    const unreadIds = content.comments
      .filter((item) => item.isAdmin && !item.read)
      .map((item) => item.id);

    if (unreadIds.length === 0) return;

    const markAsRead = async () => {
      try {
        await markCommentsAsRead(unreadIds);

        await queryClient.invalidateQueries({
          queryKey: ["history"],
        });
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

  const handleSend = async () => {
    if (!message.trim() || isSending || !finishedId) return;

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
        onCommentSent(); // 👈 dispara reload no pai
      }
      await queryClient.invalidateQueries({
        queryKey: ["history"],
      });
      showNewToast("Seu comentário foi publicado com sucesso!", "success");
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 150);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  const showNewToast = (
    message: string,
    type: "success" | "error" = "error",
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

  const renderItem = ({ item }: { item: CommentItem }) => {
    const isAdmin = item.isAdmin;
    return (
      <HStack
        className={`w-full mb-4 ${isAdmin ? "justify-start" : "justify-end"}`}
      >
        {isAdmin && (
          <Avatar className="h-12 w-12 mr-2">
            <AvatarImage
              source={require("@/assets/images/jf_icone_app.png")}
              className="h-12 w-12 rounded-full"
            />
          </Avatar>
        )}

        <VStack
          className={`max-w-[75%] px-4 py-3 rounded-2xl ${
            isAdmin ? "bg-[#3a3a3a]" : "bg-blue-600"
          }`}
        >
          <Text className="text-xs opacity-70 mb-1">
            {isAdmin ? "Joana Foltz" : item.author?.name}
          </Text>

          <Text className="text-sm">{item.content}</Text>

          <Text className="text-[10px] opacity-60 mt-2">
            {getTimePassedText(item.createdAt)}
          </Text>
        </VStack>

        {!isAdmin && (
          <Avatar className="h-9 w-9 ml-2">
            {item.author?.avatar ? (
              <AvatarImage source={{ uri: item.author.avatar }} />
            ) : null}
          </Avatar>
        )}
      </HStack>
    );
  };

  return (
    <ActionSheet
      ref={actionSheetRef}
      onClose={onClose}
      containerStyle={{
        backgroundColor: "#202020",
        paddingBottom: 25,
      }}
      gestureEnabled
    >
      {/* Título */}
      <View className="items-center py-3 border-b border-gray-800">
        <Text className="text-white font-semibold">Comentários</Text>
      </View>

      {/* Lista */}
      <FlatList
        ref={flatListRef}
        data={sortedComments}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={{
          paddingBottom: 100,
          padding: 8,
          paddingTop: 10,
        }}
      />

      <Divider />
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          paddingBottom: keyboardHeight, // 👈 aqui cria o espaçamento
          backgroundColor: "#202020",
        }}
      >
        <HStack className="items-center gap-3">
          <Avatar className="h-12 w-12">
            {profile?.avatar && (
              <AvatarImage
                source={{ uri: profile.avatar }}
                className="h-12 w-12"
              />
            )}
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
    </ActionSheet>
  );
};

export default Comments;
