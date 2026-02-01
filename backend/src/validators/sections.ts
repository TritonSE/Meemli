import { body } from "express-validator";

import type { ValidationChain } from "express-validator";

const TIME_24H_REGEX = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

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
