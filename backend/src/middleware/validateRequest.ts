import { validationResult } from "express-validator";
import createHTTPError from "http-errors";

import type { RequestHandler } from "express";

export const validateRequest: RequestHandler = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorArray = errors.array();
    const errorMessage = `Validation failed: ${errorArray.map((err) => String(err.msg)).join(", ")}`;
    throw createHTTPError(400, errorMessage, { errors: errorArray });
  }

  next();
};
