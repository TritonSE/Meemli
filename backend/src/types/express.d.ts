import type { Types } from "mongoose";

export type UserContext = {
  _id: string;
  firstName: string;
  lastName: string;
  personalEmail: string;
  meemliEmail: string;
  phoneNumber: string;
  admin: boolean;
  archived: boolean;
  assignedSections: Types.ObjectId[];
};

declare global {
  namespace Express {
    // eslint-disable-next-line ts/consistent-type-definitions
    interface Request {
      userId?: string;
      userContext?: UserContext;
    }
  }
}
