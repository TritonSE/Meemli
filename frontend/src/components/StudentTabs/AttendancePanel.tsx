import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

import styles from "./AttendancePanel.module.css";

import type { AttendanceRecord } from "@/src/api/attendance";
import type { Section } from "@/src/api/sections";
import type { ReturnedSession } from "@/src/api/session";
import type { Student } from "@/src/api/students";

import { getAttendanceByStudentId } from "@/src/api/attendance";
import { getAllSections } from "@/src/api/sections";
import { getAllSessions } from "@/src/api/session";
import { InfoBox } from "@/src/components/StudentTabs/InfoBox";

type AttendancePanelProps = {
  student: Student;
};

type SectionAttendanceProps = {
  attendance: AttendanceRecord[];
  label: string;
  color: string | undefined;
};

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
  const [sessions, setSessions] = useState<ReturnedSession[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showCurrentTerm, setShowCurrentTerm] = useState(true);
  const [showPrevTerm, setShowPrevTerm] = useState(false);

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
  const activeSections = overlappingSections.filter((section) => !section.archived);
  const inactiveSections = overlappingSections.filter((section) => section.archived);

  // map each session to a section
  const sessionsToSection = new Map(
    sessions.map((session) => [session._id, session.section?._id ?? null]),
  );

  // map each section to a list of attendances
  const sectionToAttendances = new Map<string, AttendanceRecord[]>();
  for (const attendance of attendances) {
    const id = sessionsToSection.get(attendance.session);
    if (id == null) {
      continue;
    }

    if (!sectionToAttendances.has(id)) {
      sectionToAttendances.set(id, []);
    }
    sectionToAttendances.get(id)!.push(attendance);
  }

  // add any sections that had no attendance objects with empty arrays
  for (const section of overlappingSections) {
    if (!sectionToAttendances.has(section._id)) {
      sectionToAttendances.set(section._id, []);
    }
  }

  // calculate overall stats
  const presentPercent = Math.trunc(
    (100 * attendances.filter((record) => record.status === "PRESENT").length) / attendances.length,
  );
  const latePercent = Math.trunc(
    (100 * attendances.filter((record) => record.status === "LATE").length) / attendances.length,
  );
  const absentPercent = Math.trunc(
    (100 * attendances.filter((record) => record.status === "ABSENT").length) / attendances.length,
  );

  if (loading) {
    return <p className={styles.wrapper}>Loading...</p>;
  }
  return (
    <div className={styles.wrapper}>
      <div className={`${styles.termSection} ${styles.overall}`}>
        <p className={`${styles.sectionTitle} ${styles.overallTitle}`}>Overall</p>
        <div className={styles.container}>
          <InfoBox label="Present" data={`${presentPercent.toString()}%`} color="#12B76A" />
          <InfoBox label="Late" data={`${latePercent.toString()}%`} color="#F79009" />
          <InfoBox label="Absent" data={`${absentPercent.toString()}%`} color="#F04438" />
        </div>
      </div>
      <div className={styles.termSection}>
        <button
          className={styles.sectionHeader}
          onClick={() => setShowCurrentTerm((prev) => !prev)}
        >
          <p className={styles.sectionTitle}>Current Term</p>

          <ChevronDown
            size={30}
            className={`${styles.chevron} ${showCurrentTerm ? styles.rotated : ""}`}
          />
        </button>

        <div className={`${styles.content} ${showCurrentTerm ? styles.open : styles.closed}`}>
          {showCurrentTerm &&
            activeSections.length > 0 &&
            activeSections.map((section) => (
              <SectionAttendance
                key={section._id}
                color={section.color}
                label={section.code}
                attendance={sectionToAttendances.get(section._id) ?? []}
              />
            ))}
          {showCurrentTerm && activeSections.length === 0 && (
            <p>No current enrollment information available.</p>
          )}
        </div>
      </div>
      <div className={styles.termSection}>
        <button className={styles.sectionHeader} onClick={() => setShowPrevTerm((prev) => !prev)}>
          <p className={styles.sectionTitle}>Previous Terms</p>

          <ChevronDown
            size={30}
            className={`${styles.chevron} ${showPrevTerm ? styles.rotated : ""}`}
          />
        </button>

        <div className={`${styles.content} ${showPrevTerm ? styles.open : styles.closed}`}>
          {showPrevTerm &&
            inactiveSections.length > 0 &&
            inactiveSections.map((section) => (
              <SectionAttendance
                key={section._id}
                color={section.color}
                label={section.code}
                attendance={sectionToAttendances.get(section._id) ?? []}
              />
            ))}
          {showPrevTerm && inactiveSections.length === 0 && (
            <p>No previous enrollment information available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
