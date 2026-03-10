import React, { useEffect, useMemo, useRef, useState } from "react";

import styles from "./MultiSelect.module.css";

type Option = {
  id: string;
  label: string;
};

export const MultiSelect: React.FC<{
  options: Option[];
  value?: string[];
  onChange?: (value: string[]) => void;
  label?: string;
  withChips?: boolean;
  required?: boolean;
  fitContent?: boolean;
  placeholder?: string;
}> = ({
  options,
  value = [], // Default to empty array
  onChange,
  label,
  required,
  withChips = false,
  fitContent = false,
  placeholder = "Select...",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Derive the full option objects based on the selected IDs passed via `value`
  const selectedOptions = useMemo(() => {
    return options.filter((opt) => value.includes(opt.id));
  }, [options, value]);

  // filter options based on search string
  const filteredOptions = useMemo(() => {
    return options.filter((opt) => opt.label.toLowerCase().includes(search.toLowerCase()));
  }, [options, search]);

  // click outside to close
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // reset search when closing
  useEffect(() => {
    if (!isOpen) setSearch("");
  }, [isOpen]);

  const toggleOption = (option: Option) => {
    if (!onChange) return; // Safety check

    const isCurrentlySelected = value.includes(option.id);

    if (isCurrentlySelected) {
      // Remove the ID if it's already selected
      onChange(value.filter((id) => id !== option.id));
    } else {
      // Add the ID if it's not selected
      onChange([...value, option.id]);
    }
  };

  return (
    <div className={styles.container} ref={containerRef}>
      {label && (
        <label className={styles.label}>
          {label} {required && <span className={styles.required}>*</span>}
        </label>
      )}

      <div
        className={`${styles.control} ${fitContent ? styles.fitContent : ""}`}
        role="combobox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className={styles.values}>
          {selectedOptions.length > 0 ? (
            withChips ? (
              // Render as chips
              selectedOptions.map((s) => (
                <span key={s.id} className={styles.chip}>
                  {s.label}
                </span>
              ))
            ) : (
              // Render as comma-separated string
              <span className={styles.selectedText}>
                {selectedOptions.map((s) => s.label).join(", ")}
              </span>
            )
          ) : (
            <span className={styles.placeholder}>{placeholder}</span>
          )}
        </div>
        <svg
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
          viewBox="0 0 24 24"
        >
          <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>

      {isOpen && (
        <div className={styles.popover} role="listbox">
          <input
            autoFocus
            className={styles.searchInput}
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClick={(e) => e.stopPropagation()} // prevent closing on click
          />
          <div className={styles.listContainer}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isSelected = value.includes(option.id);
                return (
                  <div
                    key={option.id}
                    className={`${styles.option} ${isSelected ? styles.optionSelected : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleOption(option);
                    }}
                  >
                    <span className={withChips ? styles.chip : styles.optionLabel}>
                      {option.label}
                    </span>
                    {isSelected && <span className={styles.checkIcon}>✓</span>}
                  </div>
                );
              })
            ) : (
              <div className={styles.noResults}>No matches found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
