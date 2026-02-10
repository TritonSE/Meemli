"use client";

import { useEffect, useState } from "react";

import { getAllSessions, getSessionById, AttendanceSession } from "../../../api/attendance";
import AttendanceList from "../../components/attendanceList";
import { SectionSelect } from "../../components/sessionSelect";
import { DateSelect } from "../../components/dateSelect";

export default function Attendance() {
  const [sessionList, setSessionList] = useState<AttendanceSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<AttendanceSession | null>(null);
  const [activeSectionId, setActiveSectionId] = useState("");
  const [activeDate, setActiveDate] = useState("");

  // load session
  // useEffect(() => {
  //   const load = async () => {
  //     const data = await getAllSessions();
  //     setSessionList(data || []);
  //   };
  //   load();
  // }, []);

  useEffect(() => {
    const load = async () => {
      const data = await getAllSessions();
      console.log("DEBUG: API Response", data); // CHECK YOUR BROWSER CONSOLE
      setSessionList(data || []);
      setSessionList(data);
    };
    void load();
  }, []);

  // Filter Logic when both dropdowns have a value, find the session
  useEffect(() => {
    if (activeSectionId && activeDate) {
      const match = sessionList.find((s) => {
        // Normalize the date to YYYY-MM-DD for comparison
        const sDate = new Date(s.sessionDate).toISOString().split("T")[0];
        return s.section?._id === activeSectionId && sDate === activeDate;
      });

      if (match) {
        handleFetchFull(match._id);
      } else {
        setSelectedSession(null);
      }
    }
  }, [activeSectionId, activeDate, sessionList]);

  const handleFetchFull = async (id: string) => {
    const data = await getSessionById(id);
    setSelectedSession(data);
  };

  // session selected
  // return (
  //   <div className="w-full max-w-6xl mx-auto p-8">
  //     {/* 1. KEEP THE BACK BUTTON */}
  //     <button onClick={() => setSelectedSession(null)} className="...">
  //       ← Back to List
  //     </button>

  //     {/* 2. KEEP THE HEADER (This is page-level, not list-level) */}
  //     <header className="mb-8 border-b pb-4 flex justify-between items-end">
  //       <div>
  //         <p className="text-gray-500 text-sm">Auto-save enabled</p>
  //       </div>
  //     </header>

  //     {/* 3. THE SWAP: Use your new component here */}
  //     <AttendanceList
  //       initialAttendees={selectedSession.attendees || []}
  //       onUpdate={function (): void {
  //         throw new Error("Function not implemented.");
  //       }}
  //     />
  //   </div>
  // );

  return (
    <div className="w-full max-w-6xl mx-auto p-8 font-sans">
      <header className="mb-8 border-b pb-4 flex justify-between items-end">
        <h1 className="text-2xl font-bold">Attendance</h1>
        <p className="text-gray-400 text-sm">Auto-save enabled</p>
      </header>

      <div className="flex flex-col md:flex-row gap-6 mb-10">
        <SectionSelect
          sessions={sessionList}
          value={activeSectionId}
          onChange={setActiveSectionId}
        />
        <DateSelect value={activeDate} onChange={setActiveDate} />
      </div>

      {selectedSession ? (
        <AttendanceList
          initialAttendees={selectedSession.attendees || []}
          onUpdate={function (): void {
            throw new Error("Function not implemented.");
          }}
        />
      ) : (
        <div className="py-20 border-2 border-dashed border-gray-200 rounded-xl text-center text-gray-400">
          Select a section and date to see the student list.
        </div>
      )}
    </div>
  );
}
