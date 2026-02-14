"use client";

import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useRef, useState } from "react";

import { updateAttendanceBulk } from "../../api/attendance";

import styles from "./attendanceList.module.css";

type AttendanceListProps = {
  initialAttendees: any[];
  isFilterSelected: boolean;
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
}: AttendanceListProps) {
  const [attendees, setAttendees] = useState<Attendee[]>(initialAttendees);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const isFirstRender = useRef(true);
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
      <div className={styles.headerRow}>
        <div className={styles.columnHeader}>Student Name</div>
        <div className={styles.columnHeader}>Status</div>
        <div className={styles.columnHeader}>Notes</div>
      </div>

      {attendees.length > 0 ? (
        attendees.map((att) => (
          <div key={att._id} className={styles.studentRow}>
            <div className={styles.cell}>
              {att.student?.firstName && att.student?.lastName
                ? `${att.student.firstName} ${att.student.lastName}`
                : att.student?.displayName || "Unknown Student"}
            </div>

            <div className={styles.cell}>
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

            <div className={styles.cell}>
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
        <div className={styles.table}>
          {!isFilterSelected ? (
            /* initial state - empty table */
            <div className="h-20" />
          ) : (
            <div className="space-y-2">
              <p className={styles.sessionNotFound}>
                There is no class scheduled on this day. Please select a scheduled class date to
                mark attendance.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
