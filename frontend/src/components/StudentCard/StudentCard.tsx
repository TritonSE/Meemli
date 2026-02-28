import React from "react";

import { ProfilePicture } from "../ProfilePicture/ProfilePicture";

import styles from "./StudentCard.module.css";

import type { Student } from "@/src/api/students";

type User = {
  _id: string;
  firstName: string;
  lastName: string;
  personalEmail: string;
  meemliEmail: string;
  phoneNumber: string;
  admin: boolean;
  assignedsections: string[];
};

type StudentCardProps = {
  variant: "modal" | "list";
  data?: Student | User | null; // Allow null for loading states
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

  const isStudent = (input: Student | User | null) => {
    return typeof input === "object" && input !== null && "parentContact" in input;
  };
  // 2. Data Preparation
  // Since we only have 'Student', we access fields directly.

  let location;
  if (isStudent(data)) {
    location = `${data.city}, ${data.state}`;
  }

  // --- RENDER: MODAL VIEW ---
  if (isStudent(data) && variant === "modal") {
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
  }

  // --- RENDER: LIST VIEW ---
  if (isStudent(data)) {
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
  } else {
    return (
      <div className={`${styles.listViewContainer} ${className}`}>
        <div className={styles.studentInfoTag}>
          <ProfilePicture size="small" letter={`${data.firstName} ${data.lastName}`} />

          <ul className={`${styles.infoItems} ${styles.listView}`}>
            <li className={styles.name}>{`${data.firstName} ${data.lastName}`}</li>
            <li className={styles.email}>
              <address>{data.meemliEmail}</address>
            </li>
          </ul>
        </div>
      </div>
    );
  }
};
