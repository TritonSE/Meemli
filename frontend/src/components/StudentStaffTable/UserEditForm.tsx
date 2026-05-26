import { useState } from "react";

import { updateUser } from "../../api/user";
import { Button } from "../Button";
import { ErrorMessage } from "../ErrorMessage";
import { MultiSelect, type Option } from "../MultiSelect/MultiSelect";
import { MultiSelectDropdown } from "../studentform/MultiSelectDropdown";
import { TextField } from "../TextField";

import styles from "./UserEditForm.module.css";

import type { Section } from "../../api/sections";
import type { User } from "../../api/user";

type UserEditFormProps = {
  user: User;
  sections: Section[];
  roleOptions: Option[];
  onCancel: () => void;
  onSubmit?: () => void;
};

/**
 * Form for editing a user. Validates input and displays error messages. On submit, calls the API to update the user.
 * @param user the user to edit
 * @param sections list of all sections to choose from when assigning sections to the user
 * @param onCancel callback when the user clicks the cancel button
 * @param onSubmit callback when the user successfully submits the form.
 * @returns form component
 */
export function UserEditForm({
  user,
  sections: _sections,
  roleOptions,
  onCancel,
  onSubmit,
}: UserEditFormProps) {
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber);
  const [role, setRole] = useState(user.admin ? "admin" : "teacher");
  const [assignedSections, setAssignedSections] = useState(user.assignedSections);
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [phoneNumberError, setPhoneNumberError] = useState("");
  const [roleError, setRoleError] = useState("");
  const [submitError, setSubmitError] = useState("");

  const handleSubmit: NonNullable<React.ComponentProps<"form">["onSubmit"]> = (event) => {
    event.preventDefault();

    const validFirstName = firstName ? firstName.trim() : "";
    const validLastName = lastName ? lastName.trim() : "";
    const validPhoneNumber = phoneNumber ? phoneNumber.trim() : "";

    const nextFirstNameError = validFirstName ? "" : "First name is required.";
    const nextLastNameError = validLastName ? "" : "Last name is required.";
    const nextPhoneNumberError = validPhoneNumber ? "" : "Phone number is required.";

    let nextRoleError = "";
    if (!role) {
      nextRoleError = "Role is required.";
    } else if (!roleOptions.some((option) => option.id === role)) {
      nextRoleError = "Role must be either admin or teacher.";
    }

    setFirstNameError(nextFirstNameError);
    setLastNameError(nextLastNameError);
    setPhoneNumberError(nextPhoneNumberError);
    setRoleError(nextRoleError);

    const hasValidationError = Boolean(
      nextFirstNameError || nextLastNameError || nextPhoneNumberError || nextRoleError,
    );

    if (hasValidationError) {
      setSubmitError("Please fill in all required fields.");
      return;
    }

    setSubmitError("");

    updateUser({
      _id: user._id,
      firstName: validFirstName,
      lastName: validLastName,
      phoneNumber: validPhoneNumber,
      admin: role === "admin",
      personalEmail: user.personalEmail,
      meemliEmail: user.meemliEmail,
      archived: user.archived,
      assignedSections: _sections
        .filter((section) => assignedSections.includes(section._id))
        .map((section) => section._id),
    })
      .then((result) => {
        if (result.success) {
          if (onSubmit) {
            onSubmit();
          } else {
            onCancel();
          }
          return;
        }

        setSubmitError(result.error || "Failed to update user.");
      })
      .catch((error) => {
        console.error(error);
        setSubmitError(error instanceof Error ? error.message : "Failed to update user.");
      });
  };

  return (
    <form className={styles.wrapper} onSubmit={handleSubmit}>
      <div className={styles.headerSegment}>
        <h1 className={styles.title}>Edit Staff</h1>
      </div>

      <div className={styles.nameRow}>
        <div className={styles.fieldGroup}>
          <TextField
            label="First Name"
            value={firstName}
            placeholder="ex. John"
            onChange={(event) => {
              setFirstName(event.target.value);
              if (firstNameError) {
                setFirstNameError("");
              }
            }}
            error={Boolean(firstNameError)}
            required={true}
          />
          <ErrorMessage message={firstNameError} />
        </div>

        <div className={styles.fieldGroup}>
          <TextField
            label="Last Name"
            value={lastName}
            placeholder="ex. Smith"
            onChange={(event) => {
              setLastName(event.target.value);
              if (lastNameError) {
                setLastNameError("");
              }
            }}
            error={Boolean(lastNameError)}
            required={true}
          />
          <ErrorMessage message={lastNameError} />
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <TextField
          label="Phone Number"
          value={phoneNumber}
          placeholder="ex. 1234567890"
          onChange={(event) => {
            setPhoneNumber(event.target.value);
            if (phoneNumberError) {
              setPhoneNumberError("");
            }
          }}
          error={Boolean(phoneNumberError)}
          required={true}
          type="tel"
        />
        <ErrorMessage message={phoneNumberError} />
      </div>

      <div className={styles.fieldGroup}>
        <MultiSelect
          mode="single"
          label="Role"
          required
          options={roleOptions}
          value={role}
          onChange={setRole}
          searchable={false}
          withChips={true}
          placeholder="Select"
          fullWidth={true}
        />
        <ErrorMessage message={roleError} />
      </div>
      <div className={styles.fieldGroup}>
        <MultiSelectDropdown
          label="Assigned Programs"
          value={assignedSections}
          onChange={(next) => setAssignedSections(next)}
          placeholder="Select"
          required={false}
        />
      </div>

      <ErrorMessage message={submitError} />

      <div className={styles.buttonRow}>
        <Button label="Cancel" kind="secondary" onClick={onCancel} type="button" />
        <Button label="Submit" kind="primary" type="submit" />
      </div>
    </form>
  );
}
