import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "@/components/ui/actionsheet";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Divider } from "@/components/ui/divider";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { CloseIcon, Icon } from "@/components/ui/icon";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useSession } from "@/contexts/Authentication";
import { getTimePassedText } from "@/utils/get-time-passed";

interface Props {
  open: boolean;
  onClose: () => void;
  content: {
    feedback: string;
    comments: string;
    executionDay: string;
    updatedAt: string;
  } | null;
}

const Comments = ({ open, onClose, content }: Props) => {
  const { getProfile } = useSession();
  const profile = getProfile();
  const getFormattedTimeAgo = (day: string): string => {
    return getTimePassedText(day);
  };
  return (
    <Actionsheet isOpen={open} onClose={onClose}>
      <ActionsheetBackdrop />
      <ActionsheetContent className="px-5 min-h-[60%] flex-col bg-[#2b2b2b]">
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
          {content?.comments && (
            <HStack space="lg" className="w-full px-4 py-2">
              <Avatar className="h-10 w-10 bg-blue-500 items-center justify-center">
                {profile?.avatar ? (
                  <AvatarImage
                    source={{
                      uri: profile.avatar,
                    }}
                  />
                ) : (
                  <Text className="text-white font-bold text-sm">
                    {(profile?.name || profile?.email || "User")
                      .split(" ")
                      .map((n) => n.charAt(0))
                      .join("")
                      .substring(0, 2)
                      .toUpperCase()}
                  </Text>
                )}
              </Avatar>
              <VStack className="flex-1">
                <HStack className="justify-between w-full">
                  <Text className="text-typography-900 font-roboto line-clamp-1">
                    {profile?.name}
                  </Text>
                  {content.executionDay && (
                    <Text className="text-sm font-roboto line-clamp-1">
                      {getFormattedTimeAgo(content.executionDay)}
                    </Text>
                  )}
                </HStack>
                <Text className="text-sm font-roboto line-clamp-1">
                  {content?.comments}
                </Text>
              </VStack>
            </HStack>
          )}

          <HStack
            space="lg"
            className={`w-full ${
              content?.comments ? "px-9 py-3" : "px-0 py-0"
            } `}
            style={{ alignItems: "flex-start" }}
          >
            <Avatar
              className="h-10 w-10 items-center justify-center"
              style={{ flexShrink: 0 }}
            >
              <AvatarImage
                source={require("@/assets/images/jf_icone_v1.png")}
                resizeMode="contain"
                className="h-9 w-9"
              />
            </Avatar>
            <VStack className="flex-1">
              <HStack className="justify-between w-full">
                <Text className="text-typography-900 font-roboto line-clamp-1">
                  Joana Foltz
                </Text>
                {content?.updatedAt && (
                  <Text className="text-sm font-roboto line-clamp-1">
                    {getFormattedTimeAgo(content.updatedAt)}
                  </Text>
                )}
              </HStack>
              <Text className="text-sm font-roboto">{content?.feedback}</Text>
            </VStack>
          </HStack>
        </VStack>

        {/* Input fixado no rodapé */}
        {/* <Box className="w-full px-3 py-2 absolute bottom-0">
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
            <Pressable>
              <Text className="text-typography-700 font-semibold">Enviar</Text>
            </Pressable>
          </HStack>
        </Box> */}
      </ActionsheetContent>
    </Actionsheet>
  );
};

export default Comments;
