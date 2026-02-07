"use client";

import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import React, { useEffect, useState } from "react";

import { updateAttendanceBulk } from "../../api/attendance";

import styles from "./attendanceList.module.css";

type AttendanceListProps = {
  initialAttendees: any[];
  onUpdate: (updatedData: any) => void;
};

type Student = {
  _id: string;
  displayName: string;
};

type Attendee = {
  _id: string;
  sessions: string;
  student: Student;
  status: string;
  notes: string;
};

export default function AttendanceList({ initialAttendees }: AttendanceListProps) {
  // Local copy of the data
  const [attendees, setAttendees] = useState<Attendee[]>(initialAttendees);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  //update local state
  const updateLocalState = (id: string, field: string, value: string) => {
    setAttendees((prev) => prev.map((att) => (att._id === id ? { ...att, [field]: value } : att)));
  };

  //autosave
  useEffect(() => {
    if (!attendees || attendees.length === 0) return;

    setSaveStatus("saving");

    const timer = setTimeout(() => {
      void (async () => {
        try {
          const updates = attendees.map((a: Attendee) => ({
            attendanceId: a._id,
            status: a.status,
            notes: a.notes,
          }));

          await updateAttendanceBulk(updates); //API function
          setSaveStatus("saved");
        } catch (err) {
          console.error(err);
          setSaveStatus("error");
        }
      })();
    }, 1000);

    return () => clearTimeout(timer);
  }, [attendees]);

  if (!attendees || attendees.length === 0) {
    return <div className="p-10 text-gray-500">No students found for this session.</div>;
  }

  return (
    <div className={styles.mainContainer}>
      <div className={styles.headerRow}>
        <div className={styles.columnHeader}>Student Name</div>
        <div className={styles.columnHeader}>Status</div>
        <div className={styles.columnHeader}>Notes</div>
      </div>

      {attendees.map((att) => (
        <div key={att._id} className={styles.studentRow}>
          {/* SAFETY CHECK: Use ?. to prevent "null displayName" error */}
          <div className={styles.cell}>{att.student?.displayName || "Unknown Student"}</div>

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
      ))}
    </div>
  );
}
