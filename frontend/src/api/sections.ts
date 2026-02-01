import { get, handleAPIError } from "./requests";

import type { APIResult } from "./requests";

export type Section = {
  _id: string;

  code: string;
  program: string // ObjectID in backend
  teachers: string[] // ObjectID[] in backend
  enrolledStudents: string[] // ObjectID[] in backend
  startTime: string;
  endTime: string;
  days: string[];
};

const SECTIONS_ROUTE = "/api/sections";

export async function getAllSections(): Promise<APIResult<Section[]>> {
  try {
    const response = await get(SECTIONS_ROUTE);
    const json = (await response.json()) as Section[];
    return {success: true, data: json};
  } catch (error) {
    return handleAPIError(error);
  }
}