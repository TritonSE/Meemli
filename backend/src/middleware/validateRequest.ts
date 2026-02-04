// middleware/validateRequest.ts
import { validationResult } from "express-validator";

import type { RequestHandler } from "express";

export const validateRequest: RequestHandler = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  next();
};
