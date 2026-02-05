import { AUTH_BYPASS } from "../config";
import { AuthError } from "../errors/auth";
import { decodeAuthToken } from "../util/auth";

import type { NextFunction, Request, Response } from "express";
import type { DecodedIdToken } from "firebase-admin/auth";

type RequestBody = {
  uid?: string;
  accountType?: string;
};

type RequestWithUserId = Request<object, object, RequestBody> & {
  userId?: string;
};

/**
 * Middleware to verify Auth token and calls next function based on user role
 */
const verifyAuthToken = async (req: RequestWithUserId, res: Response, next: NextFunction) => {
  if (AUTH_BYPASS) return next();
  
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer") ? authHeader.split(" ")[1] : null;

  //Throws error if the token is not in request header
  if (!token) {
    res.status(AuthError.TOKEN_NOT_IN_HEADER.status).send(AuthError.TOKEN_NOT_IN_HEADER.message);
    return;
  }

  try {
    //This is where we actually check if the token is valid and get user from firebase
    const userInfo: DecodedIdToken = await decodeAuthToken(token);

    // Add user info to the request body
    req.userId = userInfo.uid;

    next(); // Proceed to the next middleware/route handler
  } catch (e) {
    //Throws error if the token is not valid
    console.error(e);
    res.status(AuthError.INVALID_AUTH_TOKEN.status).send(AuthError.INVALID_AUTH_TOKEN.message);
  }
};

export { verifyAuthToken };
