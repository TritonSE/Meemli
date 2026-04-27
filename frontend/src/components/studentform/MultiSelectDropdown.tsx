import React, { useEffect, useMemo, useState } from "react";
import { getAllSections } from "../../api/sections";
import { MultiSelectNew, type Option } from "../MultiSelectNew/MultiSelectNew"; 

// Types
import type { Section } from "../../api/sections";

type SectionLike = {
  _id: string;
  code?: string;
  program?: string;
  [key: string]: unknown;
};

type MultiSelectDropdownProps = {
  label?: string;
  value: string[];
  onChange: (next: string[]) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
};

// Color Hashing Logic (Kept exactly the same)
type ProgramStyle = { bg: string; text: string };

const PALETTE: ProgramStyle[] = [
  { bg: "#D8EFE8", text: "#233E3A" },
  { bg: "#FDE4D7", text: "#771817" },
  { bg: "#E7F5FE", text: "#1B3A4B" },
  { bg: "#FAFBC6", text: "#6C4917" },
];

function hashToIndex(input: string, mod: number) {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return h % mod;
}

function programStyle(programId?: string): ProgramStyle {
  if (!programId) return { bg: "transparent", text: "inherit" };
  return PALETTE[hashToIndex(programId, PALETTE.length)];
}

export function MultiSelectDropdown({
  label = "Assigned Program(s)",
  value,
  onChange,
  required,
  disabled = false,
  placeholder = "Select sections...",
}: MultiSelectDropdownProps) {
  // State for fetching
  const [sections, setSections] = useState<SectionLike[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch sections once on mount
  // Fetch sections once on mount
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        console.log("1. Starting to fetch sections..."); // <-- DEBUG LOG
        const res = await getAllSections();
        console.log("2. API Response:", res); // <-- DEBUG LOG

        if (!cancelled && res.success) {
          const data = res.data;
          
          // Re-added the safety check from your original file!
          if (Array.isArray(data)) {
            const normalized = data.filter(
              (x) => x && typeof x === "object" && typeof x._id === "string"
            );
            console.log("3. Normalized Data:", normalized); // <-- DEBUG LOG
            setSections(normalized);
          } else {
            console.error("API did not return an array!", data);
            setError("Invalid data format received.");
          }
        } else if (!cancelled && !res.success) {
          console.error("API returned success: false");
          setError("Failed to load sections from server.");
        }
      } catch (e) {
        console.error("Fetch threw an error:", e);
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

  // Convert your API Section data into the clean Option[] format our new UI expects
  const formattedOptions: Option[] = useMemo(() => {
    return sections.map((s) => {
      const prog = typeof s.program === "string" ? s.program : undefined;
      const colors = programStyle(prog);

      return {
        id: s._id,
        // Fallback to _id if code is missing, just like your old getLabel function
        label: (typeof s.code === "string" && s.code) || s._id, 
        colorBg: colors.bg,
        colorText: colors.text,
      };
    });
  }, [sections]);

  // If there's an error fetching, you could return an error UI here, 
  // or pass an empty array to the select.
  if (error) {
    return <div style={{ color: "red", fontSize: 12 }}>Error loading sections: {error}</div>;
  }

  // Return the new UI component, feeding it the formatted data!
  return (
    <MultiSelectNew
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