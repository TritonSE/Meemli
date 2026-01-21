import { body } from "express-validator";

import type { ValidationChain } from "express-validator";

const validateCode = body("code").notEmpty().withMessage("Code is required");

const validateProgram = body("program")
  .notEmpty()
  .withMessage("Program is required")
  .isMongoId()
  .withMessage("Program must be a valid MongoDB ObjectID");

export const validateTeachers: ValidationChain[] = [
  body("teachers").isArray().withMessage("Teachers must be an array"),

  body("teachers.*").isMongoId().withMessage("Each teacher must be a valid MongoDB ObjectID"),
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
  .isArray()
  .withMessage("Days must be an array of strings")
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
  .isISO8601()
  .withMessage("Start time must be a valid date");

const validateEndTime = body("endTime")
  .notEmpty()
  .withMessage("End time is required")
  .isISO8601()
  .withMessage("End time must be a valid date")
  .custom((value: string, { req }) => {
    const { startTime } = req.body as { startTime?: string };

    if (!startTime) {
      throw new Error("Start time must be provided");
    }

    if (new Date(value) <= new Date(startTime)) {
      throw new Error("End time must be after start time");
    }

    return true;
  });

export const validateSessions: ValidationChain[] = [
  body("sessions").optional().isArray().withMessage("Sessions must be an array of ObjectIDs"),

  body("sessions.*").isMongoId().withMessage("Each session must be a valid MongoDB ObjectID"),
];

export const createSectionValidator = [
  validateCode,
  validateDays,
  validateEndTime,
  ...validateEnrolledStudents,
  validateProgram,
  ...validateSessions,
  validateStartTime,
  ...validateTeachers,
];

export const updateSectionValidator = [
  validateCode.optional(),
  validateDays.optional(),
  validateEndTime.optional(),
  ...validateEnrolledStudents.map((v) => v.optional()),
  validateProgram.optional(),
  ...validateSessions.map((v) => v.optional()),
  validateStartTime.optional(),
  ...validateTeachers.map((v) => v.optional()),
];
