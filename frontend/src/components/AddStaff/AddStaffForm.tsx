import { sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";
import Select from "react-select";

import { createUser } from "../../api/user";
import { auth } from "../../util/firebase";
import { Button } from "../Button";
import { ErrorMessage } from "../ErrorMessage";
import { TextField } from "../TextField";

import styles from "./AddStaffForm.module.css";

type AddStaffFormProps = {
  onExit: () => void;
  onSuccess?: () => void;
};

type FormErrors = {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  role?: string;
  personalEmail?: string;
  meemliEmail?: string;
  api?: string;
  passwordReset?: string;
};

type Option = { value: string; label: string };

export const AddStaffForm = function AddStaffForm({ onExit, onSuccess }: AddStaffFormProps) {
  const [isLoading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const [role, setRole] = useState<Option | null>(null);
  const [programs, setPrograms] = useState<Option[]>([]);

  // TODO: replace these with API calls
  const roleOptions: Option[] = [
    { value: "STAFF", label: "Staff" },
    { value: "ADMIN", label: "Admin" },
    { value: "OWNER", label: "Owner" },
  ];

  const programOptions: Option[] = [
    { value: "CSE11", label: "CSE 11" },
    { value: "CSE12", label: "CSE 12" },
    { value: "CSE100", label: "CSE 100" },
  ];

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [personalEmail, setPersonalEmail] = useState("");
  const [meemliEmail, setMeemliEmail] = useState("");

  // Validate form fields
  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!firstName.trim()) {
      errors.firstName = "First name is required";
    }
    if (!lastName.trim()) {
      errors.lastName = "Last name is required";
    }
    if (!phoneNumber.trim()) {
      errors.phoneNumber = "Phone number is required";
    }
    if (!role?.value.trim()) {
      errors.role = "Role is required";
    } else if (!["staff", "administrator", "owner"].includes(role?.value.toLowerCase())) {
      errors.role = "Role must be one of: staff, administrator, or owner";
    }
    if (!personalEmail.trim()) {
      errors.personalEmail = "Personal email is required";
    }
    if (!meemliEmail.trim()) {
      errors.meemliEmail = "Meemli email is required";
    }

    // Email format validation - check for @ and . after @
    const isValidEmail = (email: string) => {
      const atIndex = email.indexOf("@");
      return atIndex > 0 && email.includes(".", atIndex);
    };
    if (personalEmail && !isValidEmail(personalEmail)) {
      errors.personalEmail = "Invalid personal email format";
    }
    if (meemliEmail && !isValidEmail(meemliEmail)) {
      errors.meemliEmail = "Invalid meemli email format";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setFormErrors({});

    const isAdmin =
      role?.label.toLowerCase() === "administrator" || role?.label.toLowerCase() === "owner";

    createUser({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      personalEmail: personalEmail.trim(),
      meemliEmail: meemliEmail.trim(),
      admin: isAdmin,
    })
      .then((result) => {
        if (result.success) {
          sendPasswordResetEmail(auth, meemliEmail.trim())
            .then(() => {})
            .catch((error) => {
              setFormErrors({
                passwordReset: "Failed to send password reset email",
              });
              console.error("Error sending password reset email:", error);
            });

          // Reset form
          setFirstName("");
          setLastName("");
          setPhoneNumber("");
          setRole(null);
          setPersonalEmail("");
          setMeemliEmail("");
          setPrograms([]);

          // Call success callback if provided
          if (onSuccess) {
            onSuccess();
          }

          // Exit form
          onExit();
        } else {
          setFormErrors({
            api: result.error || "Failed to add staff member",
          });
        }
      })
      .catch((error) => {
        setFormErrors({
          api: error instanceof Error ? error.message : "An unexpected error occurred",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className={styles.form}>
      {/* header */}
      <div className={styles.reused}>
        <h1 className={styles.pageTitle}>Add Staff</h1>
      </div>

      {/* content */}
      <div className={styles.formRow}>
        <div className={styles.formField}>
          <TextField
            label="First Name"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <ErrorMessage message={formErrors.firstName} />
        </div>
        <div className={styles.formField}>
          <TextField
            label="Last Name"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <ErrorMessage message={formErrors.lastName} />
        </div>
      </div>
      <div className={styles.formRow}>
        <div className={styles.formField}>
          <TextField
            label="Personal Email"
            required
            value={personalEmail}
            onChange={(e) => setPersonalEmail(e.target.value)}
          />
          <ErrorMessage message={formErrors.personalEmail} />
        </div>
      </div>
      <div className={styles.formRow}>
        <div className={styles.formField}>
          <TextField
            label="Meemli Email"
            required
            value={meemliEmail}
            onChange={(e) => setMeemliEmail(e.target.value)}
          />
          <ErrorMessage message={formErrors.meemliEmail} />
        </div>
      </div>
      <div className={styles.formRow}>
        <div className={styles.formField}>
          <TextField
            label="Phone Number"
            required
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
          <ErrorMessage message={formErrors.phoneNumber} />
        </div>
      </div>
      <div className={styles.selectField}>
        <label className={styles.selectLabel}>
          Role<span className={styles.required}>*</span>
        </label>
        <Select
          inputId="role"
          options={roleOptions}
          value={role}
          onChange={(opt) => setRole(opt as Option | null)}
          placeholder="Select"
          isClearable
          className={styles.select}
          classNamePrefix="select"
        />
        <ErrorMessage message={formErrors.role} />
      </div>
      <div className={styles.selectField}>
        <label className={styles.selectLabel}>Assigned Program(s)</label>
        <Select
          inputId="assignedPrograms"
          options={programOptions}
          value={programs}
          onChange={(opts) => setPrograms((opts as Option[]) ?? [])}
          placeholder="Select"
          isMulti
          closeMenuOnSelect={false}
          className={styles.select}
          classNamePrefix="select"
        />
      </div>

      {formErrors.api && <ErrorMessage message={formErrors.api} />}
      {formErrors.passwordReset && <ErrorMessage message={formErrors.passwordReset} />}

      {/* Cancel / Submit */}
      <div className={styles.buttonRow}>
        <Button label="Cancel" kind="secondary" onClick={onExit} disabled={isLoading} />
        <Button
          label={isLoading ? "Adding..." : "Add"}
          kind="primary"
          onClick={handleSubmit}
          disabled={isLoading}
        />
      </div>
    </div>
  );
};
