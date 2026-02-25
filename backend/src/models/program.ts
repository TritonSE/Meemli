import { model, Schema } from "mongoose";

import type { InferSchemaType } from "mongoose";

const programSchema = new Schema({
  code: { type: String, required: true },
  name: { type: String, required: true },
  sections: [{ type: Schema.Types.ObjectId, ref: "Section" }],
  description: { type: String },
});

type Program = InferSchemaType<typeof programSchema>;

export default model<Program>("Program", programSchema);
