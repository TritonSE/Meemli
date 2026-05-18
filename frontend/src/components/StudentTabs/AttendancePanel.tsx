import { useEffect, useState } from "react";

import styles from "./AttendancePanel.module.css";

import type { AttendanceRecord, Student } from "@/src/api/attendance";

import { getAttendanceByStudentId } from "@/src/api/attendance";

type AttendancePanelProps = {
  student: Student;
};

type InfoBoxProps = {
  label: string;
  data: string;
  color: string;
};

function InfoBox({ label, data, color }: InfoBoxProps) {
  return (
    <div className={styles.infoBoxWrapper}>
      <p>{label}</p>
      <div className={styles.box} style={{ backgroundColor: color }}>
        <p className={styles.data}>{data}</p>
      </div>
    </div>
  );
}

export function AttendancePanel({ student }: AttendancePanelProps) {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    if (!student._id) return;
    getAttendanceByStudentId(student._id)
      .then((result) => {
        if (result.success) setAttendance(result.data);
      })
      .catch((error) => console.info(error));
  }, [student._id]);

  return (
    <>
      <InfoBox label={"label"} data={"7"} color={"#FF0000"} />
    </>
  );
}
