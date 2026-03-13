import React, { useEffect, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";

import { MultiSelect } from "../../MultiSelect/MultiSelect";

import styles from "./StepThreeEnrolled.module.css";

// TODO: Update this import path to where your schema is defined
import type { SectionDraft } from "../SectionForm";
import type { Student } from "@/src/api/students";
import type { User } from "@/src/api/users";

import { getAllStudents } from "@/src/api/students";
import { getAllTeachers } from "@/src/api/users";

// Moved outside so it isn't redefined on every render
export type DropdownOption = {
  id: string;
  label: string;
};

export function StepThreeEnrolled() {
  const {
    control,
    formState: { errors },
  } = useFormContext<SectionDraft>();

  const [studentOptions, setStudentOptions] = useState<DropdownOption[]>([]);
  const [teacherOptions, setTeacherOptions] = useState<DropdownOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDropdownData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch both at the exact same time
        const [studentsResponse, teachersResponse] = await Promise.all([
          getAllStudents(),
          getAllTeachers(),
        ]);

        // Process Students
        if (studentsResponse.success && Array.isArray(studentsResponse.data)) {
          const formattedOptions = studentsResponse.data.map((student: Student) => ({
            id: String(student._id || ""),
            label: String(student.displayName || "Unknown Student"),
          }));

          setStudentOptions(formattedOptions);
        } else {
          setStudentOptions([]);
        }

        // Process Teachers
        if (teachersResponse.success && Array.isArray(teachersResponse.data)) {
          // Filter out admins just as a safety net
          const onlyTeachers = teachersResponse.data.filter((user: User) => !user.admin);

          const formattedTeacherOptions = onlyTeachers.map((user: User) => ({
            id: String(user._id || ""),
            label: `${user.firstName} ${user.lastName}`.trim() || "Unknown Teacher",
          }));

          setTeacherOptions(formattedTeacherOptions);
        } else {
          setTeacherOptions([]);
        }
      } catch (err) {
        console.error("Error fetching dropdown data:", err);
        setError("Failed to load students and teachers.");
        setStudentOptions([]);
        setTeacherOptions([]);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchDropdownData();
  }, []);

  // Basic Loading UI
  if (isLoading) {
    return (
      <div className={`${styles.stepContent} ${styles.studentTeacherForm}`}>
        <p>Loading dropdowns...</p>
      </div>
    );
  }

  // Basic Error UI
  if (error) {
    return (
      <div className={`${styles.stepContent} ${styles.studentTeacherForm}`}>
        <p style={{ color: "red" }}>{error}</p>
      </div>
    );
  }

  return (
    <div className={`${styles.stepContent} ${styles.studentTeacherForm}`}>
      <div className={styles.formElement}>
        <Controller
          name="teachers"
          control={control}
          render={({ field }) => (
            <MultiSelect
              options={teacherOptions}
              label="Teachers"
              placeholder="Search or select teacher name"
              value={field.value} // Array of teacher ObjectIDs
              onChange={field.onChange}
              withChips={true}
              required={true}
            />
          )}
        />
        {errors.teachers && <span role="alert">{errors.teachers.message}</span>}
      </div>
      <div className={styles.formElement}>
        <Controller
          name="enrolledStudents"
          control={control}
          render={({ field }) => (
            <MultiSelect
              options={studentOptions}
              label="Students"
              placeholder="Search or select student name"
              value={field.value} // Array of student ObjectIDs
              onChange={field.onChange}
              withChips={true}
              fitContent={false}
              required={true}
            />
          )}
        />
        {errors.enrolledStudents && <span role="alert">{errors.enrolledStudents.message}</span>}
      </div>
    </div>
  );
}
