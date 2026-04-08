import { del, get, handleAPIError, post, put } from "./requests";

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
  createdAt: string;
};

export type CreateSectionRequest = Omit<Section, "_id" | "createdAt">;
export type UpdateSectionRequest = Omit<Section, "createdAt">;

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
    console.error("Error updating section:", error);
    return handleAPIError(error);
  }
}

export async function createSection(section: CreateSectionRequest): Promise<APIResult<Section>> {
  try {
    const response = await post(`/sections`, section);
    const json = (await response.json()) as Section;
    return { success: true, data: json };
  } catch (error) {
    return handleAPIError(error);
  }
}

export async function deleteSection(id: string): Promise<APIResult<Section>> {
  try {
    const response = await del(`/sections/${id}`);
    const json = (await response.json()) as Section;

    return { success: true, data: json };
  } catch (error) {
    return handleAPIError(error);
  }
}
