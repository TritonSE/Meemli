import Image from "next/image";
import React from "react";

import { StudentCard } from "../StudentCard/StudentCard";
import override from "../StudentCard/StudentCard.module.css";
import { StudentTabs } from "../StudentTabs/StudentTabs";

import styles from "./StudentProfileView.module.css";

import type { Student } from "@/src/api/students";

import { Modal } from "@/src/components/Modal";

type StudentProfileModalProps = {
  student: Student | null;
  onClose: () => void;
};

export const StudentProfileModal = ({ student, onClose }: StudentProfileModalProps) => {
  // If no student is selected, render nothing.
  if (!student) return null;

  return (
    <Modal
      onExit={onClose}
      child={
        <div className={styles.StudentProfileModalContainer}>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close modal">
            <Image src="/icons/x.svg" alt="Close" width={24} height={24} />
          </button>
          <StudentCard variant="modal" data={student} className={override.modalContentOverride} />
          <StudentTabs student={student} />
        </div>
      }
    />
  );
};
