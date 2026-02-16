"use client";

import { ArrowUpDown, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import styles from "./attendanceSortBy.module.css";

export type SortField = "name" | "status" | "notes";
export type SortOrder = "asc" | "desc";

export type SortOption = {
  field: SortField;
  order: SortOrder;
  label: string;
};

type AttendanceSortByProps = {
  value: SortOption;
  onChange: (option: SortOption) => void;
};

export default function AttendanceSortBy({ value, onChange }: AttendanceSortByProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleFieldSelect = (field: SortField) => {
    onChange({ field, order: value.order, label: field.charAt(0).toUpperCase() + field.slice(1) });
  };

  const handleOrderSelect = (order: SortOrder) => {
    onChange({ field: value.field, order, label: value.label });
  };

  return (
    <div className={styles.sortContainer} ref={dropdownRef}>
      <button
        className={styles.sortButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <ArrowUpDown size={18} className={styles.sortIcon} />
        <span>Sort By</span>
        <svg
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          {/* Field Options */}
          <button
            className={`${styles.dropdownItem} ${value.field === "name" ? styles.selected : ""}`}
            onClick={() => handleFieldSelect("name")}
          >
            <span className={styles.optionLabel}>Name</span>
            {value.field === "name" && <Check size={16} className={styles.checkIcon} />}
          </button>
          <button
            className={`${styles.dropdownItem} ${value.field === "status" ? styles.selected : ""}`}
            onClick={() => handleFieldSelect("status")}
          >
            <span className={styles.optionLabel}>Status</span>
            {value.field === "status" && <Check size={16} className={styles.checkIcon} />}
          </button>
          <button
            className={`${styles.dropdownItem} ${value.field === "notes" ? styles.selected : ""}`}
            onClick={() => handleFieldSelect("notes")}
          >
            <span className={styles.optionLabel}>Notes</span>
            {value.field === "notes" && <Check size={16} className={styles.checkIcon} />}
          </button>

          {/* Divider */}
          <div className={styles.divider} />

          {/* Order Options */}
          <button
            className={`${styles.dropdownItem} ${value.order === "asc" ? styles.selected : ""}`}
            onClick={() => handleOrderSelect("asc")}
          >
            <span className={styles.arrow}>↑</span>
            <span className={styles.optionLabel}>Ascending</span>
            {value.order === "asc" && <Check size={16} className={styles.checkIcon} />}
          </button>
          <button
            className={`${styles.dropdownItem} ${value.order === "desc" ? styles.selected : ""}`}
            onClick={() => handleOrderSelect("desc")}
          >
            <span className={styles.arrow}>↓</span>
            <span className={styles.optionLabel}>Descending</span>
            {value.order === "desc" && <Check size={16} className={styles.checkIcon} />}
          </button>
        </div>
      )}
    </div>
  );
}
