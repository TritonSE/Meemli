"use client";

import { Search } from "lucide-react";

import styles from "./attendanceSearch.module.css";

type AttendanceSearchProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export default function AttendanceSearch({
  value,
  onChange,
  placeholder = "Search Student",
}: AttendanceSearchProps) {
  return (
    <div className={styles.searchContainer}>
      <Search className={styles.searchIcon} size={20} />
      <input
        type="text"
        className={styles.searchInput}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button
          className={styles.clearButton}
          onClick={() => onChange("")}
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </div>
  );
}
