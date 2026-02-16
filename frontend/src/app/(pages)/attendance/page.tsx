"use client";

import { useEffect, useState } from "react";

import { getAllSessions, getSessionById } from "../../../api/attendance";
import AttendanceList from "../../components/attendanceList";
import styles from "../../components/attendancePage.module.css";
import AttendanceSearch from "../../components/attendanceSearch";
import AttendanceSortBy, { type SortOption } from "../../components/attendanceSortBy";
import { DateSelect } from "../../components/dateSelect";
import { SectionSelect } from "../../components/sessionSelect";

import type { AttendanceSession } from "../../../api/attendance";

export default function Attendance() {
  const [sessionList, setSessionList] = useState<AttendanceSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<AttendanceSession | null>(null);
  const [activeSectionId, setActiveSectionId] = useState("");
  const [activeDate, setActiveDate] = useState("");

  // Search and Sort states
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>({
    field: "name",
    order: "asc",
    label: "Ascending",
  });

  const isFilterSelected = Boolean(activeSectionId && activeDate);

  useEffect(() => {
    const load = async () => {
      const data = await getAllSessions();
      setSessionList(data || []);
      setSessionList(data);
    };
    void load();
  }, []);

  const handleFetchFull = async (id: string) => {
    const data = await getSessionById(id);
    setSelectedSession(data);
  };

  // Filter Logic when both dropdowns have a value, find the session
  useEffect(() => {
    if (isFilterSelected) {
      const match = sessionList.find((s) => {
        // Normalize the date to YYYY-MM-DD for comparison
        const sDate = new Date(s.sessionDate).toISOString().split("T")[0];
        return s.section?._id === activeSectionId && sDate === activeDate;
      });

      if (match) {
        void handleFetchFull(match._id);
      } else {
        setSelectedSession(null);
      }
    }
  }, [activeSectionId, activeDate, sessionList]);

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.mainContent}>
        <header>
          <h1 className={styles.attendance}>Attendance</h1>
          <p className={styles.description}>Track attendance across programs</p>
        </header>

        <div className={styles.controlsSection}>
          <div className={styles.leftControls}>
            <SectionSelect
              sessions={sessionList}
              value={activeSectionId}
              onChange={setActiveSectionId}
            />
            <DateSelect value={activeDate} onChange={setActiveDate} />
          </div>

          <div className={styles.rightControls}>
            <AttendanceSortBy value={sortOption} onChange={setSortOption} />
            <AttendanceSearch value={searchQuery} onChange={setSearchQuery} />
          </div>
        </div>

        <div className={styles.table}>
          <AttendanceList
            initialAttendees={selectedSession?.attendees || []}
            isFilterSelected={Boolean(activeSectionId && activeDate)}
            searchQuery={searchQuery}
            sortOption={sortOption}
          />
        </div>
      </div>
    </div>
  );
}
