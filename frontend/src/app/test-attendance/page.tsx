"use client";

import React, { useEffect, useState } from "react";

import { getAllSessions, getSessionById } from "../../api/attendance";
import AttendanceList from "../components/attendanceList";

type Attendee = {
  _id: string;
  sessions: string;
  status: string;
  notes: string;
};

type Session = {
  _id: string;
  sessionDate: Date;
  attendees?: Attendee[];
};

export default function AttendancePOC() {
  const [sessionList, setSessionList] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  // load data
  useEffect(() => {
    const loadMenu = async () => {
      try {
        const list: Session[] = await getAllSessions();
        setSessionList(list || []);
      } catch (err) {
        console.error("Failed to load list", err);
      }
    };
    void loadMenu();
  }, []);

  //clicking a session
  const handleSelectSession = async (id: string) => {
    // Clear current view while loading
    setSelectedSession(null);
    try {
      const data = await getSessionById(id);
      setSelectedSession(data);
    } catch (err) {
      console.error("Failed to load session:", err);
    }
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
                onClick={() => {
                  void handleSelectSession(s._id);
                }}
                className="p-6 text-left border rounded shadow hover:bg-blue-50 transition-colors"
              >
                <div className="font-bold text-lg">{"Untitled Session"}</div>
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
    <div className="w-full max-w-6xl mx-auto p-8">
      {/* 1. KEEP THE BACK BUTTON */}
      <button onClick={() => setSelectedSession(null)} className="...">
        ← Back to List
      </button>

      {/* 2. KEEP THE HEADER (This is page-level, not list-level) */}
      <header className="mb-8 border-b pb-4 flex justify-between items-end">
        <div>
          <p className="text-gray-500 text-sm">Auto-save enabled</p>
        </div>
      </header>

      {/* 3. THE SWAP: Use your new component here */}
      <AttendanceList
        initialAttendees={selectedSession.attendees || []}
        onUpdate={function (): void {
          throw new Error("Function not implemented.");
        }}
      />
    </div>
  );
}
