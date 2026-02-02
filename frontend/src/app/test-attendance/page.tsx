"use client";

import React, { useState, useEffect } from "react";
import { getSessionById, updateAttendanceBulk, getAllSessions } from "../../api/attendance";
import AttendanceList from "../components/attendanceList";

export default function AttendancePOC() {
  const [sessionList, setSessionList] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error">("saved");

  // load data
  useEffect(() => {
    const loadMenu = async () => {
      try {
        const list = await getAllSessions();
        setSessionList(list || []);
      } catch (err) {
        console.error("Failed to load list", err);
      }
    };
    loadMenu();
  }, []);

  // autosave
  useEffect(() => {
    // Add strict check: If session OR attendees are missing, stop.
    if (!selectedSession || !selectedSession.attendees) return;

    setSaveStatus("saving");

    const timer = setTimeout(async () => {
      try {
        // Use the fallback here too, just in case
        const updates = (selectedSession.attendees || []).map((a: any) => ({
          attendanceId: a._id,
          status: a.status,
          notes: a.notes,
        }));

        await updateAttendanceBulk(updates);
        setSaveStatus("saved");
      } catch (err) {
        setSaveStatus("error");
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [selectedSession]);

  //clicking a session
  const handleSelectSession = async (id: string) => {
    // Clear current view while loading
    setSelectedSession(null);
    try {
      const data = await getSessionById(id);
      setSelectedSession(data);
    } catch (err) {
      alert("Error loading that session");
    }
  };

  //update local state
  const updateLocalState = (attendanceId: string, field: string, value: string) => {
    if (!selectedSession) return;
    const updatedAttendees = (selectedSession.attendees || []).map((att: any) =>
      att._id === attendanceId ? { ...att, [field]: value } : att,
    );
    setSelectedSession({ ...selectedSession, attendees: updatedAttendees });
  };

  //no session selected
  if (!selectedSession) {
    return (
      <div className="p-10 font-sans max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Select a Session</h1>

        {sessionList.length === 0 ? (
          <p className="text-gray-500">Loading sessions (or none found)...</p>
        ) : (
          <div className="grid gap-4">
            {sessionList.map((s) => (
              <button
                key={s._id}
                onClick={() => handleSelectSession(s._id)}
                className="p-6 text-left border rounded shadow hover:bg-blue-50 transition-colors"
              >
                <div className="font-bold text-lg">{s.topic || "Untitled Session"}</div>
                <div className="text-gray-500 text-sm">
                  ID: {s._id} • {new Date(s.sessionDate).toLocaleDateString()}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // session selected
  return (
    <div className="p-8 font-sans max-w-4xl mx-auto">
      {/* 1. KEEP THE BACK BUTTON */}
      <button onClick={() => setSelectedSession(null)} className="...">
        ← Back to List
      </button>

      {/* 2. KEEP THE HEADER (This is page-level, not list-level) */}
      <header className="mb-8 border-b pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold">{selectedSession.topic}</h1>
          <p className="text-gray-500 text-sm">Auto-save enabled</p>
        </div>
      </header>

      {/* 3. THE SWAP: Use your new component here */}
      <AttendanceList
        initialAttendees={selectedSession.attendees || []}
        onUpdate={function (updatedData: any): void {
          throw new Error("Function not implemented.");
        }}
      />
    </div>
  );
}
