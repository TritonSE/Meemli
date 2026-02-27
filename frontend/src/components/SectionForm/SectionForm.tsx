import React from "react";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

import { MultiStepForm } from "../MultiStep/MultiStepForm";
import { MultiSelectDropdown } from "../studentform/MultiSelectDropdown";
import { TextField } from "../TextField";

import styles from "./SectionForm.module.css";

// Define the validation schema using Zod as the single source of truth
export const sectionSchema = z.object({
  sectionName: z.string().min(3, "Section name must be at least 3 characters"),
  teacherId: z.string().optional(),
  enrolledStudents: z.array(z.string()).min(1, "Must enroll at least one student"),
});

// Infer the TypeScript type directly from the Zod schema to keep types in sync
export type SectionDraft = z.infer<typeof sectionSchema>;

// Define the initial default values for form hydration
const INITIAL_SECTION_DATA: SectionDraft = {
  sectionName: "",
  teacherId: "",
  enrolledStudents: [],
};

// Step 1 Component: Leverages react-hook-form's register for standard inputs
function StepOneName() {
  const {
    register,
    formState: { errors },
  } = useFormContext<SectionDraft>();

  return (
    <div className={styles.formRow}>
      <TextField label="Section Name" {...register("sectionName")} required />
      {/* Optional: Add error rendering if TextField supports it, or render a span below */}

      <TextField label="Teacher ID" {...register("teacherId")} />
    </div>
  );
}

// Step 2 Component: Uses watch and setValue for complex/custom controlled inputs
function StepTwoStudents() {
  const { setValue, watch } = useFormContext<SectionDraft>();

  // Watch the current value of the field so the dropdown UI stays updated
  const enrolledStudents = watch("enrolledStudents");

  return (
    <div className={styles.formRow}>
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

// Main Component to be rendered inside a Modal or Page wrapper
export function CreateSectionFlow({ onClose }: { onClose: () => void }) {
  // Map out the steps configuring title, validation fields, and UI component
  const steps = [
    {
      id: "details",
      title: "Section Details",
      fields: ["sectionName", "teacherId"] as const,
      component: <StepOneName />,
    },
    {
      id: "enrollment",
      title: "Enroll Students",
      fields: ["enrolledStudents"] as const,
      component: <StepTwoStudents />,
    },
  ];

  return (
    <MultiStepForm<SectionDraft>
      schema={sectionSchema}
      defaultValues={INITIAL_SECTION_DATA}
      steps={steps}
      mode="create"
      storageKey="section_draft_storage"
      formTitle="Section"
      onSubmit={(finalData) => {
        // Implement API call logic here
        console.log("Submitting Section to API:", finalData);
        onClose();
      }}
      onCancel={onClose}
    />
  );
}
