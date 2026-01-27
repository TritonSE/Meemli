import { model, Schema } from "mongoose";

import type { Document, Types } from "mongoose";

//Session objects represent attendances on a specific day for a specific group

//creating ObjectID reference
type ISession = {
  section: Types.ObjectId;
  sessionDate: Date;
} & Document;

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
});

//exporting model
export const SessionModel = model<ISession>("Session", sessionSchema);
