import { useState } from "react";

import { createUser } from "../../api/user";
import { Button } from "../Button";
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
};

export const AddStaffForm = function AddStaffForm({ onExit, onSuccess }: AddStaffFormProps) {
  const [isLoading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState("");
  const [personalEmail, setPersonalEmail] = useState("");
  const [meemliEmail, setMeemliEmail] = useState("");
  const [programs, setPrograms] = useState("");

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
    if (!role.trim()) {
      errors.role = "Role is required";
    } else if (!["staff", "administrator", "owner"].includes(role.toLowerCase())) {
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

    const isAdmin = role.toLowerCase() === "administrator" || role.toLowerCase() === "owner";

    createUser({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      personalEmail: personalEmail.trim(),
      meemliEmail: meemliEmail.trim(),
      admin: isAdmin,
    })
      .then((result) => {
        if (result.success) {
          // Reset form
          setFirstName("");
          setLastName("");
          setPhoneNumber("");
          setRole("");
          setPersonalEmail("");
          setMeemliEmail("");
          setPrograms("");

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
        <div className={styles.headerSegment}>
          <h1 className={styles.pageTitle}>Add Staff</h1>
        </div>
      </div>

      {/* error message */}
      {Object.keys(formErrors).length > 0 && (
        <div style={{ color: "red", fontSize: "0.9rem", whiteSpace: "pre-wrap" }}>
          {Object.values(formErrors).join("\n")}
        </div>
      )}

      {/* content */}
      <div className={styles.formRow}>
        <TextField
          label="First Name"
          required
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <TextField
          label="Last Name"
          required
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
      </div>
      <div className={styles.formRow}>
        <TextField
          label="Personal Email"
          required
          value={personalEmail}
          onChange={(e) => setPersonalEmail(e.target.value)}
        />
      </div>
      <div className={styles.formRow}>
        <TextField
          label="Meemli Email"
          required
          value={meemliEmail}
          onChange={(e) => setMeemliEmail(e.target.value)}
        />
      </div>
      <div className={styles.formRow}>
        <TextField
          label="Phone Number"
          required
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
      </div>
      <div className={styles.formRow}>
        <TextField label="Role" required value={role} onChange={(e) => setRole(e.target.value)} />
      </div>
      <div className={styles.formRow}>
        <TextField
          label="Assigned Program(s)"
          value={programs}
          onChange={(e) => setPrograms(e.target.value)}
        />
      </div>

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
