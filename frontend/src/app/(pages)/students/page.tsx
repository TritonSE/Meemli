"use client";
import { ArchiveIcon, ArrowUpDown, PlusIcon, Search, Trash2, TriangleAlert } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

import type { Section } from "@/src/api/sections";
import type { Student } from "@/src/api/students";
import type { DropdownItem } from "@/src/components/StudentStaffTable/Dropdown";

import EditIcon from "@/public/icons/edit.svg";
import { getAllSections } from "@/src/api/sections";
import { archiveStudents, deleteStudents, getAllStudents } from "@/src/api/students";
import { Modal } from "@/src/components/Modal";
import { StudentForm } from "@/src/components/studentform/StudentForm";
import { Dropdown } from "@/src/components/StudentStaffTable/Dropdown";
import { ProgramSelect } from "@/src/components/StudentStaffTable/ProgramSelect";
import styles from "@/src/components/StudentStaffTable/studentStaffPage.module.css";
import { Table } from "@/src/components/StudentStaffTable/Table";
import { Toast } from "@/src/components/Toast/Toast";

type ToastState = {
  type: "success" | "error" | "neutral";
  message: string;
  timestamp: number;
  undoArchiveIds?: string[];
  undoUnarchiveIds?: string[];
};

export default function Students() {
  // students holds all students
  const [students, setStudents] = useState<Student[]>([]);
  const [sections, setSections] = useState<Section[]>([]);

  const [isLoading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isEdit, setEdit] = useState<boolean>(false);

  // state for viewing
  const [activeView, setActiveView] = useState<boolean>(true);
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [asc, setAsc] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<string[]>([]);

  const [toast, setToast] = useState<ToastState | null>(null);
  const [addOpen, setAddOpen] = useState<boolean>(false);
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    getAllStudents()
      .then((result) => {
        if (result.success) {
          setStudents(result.data);
        } else {
          setErrorMessage(result.error);
        }
      })
      .catch((error) => setErrorMessage(error instanceof Error ? error.message : String(error)))
      .finally(() => setLoading(false));

    getAllSections()
      .then((result) => {
        if (result.success) {
          setSections(result.data);
        } else {
          setErrorMessage(result.error);
        }
      })
      .catch((error) => setErrorMessage(error instanceof Error ? error.message : String(error)))
      .finally(() => setLoading(false));
  }, []);

  // update the data passed into the table upon filter changes
  const data = useMemo(() => {
    const showArchived = !activeView;
    // filter by active/archive
    let base = students.filter((s) => s.archived === showArchived);
    // filter by section
    if (sortBy.length > 0) {
      base = base.filter((s) => s.enrolledSections.some((sectionId) => sortBy.includes(sectionId)));
    }
    // filter by search bar
    const q = searchFilter.trim().toLowerCase();
    if (q) {
      base = base.filter(
        (s) =>
          (s.displayName ?? "").toLowerCase().includes(q) ||
          (s.meemliEmail ?? "").toLowerCase().includes(q),
      );
    }
    // sort by name
    base = base.sort((a, b) =>
      (a.displayName ?? "").localeCompare(b.displayName ?? "", undefined, {
        sensitivity: "base",
      }),
    );
    // reverse based on ascending / descending
    base = asc ? base : base.reverse();
    return base;
  }, [students, activeView, searchFilter, selected, asc, sortBy]);

  const toggleActive = (flag: boolean) => {
    setActiveView(flag);
  };

  /**
   * Deletes all selected students from the database
   */
  const deleteEntries = () => {
    const ids = Array.from(selected);
    if (ids.length === 0) {
      setToast({
        type: "error",
        message: "No students selected.",
        timestamp: Date.now(),
      });
      return;
    }
    setLoading(true);
    deleteStudents(ids)
      .then((result) => {
        if (result.success) {
          setStudents((prev) => {
            const updated = new Map(result.data.map((s) => [s._id, s]));
            return prev.map((s) => updated.get(s._id) ?? s);
          });
          // create toast message on successful request
          const multi = ids.length > 1;
          const message = `${ids.length} student
          ${multi ? "s were" : " was"} successfuly deleted.`;
          setToast({
            type: "success",
            message,
            timestamp: Date.now(),
          });
          setSelected(new Set());
          setStudents(result.data);
        } else {
          setErrorMessage(result.error);
          const message = `Error: Unable to delete student(s). ${result.error}`;
          setToast({
            type: "error",
            message,
            timestamp: Date.now(),
          });
        }
      })
      .catch((error) => setErrorMessage(error instanceof Error ? error.message : String(error)))
      .finally(() => setLoading(false));
  };

  /**
   * Handles bulk archiving students
   */
  const archive = () => {
    const ids = Array.from(selected);
    if (ids.length === 0) {
      setToast({
        type: "error",
        message: "No students selected.",
        timestamp: Date.now(),
      });
      return;
    }
    setLoading(true);
    archiveStudents(ids, true)
      .then((result) => {
        if (result.success) {
          setStudents((prev) => {
            const updated = new Map(result.data.map((s) => [s._id, s]));
            return prev.map((s) => updated.get(s._id) ?? s);
          });
          // create toast message on successful request
          const multi = ids.length > 1;
          const message = `
            Student${multi ? "s" : ""} 
            ${result.data[0].displayName} 
            ${multi ? ` + ${result.data.length - 1} more were` : "was"} archived.`;
          setToast({
            type: "neutral",
            message,
            timestamp: Date.now(),
            undoArchiveIds: ids,
          });
          setSelected(new Set());
        } else {
          setErrorMessage(result.error);
          const message = `Error: Unable to unarchive student(s). ${result.error}`;
          setToast({
            type: "error",
            message,
            timestamp: Date.now(),
          });
        }
      })
      .catch((error) => setErrorMessage(error instanceof Error ? error.message : String(error)))
      .finally(() => setLoading(false));
  };

  /**
   * Undoes an archive request by sending its own unarchive request
   */
  const undoArchive = (ids: string[]) => {
    if (ids.length === 0) return;

    setLoading(true);
    archiveStudents(ids, false)
      .then((result) => {
        if (result.success) {
          setStudents((prev) => {
            const updated = new Map(result.data.map((s) => [s._id, s]));
            return prev.map((s) => updated.get(s._id) ?? s);
          });
          const multi = ids.length > 1;
          const message = `Archive undone for ${result.data[0].displayName}${multi ? ` + ${ids.length - 1} more` : ""}.`;
          setToast({
            type: "neutral",
            message,
            timestamp: Date.now(),
          });
          setSelected(new Set());
        } else {
          const message = `Error: Unable to undo archive. ${result.error}`;
          setToast({
            type: "error",
            message,
            timestamp: Date.now(),
          });
        }
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : String(error);
        setErrorMessage(message);
        setToast({
          type: "error",
          message: `Error: Unable to undo archive. ${message}`,
          timestamp: Date.now(),
        });
      })
      .finally(() => setLoading(false));
  };
  /**
   * Undoes an unarchive request by sending an archive request
   */
  const undoUnarchive = (ids: string[]) => {
    if (ids.length === 0) return;

    setLoading(true);
    archiveStudents(ids, true)
      .then((result) => {
        if (result.success) {
          setStudents((prev) => {
            const updated = new Map(result.data.map((s) => [s._id, s]));
            return prev.map((s) => updated.get(s._id) ?? s);
          });
          const multi = ids.length > 1;
          const message = `Unarchive undone for ${result.data[0].displayName}${multi ? ` + ${ids.length - 1} more` : ""}.`;
          setToast({
            type: "neutral",
            message,
            timestamp: Date.now(),
          });
          setSelected(new Set());
        } else {
          const message = `Error: Unable to undo unarchive. ${result.error}`;
          setToast({
            type: "error",
            message,
            timestamp: Date.now(),
          });
        }
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : String(error);
        setErrorMessage(message);
        setToast({
          type: "error",
          message: `Error: Unable to undo unarchive. ${message}`,
          timestamp: Date.now(),
        });
      })
      .finally(() => setLoading(false));
  };

  /**
   * Bulk unarchives students
   */
  const unarchive = () => {
    const ids = Array.from(selected);
    if (ids.length === 0) {
      setToast({
        type: "error",
        message: "No students selected.",
        timestamp: Date.now(),
      });
      return;
    }
    setLoading(true);
    archiveStudents(ids, false)
      .then((result) => {
        if (result.success) {
          setStudents((prev) => {
            const updated = new Map(result.data.map((s) => [s._id, s]));
            return prev.map((s) => updated.get(s._id) ?? s);
          });
          const multi = ids.length > 1;
          const message = `
            Student${multi ? "s" : ""} 
            ${result.data[0].displayName} 
            ${multi ? ` + ${result.data.length - 1} more were` : "was"} unarchived.`;
          setToast({
            type: "neutral",
            message,
            timestamp: Date.now(),
            undoUnarchiveIds: ids,
          });
          setSelected(new Set());
        } else {
          setErrorMessage(result.error);
          const message = `Error: Unable to unarchive student(s). ${result.error}`;
          setToast({
            type: "error",
            message,
            timestamp: Date.now(),
          });
        }
      })
      .catch((error) => setErrorMessage(error instanceof Error ? error.message : String(error)))
      .finally(() => setLoading(false));
  };

  /**
   * Function bound to the delete button
   * Checks that there are students selected before opening the delete modal
   */
  const deleteSubmit = () => {
    if (selected.size === 0) {
      setToast({
        type: "error",
        message: "No students selected.",
        timestamp: Date.now(),
      });
    } else {
      setDeleteOpen(true);
    }
  };

  const renderHeader = () => {
    const archiveLabel = activeView ? "Archive Students" : "Unarchive Students";
    const archiveFxn = activeView ? archive : unarchive;
    return (
      <div className={`${styles.headerBar} ${styles.top}`}>
        <div className={styles.headerContainer}>
          <h1>Students</h1>
          {selected.size !== 0 && <p>({selected.size} selected)</p>}
        </div>

        <div className={styles.headerContainer}>
          {!isEdit && (
            <>
              <button
                className={`${styles.secondary} ${styles.headerButton}`}
                onClick={() => setEdit(!isEdit)}
              >
                <EditIcon className={styles.editIcon} />
                <p>Edit Students</p>
              </button>
              <button
                className={`${styles.primary} ${styles.headerButton}`}
                onClick={() => setAddOpen(!addOpen)}
              >
                <PlusIcon className={styles.addIcon} />
                Add Student
              </button>
            </>
          )}
          {isEdit && (
            <>
              <button
                className={`${styles.secondary} ${styles.headerButton}`}
                onClick={() => setEdit(!isEdit)}
              >
                Cancel
              </button>
              <button className={`${styles.archive} ${styles.headerButton}`} onClick={archiveFxn}>
                <ArchiveIcon className={styles.archiveIcon} />
                {archiveLabel}
              </button>
              <button
                className={`${styles.delete} ${styles.headerButton}`}
                onClick={() => deleteSubmit()}
              >
                <Trash2 className={styles.trashIcon} />
                Delete Students
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderOptions = () => {
    const ascItems: DropdownItem[] = [
      {
        content: (
          <>
            <ArrowUpDown />
            <p>Sort By</p>
          </>
        ),
        onClick: () => {},
      },
      {
        content: <p>Ascending</p>,
        onClick: () => setAsc(true),
      },
      {
        content: <p>Descending</p>,
        onClick: () => setAsc(false),
      },
    ];
    return (
      <div className={`${styles.headerBar}`}>
        <div className={styles.headerContainer}>
          <button
            className={`${activeView ? styles.primary : styles.secondary} ${styles.headerButton}`}
            onClick={() => toggleActive(true)}
          >
            Active
          </button>
          <button
            className={`${!activeView ? styles.primary : styles.secondary} ${styles.headerButton}`}
            onClick={() => toggleActive(false)}
          >
            Archived
          </button>
          <ProgramSelect items={sections} selected={sortBy} setSelected={setSortBy} />
        </div>
        <div className={styles.headerContainer}>
          <Dropdown items={ascItems} placeholder={true} />
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search Students"
              className={`${styles.searchInput} ${styles.secondary}`}
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderToast = () => {
    if (!toast) return <></>;

    const action =
      toast.undoArchiveIds && toast.undoArchiveIds.length > 0
        ? {
            label: "Undo",
            onAction: (...args: unknown[]) => undoArchive((args[0] as string[]) ?? []),
            actionArgs: [toast.undoArchiveIds],
          }
        : toast.undoUnarchiveIds && toast.undoUnarchiveIds.length > 0
          ? {
              label: "Undo",
              onAction: (...args: unknown[]) => undoUnarchive((args[0] as string[]) ?? []),
              actionArgs: [toast.undoUnarchiveIds],
            }
          : undefined;

    return (
      <Toast
        type={toast.type}
        message={toast.message}
        trigger={toast.timestamp}
        durationMs={5000}
        onClose={() => setToast(null)}
        action={action}
      />
    );
  };

  const renderDeletePage = () => {
    const num = selected.size;
    // grab a name from the selected entries
    const arr = Array.from(data.filter((s) => selected.has(s._id)));
    let name;
    if (arr.length > 0) {
      name = arr[0].displayName;
    } else {
      name = "{Error}";
    }
    // alter the message depending on # of selections
    const extra = num > 1 ? ` + ${num - 1} other${num - 1 > 1 ? "s" : ""}` : "";
    return (
      <div className={styles.deleteContainer}>
        <div className={styles.delRow}>
          <TriangleAlert className={styles.warningIcon} />
          <h1>Deleting profile</h1>
        </div>
        <div className={styles.delRow}>
          <p>
            Are you sure you want to delete <strong>{name}</strong>'s profile{extra}?
          </p>
        </div>
        <div className={styles.delRow}>
          <strong>This action cannot be undone.</strong>
        </div>
        <div className={styles.delButtonRow}>
          <button
            onClick={() => setDeleteOpen(false)}
            className={`${styles.primary} ${styles.modalButton}`}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              deleteEntries();
              setDeleteOpen(false);
            }}
            className={`${styles.archive} ${styles.modalButton}`}
          >
            Yes, I'm sure.
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      {renderToast()}
      {renderHeader()}
      {renderOptions()}
      <Table
        data={data}
        setData={setStudents}
        sections={sections}
        type="student"
        isEdit={isEdit}
        selected={selected}
        setSelected={setSelected}
        onEdit={() => {
          setToast({
            type: "success",
            message: "Edits saved successfully.",
            timestamp: Date.now(),
          });
        }}
      />
      {addOpen && (
        <Modal
          onExit={() => setAddOpen(false)}
          child={
            <StudentForm
              mode="create"
              onSubmit={(new_stud: Student) => {
                setAddOpen(false);
                getAllStudents()
                  .then((result) => {
                    if (result.success) setStudents(result.data);
                    const message = `Student ${new_stud.displayName} was added successfully`;
                    setToast({
                      type: "success",
                      message,
                      timestamp: Date.now(),
                    });
                  })
                  .catch((error) => {
                    setErrorMessage(error instanceof Error ? error.message : String(error));
                    setToast({
                      type: "success",
                      message: "Error: Could not add student",
                      timestamp: Date.now(),
                    });
                  })
                  .finally(() => setLoading(false));
              }}
              onCancel={() => setAddOpen(false)}
            />
          }
        />
      )}
      {deleteOpen && <Modal onExit={() => setDeleteOpen(false)} child={renderDeletePage()} />}
    </div>
  );
}
