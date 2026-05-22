import { useEffect, useState } from "react";

import styles from "./AttendancePanel.module.css";

import type { AttendanceRecord } from "@/src/api/attendance";
import type { Section } from "@/src/api/sections";
import type { Session } from "@/src/api/session";
import type { Student } from "@/src/api/students";

import { getAttendanceByStudentId } from "@/src/api/attendance";
import { getAllSections } from "@/src/api/sections";
import { getAllSessions } from "@/src/api/session";

type AttendancePanelProps = {
  student: Student;
};

type InfoBoxProps = {
  label: string;
  data: string;
  color: string | undefined;
};

type SectionAttendanceProps = {
  attendance: AttendanceRecord[];
  label: string;
  color: string | undefined;
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

function SectionAttendance({ attendance, label, color }: SectionAttendanceProps) {
  const present = attendance.filter((record) => record.status === "PRESENT").length;
  const tardy = attendance.filter((record) => record.status === "LATE").length;
  const absent = attendance.filter((record) => record.status === "ABSENT").length;
  const c = color === undefined ? "#222222" : color;

  return (
    <div className={styles.sectionAttendance}>
      <div className={styles.headerBar}>
        <div className={styles.color} style={{ backgroundColor: c }}></div>
        <p>{label}</p>
      </div>
      <div className={styles.container}>
        <InfoBox label="Present" data={present.toString()} color="#12B76A" />
        <InfoBox label="Tardy" data={tardy.toString()} color="#F79009" />
        <InfoBox label="Absent" data={absent.toString()} color="#F04438" />
      </div>
    </div>
  );
}

export function AttendancePanel({ student }: AttendancePanelProps) {
  const [attendances, setAttendance] = useState<AttendanceRecord[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!student._id) return;
    setLoading(true);
    getAttendanceByStudentId(student._id)
      .then((result) => {
        if (result.success) setAttendance(result.data);
      })
      .catch((error) => console.info(error))
      .finally(() => setLoading(false));
  }, [student._id]);

  useEffect(() => {
    setLoading(true);
    Promise.all([getAllSessions(), getAllSections()])
      .then(([sessionsResult, sectionsResult]) => {
        if (sessionsResult.success) {
          setSessions(sessionsResult.data);
        }

        if (sectionsResult.success) {
          setSections(sectionsResult.data);
        }
      })
      .catch((error) => {
        console.info(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);
  // extract the sections that overlap with the student's enrollment
  const overlappingSections = sections.filter((section) =>
    student.enrolledSections?.includes(section._id),
  );
  // map each session to a section and each section code to a display color
  const sessionsToCodes = new Map(
    sessions.map((session) => [session._id, session.section?.code ?? null]),
  );

  // map each section code to its color
  const codeToColor = new Map(sections.map((section) => [section.code, section.color]));

  // map each section code to a list of attendances
  const codeToAttendances = new Map<string, AttendanceRecord[]>();
  for (const attendance of attendances) {
    const code = sessionsToCodes.get(attendance.session);
    if (code == null) {
      continue;
    }

    if (!codeToAttendances.has(code)) {
      codeToAttendances.set(code, []);
    }
    codeToAttendances.get(code)!.push(attendance);
  }

  // add any sections that had no attendance objects with empty arrays
  for (const section of overlappingSections) {
    if (!codeToAttendances.has(section.code)) {
      codeToAttendances.set(section.code, []);
    }
  }
  if (loading) {
    return <p>Loading...</p>;
  }
  return (
    <div className={styles.wrapper}>
      {Array.from(codeToAttendances.entries()).map(([code, list]) => (
        <SectionAttendance
          key={code}
          color={codeToColor.get(code)}
          label={code}
          attendance={list}
        />
      ))}
    </div>
  );
}
