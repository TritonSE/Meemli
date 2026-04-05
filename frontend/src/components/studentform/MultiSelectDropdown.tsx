/**
 * Multiselect dropdown component for the Student Create/Edit forms.
 * Fetches all sections from database and populates a multiselect dropdown bar
 * and updates important states automatically.
 *
 * // TODO: Convert program IDs to colors and show colored backgrounds for buttons
 * // TODO: Add checkmark icon for selected items
 */

import { Check } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";

import { getAllSections } from "../../api/sections";
import { getChipColors } from "../ChipColor";

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
  value: string[];
  onChange: (next: string[]) => void;

  required?: boolean;
  disabled?: boolean;
  placeholder?: string;

  getLabel?: (section: SectionLike) => string;
  getValue?: (section: SectionLike) => string;
};

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
                  const section = sections.find((s) => getValue(s) === id);
                  const hex =
                    typeof section?.color === "string" && section.color ? section.color : "#008080";
                  const { backgroundColor, textColor } = getChipColors(hex);

                  return (
                    <div
                      key={id}
                      className={styles.chosen}
                      style={{
                        background: backgroundColor,
                        color: textColor,
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
                    const hex = typeof s.color === "string" && s.color ? s.color : "#008080";
                    const { backgroundColor, textColor } = getChipColors(hex);

                    let className = styles.listItem;
                    if (checked) className += ` ${styles.listItemSelected}`;

                    return (
                      <div className={className} key={id}>
                        <button
                          type="button"
                          className={styles.itemBtn}
                          onClick={() => toggle(id)}
                          style={{
                            background: backgroundColor,
                            color: textColor,
                          }}
                        >
                          {text}
                        </button>
                        {checked && <Check className={styles.selectedIcon} />}
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
