/**
 * Multiselect dropdown component for the Student Create/Edit forms.
 * Fetches all sections from database and populates a multiselect dropdown bar
 * and updates important states automatically.
 */

import React, { useEffect, useMemo, useRef, useState } from "react";

import { getAllSections } from "../api/sections";

import type { Section } from "../api/sections";

type SectionLike = {
  _id: string;
  code?: string;
  program?: string;
  // allow extra fields without TS errors
  [key: string]: unknown;
};

type MultiSelectDropdownProps = {
  label?: string;
  /** Selected section ids */
  value: string[];
  /** Called with next selected ids */
  onChange: (next: string[]) => void;

  disabled?: boolean;
  placeholder?: string;

  getLabel?: (section: SectionLike) => string;
  getValue?: (section: SectionLike) => string;
};

export function MultiSelectDropdown({
  label = "Assigned Program(s)",
  value,
  onChange,
  disabled = false,
  placeholder,
  getLabel = (s) => (typeof s.code === "string" && s.code) || s._id,
  getValue = (s) => s._id,
}: MultiSelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const [sections, setSections] = useState<SectionLike[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rootRef = useRef<HTMLDivElement | null>(null);
  // will recalculate every time a check is ticked or unticked
  const selectedSet = useMemo(() => new Set(value), [value]);

  // Fetch sections once on mount
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        getAllSections()
        .then(async (res) => {
          if (!res.success){
            return;
          }
          const data = res.data;
          setSections(data);

        })
        .catch((e) => setError((e as Error).message))
        .finally(() => setLoading(false));
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load()
    .catch((e) => setError((e as Error).message));
    return () => {
      cancelled = true;
    };
  }, []);

  // Close on outside click
  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      const root = rootRef.current;
      if (!root) return;
      if (!root.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  function toggle(id: string) {
    if (disabled) return;
    if (selectedSet.has(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  }

  function clearAll() {
    if (disabled) return;
    onChange([]);
  }

  const selectedLabels = useMemo(() => {
    if (sections.length === 0) return [];
    const map = new Map(sections.map((s) => [getValue(s), getLabel(s)]));
    return value.map((id) => map.get(id) ?? id);
  }, [sections, value, getLabel, getValue]);

  return (
    <div ref={rootRef}>
      {label && (
        <div>
          <div>{label}</div>
        </div>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {loading
          ? "Loading sections..."
          : selectedLabels.length > 0
          ? selectedLabels.join(", ")
          : placeholder}
      </button>

      {open && (
        <div role="listbox" aria-multiselectable="true">
          {error && (
            <div>
              <div>Error: {error}</div>
              <button
                type="button"
                onClick={() => {
                  // quick retry: re-run effect logic inline
                  setLoading(true);
                  setError(null);
                  getAllSections()
                    .then(async (res) => {
                      if (!res.success) throw new Error(`Failed to load sections`);
                      const data = res.data;
                      if (!Array.isArray(data)) throw new Error("Invalid /api/sections response: expected an array");
                      const normalized = data.filter(
                        (x: Section) => x && typeof x === "object" && typeof x._id === "string"
                      );
                      setSections(normalized);
                    })
                    .catch((e) => setError((e as Error).message))
                    .finally(() => setLoading(false));
                }}
              >
                Retry
              </button>
            </div>
          )}

          {!error && (
            <>
              <button type="button" onClick={clearAll} disabled={disabled || value.length === 0}>
                Clear
              </button>

              {sections.length === 0 && !loading ? (
                <div>No sections found.</div>
              ) : (
                <ul>
                  {sections.map((s) => {
                    const id = getValue(s);
                    const text = getLabel(s);
                    const checked = selectedSet.has(id);

                    return (
                      <li key={id}>
                        <label>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggle(id)}
                            disabled={disabled}
                          />
                          {text}
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
