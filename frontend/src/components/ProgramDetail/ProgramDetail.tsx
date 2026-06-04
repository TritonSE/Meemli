"use client";

import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";

import styles from "./ProgramDetail.module.css";

import type { Student } from "@/src/api/students";
import type { User } from "@/src/api/user";

import { getSessionById, getSessionsBySection } from "@/src/api/attendance";
import { getAllSections, getSectionById, type Section } from "@/src/api/sections";
import { getAllStudents } from "@/src/api/students";
import { getAllUsers } from "@/src/api/user";
import AttendanceList from "@/src/components/attendanceList";
import AttendanceSearch from "@/src/components/attendanceSearch";
import AttendanceSortBy, { type SortOption } from "@/src/components/attendanceSortBy";
import { DateSelect } from "@/src/components/dateSelect";
import { Table } from "@/src/components/StudentStaffTable/Table";
import { useAuth } from "@/src/context/AuthContext";

type Tab = "attendance" | "students" | "teachers";

type Session = {
  _id: string;
  sessionDate: string | Date;
  section: string | { _id: string; code: string };
};

export function ProgramDetail({ id, onBack }: { id: string; onBack: () => void }) {
  const { isAdmin } = useAuth();

  const [section, setSection] = useState<Section | null>(null);
  const [allSections, setAllSections] = useState<Section[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("attendance");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [attendees, setAttendees] = useState<any[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>({
    field: "name",
    order: "asc",
    label: "Name",
  });
  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const [studentSortOption, setStudentSortOption] = useState<SortOption>({
    field: "name",
    order: "asc",
    label: "Name",
  });
  const [teacherSearchQuery, setTeacherSearchQuery] = useState("");
  const [teacherSortOption, setTeacherSortOption] = useState<SortOption>({
    field: "name",
    order: "asc",
    label: "Name",
  });
  const [loading, setLoading] = useState(false);

  const tabs: Tab[] = isAdmin ? ["attendance", "students", "teachers"] : ["attendance", "students"];

  useEffect(() => {
    const fetchSection = async () => {
      const result = await getSectionById(id);
      if (result.success) setSection(result.data);
    };
    void fetchSection();
  }, [id]);

  useEffect(() => {
    const fetchAllSections = async () => {
      const result = await getAllSections();
      if (result.success) setAllSections(result.data);
    };
    void fetchAllSections();
  }, []);

  useEffect(() => {
    const fetchSessions = async () => {
      const result = await getSessionsBySection(id);
      if (Array.isArray(result)) {
        const sorted = [...result].sort(
          (a: Session, b: Session) =>
            new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime(),
        );
        setSessions(sorted);
        const now = new Date();
        const recent = sorted.find((s: Session) => new Date(s.sessionDate) <= now);
        if (recent) {
          setSelectedSessionId(recent._id);
          setSelectedDate(format(new Date(recent.sessionDate), "yyyy-MM-dd"));
        }
      }
    };
    void fetchSessions();
  }, [id]);

  useEffect(() => {
    const fetchStudents = async () => {
      const result = await getAllStudents();
      if (result.success) {
        const filtered = result.data.filter((s) =>
          (s.enrolledSections ?? []).some((sId: string) => sId.toString() === id),
        );
        setStudents(filtered);
      }
    };
    void fetchStudents();
  }, [id]);

  useEffect(() => {
    if (!isAdmin || !section) return;
    const fetchTeachers = async () => {
      const result = await getAllUsers();
      if (result.success) {
        const filtered = result.data.filter((u) => section.teachers.includes(u._id));
        setTeachers(filtered);
      }
    };
    void fetchTeachers();
  }, [section, isAdmin]);

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    const match = sessions.find(
      (s: Session) => format(new Date(s.sessionDate), "yyyy-MM-dd") === date,
    );
    if (match) setSelectedSessionId(match._id);
    else setSelectedSessionId(null);
  };

  useEffect(() => {
    if (!selectedSessionId) return;
    setLoading(true);
    const fetchAttendance = async () => {
      const session = await getSessionById(selectedSessionId);
      setAttendees(session.attendees ?? []);
      setLoading(false);
    };
    void fetchAttendance();
  }, [selectedSessionId]);

  const availableDates = sessions
    .filter((s: Session) => new Date(s.sessionDate) <= new Date())
    .map((s: Session) => format(new Date(s.sessionDate), "yyyy-MM-dd"));

  const filteredAndSortedStudents = useMemo(() => {
    let result = [...students];
    if (studentSearchQuery.trim()) {
      result = result.filter((s) =>
        s.displayName?.toLowerCase().includes(studentSearchQuery.toLowerCase()),
      );
    }
    result.sort((a, b) => {
      const cmp = (a.displayName ?? "").localeCompare(b.displayName ?? "");
      return studentSortOption.order === "asc" ? cmp : -cmp;
    });
    return result;
  }, [students, studentSearchQuery, studentSortOption]);

  const filteredAndSortedTeachers = useMemo(() => {
    let result = [...teachers];
    if (teacherSearchQuery.trim()) {
      result = result.filter((t) =>
        `${t.firstName} ${t.lastName}`.toLowerCase().includes(teacherSearchQuery.toLowerCase()),
      );
    }
    result.sort((a, b) => {
      const cmp = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      return teacherSortOption.order === "asc" ? cmp : -cmp;
    });
    return result;
  }, [teachers, teacherSearchQuery, teacherSortOption]);

  return (
    <div className={styles.pageWrapper}>
      <button className={styles.backButton} onClick={onBack}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
        >
          <path
            d="M12.5 5L7.5 10L12.5 15"
            stroke="#494445"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Back
      </button>

      <div>
        <h1 className={styles.title}>{section?.code ?? ""}</h1>
        <p className={styles.caption}>Manage section attendance, students and teachers</p>
      </div>

      <div className={styles.tabRow}>
        <div className={styles.tabs}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`${styles.tabButton} ${isActive ? styles.tabButtonActive : ""}`}
              >
                {tab === "attendance" && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <g clipPath="url(#clip0_4981_3653)">
                      <path
                        d="M10.0001 5.00033V10.0003L13.3334 11.667M18.3334 10.0003C18.3334 14.6027 14.6024 18.3337 10.0001 18.3337C5.39771 18.3337 1.66675 14.6027 1.66675 10.0003C1.66675 5.39795 5.39771 1.66699 10.0001 1.66699C14.6024 1.66699 18.3334 5.39795 18.3334 10.0003Z"
                        stroke={isActive ? "white" : "#494445"}
                        strokeWidth="1.67"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_4981_3653">
                        <rect width="20" height="20" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                )}
                {tab === "students" && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <path
                      d="M4.16675 8.33334V13.3426C4.16675 13.6418 4.16675 13.7913 4.21229 13.9233C4.25257 14.0401 4.31831 14.1465 4.40473 14.2347C4.50247 14.3345 4.63625 14.4014 4.9038 14.5352L9.40383 16.7852C9.62241 16.8945 9.73175 16.9492 9.84641 16.9707C9.948 16.9897 10.0522 16.9897 10.1537 16.9707C10.2684 16.9492 10.3777 16.8945 10.5963 16.7852L15.0963 14.5352C15.3639 14.4014 15.4977 14.3345 15.5954 14.2347C15.6818 14.1465 15.7476 14.0401 15.7878 13.9233C15.8334 13.7913 15.8334 13.6418 15.8334 13.3426V8.33334M1.66675 7.0833L9.70191 3.06571C9.81125 3.01105 9.86591 2.98372 9.92325 2.97297C9.974 2.96344 10.0262 2.96344 10.0769 2.97297C10.1342 2.98372 10.1889 3.01105 10.2982 3.06571L18.3334 7.0833L10.2982 11.1009C10.1889 11.1556 10.1342 11.1829 10.0769 11.1937C10.0262 11.2032 9.974 11.2032 9.92325 11.1937C9.86591 11.1829 9.81125 11.1556 9.70191 11.1009L1.66675 7.0833Z"
                      stroke={isActive ? "white" : "#494445"}
                      strokeWidth="1.67"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                {tab === "teachers" && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <path
                      d="M18.3332 17.5V15.8333C18.3332 14.2802 17.2708 12.9751 15.8332 12.605M12.9165 2.7423C14.1381 3.23679 14.9998 4.43442 14.9998 5.83333C14.9998 7.23224 14.1381 8.42992 12.9165 8.92433M14.1665 17.5C14.1665 15.9468 14.1665 15.1703 13.9128 14.5577C13.5744 13.741 12.9255 13.0921 12.1088 12.7537C11.4962 12.5 10.7197 12.5 9.1665 12.5H6.6665C5.11336 12.5 4.3368 12.5 3.72423 12.7537C2.90746 13.0921 2.25855 13.741 1.92024 14.5577C1.6665 15.1703 1.6665 15.9468 1.6665 17.5M11.2498 5.83333C11.2498 7.67428 9.75742 9.16667 7.9165 9.16667C6.07555 9.16667 4.58317 7.67428 4.58317 5.83333C4.58317 3.99238 6.07555 2.5 7.9165 2.5C9.75742 2.5 11.2498 3.99238 11.2498 5.83333Z"
                      stroke={isActive ? "white" : "#494445"}
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                {tab === "attendance" ? "Attendance" : tab === "students" ? "Students" : "Teachers"}
              </button>
            );
          })}
        </div>

        <div className={styles.controls}>
          {activeTab === "attendance" && (
            <>
              <DateSelect
                value={selectedDate}
                onChange={handleDateChange}
                availableDates={availableDates}
              />
              <AttendanceSortBy value={sortOption} onChange={setSortOption} />
              <AttendanceSearch value={searchQuery} onChange={setSearchQuery} />
            </>
          )}
          {activeTab === "students" && (
            <>
              <AttendanceSortBy value={studentSortOption} onChange={setStudentSortOption} />
              <AttendanceSearch value={studentSearchQuery} onChange={setStudentSearchQuery} />
            </>
          )}
          {activeTab === "teachers" && isAdmin && (
            <>
              <AttendanceSortBy value={teacherSortOption} onChange={setTeacherSortOption} />
              <AttendanceSearch
                value={teacherSearchQuery}
                onChange={setTeacherSearchQuery}
                placeholder="Search Teachers"
              />
            </>
          )}
        </div>
      </div>

      {activeTab === "attendance" &&
        (loading ? (
          <p>Loading attendance...</p>
        ) : (
          <AttendanceList
            initialAttendees={attendees}
            isSectionSelected={!!id}
            isFilterSelected={!!selectedSessionId}
            searchQuery={searchQuery}
            sortOption={sortOption}
            activeDate={selectedDate}
          />
        ))}

      {activeTab === "students" && (
        <div className={styles.tableOverride}>
          <Table
            data={filteredAndSortedStudents}
            setData={setStudents}
            sections={allSections}
            type="student"
            isEdit={false}
            selected={new Set()}
            setSelected={() => {}}
            roleOptions={[]}
          />
        </div>
      )}

      {activeTab === "teachers" && isAdmin && (
        <div className={styles.tableOverride}>
          <Table
            data={filteredAndSortedTeachers}
            setData={setTeachers}
            sections={allSections}
            type="staff"
            isEdit={false}
            selected={new Set()}
            setSelected={() => {}}
            roleOptions={[]}
          />
        </div>
      )}
    </div>
  );
}
