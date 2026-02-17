import { body } from "express-validator";
import { Types } from "mongoose";

import type { ValidationChain } from "express-validator";

const makeParentContactValidator = (): ValidationChain => {
  return body("parentContact")
    .exists()
    .withMessage("parentContact is required")
    .bail()
    .isObject()
    .withMessage("parentContact must be an object")
    .bail()
    .custom((value: Record<string, unknown>) => {
      return (
        Object.keys(value).length === 4 &&
        Object.keys(value).every((key) =>
          ["firstName", "lastName", "phoneNumber", "email"].includes(key),
        )
      );
    })
    .withMessage("parentContact must contain firstName, lastName, phoneNumber, and email");
};

const makeDisplayNameValidator = (): ValidationChain => {
  return body("displayName")
    .exists()
    .withMessage("displayName is required")
    .bail()
    .isString()
    .withMessage("displayName must be a string")
    .bail()
    .isLength({ min: 3 })
    .withMessage("displayName must be at least 3 characters long");
};

const makeMeemliEmailValidator = (): ValidationChain => {
  return body("meemliEmail")
    .exists()
    .withMessage("meemliEmail is required")
    .bail()
    .isEmail()
    .withMessage("meemliEmail must be a valid email");
};

const makeGradeValidator = (): ValidationChain => {
  return body("grade")
    .exists()
    .withMessage("grade is required")
    .bail()
    .isInt()
    .withMessage("grade must be an integer")
    .bail()
    .isIn([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
    .withMessage("grade must be between 1 and 12");
};

const makeSchoolNameValidator = (): ValidationChain => {
  return body("schoolName")
    .exists()
    .withMessage("schoolName is required")
    .bail()
    .isString()
    .withMessage("schoolName must be a string")
    .bail()
    .isLength({ min: 3 })
    .withMessage("schoolName must be at least 3 characters long");
};

const makeCityValidator = (): ValidationChain => {
  return body("city")
    .exists()
    .withMessage("city is required")
    .bail()
    .isString()
    .withMessage("city must be a string")
    .bail()
    .isLength({ min: 3 })
    .withMessage("city must be at least 3 characters long");
};

const makeStateValidator = (): ValidationChain => {
  return body("state")
    .exists()
    .withMessage("state is required")
    .bail()
    .isString()
    .withMessage("state must be a string")
    .bail()
    .isLength({ min: 3 })
    .withMessage("state must be at least 3 characters long");
};

const makePreassessmentScoreValidator = (): ValidationChain => {
  return body("preassessmentScore")
    .optional()
    .bail()
    .isInt()
    .withMessage("preassessmentScore must be an integer");
};

const makePostassessmentScoreValidator = (): ValidationChain => {
  return body("postassessmentScore")
    .optional()
    .bail()
    .isInt()
    .withMessage("postassessmentScore must be an integer");
};

const makeEnrolledSectionsValidator = (): ValidationChain => {
  return body("enrolledSections")
    .exists()
    .withMessage("enrolledSections is required")
    .bail()
    .isArray()
    .withMessage("enrolledSections must be an array")
    .bail()
    .custom((value: string[]) => {
      return value.every((section) => Types.ObjectId.isValid(new Types.ObjectId(section)));
    })
    .withMessage("enrolledSections must contain valid ObjectId strings");
};

const makeCommentsValidator = (): ValidationChain => {
  return body("comments")
    .optional()
    .isString()
    .withMessage("comments must be a string")
    .bail()
    .isLength({ min: 0 });
};

export const validateCreateStudent = [
  makeParentContactValidator(),
  makeDisplayNameValidator(),
  makeMeemliEmailValidator(),
  makeGradeValidator(),
  makeSchoolNameValidator(),
  makeCityValidator(),
  makeStateValidator(),
  makePreassessmentScoreValidator(),
  makePostassessmentScoreValidator(),
  makeEnrolledSectionsValidator(),
  makeCommentsValidator(),
];

export const validateEditStudent = [
  makeParentContactValidator().optional(),
  makeDisplayNameValidator().optional(),
  makeMeemliEmailValidator().optional(),
  makeGradeValidator().optional(),
  makeSchoolNameValidator().optional(),
  makeCityValidator().optional(),
  makeStateValidator().optional(),
  makePreassessmentScoreValidator().optional(),
  makePostassessmentScoreValidator().optional(),
  makeEnrolledSectionsValidator().optional(),
  makeCommentsValidator().optional(),
];
