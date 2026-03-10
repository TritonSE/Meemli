import { useRouter } from "next/dist/client/components/navigation";
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

import { createSection } from "@/src/api/sections";

// define regex to match backend requirements
const COLOR_REGEX = /^#(?:[0-9a-f]{3}){1,2}$/i;

// 1. The Zod Schema
export const sectionDraftSchema = z.object({
  // Step 1
  code: z.string().min(1, "Class name is required").max(100, "Class name is too long"),
  color: z.string().regex(COLOR_REGEX, "Please select a valid color"),

  // Step 2
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  days: z.array(z.string()).min(1, "Please select at least one meeting day"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),

  // Step 3
  teachers: z.array(z.string()).min(1, "Please assign at least one teacher"),
  enrolledStudents: z.array(z.string()).optional().default([]),
});

export type SectionDraft = z.infer<typeof sectionDraftSchema>;

// default schema data
export const INITIAL_SECTION_DATA: SectionDraft = {
  code: "",
  color: "#e0e0e0", // default to the first color in your list
  startDate: "",
  endDate: "",
  days: [],
  startTime: "",
  endTime: "",
  teachers: [],
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

// 2. The Steps Configuration for MultiStepForm
// This ensures `trigger(fieldsToValidate)` works correctly when clicking "Next"
export const classFormSteps = [
  {
    id: "step-1",
    title: "Class Details",
    fields: ["code", "color"],
    component: <StepOneClassDetails />,
  },
  {
    id: "step-2",
    title: "Meeting Times",
    fields: ["startDate", "endDate", "days", "startTime", "endTime"] as const,
    component: <StepTwoMeetingTimes />,
  },
  {
    id: "step-3",
    title: "Enrolled",
    fields: ["teachers", "enrolledStudents"] as const,
    component: <StepThreeEnrolled />,
  },
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

export function CreateSectionFlow({ active, onClose }: SectionFlowProps) {
  const router = useRouter();

  // 1. Move the submit handler INSIDE the component so it can access 'router' and 'onClose'
  const onFinalSubmit = async (data: SectionDraft, storageKey: string) => {
    try {
      // Merge Date + Time into ISO format
      const formattedStartDate = new Date(`${data.startDate}T${data.startTime}:00`).toISOString();
      const formattedEndDate = new Date(`${data.endDate}T${data.endTime}:00`).toISOString();

      // Construct the final payload for Mongoose
      const payload = {
        code: data.code,
        color: data.color,
        days: data.days,
        startTime: data.startTime,
        endTime: data.endTime,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        teachers: data.teachers,
        enrolledStudents: data.enrolledStudents,
        archived: false,
      };

      // Send to Backend
      const response = await createSection(payload);

      if (response.success) {
        // Clear local storage
        localStorage.removeItem(storageKey);

        // Close the modal and redirect ONLY on success
        onClose();
      }
    } catch (error) {
      console.error("Submission failed:", error);
      // Trigger a toast or error notification here
    }
  };

  if (!active) {
    return null; // Return null instead of undefined for empty React renders
  }

  return (
    <Modal
      onExit={onClose}
      child={
        <MultiStepForm<SectionDraft>
          schema={sectionDraftSchema}
          defaultValues={INITIAL_SECTION_DATA}
          steps={classFormSteps}
          mode="create"
          storageKey="section_draft_storage"
          formTitle="Class"
          // 2. Wire up the onSubmit prop to your internal function
          onSubmit={(finalData) => {
            void onFinalSubmit(finalData, "section_draft_storage");
          }}
          onCancel={onClose}
        />
      }
    />
  );
}
