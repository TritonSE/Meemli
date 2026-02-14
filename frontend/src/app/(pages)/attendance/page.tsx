"use client";

import { useEffect, useState } from "react";

import { getAllSessions, getSessionById } from "../../../api/attendance";
import AttendanceList from "../../components/attendanceList";
import { DateSelect } from "../../components/dateSelect";
import { SectionSelect } from "../../components/sessionSelect";

import type { AttendanceSession } from "../../../api/attendance";

import styles from "../../components/attendancePage.module.css";

export default function Attendance() {
  const [sessionList, setSessionList] = useState<AttendanceSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<AttendanceSession | null>(null);
  const [activeSectionId, setActiveSectionId] = useState("");
  const [activeDate, setActiveDate] = useState("");

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
    if (activeSectionId && activeDate) {
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
    <div className="w-full max-w-6xl mx-auto p-8 font-sans">
      <header>
        <h1 className={styles.attendance}>Attendance</h1>
        <p className={styles.description}>Track attendance across programs</p>
      </header>

      <div className="flex flex-col md:flex-row gap-6 mb-10">
        <SectionSelect
          sessions={sessionList}
          value={activeSectionId}
          onChange={setActiveSectionId}
        />
        <DateSelect value={activeDate} onChange={setActiveDate} />
      </div>

      <div className="mt-6">
        <AttendanceList
          initialAttendees={selectedSession?.attendees || []}
          isFilterSelected={Boolean(activeSectionId && activeDate)}
        />
      </div>
    </div>
  );
}
