import mongoose from "mongoose";

import type { Document, Types } from "mongoose"; // Types still used for ObjectId arrays in teachers/enrolledStudents

// Type definition for Section documents
export type SectionDoc = Document & {
  code: string;
  teachers: Types.ObjectId[];
  enrolledStudents: Types.ObjectId[];
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
  archived: boolean;
  color: string;
  days: string[];
};

// Definition of the Section schema
const sectionSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
    },
    teachers: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    enrolledStudents: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Student",
      default: [],
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    startDate: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
      required: true,
    },
    archived: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      required: true,
    },
    days: {
      type: [String],
      required: true,
    },
  },
  {
    timestamps: true, // CreatedAt and UpdatedAt fields
  },
);

// Creating the Section model using the defined schema
const Section = mongoose.model<SectionDoc>("Section", sectionSchema);

// Exporting the Section model for use in other parts of the application
export { Section };
