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

const makeStartDateValidator = () =>
  body("startDate")
    .exists()
    .withMessage("startDate is required")
    .bail()
    .isString()
    .withMessage("startDate must be a string")
    .bail()
    .isISO8601()
    .withMessage("startDate must be a valid ISO8601 date (e.g. 2026-01-14)");

const makeEndDateValidator = () =>
  body("endDate")
    .optional()
    .isString()
    .withMessage("endDate must be a string")
    .bail()
    .isISO8601()
    .withMessage("endDate must be a valid ISO8601 date (e.g. 2026-01-14)");

const makeDescriptionValidator = () =>
  body("description").optional().isString().withMessage("description must be a string");

const makeArchivedValidator = () =>
  body("archived").optional().isBoolean().withMessage("archived must be a boolean");

// Cross-field rule: if endDate exists, it must be >= startDate
const makeDateOrderValidator = () =>
  body("endDate")
    .optional()
    .custom((endDate, { req }) => {
      const { startDate } = req.body as { startDate?: string };

      // if startDate missing, startDate validator will catch it (for create)
      if (!startDate || !endDate) return true;

      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();

      if (Number.isNaN(start) || Number.isNaN(end)) return true; // ISO validators handle this
      if (end < start) throw new Error("endDate must be the same as or after startDate");
      return true;
    });

// --- Route validator sets ---

export const createProgram = [
  makeIDValidator(),
  makeCodeValidator(),
  makeNameValidator(),
  makeStartDateValidator(),
  makeEndDateValidator(),
  makeDateOrderValidator(),
  makeDescriptionValidator(),
  makeArchivedValidator(),
];

// For updates: usually _id is provided in body (or params) depending on your API
export const updateProgram = [
  makeIDValidator(),
  makeCodeValidator(),
  makeNameValidator(),
  makeStartDateValidator(), // if your update allows omitting startDate, change to .optional()
  makeEndDateValidator(),
  makeDateOrderValidator(),
  makeDescriptionValidator(),
  makeArchivedValidator(),
];
