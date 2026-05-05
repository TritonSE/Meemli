import { del, get, handleAPIError, post, put } from "./requests";

import type { APIResult } from "./requests";

export type Session = {
  _id: string;
  section: string;
  sessionDate: string;
};

export type CreateSessionRequest = Omit<Session, "_id">;
export type UpdateSessionRequest = { _id: string; sessionDate: string };

export async function getAllSessions(): Promise<APIResult<Session[]>> {
  try {
    const response = await get("/sessions");
    const json = (await response.json()) as Session[];
    return { success: true, data: json };
  } catch (error) {
    return handleAPIError(error);
  }
}

export async function getSessionById(id: string): Promise<APIResult<Session>> {
  try {
    const response = await get(`/sessions/${id}`);
    const json = (await response.json()) as Session;
    return { success: true, data: json };
  } catch (error) {
    return handleAPIError(error);
  }
}

export async function getSessionsBySection(sectionId: string): Promise<APIResult<Session[]>> {
  try {
    const response = await get(`/sessions/section/${sectionId}`);
    const json = (await response.json()) as Session[];
    return { success: true, data: json };
  } catch (error) {
    return handleAPIError(error);
  }
}

export async function createSession(session: CreateSessionRequest): Promise<APIResult<Session>> {
  try {
    const response = await post("/sessions", session);
    const json = (await response.json()) as Session;
    return { success: true, data: json };
  } catch (error) {
    return handleAPIError(error);
  }
}

export async function updateSession(session: UpdateSessionRequest): Promise<APIResult<Session>> {
  try {
    const response = await put(`/sessions/${session._id}`, { sessionDate: session.sessionDate });
    const json = (await response.json()) as Session;
    return { success: true, data: json };
  } catch (error) {
    return handleAPIError(error);
  }
}

export async function deleteSession(id: string): Promise<APIResult<null>> {
  try {
    await del(`/sessions/${id}`);
    return { success: true, data: null };
  } catch (error) {
    return handleAPIError(error);
  }
}
