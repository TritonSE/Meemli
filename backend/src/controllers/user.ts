import { FirebaseAuthError } from "firebase-admin/auth";
import createHTTPError from "http-errors";
import { Types } from "mongoose";

import UserModel from "../models/user";
import { firebaseAdminAuth } from "../util/firebase";

import type { RequestHandler } from "express";

// Create User Body
type CreateUserBody = {
  firstName: string;
  lastName: string;
  personalEmail: string;
  meemliEmail: string;
  phoneNumber: string;
  admin: boolean;
  assignedSections?: string[];
};

export const createUser: RequestHandler = async (req, res, next) => {
  const { firstName, lastName, personalEmail, meemliEmail, phoneNumber, admin, assignedSections } =
    req.body as CreateUserBody;

  try {
    const userFirebase = await firebaseAdminAuth
      .createUser({
        email: personalEmail,
      })
      .then((userRecord) => {
        return userRecord;
      });

    const assignedSectionsIds = assignedSections?.map((section) => new Types.ObjectId(section));

    const user = await UserModel.create({
      _id: userFirebase.uid,
      firstName,
      lastName,
      personalEmail,
      meemliEmail,
      phoneNumber,
      admin,
      assignedSections: assignedSectionsIds,
    });

    res.status(201).json(user);
  } catch (error) {
    return next(error);
  }
};

// Edit by ID
type EditUserBody = Partial<CreateUserBody>;

export const editUserById: RequestHandler = async (req, res, next) => {
  const { id } = req.params;

  const updates: EditUserBody = req.body as EditUserBody;

  const firebaseUpdates = {
    email: updates.personalEmail,
  };

  try {
    await firebaseAdminAuth.updateUser(id, firebaseUpdates);

    const user = await UserModel.findByIdAndUpdate(id, updates, { new: true });

    if (!user) {
      throw createHTTPError(404, "User not found");
    }

    res.status(200).json(user);
  } catch (error) {
    return next(error);
  }
};

// Who Am I
export const whoAmI: RequestHandler = async (req, res, next) => {
  const { id } = req.params;

  await firebaseAdminAuth.getUser(id).catch((error) => {
    if (error instanceof FirebaseAuthError && error.code === "auth/user-not-found") {
      throw createHTTPError(404, "User not found");
    }
    throw createHTTPError(500, "Internal Server Error");
  });

  try {
    const user = await UserModel.findById(id);
    if (!user) {
      throw createHTTPError(404, "User not found");
    }
    res.status(200).json(user);
  } catch (error) {
    return next(error);
  }
};

//  Get All Users
export const getAllUsers: RequestHandler = async (req, res, next) => {
  try {
    const users = await UserModel.find();
    res.status(200).json(users);
  } catch (error) {
    return next(error);
  }
};
