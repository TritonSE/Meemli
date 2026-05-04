import React, { useEffect, useMemo, useState } from "react";

import { getAllSections, type Section } from "../../api/sections";
import { getChipColors } from "../ChipColor"; // Assuming this is where you extracted the utility
import { MultiSelect, type Option } from "../MultiSelect/MultiSelect";

type MultiSelectDropdownProps = {
  label?: string;
  value: string[];
  onChange: (next: string[]) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
};

export function MultiSelectDropdown({
  label = "Enroll in Sections",
  value,
  onChange,
  required,
  disabled = false,
  placeholder = "Select sections...",
}: MultiSelectDropdownProps) {
  // State for fetching
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch sections once on mount
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await getAllSections();

        if (!cancelled && res.success) {
          const data = res.data;

          if (Array.isArray(data)) {
            const normalized = data.filter(
              (x) => x && typeof x === "object" && typeof x._id === "string",
            );
            setSections(normalized);
          } else {
            setError("Invalid data format received.");
          }
        } else if (!cancelled && !res.success) {
          setError("Failed to load sections from server.");
        }
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Convert API Section data into the clean Option[] format with dynamic chip colors
  const formattedOptions: Option[] = useMemo(() => {
    return sections.map((s) => {
      // Use the actual section color from the backend, fallback if missing
      const hex = typeof s.color === "string" && s.color ? s.color : "#008080";
      const { backgroundColor, textColor } = getChipColors(hex);

      return {
        id: s._id,
        label: s.code || s._id,
        colorBg: backgroundColor,
        colorText: textColor,
      };
    });
  }, [sections]);

  if (error) {
    return <div style={{ color: "red", fontSize: 12 }}>Error loading sections: {error}</div>;
  }

  return (
    <MultiSelect
      mode="multiple"
      label={label}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      placeholder={placeholder}
      options={formattedOptions}
      withChips={true}
      isLoading={loading}
      fullWidth={true}
    />
  );
}
