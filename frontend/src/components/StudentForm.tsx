import { useState } from "react";
import styles from "src/components/TaskForm.module.css";

import { createStudent, updateStudent } from "../api/students";

import type { ParentContact, Student } from "../api/students";

/**
 * Props for the `StudentForm` component.
 * @property mode Controls whether the form is in "create" or "edit" mode
 * @property student Optional initial data to populate the form with (such as
 * when we're editing an existing student)
 * @property onSubmit runs when the user clicks the submit button
 */
export type StudentFormProps = {
  mode: "create" | "edit";
  student?: Student;
  onSubmit?: (student: Student) => void;
};

/**
 * Type definition for the errors object used in StudentForm validation.
 */
type StudentFormErrors = {
  studentFirstName?: boolean;
  studentLastName?: boolean;
  meemliEmail?: boolean;
  grade?: boolean;
  schoolName?: boolean;
  city?: boolean;
  state?: boolean;
  parentFirstName?: boolean;
  parentLastName?: boolean;
  parentPhoneNumber?: boolean;
  parentEmail?: boolean;
  preassessmentScore?: boolean;
  postassessmentScore?: boolean;
  enrolledSections?: boolean;
  comments?: boolean;
};

/**
 * Type definition for the values object used in StudentForm validation.
 */
type StudentValidation = {
  studentFirstName: string;
  studentLastName: string;
  meemliEmail: string;
  grade: number;
  schoolName: string;
  city: string;
  state: string;
  parentContact: ParentContact;
  preassessmentScore: number;
  postassessmentScore: number;
  enrolledSections: string[];
  comments: string;
}
/**
 * Returns an object indicating which fields in the student form have validation errors.
 * @param values The student form fields to validate
 * @returns 
 */
function validateStudentForm( values: StudentValidation): StudentFormErrors {
  const errors: StudentFormErrors = {};

  if (!values.studentFirstName || values.studentFirstName.length === 0) {
    errors.studentFirstName = true;
  }
  if (!values.studentLastName || values.studentLastName.length === 0) {
    errors.studentLastName = true;
  }
  if (!values.meemliEmail || values.meemliEmail.length === 0) {
    errors.meemliEmail = true;
  }
  if (!values.grade || values.grade === 0) {
    errors.grade = true;
  }
  if (!values.schoolName || values.schoolName.length === 0) {
    errors.schoolName = true;
  }
  if (!values.city || values.city.length === 0) {
    errors.city = true;
  }
  if (!values.state || values.state.length === 0) {
    errors.state = true;
  }
  if (!values.parentContact?.firstName || values.parentContact.firstName.length === 0) {
    errors.parentFirstName = true;
  }
  if (!values.parentContact?.lastName || values.parentContact.lastName.length === 0) {
    errors.parentLastName = true;
  }
  if (!values.parentContact?.phoneNumber || values.parentContact.phoneNumber.length === 0) {
    errors.parentPhoneNumber = true;
  }
  if (!values.parentContact?.email || values.parentContact.email.length === 0) {
    errors.parentEmail = true;
  }
  if (!values.preassessmentScore || values.preassessmentScore < 0) {
    errors.preassessmentScore = true;
  }
  if (!values.postassessmentScore || values.postassessmentScore < 0) {
    errors.postassessmentScore = true;
  }
  // remaining fields can be empty, but must still exist
  if (!values.enrolledSections) {
    errors.enrolledSections = true;
  }
  if (!values.comments) {
    errors.comments = true;
  }
  return errors;
}

/**
 * The form that creates or edits a StudentForm object. 
 * @param props.mode Controls how the form renders and submits
 * @param props.student Optional initial data to populate the form with (such as
 * when we're editing an existing student)
 * @param props.onSubmit Optional callback to run after the user submits the
 * form and the request succeeds
 */
export function StudentForm({ mode, student, onSubmit }: StudentFormProps) {
  // One variable to hold all data for the form
  const [values, setValues] = useState({
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
    enrolledSections: student ? student.enrolledSections : []
  })
  const [errors, setErrors] = useState<StudentFormErrors>({});
  const [isLoading, setLoading] = useState(false);

  // This state variable controls the error message that gets displayed to the user in the
  // Constellation `Dialog` component. If it's `null`, there's no error, so we don't display the Dialog.
  // If it's non-null, there is an error, so we should display that error to the user.
  const [errorModalMessage, setErrorModalMessage] = useState<string | null>(null);

  const handleSubmit = () => {
    // first, do any validation that we can on the frontend
    setErrors({});
    const validationErrors = validateStudentForm({
      studentFirstName: values.studentFirstName,
      studentLastName: values.studentLastName,
      meemliEmail: values.meemliEmail,
      grade: values.grade,
      schoolName: values.schoolName,
      city: values.city,
      state: values.state,
      parentContact: {
        firstName: values.parentFirstName,
        lastName: values.parentLastName,
        phoneNumber: values.parentPhoneNumber,
        email: values.parentEmail
      },
      preassessmentScore: values.preassessmentScore,
      postassessmentScore: values.postassessmentScore,
      comments: values.comments,
      enrolledSections: values.enrolledSections
    });
    setErrors(validationErrors);
    // if there are any errors, don't submit the form
    if (Object.keys(validationErrors).length > 0) {
      return;
    }
    setLoading(true);
    const fullname = `${values.studentFirstName  } ${  values.studentLastName}`;
    let request;
    if (mode === "create") {
      request = createStudent({
        displayName: fullname,
        meemliEmail: values.meemliEmail,
        grade: values.grade,
        schoolName: values.schoolName,
        city: values.city,
        state: values.state,
        parentContact: {
          firstName: values.parentFirstName,
          lastName: values.parentLastName,
          phoneNumber: values.parentPhoneNumber,
          email: values.parentEmail
        },
        preassessmentScore: values.preassessmentScore,
        postassessmentScore: values.postassessmentScore,
        comments: values.comments,
        enrolledSections: values.enrolledSections
      });
    } else {
      request = updateStudent({
        _id: student!._id,
        displayName: fullname,
        meemliEmail: values.meemliEmail,
        grade: values.grade,
        schoolName: values.schoolName,
        city: values.city,
        state: values.state,
        parentContact: {
          firstName: values.parentFirstName,
          lastName: values.parentLastName,
          phoneNumber: values.parentPhoneNumber,
          email: values.parentEmail
        },
        preassessmentScore: values.preassessmentScore,
        postassessmentScore: values.postassessmentScore,
        comments: values.comments,
        enrolledSections: values.enrolledSections
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

  const formTitle = mode === "create" ? "Add Student" : "Edit Student";

  /**  Define the steps of the multi-step form 
   * Each step contains a title and the fields to be filled in that step
   * Specific structure based on MVP designs
  */
  const steps: Array<{ title: string; fields: (keyof typeof values)[] }> = [
    { title: "Parent Information", fields: ["parentFirstName", "parentLastName", "parentPhoneNumber", "parentEmail"] },
    { title: "Student Information", fields: ["studentFirstName", "studentLastName", "meemliEmail", "grade", "schoolName", "city", "state"] },
    { title: "Assessment Scores", fields: ["preassessmentScore", "postassessmentScore"] },
    { title: "Assigned Programs", fields: ["enrolledSections", "comments"] },
  ];

  return (
    <form className={styles.form}>
    </form>
  );
}
