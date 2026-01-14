import { Schema, Types, model, Document } from "mongoose";

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
