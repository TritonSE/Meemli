import React, { useEffect, useMemo, useRef, useState } from "react";

import styles from "./MultiSelect.module.css";

type Option = {
  id: string;
  label: string;
};

export const MultiSelect: React.FC<{
  options: Option[];
  label: string;
  required?: boolean;
  placeholder?: string; // Added placeholder prop
}> = ({
  options,
  label,
  required,
  placeholder = "Select...", // Destructured with default value
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<Option[]>([]);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // filter options based on search string
  const filteredOptions = useMemo(() => {
    return options.filter((opt) => opt.label.toLowerCase().includes(search.toLowerCase()));
  }, [options, search]);

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
    setSelected((prev) =>
      prev.find((o) => o.id === option.id)
        ? prev.filter((o) => o.id !== option.id)
        : [...prev, option],
    );
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <label className={styles.label}>
        {label} {required && <span className={styles.required}>*</span>}
      </label>

      <div
        className={styles.control}
        role="combobox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className={styles.values}>
          {selected.length > 0 ? (
            selected.map((s) => (
              <span key={s.id} className={styles.chip}>
                {s.label}
              </span>
            ))
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
                const isSelected = selected.some((s) => s.id === option.id);
                return (
                  <div
                    key={option.id}
                    className={`${styles.option} ${isSelected ? styles.optionSelected : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleOption(option);
                    }}
                  >
                    <span className={styles.chip}>{option.label}</span>
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
