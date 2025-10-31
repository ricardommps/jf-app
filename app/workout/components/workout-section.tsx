import {
  Accordion,
  AccordionContent,
  AccordionContentText,
  AccordionHeader,
  AccordionIcon,
  AccordionItem,
  AccordionTitleText,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronDownIcon, ChevronUpIcon } from "@/components/ui/icon";
import { Media } from "@/types/media";
import { MediaInfo } from "@/types/workout";
import React from "react";
import { View } from "react-native";
import WorkoutView from "./workout-view";

interface Props {
  title: string;
  description: string | null;
  medias: Media[];
  mediaOrder: (number | number[])[];
  exerciseInfo: MediaInfo[];
  isWorkoutLoad: boolean;
}

const WorkoutSection = ({
  title,
  description,
  medias,
  mediaOrder,
  exerciseInfo,
  isWorkoutLoad,
}: Props) => {
  if (!description && (!medias || medias.length === 0 || !mediaOrder?.length))
    return null;
  return (
    <Accordion
      size="md"
      variant="filled"
      type="multiple"
      isCollapsible={true}
      isDisabled={false}
      defaultValue={[title]}
      className="border-outline-200 bg-background-0"
    >
      <AccordionItem value={title} className="rounded-xl">
        <AccordionHeader>
          <AccordionTrigger>
            {({ isExpanded }) => {
              return (
                <>
                  <AccordionTitleText>{title}</AccordionTitleText>
                  {isExpanded ? (
                    <AccordionIcon as={ChevronUpIcon} className="ml-3" />
                  ) : (
                    <AccordionIcon as={ChevronDownIcon} className="ml-3" />
                  )}
                </>
              );
            }}
          </AccordionTrigger>
        </AccordionHeader>
        <AccordionContent>
          <View style={{ minHeight: "auto", paddingBottom: 16 }}>
            {description && (
              <AccordionContentText className="pb-5">
                {description}
              </AccordionContentText>
            )}
            {medias && medias.length > 0 && (
              <WorkoutView
                medias={medias}
                mediaOrder={mediaOrder}
                exerciseInfo={exerciseInfo}
                isWorkoutLoad={isWorkoutLoad}
              />
            )}
          </View>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default WorkoutSection;
