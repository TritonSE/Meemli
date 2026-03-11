import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import styles from "./Table.module.css";

import type { Section } from "@/src/api/sections";
import type { Student } from "@/src/api/students";
import type { Dispatch, SetStateAction } from "react";

import EditIcon from "@/public/icons/edit.svg";
import PrevIcon from "@/public/icons/prev.svg";
import ShowIcon from "@/public/icons/show.svg";
import { getAllStudents } from "@/src/api/students";
import { Modal } from "@/src/components/Modal";
import { StudentCard } from "@/src/components/StudentCard/StudentCard";
import { StudentForm } from "@/src/components/studentform/StudentForm";
import { StudentProfileModal } from "@/src/components/StudentProfileView/StudentProfileView";

/**
 * Component for dynamically rendering block-like items based on available container space
 * @param labels - Array of strings to display as labels
 * @param colors - Array of colors (hex or CSS color names) corresponding to each label
 */
function DynamicBlockDisplay({ labels, colors }: { labels: string[]; colors: string[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState<number>(3);

  useEffect(() => {
    if (!containerRef.current) return;

    const updateVisibleCount = () => {
      const container = containerRef.current;
      if (!container || container.children.length === 0) return;

      const containerWidth = container.clientWidth;
      const firstChild = container.children[0] as HTMLElement;
      const itemWidth = firstChild.offsetWidth;
      const gap = 6;
      const overflowItemEstimate = 45;

      let count = Math.floor((containerWidth - overflowItemEstimate - gap) / (itemWidth + gap));
      count = Math.max(0, Math.min(count, labels.length));

      setVisibleCount(count);
    };

    // Use ResizeObserver to handle dynamic width changes
    const resizeObserver = new ResizeObserver(updateVisibleCount);
    resizeObserver.observe(containerRef.current);
    const timer = setTimeout(updateVisibleCount, 0);

    return () => {
      resizeObserver.disconnect();
      clearTimeout(timer);
    };
  }, [labels.length]);

  const visible = labels.slice(0, visibleCount);
  const remaining = labels.length - visible.length;

  // TODO: update to section color
  return (
    <div ref={containerRef} className={styles.blockItems}>
      {visible.map((label, index) => (
        <div
          key={index}
          className={styles.blockItem}
          style={{ backgroundColor: colors[index] ?? "#008080" }}
        >
          {label}
        </div>
      ))}
      {remaining > 0 && (
        <div className={`${styles.blockItem} ${styles.moreItem}`}>+{remaining}</div>
      )}
    </div>
  );
}

type User = {
  _id: string;
  firstName: string;
  lastName: string;
  personalEmail: string;
  meemliEmail: string;
  phoneNumber: string;
  admin: boolean;
  assignedsections: string[];
};

export type TableProps = {
  data: Student[] | User[];
  setData: Dispatch<SetStateAction<any>>;
  sections: Section[];
  type: "staff" | "student";
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
  sections,
  isEdit,
  onEdit,
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
    if (!bool && !isEdit) return <></>;
    // add edit icon no matter what if edit mode
    if (isEdit) {
      children.push(<EditIcon key="0" className={styles.hoverIcon} />);
    } else {
      children.push(<ShowIcon key="0" className={styles.hoverIcon} />);
    }

    if (bool) {
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
    } else {
      fxn = () => {
        setFormData(input);
        setFormOpen(true);
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
    // if parent email exists, its a student, otherwise its staff
    if (isStudent(input)) {
      const sectionLabels = input.enrolledSections.map((cid) => {
        const res = sections.find((obj) => obj._id === cid);
        return res ? res.code : "Error";
      });
      const sortedLabels = sectionLabels.sort((a, b) =>
        (a ?? "").localeCompare(b ?? "", undefined, {
          sensitivity: "base",
        }),
      );
      // TODO: replace with section color
      const sectionColors = input.enrolledSections.map(() => "teal");

      return (
        <>
          {renderCheckbox(input)}
          <td className={styles.nameItem}>
            <StudentCard data={input} variant="list" />
            <div className={styles.hoverWrap}>{renderHoverBtn(input)}</div>
          </td>
          <td className={styles.textItem}>{input.parentContact.email}</td>
          <td>
            <DynamicBlockDisplay labels={sortedLabels} colors={sectionColors} />
          </td>
          <td className={styles.notesItem}>{input.comments}</td>
        </>
      );
    } else {
      return (
        <>
          {renderCheckbox(input)}
          <td className={styles.nameItem}></td>
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
