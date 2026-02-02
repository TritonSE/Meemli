import { get, handleAPIError, post, put } from "./requests";

import type { APIResult } from "./requests";

export type ParentContact = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
};

export type Student = {
  _id: string;

  // Core info
  displayName: string;
  meemliEmail: string;
  grade: number;
  schoolName: string;
  city: string;
  state: string;

  // Parent info
  parentContact: ParentContact;

  // Assessments
  preassessmentScore: number;
  postassessmentScore: number;

  // Relationships
  enrolledSections: string[]; // ObjectId[] → string[] on the frontend

  // Misc
  comments: string;
};

export type StudentJSON = {
  _id: string;

  displayName: string;
  meemliEmail: string;
  grade: number;
  schoolName: string;
  city: string;
  state: string;

  parentContact: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
  };

  preassessmentScore: number;
  postassessmentScore: number;

  enrolledSections: string[]; // ObjectId → string (populated section IDs)
  comments: string;
};

const STUDENTS_ROUTE = "/api/students";
const studentByIdRoute = (id: string) => `${STUDENTS_ROUTE}/${id}`;

function parseStudent(student: StudentJSON): Student {
  return {
    _id: student._id,

    displayName: student.displayName,
    meemliEmail: student.meemliEmail,
    grade: student.grade,
    schoolName: student.schoolName,
    city: student.city,
    state: student.state,

    parentContact: {
      firstName: student.parentContact.firstName,
      lastName: student.parentContact.lastName,
      phoneNumber: student.parentContact.phoneNumber,
      email: student.parentContact.email,
    },

    preassessmentScore: student.preassessmentScore,
    postassessmentScore: student.postassessmentScore,

    enrolledSections: student.enrolledSections,
    comments: student.comments,
  };
}

type StudentPayload = Omit<Student, "_id">;

export type CreateStudentRequest = StudentPayload;
export type UpdateStudentRequest = Student;

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
