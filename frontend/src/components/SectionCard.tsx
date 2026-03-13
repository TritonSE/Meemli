"use client";
import { Calendar, GraduationCap } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import styles from "./SectionCard.module.css";

// To check -- day is string, days is string[], are we going to accept multiple days for one card? or just one day per card.

export const SectionCard = function SectionCard({
  code,
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
  teachers: string[];
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
  color: string;
  archived: boolean;
  days: string[];
  onEdit: () => void;
  onArchive: () => void | Promise<void>;
  onDelete: () => void | Promise<void>;
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
            <button
              onClick={() => {
                onEdit();
                setMenuOpen(false);
              }}
            >
              Edit
            </button>
            <button
              onClick={() => {
                void onArchive();
                setMenuOpen(false);
              }}
            >
              {!archived && "Archive"}
              {archived && "Unarchive"}
            </button>
            <button
              onClick={() => {
                void onDelete();
                setMenuOpen(false);
              }}
            >
              Delete
            </button>
          </div>
        )}
      </div>

      <div className={styles.cardBody}>
        <h3>{code}</h3>
        <p>
          {days} {startTime} - {endTime}
        </p>

        <hr />

        <div className={styles.row}>
          <GraduationCap /> {teachers && teachers[0]}
        </div>
        <div className={styles.row}>
          <Calendar /> {startDate} - {endDate}
        </div>
      </div>
    </div>
  );
};
