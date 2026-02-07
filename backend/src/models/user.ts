import { model, Schema } from "mongoose";

import type { InferSchemaType } from "mongoose";

/*
User:
    _id			(uid assigned from firebase)
    firstName
    lastName
    personalEmail		(email linked to firebase account)
    meemliEmail
    admin: bool 		(True: program admin user, False: teacher user)
*/
const userSchema = new Schema({
  _id: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  personalEmail: { type: String, required: true },
  meemliEmail: { type: String, required: true },
  admin: { type: Boolean, required: true },
});

type User = InferSchemaType<typeof userSchema>;

export default model<User>("User", userSchema);
