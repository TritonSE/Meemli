import { validationResult } from "express-validator";
import { FirebaseAuthError } from "firebase-admin/auth";

import UserModel from "../models/user";
import { firebaseAdminAuth } from "../util/firebase";
import validationErrorParser from "../util/validationErrorParser";

import type { RequestHandler } from "express";

// Create User Body
type CreateUserBody = {
  firstName: string;
  lastName: string;
  personalEmail: string;
  meemliEmail: string;
  admin: boolean;
};

export const createUser: RequestHandler = async (req, res, next) => {
  const errors = validationResult(req);

  const { firstName, lastName, personalEmail, meemliEmail, admin } = req.body as CreateUserBody;

  try {
    validationErrorParser(errors);

    const userFirebase = await firebaseAdminAuth
      .createUser({
        email: personalEmail,
      })
      .then((userRecord) => {
        return userRecord;
      });

    const user = await UserModel.create({
      _id: userFirebase.uid,
      firstName,
      lastName,
      personalEmail,
      meemliEmail,
      admin,
    });

    res.status(201).json(user);
  } catch (error) {
    return next(error);
  }
};

// Edit by ID
type EditUserBody = Partial<CreateUserBody>;

export const editUserById: RequestHandler = async (req, res, next) => {
  const errors = validationResult(req);

  const { id } = req.params;

  const updates: EditUserBody = req.body as EditUserBody;

  const firebaseUpdates = {
    email: updates.personalEmail,
  };

  try {
    validationErrorParser(errors);

    await firebaseAdminAuth.updateUser(id, firebaseUpdates);

    const user = await UserModel.findByIdAndUpdate(id, updates, { new: true });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
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
      return res.status(404).json({ message: "User not found" });
    }
    throw error;
  });

  try {
    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    return next(error);
  }
};
