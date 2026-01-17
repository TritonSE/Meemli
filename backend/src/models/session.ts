<<<<<<< HEAD
import { model, Schema } from "mongoose";

import type { Document, Types } from "mongoose";
=======
import { Schema, Types, model, Document } from "mongoose";
>>>>>>> 3bc260cd091d7fa0bfe97ea4ca34cac833ae9159

//Session objects represent attendances on a specific day for a specific group

//creating ObjectID reference
interface ISession extends Document {
  section: Types.ObjectId;
  sessionDate: Date;
  attendees: Types.ObjectId[];
}

const sessionSchema = new Schema<ISession>({
  section: {
    type: Schema.Types.ObjectId,
    ref: "Section",
    required: true,
  },
  sessionDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  attendees: [
    {
      type: Schema.Types.ObjectId,
      ref: "User", //reference Users in attendee array
    },
  ],
});

//exporting model
export const SessionModel = model<ISession>("Session", sessionSchema);
