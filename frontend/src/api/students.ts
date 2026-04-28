import { del, get, handleAPIError, post, put } from "./requests";

import type { APIResult } from "@/src/api/requests";

export type ParentContact = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
};

export type Student = {
  _id: string;

  // Core info — always present
  displayName: string;
  grade: number;
  preassessmentScore: number;
  postassessmentScore: number;
  comments: string;

  // Admin-only fields
  meemliEmail?: string;
  schoolName?: string;
  city?: string;
  state?: string;
  parentContact?: ParentContact;
  enrolledSections?: string[]; // ObjectId[] → string[] on the frontend
  archived: boolean;
};

export type StudentJSON = {
  _id: string;

  displayName: string;
  grade: number;
  preassessmentScore: number;
  postassessmentScore: number;
  comments: string;

  // Admin-only fields
  meemliEmail?: string;
  schoolName?: string;
  city?: string;
  state?: string;
  parentContact?: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
  };

  enrolledSections: string[]; // ObjectId → string (populated section IDs)
  archived?: boolean;
};

const STUDENTS_ROUTE = "/students";
const studentByIdRoute = (id: string) => `${STUDENTS_ROUTE}/${id}`;

function parseStudent(student: StudentJSON): Student {
  return {
    _id: student._id,
    displayName: student.displayName,
    grade: student.grade,
    preassessmentScore: student.preassessmentScore,
    postassessmentScore: student.postassessmentScore,
    comments: student.comments,
    ...(student.meemliEmail !== undefined && { meemliEmail: student.meemliEmail }),
    ...(student.schoolName !== undefined && { schoolName: student.schoolName }),
    ...(student.city !== undefined && { city: student.city }),
    ...(student.state !== undefined && { state: student.state }),
    ...(student.enrolledSections !== undefined && { enrolledSections: student.enrolledSections }),
    ...(student.parentContact !== undefined && {
      parentContact: {
        firstName: student.parentContact.firstName,
        lastName: student.parentContact.lastName,
        phoneNumber: student.parentContact.phoneNumber,
        email: student.parentContact.email,
      },
    }),
    archived: student.archived ?? false,
  };
}

// Write requests always supply all fields (admin-only operations)
type RequiredStudentFields = Required<Omit<Student, "_id">>;

export type CreateStudentRequest = RequiredStudentFields;
export type UpdateStudentRequest = { _id: string } & RequiredStudentFields;

export async function createStudent(student: CreateStudentRequest): Promise<APIResult<Student>> {
  try {
    const response = await post(STUDENTS_ROUTE, student);
    const json = (await response.json()) as StudentJSON;
    return { success: true, data: parseStudent(json) };
  } catch (error) {
    return handleAPIError(error);
  }
}

export async function getStudent(id: string): Promise<APIResult<Student>> {
  try {
    const response = await get(studentByIdRoute(id));
    const json = (await response.json()) as StudentJSON;
    return { success: true, data: parseStudent(json) };
  } catch (error) {
    return handleAPIError(error);
  }
}

export async function getAllStudents(): Promise<APIResult<Student[]>> {
  try {
    const response = await get(STUDENTS_ROUTE);
    const json = (await response.json()) as StudentJSON[];
    const students = json.map(parseStudent);
    return { success: true, data: students };
  } catch (error) {
    return handleAPIError(error);
  }
}

export async function updateStudent(student: UpdateStudentRequest): Promise<APIResult<Student>> {
  try {
    const response = await put(studentByIdRoute(student._id), student);
    const json = (await response.json()) as StudentJSON;
    return { success: true, data: parseStudent(json) };
  } catch (error) {
    return handleAPIError(error);
  }
}

export async function deleteStudent(id: string): Promise<APIResult<{ message: string }>> {
  try {
    const response = await del(studentByIdRoute(id));
    const json = (await response.json()) as { message: string };
    return { success: true, data: json };
  } catch (error) {
    return handleAPIError(error);
  }
}

export async function archiveStudents(
  ids: string[],
  archived: boolean,
): Promise<APIResult<Student[]>> {
  try {
    const response = await put(`${STUDENTS_ROUTE}/archive`, { ids, flag: archived });
    const json = (await response.json()) as StudentJSON[];
    const students = json.map(parseStudent);
    return { success: true, data: students };
  } catch (error) {
    return handleAPIError(error);
  }
}

export async function deleteStudents(ids: string[]): Promise<APIResult<Student[]>> {
  try {
    const response = await del(`${STUDENTS_ROUTE}/delete`, {}, { ids });
    const json = (await response.json()) as StudentJSON[];
    const students = json.map(parseStudent);
    return { success: true, data: students };
  } catch (error) {
    return handleAPIError(error);
  }
}
