import Image from "next/image";
import { useEffect, useState } from "react";

import styles from "./Table.module.css";

import type { Section } from "@/src/api/sections";
import type { Student } from "@/src/api/students";
import type { User } from "@/src/api/user";
import type { Dispatch, SetStateAction } from "react";

import EditIcon from "@/public/icons/edit.svg";
import PrevIcon from "@/public/icons/prev.svg";
import ShowIcon from "@/public/icons/show.svg";
import { getAllStudents } from "@/src/api/students";
import { DynamicBlockDisplay } from "@/src/components/DynamicBlockDisplay/DynamicBlockDisplay";
import { Modal } from "@/src/components/Modal";
import { NameCard } from "@/src/components/StudentCard/NameCard";
import { StudentCard } from "@/src/components/StudentCard/StudentCard";
import { StudentEditForm } from "@/src/components/studentform/StudentEditForm";
import { StudentForm } from "@/src/components/studentform/StudentForm";
import { StudentProfileModal } from "@/src/components/StudentProfileView/StudentProfileView";

/**
 * Component for dynamically rendering block-like items based on available container space
 * @param labels - Array of strings to display as labels
 * @param colors - Array of colors (hex or CSS color names) corresponding to each label
 */
// --- Color helpers ---

export type TableProps = {
  data: Student[] | User[];
  setData: Dispatch<SetStateAction<any>>;
  sections: Section[];
  type: "staff" | "student";
  state: "admin" | "teacher";
  isEdit: boolean;
  onEdit?: () => void;
  selected: Set<string>;
  setSelected: Dispatch<SetStateAction<any>>;
  onSelect?: () => void;
};

export function Table({
  data,
  setData,
  type,
  state,
  sections,
  isEdit,
  onEdit,
  selected,
  setSelected,
}: TableProps) {
  const [isLoading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // State for modals
  const [editOpen, setEditOpen] = useState<boolean>(false);
  const [viewOpen, setViewOpen] = useState<boolean>(false);
  const [editData, setEditData] = useState<Student | User | null>(null);

  // State for page navigation
  const PAGE_SIZE = 7;
  const totalRows = data.length;
  const pageCount = Math.max(1, Math.ceil(totalRows / PAGE_SIZE));
  const [page, setPage] = useState<number>(0);
  const [pageInput, setPageInput] = useState<string>("1");
  const tableClassName = `${styles.table} ${type === "student" ? styles.studentTable : styles.staffTable} ${isEdit ? styles.withCheckbox : ""}`;

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
    const bool = isStudent(input);
    // no hover if its a staff page in view mode
    if (!bool && !isEdit) return <></>;
    // add edit icon if edit mode, else must be in view mode for students
    if (isEdit) {
      children.push(<EditIcon key="0" className={styles.hoverIcon} />);
    } else {
      children.push(<ShowIcon key="0" className={styles.hoverIcon} />);
    }

    if (bool && !isEdit) {
      fxn = () => {
        setEditData(input);
        setViewOpen(true);
      };
    } else {
      fxn = () => {
        setEditData(input);
        setEditOpen(true);
      };
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

  const renderCheckbox = (input: Student | User) => {
    const id = input._id;
    const checked = selected.has(id);
    return (
      <>
        {isEdit && (
          <td className={styles.checkboxContainer}>
            <label className={styles.checkboxWrapper}>
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
              <span className={styles.customCheckbox}>
                {checked && <Image height={12} width={12} src="/icons/check.svg" alt="check" />}
              </span>
            </label>
          </td>
        )}
      </>
    );
  };

  const renderRow = (input: Student | User) => {
    if (isStudent(input)) {
      const sortedSections = input.enrolledSections
        .map((cid) => {
          const res = sections.find((obj) => obj._id === cid);
          return {
            label: res?.code ?? "Error",
            color: res?.color ?? "gray",
          };
        })
        .sort((a, b) =>
          (a.label ?? "").localeCompare(b.label ?? "", undefined, {
            sensitivity: "base",
          }),
        );

      const sortedLabels = sortedSections.map((s) => s.label);
      const sectionColors = sortedSections.map((s) => s.color);

      return (
        <>
          {renderCheckbox(input)}
          <td className={styles.nameItem}>
            <StudentCard data={input} variant="list" />
            <div className={styles.hoverWrap}>{renderHoverBtn(input)}</div>
          </td>
          <td className={styles.textItem}>{input.parentContact.email}</td>
          <td className={styles.programsItem}>
            <DynamicBlockDisplay labels={sortedLabels} colors={sectionColors} />
          </td>
          <td className={styles.notesItem}>{input.comments}</td>
        </>
      );
    } else {
      const sortedSections = input.assignedSections
        .map((cid) => {
          const res = sections.find((obj) => obj._id === cid);
          return {
            label: res?.code ?? "Error",
            color: res?.color ?? "gray",
          };
        })
        .sort((a, b) =>
          (a.label ?? "").localeCompare(b.label ?? "", undefined, {
            sensitivity: "base",
          }),
        );

      const sortedLabels = sortedSections.map((s) => s.label);
      const sectionColors = sortedSections.map((s) => s.color);

      return (
        <>
          {renderCheckbox(input)}
          <td className={styles.nameItem}>
            <NameCard name={`${input.firstName} ${input.lastName}`} email={input.meemliEmail} />
            <div className={styles.hoverWrap}>{renderHoverBtn(input)}</div>
          </td>
          <td className={styles.roleItem}>
            <DynamicBlockDisplay
              labels={input.admin ? ["Administrator"] : ["Staff"]}
              colors={input.admin ? ["#FF5000"] : ["#00FF00"]}
            />
          </td>
          <td className={styles.textItem}>{input.phoneNumber}</td>
          <td className={styles.programsItem}>
            <DynamicBlockDisplay labels={sortedLabels} colors={sectionColors} />
          </td>
        </>
      );
    }
  };

  const renderNavigation = () => {
    return (
      <div className={styles.navigation}>
        <button onClick={back} disabled={page === 0}>
          <PrevIcon className={`${styles.leftArrow}`} />
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
          <PrevIcon className={`${styles.rightArrow}`} />
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
        <th className={`${styles.programsCol} ${styles.headerItem}`}>Assigned Programs</th>
      </>
    );
  }
  return (
    <>
      <div className={styles.tableWrapper}>
        <table className={tableClassName}>
          <thead>
            <tr className={styles.headerRow}>
              {isEdit && <th className={styles.checkboxCol}></th>}
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
      {isStudent(editData) && editOpen && state === "admin" && (
        <Modal
          onExit={() => setEditOpen(false)}
          child={
            <>
              <StudentForm
                mode="edit"
                student={editData}
                onSubmit={() => {
                  setEditOpen(false);
                  getAllStudents()
                    .then((result) => {
                      if (result.success) {
                        setData(result.data);
                        if (onEdit) {
                          onEdit();
                        }
                      }
                    })
                    .catch((error) =>
                      setErrorMessage(error instanceof Error ? error.message : String(error)),
                    )
                    .finally(() => setLoading(false));
                }}
                onCancel={() => setEditOpen(false)}
              />
            </>
          }
        />
      )}
      {isStudent(editData) && editOpen && state !== "admin" && (
        <Modal
          onExit={() => setEditOpen(false)}
          child={
            <>
              <StudentEditForm
                student={editData}
                onCancel={() => setEditOpen(false)}
                onSubmit={() => {
                  setEditOpen(false);
                  getAllStudents()
                    .then((result) => {
                      if (result.success) {
                        setData(result.data);
                        if (onEdit) {
                          onEdit();
                        }
                      }
                    })
                    .catch((error) =>
                      setErrorMessage(error instanceof Error ? error.message : String(error)),
                    )
                    .finally(() => setLoading(false));
                }}
              />
            </>
          }
        />
      )}
      {isStudent(editData) && viewOpen && (
        <Modal
          onExit={() => setViewOpen(false)}
          child={
            <>
              <StudentProfileModal student={editData} onClose={() => setViewOpen(false)} />
            </>
          }
        />
      )}
      {!isStudent(editData) && editOpen && <>TODO: Fill in with user edit form</>}
    </>
  );
}
