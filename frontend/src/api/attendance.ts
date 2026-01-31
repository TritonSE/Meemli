import { get, put } from "./requests";

export interface AttendanceUpdate {
  attendanceId: string;
  status: string;
  note: string;
}

// Function to get the session data
export const getSessionById = async (id: string) => {
  const response = await get(`/api/sessions/${id}`);
  return response.json();
};

// Function to save the attendance
export const updateAttendanceBulk = async (updates: any[]) => {
  const response = await fetch("http://localhost:4000/api/attendance/bulk-update", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });

  if (!response.ok) throw new Error("Failed to save");
  return response.json();
};

export const getAllSessions = async () => {
  const response = await get("/api/sessions");
  return response.json();
};
