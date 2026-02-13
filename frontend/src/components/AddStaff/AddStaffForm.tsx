import { useEffect, useState } from "react";
import Select from "react-select";

import { Button } from "../Button";
import { MultiSelectDropdown } from "../studentform/MultiSelectDropdown";
import { TextField } from "../TextField";

import styles from "./AddStaffForm.module.css";

type AddStaffFormProps = {
  onExit: () => void;
};

type Option = { value: string; label: string };

export const AddStaffForm = function AddStaffForm({ onExit }: AddStaffFormProps) {
  const [role, setRole] = useState<Option | null>(null);
  const [assignedPrograms, setAssignedPrograms] = useState<Option[]>([]);

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
  
  // const [isLoading, setLoading] = useState(false);

  // useEffect(() => {
  //   setLoading(true);
  //   // API Logic here, similar to:
  //   // getAllStudents()
  //   //   .then((result) => {
  //   //     if (result.success) {
  //   //       setStudents(result.data);
  //   //       setSelectedId(result.data[0]?._id ?? null);
  //   //     } else {
  //   //       setErrorMessage(result.error);
  //   //     }
  //   //   })
  //   //   .catch((error) => setErrorMessage(error instanceof Error ? error.message : String(error)))
  //   //   .finally(() => setLoading(false));
  //   setLoading(false);
  // }, []);

  // TODO: do smth like:
  //   <TextField
  //   label="First Name"
  //   name="parentFirstName"
  //   value={draft.parentFirstName ?? ""}
  //   placeholder="ex. John"
  //   onChange={(e) => handleDraftChange(e.target.value, "parentFirstName")}
  //   required={true}
  //   error={Boolean(errors.parentFirstName)}
  // />

  // TODO: add validators

  return (
    <div className={styles.form}>
      {/* header */}
      <div className={styles.reused}>
        <div className={styles.headerSegment}>
          <h1 className={styles.pageTitle}>Add Staff</h1>
        </div>
      </div>

      {/* content */}
      <div className={styles.formRow}>
        <TextField 
          label="First Name" 
          placeholder="ex. John"
          required />
        <TextField 
          label="Last Name" 
          placeholder="ex. Smith"
          required />
      </div>
      <div className={styles.formRow}>
        <TextField 
          label="Phone Number" 
          placeholder="ex. (123)456-7890"
          required />
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
    </div>
    <div className={styles.selectField}>
      <label className={styles.selectLabel}>
        Assigned Program(s)
      </label>
      <Select
        inputId="assignedPrograms"
        options={programOptions}
        value={assignedPrograms}
        onChange={(opts) => setAssignedPrograms((opts as Option[]) ?? [])}
        placeholder="Select"
        isMulti
        closeMenuOnSelect={false}
        className={styles.select}
        classNamePrefix="select"
      />
    </div>
      {/* Cancel / Submit */}
      <div className={styles.buttonRow}>
        <Button label="Cancel" kind="secondary" onClick={onExit} />
        <Button label="Add" kind="primary" />
      </div>
    </div>
  );
};
