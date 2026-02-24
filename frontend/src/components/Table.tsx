import { useState } from "react";

import styles from "./Table.module.css";
// import StudentCard from "./StudentCard";

import type { Section } from "../api/sections";
import type { Student } from "../api/students";
// todo: fill api for staff
// import type { Staff } from "../api/staff";
import type { Dispatch, SetStateAction } from "react";

import { getAllStudents } from "@/src/api/students";
import { Modal } from "@/src/components/Modal";
import { StudentForm } from "@/src/components/studentform/StudentForm";
type Staff = {
  data: string;
};

export type TableProps = {
  data: Student[] | Staff[];
  setData: Dispatch<SetStateAction<any>>;
  sections: Section[];
  type: "staff" | "student";
  isEdit: boolean;
  selected: Set<string>;
  setSelected: Dispatch<SetStateAction<any>>;
  onSelect?: () => void;
};

export function Table({
  data,
  setData,
  type,
  sections,
  isEdit,
  selected,
  setSelected,
}: TableProps) {
  const [isLoading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<Student | Staff | null>(null);

  // tracks which row is currently being edited using the direct note editing feature
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftNote, setDraftNote] = useState<string>("");
  const [savingId, setSavingId] = useState<string | null>(null);

  /**
   * Checks if an input is student or staff. Used to stop linter errors
   * @param input data to check
   * @returns boolean value
   */
  function isStudent(input: Student | Staff | null) {
    return typeof input === "object" && input !== null && "parentContact" in input;
  }
  // TODO: Fill in showInfo function (should just render the view page for a staff member/student)
  function showInfo(input: Student | Staff) {
    console.log(input);
  }

  /**
   * Creates the correct hover button depending on different states
   * the form can be in. For example, a student page in edit mode will
   * have the "Edit Info" button that spawns an edit student page.
   * @param input student or staff data
   */
  function renderHoverBtn(input: Student | Staff) {
    const label = isEdit ? "Edit Info" : "See Info";

    let inside = <></>;
    let fxn = () => {};
    if (isStudent(input)) {
      if (isEdit) {
        fxn = () => {
          setFormData(input);
          setFormOpen(true);
        };
        // TODO: Add pencil icon
        inside = (
          <div className={styles.hoverInner}>
            <img className={styles.hoverIcon}></img>
            <p className={styles.hoverText}>{label}</p>
          </div>
        );
      } else {
        fxn = () => {
          // TODO: add student display page
        };
        //TODO: Add eye icon
        inside = (
          <div className={styles.hoverInner}>
            <img className={styles.hoverIcon}></img>
            <label>{label}</label>
          </div>
        );
      }
    }
    return (
      <button className={styles.hiddenButton} onClick={fxn}>
        {inside}
      </button>
    );
  }

  /**
   * Renders one row of the table. Binds functionality of checkbox
   * and the hover button to the row's data.
   * @param input data for the row
   * @returns React component
   */
  function renderRow(input: Student | Staff) {
    // if parent email exists, its a student, otherwise its staff
    if (isStudent(input)) {
      const id = input._id;
      const checked = selected.has(id);
      return (
        <>
          {isEdit && (
            <td className={styles.checkbox}>
              <input
                type="checkbox"
                checked={checked}
                onChange={() => {
                  setSelected((prev: Set<string>) => {
                    const next = new Set(prev);
                    if (next.has(id)) next.delete(id);
                    else next.add(id);
                    return next;
                  });
                }}
              />
            </td>
          )}
          <td className={styles.nameItem}>
            Name
            {renderHoverBtn(input)}
          </td>
          <td className={styles.textItem}>{input.parentContact.email}</td>
          <td className={styles.blockItems}>
            {input.enrolledSections.map((cid, i) => {
              const res = sections.find((obj) => obj._id === cid);

              return (
                <div key={i} className={styles.sectionBox}>
                  {res ? res.code : "Error: Bad id"}
                </div>
              );
            })}
          </td>
          <td className={styles.notesItem}>{input.comments}</td>
        </>
      );
    } else {
      console.log("not students");
    }
  }

  let titleBar;
  if (type === "student") {
    titleBar = (
      <>
        <th className={`${styles.nameCol} ${styles.headerItem}`}>Name</th>
        <th className={`${styles.emailCol} ${styles.headerItem}`}>Parent E-mail Address</th>
        <th className={`${styles.programsCol} ${styles.headerItem}`}>Assigned Programs</th>
        <th className={`${styles.notesCol} ${styles.headerItem}`}>Notes</th>
      </>
    );
  } else {
    titleBar = (
      <>
        <th className={`${styles.nameCol} ${styles.headerItem}`}>Name</th>
        <th className={`${styles.roleCol} ${styles.headerItem}`}>Role</th>
        <th className={`${styles.phoneNumberCol} ${styles.headerItem}`}>Phone Number</th>
        <th className={`${styles.dateCol} ${styles.headerItem}`}>Start Date</th>
        <th className={`${styles.programsCol} ${styles.headerItem}`}>Assigned Programs</th>
      </>
    );
  }

  return (
    <>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.headerRow}>
              {isEdit && <th className={styles.checkboxHeader}></th>}
              {titleBar}
            </tr>
          </thead>
          <tbody>
            {data.map((x, rowIndex) => (
              <tr key={rowIndex} className={styles.itemRow}>
                {renderRow(x)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isStudent(formData) && formOpen && (
        <Modal
          onExit={() => setFormOpen(false)}
          child={
            <>
              <StudentForm
                mode="edit"
                student={formData}
                onSubmit={() => {
                  setFormOpen(false);
                  getAllStudents()
                    .then((result) => {
                      if (result.success) setData(result.data);
                    })
                    .catch((error) =>
                      setErrorMessage(error instanceof Error ? error.message : String(error)),
                    )
                    .finally(() => setLoading(false));
                }}
                onCancel={() => setFormOpen(false)}
              />
            </>
          }
        />
      )}
    </>
  );
}
