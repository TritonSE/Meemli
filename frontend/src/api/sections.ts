import { get, handleAPIError, post, put } from "./requests";

import type { APIResult } from "./requests";

export type Section = {
  _id: string;

  code: string;
  program: string; // ObjectID in backend
  teachers: string[]; // ObjectID[] in backend
  enrolledStudents: string[]; // ObjectID[] in backend
  startTime: string;
  endTime: string;
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
    const response = await post(`/sections`, student);
    const json = (await response.json()) as Section;
    return { success: true, data: json };
  } catch (error) {
    return handleAPIError(error);
  }
}
