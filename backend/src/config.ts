import dotenv from "dotenv";

import { InternalError } from "./errors/internal";

dotenv.config();

function throwIfUndefined(envVar: string | undefined, error: InternalError) {
  if (!envVar) throw error;
  return envVar;
}

const PORT = throwIfUndefined(process.env.APP_PORT, InternalError.NO_APP_PORT);
const MONGO_URI = throwIfUndefined(process.env.MONGO_URI, InternalError.NO_MONGO_URI);

export { MONGO_URI, PORT };
