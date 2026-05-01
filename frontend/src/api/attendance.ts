import { get, handleAPIError, put } from "./requests";

import type { APIResult } from "./requests";

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

export type AttendanceRecord = {
  _id: string;
  session: string;
  student: string;
  status: "PRESENT" | "ABSENT" | "LATE";
  notes: string;
};

type UpdateAttendanceBulkResponse = {
  message: string;
};

// Function to get the session data
export const getSessionById = async (id: string): Promise<AttendanceSession> => {
  const response = await get(`/sessions/${id}`);
  const data: unknown = await response.json();
  return data as AttendanceSession;
};

// Function to get sessions by section
export const getSessionsBySection = async (
  activeSectionId: string,
): Promise<AttendanceSession[]> => {
  const response = await get(`/sessions/section/${activeSectionId}`);
  const data: unknown = await response.json();
  return data as AttendanceSession[];
};

export async function getAttendanceBySessionId(
  sessionId: string,
): Promise<APIResult<AttendanceRecord[]>> {
  try {
    const response = await get(`/attendance/session/${sessionId}`);
    const json = (await response.json()) as AttendanceRecord[];
    return { success: true, data: json };
  } catch (error) {
    return handleAPIError(error);
  }
}

// Function to save the attendance
export const updateAttendanceBulk = async (
  updates: any[],
): Promise<APIResult<UpdateAttendanceBulkResponse>> => {
  try {
    const response = await put("/attendance/bulk-update", updates);
    const json = (await response.json()) as UpdateAttendanceBulkResponse;
    return { success: true, data: json };
  } catch (error) {
    return handleAPIError(error);
  }
};
