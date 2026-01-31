import { model, Schema } from "mongoose";

import type { InferSchemaType } from "mongoose";

// Attendance objects represent one student’s attendance for one session.

const attendanceSchema = new Schema({
  session: { type: Schema.Types.ObjectId, ref: "Session", required: true },
  student: { type: Schema.Types.ObjectId, ref: "Student", required: true },
  status: { type: String, enum: ["LATE", "ABSENT", "PRESENT"], default: "PRESENT", required: true },
  notes: { type: String },
});

type Attendance = InferSchemaType<typeof attendanceSchema>;

export const AttendanceModel = model<Attendance>("Attendance", attendanceSchema);
