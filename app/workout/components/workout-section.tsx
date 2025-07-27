import { MediaInfo } from "@/types/workout";
import {
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
  AccordionTitleText,
  AccordionContentText,
  AccordionIcon,
  AccordionContent,
} from "@/components/ui/accordion";
import { ChevronUpIcon, ChevronDownIcon } from "@/components/ui/icon";
import WorkoutView from "./workout-view";
import { ScrollView } from "react-native";
import React from "react";
import { Media } from "@/types/media";

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
      <AccordionItem value={title} className="bg-[#2b2b2b9d] rounded-xl m-3">
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
          {description && (
            <AccordionContentText>{description}</AccordionContentText>
          )}
          {medias && medias.length > 0 && (
            <WorkoutView
              medias={medias}
              mediaOrder={mediaOrder}
              exerciseInfo={exerciseInfo}
              isWorkoutLoad={isWorkoutLoad}
            />
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default WorkoutSection;
