import { get, handleAPIError, post, put } from "./requests";

import type { APIResult } from "@/src/api/requests";

export type User = {
  _id: string;

  // Core info
  firstName: string;
  lastName: string;
  personalEmail: string;
  meemliEmail: string;
  admin: boolean;
};

export type UserJSON = {
  _id: string;

  firstName: string;
  lastName: string;
  personalEmail: string;
  meemliEmail: string;
  admin: boolean;
};

const USER_ROUTE = "/api/user";
const userByIdRoute = (id: string) => `${USER_ROUTE}/${id}`;

function parseUser(user: UserJSON): User {
  return {
    _id: user._id,

    firstName: user.firstName,
    lastName: user.lastName,
    personalEmail: user.personalEmail,
    meemliEmail: user.meemliEmail,
    admin: user.admin,
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
