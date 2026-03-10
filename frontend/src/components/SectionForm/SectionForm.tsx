import { useRouter } from "next/dist/client/components/navigation";
import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

import { Modal } from "../Modal";
import { MultiStepForm } from "../MultiStep/MultiStepForm";
import { MultiSelectDropdown } from "../Studentform/MultiSelectDropdown";
import { spawnSuccessDialog } from "../SuccessPopup/SuccessPopup";

// Section Form Modal 'Steps'
import { StepOneClassDetails } from "./SectionFormSteps/StepOneClassDetails";
import { StepThreeEnrolled } from "./SectionFormSteps/StepThreeEnrolled";
import { StepTwoMeetingTimes } from "./SectionFormSteps/StepTwoMeetingTimes";

// Make sure to import getSectionById and updateSection
import { createSection, getSectionById, updateSection } from "@/src/api/sections"; 

const COLOR_REGEX = /^#(?:[0-9a-f]{3}){1,2}$/i;

export const sectionDraftSchema = z.object({
  code: z.string().min(1, "Class name is required").max(100, "Class name is too long"),
  color: z.string().regex(COLOR_REGEX, "Please select a valid color"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  days: z.array(z.string()).min(1, "Please select at least one meeting day"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  teachers: z.array(z.string()).min(1, "Please assign at least one teacher"),
  enrolledStudents: z.array(z.string()).optional().default([]),
});

export type SectionDraft = z.infer<typeof sectionDraftSchema>;

export const INITIAL_SECTION_DATA: SectionDraft = {
  code: "",
  color: "",
  startDate: "",
  endDate: "",
  days: [],
  startTime: "",
  endTime: "",
  teachers: [],
  enrolledStudents: [],
};

export const CLASS_COLORS = [
  "#b6b8ba",
  "#17aac4",
  "#25ca7d",
  "#416f7e",
  "#d54525",
  "#da7a51",
  "#ffbe31",
];

export const classFormSteps = [
  {
    id: "step-1",
    title: "General",
    description: "Fill out class name and choose color",
    fields: ["code", "color"],
    component: <StepOneClassDetails />,
  },
  {
    id: "step-2",
    title: "Times",
    description: "Fill out class meeting times and duration",
    fields: ["startDate", "endDate", "days", "startTime", "endTime"] as const,
    component: <StepTwoMeetingTimes />,
  },
  {
    id: "step-3",
    title: "People",
    description: "Fill out class teachers and students",
    fields: ["teachers", "enrolledStudents"] as const,
    component: <StepThreeEnrolled />,
  },
];

function StepTwoStudents() {
  const { setValue, watch } = useFormContext<SectionDraft>();
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

// 1. Added optional sectionId prop
type SectionFlowProps = {
  active: boolean;
  onClose: () => void;
  sectionId?: string; 
};

export function CreateSectionFlow({ active, onClose, sectionId }: SectionFlowProps) {
  const router = useRouter();
  
  // 2. Added state to handle fetching and default values
  const [defaultValues, setDefaultValues] = useState<SectionDraft>(INITIAL_SECTION_DATA);
  const [isLoading, setIsLoading] = useState(false);

  // 3. Fetch data if sectionId exists
  useEffect(() => {
    async function fetchSectionData() {
      if (!sectionId || !active) return;
      
      setIsLoading(true);
      const response = await getSectionById(sectionId);
      
      if (response.success && response.data) {
        const { data } = response;
        
        // Extract YYYY-MM-DD from the ISO strings for the date inputs
        const formattedFormStartDate = data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : "";
        const formattedFormEndDate = data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : "";

        setDefaultValues({
          code: data.code || "",
          color: data.color || "",
          days: data.days || [],
          startTime: data.startTime || "",
          endTime: data.endTime || "",
          startDate: formattedFormStartDate,
          endDate: formattedFormEndDate,
          teachers: data.teachers || [],
          enrolledStudents: data.enrolledStudents || [],
        });
      } else {
        console.error("Failed to fetch section data");
      }
      setIsLoading(false);
    }

    if (sectionId) {
      void fetchSectionData();
    } else {
      // Reset if we're creating a new one
      setDefaultValues(INITIAL_SECTION_DATA);
    }
  }, [sectionId, active]);

  const onFinalSubmit = async (data: SectionDraft, storageKey: string) => {
    try {
      const formattedStartDate = new Date(`${data.startDate}T${data.startTime}:00`).toISOString();
      const formattedEndDate = new Date(`${data.endDate}T${data.endTime}:00`).toISOString();

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

      // 4. Branch logic based on whether we are editing or creating
      let response;
      if (sectionId) {
        response = await updateSection({ _id: sectionId, ...payload });
      } else {
        response = await createSection(payload);
      }

      if (response.success) {
        const successMessage = `${response.data.code} Successfully ${sectionId ? "Updated" : "Created"}`;
        localStorage.removeItem(storageKey);
        spawnSuccessDialog(successMessage);
        onClose();
        router.refresh(); // Optional: trigger a Next.js server component refresh to show new data
      }
    } catch (error) {
      console.error("Submission failed:", error);
    }
  };

  if (!active) {
    return null;
  }

  // Prevent form from rendering with empty default values while fetching
  if (sectionId && isLoading) {
    // You can replace this with your app's actual loading spinner component
    return (
      <Modal 
        onExit={onClose} 
        child={<div className="p-8 text-center">Loading section data...</div>} 
      />
    );
  }

  return (
    <>
      <Modal
        onExit={onClose}
        child={
          <MultiStepForm<SectionDraft>
            schema={sectionDraftSchema}
            // Pass the dynamic default values here
            defaultValues={defaultValues} 
            steps={classFormSteps}
            mode={sectionId ? "edit" : "create"} 
            storageKey={sectionId ? `section_draft_${sectionId}` : "section_draft_storage"}
            formTitle={"Class"}
            onSubmit={(finalData) => {
              void onFinalSubmit(finalData, sectionId ? `section_draft_${sectionId}` : "section_draft_storage");
            }}
            onCancel={onClose}
          />
        }
      />
    </>
  );
}