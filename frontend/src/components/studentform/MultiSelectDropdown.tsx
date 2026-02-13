/**
 * Multiselect dropdown component for the Student Create/Edit forms.
 * Fetches all sections from database and populates a multiselect dropdown bar
 * and updates important states automatically.
 *
 * // TODO: Convert program IDs to colors and show colored backgrounds for buttons
 * // TODO: Add checkmark icon for selected items
 */

import React, { useEffect, useMemo, useRef, useState } from "react";

import { getAllSections } from "../../api/sections";

import styles from "./MultiSelectDropdown.module.css";

import type { Section } from "../../api/sections";

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

  required?: boolean;
  disabled?: boolean;
  placeholder?: string;

  getLabel?: (section: SectionLike) => string;
  getValue?: (section: SectionLike) => string;
};
/**
 * Styling for different programs. Hash the program id for consistency
 * across different refreshes and users.
 */
type ProgramStyle = {
  bg: string;
  text: string;
};

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

  const sectionIdToProgramId = useMemo(() => {
    const m = new Map<string, string | undefined>();
    for (const s of sections) {
      m.set(getValue(s), typeof s.program === "string" ? s.program : undefined);
    }
    return m;
  }, [sections, getValue]);

  // Fetch sections once on mount
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        getAllSections()
          .then(async (res) => {
            if (!res.success) {
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

    load().catch((e) => setError((e as Error).message));
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

  const selectedLabels = useMemo(() => {
    if (sections.length === 0) return [];
    const map = new Map(sections.map((s) => [getValue(s), getLabel(s)]));
    return value.map((id) => map.get(id) ?? id);
  }, [sections, value, getLabel, getValue]);

  const triggerClass = open ? `${styles.trigger} ${styles.triggerOpen}` : styles.trigger;

  return (
    <div ref={rootRef} className={styles.root}>
      {label && (
        <div className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </div>
      )}

      <button
        type="button"
        className={triggerClass}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={styles.triggerText}>
          {loading
            ? "Loading sections..."
            : selectedLabels.length > 0
              ? value.map((id, i) => {
                  const l = selectedLabels[i] ?? id;
                  const prog = sectionIdToProgramId.get(id);
                  const c = programStyle(prog);

                  return (
                    <div
                      key={id}
                      className={styles.chosen}
                      style={{
                        background: c.bg,
                        color: c.text,
                      }}
                    >
                      {l}
                    </div>
                  );
                })
              : placeholder}
        </span>
      </button>

      {open && (
        <div className={styles.panel} role="listbox" aria-multiselectable="true">
          {error ? (
            <div className={styles.errorBox}>
              <div className={styles.errorText}>Error: {error}</div>
              <button
                type="button"
                className={styles.retryBtn}
                onClick={() => {
                  setLoading(true);
                  setError(null);
                  getAllSections()
                    .then(async (res) => {
                      if (!res.success) throw new Error("Failed to load sections");
                      const data = res.data;
                      if (!Array.isArray(data))
                        throw new Error("Invalid /api/sections response: expected an array");
                      const normalized = data.filter(
                        (x: Section) => x && typeof x === "object" && typeof x._id === "string",
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
          ) : (
            <>
              {sections.length === 0 && !loading ? (
                <div className={styles.statusText}>No sections found.</div>
              ) : (
                <div className={styles.list}>
                  {sections.map((s) => {
                    const id = getValue(s);
                    const text = getLabel(s);
                    const checked = selectedSet.has(id);

                    const prog = typeof s.program === "string" ? s.program : undefined;
                    const c = programStyle(prog);

                    let className = styles.listItem;
                    if (checked) className += ` ${styles.listItemSelected}`;

                    return (
                      <div className={className} key={id}>
                        <button
                          type="button"
                          className={styles.itemBtn}
                          onClick={() => toggle(id)}
                          style={{
                            background: c.bg,
                            color: c.text,
                          }}
                        >
                          {text}
                        </button>
                        <img alt="check icon" className={styles.selectedIcon} />
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
