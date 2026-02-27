"use client";

import { useEffect, useState } from "react";

import { getSessionById, getSessionsBySection } from "../../../api/attendance";
import AttendanceList from "../../components/attendanceList";
import styles from "../../components/attendancePage.module.css";
import AttendanceSearch from "../../components/attendanceSearch";
import AttendanceSortBy, { type SortOption } from "../../components/attendanceSortBy";
import { DateSelect } from "../../components/dateSelect";
import { SectionSelect } from "../../components/sectionSelect";

import type { AttendanceSession } from "../../../api/attendance";
import type { Section } from "@/src/api/sections";

import { getAllSections } from "@/src/api/sections";

export default function Attendance() {
  const getLocalDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [sectionList, setSectionList] = useState<Section[]>([]);
  const [sessionList, setSessionList] = useState<AttendanceSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<AttendanceSession | null>(null);
  const [activeSectionId, setActiveSectionId] = useState("");
  const [activeDate, setActiveDate] = useState(getLocalDateString());

  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>({
    field: "name",
    order: "asc",
    label: "Ascending",
  });

  // Load all sections once on mount
  useEffect(() => {
    const load = async () => {
      const res = await getAllSections();
      if (res.success && res.data.length > 0) {
        setSectionList(res.data);
        setActiveSectionId(res.data[0]._id);
      }
    };
    void load();
  }, []);

  // Lazily fetch sessions whenever the selected section changes
  useEffect(() => {
    if (!activeSectionId) return;

    const load = async () => {
      setSessionList([]);
      setSelectedSession(null);
      const data = await getSessionsBySection(activeSectionId);
      setSessionList(data || []);
    };
    void load();
  }, [activeSectionId]);

  // Derive available dates from the loaded sessions for this section
  const availableDates = sessionList.map((s) => {
    const d = new Date(s.sessionDate);
    // Use UTC values to avoid timezone shift
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });

  const handleSectionChange = (sectionId: string) => {
    setActiveSectionId(sectionId);
    setActiveDate(""); // reset date when section changes
  };

  // Once we have sessions for the section, auto-select today if available, else first date
  useEffect(() => {
    if (sessionList.length === 0) return;
    setActiveDate(getLocalDateString());
  }, [sessionList]);

  // Match selected section + date to a session and fetch full details
  useEffect(() => {
    if (!activeSectionId || !activeDate) return;

    const match = sessionList.find((s) => {
      const sDate = new Date(s.sessionDate).toISOString().split("T")[0];
      return sDate === activeDate;
    });

    if (match) {
      const fetch = async () => {
        const data = await getSessionById(match._id);
        setSelectedSession(data);
      };
      void fetch();
    } else {
      setSelectedSession(null);
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
              sections={sectionList}
              value={activeSectionId}
              onChange={handleSectionChange}
            />
            <DateSelect
              value={activeDate}
              onChange={setActiveDate}
              availableDates={availableDates}
            />
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
