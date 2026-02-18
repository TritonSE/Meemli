import { model, Schema } from "mongoose";

import type { InferSchemaType } from "mongoose";

const studentSchema = new Schema({
  parentContact: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true },
  },
  displayName: { type: String, required: true },
  meemliEmail: { type: String, required: true },
  grade: { type: Number, required: true },
  schoolName: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  preassessmentScore: { type: Number, required: false },
  postassessmentScore: { type: Number, required: false },
  enrolledSections: { type: [Schema.Types.ObjectId], required: true },
  comments: { type: String, required: false },
});

type Student = InferSchemaType<typeof studentSchema>;

export default model<Student>("Student", studentSchema);
