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
const FIREBASE_API_KEY = throwIfUndefined(
  process.env.FIREBASE_API_KEY,
  InternalError.NO_FIREBASE_API_KEY,
);

export { FIREBASE_API_KEY, FRONTEND_ORIGIN, MONGO_URI, PORT, serviceAccountKey };
