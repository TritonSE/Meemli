import React from "react";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

import { Modal } from "../Modal";
import { MultiStepForm } from "../MultiStep/MultiStepForm";
import { MultiSelectDropdown } from "../Studentform/MultiSelectDropdown";

// Section Form Modal 'Steps'
import { StepOneClassDetails } from "./SectionFormSteps/StepOneClassDetails";
import { StepThreeEnrolled } from "./SectionFormSteps/StepThreeEnrolled";
import { StepTwoMeetingTimes } from "./SectionFormSteps/StepTwoMeetingTimes";

// define regex to match backend requirements
const COLOR_REGEX = /^#(?:[0-9a-f]{3}){1,2}$/i;

// updated zod schema for step 1
export const sectionSchema = z.object({
  // 'code' in backend maps to 'Class Name' in UI
  code: z.string().min(1, "Class name is required").max(100, "Class name is too long"), // assuming a reasonable max

  color: z.string().regex(COLOR_REGEX, "Please select a valid color"),

  // these are needed for final submission but optional for step 1 validation
  teacherId: z.string().optional(),
  enrolledStudents: z.array(z.string()).optional(),
});

export type SectionDraft = z.infer<typeof sectionSchema>;

// default schema data
export const INITIAL_SECTION_DATA: SectionDraft = {
  code: "",
  color: "#e0e0e0", // default to the first color in your list
  teacherId: "",
  enrolledStudents: [],
};

export const CLASS_COLORS = [
  "#e0e0e0",
  "#d84315",
  "#ffca28",
  "#00acc1",
  "#d87a56",
  "#455a64",
  "#26a69a",
];

// Step 2 Component: Uses watch and setValue for complex/custom controlled inputs
function StepTwoStudents() {
  const { setValue, watch } = useFormContext<SectionDraft>();

  // Watch the current value of the field so the dropdown UI stays updated
  const enrolledStudents = watch("enrolledStudents");

  return (
    <div>
      <MultiSelectDropdown
        label="Enroll Students"
        value={enrolledStudents}
        onChange={(students) =>
          setValue("enrolledStudents", students, {
            shouldValidate: true,
            shouldDirty: true,
          })
        }
      />
    </div>
  );
}

type SectionFlowProps = {
  active: boolean;
  onClose: () => void;
};

// Main Component to be rendered inside a Modal or Page wrapper
export function CreateSectionFlow({ active, onClose }: SectionFlowProps) {
  // Map out the steps configuring title, validation fields, and UI component

  if (!active) {
    return;
  }

  const steps = [
    {
      id: "details",
      title: "Fill out class name and chose color",
      fields: ["code", "color"] as const,
      component: <StepOneClassDetails />,
    },
    {
      id: "meeting-times",
      title: "Fill out class meeting times and duration",
      fields: [""] as const,
      component: <StepTwoMeetingTimes />,
    },
    {
      id: "enrollment",
      title: "Enroll teachers and student in the class",
      fields: ["teacherId", "enrolledStudents"] as const,
      component: <StepThreeEnrolled />,
    },
  ];

  return (
    <Modal
      onExit={onClose}
      child={
        <MultiStepForm<SectionDraft>
          schema={sectionSchema}
          defaultValues={INITIAL_SECTION_DATA}
          steps={steps}
          mode="create"
          storageKey="section_draft_storage"
          formTitle="Class"
          onSubmit={(finalData) => {
            console.log("Submitting Section to API:", finalData);
            onClose();
          }}
          onCancel={onClose}
        />
      }
    />
  );
}
