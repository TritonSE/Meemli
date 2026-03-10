import { body } from "express-validator";

import type { ValidationChain } from "express-validator";

const TIME_24H_REGEX = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
const COLOR_REGEX = /^#([0-9a-f]{3}){1,2}$/i; // #RGB or #RRGGBB

const validateCode = body("code").notEmpty().withMessage("Code is required");

export const validateTeachers: ValidationChain[] = [
  body("teachers").isArray().withMessage("Teachers must be an array"),
  body("teachers.*").isString().withMessage("Each teacher must be a string"),
];

export const validateEnrolledStudents: ValidationChain[] = [
  body("enrolledStudents")
    .optional()
    .isArray()
    .withMessage("Enrolled students must be an array of ObjectIDs"),

  body("enrolledStudents.*")
    .isMongoId()
    .withMessage("Each enrolled student must be a valid MongoDB ObjectID"),
];

const validateDays = body("days")
  .isArray({ min: 1 })
  .withMessage("Days must be a non-empty array of strings")
  .custom((value: string[]) => {
    const validDays = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    if (value.some((day) => !validDays.includes(day))) {
      throw new Error(`Days must be one of the following: ${validDays.join(", ")}`);
    }
    return true;
  });

const validateStartTime = body("startTime")
  .notEmpty()
  .withMessage("Start time is required")
  .matches(TIME_24H_REGEX)
  .withMessage("Start time must be a valid 24-hour time (HH:mm)");

const validateEndTime = body("endTime")
  .notEmpty()
  .withMessage("End time is required")
  .matches(TIME_24H_REGEX)
  .withMessage("End time must be a valid 24-hour time (HH:mm)")
  .custom((value: string, { req }) => {
    const { startTime } = req.body as { startTime?: string };

    if (!startTime || !TIME_24H_REGEX.test(startTime)) {
      throw new Error("Start time must be provided and valid");
    }

    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = value.split(":").map(Number);

    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;

    if (endTotalMinutes <= startTotalMinutes) {
      throw new Error("End time must be after start time on the same day");
    }

    return true;
  });

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

// Cross-field rule: if endDate exists, it must be >= startDate
const makeDateOrderValidator = () =>
  body("endDate")
    .optional()
    .custom((endDate, { req }) => {
      const { startDate } = req.body as { startDate?: string };

      // if startDate missing, startDate validator will catch it (for create)
      if (!startDate || !endDate) return true;
      // if either is not a string, other validators will catch it
      if (typeof endDate !== "string" || typeof startDate !== "string") {
        return true;
      }
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();

      if (Number.isNaN(start) || Number.isNaN(end)) return true; // ISO validators handle this
      if (end < start) throw new Error("endDate must be the same as or after startDate");
      return true;
    });

const makeArchivedValidator = () =>
  body("archived").optional().isBoolean().withMessage("archived must be a boolean");

const makeColorValidator = () =>
  body("color")
    .isString()
    .matches(COLOR_REGEX)
    .withMessage("color must be a string of hex format #RGB or #RGGBB");

export const createSectionValidator = [
  validateCode,
  validateDays,
  validateEndTime,
  ...validateEnrolledStudents,
  validateStartTime,
  makeStartDateValidator(),
  makeEndDateValidator(),
  makeDateOrderValidator(),
  makeArchivedValidator(),
  makeColorValidator(),
  ...validateTeachers,
];

export const updateSectionValidator = [
  validateCode.optional(),
  validateDays.optional(),
  validateEndTime.optional(),
  ...validateEnrolledStudents.map((v) => v.optional()),
  validateStartTime.optional(),
  makeStartDateValidator(),
  makeEndDateValidator(),
  makeDateOrderValidator(),
  makeArchivedValidator(),
  makeColorValidator(),
  ...validateTeachers.map((v) => v.optional()),
];
