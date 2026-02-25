import Image from "next/image";
import { useState } from "react";

import { StudentCard } from "../app/(ui)/_components/StudentCard/StudentCard";
// import StudentCard from "./StudentCard";

import styles from "./Table.module.css";

import type { Section } from "../api/sections";
import type { Student } from "../api/students";
// todo: fill api for staff
// import type { Staff } from "../api/staff";
import type { Dispatch, SetStateAction } from "react";

import { getAllStudents } from "@/src/api/students";
import { StudentProfileModal } from "@/src/app/(ui)/_components/StudentProfileView/StudentProfileView";
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
  const [viewOpen, setViewOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<Student | Staff | null>(null);

  const MAX_VISIBLE = 2;

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
            <Image
              className={styles.hoverIcon}
              src="/icons/edit.svg"
              alt="Edit"
              width={20}
              height={20}
            />
            <p className={styles.hoverText}>{label}</p>
          </div>
        );
      } else {
        fxn = () => {
          setFormData(input);
          setViewOpen(true);
        };
        //TODO: Add eye icon
        inside = (
          <div className={styles.hoverInner}>
            <Image
              className={styles.hoverIcon}
              src="/icons/show.svg"
              alt="View"
              width={20}
              height={20}
            />
            <p className={styles.hoverText}>{label}</p>
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
            <StudentCard data={input} variant="list" />
            <div className={styles.hoverWrap}>{renderHoverBtn(input)}</div>
          </td>
          <td className={styles.textItem}>{input.parentContact.email}</td>
          <td className={styles.blockItems}>
            {(() => {
              const visible = input.enrolledSections.slice(0, MAX_VISIBLE);
              const remaining = input.enrolledSections.length - visible.length;

              return (
                <>
                  {visible.map((cid) => {
                    const res = sections.find((obj) => obj._id === cid);
                    return (
                      <div key={cid} className={styles.blockItem}>
                        {res ? res.code : "Error"}
                      </div>
                    );
                  })}

                  {remaining > 0 && (
                    <div className={`${styles.blockItem} ${styles.moreItem}`}>+{remaining}</div>
                  )}
                </>
              );
            })()}
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
      {isStudent(formData) && viewOpen && (
        <Modal
          onExit={() => setViewOpen(false)}
          child={
            <>
              <StudentProfileModal student={formData} onClose={() => setViewOpen(false)} />
            </>
          }
        />
      )}
    </>
  );
}
