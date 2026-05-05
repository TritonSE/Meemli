"use client";
import { Calendar, GraduationCap, MoreHorizontal } from "lucide-react";
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

  const to12Hour = (time24: string): string => {
    const [hh, mm] = time24.split(":").map(Number);

    const period = hh >= 12 ? "PM" : "AM";
    const hour12 = hh % 12 === 0 ? 12 : hh % 12;

    return `${hour12}:${mm.toString().padStart(2, "0")} ${period}`;
  };

  const formattedStartTime = to12Hour(startTime);
  const formattedEndTime = to12Hour(endTime);

  const formattedStartDate = new Date(startDate).toLocaleDateString("en-US");
  const formattedEndDate = new Date(endDate).toLocaleDateString("en-US");

  return (
    <div className={styles.cardWrapper}>
      <div className={styles.topBar} style={{ backgroundColor: color }} ref={menuRef}>
        <button className={styles.menuButton} onClick={toggleMenu}>
          <MoreHorizontal />
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
        <h3 className={`${styles.classTitle} ${styles.scrollable}`} tabIndex={0} title={code}>
          {code}
        </h3>
        <p className={styles.dateRow}>
          {days.join(", ")} {formattedStartTime} - {formattedEndTime}
        </p>

        <hr />

        <div className={`${styles.row} ${styles.scrollable}`}>
          <GraduationCap size={16} /> {teachers && teachers.join(", ")}
        </div>
        <div className={`${styles.row} ${styles.scrollable}`}>
          <Calendar size={16} /> {formattedStartDate} - {formattedEndDate}
        </div>
      </div>
    </div>
  );
};
