import React, { useMemo } from "react";

import { getChipColors } from "../ChipColor"; // Assuming you extracted the color math here

import type { Section } from "@/src/api/sections";
import type { Dispatch, SetStateAction } from "react";

import BookOpen from "@/public/icons/program.svg"; // Adjust path if needed
import { MultiSelect, type Option } from "@/src/components/MultiSelect/MultiSelect";

export type ProgramSelectProps = {
  items: Section[];
  selected: string[];
  setSelected: Dispatch<SetStateAction<string[]>>;
};

/**
 * Component that handles selecting multiple programs for a user.
 */
export function ProgramSelect({ items, selected, setSelected }: ProgramSelectProps) {
  // Map Section data into the generic Option format with colors
  const mappedOptions: Option[] = useMemo(() => {
    return items.map((sec) => {
      // Fallback color if missing, just like your original code
      const hex = typeof sec.color === "string" && sec.color ? sec.color : "#008080";
      const { backgroundColor, textColor } = getChipColors(hex);

      return {
        id: sec._id,
        label: sec.code,
        colorBg: backgroundColor,
        colorText: textColor,
      };
    });
  }, [items]);

  return (
    <MultiSelect
      mode="multiple"
      options={mappedOptions}
      value={selected}
      onChange={setSelected}
      placeholder="Programs"
      searchable={true}
      leftIcon={<BookOpen width={24} height={24} />} // Matches your previous icon sizing
      boldenContent={true}
      width={14} // You can adjust this rem width to fit your table layout perfectly
      withChips={true}
    />
  );
}
