"use client";

import { useEffect, useState } from "react";

import { getAllSessions, getSessionById } from "../../../api/attendance";
import AttendanceList from "../../components/attendanceList";
import styles from "../../components/attendancePage.module.css";
import AttendanceSearch from "../../components/attendanceSearch";
import AttendanceSortBy, { type SortOption } from "../../components/attendanceSortBy";
import { DateSelect } from "../../components/dateSelect";
import { SectionSelect } from "../../components/sectionSelect";

import type { AttendanceSession } from "../../../api/attendance";

export default function Attendance() {
  // Get today's date in YYYY-MM-DD format, to use as default value for date picker
  const getLocalDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [sessionList, setSessionList] = useState<AttendanceSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<AttendanceSession | null>(null);
  const [activeSectionId, setActiveSectionId] = useState("");
  const [activeDate, setActiveDate] = useState(getLocalDateString());

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

      // Set the first section as default if available
      if (data && data.length > 0 && data[0].section?._id) {
        setActiveSectionId(data[0].section._id);
      }
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
