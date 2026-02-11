import dotenv from "dotenv";

import { InternalError } from "./errors/internal";

dotenv.config();

function throwIfUndefined(envVar: string | undefined, error: InternalError): string {
  if (!envVar) throw error;
  return envVar;
}

const PORT = throwIfUndefined(process.env.APP_PORT, InternalError.NO_APP_PORT);
const MONGO_URI = throwIfUndefined(process.env.MONGO_URI, InternalError.NO_MONGO_URI);
const FRONTEND_ORIGIN = throwIfUndefined(
  process.env.FRONTEND_ORIGIN,
  InternalError.NO_FRONTEND_ORIGIN,
);

// Service account needed for bearer token verification
const serviceAccountKey = throwIfUndefined(
  process.env.SERVICE_ACCOUNT_KEY,
  InternalError.NO_SERVICE_ACCOUNT_KEY,
);

// Firebase API key for testing bearer token verification
const FIREBASE_API_KEY = process.env.DEV_FIREBASE_API_KEY;

// Variable to bypass authorization route middleware.
// WARNING: This should NEVER be enabled in PRD!!!
// WARNING: If using this variable to test routes, note that you no longer have
//    sender identification when handling requests, which may be needed.
const AUTH_BYPASS = process.env.AUTH_BYPASS && process.env.AUTH_BYPASS === "True";

export { AUTH_BYPASS, FIREBASE_API_KEY, FRONTEND_ORIGIN, MONGO_URI, PORT, serviceAccountKey };
