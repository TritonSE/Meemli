/**
 * Handle the multi-step student form pages, updating data, and navigation.
 */
import { useEffect, useState } from "react";

import { Button } from "../Button";
import { MultiSelectDropdown } from "./MultiSelectDropdown";
import { ProgressBar } from "../ProgressBar";
import styles from "./StudentForm.module.css";
import { TextField } from "../TextField";

import Select from "react-select";
import { options } from "./AllStates";

import type { ValuesType } from "./StudentForm";

// Constants declaration
// NOTES_MAX is the maximum number of characters for the notes section of the form
const NOTES_MAX = 200;

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

type Draft = {
  grade: string;
  preassessmentScore: string;
  postassessmentScore: string;
} & Omit<ValuesType, "grade" | "postassessmentScore" | "preassessmentScore">;

type StudentFormPagesProps = {
  values: ValuesType;
  steps: Array<{ title: string; fields: Array<string>; description: string }>;
  handleCancel: () => void,
  handleSubmit: (candidate: ValuesType) => void;
  mode: string;
};

// regex expressions for valid emails and phone numbers
const emailRegex = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/;
const phoneRegex = /^\d{10}$/;
/**
 * Function that validates each field before next page is loaded
 * @param field The name of the field to validate
 * @param draft The current draft values to validate
 * @returns A descriptive error message on the incorrect field,
 * or "passed" if all checks pass
 */
function validator(field: string, draft: Partial<Draft>, errors: StudentFormErrors): string {
  let num;
  switch (field) {
    case "studentFirstName":
    case "studentLastName":
      if (!draft.studentFirstName || draft.studentFirstName.length === 0) {
        errors.studentFirstName = true;
        return "First name is required.";
      }
      if (!draft.studentLastName || draft.studentLastName.length === 0) {
        errors.studentLastName = true;
        return "Last name is requried.";
      }
      if (draft.studentFirstName.length + draft.studentLastName.length < 3) {
        errors.studentFirstName = true;
        errors.studentLastName = true;
        return "Name must be at least 3 characters long.";
      }
      break;
    case "meemliEmail":
      if (!draft.meemliEmail) {
        errors.meemliEmail = true;
        return "Email is required.";
      }
      if (!emailRegex.test(draft.meemliEmail)) {
        errors.meemliEmail = true;
        return "Email must be valid.";
      }
      break;
    case "grade":
      if (!draft.grade) {
        errors.grade = true;
        return "Grade is required.";
      }
      num = Number(draft.grade);
      if (!Number.isInteger(num) || num < 1 || num > 12) {
        errors.grade = true;
        return "Grade must be between 1 and 12.";
      }
      break;
    case "schoolName":
      if (!draft.schoolName) {
        errors.schoolName = true;
        return "School name is required.";
      }
      if (draft.schoolName.length < 3) {
        errors.schoolName = true;
        return "School name must be at least 3 characters long.";
      }
      break;
    case "city":
      if (!draft.city) {
        errors.city = true;
        return "City is required.";
      }
      if (draft.city.length < 3) {
        errors.city = true;
        return "City name must be at least 3 characters long.";
      }
      break;
    case "state":
      if (!draft.state) {
        errors.state = true;
        return "State is required.";
      }
      if (draft.state.length < 3) {
        errors.state = true;
        return "Please write out the full state name.";
      }
      break;
    case "parentFirstName":
    case "parentLastName":
      if (!draft.parentFirstName || draft.parentFirstName.length === 0) {
        errors.parentFirstName = true;
        return "First name is required.";
      }
      if (!draft.parentLastName || draft.parentLastName.length === 0) {
        errors.parentLastName = true;
        return "Last name is requried.";
      }
      if (draft.parentLastName.length + draft.parentLastName.length < 3) {
        errors.parentFirstName = true;
        errors.parentLastName = true;
        return "Name must be at least 3 characters long.";
      }
      break;
    case "parentPhoneNumber":
      if (!draft.parentPhoneNumber) {
        errors.parentPhoneNumber = true;
        return "Phone number is required.";
      }
      if (!phoneRegex.test(draft.parentPhoneNumber)) {
        errors.parentPhoneNumber = true;
        return "Phone number must be a 10-digit number.";
      }
      break;
    case "parentEmail":
      if (!draft.parentEmail) {
        errors.parentEmail = true;
        return "Email is required.";
      }
      if (!emailRegex.test(draft.parentEmail)) {
        errors.parentEmail = true;
        return "Email must be valid.";
      }
      break;
    case "preassessmentScore":
      if (!draft.preassessmentScore) {
        errors.preassessmentScore = true;
        return "Pre-assessment score is required.";
      }
      num = Number(draft.preassessmentScore);
      if (!Number.isInteger(num) || num < 0 || num > 100) {
        errors.preassessmentScore = true;
        return "Pre-assessment score must be an integer in the range 0-100.";
      }
      break;
    case "postassessmentScore":
      if (!draft.postassessmentScore) {
        errors.postassessmentScore = true;
        return "Post-assessment score is required.";
      }
      num = Number(draft.postassessmentScore);
      if (!Number.isInteger(num) || num < 0 || num > 100) {
        errors.postassessmentScore = true;
        return "Post-assessment score must be an integer in the range 0-100.";
      }
      break;
    // TODO: add validation for these entries
    case "enrolledSections":
    case "comments":
      break;
    default:
      return `Error: Invalid field passed to validator - ${field}`;
  }
  return "passed";
}

export function StudentFormPages({ values, steps, handleCancel, handleSubmit, mode }: StudentFormPagesProps) {
  const initalValues = {
    ...values,
    grade: String(values.grade ?? ""),
    preassessmentScore: String(values.preassessmentScore ?? ""),
    postassessmentScore: String(values.postassessmentScore ?? ""),
  };
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Partial<Draft>>(initalValues);
  const [errors, setErrors] = useState<StudentFormErrors>({});
  const [errorMessage, setErrorMessage] = useState("");
  const [editSection, setEditSection] = useState<"student" | "parent" | "program">("student");

  useEffect(() => {
    setDraft({
      ...values,
      grade: String(values.grade ?? ""),
      preassessmentScore: String(values.preassessmentScore ?? ""),
      postassessmentScore: String(values.postassessmentScore ?? ""),
    });
    setErrors({});
    setErrorMessage("");
  }, [values]);

  function handlePrevStep() {
    if (step > 0) {
      setStep((s) => s - 1);
    }
    setErrors({});
    setErrorMessage("");
  }

  /** Handles changes to input fields by updating the corresponding value in state.
   * @param input The new input value from the user
   * @param fieldName The name of the field being updated
   */
  function handleDraftChange(input: string, field: keyof ValuesType) {
    setDraft((prev) => ({
      ...prev,
      [field]: input,
    }));
  }

  /**
   * Validates inputs and updates values
   * @returns boolean based on if the commit was successful
   */
  function commitDraft() {
    // TODO : improve validation UX to show which fields are wrong
    const candidate = { ...initalValues, ...draft };
    const curFields = steps[step].fields;
    const curErrors: StudentFormErrors = {};

    let errormsg = "";
    for (const field of curFields) {
      const validation = validator(field, candidate, curErrors);
      if (!(validation === "passed")) {
        errormsg = validation;
        setErrors(curErrors);
        setErrorMessage(errormsg);
        return null;
      }
    }
    return candidate;
  }

  function handleNextStep() {
    const candidate = commitDraft();
    if (!candidate) return;

    if (step < steps.length - 1) {
      setStep(step + 1);
    }
    setErrors({});
    setErrorMessage("");
  }

  /**
   * Function that gets called when "Submit" button is pressed.
   * Perfomrs final round of validation and calls the handleSubmit() function.
   */
  function handleSubmission() {
    const candidate = commitDraft();
    if (!candidate) return;
    const ret = {
      ...candidate,
      grade: Number(candidate.grade),
      postassessmentScore: Number(candidate.postassessmentScore),
      preassessmentScore: Number(candidate.preassessmentScore),
    };
    handleSubmit(ret);
  }

  /**
   * Create a row of 2 buttons with callback functions and labels
   * @param handleBack left button function
   * @param handleForward right button function
   * @param l1 left button label
   * @param l2 right button label
   * @returns 2 buttons in a row
   */
  function makeButtons(handleBack: () => void, handleForward: () => void, l1: string, l2: string) {
    return (
      <div className={styles.buttonRow}>
        <Button onClick={handleBack} kind="secondary" label={l1} />
        <Button onClick={handleForward} kind="primary" label={l2} />
      </div>
    );
  }

  /**
   * step<#> returns the reusable DOM for each step for both create and edit modes
   * Depending on how reusable the multi-step form needs to be, these could be moved to their own components
   */
  const step0 = (
    <>
      <div className={styles.formRow}>
        <TextField
          label="First Name"
          name="parentFirstName"
          value={draft.parentFirstName ?? ""}
          placeholder="ex. John"
          onChange={(e) => handleDraftChange(e.target.value, "parentFirstName")}
          required={true}
          error={Boolean(errors.parentFirstName)}
        />
        <TextField
          label="Last Name"
          name="parentLastName"
          value={draft.parentLastName ?? ""}
          placeholder="ex. Smith"
          onChange={(e) => handleDraftChange(e.target.value, "parentLastName")}
          required={true}
          error={Boolean(errors.parentLastName)}
        />
      </div>
      <div className={styles.formRow}>
        <TextField
          label="Parent Email"
          name="parentEmail"
          value={draft.parentEmail ?? ""}
          placeholder="ex. jsmith@gmail.com"
          onChange={(e) => handleDraftChange(e.target.value, "parentEmail")}
          required={true}
          error={Boolean(errors.parentEmail)}
        />
      </div>
      <div className={styles.formRow}>
        <TextField
          label="Parent Phone Number"
          name="parentPhoneNumber"
          value={draft.parentPhoneNumber ?? ""}
          placeholder="ex. 1234567890"
          onChange={(e) => handleDraftChange(e.target.value, "parentPhoneNumber")}
          required={true}
          error={Boolean(errors.parentPhoneNumber)}
        />
      </div>
    </>
  );

  const step1 = (
    <>
      <div className={styles.formRow}>
        <TextField
          label="First Name"
          name="studentFirstName"
          value={draft.studentFirstName ?? ""}
          placeholder="ex. John"
          onChange={(e) => handleDraftChange(e.target.value, "studentFirstName")}
          required={true}
          error={Boolean(errors.studentFirstName)}
        />
        <TextField
          label="Last Name"
          name="studentLastName"
          value={draft.studentLastName ?? ""}
          placeholder="ex. Smith"
          onChange={(e) => handleDraftChange(e.target.value, "studentLastName")}
          required={true}
          error={Boolean(errors.studentLastName)}
        />
        <TextField
          label="Grade"
          name="grade"
          value={draft.grade !== "0" ? draft.grade : ""}
          placeholder="ex. 3"
          onChange={(e) => handleDraftChange(e.target.value, "grade")}
          required={true}
          error={Boolean(errors.grade)}
        />
      </div>
      <div className={styles.formRow}>
        <TextField
          label="Student Email"
          name="meemliEmail"
          value={draft.meemliEmail ?? ""}
          placeholder="ex. jsmith@meemli.com"
          onChange={(e) => handleDraftChange(e.target.value, "meemliEmail")}
          required={true}
          error={Boolean(errors.meemliEmail)}
        />
      </div>
      <div className={styles.subheadingRow}>
        <h2 className={styles.subheading}>School Information</h2>
      </div>
      <div className={styles.formRow}>
        <TextField
          label="School Name"
          name="schoolName"
          value={draft.schoolName ?? ""}
          placeholder="ex. Doyle Elementary School"
          onChange={(e) => handleDraftChange(e.target.value, "schoolName")}
          required={true}
          error={Boolean(errors.schoolName)}
        />
      </div>
      <div className={styles.formRow}>
        <TextField
          label="City"
          name="city"
          value={draft.city ?? ""}
          placeholder="ex. San Diego"
          onChange={(e) => handleDraftChange(e.target.value, "city")}
          required={true}
          error={Boolean(errors.city)}
          className={styles.halfField}
        />
        <div className={`${styles.selectField} ${styles.halfField}`}>
          <label className={styles.selectLabel}>
            State<span className={styles.required}>*</span>
          </label>
          <Select
            aria-label="State"
            name="state"
            className={styles.stateSelect}
            classNamePrefix="stateSelect"
            value={options.find((option) => option.label === draft.state) ?? null}
            options={options}
            isSearchable={true}
            placeholder="Search for a state..."
            onChange={(option) => handleDraftChange(option?.label ?? "", "state")}
          />
        </div>
      </div>
    </>
  );
  // defined update function for dropdown in place since it'd be
  // weird to handle it in handleDraftChange
  const step2 = (
    <>
      <div className={styles.formRow}>
        <TextField
          label="Pre-Assessment Score"
          name="preassessmentScore"
          value={draft.preassessmentScore !== "0" ? draft.preassessmentScore : ""}
          placeholder="ex. 85"
          onChange={(e) => handleDraftChange(e.target.value, "preassessmentScore")}
          error={Boolean(errors.preassessmentScore)}
        />
        <TextField
          label="Post-Assessment Score"
          name="postassessmentScore"
          value={draft.postassessmentScore !== "0" ? draft.postassessmentScore : ""}
          placeholder="ex. 92"
          onChange={(e) => handleDraftChange(e.target.value, "postassessmentScore")}
          error={Boolean(errors.postassessmentScore)}
        />
      </div>
      <div className={styles.formRow}>
        <MultiSelectDropdown
          label="Enroll in Sections"
          value={draft.enrolledSections ?? []}
          onChange={(next) => setDraft((prev) => ({ ...prev, enrolledSections: next }))}
          placeholder="Select"
        />
      </div>
      <div className={styles.formRow}>
        <TextField
          label="Notes"
          name="comments"
          value={draft.comments ?? ""}
          placeholder="Type here..."
          onChange={(e) => handleDraftChange(e.target.value, "comments")}
          error={Boolean(errors.comments)}
          maxLength={NOTES_MAX}
        />
      </div>
      <span className={styles.charCount}>
        {(draft.comments ?? "").length} / {NOTES_MAX}
      </span>
    </>
  );
  const stepViews = [step0, step1, step2];
  /**
   * Returns the DOM for the current step of the multi-step form.
   * @returns DOM for the webpage
   */
  function renderCreateStep() {
    const curstep = steps[step];
    const reusedElements = (
      <div className={styles.reused}>
        <ProgressBar currentStep={step} totalSteps={steps.length} />
        <div className={styles.headerSegment}>
          <h1 className={styles.pageTitle}>Add Student</h1>
          <p className={styles.description}>{curstep.description}</p>
        </div>
        <div className={styles.infoBar}>
          <h2 className={styles.subheading}>{curstep.title}</h2>
          <p className={styles.error}>{errorMessage}</p>
        </div>
      </div>
    );
    // remaining elements depend on which page the form is on
    const stepElement = stepViews[step] ?? <p>Error loading form</p>;
    let buttonRow;
    switch (step) {
      case 0:
        buttonRow = makeButtons(handleCancel, handleNextStep, "Cancel", "Next");
        break;
      case steps.length - 1:
        buttonRow = makeButtons(handlePrevStep, handleSubmission, "Back", "Add");
        break;
      default:
        buttonRow = makeButtons(handlePrevStep, handleNextStep, "Back", "Next");
    }
    return (
      <div className={styles.formPage}>
        {reusedElements}
        {stepElement}
        {buttonRow}
      </div>
    );
  }

  function renderEditStep() {
    const reusedElements = (
      <>
        <div className={styles.headerSegment}>
          <h1 className={styles.pageTitle}>Edit Student</h1>
        </div>
        <div className={styles.infoBar}>
          <p className={styles.error}>{errorMessage}</p>
        </div>
        <div className={styles.editTabs}>
          <Button
            kind={editSection === "student" ? "primary" : "secondary"}
            label="Student Info"
            onClick={() => setEditSection("student")}
          />
          <Button
            kind={editSection === "parent" ? "primary" : "secondary"}
            label="Parent Info"
            onClick={() => setEditSection("parent")}
          />
          <Button
            kind={editSection === "program" ? "primary" : "secondary"}
            label="Program Info"
            onClick={() => setEditSection("program")}
          />
        </div>
      </>
    );

    const stepElement =
      editSection === "parent" ? step0 : editSection === "student" ? step1 : step2;

    return (
      <div className={styles.formPage}>
        {reusedElements}
        {stepElement}
        <div className={styles.buttonRow}>
          <Button onClick={handleSubmission} kind="primary" label="Save Changes" />
        </div>
      </div>
    );
  }
  if (mode === "create") {
    return renderCreateStep();
  } else {
    return renderEditStep();
  }
}
