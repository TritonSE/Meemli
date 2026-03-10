import { get, handleAPIError, post, put } from "./requests";

import type { APIResult } from "./requests";

export type Section = {
  _id: string;
  code: string;
  teachers: string[]; // Firebase IDS in backend (string[])
  enrolledStudents: string[]; // ObjectID[] in backend
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
  archived: boolean;
  color: string;
  days: string[];
};

export type CreateSectionRequest = Omit<Section, "_id">;
export type UpdateSectionRequest = Section;

export async function getAllSections(): Promise<APIResult<Section[]>> {
  try {
    const response = await get("/sections");
    const json = (await response.json()) as Section[];
    return { success: true, data: json };
  } catch (error) {
    return handleAPIError(error);
  }
}

export async function getSectionById(id: string): Promise<APIResult<Section>> {
  try {
    const response = await get(`/sections/${id}`);
    const json = (await response.json()) as Section;
    return { success: true, data: json };
  } catch (error) {
    return handleAPIError(error);
  }
}

export async function updateSection(section: UpdateSectionRequest): Promise<APIResult<Section>> {
  try {
    const response = await put(`/sections/${section._id}`, section);
    const json = (await response.json()) as Section;
    return { success: true, data: json };
  } catch (error) {
    return handleAPIError(error);
  }
}

export async function createSection(student: CreateSectionRequest): Promise<APIResult<Section>> {
  try {
    console.log(student);

    const response = await post(`/sections`, student);
    const json = (await response.json()) as Section;

    return { success: true, data: json };
  } catch (error) {
    return handleAPIError(error);
  }
}

export async function getEnrolledStudents(sectionId: string): Promise<APIResult<string[]>> {
  try {
    const response = await get(`/sections/${sectionId}/students`);
    const json = (await response.json()) as { students: string[] };
    return { success: true, data: json.students };
  } catch (error) {
    return handleAPIError(error);
  }
}

export async function getAllEnrolledStudents(
  sectionIds: string[],
): Promise<APIResult<{ [sectionId: string]: string[] }>> {
  try {
    const response = await post(`/sections/students`, { sectionIds });
    const json = (await response.json()) as { [sectionId: string]: string[] };
    return { success: true, data: json };
  } catch (error) {
    return handleAPIError(error);
  }
}

export async function getEnrolledTeachers(sectionId: string): Promise<APIResult<string[]>> {
  try {
    const response = await get(`/sections/${sectionId}/teachers`);
    const json = (await response.json()) as { teachers: string[] };
    return { success: true, data: json.teachers };
  } catch (error) {
    return handleAPIError(error);
  }
}

export async function getAllEnrolledTeachers(
  sectionIds: string[],
): Promise<APIResult<{ [sectionId: string]: string[] }>> {
  try {
    const response = await post(`/sections/teachers`, { sectionIds });
    const json = (await response.json()) as { [sectionId: string]: string[] };
    return { success: true, data: json };
  } catch (error) {
    return handleAPIError(error);
  }
}
