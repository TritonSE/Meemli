"use client";

import React, { useEffect, useState } from "react";

import { updateAttendanceBulk } from "../../api/attendance";

type AttendanceListProps = {
  initialAttendees: any[];
  onUpdate: (updatedData: any) => void;
};

export default function AttendanceList({ initialAttendees }: AttendanceListProps) {
  // Local copy of the data
  const [attendees, setAttendees] = useState(initialAttendees);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  //update local state
  const updateLocalState = (id: string, field: string, value: string) => {
    setAttendees((prev) => prev.map((att) => (att._id === id ? { ...att, [field]: value } : att)));
  };

  //autosave
  useEffect(() => {
    if (!attendees || attendees.length === 0) return;

    setSaveStatus("saving");

    const timer = setTimeout(async () => {
      try {
        const updates = attendees.map((a: any) => ({
          attendanceId: a._id,
          status: a.status,
          notes: a.notes,
        }));

        await updateAttendanceBulk(updates); //API function
        setSaveStatus("saved");
      } catch (err) {
        console.error(err);
        setSaveStatus("error");
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [attendees]);

  return (
    <div className="flex flex-col gap-4">
      {/* Save Indicator (Figma usually puts this in a corner) */}
      <div className="flex justify-end h-6">
        {saveStatus === "saving" && (
          <span className="text-blue-500 text-sm italic animate-pulse">Saving changes...</span>
        )}
        {saveStatus === "saved" && (
          <span className="text-green-600 text-sm">✓ All changes saved</span>
        )}
        {saveStatus === "error" && <span className="text-red-500 text-sm">⚠ Save failed</span>}
      </div>

      {/* The List Mapping */}
      {attendees.map((att) => (
        <div
          key={att._id}
          className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-blue-200 transition-all"
        >
          {/* STUDENT NAME SECTION */}
          <div className="w-1/4">
            <p className="text-gray-900 font-bold text-base leading-tight">
              {att.student?.displayName || "Unknown Student"}
            </p>
            <p className="text-gray-400 text-xs">Student ID: {att.student?._id?.slice(-4)}</p>
          </div>

          {/* STATUS BUTTONS (Figma Layout) */}
          <div className="flex gap-2">
            {["PRESENT", "LATE", "ABSENT"].map((status) => (
              <button
                key={status}
                onClick={() => updateLocalState(att._id, "status", status)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
                  att.status === status
                    ? "bg-slate-900 text-white border-slate-900 shadow-md"
                    : "bg-white text-gray-400 border-gray-100 hover:bg-gray-50"
                }`}
              >
                {status.toLowerCase()}
              </button>
            ))}
          </div>

          {/* NOTES SECTION */}
          <div className="flex-1 ml-6">
            <input
              type="text"
              value={att.notes || ""}
              onChange={(e) => updateLocalState(att._id, "notes", e.target.value)}
              placeholder="Add a note..."
              className="w-full bg-gray-50 border-none rounded-lg p-2 text-sm text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
