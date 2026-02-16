"use client";

import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useMemo, useRef, useState } from "react";

import { updateAttendanceBulk } from "../../api/attendance";

import styles from "./attendanceList.module.css";

import type { SortOption } from "./attendanceSortBy";

type AttendanceListProps = {
  initialAttendees: any[];
  isFilterSelected: boolean;
  searchQuery?: string;
  sortOption?: SortOption;
  onUpdate?: (updatedData: any) => void;
};

type Student = {
  _id: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
};

type Attendee = {
  _id: string;
  sessions: string;
  student: Student;
  status: string;
  notes: string;
};

export default function AttendanceList({
  initialAttendees,
  isFilterSelected,
  searchQuery = "",
  sortOption = { field: "name", order: "asc", label: "Ascending" },
}: AttendanceListProps) {
  const [attendees, setAttendees] = useState<Attendee[]>(initialAttendees);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const isFirstRender = useRef(true);

  // Helper function to get full name
  const getFullName = (student: Student) => {
    if (student?.firstName && student?.lastName) {
      return `${student.firstName} ${student.lastName}`;
    }
    return student?.displayName || "Unknown Student";
  };

  // Filter and sort attendees
  const filteredAndSortedAttendees = useMemo(() => {
    let result = [...attendees];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((att) => {
        const fullName = getFullName(att.student).toLowerCase();
        return fullName.includes(query);
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      if (sortOption.field === "name") {
        const nameA = getFullName(a.student).toLowerCase();
        const nameB = getFullName(b.student).toLowerCase();
        const comparison = nameA.localeCompare(nameB);
        return sortOption.order === "asc" ? comparison : -comparison;
      }

      if (sortOption.field === "status") {
        // Status priority: PRESENT -> ABSENT -> LATE
        const statusOrder: Record<string, number> = {
          PRESENT: 1,
          ABSENT: 2,
          LATE: 3,
        };
        const statusA = statusOrder[a.status] || 999;
        const statusB = statusOrder[b.status] || 999;
        const comparison = statusA - statusB;
        return sortOption.order === "asc" ? comparison : -comparison;
      }

      if (sortOption.field === "notes") {
        const notesA = (a.notes || "").toLowerCase();
        const notesB = (b.notes || "").toLowerCase();
        const comparison = notesA.localeCompare(notesB);
        return sortOption.order === "asc" ? comparison : -comparison;
      }

      return 0;
    });

    return result;
  }, [attendees, searchQuery, sortOption]);

  //update local state
  const updateLocalState = (id: string, field: string, value: string) => {
    setAttendees((prev) => prev.map((att) => (att._id === id ? { ...att, [field]: value } : att)));
  };

  //for filter changes
  useEffect(() => {
    setAttendees(initialAttendees);
  }, [initialAttendees]);

  //autosave
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (attendees.length === 0) return;

    setSaveStatus("saving");
    const timer = setTimeout(() => {
      const saveData = async () => {
        try {
          const updates = attendees.map((a) => ({
            attendanceId: a._id,
            status: a.status,
            notes: a.notes,
          }));
          await updateAttendanceBulk(updates);
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus("idle"), 2000);
        } catch (error) {
          console.error("Failed to save attendance:", error);
          setSaveStatus("idle");
        }
      };

      void saveData();
    }, 1000);

    return () => clearTimeout(timer);
  }, [attendees]);

  return (
    <div className={styles.mainContainer}>
      <div className={styles.tableHeader}>
        <div className={styles.colName}>Student Name</div>
        <div className={styles.colStatus}>Status</div>
        <div className={styles.colNotes}>Notes</div>
      </div>

      <div className={styles.rowsContainer}>
        {filteredAndSortedAttendees.length > 0 ? (
          filteredAndSortedAttendees.map((att) => (
            <div key={att._id} className={styles.studentRow}>
              <div className={styles.colName}>{getFullName(att.student)}</div>

              <div className={styles.colStatus}>
                <div className={styles.statusGroup}>
                  <button
                    onClick={() => updateLocalState(att._id, "status", "PRESENT")}
                    className={`${styles.statusBtn} ${att.status === "PRESENT" ? `${styles.btnPresent} ${styles.active}` : ""}`}
                  >
                    <CheckIcon sx={{ fontSize: 20 }} />
                    Present
                  </button>
                  <button
                    onClick={() => updateLocalState(att._id, "status", "ABSENT")}
                    className={`${styles.statusBtn} ${att.status === "ABSENT" ? `${styles.btnAbsent} ${styles.active}` : ""}`}
                  >
                    <CloseIcon sx={{ fontSize: 20 }} />
                    Absent
                  </button>
                  <button
                    onClick={() => updateLocalState(att._id, "status", "LATE")}
                    className={`${styles.statusBtn} ${att.status === "LATE" ? `${styles.btnLate} ${styles.active}` : ""}`}
                  >
                    <AccessTimeIcon sx={{ fontSize: 20 }} />
                    Late
                  </button>
                </div>
              </div>

              <div className={styles.colNotes}>
                <input
                  className={styles.notesInput}
                  value={att.notes || ""}
                  onChange={(e) => updateLocalState(att._id, "notes", e.target.value)}
                  placeholder="Type here..."
                />
              </div>
            </div>
          ))
        ) : (
          <div className={`${styles.table} flex items-center justify-center min-h-[300px]`}>
            {!isFilterSelected ? (
              /* initial state - empty table w/ message */
              <div className="space-y-2 text-center">
                <p className={styles.sessionNotFound}>
                  There is no class scheduled on this day. Please select a scheduled class date to
                  mark attendance.
                </p>
              </div>
            ) : searchQuery.trim() ? (
              /* No results found for search */
              <div className="space-y-2 text-center">
                <p className={styles.sessionNotFound}>
                  No students found matching "{searchQuery}". Try a different search term.
                </p>
              </div>
            ) : (
              /* No session found */
              <div className="space-y-2 text-center">
                <p className={styles.sessionNotFound}>
                  There is no class scheduled on this day. Please select a scheduled class date to
                  mark attendance.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
