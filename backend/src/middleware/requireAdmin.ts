import createHTTPError from "http-errors";

import { AUTH_BYPASS } from "../config";
import { AuthError } from "../errors/auth";

import type { NextFunction, Request, Response } from "express";

/**
 * Middleware that terminates the request with 403 if the authenticated user is
 * not an admin. Must run after attachUserContext.
 */
const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (AUTH_BYPASS) return next();
  if (!req.userContext?.admin) {
    return next(
      createHTTPError(AuthError.UNAUTHORIZED_ERROR.status, AuthError.UNAUTHORIZED_ERROR.message),
    );
  }
  next();
};

export { requireAdmin };
