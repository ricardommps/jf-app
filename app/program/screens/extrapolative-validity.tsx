import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
} from "@/components/ui/modal";
import { CloseIcon, Icon } from "@/components/ui/icon";

import { ThemeContext } from "@/contexts/theme-context";
import { useContext } from "react";
import { VStack } from "@/components/ui/vstack";
const ExtrapolativeValidity = ({ modalVisible, setModalVisible }: any) => {
  const { colorMode }: any = useContext(ThemeContext);
  return (
    <Box>
      {/* Modal: example */}
      <Modal
        size="md"
        isOpen={modalVisible}
        onClose={() => {
          setModalVisible(false);
        }}
        avoidKeyboard
      >
        <ModalBackdrop />
        <ModalContent className="p-4">
          <ModalHeader>
            <HStack className="items-center">
              <Heading size="sm" className="font-semibold">
                List your place
              </Heading>
            </HStack>
            <ModalCloseButton>
              <Icon
                as={CloseIcon}
                className="w-4 h-4"
                color={colorMode === "light" ? "#404040" : "#A3A3A3"}
              />
            </ModalCloseButton>
          </ModalHeader>
          <ModalBody className="mb-0">
            <VStack space="md">
              <Heading size="sm" className="font-semibold">
                ModalBody
              </Heading>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ExtrapolativeValidity;
