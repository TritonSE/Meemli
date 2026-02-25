import { body } from "express-validator";

// more info about validators:
// https://express-validator.github.io/docs/guides/validation-chain
// https://github.com/validatorjs/validator.js#validators

const makeIDValidator = () => body("_id").exists().withMessage("_id is required").bail();
// .isMongoId()
// .withMessage("_id must be a MongoDB object ID");
const makeCodeValidator = () =>
  body("code").optional().isString().withMessage("code must be a string");

const makeNameValidator = () =>
  body("name")
    .optional()
    .isString()
    .withMessage("name must be a string")
    .bail()
    .notEmpty()
    .withMessage("name cannot be empty");

const makeDescriptionValidator = () =>
  body("description").optional().isString().withMessage("description must be a string");

// --- Route validator sets ---

export const createProgram = [makeCodeValidator(), makeNameValidator(), makeDescriptionValidator()];

// For updates: usually _id is provided in body (or params) depending on your API
export const updateProgram = [
  makeIDValidator(),
  makeCodeValidator(),
  makeNameValidator(),
  makeDescriptionValidator(),
];
