import React, { useEffect, useMemo } from "react";

import BookIcon from "@/public/icons/nav/programs.svg";
import { getChipColors } from "@/src/components/ChipColor";
import { MultiSelect, type Option } from "@/src/components/MultiSelect/MultiSelect";

export type Section = {
  _id: string;
  code: string;
  teachers: string[];
  enrolledStudents: string[];
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
  archived: boolean;
  color: string;
  days: string[];
  createdAt: string;
};

type SectionSelectProps = {
  sections: Section[];
  value: string;
  onChange: (id: string) => void;
};

export function SectionSelect({ sections, value, onChange }: SectionSelectProps) {
  // 1. Auto-select the first section if no value is currently selected
  useEffect(() => {
    if (!value && sections.length > 0) {
      onChange(sections[0]._id);
    }
  }, [sections, value, onChange]);

  // 2. Map Section data and calculate dynamic chip colors
  const mappedOptions: Option[] = useMemo(() => {
    return sections.map((sec) => {
      // Calculate the readable colors based on the backend hex code
      const { backgroundColor, textColor } = getChipColors(sec.color);

      return {
        id: sec._id,
        label: sec.code,
        colorBg: backgroundColor,
        colorText: textColor,
      };
    });
  }, [sections]);

  // 3. Render the multi-select
  return (
    <MultiSelect
      mode="single"
      options={mappedOptions}
      value={value}
      onChange={onChange}
      placeholder="Select Section"
      searchable={true}
      leftIcon={<BookIcon />}
      boldenContent={true}
      width={12}
      withChips={true}
    />
  );
}
