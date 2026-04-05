import { type FormEvent, useState } from "react";

import { updateStudent } from "../../api/students";
import { Button } from "../Button";
import { ErrorMessage } from "../ErrorMessage";
import { TextField } from "../TextField";

import styles from "./StudentEditForm.module.css";

import type { Student } from "../../api/students";

type StudentEditFormProps = {
  student: Student;
  onCancel: () => void;
  onSubmit?: () => void;
};
export function StudentEditForm({ student, onCancel, onSubmit }: StudentEditFormProps) {
  const [postassessmentScore, setPostassessmentScore] = useState(
    String(student.postassessmentScore),
  );
  const [preassessmentScore, setPreassessmentScore] = useState(String(student.preassessmentScore));
  const [comments, setComments] = useState(student.comments);
  const [preassessmentError, setPreassessmentError] = useState("");
  const [postassessmentError, setPostassessmentError] = useState("");

  function validateScore(input: string, label: string): string {
    const score = Number(input);
    if (!Number.isInteger(score) || score < 0 || score > 100) {
      return `${label} must be an integer from 0 to 100.`;
    }
    return "";
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const preError = validateScore(preassessmentScore, "Pre-assessment score");
    const postError = validateScore(postassessmentScore, "Post-assessment score");

    setPreassessmentError(preError);
    setPostassessmentError(postError);

    if (preError || postError) {
      return;
    }

    updateStudent({
      _id: student._id,
      displayName: student.displayName,
      meemliEmail: student.meemliEmail,
      grade: student.grade,
      schoolName: student.schoolName,
      city: student.city,
      state: student.state,
      parentContact: {
        firstName: student.parentContact.firstName,
        lastName: student.parentContact.lastName,
        phoneNumber: student.parentContact.phoneNumber,
        email: student.parentContact.email,
      },
      preassessmentScore: Number(preassessmentScore),
      postassessmentScore: Number(postassessmentScore),
      comments,
      archived: student.archived,
      enrolledSections: student.enrolledSections,
    })
      .then((result) => {
        if (result.success) {
          if (onSubmit) {
            onSubmit();
          } else {
            onCancel();
          }
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }

  return (
    <form className={styles.wrapper} onSubmit={handleSubmit}>
      <h2 className={styles.title}>Edit Student</h2>
      <div className={styles.fieldGroup}>
        <TextField
          label="Pre-assessment Score"
          value={preassessmentScore}
          onChange={(event) => {
            setPreassessmentScore(event.target.value);
            if (preassessmentError) {
              setPreassessmentError("");
            }
          }}
          error={Boolean(preassessmentError)}
          required={true}
        />
        <ErrorMessage message={preassessmentError} />
      </div>

      <div className={styles.fieldGroup}>
        <TextField
          label="Post-assessment Score"
          value={postassessmentScore}
          onChange={(event) => {
            setPostassessmentScore(event.target.value);
            if (postassessmentError) {
              setPostassessmentError("");
            }
          }}
          error={Boolean(postassessmentError)}
          required={true}
        />
        <ErrorMessage message={postassessmentError} />
      </div>

      <TextField
        label="Comments"
        value={comments}
        onChange={(event) => setComments(event.target.value)}
      />

      <div className={styles.buttonRow}>
        <Button label="Cancel" kind="secondary" onClick={onCancel} type="button" />
        <Button label="Submit" kind="primary" type="submit" />
      </div>
    </form>
  );
}
