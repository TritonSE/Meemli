import { AUTH_BYPASS } from "../config";
import User from "../models/user";

import type { NextFunction, Request, Response } from "express";

/**
 * Middleware that fetches the authenticated user's document from MongoDB and
 * attaches it to req.userContext. Must run after verifyAuthToken.
 */
const attachUserContext = async (req: Request, res: Response, next: NextFunction) => {
  if (AUTH_BYPASS) return next();
  if (!req.userId) return next();

  try {
    const user = await User.findById(req.userId).lean();
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.userContext = {
      _id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      personalEmail: user.personalEmail,
      meemliEmail: user.meemliEmail,
      phoneNumber: user.phoneNumber,
      admin: user.admin,
      archived: user.archived,
      assignedSections: user.assignedSections,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export { attachUserContext };
