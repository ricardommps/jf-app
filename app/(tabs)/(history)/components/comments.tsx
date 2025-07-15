import {
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "@/components/ui/actionsheet";
import { Actionsheet } from "@/components/ui/actionsheet";
import { Box } from "@/components/ui/box";
import { Divider } from "@/components/ui/divider";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { CloseIcon } from "@/components/ui/icon";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { useState } from "react";
import { TextInput } from "react-native";

interface Props {
  open: boolean;
  onClose: () => void;
}

const Comments = ({ open, onClose }: Props) => {
  const [comment, setComment] = useState("");
  return (
    <Actionsheet isOpen={open} onClose={onClose}>
      <ActionsheetBackdrop />
      <ActionsheetContent className="px-5 min-h-[60%] flex-col">
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>
        <HStack className="justify-between w-full mt-3">
          <VStack>
            <Heading size="sm" className="font-semibold">
              Comentários
            </Heading>
          </VStack>
          <Pressable onPress={onClose}>
            <Icon as={CloseIcon} size="lg" className="stroke-background-500" />
          </Pressable>
        </HStack>

        <VStack className="w-full mt-5 gap-3 px-3 mr-3">
          <Divider orientation="horizontal" />
          <HStack space="lg" className="w-full px-4 py-2">
            <Avatar className="h-10 w-10">
              <AvatarImage
                source={{
                  uri: "https://res.cloudinary.com/dtjwulffm/image/upload/v1739747120/hcxfxm5bvgvufqkkekiw.jpg",
                }}
              />
            </Avatar>
            <VStack className="flex-1">
              <HStack className="justify-between w-full">
                <Text className="text-typography-900 font-roboto line-clamp-1">
                  Ricardo Matta
                </Text>
                <Text className="text-sm font-roboto line-clamp-1">1 dia</Text>
              </HStack>
              <Text className="text-sm font-roboto line-clamp-1">
                Treino feito com sucesso!
              </Text>
            </VStack>
          </HStack>
          <HStack space="lg" className="w-full px-9 py-2">
            <Avatar className="h-8 w-8">
              <AvatarImage
                source={require("@/assets/images/logo_header.png")}
              />
            </Avatar>
            <VStack className="flex-1">
              <HStack className="justify-between w-full">
                <Text className="text-typography-900 font-roboto line-clamp-1">
                  Joana Foltz
                </Text>
                <Text className="text-sm font-roboto line-clamp-1">2hs</Text>
              </HStack>
              <Text className="text-sm font-roboto">
                Bom treino, parabéns, mas faltou 10 min!
              </Text>
            </VStack>
          </HStack>
          <HStack space="lg" className="w-full px-9 py-2">
            <Avatar className="h-8 w-8">
              <AvatarImage
                source={{
                  uri: "https://res.cloudinary.com/dtjwulffm/image/upload/v1739747120/hcxfxm5bvgvufqkkekiw.jpg",
                }}
              />
            </Avatar>
            <VStack className="flex-1">
              <HStack className="justify-between w-full">
                <Text className="text-typography-900 font-roboto line-clamp-1">
                  Ricardo Matta
                </Text>
                <Text className="text-sm font-roboto line-clamp-1">2min</Text>
              </HStack>
              <Text className="text-sm font-roboto">Estava cansado.</Text>
            </VStack>
          </HStack>
        </VStack>

        {/* Input fixado no rodapé */}
        <Box className="w-full px-3 py-2 absolute bottom-0">
          <HStack className="items-center w-full px-2 py-3 mt-5 space-x-3 border-t border-border gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage
                source={{
                  uri: "https://res.cloudinary.com/dtjwulffm/image/upload/v1739747120/hcxfxm5bvgvufqkkekiw.jpg",
                }}
              />
            </Avatar>
            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder="Adicione um comentário..."
              placeholderTextColor="#A1A1AA"
              className="flex-1 rounded-full px-4 py-2 bg-gray-900 text-sm text-typography-900"
            />
            <Pressable
              onPress={() => {
                /* ação de enviar comentário */
              }}
            >
              <Text className="text-typography-700 font-semibold">Enviar</Text>
            </Pressable>
          </HStack>
        </Box>
      </ActionsheetContent>
    </Actionsheet>
  );
};

export default Comments;
