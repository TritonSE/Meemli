import { body } from "express-validator";

const validateCode = body("code").notEmpty().withMessage("Code is required");

const validateProgram = body("program")
  .notEmpty()
  .withMessage("Program is required")
  .isMongoId()
  .withMessage("Program must be a valid MongoDB ObjectID");

const validateTeachers = body("teachers")
  .isArray()
  .withMessage("Teachers must be an array of ObjectIDs")
  .custom((value: string[]) => {
    const regex = /^[0-9a-f]{24}$/i;
    if (value.some((id) => !regex.exec(id))) {
      throw new Error("Each teacher must be a valid MongoDB ObjectID");
    }
    return true;
  });

const validateEnrolledStudents = body("enrolledStudents")
  .optional()
  .isArray()
  .withMessage("Enrolled students must be an array of ObjectIDs")
  .custom((value: string[]) => {
    const regex = /^[0-9a-f]{24}$/i;
    if (value.some((id) => !regex.exec(id))) {
      throw new Error("Each teacher must be a valid MongoDB ObjectID");
    }
    return true;
  });

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

const validateSessions = body("sessions")
  .optional()
  .isArray()
  .withMessage("Sessions must be an array of ObjectIDs")
  .custom((value: string[]) => {
    const objectIdRegex = /^[0-9a-f]{24}$/i;

    if (value && value.some((id) => !objectIdRegex.exec(id))) {
      throw new Error("Each session must be a valid MongoDB ObjectID");
    }
    return true;
  });

export const createSectionValidator = [
  validateCode,
  validateDays,
  validateEndTime,
  validateEnrolledStudents,
  validateProgram,
  validateSessions,
  validateStartTime,
  validateTeachers,
];

export const updateSectionValidator = {
  validateCode: validateCode.optional(),
  validateDays: validateDays.optional(),
  validateEndTime: validateEndTime.optional(),
  validateEnrolledStudents: validateEnrolledStudents.optional(),
  validateProgram: validateProgram.optional(),
  validateStartTime: validateStartTime.optional(),
  validateSessions: validateSessions.optional(),
  validateTeachers: validateTeachers.optional(),
};
