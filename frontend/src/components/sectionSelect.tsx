import React, { useEffect, useMemo } from "react";

import type { Option } from "@/src/components/MultiSelectNew/MultiSelectNew";

import BookIcon from "@/public/icons/nav/programs.svg";
import { MultiSelectNew } from "@/src/components/MultiSelectNew/MultiSelectNew";

// Assuming this matches your existing Section type
export type Section = {
  _id: string;
  code: string;
  // ... any other section properties
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

  // 2. Map your specific Section data into the generic Option format
  const mappedOptions: Option[] = useMemo(() => {
    return sections.map((sec) => ({
      id: sec._id,
      label: sec.code,
    }));
  }, [sections]);

  // 3. Return the dumb UI component configured for a single string value
  return (
    <MultiSelectNew
      mode="single"
      options={mappedOptions}
      value={value}
      onChange={onChange}
      placeholder="Select Section"
      searchable={true} // Set to false if you don't want the search bar
      fullWidth={true}
      leftIcon={<BookIcon />}
      boldenContent={true}
    />
  );
}
