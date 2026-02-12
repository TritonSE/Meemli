
import { useEffect, useState } from "react";

import { Button } from "../Button";
import { TextField } from "../TextField";

import styles from "./AddStaffForm.module.css";

type AddStaffFormProps = {
  onExit: () => void;
};

export const AddStaffForm = function AddStaffForm( {onExit}: AddStaffFormProps) {
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
        <TextField label="First Name" required />
        <TextField label="Last Name" required />
      </div>
      <div className={styles.formRow}>
        <TextField label="Phone Number" required />
      </div>
      <div className={styles.formRow}>
        <TextField label="Role" required />
      </div>
      <div className={styles.formRow}>
        <TextField label="Assigned Program(s)" />
      </div>
      {/* Cancel / Submit */}
      <div className={styles.buttonRow}>
        <Button label="Cancel" kind="secondary" onClick={onExit}/>
        <Button label="Add" kind="primary" />
      </div>
    </div>
  );
};
