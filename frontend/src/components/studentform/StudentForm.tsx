import { useState } from "react";

import { createStudent, updateStudent } from "../../api/students";

import styles from "./StudentForm.module.css";
import { StudentFormPages } from "./StudentFormPages";

import type { Student } from "../../api/students";

/**
 * Type definition for the values object
 */
export type ValuesType = {
  studentFirstName: string;
  studentLastName: string;
  meemliEmail: string;
  grade: number;
  schoolName: string;
  city: string;
  state: string;
  parentFirstName: string;
  parentLastName: string;
  parentPhoneNumber: string;
  parentEmail: string;
  preassessmentScore: number;
  postassessmentScore: number;
  enrolledSections: string[];
  comments: string;
};

/**
 * Props for the `StudentForm` component.
 * @property mode Controls whether the form is in "create" or "edit" mode
 * @property student Optional initial data to populate the form with (such as
 * when we're editing an existing student)
 * @property onSubmit runs when the user clicks the submit button
 * @property onCancel runs when the user clicks the cancel button
 */
export type StudentFormProps = {
  mode: "create" | "edit";
  student?: Student;
  onSubmit?: (student: Student) => void;
  onCancel?: () => void;
};

/**
 * The form that creates or edits a StudentForm object.
 * @param props.mode Controls how the form renders and submits
 * @param props.student Optional initial data to populate the form with (such as
 * when we're editing an existing student)
 * @param props.onSubmit Optional callback to run after the user submits the
 * form and the request succeeds
 */
export function StudentForm({ mode, student, onSubmit, onCancel }: StudentFormProps) {
  // All initial data
  const values = {
    // split displayName into first and last name for easier editing
    studentFirstName: student ? student.displayName.split(" ")[0] : "",
    studentLastName: student ? student.displayName.split(" ")[1] || "" : "",
    meemliEmail: student ? student.meemliEmail : "",
    grade: student ? student.grade : 0,
    schoolName: student ? student.schoolName : "",
    city: student ? student.city : "",
    state: student ? student.state : "",
    parentFirstName: student ? student.parentContact.firstName : "",
    parentLastName: student ? student.parentContact.lastName : "",
    parentPhoneNumber: student ? student.parentContact.phoneNumber : "",
    parentEmail: student ? student.parentContact.email : "",
    preassessmentScore: student ? student.preassessmentScore : 0,
    postassessmentScore: student ? student.postassessmentScore : 0,
    comments: student ? student.comments : "",
    enrolledSections: student ? student.enrolledSections : [],
  };
  const [isLoading, setLoading] = useState(false);

  // This state variable controls the error message that gets displayed to the user in the
  // Constellation `Dialog` component. If it's `null`, there's no error, so we don't display the Dialog.
  // If it's non-null, there is an error, so we should display that error to the user.
  const [errorModalMessage, setErrorModalMessage] = useState<string | null>(null);

  /**
   * Handles the submission of the form. Uses different routes depending
   * on mode. Only gets called when all validation in StudentFormPages passes.
   * @param candidate validated payload to send
   */
  const handleSubmit = (candidate: ValuesType) => {
    setLoading(true);
    const fullname = `${candidate.studentFirstName} ${candidate.studentLastName}`;
    let request;
    // Concatenate first and last name for displayName
    if (mode === "create") {
      request = createStudent({
        displayName: fullname,
        meemliEmail: candidate.meemliEmail,
        grade: candidate.grade,
        schoolName: candidate.schoolName,
        city: candidate.city,
        state: candidate.state,
        parentContact: {
          firstName: candidate.parentFirstName,
          lastName: candidate.parentLastName,
          phoneNumber: candidate.parentPhoneNumber,
          email: candidate.parentEmail,
        },
        preassessmentScore: candidate.preassessmentScore,
        postassessmentScore: candidate.postassessmentScore,
        comments: candidate.comments,
        enrolledSections: candidate.enrolledSections,
      });
    } else {
      request = updateStudent({
        _id: student!._id,
        displayName: fullname,
        meemliEmail: candidate.meemliEmail,
        grade: candidate.grade,
        schoolName: candidate.schoolName,
        city: candidate.city,
        state: candidate.state,
        parentContact: {
          firstName: candidate.parentFirstName,
          lastName: candidate.parentLastName,
          phoneNumber: candidate.parentPhoneNumber,
          email: candidate.parentEmail,
        },
        preassessmentScore: candidate.preassessmentScore,
        postassessmentScore: candidate.postassessmentScore,
        comments: candidate.comments,
        enrolledSections: candidate.enrolledSections,
      });
    }
    request
      .then((result) => {
        if (result.success) {
          // only call onSubmit if it's NOT undefined
          if (onSubmit) onSubmit(result.data);
        } else {
          setErrorModalMessage(result.error);
        }
        setLoading(false);
      })
      .catch(setErrorModalMessage);
  };

  /**  Define the steps of the multi-step form
   * Each step contains a title and the fields to be filled in that step
   * Changes to this need to be reflected in StudentFormPages
   * Specific structure based on MVP designs
   */
  const steps: Array<{ title: string; fields: (keyof typeof values)[]; description: string }> = [
    {
      title: "Parent Information",
      fields: ["parentFirstName", "parentLastName", "parentPhoneNumber", "parentEmail"],
      description: "Fill out parent information.",
    },
    {
      title: "Student Information",
      fields: [
        "studentFirstName",
        "studentLastName",
        "meemliEmail",
        "grade",
        "schoolName",
        "city",
        "state",
      ],
      description: "Fill out student information.",
    },
    {
      title: "Assessment Scores",
      fields: ["preassessmentScore", "postassessmentScore"],
      description: "Enter assessment scores.",
    },
    {
      title: "Assigned Programs",
      fields: ["enrolledSections", "comments"],
      description: "Assign student to Meemli programs.",
    },
  ];

  return (
    <div className="wrapper">
      <form className={styles.form}>
        <StudentFormPages mode={mode} values={values} steps={steps} handleSubmit={handleSubmit} />
      </form>
    </div>
  );
}
