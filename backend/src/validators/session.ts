import { body, type ValidationChain } from "express-validator";

import { Section } from "../models/sections";

import type { Model } from "mongoose";

// A reusable helper for database existence checks
const validateReferenceExists = (model: Model<any>, fieldName: string) => {
  return async (id: string) => {
    const exists: unknown = await model.findById(id);
    if (!exists) {
      throw new Error(`${fieldName} with ID ${id} not found`);
    }
    return true;
  };
};

const makeSectionValidator = (): ValidationChain =>
  body("section")
    .exists()
    .withMessage("section is required")
    .isMongoId()
    .withMessage("section must be a valid MongoDB object ID")
    .bail()
    .custom(validateReferenceExists(Section, "Section"));

const makeSessionDateValidator = (): ValidationChain =>
  body("sessionDate")
    .exists()
    .withMessage("Date is required")
    .isISO8601()
    .withMessage("sessionDate must be a valid date-time string");

export const createSession = [makeSectionValidator(), makeSessionDateValidator()];

export const editSessionById = [makeSectionValidator()];
