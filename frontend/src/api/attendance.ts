import { get, put } from "./requests";

export type AttendanceSection = {
  _id: string;
  code: string;
};

export type Student = {
  _id: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
};

export type Attendee = {
  _id: string;
  student: Student;
  status: "PRESENT" | "ABSENT" | "LATE";
  notes: string;
};

export type AttendanceSession = {
  _id: string;
  sessionDate: string | Date;
  section: AttendanceSection;
  attendees?: Attendee[];
};

type UpdateAttendanceBulkResponse = {
  message: string;
};

// Function to get the session data
export const getSessionById = async (id: string): Promise<AttendanceSession> => {
  const response = await get(`/api/sessions/${id}`);
  const data = await response.json();
  return data as AttendanceSession;
};

// Function to save the attendance
export const updateAttendanceBulk = async (
  updates: any[],
): Promise<UpdateAttendanceBulkResponse> => {
  const response = await put("/api/attendance/bulk-update", updates, {
    "Content-Type": "application/json",
  });

  if (!response.ok) throw new Error("Failed to save");
  return response.json() as Promise<UpdateAttendanceBulkResponse>;
};

export const getAllSessions = async (): Promise<AttendanceSession[]> => {
  const response = await get("/api/sessions");
  const data = await response.json();
  return data as AttendanceSession[];
};
