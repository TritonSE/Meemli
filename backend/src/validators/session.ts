import { body, type ValidationChain } from "express-validator";

// TODO: Add the validation check for these once the models are created
// import { Section } from "../models/Section";
// import { User } from "../models/User";

// A reusable helper for database existence checks
// const validateReferenceExists = (model: any, fieldName: string) => {
//   return async (id: string) => {
//     const exists = await model.findById(id);
//     if (!exists) {
//       throw new Error(`${fieldName} with ID ${id} not found`);
//     }
//     return true;
//   };
// };

const makeIDValidator = (): ValidationChain =>
  body("_id")
    .exists()
    .withMessage("_id is required")
    .bail()
    .isMongoId()
    .withMessage("_id must be a MongoDB object ID");

const makeSectionValidator = (): ValidationChain =>
  body("section")
    .exists()
    .withMessage("section is required")
    .isMongoId()
    .withMessage("section must be a valid MongoDB object ID")
    .bail();
// .custom(validateReferenceExists(Section, "Section"));

const makeSessionDateValidator = (): ValidationChain =>
  body("sessionDate")
    .exists()
    .withMessage("Date is required")
    .isISO8601()
    .withMessage("sessionDate must be a valid date-time string");

const makeAttendeeArrayValidator = (): ValidationChain =>
  body("attendees")
    .exists()
    .withMessage("attendees field is required")
    .bail()
    .isArray({ min: 1 })
    .withMessage("attendees must be an array")
    .bail();

const makeAttendeeItemsValidator = (): ValidationChain =>
  body("attendees.*").isMongoId().withMessage("Invalid User ID format").bail();
// .custom(validateReferenceExists(User, "Attendee"));

export const createSession = [
  makeSectionValidator(),
  makeSessionDateValidator(),
  makeAttendeeArrayValidator(),
  makeAttendeeItemsValidator(),
];

export const editSessionById = [
  makeIDValidator(),
  makeSectionValidator(),
  makeAttendeeArrayValidator(),
  makeAttendeeItemsValidator(),
];
