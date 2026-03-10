import { get, handleAPIError, post, put } from "./requests";

import type { APIResult } from "@/src/api/requests";

export type User = {
  _id: string;
  firstName: string;
  lastName: string;
  personalEmail: string;
  meemliEmail: string;
  admin: boolean;
};

const USER_ROUTE = "/user";

// Create User
export type CreateUserRequest = {
  firstName: string;
  lastName: string;
  personalEmail: string;
  meemliEmail: string;
  admin: boolean;
};

export const createUser = async (user: CreateUserRequest): Promise<APIResult<User>> => {
  try {
    const response = await post(USER_ROUTE, user);
    const data = (await response.json()) as User;
    return { success: true, data };
  } catch (error) {
    return handleAPIError(error);
  }
};

// Edit User by ID
export const editUserById = async (
  id: string,
  user: Partial<CreateUserRequest>,
): Promise<APIResult<User>> => {
  try {
    const response = await put(`${USER_ROUTE}/${id}`, user);
    const data = (await response.json()) as User;
    return { success: true, data };
  } catch (error) {
    return handleAPIError(error);
  }
};

// GET User by ID
export const getUserById = async (id: string): Promise<APIResult<User>> => {
  try {
    const response = await get(`${USER_ROUTE}/${id}`);
    const data = (await response.json()) as User;
    return { success: true, data };
  } catch (error) {
    return handleAPIError(error);
  }
};

// Get all Users
export const getAllUsers = async (): Promise<APIResult<User[]>> => {
  try {
    const response = await get(`/user/`);
    const data = (await response.json()) as User[];
    return { success: true, data };
  } catch (error) {
    return handleAPIError(error);
  }
};

// Get all Teachers
export const getAllTeachers = async (): Promise<APIResult<User[]>> => {
  try {
    const response = await get(USER_ROUTE);
    const data = (await response.json()) as User[];
    const teachers = data.filter((user) => !user.admin);
    return { success: true, data: teachers };
  } catch (error) {
    return handleAPIError(error);
  }
};
