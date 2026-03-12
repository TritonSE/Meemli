import React from "react";

import { ProfilePicture } from "../ProfilePicture/ProfilePicture";

import styles from "./StudentCard.module.css";

import type { Student } from "@/src/api/students";

type StudentCardProps = {
  variant: "modal" | "list";
  data?: Student | null; // Allow null for loading states
  className?: string;
};

export const StudentCard: React.FC<StudentCardProps> = ({ variant, data, className = "" }) => {
  // 1. Loading State
  if (!data) {
    return (
      <div
        className={`${
          variant === "modal" ? styles.studentProfileModal : styles.listViewContainer
        } ${className}`}
      >
        <div className={styles.studentInfoTag}>
          <ProfilePicture size={variant === "modal" ? "medium" : "small"} letter="?" />
          <ul className={styles.infoItems}>
            <li className={styles.name}>Loading...</li>
          </ul>
        </div>
      </div>
    );
  }

  // 2. Data Preparation
  // Since we only have 'Student', we access fields directly.
  const location = `${data.city}, ${data.state}`;

  // --- RENDER: MODAL VIEW ---
  if (variant === "modal") {
    return (
      <div className={`${styles.studentProfileModal} ${className}`}>
        <div className={styles.studentProfileContent}>
          <div className={styles.studentInfoTag}>
            <ProfilePicture size="medium" letter={data.displayName} />

            <ul className={`${styles.infoItems} ${styles.profileView}`}>
              <li className={styles.name}>{data.displayName}</li>
              <li className={styles.email}>
                <address>{data.meemliEmail}</address>
              </li>
              <li className={styles.school}>
                <span>{data.grade}th Grade</span>
                {data.schoolName} | {location}
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className={`${styles.listViewContainer} ${className}`}>
        <div className={styles.studentInfoTag}>
          <ProfilePicture size="small" letter={data.displayName} />

          <ul className={`${styles.infoItems} ${styles.listView}`}>
            <li className={styles.name}>{data.displayName}</li>
            <li className={styles.email}>
              <address>{data.meemliEmail}</address>
            </li>
          </ul>
        </div>
      </div>
    );
  }
};
