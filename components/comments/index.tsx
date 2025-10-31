import { useEffect, useRef } from "react";
import ActionSheet, { ActionSheetRef } from "react-native-actions-sheet";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Divider } from "@/components/ui/divider";
import { HStack } from "@/components/ui/hstack";
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
  const actionSheetRef = useRef<ActionSheetRef>(null);
  const { getProfile } = useSession();
  const profile = getProfile();

  const getFormattedTimeAgo = (day: string): string => getTimePassedText(day);

  // Controla abertura/fechamento via ref e efeito
  useEffect(() => {
    if (open) {
      actionSheetRef.current?.setModalVisible(true);
    } else {
      actionSheetRef.current?.setModalVisible(false);
    }
  }, [open]);

  return (
    <ActionSheet
      ref={actionSheetRef}
      onClose={onClose}
      containerStyle={{
        paddingHorizontal: 20,
        minHeight: "60%",
        backgroundColor: "#2b2b2b",
      }}
      gestureEnabled
    >
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
          className={`w-full ${content?.comments ? "px-9 py-3" : "px-0 py-0"} `}
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
    </ActionSheet>
  );
};

export default Comments;
