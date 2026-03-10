import React, { useEffect, useId, useMemo, useRef, useState } from "react";

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
  value = [],
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
  const popoverRef = useRef<HTMLDivElement>(null);

  // Create a unique anchor ID for this specific instance of the dropdown
  const uniqueId = useId().replace(/:/g, "");
  const anchorName = `--select-anchor-${uniqueId}`;

  const selectedOptions = useMemo(() => {
    return options.filter((opt) => value.includes(opt.id));
  }, [options, value]);

  const filteredOptions = useMemo(() => {
    return options.filter((opt) => opt.label.toLowerCase().includes(search.toLowerCase()));
  }, [options, search]);

  // Sync React state with the native HTML popover API
  useEffect(() => {
    const popover = popoverRef.current;
    if (!popover) return;

    if (isOpen) {
      popover.showPopover();
    } else {
      popover.hidePopover();
    }
  }, [isOpen]);

  // Handle clicking outside to close
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      // Because the popover sits in the Top Layer, we must check BOTH refs
      if (!containerRef.current?.contains(target) && !popoverRef.current?.contains(target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Reset search when closing
  useEffect(() => {
    if (!isOpen) setSearch("");
  }, [isOpen]);

  const toggleOption = (option: Option) => {
    if (!onChange) return;

    const isCurrentlySelected = value.includes(option.id);
    if (isCurrentlySelected) {
      onChange(value.filter((id) => id !== option.id));
    } else {
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
        // 1. Declare this div as the anchor point using inline styles
        style={{ anchorName } as React.CSSProperties}
      >
        <div className={styles.values}>
          {selectedOptions.length > 0 ? (
            withChips ? (
              selectedOptions.map((s) => (
                <span key={s.id} className={styles.chip}>
                  {s.label}
                </span>
              ))
            ) : (
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

      {/* 2. The Popover Element */}
      <div
        className={styles.popover}
        role="listbox"
        popover="manual"
        ref={popoverRef}
        // Tell this popover to anchor itself to the control div
        style={{ positionAnchor: anchorName } as React.CSSProperties}
      >
        {/* Only mount contents when open so autoFocus works */}
        {isOpen && (
          <>
            <input
              autoFocus
              className={styles.searchInput}
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              tabIndex={0}
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
          </>
        )}
      </div>
    </div>
  );
};
