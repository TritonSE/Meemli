"use client";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

import styles from "./page.module.css";

import type { Section } from "@/src/api/sections";
import type { Student } from "@/src/api/students";

import { getAllSections } from "@/src/api/sections";
import { archiveStudents, getAllStudents } from "@/src/api/students";
import { Modal } from "@/src/components/Modal";
import { StudentForm } from "@/src/components/studentform/StudentForm";
import { Table } from "@/src/components/Table";

export default function Students() {
  // students holds all students
  const [students, setStudents] = useState<Student[]>([]);
  const [sections, setSections] = useState<Section[]>([]);

  const [isLoading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isEdit, setEdit] = useState<boolean>(false);
  const [addOpen, setAddOpen] = useState<boolean>(false);

  // state for viewing
  const [activeView, setActiveView] = useState<boolean>(true);
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<string | null>(null);

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

  const data = useMemo(() => {
    const showArchived = !activeView;
    const base = students.filter((s) => s.archived === showArchived);

    const q = searchFilter.trim().toLowerCase();
    if (!q) return base;

    return base.filter(
      (s) =>
        (s.displayName ?? "").toLowerCase().includes(q) ||
        (s.meemliEmail ?? "").toLowerCase().includes(q),
    );
  }, [students, activeView, searchFilter, selected]);

  const toggleActive = (flag: boolean) => {
    setActiveView(flag);
  };

  const archive = () => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    setLoading(true);
    archiveStudents(ids, true)
      .then((result) => {
        if (result.success) {
          // merge server response into state and clear selection
          setStudents((prev) => {
            const updated = new Map(result.data.map((s) => [s._id, s]));
            return prev.map((s) => updated.get(s._id) ?? s);
          });
          setSelected(new Set());
        } else {
          setErrorMessage(result.error);
        }
      })
      .catch((error) => setErrorMessage(error instanceof Error ? error.message : String(error)))
      .finally(() => setLoading(false));
  };

  const unarchive = () => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    setLoading(true);
    archiveStudents(ids, false)
      .then((result) => {
        if (result.success) {
          setStudents((prev) => {
            const updated = new Map(result.data.map((s) => [s._id, s]));
            return prev.map((s) => updated.get(s._id) ?? s);
          });
          setSelected(new Set());
        } else {
          setErrorMessage(result.error);
        }
      })
      .catch((error) => setErrorMessage(error instanceof Error ? error.message : String(error)))
      .finally(() => setLoading(false));
  };

  const renderSortMenu = () => {
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);

    /** Close when clicking outside */
    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (!menuRef.current) return;
        if (!menuRef.current.contains(event.target as Node)) {
          setOpen(false);
        }
      }

      if (open) {
        document.addEventListener("mousedown", handleClickOutside);
      }

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [open]);

    return (
      <div className={`${styles.sortMenu} ${styles.secondary}`} ref={menuRef}>
        <button onClick={() => setOpen((v) => !v)}>Sort By</button>
        {open && (
          <div className={styles.sortMenuDropdown}>
            <div className={styles.sortMenuItem}>Ascending</div>
            <div className={styles.sortMenuItem}>Descending</div>
          </div>
        )}
      </div>
    );
  };

  const renderHeader = () => {
    const archiveLabel = activeView ? "Archive Students" : "Unarchive Students";
    const archiveFxn = activeView ? archive : unarchive;
    return (
      <div className={`${styles.headerBar} ${styles.top}`}>
        <h1>Students</h1>
        <div className={styles.headerContainer}>
          {!isEdit && (
            <>
              <button
                className={`${styles.secondary} ${styles.headerButton}`}
                onClick={() => setEdit(!isEdit)}
              >
                <Image width={20} height={20} src="/icons/edit.svg" alt="Edit" />
                <p>Edit Students</p>
              </button>
              <button
                className={`${styles.primary} ${styles.headerButton}`}
                onClick={() => setAddOpen(!addOpen)}
              >
                <Image
                  className={styles.addIcon}
                  width={20}
                  height={20}
                  src="/icons/plus.svg"
                  alt="Add"
                />
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
                <Image
                  height={20}
                  width={20}
                  src="/icons/archive.svg"
                  alt="archive"
                  className={styles.archiveIcon}
                />
                {archiveLabel}
              </button>
              <button
                className={`${styles.delete} ${styles.headerButton}`}
                onClick={() => {
                  /* TODO: implement batch delete */
                }}
              >
                <Image
                  height={20}
                  width={20}
                  src="/icons/trash.svg"
                  alt="trash"
                  className={styles.trashIcon}
                />
                Delete Students
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderOptions = () => {
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
        </div>
        <div className={styles.headerContainer}>
          {renderSortMenu()}
          <input
            placeholder="Search Students"
            className={`${styles.searchBar}`}
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          ></input>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div>This is Students page</div>
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
      />
      {addOpen && (
        <Modal
          onExit={() => setAddOpen(false)}
          child={
            <StudentForm
              mode="create"
              onSubmit={() => {
                setAddOpen(false);
                getAllStudents()
                  .then((result) => {
                    if (result.success) setStudents(result.data);
                  })
                  .catch((error) =>
                    setErrorMessage(error instanceof Error ? error.message : String(error)),
                  )
                  .finally(() => setLoading(false));
              }}
              onCancel={() => setAddOpen(false)}
            />
          }
        />
      )}
    </div>
  );
}
