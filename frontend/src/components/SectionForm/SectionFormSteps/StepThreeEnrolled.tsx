import React from "react";

import { MultiSelect } from "../../MultiSelect/MultiSelect";

import styles from "./StepThreeEnrolled.module.css";

export function StepThreeEnrolled() {
  const STUDENT_DATA = [
    { id: "1", label: "Joe Mama" },
    { id: "2", label: "Jill Mama" },
    { id: "3", label: "John Smith" },
    { id: "4", label: "Jane Doe" },
    { id: "5", label: "Billy Jean" },
  ];

  const TEACHER_DATA = [
    { id: "1", label: "Mr. Anderson" },
    { id: "2", label: "Ms. Johnson" },
  ];

  return (
    <div className={`${styles.stepContent} ${styles.studentTeacherForm}`}>
      <div className={styles.formElement}>
        <MultiSelect
          options={STUDENT_DATA}
          label="Students"
          placeholder="Search or select student name"
          required={true}
        />
      </div>

      <div className={styles.formElement}>
        <MultiSelect
          options={TEACHER_DATA}
          label="Teachers"
          placeholder="Search or select teacher name"
          required={true}
        />
      </div>
    </div>
  );
}
