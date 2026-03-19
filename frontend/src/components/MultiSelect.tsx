"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

import styles from "./CustomSelect.module.css";

type Option = { label: string; value: string };

export const MultiSelect = function CustomSelect({
  options,
  values,
  onChange,
  placeholder,
}: {
  options: Option[];
  values: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = options
    .filter((o) => values.includes(o.value))
    .map((o) => o.label)
    .join(", ");

  return (
    <div ref={ref} className={styles.wrapper}>
      <button
        type="button"
        className={`${styles.trigger} ${open ? styles.triggerOpen : ""}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={selectedLabel ? styles.selectedText : styles.placeholder}>
          {selectedLabel ?? placeholder ?? "Select"}
        </span>
        <ChevronDown size={14} className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`} />
      </button>

      {open && (
        <div className={styles.panel}>
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`${styles.option} ${values.includes(opt.value) ? styles.optionSelected : ""}`}
              onClick={() => {
                const next = values.includes(opt.value)
                  ? values.filter((v) => v !== opt.value)
                  : [...values, opt.value];
                onChange(next);
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
