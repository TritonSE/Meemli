import { del, get, handleAPIError, post, put } from "./requests";

import type { APIResult } from "@/src/api/requests";

export type User = {
  _id: string;

  // Core info
  firstName: string;
  lastName: string;
  personalEmail: string;
  meemliEmail: string;
  phoneNumber: string;
  admin: boolean;
  assignedSections: string[];
  archived: boolean;
};

export type UserJSON = {
  _id: string;

  firstName: string;
  lastName: string;
  personalEmail: string;
  meemliEmail: string;
  phoneNumber: string;
  admin: boolean;
  assignedSections: string[];
  archived: boolean;
};

const USER_ROUTE = "/user";
const userByIdRoute = (id: string) => `${USER_ROUTE}/${id}`;

function parseUser(user: UserJSON): User {
  return {
    _id: user._id,

    firstName: user.firstName,
    lastName: user.lastName,
    personalEmail: user.personalEmail,
    meemliEmail: user.meemliEmail,
    phoneNumber: user.phoneNumber,
    admin: user.admin,
    assignedSections: user.assignedSections,
    archived: user.archived,
  };
}

type UserPayload = Omit<User, "_id">;
export type CreateUserRequest = UserPayload;
export type UpdateUserRequest = User;

export async function createUser(user: CreateUserRequest): Promise<APIResult<User>> {
  try {
    const response = await post(USER_ROUTE, user);
    const json = (await response.json()) as UserJSON;
    return { success: true, data: parseUser(json) };
  } catch (error) {
    return handleAPIError(error);
  }
}

export async function getUser(id: string): Promise<APIResult<User>> {
  try {
    const response = await get(userByIdRoute(id));
    const json = (await response.json()) as UserJSON;
    return { success: true, data: parseUser(json) };
  } catch (error) {
    return handleAPIError(error);
  }
}

export async function updateUser(user: UpdateUserRequest): Promise<APIResult<User>> {
  try {
    const response = await put(userByIdRoute(user._id), user);
    const json = (await response.json()) as UserJSON;
    return { success: true, data: parseUser(json) };
  } catch (error) {
    return handleAPIError(error);
  }
}

/**
 * Bulk archive or unarchive users by their Firebase IDs.
 * @param ids - array of Firebase IDs of users to be archived or unarchived
 * @param archived - boolean flag indicating whether to archive (true) or unarchive (false) the specified users
 * @returns APIResult containing an array of the updated User objects
 */
export async function archiveUsers(
  ids: string[],
  archived: boolean,
): Promise<APIResult<{ message: string }>> {
  try {
    const response = await put(`${USER_ROUTE}/archive`, { ids, flag: archived });
    const json = (await response.json()) as { message: string };
    return { success: true, data: json };
  } catch (error) {
    return handleAPIError(error);
  }
}

export async function deleteUsers(ids: string[]): Promise<APIResult<{ message: string }>> {
  try {
    const response = await del(`${USER_ROUTE}/delete`, {}, { ids });
    const json = (await response.json()) as { message: string };
    return { success: true, data: json };
  } catch (error) {
    return handleAPIError(error);
  }
}

export async function getAllUsers(): Promise<APIResult<User[]>> {
  try {
    const response = await get(USER_ROUTE);
    const json = (await response.json()) as UserJSON[];
    const users = json.map(parseUser);
    return { success: true, data: users };
  } catch (error) {
    return handleAPIError(error);
  }
}
