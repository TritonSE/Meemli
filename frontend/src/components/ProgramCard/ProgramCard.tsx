// components/ProgramCard.tsx
"use client";

import Image from "next/image";
import React from "react";

import styles from "./ProgramCard.module.css";

type ProgramCardProps = {
  section: {
    _id: string;
    name: string;
    teachers: string[];
    startDate: string;
    endDate: string;
    color: string;
  };
};

/**
 * Converts a UTC ISO string safely into a readable "D MMM YYYY" string
 * to prevent timezone shifting.
 */
const formatDate = (isoString: string): string => {
  if (!isoString) return "";
  const date = new Date(isoString);
  const day = date.getUTCDate();
  const month = date.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
  const year = date.getUTCFullYear();
  return `${day} ${month} ${year}`;
};

export default function ProgramCard({ section }: ProgramCardProps) {
  const teacherDisplay = section.teachers.join(", ") || "No teacher assigned";

  return (
    <article
      className={styles.card}
      style={{ "--accent-color": section.color } as React.CSSProperties}
    >
      <div className={styles.colorBar} aria-hidden="true" />

      <div className={styles.cardBody}>
        <h4 className={styles.cardTitle}>{section.name}</h4>

        <div className={styles.metaDivider} aria-hidden="true" />

        <div className={styles.detailsList}>
          <div className={styles.detailItem}>
            <span className={styles.iconWrapper}>
              <Image src="/icons/nav/students.svg" alt="Teacher icon" width={18} height={18} />
            </span>
            <span className={styles.detailText}>{teacherDisplay}</span>
          </div>

          <div className={styles.detailItem}>
            <span className={styles.iconWrapper}>
              <Image src="/icons/calendar.svg" alt="Calendar icon" width={18} height={18} />
            </span>
            <span className={styles.detailText}>
              {formatDate(section.startDate)} - {formatDate(section.endDate)}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
