import { body } from "express-validator";

import type { ValidationChain } from "express-validator";

const makeFirstNameValidator = (): ValidationChain => {
  return body("firstName")
    .exists()
    .withMessage("firstName is required")
    .bail()
    .isString()
    .withMessage("firstName must be a string")
    .bail()
    .isLength({ min: 2 })
    .withMessage("firstName must be at least 2 characters long");
};

const makeLastNameValidator = (): ValidationChain => {
  return body("lastName")
    .exists()
    .withMessage("lastName is required")
    .bail()
    .isString()
    .withMessage("lastName must be a string")
    .bail()
    .isLength({ min: 2 })
    .withMessage("lastName must be at least 2 characters long");
};

const makePersonalEmailValidator = (): ValidationChain => {
  return body("personalEmail")
    .exists()
    .withMessage("personalEmail is required")
    .bail()
    .isEmail()
    .withMessage("personalEmail must be a valid email");
};

const makeMeemliEmailValidator = (): ValidationChain => {
  return body("meemliEmail")
    .exists()
    .withMessage("meemliEmail is required")
    .bail()
    .isEmail()
    .withMessage("meemliEmail must be a valid email");
};

const makeAdminValidator = (): ValidationChain => {
  return body("admin")
    .exists()
    .withMessage("admin is required")
    .bail()
    .isBoolean()
    .withMessage("admin must be a boolean");
};

export const validateCreateUser = [
  makeFirstNameValidator(),
  makeLastNameValidator(),
  makePersonalEmailValidator(),
  makeMeemliEmailValidator(),
  makeAdminValidator(),
];

export const validateEditUser = [
  makeFirstNameValidator().optional(),
  makeLastNameValidator().optional(),
  makePersonalEmailValidator().optional(),
  makeMeemliEmailValidator().optional(),
  makeAdminValidator().optional(),
];
