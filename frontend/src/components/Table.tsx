import Image from "next/image";
import { useEffect, useState } from "react";

import { StudentCard } from "../app/(ui)/_components/StudentCard/StudentCard";
// import StudentCard from "./StudentCard";

import styles from "./Table.module.css";

import type { Section } from "../api/sections";
import type { Student } from "../api/students";
// todo: fill api for staff
// import type { User } from "../api/user";
import type { Dispatch, SetStateAction } from "react";

import { getAllStudents } from "@/src/api/students";
import { StudentProfileModal } from "@/src/app/(ui)/_components/StudentProfileView/StudentProfileView";
import { Modal } from "@/src/components/Modal";
import { StudentForm } from "@/src/components/studentform/StudentForm";

type User = {
  _id: string;
  data: string;
};

export type TableProps = {
  data: Student[] | User[];
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

  // State for modals
  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [viewOpen, setViewOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<Student | User | null>(null);

  // State for page navigation
  const PAGE_SIZE = 7;
  const totalRows = data.length;
  const pageCount = Math.max(1, Math.ceil(totalRows / PAGE_SIZE));
  const [page, setPage] = useState<number>(0);
  const [pageInput, setPageInput] = useState<string>("1");

  const MAX_VISIBLE_SECTIONS = 3;

  /**
   * Checks if an input is student or staff. Used to stop linter errors
   * @param input data to check
   * @returns boolean value
   */
  const isStudent = (input: Student | User | null) => {
    return typeof input === "object" && input !== null && "parentContact" in input;
  };

  const clampedSetPage = (next: number) => {
    const clamped = Math.min(Math.max(next, 0), pageCount - 1);
    setPage(clamped);
    setPageInput(String(clamped + 1));
  };

  const back = () => clampedSetPage(page - 1);
  const forward = () => clampedSetPage(page + 1);

  const start = page * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const pageData = data.slice(start, end);

  // ensures accurate page display on refetch
  useEffect(() => {
    if (page > pageCount - 1) clampedSetPage(pageCount - 1);
  }, [pageCount]);
  /**
   * Creates the correct hover button depending on different states
   * the form can be in. For example, a student page in edit mode will
   * have the "Edit Info" button that spawns an edit student page.
   * @param input student or staff data
   */
  const renderHoverBtn = (input: Student | User) => {
    const label = isEdit ? "Edit Info" : "See Info";

    const children = [];
    let fxn = () => {};
    if (isEdit) {
      children.push(
        <Image
          key="0"
          className={styles.hoverIcon}
          src="/icons/edit.svg"
          alt="Edit"
          width={20}
          height={20}
        />,
      );
    } else {
      children.push(
        <Image
          key="0"
          className={styles.hoverIcon}
          src="/icons/show.svg"
          alt="View"
          width={20}
          height={20}
        />,
      );
    }
    if (isStudent(input)) {
      if (isEdit) {
        fxn = () => {
          setFormData(input);
          setFormOpen(true);
        };
      } else {
        fxn = () => {
          setFormData(input);
          setViewOpen(true);
        };
      }
    }
    children.push(
      <p key="1" className={styles.hoverText}>
        {label}
      </p>,
    );
    const inside = <div className={styles.hoverInner}>{children}</div>;
    return (
      <button className={styles.hiddenButton} onClick={fxn}>
        {inside}
      </button>
    );
  };

  const renderSections = (input: Student) => {
    const visible = input.enrolledSections.slice(0, MAX_VISIBLE_SECTIONS);
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
  };

  const renderCheckbox = (input: Student | User) => {
    const id = input._id;
    const checked = selected.has(id);
    return (
      <>
        {isEdit && (
          <td className={styles.checkboxContainer}>
            <input
              className={styles.checkbox}
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
      </>
    );
  };

  const renderRow = (input: Student | User) => {
    // if parent email exists, its a student, otherwise its staff
    if (isStudent(input)) {
      return (
        <>
          {renderCheckbox(input)}
          <td className={styles.nameItem}>
            <StudentCard data={input} variant="list" />
            <div className={styles.hoverWrap}>{renderHoverBtn(input)}</div>
          </td>
          <td className={styles.textItem}>{input.parentContact.email}</td>
          <td className={styles.blockItems}>{renderSections(input)}</td>
          <td className={styles.notesItem}>{input.comments}</td>
        </>
      );
    } else {
      console.log("not students");
    }
  };

  const renderNavigation = () => {
    return (
      <div className={styles.navigation}>
        <button onClick={back} disabled={page === 0}>
          <Image
            className={styles.leftArrow}
            src="/icons/prev.svg"
            alt="Back button"
            width={32}
            height={32}
          />
        </button>
        <p>page</p>
        <input
          className={styles.pageInput}
          value={pageInput}
          inputMode="numeric"
          onChange={(e) => setPageInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const n = Number(pageInput);
              if (!Number.isFinite(n)) return;
              clampedSetPage(n - 1); // user enters 1-based
            }
          }}
          onBlur={() => {
            const n = Number(pageInput);
            if (!Number.isFinite(n)) {
              setPageInput(String(page + 1));
              return;
            }
            clampedSetPage(n - 1);
          }}
          aria-label="Page number"
        />
        <p>of</p>
        <p>{pageCount}</p>
        <button onClick={forward} disabled={page >= pageCount - 1}>
          <Image
            className={styles.rightArrow}
            src="/icons/prev.svg"
            alt="Forward button"
            width={32}
            height={32}
          />
        </button>
      </div>
    );
  };

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
            {pageData.map((x, rowIndex) => (
              <tr key={rowIndex} className={styles.itemRow}>
                {renderRow(x)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {renderNavigation()}
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
