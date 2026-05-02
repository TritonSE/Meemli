import { useEffect, useState } from "react";

import { getAllSections, getSectionById, updateSection } from "../../api/sections";
import { createUser } from "../../api/user";
import { auth, sendMeemliActivationEmail } from "../../util/firebase";
import { Button } from "../Button";
import { ErrorMessage } from "../ErrorMessage";
import { MultiSelectNew, type Option } from "../MultiSelectNew/MultiSelectNew";
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

export const AddStaffForm = function AddStaffForm({ onExit, onSuccess }: AddStaffFormProps) {
  const [isLoading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Cleaned up state specifically for the new MultiSelect
  const [role, setRole] = useState<string>("");
  const [programs, setPrograms] = useState<string[]>([]);
  const [programOptions, setProgramOptions] = useState<Option[]>([]);

  const currentUser = auth.currentUser;
  const inviterName = currentUser
    ? currentUser.displayName || currentUser.email || "An Admin"
    : "An Admin";

  // Role options mapped with colors replacing the old custom react-select components
  const roleOptions: Option[] = [
    {
      id: "admin",
      label: "Admin",
      colorBg: "var(--secondary-100)",
      colorText: "var(--secondary-800)",
    },
    {
      id: "teacher",
      label: "Teacher",
      colorBg: "var(--tertiary-100)",
      colorText: "var(--tertiary-800)",
    },
    {
      id: "student",
      label: "Student",
      colorBg: "var(--primary-100)",
      colorText: "var(--primary-800)",
    },
  ];

  // Fetch sections on component mount
  useEffect(() => {
    getAllSections()
      .then((result) => {
        if (result.success) {
          const sections = result.data;
          setProgramOptions(
            sections.map((section) => ({
              id: section._id,
              label: section.code,
              colorBg: "#D8EFE8", // Applies the original programBadgeColor automatically
            })),
          );
        }
      })
      .catch((error) => {
        console.error("Error fetching sections:", error);
      });
  }, []);

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

    // Updated validation to check the string state directly
    if (!role) {
      errors.role = "Role is required";
    } else if (!["STAFF", "ADMINISTRATOR", "OWNER"].includes(role)) {
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

    // Updated role check
    const isAdmin = role === "ADMINISTRATOR" || role === "OWNER";

    createUser({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      personalEmail: personalEmail.trim(),
      meemliEmail: meemliEmail.trim(),
      phoneNumber: phoneNumber.trim(),
      admin: isAdmin,
      assignedSections: programs, // Now directly passes the string array
    })
      .then((result) => {
        if (result.success) {
          // Send custom activation link.
          sendMeemliActivationEmail(personalEmail.trim(), inviterName)
            .then(() => {})
            .catch((error) => {
              console.error("Error sending activation email:", error);
            });

          const userId = result.data._id;

          // Directly iterate over string array
          for (const sectionId of programs) {
            getSectionById(sectionId)
              .then((sectionResult) => {
                if (sectionResult.success) {
                  const section = sectionResult.data;
                  const updatedTeachers = [...section.teachers, userId];
                  const updatedSection = { ...section, teachers: updatedTeachers };
                  updateSection(updatedSection).catch((error) => {
                    console.error(`Error updating section ${sectionId}:`, error);
                  });
                } else {
                  console.error(`Error fetching section ${sectionId}:`, sectionResult.error);
                }
              })
              .catch((error) => {
                console.error(`Error fetching section ${sectionId}:`, error);
              });
          }

          // Reset form
          setFirstName("");
          setLastName("");
          setPhoneNumber("");
          setRole("");
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
            placeholder="ex. John"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <ErrorMessage message={formErrors.firstName} />
        </div>
        <div className={styles.formField}>
          <TextField
            label="Last Name"
            placeholder="ex. Smith"
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
            placeholder="ex. xyz@abcd.com"
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
            placeholder="ex. xyz@meemli.org"
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
            placeholder="ex. (123)-456-7890"
            required
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
          <ErrorMessage message={formErrors.phoneNumber} />
        </div>
      </div>

      {/* Role Select (Single Mode) */}
      <div className={styles.selectField}>
        <MultiSelectNew
          mode="single"
          label="Role"
          required
          options={roleOptions}
          value={role}
          onChange={setRole}
          searchable={false}
          withChips={true}
          placeholder="Select"
        />
        <ErrorMessage message={formErrors.role} />
      </div>

      {/* Assigned Programs Select (Multiple Mode) */}
      <div className={styles.selectField}>
        <MultiSelectNew
          mode="multiple"
          label="Assigned Program(s)"
          options={programOptions}
          value={programs}
          onChange={setPrograms}
          searchable={true}
          withChips={true}
          placeholder="Select"
        />
      </div>

      {formErrors.api && <ErrorMessage message={formErrors.api} />}
      {formErrors.passwordReset && <ErrorMessage message={formErrors.passwordReset} />}

      {/* Cancel / Submit */}
      <div className={styles.buttonRow}>
        <Button label="Cancel" kind="secondary" onClick={onExit} disabled={isLoading} />
        <Button
          label={isLoading ? "Sending..." : "Send Invitation Email to Meemli"}
          kind="primary"
          onClick={handleSubmit}
          disabled={isLoading}
        />
      </div>
    </div>
  );
};
