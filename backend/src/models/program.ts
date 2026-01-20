import { model, Schema } from "mongoose";

import type { InferSchemaType } from "mongoose";

const programSchema = new Schema({
  _id: { type: String, required: true },
  code: { type: String },
  name: { type: String, default: false},
  startDate: { type: String, required: true },
  endDate: {type: String},
  description: {type: String},
  archived: {type: Boolean, default: false}
});

type Program = InferSchemaType<typeof programSchema>;

export default model<Program>("Program", programSchema);
