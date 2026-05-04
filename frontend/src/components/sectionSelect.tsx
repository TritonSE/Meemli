import React, { useEffect, useMemo } from "react";

import BookIcon from "@/public/icons/nav/programs.svg";
import { MultiSelectNew, type Option } from "@/src/components/MultiSelectNew/MultiSelectNew";

// --- Color Utility Functions ---
function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  const bigint = Number.parseInt(clean, 16);

  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

function hexToHsl(hex: string) {
  let { r, g, b } = hexToRgb(hex);

  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function getChipColors(color: string) {
  const { h, s, l } = hexToHsl(color);
  const backgroundColor = `hsl(${h}, ${s}%, ${Math.min(l + 35, 92)}%)`; // lighter
  const textColor = `hsl(${h}, ${s}%, ${Math.max(l - 35, 15)}%)`; // darker
  return { backgroundColor, textColor };
}
// --------------------------------

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
    <MultiSelectNew
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
