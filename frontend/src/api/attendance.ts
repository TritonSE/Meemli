import { get, put } from "./requests";

export type AttendanceUpdate = {
  attendanceId: string;
  status: string;
  note: string;
};

type Session = {
  _id: string;
  section: string;
  sessionDate: Date;
};

type UpdateAttendanceBulkResponse = {
  message: string;
};

// Function to get the session data
export const getSessionById = async (id: string): Promise<Session> => {
  const response = await get(`/sessions/${id}`);
  return response.json() as Promise<Session>;
};

// Function to save the attendance
export const updateAttendanceBulk = async (
  updates: any[],
): Promise<UpdateAttendanceBulkResponse> => {
  const response = await put("/attendance/bulk-update", updates, {
    "Content-Type": "application/json",
  });

  if (!response.ok) throw new Error("Failed to save");
  return response.json() as Promise<UpdateAttendanceBulkResponse>;
};

export const getAllSessions = async (): Promise<Session[]> => {
  const response = await get("/sessions");
  return response.json() as Promise<Session[]>;
};
