import { body } from "express-validator";

import { Section } from "../models/Section";
import { User } from "../models/User";

// A reusable helper for database existence checks
const validateReferenceExists = (model: any, fieldName: string) => {
  return async (id: string) => {
    const exists = await model.findById(id);
    if (!exists) {
      throw new Error(`${fieldName} with ID ${id} not found`);
    }
    return true;
  };
};

const makeIDValidator = () =>
  body("_id")
    .exists()
    .withMessage("_id is required")
    .bail()
    .isMongoId()
    .withMessage("_id must be a MongoDB object ID");

const makeSectionValidator = () =>
  body("section")
    .exists()
    .withMessage("section is required")
    .isMongoId()
    .withMessage("section must be a valid MongoDB object ID")
    .bail()
    .custom(validateReferenceExists(Section, "Section"));

const makeSessionDateValidator = () =>
  body("sessionDate")
    .exists()
    .withMessage("Date is required")
    .isISO8601()
    .withMessage("sessionDate must be a valid date-time string");

const makeAttendeeArrayValidator = () =>
  body("attendees")
    .exists()
    .withMessage("attendees field is required")
    .bail()
    .isArray({ min: 1 })
    .withMessage("attendees must be an array")
    .bail();

const makeAttendeeItemsValidator = () =>
  body("attendees.*")
    .isMongoId()
    .withMessage("Invalid User ID format")
    .bail()
    .custom(validateReferenceExists(User, "Attendee"));

export const createSession = [
  makeSectionValidator(),
  makeSessionDateValidator(),
  makeAttendeeArrayValidator(),
  makeAttendeeItemsValidator(),
];

export const editSession = [
  makeIDValidator(),
  makeSectionValidator(),
  makeAttendeeArrayValidator(),
  makeAttendeeItemsValidator(),
];
