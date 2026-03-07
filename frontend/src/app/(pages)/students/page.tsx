"use client";
import {
  ArchiveIcon,
  ArrowUpDown,
  PlusIcon,
  Search,
  Trash2,
  TriangleAlert,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import type { Section } from "@/src/api/sections";
import type { Student } from "@/src/api/students";

import CheckCircleIcon from "@/public/icons/check-circle.svg";
import EditIcon from "@/public/icons/edit.svg";
import { getAllSections } from "@/src/api/sections";
import { archiveStudents, deleteStudents, getAllStudents } from "@/src/api/students";
import { Modal } from "@/src/components/Modal";
import { StudentForm } from "@/src/components/studentform/StudentForm";
import styles from "@/src/components/studentStaffPage.module.css";
import { Table } from "@/src/components/Table";

type BannerState = {
  type: "success" | "error";
  message: string;
  timestamp: number;
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
  const [sortBy, setSortBy] = useState<string | null>(null);

  const [banner, setBanner] = useState<BannerState | null>(null);
  const [bannerOpen, setBannerOpen] = useState(false);
  const [addOpen, setAddOpen] = useState<boolean>(false);
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);
  const BANNER_LENGTH = 5000;

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

  // displays banner for 5 seconds
  useEffect(() => {
    if (!banner) return;

    setBannerOpen(true);

    const timer = setTimeout(() => {
      setBannerOpen(false);
    }, BANNER_LENGTH);

    return () => clearTimeout(timer);
  }, [banner]);

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

  const deleteEntries = () => {
    const ids = Array.from(selected);
    if (ids.length === 0) {
      setBanner({
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
          // create banner message on successful request
          const multi = ids.length > 1;
          const message = `${ids.length} student
          ${multi ? "s were" : " was"} successfuly deleted.`;
          setBanner({
            type: "success",
            message,
            timestamp: Date.now(),
          });
          setSelected(new Set());
          setStudents(result.data);
        } else {
          setErrorMessage(result.error);
          const message = `Error: Unable to delete student(s). ${result.error}`;
          setBanner({
            type: "error",
            message,
            timestamp: Date.now(),
          });
        }
      })
      .catch((error) => setErrorMessage(error instanceof Error ? error.message : String(error)))
      .finally(() => setLoading(false));
  };

  const archive = () => {
    const ids = Array.from(selected);
    if (ids.length === 0) {
      setBanner({
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
          // create banner message on successful request
          const multi = ids.length > 1;
          const message = `
            Student${multi ? "s" : ""} 
            ${result.data[0].displayName} 
            ${multi ? ` + ${result.data.length - 1} more were` : "was"} successfully archived.`;
          setBanner({
            type: "success",
            message,
            timestamp: Date.now(),
          });
          setSelected(new Set());
        } else {
          setErrorMessage(result.error);
          const message = `Error: Unable to unarchive student(s). ${result.error}`;
          setBanner({
            type: "error",
            message,
            timestamp: Date.now(),
          });
        }
      })
      .catch((error) => setErrorMessage(error instanceof Error ? error.message : String(error)))
      .finally(() => setLoading(false));
  };

  const unarchive = () => {
    const ids = Array.from(selected);
    if (ids.length === 0) {
      setBanner({
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
            ${multi ? ` + ${result.data.length - 1} more were` : "was"} successfully unarchived.`;
          setBanner({
            type: "success",
            message,
            timestamp: Date.now(),
          });
          setSelected(new Set());
        } else {
          setErrorMessage(result.error);
          const message = `Error: Unable to unarchive student(s). ${result.error}`;
          setBanner({
            type: "error",
            message,
            timestamp: Date.now(),
          });
        }
      })
      .catch((error) => setErrorMessage(error instanceof Error ? error.message : String(error)))
      .finally(() => setLoading(false));
  };

  const deleteSubmit = () => {
    if (selected.size === 0) {
      setBanner({
        type: "error",
        message: "No students selected.",
        timestamp: Date.now(),
      });
    } else {
      setDeleteOpen(true);
    }
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
        <button onClick={() => setOpen((v) => !v)}>
          <ArrowUpDown />
          Sort By
        </button>
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
    const archiveLabel = activeView ? "Archive Students" : "Restore Students";
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

  const renderBanner = () => {
    if (!banner || !bannerOpen) return <></>;
    const succ = banner.type === "success";
    const icon = succ ? (
      <CheckCircleIcon className={styles.checkCircleIcon} />
    ) : (
      <XCircle className={styles.xCircleIcon} />
    );
    return (
      <div className={`${styles.banner} ${succ ? styles.bannerSuccess : styles.bannerError}`}>
        {icon}
        {banner.message}
      </div>
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
      {renderBanner()}
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
              onSubmit={(new_stud: Student) => {
                setAddOpen(false);
                getAllStudents()
                  .then((result) => {
                    if (result.success) setStudents(result.data);
                    const message = `Student ${new_stud.displayName} was added successfully`;
                    setBanner({
                      type: "success",
                      message,
                      timestamp: Date.now(),
                    });
                  })
                  .catch((error) => {
                    setErrorMessage(error instanceof Error ? error.message : String(error));
                    setBanner({
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
