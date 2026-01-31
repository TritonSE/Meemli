import { body } from "express-validator";

import { SessionModel } from "../models/session";
import StudentModel from "../models/student";

import type { ValidationChain } from "express-validator";
import type { Model } from "mongoose";

// Reusable helper for checking that the referenced field exists (could be moved to a common utils file)
const validateReferenceExists = (model: Model<any>, fieldName: string) => {
  return async (id: string) => {
    const exists: unknown = await model.findById(id);
    if (!exists) {
      throw new Error(`${fieldName} with ID ${id} not found`);
    }
    return true;
  };
};

const makeAttendanceValidator = (): ValidationChain =>
  body("session")
    .exists()
    .withMessage("session is required")
    .bail()
    .isMongoId()
    .withMessage("session must be a valid MongoDB object ID")
    .bail()
    .custom(validateReferenceExists(SessionModel, "Session"));

const makeStudentValidator = (): ValidationChain =>
  body("student")
    .exists()
    .withMessage("student is required")
    .bail()
    .isMongoId()
    .withMessage("student must be a valid MongoDB object ID")
    .custom(validateReferenceExists(StudentModel, "Student"));

const makeStatusValidator = (): ValidationChain =>
  body("status")
    .exists()
    .withMessage("status is required")
    .bail()
    .isIn(["LATE", "ABSENT", "PRESENT"])
    .withMessage("status must be one of LATE, ABSENT, PRESENT");

const makeNotesValidator = (): ValidationChain =>
  body("notes").optional().isString().withMessage("notes must be a string");

export const createAttendance = [
  makeAttendanceValidator(),
  makeStudentValidator(),
  makeStatusValidator(),
  makeNotesValidator(),
];

export const updateAttendanceById = [
  makeAttendanceValidator(),
  makeStudentValidator(),
  makeStatusValidator(),
  makeNotesValidator(),
];
