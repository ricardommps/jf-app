import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "@/components/ui/actionsheet";

import { Divider } from "@/components/ui/divider";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { CloseIcon, Icon } from "@/components/ui/icon";

import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import useANotifications from "@/hooks/useNotification";
import { Notification } from "@/types/notification";
import { ProfileType } from "@/types/ProfileType";
import { FlatList, View } from "react-native";
import NotificationItem from "./notification-item";

interface Props {
  open: boolean;
  onClose: () => void;
  profile: ProfileType | null;
}

const Notifications = ({ open, onClose, profile }: Props) => {
  const { notifications } = useANotifications();
  const renderNotification = ({ item }: { item: Notification }) => {
    return <NotificationItem notification={item} profile={profile} />;
  };
  const Separator = () => <Divider />;
  return (
    <Actionsheet isOpen={open} onClose={onClose}>
      <ActionsheetBackdrop />
      <ActionsheetContent className="px-5 min-h-[60%] max-h-[60%] bg-[#2b2b2b]">
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>
        <HStack className="justify-between w-full mt-3">
          <VStack>
            <Heading size="sm" className="font-semibold">
              Notificações
            </Heading>
          </VStack>
          <Pressable onPress={onClose}>
            <Icon as={CloseIcon} size="lg" className="stroke-background-500" />
          </Pressable>
        </HStack>

        <VStack className="w-full mt-5 gap-3 px-3 pb-10">
          <FlatList
            data={notifications}
            renderItem={renderNotification}
            scrollEnabled={true}
            nestedScrollEnabled={true}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={{
              paddingBottom: 10,
              gap: 10,
            }}
            ItemSeparatorComponent={Separator}
            ListEmptyComponent={() => (
              <View style={{ marginTop: 48, alignItems: "center" }}>
                <Text style={{ color: "#fff" }}>Nenhum item encontrado</Text>
              </View>
            )}
          />
        </VStack>
      </ActionsheetContent>
    </Actionsheet>
  );
};

export default Notifications;
