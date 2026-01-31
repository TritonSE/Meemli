"use client";

import React, { useState, useEffect } from "react";
import { getSessionById, updateAttendanceBulk, getAllSessions } from "../../api/attendance";

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

  //session selected
  return (
    <div className="p-8 font-sans max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => setSelectedSession(null)}
        className="mb-6 text-sm font-semibold text-gray-500 hover:text-black flex items-center gap-2"
      >
        ← Back to List
      </button>

      <header className="mb-8 border-b pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold">{selectedSession.topic || "Session Attendance"}</h1>
          <p className="text-gray-500 text-sm">Auto-save enabled</p>
        </div>
        <div className="font-medium text-sm">
          {saveStatus === "saving" && <span className="text-yellow-600">Saving...</span>}
          {saveStatus === "saved" && <span className="text-green-600">✓ Saved</span>}
          {saveStatus === "error" && <span className="text-red-600">⚠ Error</span>}
        </div>
      </header>

      <div className="space-y-4">
        {(selectedSession.attendees || []).length === 0 ? (
          <div className="text-gray-500 italic">No students in this session.</div>
        ) : (
          (selectedSession.attendees || []).map((att: any) => (
            <div
              key={att._id}
              className="flex gap-4 p-4 border rounded shadow-sm bg-white items-center"
            >
              <div className="w-48 text-gray-900 font-semibold text-base">
                {att.student?.displayName || att.student?.name || "Unknown Student"}
              </div>

              <div className="flex gap-2">
                {/* PRESENT BUTTON */}
                <button
                  onClick={() => updateLocalState(att._id, "status", "PRESENT")}
                  className={`px-3 py-1 rounded-md text-sm font-semibold border transition-colors ${
                    att.status === "PRESENT"
                      ? "bg-green-600 text-white border-green-600 shadow-sm" // Active Style
                      : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50" // Inactive Style
                  }`}
                >
                  Present
                </button>

                {/* LATE BUTTON */}
                <button
                  onClick={() => updateLocalState(att._id, "status", "LATE")}
                  className={`px-3 py-1 rounded-md text-sm font-semibold border transition-colors ${
                    att.status === "LATE"
                      ? "bg-yellow-500 text-white border-yellow-500 shadow-sm"
                      : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  Late
                </button>

                {/* ABSENT BUTTON */}
                <button
                  onClick={() => updateLocalState(att._id, "status", "ABSENT")}
                  className={`px-3 py-1 rounded-md text-sm font-semibold border transition-colors ${
                    att.status === "ABSENT"
                      ? "bg-red-600 text-white border-red-600 shadow-sm"
                      : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  Absent
                </button>
              </div>

              <input
                type="text"
                value={att.notes || ""}
                placeholder="Type here..."
                onChange={(e) => updateLocalState(att._id, "notes", e.target.value)}
                className="border border-gray-300 p-2 rounded w-full text-gray-900 placeholder-gray-500"
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
