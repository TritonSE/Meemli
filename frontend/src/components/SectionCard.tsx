"use client";
import styles from "./SectionCard.module.css";
import { GraduationCap, Calendar } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export const SectionCard = function SectionCard({
  code,
  day,
  teachers,
  startTime,
  endTime,
  startDate,
  endDate,
  archived,
  color,
  days,
  onEdit,
  onArchive,
  onDelete,
}: {
  code: string;
  day: string;
  teachers: string[];
  startTime: string;
  endTime: string;
  teacherName: string;
  startDate: string;
  endDate: string;
  color: string;
  archived: boolean;
  days: string;
  onEdit: () => void;
  onArchive: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <div className={styles.cardWrapper}>
      <div className={styles.topBar} style={{ backgroundColor: color }} ref={menuRef}>
        <button className={styles.menuButton} onClick={toggleMenu}>
          ...
        </button>
        {menuOpen && (
          <div className={styles.dropdown}>
            <button onClick={onEdit}>Edit</button>
            <button onClick={onArchive}>Archive</button>
            <button onClick={onDelete}>Delete</button>
          </div>
        )}
      </div>

      <div className={styles.cardBody}>
        <h3>{code}</h3>
        <p>
          {day} {startTime} - {endTime}
        </p>

        <hr />

        <div className={styles.row}>
          <GraduationCap /> {teachers[0]}
        </div>
        <div className={styles.row}>
          <Calendar /> {startDate} - {endDate}
        </div>
      </div>
    </div>
  );
};
